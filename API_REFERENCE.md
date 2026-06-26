# JeetMantra / EduOS — Complete API Reference

> Auto-generated from `backend/routes/*.js`. 🔒 = requires auth (JWT), 🌐 = public.
> 389 endpoints across 43 routers.

## `/api/activity`  ·  activity.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/activity/me` | — | — | — |
| 🔒 | GET | `/api/activity/course/:courseId` | — | — | — |

## `/api/admin`  ·  admin.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/admin/users` | — | — | — |
| 🔒 | PUT | `/api/admin/users/:userId/toggle-status` | — | — | — |
| 🔒 | GET | `/api/admin/stats` | — | — | — |
| 🔒 | GET | `/api/admin/analytics/overview` | — | — | — |
| 🔒 | GET | `/api/admin/system/status` | — | — | — |
| 🔒 | GET | `/api/admin/actions/inbox` | — | — | — |
| 🔒 | GET | `/api/admin/institutes` | — | — | — |
| 🔒 | GET | `/api/admin/payments` | — | — | — |
| 🔒 | GET | `/api/admin/users/:userId` | — | — | — |
| 🔒 | PUT | `/api/admin/users/:userId` | — | — | — |
| 🔒 | DELETE | `/api/admin/users/:userId` | — | — | — |
| 🔒 | GET | `/api/admin/audit` | — | — | — |
| 🔒 | GET | `/api/admin/settings` | — | — | — |
| 🔒 | PUT | `/api/admin/settings` | — | — | — |
| 🔒 | POST | `/api/admin/test-email` | — | — | — |
| 🔒 | POST | `/api/admin/courses/:id/moderate` | — | — | — |
| 🔒 | POST | `/api/admin/impersonate/start` | — | — | — |
| 🔒 | POST | `/api/admin/impersonate/stop` | — | — | — |
| 🔒 | GET | `/api/admin/impersonate/sessions` | — | — | — |
| 🔒 | GET | `/api/admin/bookings` | — | — | — |
| 🔒 | GET | `/api/admin/live-classes` | — | — | — |
| 🔒 | POST | `/api/admin/migrations/run` | — | — | — |
| 🔒 | POST | `/api/admin/backup/trigger` | — | — | — |
| 🔒 | GET | `/api/admin/backup/list` | — | — | — |

## `/api/ai`  ·  ai.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/ai/key` | — | — | — |
| 🔒 | POST | `/api/ai/key` | — | — | — |
| 🔒 | GET | `/api/ai/usage` | — | — | — |
| 🔒 | POST | `/api/ai/generate` | — | — | — |
| 🔒 | POST | `/api/ai/translate` | — | — | — |
| 🔒 | POST | `/api/ai/create-course` | — | — | — |
| 🔒 | POST | `/api/ai/create-assignment` | — | — | — |
| 🔒 | POST | `/api/ai/transcribe-summary` | — | — | — |
| 🔒 | POST | `/api/ai/course-from-url` | — | — | — |
| 🔒 | POST | `/api/ai/suggest-topics` | — | — | — |
| 🔒 | POST | `/api/ai/tutor` | — | — | — |
| 🔒 | POST | `/api/ai/suggest` | — | — | — |
| 🔒 | POST | `/api/ai/lesson-plan` | — | — | — |
| 🔒 | POST | `/api/ai/practice-questions` | — | — | — |
| 🔒 | POST | `/api/ai/grade-essay` | — | — | — |
| 🔒 | POST | `/api/ai/agent` | — | — | — |
| 🔒 | GET | `/api/ai/agent/tools` | — | — | — |

## `/api/approvals`  ·  approvals.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/approvals` | — | — | — |
| 🔒 | GET | `/api/approvals/:id` | — | — | — |
| 🔒 | POST | `/api/approvals` | — | — | — |
| 🔒 | POST | `/api/approvals/:id/decide` | — | — | — |

