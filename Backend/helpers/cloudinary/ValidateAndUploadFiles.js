const fs = require("fs").promises;
const cloudinary = require("../../config/cloudinaryConfig");
const { deleteMultipleFromCloudinary } = require("./DeleteMultipleFromCloudinary");
const { insertFailedCloudinaryDeletion } = require("../failedCloudinaryDeletetion/insertFailedCloudinaryDeletion");
const { fileTypeFromBuffer } = require("file-type");

const validateAndUploadFiles = async (filesObj, fileConfigs) => {
    const uploadedFiles = {};
    const uploadedPublicIds = [];

    try {
        //  VALIDATION 
        for (let config of fileConfigs) {
            const { fieldName, allowedTypes, maxSize, friendlyName } = config;

            const file = filesObj?.[fieldName]?.[0];
            if (!file) throw new Error(`${friendlyName} is required`);

            if (!allowedTypes.includes(file.mimetype)) {
                throw new Error(
                    `${friendlyName} must be one of: ${allowedTypes.join(", ")}`
                );
            }

            if (file.size > maxSize) {
                throw new Error(
                    `${friendlyName} exceeds max size.`
                );
            }

            // Magic Bytes Validation
            const buffer = await fs.readFile(file.path);
            const type = await fileTypeFromBuffer(buffer);

            if (!type || !allowedTypes.includes(type.mime)) {
                throw new Error(`${friendlyName} file content is invalid`);
            }
        }

        //  PARALLEL UPLOAD 
        const uploadPromises = fileConfigs.map(async (config) => {
            const { fieldName } = config;
            const file = filesObj?.[fieldName]?.[0];
            const uploadOptions = {
                folder: "StudentSphere",
                resource_type: "auto",
                access_mode: "public",
                ...(config.cloudinaryOptions || {}) // merge extra options if provided
            };

            try {
                
                const result = await cloudinary.uploader.upload(file.path, uploadOptions);

                uploadedFiles[fieldName] = {
                    url: result.secure_url,
                    publicId: result.public_id,
                };

                uploadedPublicIds.push(result.public_id);

            } catch (err) {

                throw new Error(`Failed to upload ${fieldName}: ${err.message}`);
                
            }finally {
                //delete temp file in every case whether upload was successful or not.
                await fs.unlink(file.path).catch((err) => {
                    console.error("Error Deleting temp file on server : ", err);
                });
            }
        });

        await Promise.all(uploadPromises);

        return uploadedFiles;

    } catch (err) {
        //  ROLLBACK 
        if (uploadedPublicIds.length > 0) {

            const result = await deleteMultipleFromCloudinary(uploadedPublicIds);

            if (result.failed.length > 0) {
                await insertFailedCloudinaryDeletion(result.failed);
            }
        }

        throw err;
    }
};

module.exports = { validateAndUploadFiles };
