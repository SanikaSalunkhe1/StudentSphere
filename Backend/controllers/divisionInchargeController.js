const DivisionIncharge = require("../models/DivisionIncharge");
const ExcelJS = require("exceljs");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { importDivisionInchargeSchema, changeDivisionInchargeDetailsSchema, changeEmailOfDivisionInchargeSchema, addSingleDivisionInchargeSchema } = require("../validators/divisionInchargeValidation");

const sendEmailBrevo = require("../services/sendEmailBrevo");

const generateRandomPassword = require("../helpers/generateRandomPassword");
const errorLogger = require("../helpers/winston/errorLogger");

// Helper to read Excel cell safely
const getCellValue = (cell) => {
  if (!cell) return "";
  if (typeof cell === "string") return cell.trim();
  if (typeof cell === "number") return cell.toString();
  if (cell?.text) return cell.text.trim();
  return "";
};


const addSingleDivisionIncharge = async (req, res) => {
  try {

	const { error, value } = addSingleDivisionInchargeSchema.validate(req.body);

	if (error) {
	return res.status(400).json({
		success: false,
		message: "Validation failed",
		errors: error.details.map(err => ({
		field: err.context.key,
		message: err.message
		}))
	});
	}

	const { name, year, division, email } = value;

    // Check if already exists
    const existing = await DivisionIncharge.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Division Incharge with this email already exists"
      });
    }

    //Check if a DI already exists for same year + division
    const existingCombination = await DivisionIncharge.findOne({ year, division });
    if (existingCombination) {
      return res.status(400).json({
        success: false,
        message: `A Division Incharge for Year ${year} and Division ${division} already exists`
      });
    }

    // Generate password
    const plainPassword = generateRandomPassword(14);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newIncharge = await DivisionIncharge.create({
      name,
      year,
      division,
      email,
      password: hashedPassword
    });

    // Send Email
    await sendEmailBrevo({
      toEmail: email,
      subject: "Division Incharge Account Created",
      htmlContent: `
        <h2>Hello ${name},</h2>
        <p>Your Division Incharge account has been created. Please change the password later on.</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${plainPassword}</p>
      `
    });

    return res.status(201).json({
      success: true,
      message: "Division Incharge added successfully and email sent",
      data: newIncharge
    });

  } catch (error) {
    errorLogger(error,req,"Add Single Division Incharge Controller");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please Try Again Later"
    });
  }
};

const getMyProfile = async (req,res)=>{
  try {
		const { id } = req.user;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }


		const divisionInchargeId = id;


		const incharge = await DivisionIncharge.findById(divisionInchargeId).select("-password").lean();

		if (!incharge) {
			return res.status(404).json({ success: false, message: "Division Incharge not found" });
		}

		return res.status(200).json({ success: true, data: incharge });

	} catch (error) {
		errorLogger(error,req,"Get My Profile Division Incharge Controller");
		return res.status(500).json({ success: false, message: "Internal Server Error. Please Try Again Later" });
	}
};

const getSingleDivisionInchargeById = async (req, res) => {
	try {
		const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Division INcharge ID is required in proper format.",
      });
    }

		const divisionInchargeId = id;


		const incharge = await DivisionIncharge.findById(divisionInchargeId).select("-password").lean();

		if (!incharge) {
			return res.status(404).json({ success: false, message: "Division Incharge not found" });
		}

		return res.status(200).json({ success: true, data: incharge });

	} catch (error) {
		errorLogger(error,req,"Get Single Division Incharge BY Id");
		return res.status(500).json({ success: false, message: "Internal Server Error. Please Try Again Later" });
	}
};

const getAllDivisionIncharges = async (req, res) => {
  try {
    const incharges = await DivisionIncharge.find().select("-password").lean().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: incharges
    });
  } catch (error) {
    errorLogger(error,req,"Get all division Incharges");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please Try Again Later"
    });
  }
};


// admin has compulsorily assing some year and division, if they dont want to assign anything then just delete that Division Incharge
const changeDivisionInchargeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    const { error, value } = changeDivisionInchargeDetailsSchema.validate(
      req.body,
      { abortEarly: false }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message).join(", "),
      });
    }

    const { name, year, division } = value;

    const incharge = await DivisionIncharge.findById(id);

    if (!incharge) {
      return res.status(404).json({
        success: false,
        message: "Division Incharge not found",
      });
    }

    // Check duplicate year+division combination, excluding the current record
    const effectiveYear = year || incharge.year;
    const effectiveDivision = division || incharge.division;

    const existingCombination = await DivisionIncharge.findOne({
      year: effectiveYear,
      division: effectiveDivision,
      _id: { $ne: id },
    });

    if (existingCombination) {
      return res.status(400).json({
        success: false,
        message: `A Division Incharge for Year ${effectiveYear} and Division ${effectiveDivision} already exists`,
      });
    }

    if (name) incharge.name = name;
    if (year) incharge.year = year;
    if (division) incharge.division = division;

    await incharge.save();

    return res.status(200).json({
      success: true,
      message: "Division Incharge updated successfully",
      data: incharge,
    });
  } catch (error) {
    errorLogger(error,req,"Change Division Incharge Details Controller");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please Try Again Later",
    });
  }
};

