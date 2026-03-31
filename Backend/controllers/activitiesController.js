const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const Student = require("../models/Student");
const { deleteMultipleFromCloudinary } = require("../helpers/cloudinary/DeleteMultipleFromCloudinary");
const { validateAndUploadFiles } = require("../helpers/cloudinary/ValidateAndUploadFiles");
const { activityCreateSchema, activityUpdateSchema, getActivitiesValidation } = require("../validators/activitiesValidation");
const exportToExcel = require('../helpers/excel/exportToExcel');
const { transformActivity, activityColumnMap } = require('../helpers/excel/exportTransformers');
const errorLogger = require("../helpers/winston/errorLogger");


// Validation error helper
const validationErrorResponse = (res, details) =>
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: details.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  });

/* FILE CONFIG */

const fileConfigs = [
  {
    fieldName: "certificate",
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ],
    maxSize: 500 * 1024, // 500KB
    friendlyName: "Certificate",
  },
];

// CREATE ACTIVITY

const createActivity = async (req, res) => {
  let uploadedFiles;
  let dbSaved = false;

  try {
    // studentId is read from req.body directly since activityCreateSchema uses
    // stripUnknown:true and does not include studentId. Trimming applied manually.
    const rawStudentId = typeof req.body.studentId === "string"
      ? req.body.studentId.trim()
      : req.body.studentId;

    // Parse date field if it comes as stringified JSON from FormData
    if (req.body.date && typeof req.body.date === "string") {
      try {
        req.body.date = JSON.parse(req.body.date);
      } catch (parseErr) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
          details: "Date field must be a valid JSON object with 'from' and 'to' properties"
        });
      }
    }

    /* Joi Validation */
    const { error, value } = activityCreateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) return validationErrorResponse(res, error.details);

    let stuID;

    /* Role-based ownership */
    if (req.user.role === "student") {
      stuID = req.user.id;
    } else if (["admin", "divisionIncharge"].includes(req.user.role)) {

      if (!rawStudentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID is required",
        });
      }

      // Support both MongoDB ObjectId and custom studentID (e.g. "2024FHIT009").
      // Only fall back to findOne when rawStudentId is NOT a valid ObjectId,
      // preventing a wasted query (an ObjectId string never matches studentID field).
      // .lean() — read-only lookup
      let student;
      if (mongoose.Types.ObjectId.isValid(rawStudentId)) {
        student = await Student.findById(rawStudentId).lean();
      } else {
        student = await Student.findOne({ studentID: rawStudentId }).lean();
      }

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      stuID = student._id;

      if (
        req.user.role === "divisionIncharge" &&
        (student.year !== req.user.year ||
          student.division !== req.user.division)
      ) {
        return res.status(403).json({
          success: false,
          message: "You can access students only from your division",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role",
      });
    }

    /* File upload */
    uploadedFiles = req.file
      ? await validateAndUploadFiles(
          { certificate: [req.file] },
          fileConfigs
        )
      : {};

    const activity = new Activity({
      stuID,
      type: "Committee",
      ...value,
      certificateURL: uploadedFiles.certificate || null,
    });

    await activity.save();
    dbSaved = true;

    return res.status(201).json({
      success: true,
      message: "Committee activity created successfully",
      data: activity,
    });

  } catch (err) {
    // FIX: cleanup is wrapped in its own try/catch so a Cloudinary failure does
    // not throw on an already-closed response stream, and the original error
    // message is still returned to the client correctly.
    if (!dbSaved && uploadedFiles) {
      const ids = Object.values(uploadedFiles)
        .map(f => f?.publicId)
        .filter(Boolean);

      try {
        await deleteMultipleFromCloudinary(ids);
      } catch (cleanupErr) {
        errorLogger(cleanupErr, req, "createActivity - Cloudinary cleanup");
      }
    }

    errorLogger(err, req, "createActivity");
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET OWN ACTIVITIES (STUDENT)

const getActivityByStu = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // .lean() — read-only endpoint, plain JS objects are faster to serialize
    const activities = await Activity.find({
      stuID: req.user.id,
      type: "Committee",
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET ACTIVITIES BY STUDENT (ADMIN / DI)

const getActivities = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    // .lean() — this student lookup is read-only
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (
      req.user.role === "divisionIncharge" &&
      (student.year !== req.user.year ||
        student.division !== req.user.division)
    ) {
      return res.status(403).json({
        success: false,
        message: "Division access denied",
      });
    }

    // .lean() — read-only list
    const activities = await Activity.find({
      stuID: studentId,
      type: "Committee",
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET ALL ACTIVITIES (ADMIN / DI) with export

const getAllActivities = async (req, res) => {
  try {
    // FIX: explicit role whitelist — students must never reach this endpoint even
    // if a route guard is accidentally misconfigured.
    if (!["admin", "divisionIncharge"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }

    const { error, value } = getActivitiesValidation.validate(req.query);
    if (error) return validationErrorResponse(res, error.details);

    const isExport = value.export === "true";
    const page = Math.max(1, Number(value.page || 1));
    const limit = Math.min(Number(value.limit || 10), 50); // single capped value used everywhere
    const skip = (page - 1) * limit;

    const { year, division, search } = value;

    const pipeline = [
      // Filter by type BEFORE $lookup to reduce the number of documents joined
      { $match: { type: "Committee" } },
      {
        $lookup: {
          from: "students",
          localField: "stuID",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
    ];

    const match = {};

    
    // DI uses query params when provided -> their own year/division
    if (req.user.role === "divisionIncharge") {
      match["student.year"] = req.user.year;
      match["student.division"] = req.user.division;
    }

    if (req.user.role === "admin") {
      if (year) match["student.year"] = year;
      if (division) match["student.division"] = division;
    }

    // Search filter
    if (search) {
      const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

      match.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { "student.name.firstName": { $regex: safeSearch, $options: "i" } },
        { "student.name.lastName": { $regex: safeSearch, $options: "i" } },
      ];
    }

    pipeline.push({ $match: match });

    // Export branch
    if (isExport) {
      const activities = await Activity.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } }, // sort before $project so createdAt is still available
        { $limit: 5000 },             // row cap to prevent memory overload
        {
          $project: {
            type: 1,
            title: 1,
            description: 1,
            date: 1,
            certificateURL: 1,

            stuID: "$student._id",
            studentID: "$student.studentID",
            PRN: "$student.PRN",
            studentName: "$student.name",
            studentYear: "$student.year",
            studentDivision: "$student.division",
            studentBranch: "$student.branch",
            studentEmail: "$student.email",
            studentMobileNo: "$student.mobileNo",
          },
        },
      ]);

      const rows = activities.map(transformActivity);

      const buffer = await exportToExcel(rows, "Activities", activityColumnMap);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="activities.xlsx"'
      );

      return res.send(buffer);
    }

    // Pagination branch
    const result = await Activity.aggregate([
      ...pipeline,
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const total = result[0].total[0]?.count || 0;

    // FIX: `limit` was missing from the response — added so the frontend can
    // calculate pages consistently (every other paginated endpoint returns it).
    return res.status(200).json({
      success: true,
      data: result[0].data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    errorLogger(err, req, "getAllActivities");
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// UPDATE ACTIVITY

const updateActivity = async (req, res) => {
  let uploadedFiles;
  let dbSaved = false;

  try {
    // Parse date field if it comes as stringified JSON from FormData
    if (req.body.date && typeof req.body.date === "string") {
      try {
        req.body.date = JSON.parse(req.body.date);
      } catch (parseErr) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
          details: "Date field must be a valid JSON object with 'from' and 'to' properties"
        });
      }
    }

    const { error, value } = activityUpdateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) return validationErrorResponse(res, error.details);

    // FIX: validate ObjectId before querying to avoid Mongoose CastError / 500 leak
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid activity ID" });
    }

    const activity = await Activity.findById(req.params.id).populate(
      "stuID",
      "year division"
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    if (
      req.user.role === "student" &&
      activity.stuID._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      req.user.role === "divisionIncharge" &&
      (activity.stuID.year !== req.user.year ||
        activity.stuID.division !== req.user.division)
    ) {
      return res.status(403).json({
        success: false,
        message: "Division access denied",
      });
    }

    // Stash the old publicId BEFORE overwriting the reference on the document.
    // The old file is deleted only AFTER a successful DB save, so a save failure
    // never leaves the record pointing at a file that no longer exists.
    let oldPublicId = null;

    if (req.file) {
      uploadedFiles = await validateAndUploadFiles(
        { certificate: [req.file] },
        fileConfigs
      );

      oldPublicId = activity.certificateURL?.publicId || null;
      activity.certificateURL = uploadedFiles.certificate;
    }

    Object.assign(activity, value);
    activity.type = "Committee";

    await activity.save();
    dbSaved = true;

    // Safe to delete the old file now that the DB record points to the new one.
    // Wrapped in try/catch — non-fatal; DB is already consistent.
    if (oldPublicId) {
      try {
        await deleteMultipleFromCloudinary([oldPublicId]);
      } catch (cleanupErr) {
        errorLogger(cleanupErr, req, "updateActivity - Cloudinary old-file cleanup");
      }
    }

    return res.status(200).json({
      success: true,
      message: "Committee activity updated successfully",
      data: activity,
    });

  } catch (err) {
    // FIX: cleanup wrapped in its own try/catch so a Cloudinary failure does not
    // throw on an already-closed response stream.
    if (!dbSaved && uploadedFiles) {
      const ids = Object.values(uploadedFiles)
        .map(f => f?.publicId)
        .filter(Boolean);

      try {
        await deleteMultipleFromCloudinary(ids);
      } catch (cleanupErr) {
        errorLogger(cleanupErr, req, "updateActivity - Cloudinary cleanup after error");
      }
    }

    errorLogger(err, req, "updateActivity");
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// DELETE ACTIVITY

const deleteActivity = async (req, res) => {
  try {
    //validate ObjectId before querying to avoid Mongoose CastError / 500 leak
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid activity ID" });
    }

    const activity = await Activity.findById(req.params.id).populate(
      "stuID",
      "year division"
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    if (
      req.user.role === "student" &&
      activity.stuID._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      req.user.role === "divisionIncharge" &&
      (activity.stuID.year !== req.user.year ||
        activity.stuID.division !== req.user.division)
    ) {
      return res.status(403).json({
        success: false,
        message: "Division access denied",
      });
    }

    const publicIds = activity.certificateURL?.publicId
      ? [activity.certificateURL.publicId]
      : [];

    //delete from Cloudinary FIRST, then remove the DB record.
    // Previously findByIdAndDelete ran first — if Cloudinary then failed, the DB
    // row was already gone but the file was permanently orphaned with no recovery.
    // Now: if Cloudinary fails we return 500 and the DB record stays intact so
    // the user can retry. If the DB delete fails after Cloudinary succeeds (rare),
    // the file is orphaned but the record is still queryable — acceptable trade-off.
    if (publicIds.length) {
      try {
        await deleteMultipleFromCloudinary(publicIds);
      } catch (cleanupErr) {
        errorLogger(cleanupErr, req, "deleteActivity - Cloudinary delete");
        return res.status(500).json({
          success: false,
          message: "Failed to delete associated files. Please try again.",
        });
      }
    }

    await Activity.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Committee activity deleted successfully",
    });
  } catch {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  createActivity,
  getActivityByStu,
  getActivities,
  updateActivity,
  deleteActivity,
  getAllActivities,
};
