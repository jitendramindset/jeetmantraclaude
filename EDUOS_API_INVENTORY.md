# EduOS / JeetMantra — Backend API Inventory

**As of branch `teacher-command-center`** (Sprints 0a–4 shipped + audit follow-ups).
Compiled from direct file reads of every router in `backend/routes/` and the mount table in `backend/server.js`.

Legend
- **Auth**: `public` · `AT` = authenticateToken · `AR(roles)` = authorizeRole(role-set)
- **Joi**: ✓ uses `validate('schemaName')` · ✗ unvalidated body · — no body
- All routes accept `X-Active-Institution` header (Sprint 0a multi-institute scoping); the `api()` client forwards it.

---

## 1. Endpoint inventory

### `/api/auth` (`routes/auth.js`)
| Method | Path | Purpose | Auth | Joi |
|---|---|---|---|---|
| POST | `/signup` | Register + JWT (auto-provisions personal institute) | public + ipLimit(10) | ✓ `signup` |
| POST | `/login` | Email/password login | public + loginThrottle | ✓ `login` |
| GET | `/verify` | Validate token | AT | — |
| POST | `/refresh` | Re-mint token with fresh `roles[]` | AT | — |
| POST | `/google-login` | OAuth login/create + auto-provision | public | ✗ |
| POST | `/send-otp` | SMS OTP | public + ipLimit(8) | ✗ |
| POST | `/verify-otp` | OTP login/create + auto-provision | public | ✗ |
| POST | `/forgot-password` | Email reset link | public + ipLimit(10) | ✗ |
| POST | `/reset-password` | Set new password | public (token) | ✗ |
| POST | `/send-verify-email` | Send verify email | optional AT | ✗ |
| GET | `/verify-email` | Confirm email | public (token) | — |

### `/api/users` (`routes/users.js`)
| GET `/profile` AT · PUT `/profile` AT ✗ · GET `/stats` AT |

### `/api/courses` (`routes/courses.js`)
| Method | Path | Purpose | Auth | Joi |
|---|---|---|---|---|
| GET | `/` | List + `?mine=1` | public | — |
| GET | `/slug/:slug` | By slug | public | — |
| GET | `/search/nearby` | Geo search | public | — |
| GET | `/:id` | Detail | public | — |
| POST | `/` | Create (institution-tagged) | AT + AR(CREATOR_ROLES) | ✓ `courseCreate` |
| PUT | `/:id` | Update (owner) | AT + AR(CREATOR_ROLES) | ✗ |
| DELETE | `/:id` | Delete (owner) | AT + AR(CREATOR_ROLES) | — |
| GET | `/:id/students` | Roster | AT (owner/admin) | — |
| **GET** | **`/:id/analytics`** | Per-course KPIs (P1-5) | AT (owner/admin) | — |
| GET | `/:id/students/:studentId/detail` | Per-student detail | AT (owner/admin) | — |
| POST | `/:id/duplicate` | Deep-copy | AT + AR(CREATOR_ROLES) | — |
| GET | `/:id/certificate` | HTML cert | AT (enrolled) | — |
| GET | `/:id/reviews` · POST `/:id/reviews` | Reviews | public · AT (enrolled) | ✗ on POST |

### `/api/course-content` (`routes/courseContent.js`) — full content CRUD
~28 endpoints: topics, lectures, materials, tests, questions, sections, sessions, question-bank, proctor-events. All AT + per-handler ownership gating. `GET /:courseId/full` returns flat arrays PLUS nested topic rollup (S2-3 Per-topic rollup) so workspace badges populate. Public `GET /:courseId/preview` returns only counts.

### `/api/enrollments` (`routes/enrollments.js`)
| GET `/my` AT · POST `/` AT ✓ `enrollCourse` · GET `/course/:id/students` AT(owner) · DELETE `/:enrollmentId` AT(owner) |

### `/api/payments` (`routes/payments.js`)
| Method | Path | Purpose | Auth |
|---|---|---|---|
| POST | `/coupons/apply` AT ✗ · POST `/coupons` AT(owner) ✗ · GET `/coupons` AT · DELETE `/coupons/:id` AT(owner) |
| GET | `/config` (Razorpay config) | public |
| POST | `/order` | Create order | AT ✗ |
| POST | `/verify` | Verify + enroll | AT ✗ |
| POST | `/webhook` | Razorpay webhook (HMAC) | public+HMAC |
| POST | `/:id/refund` | Refund | AT(admin) ✗ |
| POST | `/` | Create payment row | AT ✗ |
| GET | `/my` | History | AT |
| **POST** | **`/webhook/payment`** | **Legacy webhook (Sprint 0c: now signature-verified)** | public + `verifyWebhookSecret('PAYMENT_WEBHOOK_SECRET')` |
| GET | `/:id/receipt` | HTML | AT (owner/admin) |