// change email ki jagah admin can just delete that DI and create new DI with new email....
const changeEmailOfDivisionIncharge = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    const { error, value } = changeEmailOfDivisionInchargeSchema.validate(
      req.body,
      { abortEarly: false }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message).join(", "),
      });
    }

    // use validated + sanitized (lowercased, trimmed) email from joi
    const { newEmail } = value;

    const incharge = await DivisionIncharge.findById(id);

    if (!incharge) {
      return res.status(404).json({
        success: false,
        message: "Division Incharge not found",
      });
    }

    const emailExists = await DivisionIncharge.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const plainPassword = generateRandomPassword(14);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    incharge.email = newEmail;
    incharge.password = hashedPassword;

    await incharge.save();


	// Send Email
    await sendEmailBrevo({
      toEmail: newEmail,
      subject: "Division Incharge Email Updated",
      htmlContent: `Hello ${incharge.name},\n\nYour email has been updated.\n\nNew Email: ${newEmail}\nNew Password: ${plainPassword}
      \n Kindly change the password later on.`
    });

    return res.status(200).json({
      success: true,
      message: "Email changed successfully and new credentials sent",
    });
  } catch (error) {
    errorLogger(error,req,"Change Email Of Division Incharge Controller");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please Try Again Later",
    });
  }
};

//change password wikl be there in new auth system(forgot password and then reset password)

const deleteDivisionIncharge = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    const deletedIncharge = await DivisionIncharge.findByIdAndDelete(id);

    if (!deletedIncharge) {
      return res.status(404).json({
        success: false,
        message: "Division Incharge not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Division Incharge deleted successfully"
    });
  } catch (error) {
    errorLogger(error,req,"Delete Division Incharge Controller");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please Try Again Later."
    });
  }
};

// yeh hatane wala controller yaha se hatane waali baat karo swar se
const loginDivisionIncharge = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find division incharge
    const divisionIncharge = await DivisionIncharge.findOne({ email });
    if (!divisionIncharge) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, divisionIncharge.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Create Token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: divisionIncharge._id, role: "divisionIncharge", division: divisionIncharge.division, year: divisionIncharge.year },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: divisionIncharge._id,
        name: divisionIncharge.name,
        email: divisionIncharge.email,
        role: "divisionIncharge",
        division: divisionIncharge.division,
        year: divisionIncharge.year
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

// isko hum use hi nahi kar rhe - bulk import route is no longer in use
const importDivisionInchargeFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
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

    // ----- Read headers -----
    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values
      .slice(1)
      .map(h => h?.toString().trim().toLowerCase());

    const nameCol = headers.findIndex(h => h.includes("name")) + 1;
    const yearCol = headers.findIndex(h => h.includes("year")) + 1;
    const divisionCol = headers.findIndex(h => h.includes("division")) + 1;
    const emailCol = headers.findIndex(h => h.includes("email")) + 1;

    if (!nameCol || !yearCol || !divisionCol || !emailCol) {
      return res.status(400).json({
        success: false,
        message: "Excel must contain name, year, division and email columns"
      });
    }

    const rawData = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      rawData.push({
        name: getCellValue(row.getCell(nameCol)),
        year: getCellValue(row.getCell(yearCol)),
        division: getCellValue(row.getCell(divisionCol)),
        email: getCellValue(row.getCell(emailCol))
      });
    });

    const filteredData = rawData.filter(
      i => i.name && i.year && i.division && i.email
    );

    if (filteredData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid division incharge data found"
      });
    }

    if (filteredData.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Max 100 records allowed per upload"
      });
    }

    const toInsert = [];
    const emailJobs = [];
    const failed = [];

    // ----- Joi validation + password generation -----
    for (const data of filteredData) {
      const { error, value } = importDivisionInchargeSchema.validate(data, {
        abortEarly: false
      });

      if (error) {
        failed.push({
          email: data.email,
          error: error.details.map(e => e.message)
        });
        continue;
      }

      const plainPassword = generateRandomPassword(14);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      toInsert.push({
        ...value,
        password: hashedPassword
      });

      emailJobs.push({
        name: value.name,
        email: value.email,
        password: plainPassword
      });
    }

    // ----- DB Insert -----
    let inserted = [];

    if (toInsert.length > 0) {
      try {
        inserted = await DivisionIncharge.insertMany(toInsert, {
          ordered: false
        });
      } catch (err) {
        console.error("Insert error:", err.message);
      }
    }

    // ----- Send emails in batches -----
    const BATCH_SIZE = 5;
    const DELAY = 3000;
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    for (let i = 0; i < emailJobs.length; i += BATCH_SIZE) {
      const batch = emailJobs.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(job =>
          // Send Email
          sendEmailBrevo({
            toEmail: job.email,
            subject: "Division Incharge Account Created",
            htmlContent: `Hello ${job.name},\nYour Division Incharge account has been created.\nEmail: ${job.email}\nPassword: ${job.password}\n`
          }).catch(err => {
                  console.error(`Email failed for ${job.email}`, err.message);
                  failed.push({
                    email: job.email,
                    error: "Email failed"
                  });
                })
        )
      );

      if (i + BATCH_SIZE < emailJobs.length) {
        await sleep(DELAY);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Division Incharge import completed",
      summary: {
        received: filteredData.length,
        inserted: inserted.length,
        emailed: emailJobs.length - failed.length,
        failed: failed.length
      },
      failed
    });

  } catch (err) {
    console.error("Import error:", err);
    return res.status(500).json({
      success: false,
      message: "Error importing division incharge data"
    });
  }
};


module.exports = {
  importDivisionInchargeFromExcel,
  addSingleDivisionIncharge,
  loginDivisionIncharge,
  getMyProfile,
  getSingleDivisionInchargeById,
  getAllDivisionIncharges,
  changeEmailOfDivisionIncharge,
  changeDivisionInchargeDetails,
  deleteDivisionIncharge,
};


