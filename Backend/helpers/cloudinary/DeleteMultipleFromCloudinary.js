const cloudinary = require("../../config/cloudinaryConfig");
const {insertFailedCloudinaryDeletion} = require("../failedCloudinaryDeletetion/insertFailedCloudinaryDeletion");
const errorLogger = require("../winston/errorLogger");

const deleteMultipleFromCloudinary = async (publicIds = []) => {

    // Filter out invalid IDs
    const validPublicIds = publicIds.filter(id => typeof id === "string" && id.trim() !== "");

    if (validPublicIds.length === 0) {
        return { deleted: [], failed: [] };
    }

    try {
        const result = await cloudinary.api.delete_resources(validPublicIds);

        const deleted = [];
        const failed = [];

        // Cloudinary returns result.resources object
        for (let id of validPublicIds) {
            const status = result.deleted[id];

            if (status === "deleted") {
                deleted.push(id);
            } else {
                failed.push({ publicId: id, reason: status || "Unknown error" });
            }
        }

        // Store failed deletions automatically
        if (failed.length > 0) {
            await insertFailedCloudinaryDeletion(failed);
        }

        return { deleted, failed };

    } catch (err) {
    
        errorLogger(err, null, "Cloudinary BUlk deleteion error")

        // If the whole bulk request fails, mark all as failed
        const failed = validPublicIds.map(id => ({
            publicId: id,
            reason: err.message
        }));

        // Store failures in DB
        await insertFailedCloudinaryDeletion(failed);

        return {
            deleted: [],
            failed
        };
    }
};

module.exports = { deleteMultipleFromCloudinary };
