# Student Course Enrollments API

`StudentCourseEnrollment` (table `student_course_enrollment`) is a student profile's enrollment in a course — tracks status and `completion_percentage`. Unique per `[student_profile_id, course_id]`.

Note: `POST /courses/:id/assign` (see `courses/api.md`) already creates enrollments as part of the "assign a course to a student by user id" flow, auto-creating a `StudentProfile` if needed. This module's `POST` creates an enrollment **directly by `student_profile_id`** (no auto-provisioning) — use whichever fits: `assign` for the student-facing onboarding flow, this endpoint when you already have a `student_profile_id` and want to enroll them in another course.

All routes require `Authorization: Bearer <token>`. Create/Update/Delete are **Admin only**; List/Get are open to any authenticated user.

---

## POST /student-profiles/:studentProfileId/enrollments

**Auth:** Admin only

**Path params:** `studentProfileId` (number)

**Request body** (`CreateEnrollmentDto`)
```json
{
  "courseId": 1,
  "enrollmentStatus": "ASSIGNED",
  "assignedDate": "2026-07-09T10:00:00.000Z"
}
```
| Field | Type | Rules |
|---|---|---|
| courseId | number | must reference an existing, non-deleted course |
| enrollmentStatus | enum? | `ASSIGNED \| IN_PROGRESS \| COMPLETED \| CANCELLED`, defaults to `ASSIGNED` |
| assignedDate | ISO date string? | defaults to now |

**Response `201 Created`**
```json
{
  "success": true,
  "data": {
    "enrollment_id": 5,
    "student_profile_id": 10,
    "course_id": 1,
    "enrollment_status": "ASSIGNED",
    "completion_percentage": "0.00",
    "assigned_date": "2026-07-09T10:00:00.000Z",
    "completed_date": null,
    "created_at": "2026-07-09T10:00:00.000Z",
    "updated_at": null,
    "course": { "course_id": 1, "course_name": "Introduction to NestJS" },
    "studentProfile": {
      "student_profile_id": 10,
      "user": { "user_id": 3, "full_name": "Alex", "last_name": "Johnson", "email": "student@bluekode.com" }
    }
  }
}
```
`completion_percentage` is a Prisma `Decimal` — serializes as a numeric string.

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | student profile or course not found |
| 409 | this profile is already enrolled in this course |

---

## GET /student-profiles/:studentProfileId/enrollments

List a student profile's enrollments.

**Auth:** any authenticated user

**Query params** (`QueryEnrollmentDto`): `page`, `limit`, `enrollmentStatus`

**Response `200 OK`** — paginated list, same item shape as above.

**Errors**
| Status | Cause |
|---|---|
| 404 | student profile not found |

---

## GET /courses/:courseId/enrollments

List a course's enrollments (i.e. its roster).

**Auth:** any authenticated user

**Query params**: same as above

**Errors**
| Status | Cause |
|---|---|
| 404 | course not found |

---

## GET /enrollments/:id

**Auth:** any authenticated user

**Errors**
| Status | Cause |
|---|---|
| 404 | unknown `id` |

---

## PATCH /enrollments/:id

Update status, completion progress, or dates.

**Auth:** Admin only

**Request body** (`UpdateEnrollmentDto`)
```json
{
  "enrollmentStatus": "IN_PROGRESS",
  "completionPercentage": 45.5,
  "completedDate": "2026-08-01T00:00:00.000Z"
}
```
| Field | Type | Rules |
|---|---|---|
| courseId | number? | (inherited from create, rarely changed) |
| enrollmentStatus | enum? | `ASSIGNED \| IN_PROGRESS \| COMPLETED \| CANCELLED` |
| assignedDate | ISO date string? | |
| completionPercentage | number? | 0–100 |
| completedDate | ISO date string? | |

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown `id` |

---

## DELETE /enrollments/:id

Hard delete — `StudentCourseEnrollment` has no `is_deleted` column.

**Auth:** Admin only

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown `id` |
| 409 | enrollment has existing `StudentProgress` or `AssignmentSubmission` rows (foreign key constraint) |
