# Modules API

Modules live under a course (`Module` maps to the `modules` table, unique per `[course_id, module_order]`).

All routes require `Authorization: Bearer <token>`. Create/Update/Delete are **Admin only**; List/Get are open to any authenticated user.

---

## POST /courses/:courseId/modules

Create a module under a course.

**Auth:** Admin only

**Path params:** `courseId` (number)

**Request body** (`CreateModuleDto`)
```json
{
  "moduleName": "Module 1: Getting Started",
  "moduleDescription": "Overview of the course and environment setup.",
  "moduleOrder": 1
}
```
| Field | Type | Rules |
|---|---|---|
| moduleName | string | 2–255 chars |
| moduleDescription | string? | optional |
| moduleOrder | number? | optional — auto-assigned as `(highest existing order in this course) + 1` if omitted |

**Response `201 Created`**
```json
{
  "success": true,
  "data": {
    "module_id": 1,
    "course_id": 1,
    "module_name": "Module 1: Getting Started",
    "module_description": "Overview of the course and environment setup.",
    "module_order": 1,
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
| 404 | `courseId` doesn't exist or is soft-deleted |
| 409 | `moduleOrder` already taken within this course |

---

## GET /courses/:courseId/modules

List all modules for a course, ordered by `module_order asc`.

**Auth:** any authenticated user

**Path params:** `courseId` (number)

**Query params** (`QueryModuleDto`)
| Param | Type | Default | Notes |
|---|---|---|---|
| page | number | 1 | |
| limit | number | 20 | max 100 |
| search | string | — | matches `module_name` (case-insensitive) |

**Response `200 OK`**
```json
{
  "success": true,
  "data": [ { "module_id": 1, "module_name": "...", "...": "..." } ],
  "meta": { "total": 2, "page": 1, "limit": 20, "totalPages": 1 }
}
```

**Errors**
| Status | Cause |
|---|---|
| 404 | `courseId` doesn't exist |

---

## GET /modules/:id

Get a single module by ID.

**Auth:** any authenticated user

**Response `200 OK`**
```json
{ "success": true, "data": { "module_id": 1, "module_name": "Getting Started", "...": "..." } }
```

**Errors**
| Status | Cause |
|---|---|
| 404 | unknown or soft-deleted `id` |

---

## PATCH /modules/:id

Update a module.

**Auth:** Admin only

**Request body** (`UpdateModuleDto` — all fields of `CreateModuleDto`, optional)
```json
{ "moduleName": "Module 1: Setup & Orientation" }
```

**Response `200 OK`** — same shape as `POST .../modules`, reflecting the update.

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown or soft-deleted `id` |
| 409 | `moduleOrder` collides with another module in the same course |

---

## DELETE /modules/:id

Soft-delete a module (`is_deleted = true`, `deleted_at` set). **Does not cascade** — lessons under the module remain and are still reachable via `GET /lessons/:id`.

**Auth:** Admin only

**Response `200 OK`**
```json
{ "success": true, "message": "Module deleted successfully" }
```

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown or already-deleted `id` |
