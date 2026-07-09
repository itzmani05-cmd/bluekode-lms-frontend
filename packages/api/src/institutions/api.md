# Institutions API

Base path: `/institutions`

All routes require `Authorization: Bearer <token>`. Create/Update/Delete are **Admin only**; List/Get are open to any authenticated user.

---

## POST /institutions

Create a new institution.

**Auth:** Admin only

**Request body** (`CreateInstitutionDto`)
```json
{
  "institutionName": "Bluekode Academy",
  "address": "123 Tech Street",
  "city": "Chennai"
}
```
| Field | Type | Rules |
|---|---|---|
| institutionName | string | 2–255 chars, unique |
| address | string? | optional |
| city | string? | optional, max 100 chars |

**Response `201 Created`**
```json
{
  "success": true,
  "data": {
    "institution_id": 1,
    "institution_name": "Bluekode Academy",
    "address": "123 Tech Street",
    "city": "Chennai",
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
| 409 | `institutionName` already taken |

---

## GET /institutions

List institutions with pagination and search.

**Auth:** any authenticated user

**Query params** (`QueryInstitutionDto`)
| Param | Type | Default | Notes |
|---|---|---|---|
| page | number | 1 | |
| limit | number | 20 | max 100 |
| search | string | — | matches `institution_name` or `city` (case-insensitive) |

**Response `200 OK`**
```json
{
  "success": true,
  "data": [ { "institution_id": 1, "institution_name": "...", "...": "..." } ],
  "meta": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```
Excludes soft-deleted institutions (`is_deleted: false`), ordered by `created_at desc`.

---

## GET /institutions/:id

Get a single institution by ID.

**Auth:** any authenticated user

**Response `200 OK`**
```json
{ "success": true, "data": { "institution_id": 1, "institution_name": "Bluekode Academy", "...": "..." } }
```

**Errors**
| Status | Cause |
|---|---|
| 404 | unknown or soft-deleted `id` |

---

## PATCH /institutions/:id

Update an institution.

**Auth:** Admin only

**Request body** (`UpdateInstitutionDto` — all fields of `CreateInstitutionDto`, optional)
```json
{ "city": "Bengaluru" }
```

**Response `200 OK`** — same shape as `POST /institutions`, reflecting the update.

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown or soft-deleted `id` |
| 409 | new `institutionName` already taken |

---

## DELETE /institutions/:id

Soft-delete an institution (`is_deleted = true`, `deleted_at` set).

**Auth:** Admin only

**Response `200 OK`**
```json
{ "success": true, "message": "Institution deleted successfully" }
```

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown or already-deleted `id` |

Note: soft-deleting an institution does **not** cascade to `StudentProfile`/`InstitutionCourse` rows that reference it — they remain and still resolve via their own `findFirst`/`findUnique` lookups (which don't re-check the parent institution's `is_deleted` flag).
