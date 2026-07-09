# Auth API

Base path: `/auth`

All routes are public unless noted. Login issues a JWT; every other route in the app requires `Authorization: Bearer <token>` unless decorated `@Public()`.

---

## POST /auth/login

Authenticate with email + password and receive a JWT.

**Auth:** Public

**Request body** (`LoginDto`)
```json
{
  "email": "john@bluekode.com",
  "password": "Password@123"
}
```
| Field | Type | Rules |
|---|---|---|
| email | string | valid email |
| password | string | 8–50 chars |

**Response `200 OK`**
```json
{
  "access_token": "eyJhbGciOi...",
  "user": {
    "user_id": 1,
    "full_name": "John",
    "last_name": "Doe",
    "email": "john@bluekode.com",
    "phone": "+919876543210",
    "account_status": "ACTIVE",
    "roles": ["Admin"]
  }
}
```

**Errors**
| Status | Cause |
|---|---|
| 404 | no user with that email |
| 401 | wrong password, or `account_status` is not `ACTIVE` |
| 400 | validation failure (bad email format, password too short) |

JWT payload (`JwtPayload`): `{ sub: number (user_id), email: string, roles: string[] }`. Signed with `JWT_SECRET`, expires per `JWT_EXPIRATION` (default `7d`).

---

## GET /auth/profile

Return the authenticated user's own profile.

**Auth:** Bearer token required (any role)

**Request body:** none

**Response `200 OK`**
```json
{
  "user_id": 1,
  "full_name": "John",
  "last_name": "Doe",
  "email": "john@bluekode.com",
  "phone": "+919876543210",
  "account_status": "ACTIVE",
  "created_at": "2026-06-24T12:04:27.000Z",
  "userRoles": [
    { "role": { "role_id": 1, "role_name": "Admin" } }
  ]
}
```

**Errors**
| Status | Cause |
|---|---|
| 401 | missing / invalid / expired token |
| 404 | user was deleted after the token was issued |

---

## Guards applied globally (`app.module.ts`)

1. `JwtAuthGuard` — verifies the Bearer token, attaches `request.user = JwtPayload`. Skipped for handlers/controllers marked `@Public()`. Throws `401 Unauthorized` with message `"No token provided"` (header missing/malformed) or `"Invalid or expired token"` (verify failed).
2. `RolesGuard` — reads `@Roles(...roles)` metadata; if present, requires `request.user.roles` to include at least one of them. Throws `403 Forbidden` (`"Insufficient role permissions"`) otherwise. No `@Roles()` decorator = any authenticated user may call it.
