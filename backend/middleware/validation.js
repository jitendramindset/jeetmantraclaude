const Joi = require('joi');

// Validation schemas
const schemas = {
  signup: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().required(),
    // EduOS roles — 10 user types per the platform vision.
    role: Joi.string().valid('student', 'teacher', 'partner', 'admin', 'school', 'coaching',
                              'parent', 'corporate_trainer', 'content_creator', 'franchise').required(),
    phone: Joi.string().allow('').optional(),
    academicLevel: Joi.string().allow('').optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    institution: Joi.string().allow('').optional(),
    qualifications: Joi.array().items(Joi.string()).optional(),
    // School profile fields (optional, used when role === 'school')
    schoolName: Joi.string().allow('').optional(),
    contactPerson: Joi.string().allow('').optional(),
    affiliationBoard: Joi.string().allow('').optional(),
    affiliation: Joi.string().allow('').optional(),
    studentCount: Joi.alternatives(Joi.number(), Joi.string().allow('')).optional(),
    teacherCount: Joi.alternatives(Joi.number(), Joi.string().allow('')).optional(),
    address: Joi.string().allow('').optional(),
    // Coaching profile fields (optional, used when role === 'coaching')
    centerName: Joi.string().allow('').optional(),
    specializations: Joi.alternatives(Joi.array().items(Joi.string()), Joi.string().allow('')).optional(),
    studentCapacity: Joi.alternatives(Joi.number(), Joi.string().allow('')).optional(),
    batchCount: Joi.alternatives(Joi.number(), Joi.string().allow('')).optional(),
    // Optional AI provider + key chosen during signup.
    aiProvider: Joi.string().valid('openai', 'anthropic', 'claude', 'gemini', 'openrouter').optional(),
    apiKey: Joi.string().allow('').optional()
  }),

  login: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().required()
  }),

  courseCreate: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    category: Joi.string().default('General'),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner'),
    price: Joi.number().min(0).default(0),
    // The following have DB defaults — optional so simple create forms work.
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    maxStudents: Joi.number().positive().optional(),
    batchTiming: Joi.string().allow('').optional(),
    // SEO + location/mode (all optional).
    metaDescription: Joi.string().allow('').max(300).optional(),
    keywords: Joi.string().allow('').optional(),
    slug: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    area: Joi.string().allow('').optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    classMode: Joi.string().valid('online', 'offline', 'hybrid').optional(),
    ageGroup: Joi.string().allow('').optional(),
    timing: Joi.string().allow('').optional(),
    instituteName: Joi.string().allow('').optional(),
    institutionId: Joi.string().allow('', null).optional(),
    freeListing: Joi.boolean().optional(),
    demoClass: Joi.boolean().optional()
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
  }),

  marketplaceListing: Joi.object({
    courseId: Joi.string().uuid().required(),
    price: Joi.number().positive().required(),
    commissionRate: Joi.number().min(0).max(50).default(15)
  }),

  schoolProfile: Joi.object({
    schoolName: Joi.string().required(),
    affiliation: Joi.string().optional(),
    studentCount: Joi.number().positive().optional(),
    teacherCount: Joi.number().positive().optional(),
    contactEmail: Joi.string().email().optional(),
    contactPhone: Joi.string().optional(),
    address: Joi.string().optional()
  }),

  coachingProfile: Joi.object({
    centerName: Joi.string().required(),
    specializations: Joi.array().items(Joi.string()).optional(),
    studentCapacity: Joi.number().positive().optional(),
    batchCount: Joi.number().positive().optional(),
    contactEmail: Joi.string().email().optional(),
    contactPhone: Joi.string().optional(),
    address: Joi.string().optional()
  }),

  // ── Sprint 3: operations queues.
  approvalCreate: Joi.object({
    type: Joi.string().valid('teacher','course','payout','kyc').required(),
    target_id: Joi.string().allow('', null).optional(),
    metadata: Joi.object().optional(),
    reason: Joi.string().allow('').optional()
  }),

  payoutCreate: Joi.object({
    amount: Joi.number().positive().required(),
    notes: Joi.string().allow('').optional(),
    currency: Joi.string().optional()
  }),

  payoutDecide: Joi.object({
    decision: Joi.string().valid('approve','reject','paid').required(),
    gateway_ref: Joi.string().allow('').optional(),
    notes: Joi.string().allow('').optional()
  }),

  supportTicketCreate: Joi.object({
    subject: Joi.string().required(),
    body: Joi.string().allow('').required(),
    priority: Joi.string().valid('low','normal','high','urgent').optional(),
    tenant_id: Joi.string().allow('', null).optional()
  }),

  supportMessage: Joi.object({
    body: Joi.string().required(),
    is_internal: Joi.boolean().optional()
  }),

  supportTicketUpdate: Joi.object({
    status: Joi.string().valid('open','pending','resolved','closed').optional(),
    priority: Joi.string().valid('low','normal','high','urgent').optional(),
    assignee_id: Joi.string().allow('', null).optional(),
    sla_due_at: Joi.date().optional()
  }).min(1),

  contentReportCreate: Joi.object({
    target_type: Joi.string().valid('course','message','review','user','recording','listing').required(),
    target_id: Joi.string().required(),
    reason: Joi.string().allow('').required()
  }),

  contentReportDecide: Joi.object({
    decision: Joi.string().valid('dismiss','action').required(),
    notes: Joi.string().allow('').optional()
  }),

  notificationTemplateCreate: Joi.object({
    key: Joi.string().required(),
    channel: Joi.string().valid('in_app','email','sms','push').required(),
    locale: Joi.string().required(),
    subject: Joi.string().allow('').optional(),
    body: Joi.string().allow('').required()
  }),

  notificationTemplateUpdate: Joi.object({
    subject: Joi.string().allow('').optional(),
    body: Joi.string().allow('').optional()
  }).min(1),

  notificationBroadcast: Joi.object({
    template_key: Joi.string().required(),
    channel: Joi.string().valid('in_app','email','sms','push').optional(),
    audience: Joi.object({
      role: Joi.string().optional(),
      user_ids: Joi.array().items(Joi.string()).optional(),
      institution_id: Joi.string().optional()
    }).min(1).required(),
    payload: Joi.object().optional()
  }),

  // ── Sprint 4 booking engine ────────────────────────────────────────────
  resourceCreate: Joi.object({
    type: Joi.string().valid('ground','court','room','teacher','mentor','workshop','event','course','equipment').required(),
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().allow('').optional(),
    capacity: Joi.number().integer().min(1).optional(),
    price: Joi.number().min(0).optional(),
    currency: Joi.string().length(3).optional(),
    venueName: Joi.string().allow('').optional(),
    venueAddress: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    availability: Joi.object().optional(),
    coverImage: Joi.string().uri().allow('').optional()
  }),

  resourceUpdate: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().allow('').optional(),
    capacity: Joi.number().integer().min(1).optional(),
    price: Joi.number().min(0).optional(),
    currency: Joi.string().length(3).optional(),
    venueName: Joi.string().allow('').optional(),
    venueAddress: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    availability: Joi.object().optional(),
    coverImage: Joi.string().uri().allow('').optional(),
    is_active: Joi.boolean().optional()
  }).min(1),

  bookingCreate: Joi.object({
    resourceId: Joi.string().required(),
    startAt: Joi.date().iso().required(),
    endAt: Joi.date().iso().greater(Joi.ref('startAt')).required(),
    partySize: Joi.number().integer().min(1).optional(),
    notes: Joi.string().allow('').optional()
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
