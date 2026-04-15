# IRC Employee Management System

Role-based staff management with a React client and an Express + MongoDB server. The system uses session-based authentication, province-scoped employee management, Excel exports, and a global performance lock.

## Stack

- Frontend: React 19, TypeScript, Vite, React Router 7, MUI 7, Axios, Recharts
- Backend: Node.js, Express, TypeScript, Mongoose, `express-session`, `connect-mongo`
- Tooling: pnpm, Jest, Supertest

## What It Does

- Login/logout with cookie-backed sessions
- Global admin province dashboard
- Province-scoped employee CRUD
- Employee detail and performance editing
- Province and global Excel exports
- Admin dashboard metrics
- Global performance lock and performance reset

## Roles

- `globalAdmin`: full access across provinces, employees, exports, and global settings
- `provinceAdmin`: employee management only inside the assigned province

## Project Layout

```text
.
├── client/   # React app
├── server/   # Express API
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB

### Install

```sh
cd server && pnpm install
cd ../client && pnpm install
```

### Server config

Create `server/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ircdb
SESSION_SECRET=super-secret
CORS_ORIGIN=http://localhost:5173
```

### Client config

Optional `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Run

```sh
cd server && pnpm dev
cd client && pnpm dev
```

- API default: `http://localhost:3000`
- Client default: `http://localhost:5173`

## Main Routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Create session |
| POST | `/auth/logout` | Destroy session |
| GET | `/provinces` | List provinces |
| GET | `/provinces/:provinceId/employees` | List employees |
| POST | `/provinces/:provinceId/employees` | Create employee |
| GET | `/provinces/:provinceId/employees/export-excel` | Export province employees |
| GET | `/employees/export-all` | Export all employees |
| DELETE | `/employees/clear-performances` | Reset performance data |
| GET | `/global-settings` | Read performance lock |
| POST | `/global-settings/toggle-performance-lock` | Toggle performance lock |
| GET | `/admin-dashboard/stats` | Dashboard metrics |
| GET | `/health` | Health check |

## Client Flow

1. Users log in at `/`
2. `globalAdmin` goes to `/provinces`
3. `provinceAdmin` goes to `/provinces/:provinceId/employees`
4. Protected pages are wrapped by `client/src/components/ProtectedRoute.tsx`

## Development

### Build

```sh
cd server && pnpm build
cd ../client && pnpm build
```

### Test server

```sh
cd server && pnpm test
```

Tests live in `server/src/__tests__/` and use `TEST_MONGODB_URI` if set, otherwise `mongodb://localhost:27017/irc-test`.

### Lint client

```sh
cd client && pnpm lint
```

## Notes

- Province images are served from `server/src/img` under `/img`
- Employee operations are nested under `/provinces/:provinceId/employees`
- The performance lock blocks employee updates and global performance resets
- Source-of-truth behavior lives in `server/src/routes` and `server/src/middleware/auth.ts`