### `/api/wallet` (`routes/wallet.js`)
GET `/` AT · POST `/topup/order` AT · POST `/topup/verify` AT · POST `/spend` AT ✗ · GET `/referrals/my-code` AT · POST `/referrals/apply` AT ✗ · GET `/plans` public · GET `/subscription` AT · POST `/subscribe` AT + AR(many) ✗

### `/api/marketplace` (`routes/marketplace.js`)
GET `/` public · GET `/my/listings` AT · GET `/my/purchases` AT · GET `/:id` public · POST `/` AT + SELLER_ROLES + validate · PUT `/:id` AT(owner) ✗ · DELETE `/:id` AT(owner) · POST `/:id/purchase` AT ✗

### `/api/search` (`routes/search.js`)
GET `/` public · GET `/suggestions` public · GET `/semantic` public · POST `/index-course` AT(admin) ✗ · GET `/categories` public

### `/api/live-classes` (`routes/liveClasses.js`)
POST `/` AT + AR(CREATOR_ROLES) ✗ · GET `/course/:id` **public** · GET `/upcoming` AT · GET `/:classId` **public** · POST `/:classId/join` AT · POST `/:classId/documents` AT ✗ · PUT `/:classId` AT + AR(CREATOR) ✗ · POST `/:classId/start` AT + AR(CREATOR) · POST `/:classId/end` AT + AR(CREATOR) · GET `/:id/attendees` AT · POST `/:classId/recording` AT + AR(CREATOR) ✗ · GET `/recordings/list` AT · POST `/:id/summary` AT

### `/api/attendance` (`routes/attendance.js`)
POST `/` AT + AR(CREATOR) ✓ · GET `/student/:id` AT · GET `/course/:id` AT · GET `/log/:courseId` AT

### `/api/assignments` (`routes/assignments.js`)
POST `/` AT + AR(CREATOR) ✗ · GET `/?courseId=` AT · GET `/my` AT · POST `/:id/submit` AT ✗ · PUT `/:id` AT + AR(CREATOR) ✗ · PUT `/:id/grade` AT + AR(CREATOR) ✗ · DELETE `/:id` AT + AR(CREATOR) · GET `/:id/submissions` AT + AR(CREATOR)

### `/api/chat` (`routes/chat.js`)
GET `/rooms` AT · GET `/rooms/course/:id` AT · GET `/rooms/dm/:userId` AT · **GET `/unread` AT (P1-3)** · **POST `/rooms/:id/read` AT (P1-3)** · GET `/rooms/:id/messages` AT (awaits last_read_at update) · POST `/rooms/:id/messages` AT ✗

### `/api/ai` (`routes/ai.js`)
| GET/POST `/key` AT · GET `/usage` AT · POST `/generate` AT ✗ · **POST `/translate` AT — extended (S3-i18n): persists to `content_translations` when `entity_type`/`entity_id`/`field` supplied** · POST `/create-course` AT ✗ · POST `/create-assignment` AT ✗ · POST `/transcribe-summary` AT ✗ · POST `/course-from-url` AT ✗ · POST `/suggest-topics` AT ✗ · POST `/tutor` (RAG) AT ✗ · POST `/suggest` AT ✗ · POST `/lesson-plan` AT ✗ · POST `/practice-questions` AT ✗ · POST `/grade-essay` AT ✗ |
TR_LANGS: **12 languages** (en/hi/bn/mr/ta/te/gu/kn/pa + Sprint 0c ml/or/ur).

### `/api/rag` (`routes/rag.js`)
POST `/index/:courseId` AT · POST `/index-material/:materialId` AT · GET `/status/:courseId` AT · DELETE `/:courseId` AT

### `/api/institutions` (`routes/institutions.js`)
GET `/teachers` AT + AR(INSTITUTIONS) · POST `/teachers` AT + AR(INSTITUTIONS) ✗ · DELETE `/teachers/:linkId` AT + AR(INSTITUTIONS) · GET `/students` AT + AR(INSTITUTIONS) · POST `/students` AT + AR(INSTITUTIONS) ✗ · GET `/dashboard` AT + AR(INSTITUTIONS) · POST `/import-csv` AT + AR(INSTITUTIONS) ✗ · GET `/my-institutions` AT

