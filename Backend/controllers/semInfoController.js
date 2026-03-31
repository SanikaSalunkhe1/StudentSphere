const mongoose = require("mongoose");
const SemesterInfo = require("../models/SemesterInfo");
const Student = require("../models/Student");
const { semInfoCreateSchema, semInfoUpdateSchema, getSemInfosValidation } = require("../validators/seminfoValidation");
const exportToExcel = require('../helpers/excel/exportToExcel');
const { transformSemesterInfo, semesterInfoColumnMap } = require('../helpers/excel/exportTransformers');
const errorLogger = require("../helpers/winston/errorLogger");

// Validation error response helper
const validationErrorResponse = (res, details) =>
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: details.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  });

const calculateDefaulter = (attendance) => {
  return attendance < 75;
};


// ADD SEM INFO
// Roles: student | admin | divisionIncharge

const addSemInfo = async (req, res) => {
  try {
    // Validation first — before any DB work
    const { error, value } = semInfoCreateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) return validationErrorResponse(res, error.details);

    let stuID;

    if (req.user.role === "student") {
      stuID = req.user.id;
    } else if (["admin", "divisionIncharge"].includes(req.user.role)) {
      // studentId is read from raw body and trimmed manually before use,
      // since semInfoCreateSchema strips unknown fields and does not include studentId.
      const rawStudentId = typeof req.body.studentId === "string"
        ? req.body.studentId.trim()
        : req.body.studentId;

      if (!rawStudentId) {
        return res.status(400).json({ success: false, message: "studentId is required" });
      }

      // Support both MongoDB ObjectId and custom studentID field.
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
        return res.status(404).json({ success: false, message: "Student not found" });
      }

      stuID = student._id;

      // Division Incharge restriction
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
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }

    const { semester, attendance, kts, marks } = value;

    const semInfo = new SemesterInfo({
      stuID,
      semester,
      attendance,
      kts,
      marks,
      isDefaulter: calculateDefaulter(attendance),
    });

    await semInfo.save();

    res.status(201).json({
      success: true,
      message: "Semester info added successfully",
      data: semInfo,
    });

  } catch (err) {
    errorLogger(err, req, "addSemInfo");
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// UPDATE SEM INFO

const updateSemInfo = async (req, res) => {
  try {
    // FIX: validate ObjectId before querying to avoid Mongoose CastError / 500 leak
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid semester info ID" });
    }

    const semInfo = await SemesterInfo
      .findById(req.params.id)
      .populate("stuID", "year division");

    if (!semInfo) {
      return res.status(404).json({
        success: false,
        message: "Semester info not found",
      });
    }

    // Student ownership check
    if (
      req.user.role === "student" &&
      semInfo.stuID._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Division Incharge check
    if (
      req.user.role === "divisionIncharge" &&
      (semInfo.stuID.year !== req.user.year ||
        semInfo.stuID.division !== req.user.division)
    ) {
      return res.status(403).json({
        success: false,
        message: "Division access denied",
      });
    }

    // Build a restricted body for students BEFORE validation, so that
    // only the allowed fields are validated and later applied. This avoids
    // touching req.body (which is the raw request object) and keeps the
    // validated `value` as the single source of truth for what gets written.
    let bodyToValidate = req.body;

    if (req.user.role === "student") {
      const allowed = ["attendance", "kts", "marks", "journalTaken", "examFormFilled"];
      bodyToValidate = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowed.includes(key))
      );
    }

    // Validation — run on the filtered body, capture `value` for use below
    const { error, value } = semInfoUpdateSchema.validate(bodyToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) return validationErrorResponse(res, error.details);

    // Use `value` (the Joi-validated, stripped object) instead of req.body.
    Object.assign(semInfo, value);

    // Recalculate defaulter status if attendance or kts changed
    if (value.attendance !== undefined || value.kts !== undefined) {
      semInfo.isDefaulter = calculateDefaulter(semInfo.attendance);
    }

    await semInfo.save();

    res.status(200).json({
      success: true,
      message: "Semester info updated successfully",
      data: semInfo,
    });

  } catch (err) {
    errorLogger(err, req, "updateSemInfo");
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// DELETE SEM INFO

const deleteSemInfo = async (req, res) => {
  try {
    // FIX: validate ObjectId before querying to avoid Mongoose CastError / 500 leak
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid semester info ID" });
    }

    const semInfo = await SemesterInfo
      .findById(req.params.id)
      .populate("stuID", "year division");

    if (!semInfo) {
      return res.status(404).json({
        success: false,
        message: "Semester info not found",
      });
    }

    if (
      req.user.role === "student" &&
      semInfo.stuID._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (
      req.user.role === "divisionIncharge" &&
      (semInfo.stuID.year !== req.user.year ||
        semInfo.stuID.division !== req.user.division)
    ) {
      return res.status(403).json({
        success: false,
        message: "Division access denied",
      });
    }

    await semInfo.deleteOne();

    res.status(200).json({
      success: true,
      message: "Semester info deleted successfully",
    });

  } catch (err) {
    errorLogger(err, req, "deleteSemInfo");
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// GET ALL SEM INFOS
// Roles: admin | divisionIncharge — with optional export

const getAllSemInfos = async (req, res) => {
  try {
    const { error, value } = getSemInfosValidation.validate(req.query);
    if (error) return validationErrorResponse(res, error.details);

    const isExport = value.export === "true";
    const pageNum = Math.max(1, Number(value.page || 1));
    const limitNum = Math.min(Number(value.limit || 10), 50);
    const skip = (pageNum - 1) * limitNum;

    const {
      semester,
      isDefaulter,
      journalTaken,
      examFormFilled,
      minAttendance,
      maxAttendance,
      year,
      division,
      search,
    } = value;

    const pipeline = [];

    // Join student
    pipeline.push({
      $lookup: {
        from: "students",
        localField: "stuID",
        foreignField: "_id",
        as: "student",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$student",
        preserveNullAndEmptyArrays: true,
      },
    });

    const match = {};

    // Role filtering
    if (req.user.role === "divisionIncharge") {
      match["student.year"] = req.user.year;
      match["student.division"] = req.user.division;
    }

    if (req.user.role === "admin") {
      // FIX: Joi already trims and uppercases `year` and trims `division`,
      // so remove the redundant .trim() calls here. Using the raw value
      // directly also avoids the case where .trim() on an already-clean string
      // was masking that the Joi-validated value was simply not being used.
      if (year) match["student.year"] = year;
      if (division) match["student.division"] = division;
    }

    // Semester
    if (semester !== undefined) match.semester = semester; // already a Number from Joi

    // Boolean filters
    if (isDefaulter !== undefined) match.isDefaulter = isDefaulter;
    if (journalTaken !== undefined) match.journalTaken = journalTaken;
    if (examFormFilled !== undefined) match.examFormFilled = examFormFilled;

    // Attendance range
    if (minAttendance !== undefined || maxAttendance !== undefined) {
      match.attendance = {};
      if (minAttendance !== undefined) match.attendance.$gte = minAttendance;
      if (maxAttendance !== undefined) match.attendance.$lte = maxAttendance;
    }

    // Search
    if (search) {
      // FIX 1: The original escape regex included \s, which caused spaces in the
      // search term to be escaped into "\ " — producing an invalid/broken MongoDB
      // regex when searching full names like "Rahul Sharma". Space is not a regex
      // metacharacter and must NOT be escaped. Removed \s from the character class.
      const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");

      // FIX 2: Added a $expr + $regexMatch stage on the full concatenated name
      // (firstName + " " + lastName) so that searching "Rahul Sharma" matches even
      // though no single name sub-field contains the full string. Without this, a
      // full-name search would silently return 0 results.
      match.$or = [
        { "student.name.firstName": { $regex: safeSearch, $options: "i" } },
        { "student.name.middleName": { $regex: safeSearch, $options: "i" } },
        { "student.name.lastName": { $regex: safeSearch, $options: "i" } },
        { "student.studentID": { $regex: safeSearch, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: [
                  { $ifNull: ["$student.name.firstName", ""] },
                  " ",
                  { $ifNull: ["$student.name.lastName", ""] },
                ],
              },
              regex: safeSearch,
              options: "i",
            },
          },
        },
      ];
    }

    if (Object.keys(match).length) {
      pipeline.push({ $match: match });
    }

    // Export projection — wide, includes all student fields
    const exportFields = {
      semester: 1,
      attendance: 1,
      kts: 1,
      marks: 1,
      isDefaulter: 1,
      journalTaken: 1,
      examFormFilled: 1,

      stuID: "$student._id",
      studentID: "$student.studentID",
      PRN: "$student.PRN",
      studentName: "$student.name",
      studentYear: "$student.year",
      studentDivision: "$student.division",
      studentBranch: "$student.branch",
      studentDob: "$student.dob",
      studentBloodGroup: "$student.bloodGroup",
      studentCategory: "$student.category",
      studentAbcId: "$student.abcId",
      studentMobileNo: "$student.mobileNo",
      studentParentMobileNo: "$student.parentMobileNo",
      studentEmail: "$student.email",
      studentParentEmail: "$student.parentEmail",
      studentCurrentAddress: "$student.currentAddress",
      studentNativeAddress: "$student.nativeAddress",
    };

    // Paginated projection — lean subset
    const leanFields = {
      semester: 1,
      attendance: 1,
      kts: 1,
      isDefaulter: 1,
      journalTaken: 1,
      examFormFilled: 1,

      stuID: "$student._id",
      studentID: "$student.studentID",
      studentName: "$student.name",
      studentYear: "$student.year",
      studentDivision: "$student.division",
    };

    // Export branch
    if (isExport) {
      const semInfos = await SemesterInfo.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $limit: 5000 },
        { $project: exportFields },
      ]);

      const rows = semInfos.map(transformSemesterInfo);

      const buffer = await exportToExcel(rows, "Semester Info", semesterInfoColumnMap);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="semester-info.xlsx"'
      );

      return res.send(buffer);
    }

    // Pagination branch
    const results = await SemesterInfo.aggregate([
      ...pipeline,
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum },
            { $project: leanFields },
          ],
          totalCount: [{ $count: "total" }],
        },
      },
    ]);

    const semInfos = results[0]?.data || [];
    const total = results[0]?.totalCount[0]?.total || 0;

    return res.json({
      success: true,
      data: semInfos,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });

  } catch (err) {
    errorLogger(err, req, "getAllSemInfos");

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// GET OWN SEM INFOS (STUDENT)

const getOwnSemInfos = async (req, res) => {
  try {
    // .lean() — read-only list endpoint
    const data = await SemesterInfo.find({ stuID: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data });

  } catch (err) {
    errorLogger(err, req, "getOwnSemInfos");
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// GET STUDENT SEM INFOS (ADMIN / DI)

const getStudentSemInfos = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Support both MongoDB ObjectId and custom studentID field.
    // .lean() — read-only lookup
    let student;
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId).lean();
    } else {
      student = await Student.findOne({ studentID: studentId }).lean();
    }

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
    const data = await SemesterInfo.find({ stuID: student._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data });

  } catch (err) {
    errorLogger(err, req, "getStudentSemInfos");
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


module.exports = {
  addSemInfo,
  updateSemInfo,
  deleteSemInfo,
  getAllSemInfos,
  getOwnSemInfos,
  getStudentSemInfos,
};