## `/api/assignments`  ·  assignments.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | POST | `/api/assignments` | — | — | — |
| 🔒 | GET | `/api/assignments` | — | — | — |
| 🔒 | GET | `/api/assignments/my` | — | — | — |
| 🔒 | POST | `/api/assignments/:id/submit` | — | — | — |
| 🔒 | PUT | `/api/assignments/:id` | — | — | — |
| 🔒 | PUT | `/api/assignments/:id/grade` | — | — | — |
| 🔒 | DELETE | `/api/assignments/:id` | — | — | — |
| 🔒 | GET | `/api/assignments/:id/submissions` | — | — | — |

## `/api/attendance`  ·  attendance.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | POST | `/api/attendance` | — | — | — |
| 🔒 | GET | `/api/attendance/student/:studentId` | — | — | — |
| 🔒 | GET | `/api/attendance/course/:courseId` | — | — | — |
| 🔒 | GET | `/api/attendance/log/:courseId` | — | — | — |

## `/api/auth`  ·  auth.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🌐 | POST | `/api/auth/signup` | — | — | — |
| 🌐 | POST | `/api/auth/login` | — | — | — |
| 🔒 | GET | `/api/auth/verify` | — | — | — |
| 🔒 | POST | `/api/auth/refresh` | — | — | — |
| 🌐 | GET | `/api/auth/config` | — | — | — |
| 🌐 | POST | `/api/auth/google-login` | — | — | — |
| 🌐 | POST | `/api/auth/send-otp` | — | — | — |
| 🌐 | POST | `/api/auth/verify-otp` | — | — | — |
| 🌐 | POST | `/api/auth/forgot-password` | — | — | — |
| 🌐 | POST | `/api/auth/reset-password` | — | — | — |
| 🌐 | POST | `/api/auth/send-verify-email` | — | — | — |
| 🌐 | GET | `/api/auth/verify-email` | — | — | — |

## `/api/bookings`  ·  bookings.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | POST | `/api/bookings` | — | — | — |
| 🔒 | GET | `/api/bookings/mine` | — | — | — |
| 🔒 | GET | `/api/bookings/received` | — | — | — |
| 🔒 | GET | `/api/bookings/:id` | — | — | — |
| 🔒 | POST | `/api/bookings/:id/cancel` | — | — | — |
| 🔒 | POST | `/api/bookings/:id/confirm` | — | — | — |

## `/api/calendar`  ·  calendar.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/calendar` | — | — | — |

## `/api/certificates`  ·  certificates.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | POST | `/api/certificates/issue` | — | — | — |
| 🔒 | GET | `/api/certificates/my` | — | — | — |
| 🌐 | GET | `/api/certificates/verify/:token` | — | — | — |
| 🔒 | GET | `/api/certificates/templates` | — | — | — |
| 🔒 | POST | `/api/certificates/templates` | — | — | — |
| 🌐 | GET | `/api/certificates/:id` | — | — | — |
| 🔒 | POST | `/api/certificates/:id/revoke` | — | — | — |

## `/api/chat`  ·  chat.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/chat/rooms` | — | — | — |
| 🔒 | GET | `/api/chat/rooms/course/:courseId` | — | — | — |
| 🔒 | GET | `/api/chat/rooms/dm/:userId` | — | — | — |
| 🔒 | GET | `/api/chat/unread` | — | — | — |
| 🔒 | POST | `/api/chat/rooms/:id/read` | — | — | — |
| 🔒 | GET | `/api/chat/rooms/:id/messages` | — | — | — |
| 🔒 | POST | `/api/chat/rooms/:id/messages` | — | — | — |

