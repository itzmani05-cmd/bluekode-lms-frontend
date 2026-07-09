# Student Profiles API

A `StudentProfile` is a 1:1 extension of a `User` with the `Student` role — it links the student to an `Institution` and tracks `department`, `academic_year`, and `form_status`. `StudentCourseEnrollment` rows point at `student_profile_id`, not `user_id` directly.

Routes are split between nested-under-user (create/get-by-user) and top-level `student-profiles` (list/get-by-id/update/delete), matching the `courses → modules → lessons` nesting convention used elsewhere.

All routes require `Authorization: Bearer <token>`. Create/Update/Delete are **Admin only**; List/Get are open to any authenticated user.

---

## POST /users/:userId/student-profile

Create a student profile for a user. The user must already exist and hold the `Student` role.

**Auth:** Admin only

**Path params:** `userId` (number)

**Request body** (`CreateStudentProfileDto`)
```json
{
  "institutionId": 1,
  "department": "Computer Science",
  "academicYear": 2026,
  "formStatus": "PENDING"
}
```
| Field | Type | Rules |
|---|---|---|
| institutionId | number | must reference an existing, non-deleted institution |
| department | string? | optional, max 100 chars |
| academicYear | number? | optional, 1900–3000 |
| formStatus | enum? | `PENDING \| SUBMITTED \| VERIFIED`, defaults to `PENDING` |

**Response `201 Created`**
```json
{
  "success": true,
  "data": {
    "student_profile_id": 10,
    "user_id": 3,
    "institution_id": 1,
    "department": "Computer Science",
    "academic_year": 2026,
    "form_status": "PENDING",
    "created_at": "2026-07-09T10:00:00.000Z",
    "updated_at": null,
    "user": { "user_id": 3, "full_name": "Alex", "last_name": "Johnson", "email": "student@bluekode.com" },
    "institution": { "institution_id": 1, "institution_name": "Bluekode Academy" }
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 400 | `userId` refers to a user without the `Student` role |
| 403 | caller is not Admin |
| 404 | user not found, or `institutionId` not found |
| 409 | user already has a student profile (`user_id` is unique on `StudentProfile`) |

---

## GET /users/:userId/student-profile

Get the student profile belonging to a user.

**Auth:** any authenticated user

**Path params:** `userId` (number)

**Response `200 OK`** — same shape as the `POST` response.

**Errors**
| Status | Cause |
|---|---|
| 404 | no student profile exists for this user |

---

## GET /student-profiles

List all student profiles with pagination and filters.

**Auth:** any authenticated user

**Query params** (`QueryStudentProfileDto`)
| Param | Type | Default | Notes |
|---|---|---|---|
| page | number | 1 | |
| limit | number | 20 | max 100 |
| search | string | — | matches `department` (case-insensitive) |
| institutionId | number | — | filter by institution |
| formStatus | enum | — | `PENDING \| SUBMITTED \| VERIFIED` |

**Response `200 OK`**
```json
{
  "success": true,
  "data": [ { "student_profile_id": 10, "user_id": 3, "...": "..." } ],
  "meta": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

---

## GET /student-profiles/:id

Get a single student profile by ID.

**Auth:** any authenticated user

**Response `200 OK`** — same shape as `POST users/:userId/student-profile`.

**Errors**
| Status | Cause |
|---|---|
| 404 | unknown `id` |

---

## PATCH /student-profiles/:id

Update a student profile — change institution, department, academic year, or form status.

**Auth:** Admin only

**Request body** (`UpdateStudentProfileDto` — all fields of `CreateStudentProfileDto`, optional)
```json
{ "formStatus": "VERIFIED" }
```

**Response `200 OK`** — same shape as the create response, reflecting the update.

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown profile `id`, or new `institutionId` not found |

---

## DELETE /student-profiles/:id

Delete a student profile. This is a **hard delete** — `StudentProfile` has no `is_deleted` column in the schema.

**Auth:** Admin only

**Response `200 OK`**
```json
{ "success": true, "message": "Student profile deleted successfully" }
```

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown `id` |
| 409 | profile has existing `StudentCourseEnrollment` rows (foreign key constraint) — remove/reassign enrollments first |

---

## Relationship to `POST /courses/:id/assign`

`CoursesService.assignToStudent` (see `courses/api.md`) auto-creates a `StudentProfile` with `form_status: VERIFIED` the *first* time a student is assigned to any course, using the `institutionId` passed in that request — it does not call this module's service. If a profile already exists (created either via this API or by a prior course assignment), `assignToStudent` reuses it unchanged. Pre-creating a profile here with a specific `department`/`academicYear`/`formStatus` before the student's first course assignment is the way to control those fields; letting `assignToStudent` create it implicitly always yields `VERIFIED` with no `department`/`academicYear`.
