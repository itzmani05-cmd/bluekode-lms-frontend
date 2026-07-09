# Employee Institutions API

`EmployeeInstitution` (table `employee_institutions`) assigns an `EmployeeProfile` (staff) to an `Institution`, optionally recording a project lead and technical lead (both themselves `EmployeeProfile` references). Unique per `[employee_profile_id, institution_id]`.

All routes require `Authorization: Bearer <token>`. Create/Update/Delete are **Admin only**; List/Get are open to any authenticated user.

---

## POST /institutions/:institutionId/employees

Assign an employee to an institution.

**Auth:** Admin only

**Path params:** `institutionId` (number)

**Request body** (`CreateEmployeeInstitutionDto`)
```json
{
  "employeeProfileId": 1,
  "projectLeadEmployeeId": 2,
  "technicalLeadEmployeeId": 3,
  "assignedDate": "2026-07-09",
  "status": "ACTIVE"
}
```
| Field | Type | Rules |
|---|---|---|
| employeeProfileId | number | must reference an existing employee profile |
| projectLeadEmployeeId | number? | must reference an existing employee profile, if given |
| technicalLeadEmployeeId | number? | must reference an existing employee profile, if given |
| assignedDate | date string? | defaults to now |
| status | enum? | `ACTIVE \| INACTIVE`, defaults to `ACTIVE` |

**Response `201 Created`**
```json
{
  "success": true,
  "data": {
    "employee_institution_id": 1,
    "employee_profile_id": 1,
    "institution_id": 1,
    "project_lead_employee_id": 2,
    "technical_lead_employee_id": 3,
    "assigned_date": "2026-07-09T00:00:00.000Z",
    "status": "ACTIVE",
    "created_at": "2026-07-09T10:00:00.000Z",
    "updated_at": null,
    "employeeProfile": {
      "employee_profile_id": 1,
      "user": { "user_id": 2, "full_name": "Jane", "last_name": "Smith" }
    },
    "institution": { "institution_id": 1, "institution_name": "Bluekode Academy" }
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | institution not found, employee profile not found, or lead employee id(s) not found |
| 409 | this employee is already assigned to this institution |

---

## GET /institutions/:institutionId/employees

List employees assigned to an institution.

**Auth:** any authenticated user

**Query params**: `page`, `limit`, `status`

**Errors:** `404` if institution not found.

---

## GET /employee-profiles/:employeeProfileId/institutions

List institutions an employee is assigned to.

**Auth:** any authenticated user

**Errors:** `404` if employee profile not found.

---

## GET /employee-institutions/:id

**Auth:** any authenticated user

**Errors:** `404` if unknown.

---

## PATCH /employee-institutions/:id

Update leads, status, or assigned date. `employeeProfileId`/`institutionId` are not changeable — delete and re-create the assignment instead.

**Auth:** Admin only

**Request body** (`UpdateEmployeeInstitutionDto`)
```json
{ "status": "INACTIVE" }
```

**Errors**
| Status | Cause |
|---|---|
| 403 | caller is not Admin |
| 404 | unknown `id`, or new lead employee id(s) not found |

---

## DELETE /employee-institutions/:id

Hard delete — nothing else in the schema references `employee_institution_id`, so this never conflicts on foreign keys.

**Auth:** Admin only

**Errors:** `403` (non-admin), `404` (unknown `id`).
