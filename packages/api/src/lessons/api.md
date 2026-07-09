# Lessons API

Lessons live under a module (`Lesson` maps to the `lectures` table — one shape covers two kinds of content, switched by `contentType`). Unique per `[module_id, display_order]`.

All routes require `Authorization: Bearer <token>`. Create/Update/Delete are **Admin only**; List/Get are open to any authenticated user.

---

## POST /modules/:moduleId/lessons

Create a lesson under a module. Body shape depends on `contentType`.

**Auth:** Admin only

**Path params:** `moduleId` (number)

**Request body** (`CreateLessonDto`)

Common fields:
| Field | Type | Rules |
|---|---|---|
| contentType | enum | `LECTURE \| ASSIGNMENT` (required) |
| title | string | required, max 255 chars |
| description | string? | optional |
| displayOrder | number? | optional — auto-assigned as `(highest existing order in this module) + 1` if omitted |
| pdfUrl | string? | optional |
| estimatedDurationMinutes | number? | optional |
| lectureStatus | enum? | `DRAFT \| PUBLISHED \| ARCHIVED`, defaults to `DRAFT` |

Fields required only when `contentType = ASSIGNMENT` (validated via `@ValidateIf`):
| Field | Type | Rules |
|---|---|---|
| dueDate | ISO date string | required for ASSIGNMENT |
| maxMarks | number | required for ASSIGNMENT, min 1 |
| assignmentStatus | enum? | `PUBLISHED \| ACTIVE \| ARCHIVED \| DRAFT \| CLOSED` |
| lateSubmissionAllowed | boolean? | defaults to `false` |
| lateSubmissionDeadline | ISO date string? | optional |

Example — `LECTURE`:
```json
{
  "contentType": "LECTURE",
  "title": "Setting up your development environment",
  "description": "Install Node.js, clone the repo, and run the dev server.",
  "estimatedDurationMinutes": 30,
  "lectureStatus": "PUBLISHED"
}
```

Example — `ASSIGNMENT`:
```json
{
  "contentType": "ASSIGNMENT",
  "title": "Assignment 1: Build a REST endpoint",
  "dueDate": "2026-08-01T23:59:59.000Z",
  "maxMarks": 100,
  "assignmentStatus": "PUBLISHED",
  "lateSubmissionAllowed": true,
  "lateSubmissionDeadline": "2026-08-03T23:59:59.000Z"
}
```

**Response `201 Created`**
```json
{
  "success": true,
  "data": {
    "lecture_id": 1,
    "module_id": 1,
    "content_type": "LECTURE",
    "title": "Setting up your development environment",
    "description": "Install Node.js, clone the repo, and run the dev server.",
    "display_order": 1,
    "pdf_url": null,
    "estimated_duration_minutes": 30,
    "lecture_status": "PUBLISHED",
    "due_date": null,
    "max_marks": null,
    "assignment_status": null,
    "late_submission_allowed": false,
    "late_submission_deadline": null,
    "created_at": "2026-07-09T10:00:00.000Z",
    "updated_at": null
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 400 | validation failure (e.g. `ASSIGNMENT` missing `dueDate`/`maxMarks`) |
| 403 | caller is not Admin |
| 404 | `moduleId` doesn't exist or is soft-deleted |
| 409 | `displayOrder` already taken within this module |

---

## GET /modules/:moduleId/lessons

List all lessons for a module, ordered by `display_order asc`.

**Auth:** any authenticated user

**Path params:** `moduleId` (number)

**Query params** (`QueryLessonDto`)
| Param | Type | Default | Notes |
|---|---|---|---|
| page | number | 1 | |
| limit | number | 20 | max 100 |
| search | string | — | matches `title` (case-insensitive) |
| contentType | enum | — | `LECTURE \| ASSIGNMENT` |
| lectureStatus | enum | — | `DRAFT \| PUBLISHED \| ARCHIVED` |

**Response `200 OK`**
```json
{
  "success": true,
  "data": [ { "lecture_id": 1, "title": "...", "...": "..." } ],
  "meta": { "total": 2, "page": 1, "limit": 20, "totalPages": 1 }
}
```

**Errors**
| Status | Cause |
|---|---|
| 404 | `moduleId` doesn't exist |

---

## GET /lessons/:id

Get a single lesson by ID.

**Auth:** any authenticated user

**Response `200 OK`**
```json
{ "success": true, "data": { "lecture_id": 1, "title": "Setting up your development environment", "...": "..." } }
```

**Errors**
| Status | Cause |
|---|---|
| 404 | unknown or soft-deleted `id` |

---

## PATCH /lessons/:id

Update a lesson.

**Auth:** Admin only

**Request body** (`UpdateLessonDto` — all fields of `CreateLessonDto`, optional)
```json
{ "lectureStatus": "ARCHIVED" }
```

**Response `200 OK`** — same shape as `POST .../lessons`, reflecting the update.

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown or soft-deleted `id` |
| 409 | `displayOrder` collides with another lesson in the same module |

---

## DELETE /lessons/:id

Soft-delete a lesson (`is_deleted = true`, `deleted_at` set).

**Auth:** Admin only

**Response `200 OK`**
```json
{ "success": true, "message": "Lesson deleted successfully" }
```

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown or already-deleted `id` |