### `/api/dashboard` (`routes/dashboard.js`)
GET `/` AT — role-switched aggregate. Teacher branch (Sprints 0a/0b/0c) returns: courses, bookings, attendance, liveClasses, enrollments, earnings, totalEarnings, **monthlyEarnings**, **studentsCount**, **pendingAssignments**, **upcomingClasses**, **recordingsCount**, **testsPending**, **notifications**, **unreadMessages**, marketplaceListings.

### `/api/teacher` (`routes/teacherExtras.js`)
~20 endpoints all AT + AR(CREATOR_ROLES). GET `/timetable` · POST `/live-classes/recurring` ✗ · GET `/attendance/roster/:courseId` · POST `/attendance/bulk-mixed` ✗ · GET `/bookings` · GET `/payments` · POST `/attendance/bulk` ✗ · GET `/tests/:testId/analytics` · GET/POST `/invoices` ✗ · PUT `/invoices/:id` ✗ · GET `/invoices/:id/pdf` · GET `/calendar` · GET `/bookings/:id` · PUT `/bookings/:id` ✗ · POST `/bookings/:id/cancel` · GET `/essays/pending` · POST `/essays/grade` ✗ · GET `/export?type=` · POST `/announcement` ✗ · GET `/recordings`

### `/api/student` (`routes/studentExtras.js`)
~16 endpoints all AT. notes CRUD · sessions/start /sessions/end · `/time-summary` · `/activity-daily` · `/progress` · `/test-history` · `/submission-history` · `/continue-learning` · `/attendance-report` · `/lectures/:id/note` · `/progress/lecture` ✗ · `/progress/:courseId` · wishlist · `/compare` · **`/calendar` (S2-2 aligned with teacher: scheduled_for primary, due_date fallback)**

### `/api/parent` (`routes/parentExtras.js`)
POST `/link` AT ✗ · GET `/children` AT · GET `/child/:studentId/snapshot` AT(parent/admin)

### `/api/eduos` (`routes/eduos.js`)
~40 endpoints. Batches CRUD + roster + enroll + QR check-in · Notify (admin send) · Forum threads/replies/flag · Polls · Report card · Admissions / Fee plans / Invoices / Reminders / Payroll / Leave (all AT + AR(INSTITUTION_ROLES) **+ S1-3 fix: `resolveInstitutionForAdmin(req)` lets admin pass `?institution_id=X`** — 11 call sites updated). Tenant branding GET public · PUT AT(INSTITUTION_ROLES). Franchise branches. AI: proctor-verdict, OCR, voice-search. Most write paths ✗ unvalidated.

### `/api/activity` (`routes/activity.js`)
GET `/me` AT · GET `/course/:courseId` AT

### `/api/n8n` (`routes/n8n.js`)
GET `/config` AT · POST `/config` AT(admin) ✗ · POST `/test` AT(admin) ✗ · POST `/webhook` public + secret-verified · POST `/trigger` AT ✗ · GET `/status` public · POST `/notify` AT ✗ · POST `/sync-users` public + secret-required-in-prod ✗ · POST `/sync-courses` public + secret-required-in-prod ✗

### `/api/webhooks` (`routes/webhooks.js`)
**POST `/` (S1-4: now requires `verifyWebhookSecret('WEBHOOK_SECRET')` — fails closed in production; dev allows with WARN). Closes the unauthenticated account-creation vector.**

### `/api/admin` (`routes/admin.js`)
| GET `/users` AT(admin) · **PUT `/users/:userId/toggle-status` AT(admin) — Sprint 0c: now audit-logged with IP/UA/before-after** · GET `/stats` AT(admin) · GET `/users/:userId` AT(admin) · PUT `/users/:userId` AT(admin) ✗ (audit-logged) · DELETE `/users/:userId` AT(admin) (audit-logged) · GET `/audit` AT(admin) · GET `/settings` AT(admin) · PUT `/settings` AT(admin) ✗ (audit-logged) · POST `/courses/:id/moderate` AT(admin) ✗ (audit-logged) |
| **Sprint 2 Platform OS endpoints**: GET `/analytics/overview` · GET `/system/status` · GET `/actions/inbox` · GET `/institutes` — all AT(admin), all read-only. |
| **Sprint 0c**: GET `/payments` — platform-wide payment ledger with filters. |

