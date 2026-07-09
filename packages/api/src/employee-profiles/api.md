# Employee Profiles API

`EmployeeProfile` (table `employee_profiles`) is a 1:1 extension of a `User` for staff (`Trainer`, `Technical Head`, or `Project Head` roles) — tracks `designation`, `specialization`, `years_of_experience`, `joining_date`, `is_active`.

All routes require `Authorization: Bearer <token>`. Create/Update/Delete are **Admin only**; List/Get are open to any authenticated user.

---

## POST /users/:userId/employee-profile

Create an employee profile for a staff user.

**Auth:** Admin only

**Path params:** `userId` (number)

**Request body** (`CreateEmployeeProfileDto`)
```json
{
  "designation": "Senior Trainer",
  "specialization": "Backend Development",
  "yearsOfExperience": 5,
  "joiningDate": "2024-01-15",
  "isActive": true
}
```
| Field | Type | Rules |
|---|---|---|
| designation | string? | max 100 chars |
| specialization | string? | max 100 chars |
| yearsOfExperience | number? | 0–70 |
| joiningDate | date string? | `YYYY-MM-DD` |
| isActive | boolean? | defaults to `true` |

**Response `201 Created`**
```json
{
  "success": true,
  "data": {
    "employee_profile_id": 1,
    "user_id": 2,
    "designation": "Senior Trainer",
    "specialization": "Backend Development",
    "years_of_experience": 5,
    "joining_date": "2024-01-15T00:00:00.000Z",
    "is_active": true,
    "created_at": "2026-07-09T10:00:00.000Z",
    "updated_at": null,
    "user": { "user_id": 2, "full_name": "Jane", "last_name": "Smith", "email": "trainer@bluekode.com" }
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 400 | `userId` refers to a user without a staff role (`Trainer`, `Technical Head`, `Project Head`) |
| 403 | caller is not Admin |
| 404 | user not found |
| 409 | user already has an employee profile (`user_id` is unique) |

---

## GET /users/:userId/employee-profile

**Auth:** any authenticated user

**Errors:** `404` if no profile exists for this user.

---

## GET /employee-profiles

List employee profiles.

**Auth:** any authenticated user

**Query params** (`QueryEmployeeProfileDto`): `page`, `limit`, `search` (designation/specialization), `isActive`

---

## GET /employee-profiles/:id

**Auth:** any authenticated user

**Errors:** `404` if unknown.

---

## PATCH /employee-profiles/:id

**Auth:** Admin only

**Request body** (`UpdateEmployeeProfileDto` — all `CreateEmployeeProfileDto` fields, optional)
```json
{ "isActive": false }
```

**Errors:** `403` (non-admin), `404` (unknown `id`).

---

## DELETE /employee-profiles/:id

Hard delete — `EmployeeProfile` has no `is_deleted` column.

**Auth:** Admin only

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown `id` |
| 409 | profile has existing `EmployeeInstitution` assignments, reviewed `AssignmentSubmission`s, or `TrainerSubstitution` records referencing it |
