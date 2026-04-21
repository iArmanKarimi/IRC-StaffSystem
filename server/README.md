# Server Documentation

This folder contains the Express + TypeScript backend for the IRC Staff System.

## Purpose

- Handle authentication and session management
- Scope data access by role and province
- Expose province and employee CRUD operations
- Provide dashboard statistics and admin tools
- Serve API documentation and health checks

## Stack

- Node.js + Express
- TypeScript
- MongoDB with Mongoose
- Express Session (Mongo store)
- Excel export with `exceljs`
- Jest + Supertest tests

## Project Layout

- `src/app.ts` - Express app setup and middleware
- `src/index.ts` - Server bootstrap + DB connection startup
- `src/data-source.ts` - Mongoose connection utility
- `src/config/index.ts` - Runtime config and env handling
- `src/models/*` - Mongoose schemas (`User`, `Province`, `Employee`, sub-schemas)
- `src/routes/*` - Route handlers
- `src/middleware/*` - Authentication, validation, rate limiting, logging
- `src/utils/*` - Shared helpers (errors, responses, pagination, date/Excel utilities)
- `src/scripts/*` - One-off scripts (`seed-db`, `seed-emp`, `clear-db`)
- `src/__tests__/*` - Supertest suites

## Environment Variables

- `NODE_ENV` (`development` | `production` | `test`)  
- `PORT` (default: `3000`)
- `SESSION_SECRET` (required in production)
- `CORS_ORIGIN` (default: `http://localhost:5173`)
- `MONGODB_URI` (default: `mongodb://localhost:27017/ircdb`)
- `TEST_MONGODB_URI` (used by tests if set; fallback is `mongodb://localhost:27017/irc-test`)

## Available Scripts

Run from `server/`:

- `npm run dev` - start dev server with `ts-node`
- `npm run build` - compile to `dist/`
- `npm start` - run compiled `dist/index.js`
- `npm run seed:db` - seed application data
- `npm run seed:emp` - seed employees
- `npm run clear:db` - clear collections
- `npm test` - run all Jest tests
- `npm run test:watch` - run Jest in watch mode

## Routing Notes

Route mounting now ensures province-scoped employee routes are registered before generic province routes to avoid path collisions.

Route constants are also documented in `src/routes/index.ts`.

## Access Control Matrix

| Route | Global Admin | Province Admin | Public |
| --- | --- | --- | --- |
| `POST /auth/login` | ✓ | ✓ | ✓ |
| `POST /auth/logout` | ✓ | ✓ | ✓ |
| `GET /auth/me` | ✓ | ✓ | ✗ |
| `GET /provinces` | ✓ | ✗ | ✗ |
| `GET /provinces/:provinceId` | ✓ | ✓ (own province) | ✗ |
| `POST /provinces/:provinceId/toggle-lock` | ✓ | ✓ (own province) | ✗ |
| `POST /provinces/bulk-lock` | ✓ | ✗ | ✗ |
| `GET /provinces/:provinceId/employees` | ✓ | ✓ (own province) | ✗ |
| `GET /provinces/:provinceId/employees/:employeeId` | ✓ | ✓ (own province) | ✗ |
| `POST /provinces/:provinceId/employees` | ✓ | ✓ (own province) | ✗ |
| `PUT /provinces/:provinceId/employees/:employeeId` | ✓ | ✓ (own province, unlocked only) | ✗ |
| `DELETE /provinces/:provinceId/employees/:employeeId` | ✓ | ✓ (own province) | ✗ |
| `GET /provinces/:provinceId/employees/export-excel` | ✓ | ✓ (own province) | ✗ |
| `GET /employees/export-all` | ✓ | ✗ | ✗ |
| `DELETE /employees/clear-performances` | ✓ | ✗ | ✗ |
| `GET /admin-dashboard/stats` | ✓ | ✗ | ✗ |
| `GET /api-docs`, `/api-docs/json`, `/api-docs/swagger` | ✓ | ✓ | ✓ |
| `GET /health` | ✓ | ✓ | ✓ |

### Auth

- `POST /auth/login` (public)
- `POST /auth/logout` (public)
- `GET /auth/me` (authenticated, returns current session role/province)

### Provinces

- `GET /provinces` (global admin only)
- `GET /provinces/:provinceId` (global admin + province admin own province)
- `POST /provinces/:provinceId/toggle-lock` (global/province admin for allowed province)
- `POST /provinces/bulk-lock` (global admin only)

### Employees (province scoped)

- `GET /provinces/:provinceId/employees` (province admin own / global admin all)
- `GET /provinces/:provinceId/employees?search=...` (search + pagination + filters)
- `GET /provinces/:provinceId/employees/export-excel` (authenticated, province scoped)
- `POST /provinces/:provinceId/employees` (province admin own / global all)
- `GET /provinces/:provinceId/employees/:employeeId` (province scoped auth)
- `PUT /provinces/:provinceId/employees/:employeeId`
  - Province admin can edit only when province is unlocked
  - Global admin can always edit
- `DELETE /provinces/:provinceId/employees/:employeeId` (province scoped auth)

### Global Employee Operations

- `GET /employees/export-all` (global admin only)
- `DELETE /employees/clear-performances` (global admin only)

### Dashboard and System

- `GET /admin-dashboard/stats` (global admin only)
- `GET /api-docs` (public swagger page)
- `GET /api-docs/json` (public OpenAPI JSON)
- `GET /api-docs/swagger` (public swagger UI)
- `GET /health` (public)

## Test Suite

- `jest.config.js` is configured for TypeScript in `node` environment and single-worker mode.
- Shared lifecycle (`src/__tests__/setup.ts`):
  - `startTestDB()` connects using `TEST_MONGODB_URI` or local default `mongodb://localhost:27017/irc-test`
  - `cleanupTestDB()` clears all collections between tests
  - `stopTestDB()` disconnects Mongoose
- Tests live in `server/src/__tests__`.
- Current suites:
  - `auth.test.ts` – authentication and session endpoints
  - `provinces.test.ts` – province listing/detail/lock endpoints
  - `employees.test.ts` – scoped employee CRUD, locks, filters, exports, delete flow
  - `employees-global.test.ts` – global employee exports and bulk reset
  - `admin-dashboard.test.ts` – dashboard stats and authorization
  - `health.test.ts` – health/public behavior

## Route Validation and Error Behavior

- Invalid Mongo ObjectId values are rejected early for all `:provinceId` / `:employeeId` params.
- `HttpError` throws keep API responses structured as:
  - `success: false`
  - `error: string`
  - optional `details`
- Performance lock failures return:
  - `status: 423`
  - `code: PERFORMANCE_LOCKED`
  - `error: Performance records are locked for this province`

## Notes

- No Mongo memory server is used by default; tests require a reachable MongoDB instance.
- Excel exports are binary responses with XLSX MIME type:
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
