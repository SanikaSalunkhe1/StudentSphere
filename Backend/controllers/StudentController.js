const Student = require("../models/Student");
const cloudinary = require("../config/cloudinaryConfig");

const bcrypt = require("bcryptjs");
const ExcelJS = require("exceljs"); // replaced xlsx

const { importExcelSchema, addStudentDetailsSchema, updateStudentSchema, getStudentsValidation } = require("../validators/studentValidation");

const cascadeDeleteStudent = require("../helpers/cascadeDeleteStudent");

const { validateAndUploadFiles } = require("../helpers/cloudinary/ValidateAndUploadFiles");

const mongoose = require("mongoose");
const { deleteMultipleFromCloudinary } = require("../helpers/cloudinary/DeleteMultipleFromCloudinary");

const generateRandomPassword = require("../helpers/generateRandomPassword");

const sendEmailBrevo = require("../services/sendEmailBrevo");

const { transformStudent, studentColumnMap } = require('../helpers/excel/exportTransformers');
const exportToExcel = require('../helpers/excel/exportToExcel');

const errorLogger = require("../helpers/winston/errorLogger")

// for studentPhoto
const fileConfigs = [
  {
    fieldName: "studentPhoto",
    allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
    maxSize: 500 * 1024, // 500KB
    friendlyName: "Student Photo"
  },
];

// for excel import
const allowedTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
];

// for excel import
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

// Helper to safely get cell value as string --used in import excel controller
const getCellValue = (cell) => {
  if (!cell) return "";
  if (typeof cell === "string") return cell.trim();
  if (typeof cell === "number") return cell.toString();
  if (cell?.text) return cell.text.trim();       // rich text
  if (cell?.hyperlink) return cell.hyperlink;    // hyperlink type
  return "";
};


// Import studentIDs from Excel (studentID + email )
const importStudentIDs = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required"
      });
    }

    // File type validation
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only Excel files (.xls, .xlsx) are allowed"
      });
    }

    // Size validation
    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Excel file size must be less than 1MB"
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return res.status(400).json({
        success: false,
        message: "Excel sheet is empty"
      });
    }

    // Read header
    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values
      .slice(1)
      .map(h => h?.toString().trim().toLowerCase());

    // Check only two column
    const studentIDColIndex = headers.findIndex(h => h === "studentid") + 1;
    const emailColIndex     = headers.findIndex(h => h === "email")     + 1;
 
    if (studentIDColIndex === 0 || emailColIndex === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel must contain exactly two columns named 'studentID' and 'email'"
      });
    }

    const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRows   = [];
    const invalidRows = [];
 
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
 
      const studentID = getCellValue(row.getCell(studentIDColIndex));
      if (!studentID) return; // skip blank rows silently
 
      const email = getCellValue(row.getCell(emailColIndex));
 
      if (!email || !emailRegex.test(email)) {
        invalidRows.push({
          row: rowNumber,
          studentID,
          issue: !email ? "Missing email" : "Invalid email format"
        });
        return;
      }
 
      validRows.push({ studentID, email: email.toLowerCase() });
    });
 
    if (validRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid rows found in Excel",
        ...(invalidRows.length > 0 && { invalidRows })
      });
    }
 
    // Deduplicate within the file (keep first occurrence per studentID) 
    const uniqueStudents = [
      ...new Map(validRows.map(s => [s.studentID, s])).values()
    ];
 
    //Check existing records in DB 
    const existingStudents = await Student.find({
      studentID: { $in: uniqueStudents.map(s => s.studentID) }
    }).select("studentID email");
 
    const existingMap = new Map(existingStudents.map(s => [s.studentID, s]));
 
    //Categorise each row 
    const toInsert      = []; // brand-new students
    const toUpdateEmail = []; // exists but no email yet → patch
    const skipped       = []; // exists and already has an email → skip
 
    for (const s of uniqueStudents) {
      const existing = existingMap.get(s.studentID);
 
      if (!existing) {
        toInsert.push({ studentID: s.studentID, email: s.email });
      } else if (!existing.email) {
        toUpdateEmail.push({ _id: existing._id, studentID: s.studentID, email: s.email });
      } else {
        skipped.push(s.studentID);
      }
    }
 
    // Persist
    let insertedCount = 0;
    let updatedCount  = 0;
 
    if (toInsert.length > 0) {
      await Student.insertMany(toInsert);
      insertedCount = toInsert.length;
    }
 
    if (toUpdateEmail.length > 0) {
      const bulkOps = toUpdateEmail.map(s => ({
        updateOne: {
          filter: { _id: s._id },
          update: { $set: { email: s.email } }
        }
      }));
      await Student.bulkWrite(bulkOps);
      updatedCount = toUpdateEmail.length;
    }
 
    // Response 
    return res.status(200).json({
      success: true,
      message: "Student IDs and emails imported successfully",
      summary: {
        totalRowsInFile  : validRows.length + invalidRows.length,
        validRows        : validRows.length,
        uniqueInFile     : uniqueStudents.length,
        inserted         : insertedCount,
        emailPatched     : updatedCount,
        skipped          : skipped.length,
        invalidEmailRows : invalidRows.length,
      },
      ...(invalidRows.length > 0 && { invalidRows })
    });
 
  } catch (error) {
    errorLogger(error,req, "Import student ids Controller")
    return res.status(500).json({
      success: false,
      message: "Error importing student data"
    });
  }
};