## `/api/course-content`  ·  courseContent.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | POST | `/api/course-content/:courseId/cover` | — | — | — |
| 🔒 | GET | `/api/course-content/:courseId/topics` | — | — | — |
| 🔒 | POST | `/api/course-content/:courseId/topics` | — | — | — |
| 🔒 | PUT | `/api/course-content/topics/:id` | — | — | — |
| 🔒 | DELETE | `/api/course-content/topics/:id` | — | — | — |
| 🔒 | GET | `/api/course-content/:courseId/lectures` | — | — | — |
| 🔒 | POST | `/api/course-content/:courseId/lectures` | — | — | — |
| 🔒 | PUT | `/api/course-content/lectures/:id` | — | — | — |
| 🔒 | DELETE | `/api/course-content/lectures/:id` | — | — | — |
| 🔒 | GET | `/api/course-content/:courseId/materials` | — | — | — |
| 🔒 | POST | `/api/course-content/:courseId/materials` | — | — | — |
| 🔒 | PUT | `/api/course-content/materials/:id` | — | — | — |
| 🔒 | DELETE | `/api/course-content/materials/:id` | — | — | — |
| 🔒 | GET | `/api/course-content/:courseId/tests` | — | — | — |
| 🔒 | POST | `/api/course-content/:courseId/tests` | — | — | — |
| 🔒 | PUT | `/api/course-content/tests/:id` | — | — | — |
| 🔒 | DELETE | `/api/course-content/tests/:id` | — | — | — |
| 🔒 | GET | `/api/course-content/tests/:testId/questions` | — | — | — |
| 🔒 | POST | `/api/course-content/tests/:testId/questions` | — | — | — |
| 🔒 | PUT | `/api/course-content/questions/:id` | — | — | — |
| 🔒 | DELETE | `/api/course-content/questions/:id` | — | — | — |
| 🔒 | POST | `/api/course-content/tests/:testId/session/start` | — | — | — |
| 🔒 | POST | `/api/course-content/sessions/:id/submit` | — | — | — |
| 🔒 | POST | `/api/course-content/tests/:testId/submit` | — | — | — |
| 🌐 | GET | `/api/course-content/:courseId/preview` | — | — | — |
| 🔒 | GET | `/api/course-content/:courseId/full` | — | — | — |
| 🔒 | GET | `/api/course-content/tests/:testId/sections` | — | — | — |
| 🔒 | POST | `/api/course-content/tests/:testId/sections` | — | — | — |
| 🔒 | PUT | `/api/course-content/sections/:id` | — | — | — |
| 🔒 | DELETE | `/api/course-content/sections/:id` | — | — | — |
| 🔒 | POST | `/api/course-content/questions/upload-image` | — | — | — |
| 🔒 | POST | `/api/course-content/upload` | — | — | — |
| 🔒 | GET | `/api/course-content/question-bank` | — | — | — |
| 🔒 | POST | `/api/course-content/question-bank` | — | — | — |
| 🔒 | DELETE | `/api/course-content/question-bank/:id` | — | — | — |
| 🔒 | POST | `/api/course-content/tests/:testId/questions/from-bank/:bankId` | — | — | — |
| 🔒 | POST | `/api/course-content/sessions/:id/proctor-event` | — | — | — |
| 🔒 | GET | `/api/course-content/sessions/:id/proctor-events` | — | — | — |

## `/api/courses`  ·  courses.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🌐 | GET | `/api/courses` | — | — | — |
| 🌐 | GET | `/api/courses/slug/:slug` | — | — | — |
| 🌐 | GET | `/api/courses/search/nearby` | — | — | — |
| 🌐 | GET | `/api/courses/:id` | — | — | — |
| 🔒 | POST | `/api/courses` | — | — | — |
| 🔒 | PUT | `/api/courses/:id` | — | — | — |
| 🔒 | DELETE | `/api/courses/:id` | — | — | — |
| 🔒 | GET | `/api/courses/:id/students` | — | — | — |
| 🔒 | GET | `/api/courses/:id/analytics` | — | — | — |
| 🔒 | GET | `/api/courses/:id/students/:studentId/detail` | — | — | — |
| 🔒 | POST | `/api/courses/:id/duplicate` | — | — | — |
| 🔒 | GET | `/api/courses/:id/certificate` | — | — | — |
| 🌐 | GET | `/api/courses/:id/reviews` | — | — | — |
| 🔒 | POST | `/api/courses/:id/reviews` | — | — | — |

## `/api/dashboard`  ·  dashboard.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/dashboard` | — | — | — |

