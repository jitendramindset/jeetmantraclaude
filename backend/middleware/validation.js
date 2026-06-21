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

  // ── P0 money flows ─────────────────────────────────────────────────────
  // Hardening from EDUOS_API_INVENTORY.md §2 (validation gap list). Every
  // /api/payments + /api/wallet write endpoint reading user input gets a Joi
  // schema. Permissive on optional fields, strict on type + bounds.
  couponApply: Joi.object({
    code: Joi.string().min(1).max(64).required(),
    amount: Joi.number().min(0).required(),
    courseId: Joi.string().allow(null, '').optional()
  }),

  couponCreate: Joi.object({
    code: Joi.string().min(1).max(64).required(),
    discountPercent: Joi.number().min(0).max(100).optional(),
    discountFlat: Joi.number().min(0).optional(),
    courseId: Joi.string().allow(null, '').optional(),
    maxUses: Joi.number().integer().min(1).optional(),
    expiresAt: Joi.date().iso().optional()
    // discount enforcement (must specify at least one) is handled in-handler
    // since both can be legitimately absent for a "no discount" promo code.
  }),

  paymentOrder: Joi.object({
    courseId: Joi.string().allow(null, '').optional(),
    amount: Joi.number().min(0).required(),
    currency: Joi.string().length(3).optional(),
    couponCode: Joi.string().max(64).allow('', null).optional()
  }),

  paymentVerify: Joi.object({
    paymentRowId: Joi.string().required(),
    razorpayOrderId: Joi.string().allow('', null).optional(),
    razorpayPaymentId: Joi.string().allow('', null).optional(),
    razorpaySignature: Joi.string().allow('', null).optional(),
    courseId: Joi.string().allow(null, '').optional()
  }),

  paymentCreate: Joi.object({
    courseId: Joi.string().allow(null, '').optional(),
    amount: Joi.number().min(0).required(),
    paymentMethod: Joi.string().max(40).optional()
  }),

  walletSpend: Joi.object({
    amount: Joi.number().min(0).required(),
    reference: Joi.string().max(120).allow('', null).optional(),
    notes: Joi.string().max(500).allow('', null).optional()
  }),

  walletTopupOrder: Joi.object({
    amount: Joi.number().min(1).required()
  }).unknown(true),

  walletTopupVerify: Joi.object({
    razorpayOrderId: Joi.string().allow('', null).optional(),
    razorpayPaymentId: Joi.string().allow('', null).optional(),
    razorpaySignature: Joi.string().allow('', null).optional(),
    amount: Joi.number().min(0).optional()
  }).unknown(true),

  walletSubscribe: Joi.object({
    planCode: Joi.string().required(),
    billingPeriod: Joi.string().valid('monthly', 'yearly', 'annual').optional()
  }),

  // ── P1 hardening: eduos.js INSTITUTION_ROLES writes (admissions / fees /
  // payroll / leave / branding). HR + tenant money — all need Joi gates.
  admissionCreate: Joi.object({
    studentName: Joi.string().min(1).max(200).required(),
    studentEmail: Joi.string().email().allow('', null).optional(),
    studentPhone: Joi.string().max(40).allow('', null).optional(),
    courseId: Joi.string().allow('', null).optional(),
    notes: Joi.string().allow('', null).max(2000).optional()
  }),

  admissionUpdate: Joi.object({
    stage: Joi.string().valid('applied', 'shortlisted', 'interview', 'offered', 'enrolled', 'rejected').optional(),
    notes: Joi.string().allow('', null).max(2000).optional()
  }).min(1),

  feePlanCreate: Joi.object({
    name: Joi.string().min(1).max(160).required(),
    amount: Joi.number().min(0).required(),
    frequency: Joi.string().valid('once', 'monthly', 'quarterly', 'yearly').optional(),
    courseId: Joi.string().allow('', null).optional()
  }),

  feeInvoiceCreate: Joi.object({
    studentId: Joi.string().required(),
    feePlanId: Joi.string().allow('', null).optional(),
    amount: Joi.number().min(0).required(),
    dueDate: Joi.date().iso().allow('', null).optional()
  }),

  payrollCreate: Joi.object({
    staffId: Joi.string().required(),
    periodMonth: Joi.string().pattern(/^\d{4}-\d{2}$/).optional(),
    baseSalary: Joi.number().min(0).required(),
    bonuses: Joi.number().min(0).optional(),
    deductions: Joi.number().min(0).optional()
  }),

  leaveCreate: Joi.object({
    institutionId: Joi.string().required(),
    leaveType: Joi.string().valid('casual', 'sick', 'earned', 'unpaid', 'maternity', 'paternity').optional(),
    fromDate: Joi.date().iso().required(),
    toDate: Joi.date().iso().min(Joi.ref('fromDate')).required(),
    reason: Joi.string().allow('', null).max(1000).optional()
  }),

  leaveDecide: Joi.object({
    decision: Joi.string().valid('approved', 'rejected').required()
  }),

  // ── Sprint 6: certificate issuance + templates
  certificateIssue: Joi.object({
    type: Joi.string().valid('course_completion','workshop','attendance','skill','sports','participation').required(),
    studentId: Joi.string().required(),
    courseId: Joi.string().allow('', null).optional(),
    resourceId: Joi.string().allow('', null).optional(),
    templateId: Joi.string().allow('', null).optional(),
    title: Joi.string().max(200).optional(),
    metadata: Joi.object().optional()
  }),

  certificateTemplateCreate: Joi.object({
    type: Joi.string().valid('course_completion','workshop','attendance','skill','sports','participation').required(),
    title: Joi.string().min(1).max(200).required(),
    tenantId: Joi.string().allow('', null).optional(),
    htmlTemplate: Joi.string().allow('', null).optional(),
    cssTemplate: Joi.string().allow('', null).optional(),
    signatureUrl: Joi.string().uri().allow('', null).optional(),
    logoUrl: Joi.string().uri().allow('', null).optional()
  }),

  // ── Sprint 8: organization write endpoints
  orgCreate: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    type: Joi.string().valid('school','coaching','sports_academy','yoga_center','dance_academy',
      'music_academy','reading_club','training_institute','home_tuition','language_center',
      'corporate_training','skill_center','ngo','community','custom').required(),
    category: Joi.string().allow('', null).optional(),
    isPersonal: Joi.boolean().optional()
  }),

  orgUpdate: Joi.object({
    name: Joi.string().min(1).max(200).optional(),
    category: Joi.string().allow('', null).optional(),
    branding: Joi.object().optional()
  }).min(1),

  orgMemberInvite: Joi.object({
    personId: Joi.string().optional(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('teacher','assistant_teacher','coach','trainer','org_admin','viewer','student').required()
  }).or('personId', 'email'),

  orgMemberUpdate: Joi.object({
    role: Joi.string().valid('teacher','assistant_teacher','coach','trainer','org_admin','viewer','student').required()
  }),

  orgTransfer: Joi.object({
    newOwnerId: Joi.string().required()
  }),

  // ── Sprint 10 (Phase C): timetable + recurring booking slots
  timetableTemplate: Joi.object({
    orgId: Joi.string().required(),
    name: Joi.string().min(1).max(200).required(),
    courseId: Joi.string().allow('','null').optional(),
    batchId: Joi.string().allow('','null').optional()
  }).unknown(true),
  timetableSlot: Joi.object({
    dayOfWeek: Joi.number().integer().min(0).max(6).required(),
    startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    subject: Joi.string().max(200).allow('','null').optional(),
    teacherId: Joi.string().allow('','null').optional(),
    room: Joi.string().max(80).allow('','null').optional()
  }).unknown(true),
  resourceSlot: Joi.object({
    dayOfWeek: Joi.number().integer().min(0).max(6).required(),
    startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    capacity: Joi.number().integer().min(1).max(1000).optional(),
    price: Joi.number().min(0).optional(),
    coachId: Joi.string().allow('','null').optional()
  }).unknown(true),

  // ── Sprint 9 (Phase A): active-context + org settings
  activeContext: Joi.object({
    orgId: Joi.string().required()
  }),
  orgSettings: Joi.object({
    plan: Joi.string().max(40).optional(),
    slug: Joi.string().lowercase().pattern(/^[a-z0-9-]+$/).max(120).allow('','null').optional(),
    domain: Joi.string().max(200).allow('','null').optional(),
    locale_default: Joi.string().max(10).optional(),
    allowed_locales: Joi.array().items(Joi.string().max(10)).optional(),
    seo: Joi.object().unknown(true).optional(),
    branding: Joi.object().unknown(true).optional(),
    settings: Joi.object().unknown(true).optional()
  }).unknown(true),

  // ── Sprint 6: impersonation
  impersonationStart: Joi.object({
    targetUserId: Joi.string().required(),
    scope: Joi.string().valid('read','full').optional(),
    reason: Joi.string().min(3).max(500).required(),
    durationMinutes: Joi.number().integer().min(1).max(120).optional()
  }),

  tenantBranding: Joi.object({
    subdomain: Joi.string().pattern(/^[a-z][a-z0-9-]{2,30}$/i).allow('', null).optional(),
    brandLogo: Joi.string().allow('', null).optional(),
    brandColor: Joi.string().max(40).allow('', null).optional(),
    brandName: Joi.string().max(160).allow('', null).optional()
  }).min(1),

  // ── P1 hardening (rest): CREATOR writes in teacherExtras / assignments /
  // liveClasses + profile + admin user-update. These are EXISTING endpoints
  // whose frontends may send extra fields, so each schema is .unknown(true) —
  // we validate the KNOWN fields' types (closing type-confusion) without
  // breaking callers that include extra keys the handler already ignores.
  recurringClass: Joi.object({
    courseId: Joi.string().required(),
    title: Joi.string().max(200).allow('', null).optional(),
    description: Joi.string().allow('', null).optional(),
    startTime: Joi.date().iso().required(),
    duration: Joi.number().integer().min(1).optional(),
    meetingLink: Joi.string().allow('', null).optional(),
    daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).min(1).required(),
    weeks: Joi.number().integer().min(1).max(52).required(),
    isOnline: Joi.boolean().optional(),
    venue: Joi.string().allow('', null).optional()
  }).unknown(true),

  attendanceBulkMixed: Joi.object({
    courseId: Joi.string().required(),
    classDate: Joi.date().iso().required(),
    marks: Joi.array().items(Joi.object().unknown(true)).min(1).required()
  }).unknown(true),

  attendanceBulk: Joi.object({
    courseId: Joi.string().required(),
    classDate: Joi.date().iso().required(),
    enrollmentIds: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('present', 'absent', 'late').optional()
  }).unknown(true),

  invoiceCreate: Joi.object({
    clientName: Joi.string().min(1).max(200).required(),
    clientEmail: Joi.string().email().allow('', null).optional(),
    clientId: Joi.string().allow('', null).optional(),
    items: Joi.array().items(Joi.object().unknown(true)).min(1).required(),
    taxPercent: Joi.number().min(0).max(100).optional(),
    dueDate: Joi.date().iso().allow('', null).optional(),
    notes: Joi.string().allow('', null).max(2000).optional()
  }).unknown(true),

  invoiceUpdate: Joi.object({
    status: Joi.string().max(40).optional(),
    paidAt: Joi.date().iso().allow('', null).optional(),
    notes: Joi.string().allow('', null).max(2000).optional()
  }).unknown(true),

  essayGrade: Joi.object({
    sessionId: Joi.string().required(),
    questionId: Joi.string().required(),
    score: Joi.number().required(),
    feedback: Joi.string().allow('', null).max(4000).optional()
  }).unknown(true),

  courseAnnouncement: Joi.object({
    courseId: Joi.string().required(),
    message: Joi.string().min(1).max(4000).required()
  }).unknown(true),

  assignmentCreate: Joi.object({
    courseId: Joi.string().required(),
    title: Joi.string().min(1).max(300).required(),
    description: Joi.string().allow('', null).optional(),
    dueDate: Joi.date().iso().required(),
    topicId: Joi.string().allow('', null).optional()
  }).unknown(true),

  assignmentEdit: Joi.object({
    title: Joi.string().min(1).max(300).optional(),
    description: Joi.string().allow('', null).optional(),
    dueDate: Joi.date().iso().optional(),
    topicId: Joi.string().allow('', null).optional()
  }).unknown(true),

  assignmentGrade: Joi.object({
    grade: Joi.alternatives(Joi.number(), Joi.string().max(20)).required(),
    feedback: Joi.string().allow('', null).max(4000).optional()
  }).unknown(true),

  liveClassCreate: Joi.object({
    courseId: Joi.string().required(),
    title: Joi.string().max(300).allow('', null).optional(),
    description: Joi.string().allow('', null).optional(),
    scheduledTime: Joi.date().iso().required(),
    duration: Joi.number().integer().min(1).optional(),
    meetingLink: Joi.string().allow('', null).optional(),
    capacity: Joi.number().integer().min(1).optional(),
    topicId: Joi.string().allow('', null).optional()
  }).unknown(true),

  liveClassUpdate: Joi.object({
    title: Joi.string().max(300).optional(),
    description: Joi.string().allow('', null).optional(),
    meetingLink: Joi.string().allow('', null).optional(),
    status: Joi.string().valid('scheduled', 'live', 'completed', 'cancelled').optional(),
    scheduledTime: Joi.date().iso().optional(),
    duration: Joi.number().integer().min(1).optional(),
    venue: Joi.string().allow('', null).optional(),
    isOnline: Joi.boolean().optional()
  }).unknown(true),

  liveRecording: Joi.object({
    recordingUrl: Joi.string().allow('', null).optional()
  }).unknown(true), // multipart: text fields are strings, file is in req.file

  profileUpdate: Joi.object({
    fullName: Joi.string().max(200).optional(),
    phone: Joi.string().max(40).optional(),
    email: Joi.string().email().optional(),
    bio: Joi.string().allow('', null).max(2000).optional(),
    dateOfBirth: Joi.date().iso().allow('', null).optional(),
    profileImage: Joi.string().allow('', null).optional(),
    street: Joi.string().allow('', null).optional(),
    city: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    postalCode: Joi.string().allow('', null).max(20).optional(),
    country: Joi.string().allow('', null).optional(),
    education: Joi.string().allow('', null).optional(),
    experience: Joi.string().allow('', null).optional(),
    altPhone: Joi.string().allow('', null).max(40).optional(),
    linkedinUrl: Joi.string().allow('', null).optional(),
    youtubeUrl: Joi.string().allow('', null).optional(),
    twitterUrl: Joi.string().allow('', null).optional(),
    instagramUrl: Joi.string().allow('', null).optional(),
    websiteUrl: Joi.string().allow('', null).optional()
  }).unknown(true),

  adminUserUpdate: Joi.object({
    fullName: Joi.string().max(200).optional(),
    role: Joi.string().valid('student','teacher','partner','admin','school','coaching','parent','corporate_trainer','content_creator','franchise').optional(),
    status: Joi.string().max(40).optional()
  }).unknown(true),

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