//importExcelDataWithPasswords
const importExcelDataWithPasswords = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: "No file uploaded"
			});
		}

		if (!allowedTypes.includes(req.file.mimetype)) {
			return res.status(400).json({ success: false, message: "" });
		}

		if (req.file.size > MAX_FILE_SIZE) {
			return res.status(400).json({
				success: false,
				message: "Excel file size must be less than or equal to 1MB"
			});
		}

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(req.file.buffer);

		const worksheet = workbook.worksheets[0];
		if (!worksheet) {
			return res.status(400).json({
				success: false,
				message: "Excel file is empty"
			});
		}

		const headerRow = worksheet.getRow(1);
		const headers = headerRow.values
		.slice(1)
		.map(h => h?.toString().trim().toLowerCase());

		const studentIDColIndex = headers.findIndex(h => h.includes("studentid")) + 1;
		const emailColIndex = headers.findIndex(h => h.includes("email")) + 1;

		if (studentIDColIndex === 0 || emailColIndex === 0) {
			return res.status(400).json({
				success: false,
				message: "Excel must contain 'studentID' and 'email' columns"
			});
		}

		const rawData = [];

		worksheet.eachRow((row, rowNumber) => {
			if (rowNumber === 1) return;

			rawData.push({
				studentID: getCellValue(row.getCell(studentIDColIndex)),
				email: getCellValue(row.getCell(emailColIndex))
			});
		});

		const filteredData = rawData.filter(i => i.studentID && i.email);

		const receivedStudents = filteredData.map(s => ({
			studentID: s.studentID,
			email: s.email
		}));

		if (filteredData.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No valid studentID or email fields found"
			});
		}

		if (filteredData.length > 100) {
			return res.status(400).json({
				success: false,
				message: "Excel file can contain max 100 students due to email limits."
			});
		}

		const studentsToSave = [];
		const emailJobs = [];
		const failedStudents = [];

		for (const data of filteredData) {
			const { error } = importExcelSchema.validate(data, { abortEarly: false });

			if (error) {
				failedStudents.push({
				studentID: data.studentID,
				email: data.email,
				error: error.details.map(e => ({
					field: e.path[0],
					message: e.message
				}))
				});
				continue;
			}

			const randomPassword = generateRandomPassword(14);
			const hashedPassword = await bcrypt.hash(randomPassword, 10);

			studentsToSave.push({
				studentID: data.studentID,
				email: data.email,
				password: hashedPassword
			});

			emailJobs.push({
				studentID: data.studentID,
				email: data.email,
				password: randomPassword
			});
		}

		// ---------------- CHECK EXISTING EMAILS ----------------
		const existingStudents = await Student.find({
			email: { $in: studentsToSave.map(s => s.email) }
		}).select("email");

		const existingEmailSet = new Set(existingStudents.map(s => s.email));

		// Mark duplicates as failed
		studentsToSave.forEach(student => {
			if (existingEmailSet.has(student.email)) {
				failedStudents.push({
					studentID: student.studentID,
					email: student.email,
					error: "Email already exists in database"
				});
			}
		});

		// Filter only new students
		const newStudents = studentsToSave.filter(
			s => !existingEmailSet.has(s.email)
		);

		// ---------------- INSERT NEW STUDENTS ----------------
		let insertedStudents = [];

		if (newStudents.length > 0) {
			insertedStudents = await Student.insertMany(newStudents);
		}

		const insertedEmailSet = new Set(insertedStudents.map(s => s.email));

		const insertedStudentsList = insertedStudents.map(s => ({
			studentID: s.studentID,
			email: s.email
		}));

		// Send email only to inserted students
		const validEmailJobs = emailJobs.filter(job =>
			insertedEmailSet.has(job.email)
		);

		let emailedStudents = [];


		// -------- Send email in batches: 5 emails, 3s delay --------
		const BATCH_SIZE = 5;
		const DELAY = 3000;

		const sendWithDelay = (ms) => new Promise(res => setTimeout(res, ms));

		for (let i = 0; i < validEmailJobs.length; i += BATCH_SIZE) {
			const batch = validEmailJobs.slice(i, i + BATCH_SIZE);

			await Promise.all(
				batch.map(async (job) => {
					try {

            await sendEmailBrevo({
                toEmail: job.email,
                subject: "Student Account Created",
                htmlContent: `
                  <h2>Hello ${job.studentID},</h2>
                  <p>Your Student account has been created. Please save this email so that even if you forget password, you can get back to this email. As currently we dont have a way to reset password in the system yet.</p>
                  <p><b>Email:</b> ${job.email}</p>
                  <p><b>Password:</b> ${job.password}</p>
                `
              });

              

						// Push to array only after successful send
						emailedStudents.push({
							studentID: job.studentID,
							email: job.email
						});

					} catch (err) {
						console.error(`Email failed for ${job.studentID}:`, err.message);

						failedStudents.push({
							studentID: job.studentID,
							email: job.email,
							error: "Email failed to send"
						});
					}
				})
			);


			if (i + BATCH_SIZE < validEmailJobs.length) {
				await sendWithDelay(DELAY);
			}
		}

		return res.status(200).json({
			success: true,
			message: `Import completed`,
			summary: {
				received: filteredData.length,
				inserted: insertedStudents.length,
				emailed: emailedStudents.length,
				failed: failedStudents.length
			},
			receivedStudents,
			insertedStudents: insertedStudentsList,
			emailedStudents,
			failedStudents
		});

	} catch (error) {
		console.error("Import error:", error);
		return res.status(500).json({ success: false, message: "Error importing Excel data" });
	}
};