## `/api/eduos`  ·  eduos.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/eduos/courses/:courseId/batches` | — | — | — |
| 🔒 | POST | `/api/eduos/courses/:courseId/batches` | — | — | — |
| 🔒 | PUT | `/api/eduos/batches/:batchId` | — | — | — |
| 🔒 | POST | `/api/eduos/batches/:batchId/enroll` | — | — | — |
| 🔒 | GET | `/api/eduos/batches/:batchId/roster` | — | — | — |
| 🔒 | POST | `/api/eduos/qr/generate` | — | — | — |
| 🔒 | POST | `/api/eduos/qr/check-in` | — | — | — |
| 🔒 | GET | `/api/eduos/notify` | — | — | — |
| 🔒 | POST | `/api/eduos/notify/mark-read` | — | — | — |
| 🔒 | POST | `/api/eduos/notify/send` | — | — | — |
| 🔒 | GET | `/api/eduos/forum/:courseId` | — | — | — |
| 🔒 | POST | `/api/eduos/forum/:courseId` | — | — | — |
| 🔒 | GET | `/api/eduos/forum/thread/:threadId` | — | — | — |
| 🔒 | POST | `/api/eduos/forum/thread/:threadId/reply` | — | — | — |
| 🔒 | POST | `/api/eduos/forum/flag/:type/:id` | — | — | — |
| 🔒 | DELETE | `/api/eduos/forum/thread/:threadId` | — | — | — |
| 🔒 | DELETE | `/api/eduos/forum/reply/:replyId` | — | — | — |
| 🔒 | POST | `/api/eduos/polls` | — | — | — |
| 🔒 | POST | `/api/eduos/polls/:pollId/vote` | — | — | — |
| 🔒 | GET | `/api/eduos/polls/:pollId/results` | — | — | — |
| 🔒 | POST | `/api/eduos/polls/:pollId/close` | — | — | — |
| 🔒 | GET | `/api/eduos/report-card/:studentId` | — | — | — |
| 🔒 | GET | `/api/eduos/admissions` | — | — | — |
| 🔒 | POST | `/api/eduos/admissions` | — | — | — |
| 🔒 | PUT | `/api/eduos/admissions/:id` | — | — | — |
| 🔒 | GET | `/api/eduos/fees/plans` | — | — | — |
| 🔒 | POST | `/api/eduos/fees/plans` | — | — | — |
| 🔒 | GET | `/api/eduos/fees/invoices` | — | — | — |
| 🔒 | POST | `/api/eduos/fees/invoices` | — | — | — |
| 🔒 | PUT | `/api/eduos/fees/invoices/:id/pay` | — | — | — |
| 🔒 | POST | `/api/eduos/fees/send-reminders` | — | — | — |
| 🔒 | GET | `/api/eduos/payroll` | — | — | — |
| 🔒 | POST | `/api/eduos/payroll` | — | — | — |
| 🔒 | PUT | `/api/eduos/payroll/:id/pay` | — | — | — |
| 🔒 | GET | `/api/eduos/leave` | — | — | — |
| 🔒 | POST | `/api/eduos/leave` | — | — | — |
| 🔒 | PUT | `/api/eduos/leave/:id/decide` | — | — | — |
| 🌐 | GET | `/api/eduos/tenant/branding` | — | — | — |
| 🔒 | PUT | `/api/eduos/tenant/branding` | — | — | — |
| 🔒 | GET | `/api/eduos/franchise/branches` | — | — | — |
| 🔒 | POST | `/api/eduos/franchise/branches` | — | — | — |
| 🔒 | GET | `/api/eduos/ai/proctor-verdict/:sessionId` | — | — | — |
| 🔒 | POST | `/api/eduos/ai/ocr` | — | — | — |
| 🔒 | GET | `/api/eduos/ai/ocr/my` | — | — | — |
| 🔒 | GET | `/api/eduos/ai/voice-search` | — | — | — |

