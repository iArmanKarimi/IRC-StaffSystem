# IRC Staff System - Client

React + TypeScript + Vite frontend for the IRC Employee Management System.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router 7
- Axios
- MUI 7
- `@mui/x-data-grid`
- Recharts

## Project Structure

```text
client/
├── src/
│   ├── api/                 # Axios client and API helpers
│   ├── components/          # Shared UI components and dialogs
│   ├── hooks/               # Data-fetching and auth-related hooks
│   ├── pages/               # Route-level page components
│   ├── theme/               # MUI theme
│   ├── types/               # Shared TypeScript models
│   ├── const/               # Route and endpoint constants
│   ├── App.tsx              # Route definitions
│   └── main.tsx             # Root render and providers
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

## Setup

### Install

```bash
pnpm install
```

### Environment

Optional `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
pnpm preview
```

### Lint

```bash
pnpm lint
```

## Routing

| Path | Component | Access |
| --- | --- | --- |
| `/` | `LoginFormPage` | Public |
| `/provinces` | `GlobalAdminDashboardPage` | Authenticated global admin |
| `/admin-dashboard` | `AdminDashboardPage` | Authenticated |
| `/provinces/:provinceId/employees` | `ProvinceEmployeesPage` | Authenticated |
| `/provinces/:provinceId/employees/new` | `NewEmployeeFormPage` | Authenticated |
| `/provinces/:provinceId/employees/:employeeId` | `EmployeePage` | Authenticated |

Routes are lazy-loaded in `client/src/App.tsx`.

## Main Features

- Session-based login and logout
- Role-based post-login redirects
- Global admin province dashboard
- Province employee listing with pagination
- Search and filter controls in the employee list
- Employee create, edit, view, and delete flows
- Performance record management
- Province export to Excel
- Global performance lock UI
- Dashboard stats visualizations

## API Integration

Main API helpers live in `client/src/api/api.ts`.

```ts
authApi.login(payload);
authApi.logout();

provinceApi.list();
provinceApi.get(provinceId);
provinceApi.listEmployees(provinceId, page, limit);
provinceApi.createEmployee(provinceId, payload);
provinceApi.getEmployee(provinceId, employeeId);
provinceApi.updateEmployee(provinceId, employeeId, payload);
provinceApi.deleteEmployee(provinceId, employeeId);
provinceApi.exportProvinceEmployees(provinceId);

globalApi.exportAllEmployees();
globalApi.getDashboardStats();
```

## State and Hooks

- `useEmployees` fetches paginated employee lists
- `useEmployee` fetches one employee
- `useGlobalSettings` reads and toggles the performance lock
- `useIsGlobalAdmin` uses province access as an authorization probe
- `useApiMutation` wraps mutation-side loading and error handling

## Notes

- The app uses cookie-based sessions with `withCredentials: true`.
- Most pages rely on backend authorization even when the UI is shared across roles.
- `ProtectedRoute` currently checks authorization by calling the provinces endpoint.