// --- exportAllStudentsToExcel ---
const exportAllStudentsToExcel = async (req, res) => {
  try {
    const { year, branch, division, search, firstName, middleName, lastName, motherName, city, bloodGroup, category } = req.query;

    const filter = {};

    // 1. Role-based base filter
    if (req.user.role === "divisionIncharge") {
      filter.division = req.user.division;
      filter.year = req.user.year;
    } else if (req.user.role === "admin") {
      // Admin explicit filters
      if (division) filter.division = division;
      if (year) filter.year = year;
      if (branch) filter.branch = branch;
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized role." });
    }

    // 2. Apply Advanced Filters (Same as getStudents)
    if (firstName) filter['name.firstName'] = { $regex: firstName, $options: 'i' };
    if (middleName) filter['name.middleName'] = { $regex: middleName, $options: 'i' };
    if (lastName) filter['name.lastName'] = { $regex: lastName, $options: 'i' };
    if (motherName) filter['name.motherName'] = { $regex: motherName, $options: 'i' };

    if (city) filter['currentAddress.city'] = { $regex: city, $options: 'i' };
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (category) filter.category = category;

    // 3. Apply Search Filter
    if (search) {
      const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); // regex safety
      filter.$or = [
        { 'name.firstName': { $regex: safeSearch, $options: 'i' } },
        { 'name.middleName': { $regex: safeSearch, $options: 'i' } },
        { 'name.lastName': { $regex: safeSearch, $options: 'i' } },
        { 'name.motherName': { $regex: safeSearch, $options: 'i' } },
        { 'studentID': { $regex: safeSearch, $options: 'i' } }, // also search by ID
        { 'email': { $regex: safeSearch, $options: 'i' } }      // also search by email
      ];
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });

    if (!students || students.length === 0) {
      return res.status(404).json({ success: false, message: "No students found matching criteria." });
    }

    // --- Create workbook and sheet using ExcelJS ---
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    worksheet.columns = [
      { header: "StudentID", key: "StudentID", width: 20 },
      { header: "PRN", key: "PRN", width: 20 },

      { header: "First Name", key: "FirstName", width: 20 },
      { header: "Middle Name", key: "MiddleName", width: 20 },
      { header: "Last Name", key: "LastName", width: 20 },
      { header: "Mother Name", key: "MotherName", width: 20 },

      { header: "Email", key: "Email", width: 30 },
      { header: "Parent Email", key: "ParentEmail", width: 30 },

      { header: "Mobile No", key: "MobileNo", width: 15 },
      { header: "Parent Mobile No", key: "ParentMobileNo", width: 15 },

      { header: "ABC ID", key: "ABCID", width: 25 },

      { header: "Branch", key: "Branch", width: 20 },
      { header: "Year", key: "Year", width: 10 },
      { header: "Division", key: "Division", width: 10 },

      { header: "DOB", key: "DOB", width: 15 },
      { header: "Blood Group", key: "BloodGroup", width: 10 },
      { header: "Category", key: "Category", width: 15 },

      // Current Address
      { header: "Current Street", key: "CurrentStreet", width: 30 },
      { header: "Current City", key: "CurrentCity", width: 20 },
      { header: "Current Pincode", key: "CurrentPincode", width: 15 },

      // Native Address
      { header: "Native Street", key: "NativeStreet", width: 30 },
      { header: "Native City", key: "NativeCity", width: 20 },
      { header: "Native Pincode", key: "NativePincode", width: 15 },

      // Photo
      { header: "Student Photo URL", key: "StudentPhotoURL", width: 50 },

      // Timestamps
      { header: "Created At", key: "CreatedAt", width: 30 },
      { header: "Updated At", key: "UpdatedAt", width: 30 },
    ];


    // Add rows
    const formattedData = students.map((student) => ({
      StudentID: student.studentID || "",
      PRN: student.PRN || "",

      FirstName: student.name?.firstName || "",
      MiddleName: student.name?.middleName || "",
      LastName: student.name?.lastName || "",
      MotherName: student.name?.motherName || "",

      Email: student.email || "",
      ParentEmail: student.parentEmail || "",

      MobileNo: student.mobileNo || "",
      ParentMobileNo: student.parentMobileNo || "",

      ABCID: student.abcId || "",

      Branch: student.branch || "",
      Year: student.year || "",
      Division: student.division || "",

      DOB: student.dob
        ? new Date(student.dob).toLocaleDateString("en-GB")
        : "",

      BloodGroup: student.bloodGroup || "",
      Category: student.category || "",

      // Current Address
      CurrentStreet: student.currentAddress?.street || "",
      CurrentCity: student.currentAddress?.city || "",
      CurrentPincode: student.currentAddress?.pincode || "",

      // Native Address
      NativeStreet: student.nativeAddress?.street || "",
      NativeCity: student.nativeAddress?.city || "",
      NativePincode: student.nativeAddress?.nativePincode || "",

      // Photo
      StudentPhotoURL: student.studentPhoto?.url || "",

      // Timestamps
      CreatedAt: student.createdAt
        ? new Date(student.createdAt).toLocaleString()
        : "",
      UpdatedAt: student.updatedAt
        ? new Date(student.updatedAt).toLocaleString()
        : "",
    }));


    worksheet.addRows(formattedData);

    // Send as download directly
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=StudentsData.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting students to Excel:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while exporting data.",
    });
  }
};



