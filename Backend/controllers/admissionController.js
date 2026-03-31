const mongoose = require("mongoose");
const Admission = require("../models/Admission");
const Student = require("../models/Student");

const {
  admissionCreateSchema,
  admissionUpdateSchema,
  admissionStatusSchema,
  getAdmissionsValidation,
} = require("../validators/admissionValidation");

const exportToExcel = require("../helpers/excel/exportToExcel");
const { transformAdmission, admissionColumnMap } = require("../helpers/excel/exportTransformers");

// Build a 400 validation-error response from Joi details
const validationErrorResponse = (res, details) =>
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: details.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  });


// CREATE ADMISSION
// Roles => student | admin | divisionIncharge

const createAdmission = async (req, res) => {
  try {
    const { error, value } = admissionCreateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) return validationErrorResponse(res, error.details);

    let stuID;
    let student; // resolved in all role branches

    if (req.user.role === "student") {
      // .lean() — we only need plain fields (year, division) for the admission record
      student = await Student.findById(req.user.id).lean();
      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }
      stuID = student._id;
    } else if (["admin", "divisionIncharge"].includes(req.user.role)) {
      // admissionCreateSchema strips unknown fields and does not include studentId.
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
      if (mongoose.Types.ObjectId.isValid(rawStudentId)) {
        student = await Student.findById(rawStudentId).lean();
      } else {
        student = await Student.findOne({ studentID: rawStudentId }).lean();
      }

      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }

      stuID = student._id;

      // Division Incharge restriction and student assignment logic
      if (req.user.role === "divisionIncharge") {
        if (!student.year && !student.division) {
          // If the student has no assigned year and division, claim them for this division
          await Student.findByIdAndUpdate(student._id, {
            year: req.user.year,
            division: req.user.division
          });
          // Update the localized lean object so admission gets the correct year/div
          student.year = req.user.year;
          student.division = req.user.division;
        } else if (student.year !== req.user.year || student.division !== req.user.division) {
          // Student is already assigned to a different division
          return res.status(403).json({
            success: false,
            message: `Student already belongs to Year ${student.year || 'Unknown'} Div ${student.division || 'Unknown'} and cannot be added to your division.`,
          });
        }
      }
    }

    // All validated fields from value are explicitly assigned to the model.
    // year and div are sourced from the student record — not trusted from client input.
    const admission = new Admission({
      stuID,
      rollno: value.rollno,
      course: value.course,
      fees: value.fees,
      isScholarshipApplied: value.isScholarshipApplied,
      scholarshipNotAppliedReason: value.scholarshipNotAppliedReason,
      isMahadbtFormSubmitted: value.isMahadbtFormSubmitted,
      mahadbtFilledDate: value.mahadbtFilledDate,
      mahadbtNotFilledReason: value.mahadbtNotFilledReason,
      hasMigrationCertificate: value.hasMigrationCertificate,
      migrationExpectedDate: value.migrationExpectedDate,
      migrationNotAvailableReason: value.migrationNotAvailableReason,
      year: student.year,   // always taken from DB, never from client
      div: student.division,
    });

    await admission.save();

    return res.status(201).json({
      success: true,
      message: "Admission submitted successfully",
      data: admission,
    });
  } catch (err) {
    // Unique index violation: duplicate admission for the same academic year
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Admission already exists for this student.",
      });
    }
    console.error("Create Admission Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


// GET OWN ADMISSIONS (STUDENT)

const getAdmissionsByStudent = async (req, res) => {
  try {
    // .lean() — read-only list endpoint
    const admissions = await Admission.find({ stuID: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: admissions });
  } catch (err) {
    console.error("Get Admissions By Student Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


// UPDATE ADMISSION
// Roles -> student | admin | divisionIncharge — pending status only

const updateAdmission = async (req, res) => {
  try {
    if (!["student", "admin", "divisionIncharge"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { error, value } = admissionUpdateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) return validationErrorResponse(res, error.details);

    // FIX: validate ObjectId before querying to avoid Mongoose CastError / 500 leak
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid admission ID" });
    }

    const admission = await Admission.findById(req.params.id).populate("stuID", "year division");

    if (!admission) {
      return res.status(404).json({ success: false, message: "Admission not found" });
    }

    // Admins can edit regardless of status.
    // Students can also edit regardless of status (they may need to correct details).
    // Only Division Incharges are restricted to pending admissions.
    if (req.user.role === "divisionIncharge" && admission.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot update after approval or rejection",
      });
    }

    if (
      req.user.role === "student" &&
      admission.stuID._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (
      req.user.role === "divisionIncharge" &&
      (admission.stuID.year !== req.user.year ||
        admission.stuID.division !== req.user.division)
    ) {
      return res.status(403).json({ success: false, message: "Division access denied" });
    }

    Object.assign(admission, value);
    await admission.save();

    return res.status(200).json({
      success: true,
      message: "Admission updated successfully",
      data: admission,
    });
  } catch (err) {
    console.error("Update Admission Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


// DELETE ADMISSION
// Roles -> student | divisionIncharge — pending status only

const deleteAdmission = async (req, res) => {
  try {
    // FIX: validate ObjectId before querying to avoid Mongoose CastError / 500 leak
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid admission ID" });
    }

    const admission = await Admission.findById(req.params.id).populate("stuID", "year division");

    if (!admission) {
      return res.status(404).json({ success: false, message: "Admission not found" });
    }

    // Admin can delete any admission regardless of status.
    // Student and Division Incharge can only delete pending admissions.
    if (req.user.role !== "admin" && admission.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete after approval or rejection",
      });
    }

    if (
      req.user.role === "student" &&
      admission.stuID._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (
      req.user.role === "divisionIncharge" &&
      (admission.stuID.year !== req.user.year ||
        admission.stuID.division !== req.user.division)
    ) {
      return res.status(403).json({ success: false, message: "Division access denied" });
    }

    await admission.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Admission deleted successfully",
    });
  } catch (err) {
    console.error("Delete Admission Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


// GET ALL ADMISSIONS
// Roles -> admin | divisionIncharge — with optional export

const getAllAdmissions = async (req, res) => {
  try {
    const { error, value } = getAdmissionsValidation.validate(req.query);
    if (error) return validationErrorResponse(res, error.details);

    const isExport = value.export === "true";

    const page = Math.max(1, Number(value.page || 1));
    const limit = Math.min(Number(value.limit || 10), 50);
    const skip = (page - 1) * limit;

    const query = {};

    // Role-scope restrictions
    if (req.user.role === "divisionIncharge") {
      query.year = req.user.year;
      query.div = req.user.division;
    } else {
      if (value.year) query.year = value.year;
    }

    // Paid / unpaid filter
    if (value.filterPaid === "paid") {
      query.isFeesPaid = true;
    } else if (value.filterPaid === "unpaid") {
      query.isFeesPaid = false;
    }

    // Status filter
    if (value.status) query.status = value.status;

    // Boolean filters — check explicitly for undefined so `false` values are not skipped
    if (value.isScholarshipApplied !== undefined) {
      query.isScholarshipApplied = value.isScholarshipApplied;
    }
    if (value.isMahadbtFormSubmitted !== undefined) {
      query.isMahadbtFormSubmitted = value.isMahadbtFormSubmitted;
    }
    if (value.hasMigrationCertificate !== undefined) {
      query.hasMigrationCertificate = value.hasMigrationCertificate;
    }

    // Search across roll number, course, and academic year
    if (value.search) {
      const escaped = value.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      query.$or = [
        { rollno: regex },
        { course: regex },
        { academicYear: regex },
      ];
    }

    // Export branch — capped at 5,000 rows to prevent memory overload
    if (isExport) {
      // .lean() — read-only export, no Mongoose document methods needed
      const admissions = await Admission.find(query)
        .populate("stuID", "name branch studentID")
        .sort({ createdAt: -1 })
        .limit(5000)
        .lean();

      const rows = admissions.map(transformAdmission);
      const buffer = await exportToExcel(rows, "Admissions", admissionColumnMap);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", 'attachment; filename="admissions.xlsx"');
      return res.send(buffer);
    }

    // Paginated branch
    // .lean() on both find() calls — read-only list
    const [data, total] = await Promise.all([
      Admission.find(query)
        .populate("stuID", "name branch studentID")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Admission.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Get All Admissions Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


// UPDATE ADMISSION STATUS
// Roles: admin | divisionIncharge

const updateAdmissionStatus = async (req, res) => {
  try {
    const { error } = admissionStatusSchema.validate(req.body);
    if (error) return validationErrorResponse(res, error.details);

    // FIX: validate ObjectId before querying to avoid Mongoose CastError / 500 leak
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid admission ID" });
    }

    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({ success: false, message: "Admission not found" });
    }

    // Admin can change status on any admission (e.g. fix a wrongly approved/rejected one).
    // Division Incharge can only act on pending admissions.
    if (req.user.role !== "admin" && admission.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status after approval or rejection",
      });
    }

    if (
      req.user.role === "divisionIncharge" &&
      (admission.year !== req.user.year || admission.div !== req.user.division)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this admission",
      });
    }

    admission.status = req.body.status;
    await admission.save();

    return res.status(200).json({
      success: true,
      message: `Admission ${req.body.status} successfully`,
      data: admission,
    });
  } catch (err) {
    console.error("Update Admission Status Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


// GET UNPAID STUDENTS
// Roles: admin | divisionIncharge

const getUnpaidStudents = async (req, res) => {
  try {
    const filter = { isFeesPaid: false };

    // Division Incharge sees only their own division
    if (req.user.role === "divisionIncharge") {
      filter.year = req.user.year;
      filter.div = req.user.division;
    }

    // .lean() — read-only list, no Mongoose document methods needed
    const unpaid = await Admission.find(filter)
      .populate("stuID", "name studentID branch year division mobileNo email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: unpaid });
  } catch (err) {
    console.error("Get Unpaid Students Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


module.exports = {
  createAdmission,
  getAdmissionsByStudent,
  updateAdmission,
  deleteAdmission,
  getAllAdmissions,
  updateAdmissionStatus,
  getUnpaidStudents,
};