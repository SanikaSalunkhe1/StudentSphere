const cloudinary = require("../../config/cloudinaryConfig.js");
const { insertFailedCloudinaryDeletion } = require("../failedCloudinaryDeletetion/insertFailedCloudinaryDeletion.js");
const errorLogger = require("../winston/errorLogger.js")
const deleteFromCloudinary = async (publicId) => {

	if (!publicId || typeof publicId !== "string" || publicId.trim() === "") {
		return;
	}

	try {

		const result = await cloudinary.uploader.destroy(publicId);

		if (result.result === "ok" || result.result === "not found") {
			console.log(`✅ Cloudinary deletion successful: ${publicId}`);
			return;
		}

		console.error(`⚠️ Cloudinary deletion issue for ${publicId}:`, result);

		await insertFailedCloudinaryDeletion([
			{
				publicId,
				reason: result.result || "Unknown error"
			}
		]);

	} catch (err) {

		errorLogger(err,null, "Delete From Cloudinary Helper function");

		await insertFailedCloudinaryDeletion([
			{
				publicId,
				reason: err.message
			}
		]);
	}
};

module.exports = { deleteFromCloudinary };