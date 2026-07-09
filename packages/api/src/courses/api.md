# Courses API

Base path: `/courses`

All routes require `Authorization: Bearer <token>`. Create/Update/Delete/Assign are **Admin only**; List/Get are open to any authenticated user.

---

## POST /courses

Create a new course.

**Auth:** Admin only

**Request body** (`CreateCourseDto`)
```json
{
  "courseName": "Introduction to NestJS",
  "description": "Learn the fundamentals of NestJS.",
  "status": "ACTIVE"
}
```
| Field | Type | Rules |
|---|---|---|
| courseName | string | 2–255 chars |
| description | string? | optional |
| status | enum? | `DRAFT \| ACTIVE \| ARCHIVED`, defaults to `DRAFT` |

**Response `201 Created`**
```json
{
  "success": true,
  "data": {
    "course_id": 1,
    "course_name": "Introduction to NestJS",
    "description": "Learn the fundamentals of NestJS.",
    "status": "ACTIVE",
    "created_by": 1,
    "created_at": "2026-07-09T10:00:00.000Z",
    "updated_at": null
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 400 | validation failure |
| 403 | caller is not Admin |

---

## GET /courses

List courses with pagination and filters.

**Auth:** any authenticated user

**Query params** (`QueryCourseDto`)
| Param | Type | Default | Notes |
|---|---|---|---|
| page | number | 1 | |
| limit | number | 20 | max 100 |
| search | string | — | matches `course_name` (case-insensitive) |
| status | enum | — | `DRAFT \| ACTIVE \| ARCHIVED` |

**Response `200 OK`**
```json
{
  "success": true,
  "data": [ { "course_id": 1, "course_name": "...", "...": "..." } ],
  "meta": { "total": 2, "page": 1, "limit": 20, "totalPages": 1 }
}
```
Excludes soft-deleted courses (`is_deleted: false`), ordered by `created_at desc`.

---

## GET /courses/:id

Get a single course by ID.

**Auth:** any authenticated user

**Response `200 OK`**
```json
{ "success": true, "data": { "course_id": 1, "course_name": "Introduction to NestJS", "...": "..." } }
```

**Errors**
| Status | Cause |
|---|---|
| 404 | unknown or soft-deleted `id` |

---

## PATCH /courses/:id

Update a course.

**Auth:** Admin only

**Request body** (`UpdateCourseDto` — all fields of `CreateCourseDto`, optional)
```json
{ "status": "ARCHIVED" }
```

**Response `200 OK`** — same shape as `POST /courses`, reflecting the update.

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown or soft-deleted `id` |

---

## DELETE /courses/:id

Soft-delete a course (`is_deleted = true`, `deleted_at` set).

**Auth:** Admin only

**Response `200 OK`**
```json
{ "success": true, "message": "Course deleted successfully" }
```

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown or already-deleted `id` |

---

## POST /courses/:id/assign

Enroll a student in a course. Auto-creates a `StudentProfile` on the student's first-ever assignment (using `institutionId`), reuses it after that.

**Auth:** Admin only

**Request body** (`AssignCourseDto`)
```json
{
  "studentUserId": 3,
  "institutionId": 1
}
```
| Field | Type | Rules |
|---|---|---|
| studentUserId | number | `user_id` of a user with the `Student` role |
| institutionId | number | only used if the student has no `StudentProfile` yet |

**Response `201 Created`**
```json
{
  "success": true,
  "data": {
    "enrollment_id": 1,
    "student_profile_id": 10,
    "course_id": 1,
    "enrollment_status": "ASSIGNED",
    "assigned_date": "2026-07-09T10:00:00.000Z",
    "created_by": 1
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 400 | `studentUserId` refers to a user without the `Student` role |
| 403 | caller is not Admin |
| 404 | course not found; student not found; or (only on the student's first-ever assignment) institution not found |
| 409 | student already enrolled in this course |
