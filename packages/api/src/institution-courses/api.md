# Institution Courses API

`InstitutionCourse` (table `institution_courses`) is a join between `Institution` and `Course` — which courses are made available at which institution. This is distinct from `StudentCourseEnrollment` (an individual student's enrollment). Unique per `[institution_id, course_id]`. There is no `PATCH` — the pairing is immutable; delete and re-create if it changes.

All routes require `Authorization: Bearer <token>`. Create/Delete are **Admin only**; List/Get are open to any authenticated user.

---

## POST /institutions/:institutionId/courses

Make a course available at an institution.

**Auth:** Admin only

**Path params:** `institutionId` (number)

**Request body** (`CreateInstitutionCourseDto`)
```json
{ "courseId": 1 }
```

**Response `201 Created`**
```json
{
  "success": true,
  "data": {
    "institution_course_id": 1,
    "institution_id": 1,
    "course_id": 1,
    "created_at": "2026-07-09T10:00:00.000Z",
    "updated_at": null,
    "institution": { "institution_id": 1, "institution_name": "Bluekode Academy" },
    "course": { "course_id": 1, "course_name": "Introduction to NestJS", "status": "ACTIVE" }
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | institution or course not found |
| 409 | course already assigned to this institution |

---

## GET /institutions/:institutionId/courses

List courses available at an institution.

**Auth:** any authenticated user

**Query params** (`QueryInstitutionCourseDto`): `page`, `limit`

**Errors:** `404` if institution not found.

---

## GET /courses/:courseId/institutions

List institutions a course is assigned to.

**Auth:** any authenticated user

**Errors:** `404` if course not found.

---

## GET /institution-courses/:id

**Auth:** any authenticated user

**Errors:** `404` if unknown.

---

## DELETE /institution-courses/:id

Hard delete — nothing else in the schema references `institution_course_id`.

**Auth:** Admin only

**Errors:** `403` (non-admin), `404` (unknown `id`).
