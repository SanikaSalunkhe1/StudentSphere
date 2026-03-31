const Placement = require("../models/Placement");
const Student = require("../models/Student");
const cloudinary = require("../config/cloudinaryConfig");
const {createPlacementSchema, updatePlacementSchema, getPlacementsValidation, validateStudentID} = require("../validators/placementValidation");
const { deleteMultipleFromCloudinary } = require("../helpers/cloudinary/DeleteMultipleFromCloudinary");
const {deleteFromCloudinary} = require("../helpers/cloudinary/DeleteFromCloudinary");
const { validateAndUploadFiles } = require("../helpers/cloudinary/ValidateAndUploadFiles");
const mongoose= require("mongoose");
const exportToExcel = require('../helpers/excel/exportToExcel');
const { transformPlacement, placementColumnMap } = require('../helpers/excel/exportTransformers');
const errorLogger = require("../helpers/winston/errorLogger")

const fileConfigs = [
  {
    fieldName: "placementProof",
    allowedTypes: ["application/pdf"],
    maxSize: 500 * 1024, // 500KB
    friendlyName: "Placement Proof"
  }
];

// CREATE PLACEMENT 
const createPlacement = async (req, res) => {

	let uploadedFiles;
	let dbSaved = false;

	try {
		let stuID;

		if (req.user.role === "student") {
			stuID = req.user.id;
		} 
		else if (req.user.role === "admin" || req.user.role === "divisionIncharge") {
			// Validate input using Joi
            const { value, error } = validateStudentID.validate({studentID: req.body.studentId}, { abortEarly: false });
            if (error) {
                console.log(error);
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

			const student = await Student.findOne({studentID : value.studentID});
			if (!student) {
				return res.status(404).json({ success: false, message: "Student not found. Cannot create placement." });
			}

			if(req.user.role === "divisionIncharge"){
				if(student.year !== req.user.year || student.division !== req.user.division){
					return res.status(403).json({ success: false, message: "You can access students of only your division." });
				}
			}

			stuID = student._id;
		}else{
			return res.status(403).json({ success: false, message: "Unauthorised access." });
		}


		// Joi Validation
		const { error, value: validatedData } = createPlacementSchema.validate(req.body, { abortEarly: false });

		if (error) {
			const validationErrors = error.details.map(err => ({
				field: err.path[0],
				message: err.message
			}));

			return res.status(400).json({ success: false, message: "Validation failed", errors: validationErrors });
		}

		const { companyName, role, placementType, package, placementYear, passoutYear, joiningYear } = validatedData;

		// Logical year validation
		const extractStartYear = (year) => Number(year.split("-")[0]);

		if (extractStartYear(placementYear) > extractStartYear(joiningYear)) {
			return res.status(400).json({ success: false, message: "Placement Year cannot be greater than Joining Year" });
		}

		if (extractStartYear(passoutYear) < extractStartYear(placementYear)) {
			return res.status(400).json({ success: false, message: "Passout Year cannot be before Placement Year" });
		}

		if (extractStartYear(passoutYear) > extractStartYear(joiningYear)) {
			return res.status(400).json({ success: false, message: "Passout Year cannot be after Joining Year" });
		}

		if (!req.files?.placementProof) {
			return res.status(400).json({ success: false, message: "Placement proof is required" });
		}


		// Upload & Validate File via Helper
		uploadedFiles = await validateAndUploadFiles(req.files, fileConfigs);

		// Create Placement in DB
		const placement = new Placement({
			stuID,
			...validatedData,
			placementProof: {
				url: uploadedFiles.placementProof.url,
				publicId: uploadedFiles.placementProof.publicId
			}
		});

		await placement.save();
		dbSaved = true;

		return res.status(201).json({ success: true, message: "Placement added successfully", placement });

	} catch (err) {
		errorLogger(err,req, "Create Placement Controller")
       
		// Rollback cloudinary upload if DB save fails
		if (!dbSaved && uploadedFiles) {
			const publicIds = Object.values(uploadedFiles).map(file => file.publicId);
			await deleteMultipleFromCloudinary(publicIds);
		}

		return res.status(500).json({ success: false, message: "Server Error. Please try again later." });
	}
};


// UPDATE PLACEMENT
const updatePlacement = async (req, res) => {

	let uploadedFiles = null;
	let dbSaved = false;

	try {

		const { placementId } = req.params;

		if(!placementId || !mongoose.Types.ObjectId.isValid(placementId)){
			return res.status(400).json({ success: false, message: "Placement ID required in valid format." });
		}

		let query = Placement.findById(placementId);
		if (req.user.role !== "student") {
			query = query.populate("stuID", "year division");
		}
		
		const existingPlacement = await query; // execute once

		if (!existingPlacement) {
			return res.status(404).json({ success: false, message: "Placement not found" });
		}

		if (req.user.role === "student") {
			if (existingPlacement.stuID.toString() !== req.user.id.toString()) {
				return res.status(403).json({ success: false, message: "Resource does not belong to logged in student." });
			}
		} else if (req.user.role === "divisionIncharge") {
			if (existingPlacement.stuID.year !== req.user.year || existingPlacement.stuID.division !== req.user.division) {
				return res.status(403).json({ success: false, message: "You can only access students in your division." });
			}
		} else if (req.user.role !== "admin") {
			return res.status(403).json({ success: false, message: "Wrong Role." });
		}

		// Extract body
		let { companyName, role, placementType, package, placementYear, passoutYear, joiningYear } = req.body;

		// Joi validation
		const { error, value: updatedData } = updatePlacementSchema.validate({
			companyName,
			role,
			placementType,
			package,
			placementYear,
			passoutYear,
			joiningYear
		}, { abortEarly: false });

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

		// Logical validation
		const extractStartYear = (year) => Number(year.split("-")[0]);


		const placementYearFinal = updatedData.placementYear || existingPlacement.placementYear;
		const passoutYearFinal = updatedData.passoutYear || existingPlacement.passoutYear;
		const joiningYearFinal = updatedData.joiningYear || existingPlacement.joiningYear;

		if (extractStartYear(placementYearFinal) > extractStartYear(joiningYearFinal)) {
			return res.status(400).json({ success: false, message: "Placement Year cannot be greater than Joining Year" });
		}

		if (extractStartYear(passoutYearFinal) < extractStartYear(placementYearFinal)) {
			return res.status(400).json({ success: false, message: "Passout Year cannot be before Placement Year" });
		}

		if (extractStartYear(passoutYearFinal) > extractStartYear(joiningYearFinal)) {
			return res.status(400).json({ success: false, message: "Passout Year cannot be after Joining Year" });
		}


		// File Handling

		let oldPublicIdToDelete = null;

		if (req.files && Object.keys(req.files).length > 0) {

			uploadedFiles = await validateAndUploadFiles(req.files, fileConfigs);

			if (uploadedFiles.placementProof) {

				// Store old file id but DO NOT delete yet
				oldPublicIdToDelete = existingPlacement.placementProof?.publicId;

				updatedData.placementProof = {
					url: uploadedFiles.placementProof.url,
					publicId: uploadedFiles.placementProof.publicId
				};
			}
		}

		if (Object.keys(updatedData).length === 0) {
			return res.status(400).json({ success: false, message: "No valid fields provided for update" });
		}

		const updatedPlacement = await Placement.findByIdAndUpdate(
			placementId,
			{ $set: updatedData },
			{ new: true, runValidators: true }
		);

		if (!updatedPlacement) {
			return res.status(404).json({ success: false, message: "Placement not found." });
		}

		dbSaved = true;

		// Delete old Cloudinary file ONLY after DB success
		if (oldPublicIdToDelete) {
			await deleteFromCloudinary(oldPublicIdToDelete).catch((err) => {
				console.error(
					`Error deleting old placementProof (id=${oldPublicIdToDelete}) after DB update:`,
					err
				);
			});
		}

		return res.status(200).json({
			success: true,
			message: "Placement updated successfully",
			data: updatedPlacement
		});
	} catch (err) {

		errorLogger(err,req, "Update Placement Controller")

		// Rollback uploaded file if DB fails
		if (!dbSaved && uploadedFiles) {
			const publicIds = Object.values(uploadedFiles).map(file => file.publicId);
			await deleteMultipleFromCloudinary(publicIds);
		}

		return res.status(500).json({ success: false, message: "Some Error Occurred. Please try again later." });
	}
};


const getPlacements = async (req, res) => {
	try {
		const year = req.query.year?.trim();
		const division = req.query.division?.trim();
		const search = req.query.search?.trim();
		const placementType = req.query.placementType?.trim();
		const page = req.query.page;
		const limit = req.query.limit;
		const exportFlag = req.query.export;
		// NEW
		const placementYear = req.query.placementYear?.trim();
		const passoutYear   = req.query.passoutYear?.trim();
		const joiningYear   = req.query.joiningYear?.trim();
		const packageMin    = req.query.packageMin;
		const packageMax    = req.query.packageMax;

		const { error, value } = getPlacementsValidation.validate(
			{ year, division, search, page, limit, placementType, export: exportFlag,placementYear, passoutYear, joiningYear, packageMin, packageMax },
			{ abortEarly: false }
		);
		if (error) {
			const validationErrors = error.details.map(err => ({
				field: err.path[0],
				message: err.message
			}));
			return res.status(400).json({ success: false, message: "Validation failed", errors: validationErrors });
		}

		const isExport = value.export === 'true';

		if (req.user.role === "divisionIncharge") {
			if ((year && year !== req.user.year) || (division && division !== req.user.division)) {
				return res.status(403).json({ success: false, message: "You can only access students of your division." });
			}
		}

		const pageNum = value.page || 1;
		const limitNum = Math.min(value.limit || 10, 20);
		const skip = (pageNum - 1) * limitNum;

		const pipeline = [];

		pipeline.push({
			$lookup: {
				from: "students",
				localField: "stuID",
				foreignField: "_id",
				as: "student"
			}
		});

		pipeline.push({ $unwind: { path: "$student", preserveNullAndEmptyArrays: true } });

		const match = {};

		if (req.user.role === "divisionIncharge") {
			match["student.year"] = req.user.year;
			match["student.division"] = req.user.division;
		} else if (req.user.role === "admin") {
			if (year) match["student.year"] = year.trim();
			if (division) match["student.division"] = division.trim();
		} else {
			return res.status(403).json({ success: false, message: "Unauthorized role." });
		}

		// Exact match on year strings
		if (value.placementYear) match.placementYear = value.placementYear;
		if (value.passoutYear)   match.passoutYear   = value.passoutYear;
		if (value.joiningYear)   match.joiningYear   = value.joiningYear;

		// Range filter on package
		if (value.packageMin !== undefined || value.packageMax !== undefined) {
			match.package = {};
			if (value.packageMin !== undefined) match.package.$gte = value.packageMin;
			if (value.packageMax !== undefined) match.package.$lte = value.packageMax;
		}

		if (search) {
			// const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
			const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			match.$or = [
				{ companyName: { $regex: safeSearch, $options: "i" } },
				{ role: { $regex: safeSearch, $options: "i" } },
				{ "student.studentID": { $regex: safeSearch, $options: "i" } },
				{ "student.name.firstName": { $regex: safeSearch, $options: "i" } },
				{ "student.name.middleName": { $regex: safeSearch, $options: "i" } },
				{ "student.name.lastName": { $regex: safeSearch, $options: "i" } },
			];
		}

		if (placementType) match.placementType = placementType;

		if (Object.keys(match).length) pipeline.push({ $match: match });

		// Export branch fields
		const exportFields = {
			companyName:        1,
			role:               1,
			placementType:      1,
			package:            1,
			placementYear:      1,
			passoutYear:        1,
			joiningYear:        1,
			placementProof:     "$placementProof.url",
			stuID:              "$student._id",
			studentID:          "$student.studentID",
			PRN:                "$student.PRN",
			studentName:        "$student.name",
			studentYear:        "$student.year",
			studentDivision:    "$student.division",
			studentBranch:      "$student.branch",
			studentDob:         "$student.dob",
			studentBloodGroup:  "$student.bloodGroup",
			studentCategory:    "$student.category",
			studentAbcId:       "$student.abcId",
			studentMobileNo:    "$student.mobileNo",
			studentParentMobileNo: "$student.parentMobileNo",
			studentEmail:       "$student.email",
			studentParentEmail: "$student.parentEmail",
			studentCurrentAddress: "$student.currentAddress",
			studentNativeAddress:  "$student.nativeAddress",
		};

		// Lean (paginated) fields
		const leanFields = {
			companyName:    1,
			role:           1,
			placementType:  1,
			package:        1,
			placementYear:  1,
			passoutYear:    1,
			joiningYear:    1,
			placementProof: "$placementProof.url",
			stuID:          "$student._id",
			studentName:    "$student.name",
			studentYear:    "$student.year",
		};

		// Export branch
		if (isExport) {
			const placements = await Placement.aggregate([
				...pipeline,
				{ $sort: { createdAt: -1 } },
				{ $project: exportFields },
			]);

			const rows = placements.map(transformPlacement);
			const buffer = await exportToExcel(rows, 'Placements', placementColumnMap);
			if (!buffer) return res.status(500).json({ success: false, message: 'Export failed.' });

			res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			res.setHeader('Content-Disposition', 'attachment; filename="placements.xlsx"');
			return res.send(buffer);
		}

		// Paginated branch
		const results = await Placement.aggregate([
			...pipeline,
			{
				$facet: {
					data: [
						{ $sort: { createdAt: -1 } },
						{ $skip: skip },
						{ $limit: limitNum },
						{ $project: leanFields }
					],
					totalCount: [{ $count: "total" }]
				}
			}
		]);

		const placements = results[0]?.data || [];
		const total = results[0]?.totalCount[0]?.total || 0;

		return res.json({
			success: true,
			data: placements,
			total,
			page: pageNum,
			totalPages: Math.ceil(total / limitNum),
		});

	} catch (err) {
		errorLogger(err,req, "Get Placements Controller")
		return res.status(500).json({ success: false, message: "Some Error Occurred. Please Try Again Later." });
	}
};


// DELETE PLACEMENT
const deletePlacement = async (req, res) => {
	try {
		

		const { placementId } = req.params;


		if (!placementId || !mongoose.Types.ObjectId.isValid(placementId)) {
			return res.status(400).json({ success: false, message: "Invalid Placement ID" });
		}


		let query = Placement.findById(placementId);
		if (req.user.role !== "student") {
			query = query.populate("stuID", "year division");
		}
		
		const existingPlacement = await query; // execute once
		if (!existingPlacement) {
			return res.status(404).json({ success: false, message: "Placement not found" });
		}

		if (req.user.role === "student") {
			if (existingPlacement.stuID.toString() !== req.user.id.toString()) {
				return res.status(403).json({ success: false, message: "Resource does not belong to logged in student." });
			}
		} else if (req.user.role === "divisionIncharge") {
			if (existingPlacement.stuID.year !== req.user.year || existingPlacement.stuID.division !== req.user.division) {
				return res.status(403).json({ success: false, message: "You can only access students in your division." });
			}
		} else if (req.user.role !== "admin") {
			return res.status(403).json({ success: false, message: "Wrong Role." });
		}

		const delResult = await Placement.findByIdAndDelete(placementId);

		if(!delResult){
			return res.status(404).json({success : false, message: "Delete failed."});
		}
		

		// Delete Cloudinary proof file
		if ( delResult?.placementProof?.publicId) {
			try{
				await cloudinary.uploader.destroy(delResult.placementProof.publicId)
			}catch(err){
				console.error("Cloudinary delete failed:", err);
			}
		}

		
		return res.status(200).json({ success: true, message: "Placement deleted successfully" });
	} catch (err) {
		errorLogger(err,req, "Delete Placement Controller")
        return res.status(500).json({ success: false, message:  "Server Error. Please Try Again Later." });
    }
	
};

//GET PLACEMENTS (search by placement fields & student name + year filter + pagination) --admin or divisionIncharge
const getPlacements2 = async (req, res) => {
	try {
		// Get and trim query params
		const year = req.query.year?.trim();
		const division = req.query.division?.trim();
		const search = req.query.search?.trim();
		const placementType = req.query.placementType?.trim();
		const page = req.query.page;
		const limit = req.query.limit;

		// Validate input
		const { error, value } = getPlacementsValidation.validate(
			{ year, search, page, limit, placementType },
			{ abortEarly: false }
		);
		if (error) {
			const validationErrors = error.details.map(err => ({
				field: err.path[0],
				message: err.message
			}));
			return res.status(400).json({ success: false, message: "Validation failed", errors: validationErrors });
		}

		if(req.user.role === "divisionIncharge"){
            if((year && year !== req.user.year) || (division &&  division !== req.user.division) ){
                return res.status(403).json({ success: false, message: "You can only access students  of your division."});
            }
        }

		const pageNum = value.page || 1;
		const limitNum = Math.min(value.limit || 10, 20);
		const skip = (pageNum - 1) * limitNum;

		// Build aggregation pipeline
		const pipeline = [];

		// Lookup student details
		pipeline.push({
			$lookup: {
				from: "students",
				localField: "stuID",
				foreignField: "_id",
				as: "student"
			}
		});

		// Unwind student array safely
		pipeline.push({ $unwind: { path: "$student", preserveNullAndEmptyArrays: true } });

		// Build match conditions
		const match = {};

		 // Division Incharge filter
        if (req.user.role === "divisionIncharge") {
            match["student.year"] = req.user.year;
            match["student.division"] = req.user.division;
        }else if(req.user.role === "admin"){
            if (year) {
                match["student.year"] = year.trim();
            }

            if (division) {
                match["student.division"] = division.trim();
            }

        }else{
            return res.status(403).json({ success: false, message: "Unautorized role.", });
        }

		if (search) {
			const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
			match.$or = [
				{ companyName: { $regex: safeSearch, $options: "i" } },
				{ role: { $regex: safeSearch, $options: "i" } },
				{ "student.name.firstName": { $regex: safeSearch, $options: "i" } },
				{ "student.name.middleName": { $regex: safeSearch, $options: "i" } },
				{ "student.name.lastName": { $regex: safeSearch, $options: "i" } },
			];
		}

		if (placementType) match.placementType = placementType;

		if (Object.keys(match).length) pipeline.push({ $match: match });

		// Use $facet for pagination + total count
		const results = await Placement.aggregate([
			...pipeline,
			{
				$facet: {
					data: [
						{ $sort: { createdAt: -1 } },
						{ $skip: skip },
						{ $limit: limitNum },
						{
							$project: {
								companyName: 1,
								role: 1,
								placementType: 1,
								placementProof: "$placementProof.url", // only expose url
								stuID: "$student._id",
								studentName: "$student.name",
								studentYear: "$student.year"
							}
						}
					],
					totalCount: [{ $count: "total" }]
				}
			}
		]);

		const placements = results[0]?.data || [];
		const total = results[0]?.totalCount[0]?.total || 0;

		return res.json({
			success: true,
			data: placements,
			total,
			page: pageNum,
			totalPages: Math.ceil(total / limitNum),
		});

	} catch (err) {
		console.error("Error in getPlacements controller: ", "\ntime = ", new Date().toISOString(), "\nError: ", err);
		return res.status(500).json({ success: false, message: "Server Error. Please Try Again Later." });
	}
};



// GET STUDENT'S OWN PLACEMENTS --student only
const getOwnPlacements = async (req, res) => {
	try {
		let studentId = req.user.id;

		if(!studentId){
			return res.status(400).json({success:false, message:"student Id is required."});
		}
		
		
		if (!mongoose.Types.ObjectId.isValid(studentId)) {
			return res.status(400).json({ success: false, message: "Invalid Student ID format"});
		}
		

		const placements = await Placement.find({ stuID: studentId }).sort({ createdAt: -1 }).lean();
		return res.status(200).json({ success: true, data: placements });
	} catch (err) {
		errorLogger(err,req, "Get own Placement Controller")
        return res.status(500).json({ success: false, message: "Server Error. Please Try Again Later." });
    
	}
};

// GET STUDENT'S PLACEMENTS --admin or division incharge
const getPlacementsByStudentId = async (req, res) => {
	try {

		const { studentId } = req.params;
		if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
			return res.status(400).json({ success: false, message: "Student ID is required in valid format." });
		}


		if(req.user.role === "divisionIncharge"){
			const student = await Student.findById(studentId);

			if(!student){
				return res.status(404).json({ success: false, message: "Student not found." });
			}

			if(student.year !== req.user.year || student.division !== req.user.division){
				return res.status(403).json({success : false, message: "You can only access students of your own division."});
			}
		}

		const placements = await Placement.find({ stuID: studentId }).sort({ createdAt: -1 }).lean();


		return res.status(200).json({ success: true, data: placements });
	} catch (err) {
		errorLogger(err,req, "Get Placements by studnet id Controller")
        return res.status(500).json({ success: false, message: "Server Error. Please Try Again Later." });
	}
};