## `/api/enrollments`  ·  enrollments.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/enrollments/my` | — | — | — |
| 🔒 | POST | `/api/enrollments` | — | — | — |
| 🔒 | GET | `/api/enrollments/course/:courseId/students` | — | — | — |
| 🔒 | DELETE | `/api/enrollments/:enrollmentId` | — | — | — |

## `/api/gamification`  ·  gamification.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/gamification/streak` | — | — | — |
| 🔒 | POST | `/api/gamification/streak/checkin` | — | — | — |
| 🔒 | GET | `/api/gamification/xp` | — | — | — |
| 🔒 | GET | `/api/gamification/badges` | — | — | — |
| 🔒 | GET | `/api/gamification/summary` | — | — | — |

## `/api/i18n`  ·  i18n.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🌐 | GET | `/api/i18n/:lang` | — | — | — |
| 🔒 | PUT | `/api/i18n/:lang` | — | — | — |

## `/api/institutions`  ·  institutions.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/institutions/teachers` | — | — | — |
| 🔒 | POST | `/api/institutions/teachers` | — | — | — |
| 🔒 | DELETE | `/api/institutions/teachers/:linkId` | — | — | — |
| 🔒 | GET | `/api/institutions/students` | — | — | — |
| 🔒 | POST | `/api/institutions/students` | — | — | — |
| 🔒 | GET | `/api/institutions/dashboard` | — | — | — |
| 🔒 | POST | `/api/institutions/import-csv` | — | — | — |
| 🔒 | GET | `/api/institutions/my-institutions` | — | — | — |

## `/api/live-classes`  ·  liveClasses.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | POST | `/api/live-classes/:classId/cast` | — | — | — |
| 🔒 | GET | `/api/live-classes/:classId/cast` | — | — | — |
| 🔒 | POST | `/api/live-classes` | — | — | — |
| 🌐 | GET | `/api/live-classes/course/:courseId` | — | — | — |
| 🔒 | GET | `/api/live-classes/upcoming` | — | — | — |
| 🌐 | GET | `/api/live-classes/:classId` | — | — | — |
| 🔒 | POST | `/api/live-classes/:classId/join` | — | — | — |
| 🔒 | POST | `/api/live-classes/:classId/documents` | — | — | — |
| 🔒 | PUT | `/api/live-classes/:classId` | — | — | — |
| 🔒 | POST | `/api/live-classes/:classId/start` | — | — | — |
| 🔒 | POST | `/api/live-classes/:classId/end` | — | — | — |
| 🔒 | GET | `/api/live-classes/:id/attendees` | — | — | — |
| 🔒 | POST | `/api/live-classes/:classId/recording` | — | — | — |
| 🔒 | GET | `/api/live-classes/recordings/list` | — | — | — |
| 🔒 | POST | `/api/live-classes/:id/summary` | — | — | — |

## `/api/marketplace`  ·  marketplace.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🌐 | GET | `/api/marketplace` | — | — | — |
| 🌐 | GET | `/api/marketplace/facets` | — | — | — |
| 🌐 | GET | `/api/marketplace/trending` | — | — | — |
| 🔒 | GET | `/api/marketplace/my/listings` | — | — | — |
| 🔒 | GET | `/api/marketplace/my/purchases` | — | — | — |
| 🌐 | GET | `/api/marketplace/:id` | — | — | — |
| 🔒 | POST | `/api/marketplace` | — | — | — |
| 🔒 | PUT | `/api/marketplace/:id` | — | — | — |
| 🔒 | DELETE | `/api/marketplace/:id` | — | — | — |
| 🔒 | POST | `/api/marketplace/:id/purchase` | — | — | — |

## `/api/me`  ·  me.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/me/contexts` | — | — | — |
| 🔒 | POST | `/api/me/active-context` | — | — | — |
| 🔒 | GET | `/api/me/widget-prefs` | — | — | — |
| 🔒 | PUT | `/api/me/widget-prefs` | — | — | — |

