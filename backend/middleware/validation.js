const Joi = require('joi');

// Validation schemas
const schemas = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().required(),
    role: Joi.string().valid('student', 'teacher', 'partner', 'admin').required(),
    phone: Joi.string().optional(),
    academicLevel: Joi.string().optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    institution: Joi.string().optional(),
    qualifications: Joi.array().items(Joi.string()).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  courseCreate: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
    price: Joi.number().positive().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    maxStudents: Joi.number().positive().required(),
    batchTiming: Joi.string().required()
  }),

  enrollCourse: Joi.object({
    courseId: Joi.string().uuid().required()
  }),

  recordAttendance: Joi.object({
    enrollmentId: Joi.string().uuid().required(),
    status: Joi.string().valid('present', 'absent', 'late').required(),
    classDate: Joi.date().required()
  }),

  submitAssignment: Joi.object({
    assignmentId: Joi.string().uuid().required(),
    submissionUrl: Joi.string().uri().required(),
    submittedAt: Joi.date().required()
  }),

  submitFeedback: Joi.object({
    courseId: Joi.string().uuid().required(),
    rating: Joi.number().min(1).max(10).required(),
    comment: Joi.string().optional(),
    categories: Joi.object({
      teaching: Joi.number().min(1).max(10),
      content: Joi.number().min(1).max(10),
      engagement: Joi.number().min(1).max(10)
    })
  })
};

// Middleware to validate request body
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ error: `Validation schema '${schemaName}' not found` });
    }

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  validate,
  schemas
};