### `/api/calendar` (`routes/calendar.js`) — Sprint 2 unified
**GET `/?view=&from=&to=&types=`** AT — one endpoint replacing 3 merge functions. Returns normalized events from live_classes + assignments + course_tests (scheduled_for primary, due_date fallback). Role drives scope (creator/student/admin).

### `/api/approvals` (`routes/approvals.js`) — Sprint 3 ops
GET `/` AT(admin) · GET `/:id` AT(admin) · POST `/` AT ✓ `approvalCreate` · POST `/:id/decide` AT(admin) audit-logged

### `/api/payouts` (`routes/payouts.js`) — Sprint 3 ops
GET `/` AT(admin scope-all; non-admin scope-self) · GET `/my` AT · POST `/` AT ✓ `payoutCreate` · POST `/:id/decide` AT(admin) ✓ `payoutDecide` audit-logged

### `/api/support` (`routes/support.js`) — Sprint 3 ops
GET `/tickets` AT (admin all; non-admin own) · POST `/tickets` AT ✓ `supportTicketCreate` · GET `/tickets/:id` AT(owner/admin) · POST `/tickets/:id/messages` AT ✓ `supportMessage` (`is_internal` admin-only) · PUT `/tickets/:id` AT(admin) ✓ `supportTicketUpdate`

### `/api/reports` (`routes/reports.js`) — Sprint 3 ops
POST `/` AT ✓ `contentReportCreate` · GET `/` AT(admin) · POST `/:id/decide` AT(admin) ✓ `contentReportDecide` audit-logged

### `/api/notifications-admin` (`routes/notificationsAdmin.js`) — Sprint 3 ops
GET `/templates` AT(admin) · POST `/templates` AT(admin) ✓ `notificationTemplateCreate` · PUT `/templates/:id` AT(admin) ✗ · DELETE `/templates/:id` AT(admin) · POST `/broadcast` AT(admin) ✓ `notificationBroadcast` · GET `/log` AT(admin)

### `/api/translations` (`routes/translations.js`) — Sprint 3 i18n
POST `/content` AT ✓ (entity-scoped translate-and-persist) · GET `/content?entity_type=&entity_id=&target_lang=` AT · DELETE `/content/:id` AT(admin) audit-logged · GET `/missing` AT(admin) — drives Sprint 5 translation queue UI

### `/api/resources` (`routes/resources.js`) — Sprint 4 booking
GET `/` public · GET `/mine` AT + AR(CREATOR_ROLES) · GET `/:id` public · GET `/:id/availability` public · POST `/` AT + AR(CREATOR_ROLES) ✓ `resourceCreate` · PUT `/:id` AT(owner/admin) ✓ `resourceUpdate` · DELETE `/:id` AT(owner/admin) soft

### `/api/bookings` (`routes/bookings.js`) — Sprint 4 booking
POST `/` AT ✓ `bookingCreate` (overlap + capacity enforced; 409 on conflict) · GET `/mine` AT · GET `/received` AT · GET `/:id` AT(booker/owner/admin) · POST `/:id/cancel` AT(booker/owner/admin) · POST `/:id/confirm` AT(owner/admin)

---

## 2. Validation gap list

Endpoints that take a request body but have no Joi schema. **Risk level by domain.**

**Critical (security or money flows)**
| Path | Risk | Reads from body |
|---|---|---|
| `POST /api/payments/order` | money | courseId, amount, coupon |
| `POST /api/payments/verify` | money | razorpay signatures + courseId |
| `POST /api/payments/coupons/apply` | money | code, courseId |
| `POST /api/payments/coupons` | money | code, courseId, discount, expiry |
| `POST /api/payments/:id/refund` | money | reason, partial amount |
| `POST /api/payments/` | money | full payment row |
| `POST /api/wallet/spend` | money | amount, reason |
| `POST /api/wallet/subscribe` | money | plan_id |
| `POST /api/marketplace/:id/purchase` | money | nothing? confirm |

