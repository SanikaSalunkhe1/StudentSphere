const Joi = require("../helpers/profanity/joiWithProfanity");

// Negative lookahead guards against all-digit strings.
// Character class has no nested quantifiers so there is no backtracking risk.
// Joi's max() cap (enforced before this regex runs) further bounds worst-case input length.
const textWithNumberRegex = /^(?!\d+$)[A-Za-z0-9\s.,!?'\-()\[\]]+$/;

//create
const activityCreateSchema = Joi.object({
  title: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(3)
    .max(100)
    .noProfanity()
    .required()
    .messages({
      "string.base": "Title must be a string.",
      "string.empty": "Title is required.",
      "string.min": "Title must be at least 3 characters.",
      "string.max": "Title must not exceed 100 characters.",
      "any.required": "Title is required.",
      "string.pattern.base":
        "Title must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.noProfanity": "Title contains inappropriate language."
    }),

  description: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(5)
    .max(500)
    .noProfanity()
    .required()
    .messages({
      "string.empty": "Description is required.",
      "string.min": "Description must be at least 5 characters.",
      "string.max": "Description must not exceed 500 characters.",
      "any.required": "Description is required.",
      "string.pattern.base":
        "Description must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.noProfanity": "Description contains inappropriate language."
    }),

  date: Joi.object({
    from: Joi.date()
      .required()
      .messages({
        "any.required": "Start date is required.",
        "date.base": "Start date must be a valid date."
      }),

    to: Joi.date()
      .min(Joi.ref("from"))
      .required()
      .messages({
        "any.required": "End date is required.",
        "date.base": "End date must be a valid date.",
        "date.min": "End date must be the same as or after the start date."
      })
  })
    .required()
    .messages({
      "any.required": "Date range is required."
    })
}).options({
  stripUnknown: true,
  convert: true,
  abortEarly: false
});

//update
const activityUpdateSchema = Joi.object({
  title: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(3)
    .max(100)
    .noProfanity()
    .optional()
    .messages({
      "string.empty": "Title cannot be empty.",
      "string.min": "Title must be at least 3 characters.",
      "string.max": "Title must not exceed 100 characters.",
      "string.pattern.base":
        "Title must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.noProfanity": "Title contains inappropriate language."
    }),

  description: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(5)
    .max(500)
    .noProfanity()
    .optional()
    .messages({
      "string.empty": "Description cannot be empty.",
      "string.min": "Description must be at least 5 characters.",
      "string.max": "Description must not exceed 500 characters.",
      "string.pattern.base":
        "Description must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.noProfanity": "Description contains inappropriate language."
    }),

  date: Joi.object({
    from: Joi.date()
      .optional()
      .messages({
        "date.base": "Start date must be a valid date."
      }),

    to: Joi.date()
      .when("from", {
        is: Joi.exist(),
        then: Joi.date().min(Joi.ref("from")).messages({
          "date.base": "End date must be a valid date.",
          "date.min": "End date must be the same as or after the start date."
        }),
        otherwise: Joi.date().messages({
          "date.base": "End date must be a valid date."
        })
      })
      .optional()
  })
    .min(1)
    .optional()
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update."
  })
  .options({
    stripUnknown: true,  // removes extra fields not in schema
    convert: true,    // allows type conversion (e.g., string to date)
    abortEarly: false   // reports all validation errors, not just the first one
  });


const getActivitiesValidation = Joi.object({
  year: Joi.string()
    .trim()
    .valid("SE", "TE", "BE")
    .optional()
    .messages({ "any.only": "Year must be one of SE, TE, BE" }),

  division: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .max(10)
    .optional()
    .messages({
      "string.pattern.base": "Division contains invalid characters.",
      "string.max": "Division cannot exceed 10 characters."
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
  activityCreateSchema,
  activityUpdateSchema ,
  getActivitiesValidation,
};
