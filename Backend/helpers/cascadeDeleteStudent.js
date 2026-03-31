const { cloudinary } = require("../config/cloudinaryConfig");
const { deleteFromCloudinary } = require("./cloudinary/DeleteFromCloudinary");

const Student = require("../models/Student");
const Achievement = require("../models/Achievement");
const Activity = require("../models/Activity");
const Admission = require("../models/Admission");
const HigherStudies = require("../models/HigherStudies");
const Internship = require("../models/Internship");
const Placement = require("../models/Placement");
const SemesterInfo = require("../models/SemesterInfo");
const errorLogger = require("./winston/errorLogger");


// Helper → Safely read nested field path (e.g., "photoProof.publicId")
const getNestedValue = (obj, path) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);


// Universal Cloudinary file deletion
const deleteCloudinaryFiles = async (documents, fieldPaths) => {
    for (const doc of documents) {
        for (const fieldPath of fieldPaths) {
            const publicId = getNestedValue(doc, fieldPath);
            if (publicId) await deleteFromCloudinary(publicId);
        }
    }
};


// Main CASCADE DELETE function
const cascadeDeleteStudent = async (studentId) => {
    try {
        // STUDENT: Delete Photo
        const student = await Student.findById(studentId);
        if (student?.studentPhoto?.publicId) {
            await deleteFromCloudinary(student.studentPhoto.publicId);
        }


        // ACHIEVEMENTS
        const achievements = await Achievement.find({ stuID: studentId });
        await deleteCloudinaryFiles(achievements, [
            "photographs.eventPhoto.publicId",
            "photographs.certificate.publicId",
            "course_certificate.publicId",
        ]);
        await Achievement.deleteMany({ stuID: studentId });


        // ACTIVITIES
        const activities = await Activity.find({ stuID: studentId });
        await deleteCloudinaryFiles(activities, [
            "certificateURL.publicId",
        ]);
        await Activity.deleteMany({ stuID: studentId });


        // ADMISSIONS
        await Admission.deleteMany({ stuID: studentId });


        // HIGHER STUDIES
        const higherStudies = await HigherStudies.find({ stuID: studentId });
        await deleteCloudinaryFiles(higherStudies, [
            "marksheet.publicId",
            "idCardPhoto.publicId",
        ]);
        await HigherStudies.deleteMany({ stuID: studentId });


        // INTERNSHIP
        const internships = await Internship.find({ stuID: studentId });
        await deleteCloudinaryFiles(internships, [
            "internshipReport.publicId",
            "photoProof.publicId",
        ]);
        await Internship.deleteMany({ stuID: studentId });


        // PLACEMENTS
        const placements = await Placement.find({ stuID: studentId });
        await deleteCloudinaryFiles(placements, [
            "placementProof.publicId",
        ]);
        await Placement.deleteMany({ stuID: studentId });


        // SEMESTER INFO
        await SemesterInfo.deleteMany({ stuID: studentId });


        // FINALLY DELETE STUDENT
        await Student.findByIdAndDelete(studentId);


        console.log("Cascade delete completed for student:", studentId);
        return true;

    } catch (err) {
        errorLogger(err, null, "Error in cascade Delete student helper function")
        return false;
    }
};


module.exports = cascadeDeleteStudent;
