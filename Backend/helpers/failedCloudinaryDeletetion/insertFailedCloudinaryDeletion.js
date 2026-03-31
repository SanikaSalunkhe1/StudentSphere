const FailedCloudinaryDeletion = require("../../models/FailedCloudinaryDeletion");
const errorLogger = require("../winston/errorLogger");

const insertFailedCloudinaryDeletion = async (files = []) => {
    try {

        if (!Array.isArray(files) || files.length === 0) return;

        // Filter valid entries
        const validFiles = files.filter(file =>
            file &&
            typeof file.publicId === "string" &&
            file.publicId.trim() !== "" 
        );

        if (validFiles.length === 0) return;

        // Insert all failures
        await FailedCloudinaryDeletion.insertMany(validFiles);

    } catch (err) {
        errorLogger(err, null, "Error in insertFailedCloudinary Deletions helper")
    }
};

module.exports = { insertFailedCloudinaryDeletion };