// GET SINGLE PLACEMENT --student or admin or divisionIncharge
const getSinglePlacement = async (req, res) => {
  try {
	
		const { placementId } = req.params;
		if (!placementId) {
			return res.status(400).json({ success: false, message: "Placement ID is required" });
		}

		if (!mongoose.Types.ObjectId.isValid(placementId)) {
			return res.status(400).json({ success: false, message: "Invalid placement ID format"});
		}

		let query = Placement.findById(placementId);
		if (req.user.role !== "student") {
			query = query.populate("stuID", "year division");
		}
		
		const existingPlacement = await query.lean(); // execute once
		if (!existingPlacement) {
			return res.status(404).json({ success: false, message: "Placement not found" });
		}

		if (req.user.role === "student") {
			if (existingPlacement.stuID.toString() !== req.user.id.toString()) {
				return res.status(403).json({ success: false, message: "Resource does not belong to logged in student." });
			}
		} else if (req.user.role === "divisionIncharge") {
			if (existingPlacement.stuID.year !== req.user.year || existingPlacement.stuID.division !== req.user.division) {
				return res.status(403).json({ success: false, message: "You can only access students in your division." });
			}
		} else if (req.user.role !== "admin") {
			return res.status(403).json({ success: false, message: "Wrong Role." });
		}


		return res.status(200).json({ success: true, data: existingPlacement });
	} catch (err) {
		errorLogger(err,req, "Get single Placement Controller")
        return res.status(500).json({ success: false, message:  "Server Error. Please Try Again Later." });
	}
};


module.exports = {
	createPlacement,
	updatePlacement,
	deletePlacement,
	getPlacements,
	getOwnPlacements,
	getPlacementsByStudentId,
	getSinglePlacement,
};
