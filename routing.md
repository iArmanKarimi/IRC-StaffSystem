# IRC Employee System - API Structure

This document summarizes the route layout currently implemented by the backend.

## Auth Routes

- `POST /auth/login`
- `POST /auth/logout`

## Province Routes

- `GET /provinces`
- `GET /provinces/:provinceId`

Province image URLs are attached in province responses when a matching file exists in `server/src/img`.

## Province-Scoped Employee Routes

- `GET /provinces/:provinceId/employees`
- `GET /provinces/:provinceId/employees/export-excel`
- `POST /provinces/:provinceId/employees`
- `GET /provinces/:provinceId/employees/:employeeId`
- `PUT /provinces/:provinceId/employees/:employeeId`
- `DELETE /provinces/:provinceId/employees/:employeeId`

Both `globalAdmin` and `provinceAdmin` can access employee routes, but province admins are limited to their own province.

## Global Routes

- `GET /employees/export-all`
- `DELETE /employees/clear-performances`
- `GET /global-settings`
- `POST /global-settings/toggle-performance-lock`
- `GET /admin-dashboard/stats`
- `GET /health`
- `GET /api-docs`

## Access Summary

| Route area | globalAdmin | provinceAdmin | public |
| --- | --- | --- | --- |
| `/auth/*` | yes | yes | yes |
| `/provinces` | yes | no | no |
| `/provinces/:provinceId/employees/*` | yes | own province only | no |
| `/employees/export-all` | yes | no | no |
| `/employees/clear-performances` | yes | no | no |
| `/global-settings` | yes | yes | yes |
| `/global-settings/toggle-performance-lock` | yes | no | no |
| `/admin-dashboard/stats` | yes | no | no |
| `/health` | yes | yes | yes |

## Notes

- Employee routes are deliberately nested under provinces to keep access control simple.
- The current implementation also includes global employee export/reset actions outside the province namespace.
- When behavior and documentation diverge, prefer `server/src/routes` and `server/src/middleware/auth.ts`.
