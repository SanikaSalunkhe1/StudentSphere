const Joi = require("../helpers/profanity/joiWithProfanity");

// Define the allowed reasons in a constant for easy reuse
const MAHADBT_NOT_FILLED_REASONS = [
  "Not Eligible",
  "Awaiting Documents",
  "Technical Issue in mahadbt website",
  "Process in Progress",
];

const textWithNumberRegex = /^(?!\d+$)[A-Za-z0-9\s.,!?'\-]+$/;

// CREATE ADMISSION
const admissionCreateSchema = Joi.object({
  
  rollno: Joi.string()
    .trim()
    .pattern(/^\d+$/)
    .max(10)
    .required()
    .messages({
      "string.max": "Roll number cannot exceed 10 characters.",
      "string.pattern.base": "Roll number must contain only digits.",
      "string.empty": "Roll number cannot be empty.",
      "any.required": "Roll number is required."
    }),

  course: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(2)
    .max(100)
    .noProfanity()
    .default("Computer Engineering")
    .messages({
      "string.empty": "Course name cannot be empty.",
      "string.min": "Course name must be at least 2 characters long.",
      "string.max": "Course name cannot exceed 100 characters.",
      "string.pattern.base":
        "Course name must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.noProfanity": "Course name contains inappropriate language."
    }),

  fees: Joi.number()
    .min(0)
    .max(9999999)
    .required()
    .messages({
      "number.base": "Fees must be a valid number.",
      "number.min": "Fees cannot be negative.",
      "number.max": "Fees cannot exceed 9,999,999.",
      "any.required": "Fees are required."
    }),

  isScholarshipApplied: Joi.boolean()
    .default(false)
    .messages({
      "boolean.base": "Scholarship status must be true or false."
    }),

  scholarshipNotAppliedReason: Joi.when("isScholarshipApplied", {
    is: false,
    then: Joi.string()
      .trim()
      .min(5)
      .max(100)
      .noProfanity()
      .required()
      .messages({
        "any.required": "Reason for not applying for scholarship is required when scholarship is not applied.",
        "string.min": "Reason for not applying for scholarship must be at least 5 characters long.",
        "string.empty": "Reason cannot be empty."
      }),
    otherwise: Joi.forbidden()
  }),

  isMahadbtFormSubmitted: Joi.boolean()
    .default(false)
    .messages({ "boolean.base": "MahaDBT status must be true or false." }),

  mahadbtFilledDate: Joi.when("isMahadbtFormSubmitted", {
    is: true,
    then: Joi.date().max('now').required().messages({
      "date.max" : "MahaDBT form filled date cannot be in the future.",
      "any.required": "MahaDBT form filled date is required.",
      "date.base": "MahaDBT form filled date must be a valid date."
    }),
    otherwise: Joi.forbidden()
  }),

  mahadbtNotFilledReason: Joi.when("isMahadbtFormSubmitted", {
    is: false,
    then: Joi.string()
      .trim()
      .valid(...MAHADBT_NOT_FILLED_REASONS)
      .required()
      .messages({
        "any.only": "Please select a valid reason from the list.",
        "any.required": "Reason is required if MahaDBT form is not submitted.",
        "string.empty": "Reason cannot be empty."
      }),
    otherwise: Joi.forbidden()
  }),

  hasMigrationCertificate: Joi.boolean()
    .default(false)
    .messages({ "boolean.base": "Migration certificate status must be true or false." }),

  migrationExpectedDate: Joi.when("hasMigrationCertificate", {
    is: true,
    then: Joi.date().required().messages({
      "any.required": "Migration expected date is required.",
      "date.base": "Migration expected date must be a valid date."
    }),
    otherwise: Joi.forbidden()
  }),

  migrationNotAvailableReason: Joi.when("hasMigrationCertificate", {
    is: false,
    then: Joi.string()
      .trim()
      .min(5)
      .max(100)
      .noProfanity()
      .required()
      .messages({
        "any.required": "Reason is required if migration certificate is not available.",
        "string.min": "Reason must be at least 5 characters long.",
        "string.empty": "Reason cannot be empty."
      }),
    otherwise: Joi.forbidden()
  })
}).options({
  stripUnknown: true,
  convert: true,
  abortEarly: false
});


// UPDATE ADMISSION => student | pending only
const admissionUpdateSchema = Joi.object({
  rollno: Joi.string()
    .trim()
    .pattern(/^\d+$/)
    .max(10)
    .optional()
    .messages({
      "string.max": "Roll number cannot exceed 10 characters.",
      "string.pattern.base": "Roll number must contain only digits.",
      "string.empty": "Roll number cannot be empty."
    }),

  course: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(2)
    .max(100)
    .noProfanity()
    .optional()
    .messages({
      "string.empty": "Course name cannot be empty.",
      "string.min": "Course name must be at least 2 characters long.",
      "string.max": "Course name cannot exceed 100 characters.",
      "string.pattern.base":
        "Course name must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.noProfanity": "Course name contains inappropriate language."
    }),

  fees: Joi.number()
    .min(0)
    .max(9999999)
    .optional()
    .messages({
      "number.base": "Fees must be a valid number.",
      "number.min": "Fees cannot be negative.",
      "number.max": "Fees cannot exceed 9,999,999."
    }),

  isScholarshipApplied: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": "Scholarship status must be true or false."
    }),

  // FIX: Use Joi.optional().strip() in `otherwise` so that when `isScholarshipApplied`
  // is NOT re-sent in the request (undefined), the field is silently accepted/stripped
  // instead of being blocked by Joi.forbidden(). This allows admin to send only
  // `scholarshipNotAppliedReason` without repeating the parent boolean.
  scholarshipNotAppliedReason: Joi.when("isScholarshipApplied", {
    is: false,
    then: Joi.string()
      .trim()
      .min(5)
      .max(100)
      .noProfanity()
      .required()
      .messages({
        "any.required": "Reason is required if scholarship is not applied.",
        "string.min": "Reason must be at least 5 characters long.",
        "string.empty": "Reason cannot be empty."
      }),
    otherwise: Joi.optional().strip()  // undefined or true → silently drop
  }),

  isMahadbtFormSubmitted: Joi.boolean()
    .optional()
    .messages({ "boolean.base": "MahaDBT status must be true or false." }),

  mahadbtFilledDate: Joi.when("isMahadbtFormSubmitted", {
    is: true,
    then: Joi.date().max('now').required().messages({
      "date.max": "MahaDBT form filled date cannot be in the future.",
      "any.required": "MahaDBT form filled date is required.",
      "date.base": "MahaDBT form filled date must be a valid date."
    }),
    is: false,
    then: Joi.optional().strip(),
    otherwise: Joi.date().max('now').optional().messages({
      "date.max": "MahaDBT form filled date cannot be in the future.",
      "date.base": "MahaDBT form filled date must be a valid date."
    })
  }),

  // FIX: Same pattern — when parent boolean is absent, strip instead of forbid.
  mahadbtNotFilledReason: Joi.when("isMahadbtFormSubmitted", {
    is: false,
    then: Joi.string()
      .trim()
      .valid(...MAHADBT_NOT_FILLED_REASONS)
      .required()
      .messages({
        "any.only": "Please select a valid reason from the list.",
        "any.required": "Reason is required if MahaDBT form is not submitted.",
        "string.empty": "Reason cannot be empty."
      }),
    otherwise: Joi.optional().strip()  // undefined or true → silently drop
  }),

  hasMigrationCertificate: Joi.boolean()
    .optional()
    .messages({ "boolean.base": "Migration certificate status must be true or false." }),

  //Same pattern for migrationExpectedDate — allow update without re-sending
  // hasMigrationCertificate. When it's absent (undefined), treat as optional.
  migrationExpectedDate: Joi.when("hasMigrationCertificate", {
    is: true,
    then: Joi.date().required().messages({
      "any.required": "Migration expected date is required.",
      "date.base": "Migration expected date must be a valid date."
    }),
    is: false,
    then: Joi.optional().strip(),
    otherwise: Joi.date().optional().messages({
      "date.base": "Migration expected date must be a valid date."
    })
  }),

  // Same pattern — strip instead of forbid when parent boolean is absent.
  migrationNotAvailableReason: Joi.when("hasMigrationCertificate", {
    is: false,
    then: Joi.string()
      .trim()
      .min(5)
      .max(100)
      .noProfanity()
      .required()
      .messages({
        "any.required": "Reason is required if migration certificate is not available.",
        "string.min": "Reason must be at least 5 characters long.",
        "string.empty": "Reason cannot be empty."
      }),
    otherwise: Joi.optional().strip()  // undefined or true → silently drop
  })
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update."
  })
  .options({
    stripUnknown: true,
    convert: true,
    abortEarly: false
  });