## `/api/n8n`  ·  n8n.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/n8n/config` | — | — | — |
| 🔒 | POST | `/api/n8n/config` | — | — | — |
| 🔒 | POST | `/api/n8n/test` | — | — | — |
| 🌐 | POST | `/api/n8n/webhook` | — | — | — |
| 🔒 | POST | `/api/n8n/trigger` | — | — | — |
| 🌐 | GET | `/api/n8n/status` | — | — | — |
| 🔒 | POST | `/api/n8n/notify` | — | — | — |
| 🌐 | POST | `/api/n8n/sync-users` | — | — | — |
| 🌐 | POST | `/api/n8n/sync-courses` | — | — | — |

## `/api/notifications`  ·  notifications.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/notifications` | — | — | — |
| 🔒 | GET | `/api/notifications/unread` | — | — | — |
| 🔒 | POST | `/api/notifications/:id/read` | — | — | — |
| 🔒 | POST | `/api/notifications/read-all` | — | — | — |
| 🔒 | DELETE | `/api/notifications/:id` | — | — | — |

## `/api/notifications-admin`  ·  notificationsAdmin.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/notifications-admin/templates` | — | — | — |
| 🔒 | POST | `/api/notifications-admin/templates` | — | — | — |
| 🔒 | PUT | `/api/notifications-admin/templates/:id` | — | — | — |
| 🔒 | DELETE | `/api/notifications-admin/templates/:id` | — | — | — |
| 🔒 | POST | `/api/notifications-admin/broadcast` | — | — | — |
| 🔒 | GET | `/api/notifications-admin/log` | — | — | — |

## `/api/categories`  ·  orgs.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/categories/mine` | — | — | — |
| 🔒 | GET | `/api/categories/:id` | — | — | — |
| 🔒 | POST | `/api/categories` | — | — | — |
| 🔒 | PATCH | `/api/categories/:id` | — | — | — |
| 🔒 | GET | `/api/categories/:id/members` | — | — | — |
| 🔒 | POST | `/api/categories/:id/members` | — | — | — |
| 🔒 | PATCH | `/api/categories/:id/members/:personId` | — | — | — |
| 🔒 | DELETE | `/api/categories/:id/members/:personId` | — | — | — |
| 🔒 | POST | `/api/categories/:id/transfer` | — | — | — |
| 🔒 | GET | `/api/categories/:id/settings` | — | — | — |
| 🔒 | PUT | `/api/categories/:id/settings` | — | — | — |

## `/api/parent`  ·  parentExtras.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | POST | `/api/parent/link` | — | — | — |
| 🔒 | GET | `/api/parent/children` | — | — | — |
| 🔒 | GET | `/api/parent/child/:studentId/snapshot` | — | — | — |

## `/api/payments`  ·  payments.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | POST | `/api/payments/coupons/apply` | — | — | — |
| 🔒 | POST | `/api/payments/coupons` | — | — | — |
| 🔒 | GET | `/api/payments/coupons` | — | — | — |
| 🔒 | DELETE | `/api/payments/coupons/:id` | — | — | — |
| 🌐 | GET | `/api/payments/config` | — | — | — |
| 🔒 | POST | `/api/payments/order` | — | — | — |
| 🔒 | POST | `/api/payments/verify` | — | — | — |
| 🌐 | POST | `/api/payments/webhook` | — | — | — |
| 🔒 | POST | `/api/payments/:id/refund` | — | — | — |
| 🔒 | POST | `/api/payments` | — | — | — |
| 🔒 | GET | `/api/payments/my` | — | — | — |
| 🌐 | POST | `/api/payments/webhook/payment` | — | — | — |
| 🔒 | GET | `/api/payments/:id/receipt` | — | — | — |

## `/api/payouts`  ·  payouts.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/payouts` | — | — | — |
| 🔒 | GET | `/api/payouts/my` | — | — | — |
| 🔒 | POST | `/api/payouts` | — | — | — |
| 🔒 | POST | `/api/payouts/:id/decide` | — | — | — |

