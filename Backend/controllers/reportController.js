const Student = require("../models/Student");
const Placement = require("../models/Placement");
const Internship = require("../models/Internship");
const Achievement = require("../models/Achievement");
const mongoose = require("mongoose");

const getAccreditationReport = async (req, res) => {
    try {
        const { year, branch } = req.query; // academicYear or passoutYear, branch
        
        let studentMatch = {};
        if (branch) studentMatch.branch = branch;
        // For general students, 'year' might be matching academicYear
        // However, year can also be used as passoutYear for Placements.
        if (year) studentMatch.academicYear = year; 
        
        // 1. Get Demographics
        const totalStudents = await Student.countDocuments(studentMatch);
        const demographics = await Student.aggregate([
            { $match: studentMatch },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Filter placements, internships, achievements by branch/year using student IDs
        const studentIds = await Student.find(studentMatch).select('_id');
        const ids = studentIds.map(s => s._id);

        let placementMatch = { stuID: { $in: ids } };
        if (year) {
            placementMatch.passoutYear = year;
        }

        const placementStats = await Placement.aggregate([
            { $match: placementMatch },
            { $group: {
                _id: null,
                totalPlaced: { $sum: 1 },
                maxPackage: { $max: "$package" },
                avgPackage: { $avg: "$package" },
            }}
        ]);

        const topCompanies = await Placement.aggregate([
            { $match: placementMatch },
            { $group: { _id: "$companyName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        let internMatch = { stuID: { $in: ids } };
        const internshipStats = await Internship.aggregate([
            { $match: internMatch },
            { $group: {
                _id: null,
                totalInternships: { $sum: 1 },
                paidCount: { 
                    $sum: { $cond: [{ $eq: ["$stipendInfo.isPaid", true] }, 1, 0] } 
                },
                unpaidCount: { 
                    $sum: { $cond: [{ $eq: ["$stipendInfo.isPaid", false] }, 1, 0] } 
                }
            }}
        ]);

        let achieveMatch = { stuID: { $in: ids } };
        const achievementStats = await Achievement.aggregate([
            { $match: achieveMatch },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const achievementTypes = await Achievement.aggregate([
            { $match: achieveMatch },
            { $group: { _id: "$achievementType", count: { $sum: 1 } } }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                demographics: {
                    total: totalStudents,
                    categories: demographics
                },
                placements: {
                    stats: placementStats[0] || { totalPlaced: 0, maxPackage: 0, avgPackage: 0 },
                    topCompanies
                },
                internships: internshipStats[0] || { totalInternships: 0, paidCount: 0, unpaidCount: 0 },
                achievements: {
                    byCategory: achievementStats,
                    byType: achievementTypes
                }
            }
        });

    } catch (error) {
        console.error("Error generating report:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getAccreditationReport
};