// UPDATE ADMISSION STATUS => admin | DI
const admissionStatusSchema = Joi.object({
  status: Joi.string()
    .trim()
    .valid("approved", "rejected")
    .required()
    .messages({
      "any.required": "Status is required.",
      "any.only": "Please select a valid status.",
      "string.empty": "Status cannot be empty."
    })
}).options({
  stripUnknown: true,
  convert: true,
  abortEarly: false
});


// GET ALL ADMISSIONS => admin | DI
const getAdmissionsValidation = Joi.object({
  year: Joi.string()
    .trim()
    .valid("SE", "TE", "BE")
    .optional()
    .messages({
      "any.only": "Year must be one of SE, TE, or BE."
    }),

  search: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .max(100)
    .optional()
    .messages({
      "string.max": "Search cannot exceed 100 characters.",
      "string.pattern.base":
        "Search must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens."
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      "number.base": "Page must be a valid number.",
      "number.integer": "Page must be an integer.",
      "number.min": "Page must be at least 1."
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .optional()
    .messages({
      "number.base": "Limit must be a valid number.",
      "number.integer": "Limit must be an integer.",
      "number.min": "Limit must be at least 1.",
      "number.max": "Limit cannot exceed 50."
    }),

  filterPaid: Joi.string()
    .trim()
    .valid("paid", "unpaid")
    .optional()
    .messages({
      "any.only": "Filter paid must be either 'paid' or 'unpaid'."
    }),

  status: Joi.string()
    .trim()
    .valid("pending", "approved", "rejected")
    .optional()
    .messages({
      "any.only": "Status must be one of pending, approved, or rejected."
    }),

  isScholarshipApplied: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": "Scholarship applied must be true or false."
    }),

  isMahadbtFormSubmitted: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": "MahaDBT form submitted must be true or false."
    }),

  hasMigrationCertificate: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": "Migration certificate must be true or false."
    }),

  export: Joi.string().valid("true", "false").optional()

}).options({
  stripUnknown: true,
  convert: true,
  abortEarly: false
});


module.exports = {
  admissionCreateSchema,
  admissionUpdateSchema,
  admissionStatusSchema,
  getAdmissionsValidation,
};