## `/api/rag`  ·  rag.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | POST | `/api/rag/index/:courseId` | — | — | — |
| 🔒 | POST | `/api/rag/index-material/:materialId` | — | — | — |
| 🔒 | GET | `/api/rag/status/:courseId` | — | — | — |
| 🔒 | DELETE | `/api/rag/:courseId` | — | — | — |

## `/api/reports`  ·  reports.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | POST | `/api/reports` | — | — | — |
| 🔒 | GET | `/api/reports` | — | — | — |
| 🔒 | POST | `/api/reports/:id/decide` | — | — | — |

## `/api/resources`  ·  resources.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🌐 | GET | `/api/resources` | — | — | — |
| 🔒 | GET | `/api/resources/mine` | — | — | — |
| 🌐 | GET | `/api/resources/:id` | — | — | — |
| 🌐 | GET | `/api/resources/:id/availability` | — | — | — |
| 🔒 | POST | `/api/resources` | — | — | — |
| 🔒 | PUT | `/api/resources/:id` | — | — | — |
| 🔒 | DELETE | `/api/resources/:id` | — | — | — |
| 🌐 | GET | `/api/resources/:id/slots` | — | — | — |
| 🔒 | POST | `/api/resources/:id/slots` | — | — | — |
| 🔒 | DELETE | `/api/resources/:id/slots/:slotId` | — | — | — |

## `/api/search`  ·  search.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🌐 | GET | `/api/search` | — | — | — |
| 🌐 | GET | `/api/search/suggestions` | — | — | — |
| 🌐 | GET | `/api/search/semantic` | — | — | — |
| 🔒 | POST | `/api/search/index-course` | — | — | — |
| 🌐 | GET | `/api/search/categories` | — | — | — |
| 🌐 | GET | `/api/search/all` | — | — | — |

## `/api/seo`  ·  seo.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🌐 | GET | `/api/seo/course/:slug` | — | — | — |
| 🌐 | GET | `/api/seo/org/:slug` | — | — | — |

## `/api/student`  ·  studentExtras.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/student/notes` | — | — | — |
| 🔒 | POST | `/api/student/notes` | — | — | — |
| 🔒 | PUT | `/api/student/notes/:id` | — | — | — |
| 🔒 | DELETE | `/api/student/notes/:id` | — | — | — |
| 🔒 | POST | `/api/student/sessions/start` | — | — | — |
| 🔒 | POST | `/api/student/sessions/end` | — | — | — |
| 🔒 | GET | `/api/student/time-summary` | — | — | — |
| 🔒 | GET | `/api/student/activity-daily` | — | — | — |
| 🔒 | GET | `/api/student/progress` | — | — | — |
| 🔒 | GET | `/api/student/test-history` | — | — | — |
| 🔒 | GET | `/api/student/submission-history` | — | — | — |
| 🔒 | GET | `/api/student/continue-learning` | — | — | — |
| 🔒 | GET | `/api/student/attendance-report` | — | — | — |
| 🔒 | PUT | `/api/student/lectures/:lectureId/note` | — | — | — |
| 🔒 | POST | `/api/student/progress/lecture` | — | — | — |
| 🔒 | GET | `/api/student/progress/:courseId` | — | — | — |
| 🔒 | GET | `/api/student/wishlist` | — | — | — |
| 🔒 | POST | `/api/student/wishlist/:courseId` | — | — | — |
| 🔒 | DELETE | `/api/student/wishlist/:courseId` | — | — | — |
| 🔒 | GET | `/api/student/compare` | — | — | — |
| 🔒 | GET | `/api/student/calendar` | — | — | — |
| 🔒 | GET | `/api/student/today` | — | — | — |

## `/api/studio`  ·  studio.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/studio/scenes` | — | — | — |
| 🔒 | POST | `/api/studio/scenes` | — | — | — |
| 🔒 | GET | `/api/studio/scenes/:id` | — | — | — |
| 🔒 | POST | `/api/studio/scenes/:id/publish` | — | — | — |
| 🔒 | DELETE | `/api/studio/scenes/:id` | — | — | — |

