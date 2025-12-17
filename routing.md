# IRC Employee System – API Structure

_Last updated: December 2025_

This document describes the finalized backend API routes designed for the IRC Employee System.  
It reflects the simplified hierarchical structure that supports both **Global Admin** and **Province Admin** flows.

**Status**: ✅ All API endpoints implemented and fully integrated with React + Material-UI frontend.

## 🔐 Auth Routes

### POST `/auth/login`

Authenticate user.

**Body**

```json
{
	"username": "string",
	"password": "string"
}
```

**Returns**

```json
{
	"role": "GLOBAL_ADMIN | PROVINCE_ADMIN",
	"provinceId": "string | null"
}
```

### POST `/auth/logout`

Destroys the session and clears cookies.

---

## 🌍 Province Routes

### GET `/provinces`

Returns the list of all provinces.

Access:

- Global Admin: allowed
- Province Admin: denied

Used by: GlobalAdminDashboardPage

---

## 👥 Employee Routes (Hierarchical Design)

All employee operations are nested under a province:

```
/provinces/:provinceId/employees
/provinces/:provinceId/employees/:employeeId
```

This ensures clean scoping and simpler access control.

### 1. List Employees of a Province

GET `/provinces/:provinceId/employees`

### 2. Create Employee

POST `/provinces/:provinceId/employees`

### 3. Get Single Employee

GET `/provinces/:provinceId/employees/:employeeId`

### 4. Update Employee

PUT `/provinces/:provinceId/employees/:employeeId`

### 5. Delete Employee

DELETE `/provinces/:provinceId/employees/:employeeId`

---

## 🧭 Client Flow Summary

### Global Admin

- GET `/provinces`
- Navigate to `/provinces/:provinceId/employees`
- **Full CRUD** on employees (create, read, update, delete)
- **Performance management** (add, edit, delete records)

### Province Admin

- Redirect to `/provinces/:provinceId/employees`
- **Full CRUD** on employees only inside their province
- **Performance management** for their province's employees

### UI Features

- Material-UI components with custom theme
- Reusable dialogs (EditEmployeeDialog, PerformanceDialog, ConfirmDialog)
- Custom hooks for data fetching (useEmployee, useApiMutation)
- Loading and error states with feedback components

---

## 🔒 Access Control Summary

| Role           | Can Access                | Notes                           |
| -------------- | ------------------------- | ------------------------------- |
| GLOBAL_ADMIN   | All provinces & employees | Full CRUD in any province       |
| PROVINCE_ADMIN | Only their province       | CRUD only inside their province |

---

## 📁 URL Structure Overview

```
/
└── auth
    ├── POST /auth/login
    └── POST /auth/logout

└── provinces
    ├── GET /provinces
    └── /:provinceId
         └── employees
             ├── GET /provinces/:provinceId/employees
             ├── POST /provinces/:provinceId/employees
             ├── GET /provinces/:provinceId/employees/:employeeId
             ├── PUT /provinces/:provinceId/employees/:employeeId
             └── DELETE /provinces/:provinceId/employees/:employeeId
```