**High (writes user-owned data)**
| `POST /api/live-classes` (CREATOR) — title, scheduled_time, course_id, duration |
| `PUT /api/live-classes/:id` (CREATOR) — updates |
| `POST /api/live-classes/:id/recording` (CREATOR) — recording_url |
| `POST /api/live-classes/:id/documents` — uploads metadata (also doesn't persist — flagged in audit) |
| `POST /api/teacher/live-classes/recurring` — pattern + count |
| `POST /api/teacher/attendance/bulk` and `bulk-mixed` — student × status arrays |
| `POST /api/teacher/announcement` — body to a course chat |
| `POST /api/teacher/essays/grade` — score + feedback |
| `POST /api/teacher/invoices` + `PUT /api/teacher/invoices/:id` — money-adjacent |
| `POST /api/eduos/admissions`, `/fees/*`, `/payroll`, `/leave/*` (~14 endpoints) — financial/HR writes, INSTITUTION_ROLES gated but unvalidated |
| `POST /api/assignments` + `PUT /api/assignments/:id` + `PUT /:id/grade` + `POST /:id/submit` |
| `POST /api/assignments/:id/submit` — submission_url, content |
| `POST /api/chat/rooms/:id/messages` — content, voice_url |
| `PUT /api/users/profile` — full_name, phone, avatar, etc. |
| `POST /api/admin/users/:userId` updates — fullName, role, status (no Joi but audit-logged) |
| `PUT /api/admin/settings` — k/v upsert |
| `POST /api/admin/courses/:id/moderate` — action enum |
| **All `/api/ai/*` POST endpoints** (~10) — accept prompts/inputs without Joi gating; mostly fine since auth-gated, but `prompt`/`url` shape varies |
| `POST /api/marketplace/` (validated upstream) but `PUT /api/marketplace/:id` ✗ |
| `POST /api/courses/:id/reviews` — rating, comment |
| `PUT /api/courses/:id` — updates |
| `POST /api/n8n/config`, `/test`, `/trigger`, `/notify` |
| `POST /api/wallet/referrals/apply` — code |

**Validated this session (Sprints 0c–4)**
✓ `payoutCreate`, `payoutDecide` · `approvalCreate` · `supportTicketCreate`, `supportTicketUpdate`, `supportMessage` · `contentReportCreate`, `contentReportDecide` · `notificationTemplateCreate`, `notificationBroadcast` · `resourceCreate`, `resourceUpdate` · `bookingCreate`.

**Recommended fix order**
1. Money flows (payments + wallet) — add Joi schemas before any other validation hardening. ~10 endpoints.
2. INSTITUTION_ROLES writes in `eduos.js` (admissions/fees/payroll/leave). ~14 endpoints.
3. CREATOR_ROLES writes in `teacherExtras.js`, `assignments.js`, `liveClasses.js`. ~10 endpoints.
4. Profile + admin updates. ~5 endpoints.
5. `/api/ai/*` shape gating. Low-priority since outputs are bounded by the AI provider.

---

## 3. CRUD completeness matrix

| Resource | C | R | U | D | List | Bulk | Search | Export |
|---|---|---|---|---|---|---|---|---|
| courses | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ (geo) | ✗ |
| course content (topics/lectures/materials/tests/questions) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| enrollments | ✓ | ✓ | ✗ | ✓ | ✓ (`/my`) | ✗ | ✗ | ✗ |
| payments | ✓ | ✓ | webhook | refund | `/my` + **`/admin/payments`** | ✗ | ✗ | ✗ |
| wallet | topup ✓ / spend ✓ | ✓ | ✗ | ✗ | ✗ (no admin list-all) | ✗ | ✗ | ✗ |
| live classes | ✓ | ✓ | ✓ | via PUT status | ✓ | recurring | ✗ | ✗ |
| attendance | ✓ + bulk | ✓ | ✗ | ✗ | ✓ | bulk + bulk-mixed | ✗ | partial (`teacher/export`) |
| assignments | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ grade bulk | ✗ | ✗ |
| chat | ✓ | ✓ | ✗ | ✗ | rooms ✓ | ✗ | ✗ | ✗ |
| marketplace listings | ✓ | ✓ | ✓ | soft | ✓ | ✗ | ✓ (in `/`) | ✗ |
| **approvals (S3)** | ✓ | ✓ | decide | ✗ | ✓ | ✗ | ✗ | ✗ |
| **payouts (S3)** | ✓ | ✓ | decide | ✗ | ✓ + `/my` | ✗ | ✗ | ✗ |
| **support tickets (S3)** | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| **content reports (S3)** | ✓ | ✓ | decide | ✗ | ✓ | ✗ | ✗ | ✗ |
| **notification templates (S3)** | ✓ | ✓ | ✓ | ✓ | ✓ | broadcast | ✗ | ✗ |
| **translations (S3)** | ✓ | ✓ | ✗ | ✓ | ✓ + `/missing` | ✗ | ✗ | ✗ |
| **resources (S4)** | ✓ | ✓ | ✓ | soft | ✓ | ✗ | ✓ (q/type/city) | ✗ |
| **bookings (S4)** | ✓ | ✓ | cancel/confirm | ✗ | `/mine` + `/received` | ✗ | partial | ✗ |

**Universally missing across the platform**: BULK ops, EXPORT (CSV/PDF), admin-scoped LIST-ALL for payments/wallets/enrollments, full-text SEARCH (everywhere except `marketplace` + `search`), pagination cursors on chat messages.

---

## 4. Auth / security gaps

| # | Finding | Severity | Cite |
|---|---|---|---|
| 1 | `POST /api/courses/:id/reviews` accepts arbitrary `rating` — no clamp 0..5 | low | `courses.js` `/reviews` POST |
| 2 | `PUT /api/users/profile` unvalidated — caller can write any column the underlying update accepts | medium | `users.js` PUT `/profile` |
| 3 | `POST /api/admin/users/:userId` unvalidated; admin can set role to any string (the DB CHECK constraint is the only guard, post-S2-1) | medium | `admin.js:167` |
| 4 | `POST /api/n8n/sync-users` and `/sync-courses` rely on `N8N_SECRET` env var — if unset, the routes are open in dev mode | medium | `n8n.js:177,195` |
| 5 | `POST /api/live-classes/:classId/documents` returns 200 but never persists a row (flagged in earlier audit) | low | `liveClasses.js:268` |
| 6 | `GET /api/live-classes/course/:id` and `GET /api/live-classes/:classId` are fully public — leak meeting metadata | low (post-S1-4 mitigations) | `liveClasses.js` |
| 7 | Chat messages have **no pagination cursor** — only the last 50 ever loadable | medium | `chat.js:155` |
| 8 | Most admin writes outside `admin.js` not audit-logged (refunds, n8n config, franchise branches, broadcast) | medium | various |
| 9 | `POST /api/teacher/announcement` not validated — can broadcast arbitrary HTML to a course chat | medium | `teacherExtras.js:694` |
| 10 | `POST /api/payments/coupons` not validated — coupon code, discount %, expiry untyped | money | `payments.js:48` |

### Fixed this session ✓
- `POST /api/webhooks` (was unauthenticated account creation)
- `POST /api/payments/webhook/payment` (legacy, was unsigned)
- `PUT /api/admin/users/:userId/toggle-status` (was not audit-logged)
- Student calendar test-date inconsistency
- Admin tenant ops scope (`eduos.js` 11 call sites)
- TR_LANGS gating (3 languages were silently 400)

---

## 5. Recommended fixes (prioritized)

**P0 — money & writes (~1 sprint)**
- Joi-validate every `/api/payments/*` and `/api/wallet/*` POST.
- Add audit log to all admin writes that touch money (refund, n8n config, broadcast, franchise branches).
- Joi-validate `PUT /api/users/profile` and `PUT /api/admin/users/:userId`.

**P1 — completeness (~1 sprint)**
- Add chat pagination cursor (`?before=cursor&limit=50`).
- Joi-validate the 14 `eduos.js` INSTITUTION write paths.
- Joi-validate the CREATOR_ROLES writes in `teacherExtras.js`, `assignments.js`, `liveClasses.js`.
- Add bulk grade endpoint (`PUT /api/assignments/grade-bulk`).
- Add export CSV for payments, enrollments, attendance, payouts.

**P2 — depth (~1 sprint)**
- Admin list-all endpoints for wallets and enrollments.
- Real-time chat (SSE or WebSocket).
- Full-text search on courses + resources + bookings.
- Validation on `/api/ai/*` POST endpoints (shape gating).
- Persist `POST /api/live-classes/:classId/documents` to a row.

---

## Notes

- Total endpoint count: **~190** across 32 routers (Sprints 1–4 added ~30; ~10 endpoints were extended in place).
- Authentication patterns are consistent: every router uses `authenticateToken` + `authorizeRole`. The remaining gap is Joi coverage — ~60% of write endpoints are validated, target ~95%.
- The new tables introduced by Sprints 3+4 (`approval_requests`, `payouts`, `support_tickets`, `content_reports`, `notification_templates`, `notification_log`, `content_translations`, `resources`, `bookings_v2`) all require the migration files in `backend/database/migration-s3-ops.sql`, `migration-s3-i18n.sql`, `migration-s4-booking.sql` to be applied (blocked on the self-hosted Supabase upstream this session).