## `/api/support`  ·  support.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/support/tickets` | — | — | — |
| 🔒 | POST | `/api/support/tickets` | — | — | — |
| 🔒 | GET | `/api/support/tickets/:id` | — | — | — |
| 🔒 | POST | `/api/support/tickets/:id/messages` | — | — | — |
| 🔒 | PUT | `/api/support/tickets/:id` | — | — | — |

## `/api/teacher`  ·  teacherExtras.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/teacher/timetable` | — | — | — |
| 🔒 | POST | `/api/teacher/live-classes/recurring` | — | — | — |
| 🔒 | GET | `/api/teacher/attendance/roster/:courseId` | — | — | — |
| 🔒 | POST | `/api/teacher/attendance/bulk-mixed` | — | — | — |
| 🔒 | GET | `/api/teacher/bookings` | — | — | — |
| 🔒 | GET | `/api/teacher/payments` | — | — | — |
| 🔒 | POST | `/api/teacher/attendance/bulk` | — | — | — |
| 🔒 | GET | `/api/teacher/tests/:testId/analytics` | — | — | — |
| 🔒 | GET | `/api/teacher/invoices` | — | — | — |
| 🔒 | POST | `/api/teacher/invoices` | — | — | — |
| 🔒 | PUT | `/api/teacher/invoices/:id` | — | — | — |
| 🔒 | GET | `/api/teacher/invoices/:id/pdf` | — | — | — |
| 🔒 | GET | `/api/teacher/calendar` | — | — | — |
| 🔒 | GET | `/api/teacher/bookings/:id` | — | — | — |
| 🔒 | PUT | `/api/teacher/bookings/:id` | — | — | — |
| 🔒 | POST | `/api/teacher/bookings/:id/cancel` | — | — | — |
| 🔒 | GET | `/api/teacher/essays/pending` | — | — | — |
| 🔒 | POST | `/api/teacher/essays/grade` | — | — | — |
| 🔒 | GET | `/api/teacher/export` | — | — | — |
| 🔒 | POST | `/api/teacher/announcement` | — | — | — |
| 🔒 | GET | `/api/teacher/recordings` | — | — | — |

## `/api/timetable`  ·  timetable.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/timetable/templates` | — | — | — |
| 🔒 | POST | `/api/timetable/templates` | — | — | — |
| 🔒 | GET | `/api/timetable/templates/:id/slots` | — | — | — |
| 🔒 | POST | `/api/timetable/templates/:id/slots` | — | — | — |
| 🔒 | DELETE | `/api/timetable/slots/:slotId` | — | — | — |

## `/api/translations`  ·  translations.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | POST | `/api/translations/content` | — | — | — |
| 🔒 | GET | `/api/translations/content` | — | — | — |
| 🔒 | DELETE | `/api/translations/content/:id` | — | — | — |
| 🔒 | GET | `/api/translations/missing` | — | — | — |

## `/api/users`  ·  users.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/users/profile` | — | — | — |
| 🔒 | PUT | `/api/users/profile` | — | — | — |
| 🔒 | GET | `/api/users/stats` | — | — | — |

## `/api/wallet`  ·  wallet.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🔒 | GET | `/api/wallet` | — | — | — |
| 🔒 | POST | `/api/wallet/topup/order` | — | — | — |
| 🔒 | POST | `/api/wallet/topup/verify` | — | — | — |
| 🔒 | POST | `/api/wallet/spend` | — | — | — |
| 🔒 | GET | `/api/wallet/referrals/my-code` | — | — | — |
| 🔒 | POST | `/api/wallet/referrals/apply` | — | — | — |
| 🌐 | GET | `/api/wallet/plans` | — | — | — |
| 🔒 | GET | `/api/wallet/subscription` | — | — | — |
| 🔒 | POST | `/api/wallet/subscribe` | — | — | — |

## `/api/webhooks`  ·  webhooks.js

| | Method | Path | Role | Capability | Validates |
|---|---|---|---|---|---|
| 🌐 | POST | `/api/webhooks` | — | — | — |

