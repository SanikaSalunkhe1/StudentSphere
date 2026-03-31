const Joi = require("../helpers/profanity/joiWithProfanity");

// Negative lookahead guards against all-digit strings.
// Character class has no nested quantifiers so there is no backtracking risk.
// Joi's max() cap (enforced before this regex runs) further bounds worst-case input length.
const textWithNumberRegex = /^(?!\d+$)[A-Za-z0-9\s.,!?'\-()\[\]]+$/;
const textOnlyRegex = /^[A-Za-z\s'-]+$/;

//create
const createAchievementSchema = Joi.object({
  category: Joi.string()
    .trim()
    .valid(
      "Coding competitions",
      "Academic Topper",
      "Committee",
      "Hackathon",
      "Sports",
      "Cultural",
      "Technical",
      "Other"
    )
    .required()
    .messages({
      "any.required": "Category is required.",
      "any.only": "Please select a valid category.",
      "string.empty": "Category cannot be empty."
    }),

  title: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(3)
    .max(100)
    .noProfanity()
    .required()
    .messages({
      "string.empty": "Title is required.",
      "string.pattern.base":
        "Title must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.min": "Title must be at least 3 characters long.",
      "string.max": "Title cannot exceed 100 characters.",
      "string.noProfanity": "Title contains inappropriate language.",
      "any.required": "Title is required."
    }),

  description: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(10)
    .max(500)
    .noProfanity()
    .required()
    .messages({
      "string.empty": "Description is required.",
      "string.pattern.base":
        "Description must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.min": "Description must be at least 10 characters long.",
      "string.max": "Description cannot exceed 500 characters.",
      "string.noProfanity": "Description contains inappropriate language.",
      "any.required": "Description is required."
    }),

  issuedBy: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(3)
    .max(100)
    .noProfanity()
    .required()
    .messages({
      "string.empty": "Issued by is required.",
      "string.pattern.base":
        "Issued by must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.min": "Issued by must be at least 3 characters long.",
      "string.max": "Issued by cannot exceed 100 characters.",
      "string.noProfanity": "Issued by contains inappropriate language.",
      "any.required": "Issued by is required."
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
    }),

  achievementType: Joi.string()
    .trim()
    .valid("Participation", "Winner", "Runner-up")
    .required()
    .messages({
      "any.required": "Achievement type is required.",
      "any.only": "Please select a valid achievement type.",
      "string.empty": "Achievement type cannot be empty."
    }),

  // FIX: added .noProfanity() to each team member name — previously these were
  // the only free-text string fields without profanity protection.
  teamMembers: Joi.array()
    .items(
      Joi.string()
        .trim()
        .pattern(textOnlyRegex)
        .min(2)
        .max(100)
        .noProfanity()
        .messages({
          "string.pattern.base": "Each team member name must contain only letters.",
          "string.min": "Each team member name must be at least 2 characters long.",
          "string.max": "Each team member name cannot exceed 100 characters.",
          "string.noProfanity": "A team member name contains inappropriate language."
        })
    )
    .default([])
    .messages({
      "array.base": "Team members must be an array."
    }),

  certification_course: Joi.string()
    .trim()
    .max(500)
    .noProfanity()
    .allow("")
    .optional()
    .messages({
      "string.max": "Certification/Course details cannot exceed 500 characters.",
      "string.noProfanity": "Certification/Course details contains inappropriate language."
    })
}).options({
  stripUnknown: true,
  convert: true,
  abortEarly: false
});

//update
const updateAchievementSchema = Joi.object({
  category: Joi.string()
    .trim()
    .valid(
      "Coding competitions",
      "Academic Topper",
      "Committee",
      "Hackathon",
      "Sports",
      "Cultural",
      "Technical",
      "Other"
    )
    .optional()
    .messages({
      "any.only": "Please select a valid category.",
      "string.empty": "Category cannot be empty."
    }),

  title: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(3)
    .max(100)
    .noProfanity()
    .optional()
    .messages({
      "string.empty": "Title cannot be empty.",
      "string.pattern.base":
        "Title must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.min": "Title must be at least 3 characters long.",
      "string.max": "Title cannot exceed 100 characters.",
      "string.noProfanity": "Title contains inappropriate language."
    }),

  description: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(10)
    .max(500)
    .noProfanity()
    .optional()
    .messages({
      "string.empty": "Description cannot be empty.",
      "string.pattern.base":
        "Description must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.min": "Description must be at least 10 characters long.",
      "string.max": "Description cannot exceed 500 characters.",
      "string.noProfanity": "Description contains inappropriate language."
    }),

  issuedBy: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .min(3)
    .max(100)
    .noProfanity()
    .optional()
    .messages({
      "string.empty": "Issued by cannot be empty.",
      "string.pattern.base":
        "Issued by must contain only letters, numbers, and special characters like commas, periods, exclamation marks, question marks, and hyphens.",
      "string.min": "Issued by must be at least 3 characters long.",
      "string.max": "Issued by cannot exceed 100 characters.",
      "string.noProfanity": "Issued by contains inappropriate language."
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
    .optional(),

  achievementType: Joi.string()
    .trim()
    .valid("Participation", "Winner", "Runner-up")
    .optional()
    .messages({
      "any.only": "Please select a valid achievement type.",
      "string.empty": "Achievement type cannot be empty."
    }),

  // FIX: added .noProfanity() and .max(100) to each team member name
  teamMembers: Joi.array()
    .items(
      Joi.string()
        .trim()
        .pattern(textOnlyRegex)
        .min(2)
        .max(100)
        .noProfanity()
        .messages({
          "string.pattern.base": "Each team member name must contain only letters.",
          "string.min": "Each team member name must be at least 2 characters long.",
          "string.max": "Each team member name cannot exceed 100 characters.",
          "string.noProfanity": "A team member name contains inappropriate language."
        })
    )
    .optional()
    .messages({
      "array.base": "Team members must be an array."
    }),

  certification_course: Joi.string()
    .trim()
    .max(500)
    .noProfanity()
    .allow("")
    .optional()
    .messages({
      "string.max": "Certification/Course details cannot exceed 500 characters.",
      "string.noProfanity": "Certification/Course details contains inappropriate language."
    })
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update."
  })
  .options({
    stripUnknown: true,    // removes extra fields not in schema
    convert: true,         // allows type conversion (e.g., string to date)
    abortEarly: false      // reports all validation errors, not just the first one
  });


const getAchievementsValidation = Joi.object({
  year: Joi.string()
    .trim()
    .valid("SE", "TE", "BE")
    .optional()
    .messages({ "any.only": "Year must be SE, TE, or BE." }),

  division: Joi.string()
    .trim()
    .pattern(textWithNumberRegex)
    .max(10)
    .optional()
    .messages({
      "string.pattern.base": "Division contains invalid characters.",
      "string.max": "Division cannot exceed 10 characters."
    }),

  category: Joi.string()
    .trim()
    .valid(
      "Coding competitions", "Academic Topper", "Committee",
      "Hackathon", "Sports", "Cultural", "Technical", "Other"
    )
    .optional()
    .messages({ "any.only": "Please select a valid category." }),

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

  achievementType: Joi.string()
    .trim()
    .valid("Participation", "Winner", "Runner-up")
    .optional()
    .messages({ "any.only": "Achievement type must be one of Participation, Winner, or Runner-up." }),

  export: Joi.string().valid("true", "false").optional()

}).options({ stripUnknown: true, convert: true, abortEarly: false });

module.exports = { createAchievementSchema, updateAchievementSchema, getAchievementsValidation };
