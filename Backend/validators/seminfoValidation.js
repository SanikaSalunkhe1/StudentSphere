const Joi = require("../helpers/profanity/joiWithProfanity");

// Negative lookahead guards against all-digit strings.
// Character class has no nested quantifiers so there is no backtracking risk.
// Joi's max() cap (enforced before this regex runs) further bounds worst-case input length.
const textWithNumberRegex = /^(?!\d+$)[A-Za-z0-9\s.,!?'\-]+$/;

// ----------------------------- MARK SUB-SCHEMA ----------------------------- //
const markSchema = Joi.object({
  subject: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(1)
    .noProfanity()
    .required()
    .messages({
      "string.empty": "Subject name is required.",
      "string.min": "Subject name must be at least 1 character long.",
      "string.pattern.base":
        "Subject name must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.noProfanity": "Subject name contains inappropriate language.",
      "any.required": "Subject name is required."
    }),

  score: Joi.number()
    .strict()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "Score must be a valid number.",
      "number.integer": "Score must be an integer.",
      "number.min": "Score cannot be negative.",
      "any.required": "Score is required."
    }),

  outOf: Joi.number()
    .strict()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "Total marks must be a valid number.",
      "number.integer": "Total marks must be an integer.",
      "number.min": "Total marks must be at least 1.",
      "any.required": "Total marks is required."
    })
});

// CREATE
const semInfoCreateSchema = Joi.object({
  semester: Joi.number()
    .strict()
    .integer()
    .min(1)
    .max(8)
    .required()
    .messages({
      "number.base": "Semester must be a valid number.",
      "number.integer": "Semester must be an integer.",
      "number.min": "Semester must be at least 1.",
      "number.max": "Semester cannot exceed 8.",
      "any.required": "Semester is required."
    }),

  attendance: Joi.number()
    .strict()
    .min(0)
    .max(100)
    .required()
    .messages({
      "number.base": "Attendance must be a valid number.",
      "number.min": "Attendance cannot be negative.",
      "number.max": "Attendance cannot exceed 100%.",
      "any.required": "Attendance is required."
    }),

  // added .noProfanity() to each KT subject name — previously these were
  // the only free-text string fields in this file without profanity protection.
  // Also added a .max(200) cap to bound worst-case input length.
  kts: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(200)
        .noProfanity()
        .messages({
          "string.base": "Each KT subject name must be a string.",
          "string.max": "Each KT subject name cannot exceed 200 characters.",
          "string.noProfanity": "A KT subject name contains inappropriate language."
        })
    )
    .default([])
    .messages({ "array.base": "KTs must be an array." }),

  marks: Joi.array()
    .items(markSchema)
    .optional()
    .messages({
      "array.base": "Marks must be an array."
    }),

  // journalTaken and examFormFilled added to the create schema.
  // Previously they only existed in the update schema, which meant they could
  // never be set at creation time even by an admin. Since the model tracks these
  // from the start of a semester, it makes sense to allow setting them on create.
  journalTaken: Joi.boolean()
    .optional()
    .messages({ "boolean.base": "Journal Taken must be true or false." }),

  examFormFilled: Joi.boolean()
    .optional()
    .messages({ "boolean.base": "ExamFormFilled must be true or false." })

}).options({
  stripUnknown: true,
  convert: true,
  abortEarly: false
});

// UPDATE
const semInfoUpdateSchema = Joi.object({
  semester: Joi.number()
    .strict()
    .integer()
    .min(1)
    .max(8)
    .optional()
    .messages({
      "number.base": "Semester must be a valid number.",
      "number.integer": "Semester must be an integer.",
      "number.min": "Semester must be at least 1.",
      "number.max": "Semester cannot exceed 8."
    }),

  attendance: Joi.number()
    .strict()
    .min(0)
    .max(100)
    .optional()
    .messages({
      "number.base": "Attendance must be a valid number.",
      "number.min": "Attendance cannot be negative.",
      "number.max": "Attendance cannot exceed 100%."
    }),

  // .noProfanity() and .max(200) added to match create schema
  kts: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(200)
        .noProfanity()
        .messages({
          "string.base": "Each KT subject name must be a string.",
          "string.max": "Each KT subject name cannot exceed 200 characters.",
          "string.noProfanity": "A KT subject name contains inappropriate language."
        })
    )
    .optional()
    .messages({ "array.base": "KTs must be an array." }),

  marks: Joi.array()
    .items(markSchema)
    .optional()
    .messages({
      "array.base": "Marks must be an array."
    }),

  journalTaken: Joi.boolean()
    .optional()
    .messages({ "boolean.base": "Journal Taken must be true or false." }),

  examFormFilled: Joi.boolean()
    .optional()
    .messages({ "boolean.base": "ExamFormFilled must be true or false." })
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


// GET SEM INFOS
const getSemInfosValidation = Joi.object({
  year: Joi.string()
    .trim()
    // FIX: .uppercase() normalises the value before .valid() runs, so query
    // params like "se", "Se", "te" are all accepted instead of rejected.
    // Previously a lowercase year would fail validation silently and the filter
    // would never be applied.
    .uppercase()
    .valid("SE", "TE", "BE")
    .optional()
    .messages({ "any.only": "Year must be one of SE, TE, or BE." }),

  division: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .max(10)
    .optional()
    .messages({
      "string.pattern.base": "Division contains invalid characters.",
      "string.max": "Division cannot exceed 10 characters."
    }),

  semester: Joi.number()
    .integer()
    .min(1)
    .max(8)
    .optional()
    .messages({
      "number.base": "Semester must be a valid number.",
      "number.integer": "Semester must be an integer.",
      "number.min": "Semester must be at least 1.",
      "number.max": "Semester cannot exceed 8."
    }),

  isDefaulter: Joi.boolean()
    .optional()
    .messages({ "boolean.base": "isDefaulter must be true or false." }),

  journalTaken: Joi.boolean()
    .optional()
    .messages({ "boolean.base": "journalTaken must be true or false." }),

  examFormFilled: Joi.boolean()
    .optional()
    .messages({ "boolean.base": "examFormFilled must be true or false." }),

  minAttendance: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      "number.base": "minAttendance must be a valid number.",
      "number.min": "minAttendance cannot be negative.",
      "number.max": "minAttendance cannot exceed 100."
    }),

  maxAttendance: Joi.number()
    .min(0)
    .max(100)
    .greater(Joi.ref("minAttendance"))
    .optional()
    .messages({
      "number.base": "maxAttendance must be a valid number.",
      "number.max": "maxAttendance cannot exceed 100.",
      "number.greater": "maxAttendance must be greater than minAttendance."
    }),

  search: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .max(100)
    .optional()
    .messages({
      "string.max": "Search cannot exceed 100 characters.",
      "string.pattern.base": "Search contains invalid characters."
    }),

  page: Joi.number().integer().min(1).optional()
    .messages({
      "number.base": "Page must be a number.",
      "number.min": "Page must be at least 1."
    }),

  limit: Joi.number().integer().min(1).max(50).optional()
    .messages({
      "number.base": "Limit must be a number.",
      "number.max": "Limit cannot exceed 50."
    }),

  export: Joi.string().valid("true", "false").optional()

}).options({ stripUnknown: true, convert: true, abortEarly: false });


module.exports = {
  semInfoCreateSchema,
  semInfoUpdateSchema,
  getSemInfosValidation,
};