// Add remaining Details from schema --for student or admin or divisionIncharge
const addStudentDetails = async (req, res) => {
  let uploadedFiles = null;
  let dbSaved = false;

  try {
    let studentId;

    if (req.user.role === "student") {

      studentId = req.user.id;

      //added this check so that, one studnet cannot manipulate other student's data.
      if (req.body.studentId && req.body.studentId !== req.user.id) {
        return res.status(403).json({ success: false, message: "Students cannot modify other profiles" });
      }

    } else if (req.user.role === "admin" || req.user.role === "divisionIncharge") {

      studentId = req.body.studentId;
      if (!studentId) {
        return res.status(400).json({ success: false, message: "Student ID is required for admin" });
      }

      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ success: false, message: "Invalid Student ID format" });
      }


    } else {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    
    const existingStudent = await Student.findById(studentId);

    if (!existingStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // block if details already added
    if (existingStudent.PRN) {
      return res.status(400).json({
        success: false,
        message: "Student details already added. To update details please use Edit Option."
      });
    }


    // Validate input using Joi
    const { error, value } = addStudentDetailsSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(err => ({
        field: err.path[0],
        message: err.message
      }));

      return res.status(400).json({ success: false, message: "Validation failed", errors: validationErrors });
    }

    // Check if file is uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, message: "Student Photo is required" });
    }

    // Upload & validate file using helper
    uploadedFiles = await validateAndUploadFiles(req.files, fileConfigs);

    const studentPhoto = {
      url: uploadedFiles.studentPhoto.url,
      publicId: uploadedFiles.studentPhoto.publicId
    };

    // Build nested objects
    const name = {
      firstName: value.firstName,
      middleName: value.middleName,
      lastName: value.lastName,
      motherName: value.motherName
    };

    const currentAddress = {
      street: value.currentStreet,
      city: value.currentCity,
      pincode: value.pincode
    };

    const nativeAddress = {
      street: value.nativeStreet,
      city: value.nativeCity,
      nativePincode: value.nativePincode
    };

    // Update student in DB
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        name,
        PRN: value.PRN,
        branch: value.branch,
        year: value.year,
        division: value.division,
        dob: value.dob,
        bloodGroup: value.bloodGroup,
        currentAddress,
        nativeAddress,
        category: value.category,
        mobileNo: value.mobileNo,
        parentMobileNo: value.parentMobileNo,
        parentEmail: value.parentEmail,
        abcId: value.abcId,
        studentPhoto,
        academicYear : value.academicYear,
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    dbSaved = true;

    return res.status(200).json({ success: true, message: "Student details added successfully", data: updatedStudent });

  } catch (err) {

    if (err.code === 11000) { // Duplicate PRN
      return res.status(400).json({ success: false, message: "This PRN already already exists." });
    }

    errorLogger(err,req, "Add Student Details Controller")

    // Rollback uploaded file if DB save fails
    if (!dbSaved && uploadedFiles) {
      const publicIds = Object.values(uploadedFiles).map(file => file.publicId);
      await deleteMultipleFromCloudinary(publicIds);
    }

    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE STUDENT -- student or admin or divisionIncharge
const updateStudent = async (req, res) => {
  let dbSaved = false;
  let uploadedFiles = null;
  let studentId;

  try {

    // Determine studentId based on role
    if (req.user.role === "admin" || req.user.role === "divisionIncharge") {
      studentId = req.params.studentId;
      if (!studentId) {
        return res.status(400).json({ success: false, message: "Student ID is required for admin" });
      }

      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ success: false, message: "Invalid Student ID format" });
      }

    } else if (req.user.role === "student") {
      studentId = req.user.id;
    } else {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: "Student ID required in valid format." });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Verify requester-resource relation
    if (req.user.role === "student" && student._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Resource does not belong to logged-in student" });
    }

    // Verify for division Incharge
    if (req.user.role === "divisionIncharge") {

      if ( student.year !== req.user.year || student.division !== req.user.division ) {
        return res.status(403).json({ success: false, message: "You can only update your division's student details." });
      }
    }

    // Ensure student already has a photo
    if (!student.studentPhoto || !student.studentPhoto.publicId) {
      return res.status(400).json({
        success: false,
        message: "Please fill the details first. You cannot update without uploading a profile photo initially."
      });
    }

    const oldPublicId = student.studentPhoto.publicId;

    // Validate input
    const { error, value } = updateStudentSchema.validate(req.body, { abortEarly: false, stripUnknown: true, convert: true });
    if (error) {
      const validationErrors = error.details.map(err => ({
        field: err.path[0],
        message: err.message
      }));
      return res.status(400).json({ success: false, message: "Validation failed", errors: validationErrors });
    }

    // Prepare updated data
    const updatedData = {};

    // Name fields
    if (value.firstName) updatedData["name.firstName"] = value.firstName;
    if (value.middleName) updatedData["name.middleName"] = value.middleName;
    if (value.lastName) updatedData["name.lastName"] = value.lastName;
    if (value.motherName) updatedData["name.motherName"] = value.motherName;

    // Current Address
    if (value.currentStreet) updatedData["currentAddress.street"] = value.currentStreet;
    if (value.currentCity) updatedData["currentAddress.city"] = value.currentCity;
    if (value.pincode) updatedData["currentAddress.pincode"] = value.pincode;

    // Native Address
    if (value.nativeStreet) updatedData["nativeAddress.street"] = value.nativeStreet;
    if (value.nativeCity) updatedData["nativeAddress.city"] = value.nativeCity;
    if (value.nativePincode) updatedData["nativeAddress.nativePincode"] = value.nativePincode;

    // Other fields
    if (value.PRN) updatedData.PRN = value.PRN;
    if (value.branch) updatedData.branch = value.branch;
    if (value.year) updatedData.year = value.year;
    if (value.division) updatedData.division = value.division;
    if (value.dob) updatedData.dob = new Date(value.dob);
    if (value.bloodGroup) updatedData.bloodGroup = value.bloodGroup;
    if (value.category) updatedData.category = value.category;
    if (value.mobileNo) updatedData.mobileNo = value.mobileNo;
    if (value.parentMobileNo) updatedData.parentMobileNo = value.parentMobileNo;
    if (value.abcId) updatedData.abcId = value.abcId;
    if (value.parentEmail) updatedData.parentEmail = value.parentEmail;
    if (value.academicYear) updatedData.academicYear = value.academicYear;

    // Handle student photo upload using validateAndUploadFiles
    if (req.files && Object.keys(req.files).length > 0) {
      uploadedFiles = await validateAndUploadFiles(req.files, fileConfigs);

      if (!uploadedFiles.studentPhoto) {
        return res.status(500).json({ success: false, message: "Failed to upload photo. Please try again." });
      }

      updatedData.studentPhoto = {
        url: uploadedFiles.studentPhoto.url,
        publicId: uploadedFiles.studentPhoto.publicId
      };
    }

    if (Object.keys(updatedData).length === 0) {
			return res.status(400).json({ success: false, message: "No valid fields provided for update" });
		}

    // Update student in DB
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: updatedData },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    dbSaved = true;

    // Delete old photo if a new one was uploaded
    if (uploadedFiles && uploadedFiles.studentPhoto && oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (err) {
        console.error("Old photo deletion failed:", err.message);
      }
    }

    return res.status(200).json({ success: true, message: "Student updated successfully", data: updatedStudent });

  } catch (err) {
    errorLogger(err,req, "Update Student Controller")

    // Rollback uploaded file if DB save fails
    if (!dbSaved && uploadedFiles) {
      const publicIds = Object.values(uploadedFiles).map(file => file.publicId);
      await deleteMultipleFromCloudinary(publicIds);
    }

    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



// DELETE STUDENT --divisionIncharge or admin
const deleteStudent = async (req, res) => {
  try {
    let studentId;


    // Verify requester
    if (req.user.role === "admin" || req.user.role === "divisionIncharge") {

      studentId = req.params.studentId;

      if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ success: false, message: "Student ID required in valid format." });
      }


      // Verify for division Incharge
      if (req.user.role === "divisionIncharge") {

        const student = await Student.findById(studentId);
        if (!student) {
          return res.status(404).json({ success: false, message: "Student not found" });
        }

        if (student.division !== req.user.division) {
          return res.status(403).json({ success: false, message: "You can only delete your division's student details." });
        }
      }


    } else {
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }


    await cascadeDeleteStudent(studentId);




    return res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    errorLogger(err,req, "Delete Student Controller")
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET STUDENTS (with optional pagination + export) — admin and divisionIncharge only
const getStudents = async (req, res) => {
    try {
        const isExport = req.query.export === 'true';

        // Validate input using Joi
        const { error, value } = getStudentsValidation.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const validationErrors = error.details.map(err => ({
                field: err.path[0],
                message: err.message,
            }));
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validationErrors });
        }

        // Use defaults
        const pageNum   = value.page  || 1;
        const limitNum  = Math.min(value.limit || 10, 50);
        const skip      = (pageNum - 1) * limitNum;

        // Build filter
        const filter = {};

        if (req.user.role === 'divisionIncharge') {
            filter.division = req.user.division;
            filter.year     = req.user.year;
        } else if (req.user.role === 'admin') {
            if (value.division) filter.division = value.division;
            if (value.year)     filter.year     = value.year;
            if (value.branch)   filter.branch   = value.branch;
        } else {
            return res.status(403).json({ success: false, message: 'Unauthorized role.' });
        }

        // Name filters
        if (value.firstName)  filter['name.firstName']  = { $regex: value.firstName,  $options: 'i' };
        if (value.middleName) filter['name.middleName'] = { $regex: value.middleName, $options: 'i' };
        if (value.lastName)   filter['name.lastName']   = { $regex: value.lastName,   $options: 'i' };
        if (value.motherName) filter['name.motherName'] = { $regex: value.motherName, $options: 'i' };

        // Other filters
        if (value.city)       filter['currentAddress.city'] = { $regex: value.city, $options: 'i' };
        if (value.bloodGroup) filter.bloodGroup = value.bloodGroup;
        if (value.category)   filter.category   = value.category;
        if (value.academicYear) filter.academicYear = value.academicYear;

        // Search
        if (value.search) {
            const safeSearch = value.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            filter.$or = [
                { 'name.firstName':  { $regex: safeSearch, $options: 'i' } },
                { 'name.middleName': { $regex: safeSearch, $options: 'i' } },
                { 'name.lastName':   { $regex: safeSearch, $options: 'i' } },
                { 'name.motherName': { $regex: safeSearch, $options: 'i' } },
            ];
        }

        // Filter by whether student has filled in their details
        if (value.detailsFilled === true) {
            filter.PRN = { $exists: true, $ne: null };
        } else if (value.detailsFilled === false) {
            filter.$and = [
                ...(filter.$and || []),
                { $or: [{ PRN: { $exists: false } }, { PRN: null }] }
            ];
        }


        // Export branch
        if (isExport) {
            const students = await Student.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .limit(5000) // hard cap - to prevent excessive data being injected in memory which can lead to server crash(or some component of system crashes).
                .lean();

            const rows   = students.map(transformStudent);
            const buffer = await exportToExcel(rows, 'Students', studentColumnMap);
            if (!buffer) return res.status(500).json({ success: false, message: 'Export failed.' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="students.xlsx"');
            return res.send(buffer);
        }

        // Paginated branch 
        const [total, students] = await Promise.all([
            Student.countDocuments(filter),
            Student.find(filter)
                .skip(skip)
                .limit(limitNum)
                .select('-password')
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        return res.json({
            success:    true,
            data:       students,
            total,
            page:       pageNum,
            totalPages: Math.ceil(total / limitNum),
        });

    } catch (err) {
        errorLogger(err,req, "Get Students Controller")
        return res.status(500).json({ success: false, message: 'Some Error Occurred. Please Try Again Later.' });
    }
};

// GET STUDENTS (with optional pagination) --admin and divisionIncharge only
const getStudents2 = async (req, res) => {
  try {

    // Get query params
    const { year, division, search, page, limit } = req.query;




    // Validate input using Joi
    const { error, value } = getStudentsValidation.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      const validationErrors = error.details.map(err => ({
        field: err.path[0],
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Use defaults
    const pageNum = value.page || 1;
    const limitNum = Math.min(value.limit || 10, 50);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};


    // If divisionIncharge, restrict by their division & year
    if (req.user.role === "divisionIncharge") {
      filter.division = req.user.division;
      filter.year = req.user.year;
    } else if (req.user.role === "admin") {
      // Admin can filter by query params
      if (value.division) filter.division = value.division;
      if (value.year) filter.year = value.year;
      if (value.branch) filter.branch = value.branch;
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized role." });
    }

    // --- NEW FILTERS ---
    if (value.firstName) filter['name.firstName'] = { $regex: value.firstName, $options: 'i' };
    if (value.middleName) filter['name.middleName'] = { $regex: value.middleName, $options: 'i' }; // Maps to Father's Name in UI
    if (value.lastName) filter['name.lastName'] = { $regex: value.lastName, $options: 'i' };
    if (value.motherName) filter['name.motherName'] = { $regex: value.motherName, $options: 'i' };

    if (value.city) filter['currentAddress.city'] = { $regex: value.city, $options: 'i' };

    if (value.bloodGroup) filter.bloodGroup = value.bloodGroup;
    if (value.category) filter.category = value.category;



    if (value.search) {
      //regex safety
      const safeSearch = value.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

      filter.$or = [
        { 'name.firstName': { $regex: safeSearch, $options: 'i' } },
        { 'name.middleName': { $regex: safeSearch, $options: 'i' } },
        { 'name.lastName': { $regex: safeSearch, $options: 'i' } },
        { 'name.motherName': { $regex: safeSearch, $options: 'i' } },
      ];
    }



    // Get total count for filtered results
    const total = await Student.countDocuments(filter);

    // Fetch students with pagination
    const students = await Student.find(filter)
      .skip(skip)
      .limit(limitNum)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: students,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// GET SINGLE STUDENT BY ID Admin or DivisionIncharge
const getSingleStudent = async (req, res) => {
  try {

    const { studentId } = req.params;

    //check studentId
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: "Student ID required in valid format." });
    }


    const student = await Student.findById(studentId).select("-password -__v").lean();
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (req.user.role === "divisionIncharge") {

      if (student.division !== req.user.division || student.year !== req.user.year) {
        return res.status(403).json({ success: false, message: "You can only access your own division's students." });
      }

    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    errorLogger(error,req, "Get single Student Controller")
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get single Student from req.user.id ( for student )
const getStudentById = async (req, res) => {

  try {
    const studentId = req.user.id;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required, Please Login first" });
    }

    const student = await Student.findById(studentId).select("-password -__v").lean();
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    errorLogger(error,req, "Get Student by id Controller")
    return res.status(500).json({ success: false, message: "Server Error" });
  }

};


module.exports = { importStudentIDs , addStudentDetails, getStudentById, getStudents, getSingleStudent, updateStudent, deleteStudent, importExcelDataWithPasswords, exportAllStudentsToExcel };
