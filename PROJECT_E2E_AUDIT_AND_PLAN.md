# JeetMantra End-to-End Audit and Completion Plan

## 1. Purpose
This document captures the current end-to-end architecture, coverage gaps, missing front-end/backend connections, and a prioritized test and completion plan for all user types.

## 2. Architecture Summary

### Backend APIs
The backend exposes these main REST endpoint groups under `/api/`:
- `/api/    auth` (signup, login, verify, refresh, google-login, send-otp, verify-otp)
- `/api/users` (profile fetch/update, stats)
- `/api/courses` (list, get, create, update, delete)
- `/api/enrollments` (my enrollments, create enrollment, course student list, delete)
- `/api/dashboard` (role-based dashboard stats)
- `/api/payments` (create payment, user payments, webhook payment)
- `/api/attendance` (record attendance, query student/course attendance)
- `/api/live-classes` (create/join/manage live class flows)
- `/api/admin` (user list, toggle status, stats)
- `/api/webhooks` (webhook receiver)

### Frontend Architecture
The actual front-end pages discovered in the repository do not appear to call these backend APIs directly. Instead, the UI is wired through:
- `webhook-handler.js` and unified webhook actions
- `admin.html` using `N8N_WEBHOOK_URL` endpoints like `/admin-dashboard`, `/admin-get-users`, `/admin-create-course`, etc.
- `signup.html` using `webhooks.sendWebhook('user-complete-signup', ...)`

### Documentation vs Implementation
- Backend integration examples are present in `BACKEND_INTEGRATION_GUIDE.md` and other docs showing `fetch('http://localhost:5000/api/...')` calls.
- Actual runtime UI code in `jeetmantraclaude-main/*.html` is mostly using webhooks rather than the direct `/api/*` backend.

## 3. Key Findings / Gaps

### 3.1 Missing or placeholder frontend actions
In `admin.html`, these actions are not connected to real backend/webhook calls:
- `editUser(id)` → placeholder toast only
- `editCourse(id)` → placeholder toast only
- `editPartner(id)` → placeholder toast only
- `deleteCourse(id)` → UI toast only, no API call
- `rejectPayment(id)` → UI toast only, no API call
- `saveSettings()` → UI toast only, no backend persistence

### 3.2 Indirect flow / mixed architecture risk
- The front-end currently depends on an n8n unified webhook router at `http://localhost:5678/webhook`.
- There is no evidence that the front-end pages are invoking the backend REST APIs directly in this repository.
- If the backend should be the main application API, the current UI wiring will need a refactor or a clear architectural decision to use webhooks only.

### 3.3 Role-based and functional coverage missing
Visible UI pages show only partial completion for:
- Admin management flows
- Signup and user registration
- Course creation via webhook
- Enrollment and student dashboards may be incomplete or only documented in markdown
- Attendance, payments, and live classes are defined in backend but not obviously connected from the visible HTML pages

### 3.4 Documentation drift
- `COMPONENTS_QUICK_REFERENCE.md`, `COMPONENTS_DOCUMENTATION_INDEX.md`, and `BACKEND_INTEGRATION_GUIDE.md` contain direct `/api` integration examples that are not evidently wired into the actual frontend page code.
- This can lead to confusion during testing and deployment unless the intended architecture is clarified.

## 4. Immediate Action Plan

### 4.1 Confirm intended integration path
- Decide whether frontend should call backend `/api/*` endpoints directly, or whether the webhook router is the canonical integration layer.
- If webhook router is canonical, mark direct `/api/*` docs as architectural examples only.

### 4.2 Verify webhook connectivity
- Confirm that `N8N_WEBHOOK_URL` is reachable from the deployed UI.
- Confirm the n8n workflow `n8n-jeetmantra-unified-router.json` contains the mapped actions used by the front-end.

### 4.3 Fix missing admin actions
Implement or wire the following in `admin.html`:
- `editUser` → call webhook/backend edit user action
- `editCourse` → call webhook/backend update course action
- `editPartner` → call webhook/backend update partner action
- `deleteCourse` → call webhook/backend delete course action
- `rejectPayment` → call webhook/backend reject payment action
- `saveSettings` → persist settings through API or webhook

### 4.4 Validate user flows end-to-end
For each user type, test the following flows manually and/or with automated scripts:
- Student: signup, login, course discovery, enroll, attendance view, payments view, profile update
- Teacher: signup/login, create course, update course, manage enrollments, record attendance, view earnings/live classes
- Partner: signup/login, view bookings, manage availability, receive earnings, approve/reject work
- Admin: login, dashboard metrics, user management, course management, payment approvals, settings

### 4.5 Update documentation and test plans
- Add a clear architecture section in the repo docs explaining whether webhooks or direct backend APIs are used.
- Add a detailed test matrix covering all actions and roles.
- Remove stale direct API examples or make their role explicit.

## 5. Recommended End-to-End Test Matrix

| User Type | Primary Pages / Components | Key Actions | Expected API/Webhook Targets | Notes |
|---|---|---|---|---|
| Student | signup.html, website.html, dashboard.html | sign up, login, enroll, view courses, view profile | `user-complete-signup`, `user-login`, `course-enroll`, `user-profile`, `user-stats` | Validate OTP/Google login if available |
| Teacher | signup.html, dashboard.html | create/update/delete course, view students, mark attendance, live class actions | `course-create`, `course-update`, `course-delete`, `attendance-mark`, `live-class-create` | Ensure ownership checks work |
| Partner | signup.html, dashboard.html | create partner profile, view bookings, update availability, earnings | `partner-join`, `partner-booking-view`, `earnings-fetch` | Validate partner-specific dashboard routes |
| Admin | admin.html | load dashboard, list users/courses/partners/payments, block/unblock/delete, approve payment | `admin-dashboard`, `admin-get-users`, `admin-create-course`, `admin-block-user`, `admin-approve-payment` | Fix the stubbed edit/reject/save actions |

## 6. Priority To-Do List

1. [ ] Confirm whether the repo should use `webhook-handler.js` + n8n or direct Express `/api/*` integration.
2. [ ] Confirm that `n8n-jeetmantra-unified-router.json` exports all webhook actions used by the front-end.
3. [ ] Wire missing UI actions in `admin.html` to real backend/webhook endpoints.
4. [ ] Verify `signup.html`/`webhook-handler.js` signup flow with actual webhook endpoint success and failure handling.
5. [ ] Validate `dashboard.html` (and any student/teacher/partner dashboards) for backend connectivity.
6. [ ] Add a manual E2E test checklist for each role and each key action.
7. [ ] Update documentation to remove outdated direct `/api` examples or annotate them clearly.
8. [ ] Add or update environment setup docs so backend and webhook URL values are explicit.

## 7. Suggested Completion Goals

- Completion goal 1: Confirm architecture and remove ambiguity between webhook-based and direct backend-based integration.
- Completion goal 2: Implement all missing front-end action connectors and replace placeholder handlers.
- Completion goal 3: Achieve end-to-end manual test coverage for Student, Teacher, Partner, and Admin.
- Completion goal 4: Document the final integration pattern in `README.md` or a dedicated architecture guide.

## 8. Notes
- No code changes were made in this audit.
- The backend is present and appears complete for many service areas, but the active UI code depends heavily on webhook routing.
- If the expectation is to avoid n8n routing, a dedicated front-end integration pass is required.
