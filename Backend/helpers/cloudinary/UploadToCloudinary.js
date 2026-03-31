
const fs = require("fs").promises;

const upload = require("../../middlewares/multer.js");

const cloudinary = require("../../config/cloudinaryConfig.js");
const errorLogger = require("../winston/errorLogger.js");



const uploadToCloudinary = async (localFilePath) => {
    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: "studentWebsite",
        });

        return {
            url: result.secure_url,
            publicId: result.public_id
        };

    } catch (error) {

        errorLogger(error, null, "UploadToCloudinary helper function")
        throw error;
    } finally {
        try {
            await fs.unlink(localFilePath);
            console.log("Temp file deleted:", localFilePath);
        } catch (err) {
            errorLogger(err, null, "UploadToCloudinary helper function - failed to delete temp file")
        }
    }
}

module.exports = { uploadToCloudinary };