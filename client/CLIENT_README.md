# IRC Staff System - Client

React + TypeScript + Vite frontend application for the IRC Employee Management System.

## 🏗️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Material-UI (MUI) v5** - UI component library
- **@emotion/react** & **@emotion/styled** - Styling engine

## 📁 Project Structure

```
client/
├── src/
│   ├── api/
│   │   └── api.ts              # API client and service functions
│   ├── components/
│   │   ├── dialogs/
│   │   │   ├── ConfirmDialog.tsx      # Reusable confirmation dialog
│   │   │   ├── EditEmployeeDialog.tsx # Employee edit dialog
│   │   │   ├── FormDialog.tsx         # Generic form dialog wrapper
│   │   │   └── PerformanceDialog.tsx  # Add/edit performance dialog
│   │   ├── states/
│   │   │   ├── ErrorView.tsx          # Error state component
│   │   │   └── LoadingView.tsx        # Loading state component
│   │   ├── NavBar.tsx                 # Navigation bar with logout
│   │   ├── PerformanceAccordion.tsx   # Collapsible performance list
│   │   ├── PerformanceCard.tsx        # Single performance record display
│   │   ├── PerformanceManager.tsx     # Performance CRUD orchestrator
│   │   └── ProtectedRoute.tsx         # Route protection wrapper
│   ├── hooks/
│   │   ├── useApiMutation.ts   # Generic mutation hook with loading/error states
│   │   └── useEmployee.ts      # Employee data fetching hook
│   ├── pages/
│   │   ├── LoginFormPage.tsx           # User authentication
│   │   ├── GlobalAdminDashboardPage.tsx # Province list (Global Admin)
│   │   ├── ProvinceEmployeesPage.tsx   # Employee list with pagination
│   │   ├── EmployeePage.tsx            # Employee details & edit
│   │   └── NewEmployeeFormPage.tsx     # Create new employee
│   ├── theme/
│   │   └── theme.ts            # MUI custom theme configuration
│   ├── types/
│   │   └── models.ts           # TypeScript interfaces matching server models
│   ├── const/
│   │   ├── endpoints.ts        # API endpoints and route constants
│   │   └── cookie.ts           # Cookie-related constants
│   ├── App.tsx                 # Main app with routing
│   └── main.tsx               # Entry point with ThemeProvider
├── public/                     # Static assets
├── index.html                  # HTML template
├── vite.config.ts             # Vite configuration
└── package.json               # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running (see `../server/README.md`)

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Development

```bash
# Start development server (default: http://localhost:5173)
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Authentication & Authorization

The application implements role-based access control:

### User Roles

- **Global Admin**: Can view all provinces and manage employees across all provinces
- **Province Admin**: Can only manage employees in their assigned province

### Protected Routes

All routes except login are protected and require authentication. The `ProtectedRoute` component handles authorization checks.

## 📍 Routes

| Path                                           | Component                | Access            |
| ---------------------------------------------- | ------------------------ | ----------------- |
| `/`                                            | LoginFormPage            | Public            |
| `/provinces`                                   | GlobalAdminDashboardPage | Global Admin only |
| `/provinces/:provinceId/employees`             | ProvinceEmployeesPage    | Authenticated     |
| `/provinces/:provinceId/employees/new`         | NewEmployeeFormPage      | Authenticated     |
| `/provinces/:provinceId/employees/:employeeId` | EmployeePage             | Authenticated     |

## 🔌 API Integration

The client communicates with the backend API through:

- **Authentication**: Session-based with cookies
- **API Endpoints**: RESTful API at `/auth`, `/provinces`, `/provinces/:provinceId/employees`
- **Error Handling**: Centralized error handling with user feedback

### Key API Functions

```typescript
// Auth
authApi.login(credentials);
authApi.logout();

// Provinces
provinceApi.list();
provinceApi.get(provinceId);

// Employees
provinceApi.listEmployees(provinceId, page, limit);
provinceApi.createEmployee(provinceId, payload);
provinceApi.getEmployee(provinceId, employeeId);
provinceApi.updateEmployee(provinceId, employeeId, payload);
provinceApi.deleteEmployee(provinceId, employeeId);
```

## 📦 Employee Data Model

Each employee includes:

- **Basic Info**: Name, national ID, gender, marital status, children count
- **WorkPlace**: Province, branch, rank, workplace, travel assignment
- **Additional Specs**: Education, dates, contact, job dates, status
- **Performances**: Current month performance record

## 🎨 Features

### Implemented

- ✅ User login/logout with role-based routing
- ✅ Global Admin province dashboard
- ✅ Employee listing with pagination
- ✅ Create employee with comprehensive form
- ✅ View and **edit** employee details
- ✅ Delete employee with confirmation
- ✅ **Add, edit, and delete performance records**
- ✅ Navigation bar with logout
- ✅ Protected routes
- ✅ Error handling and loading states
- ✅ Material-UI component library with custom theme
- ✅ Custom hooks for data fetching and mutations
- ✅ Reusable dialog components

### Future Enhancements

- Search and filter employees
- Province management (Global Admin)
- User management
- Export to CSV/PDF
- Dark mode toggle
- Dashboard with statistics

## 🧪 Development Notes

### Type Safety

All API responses and data models are fully typed using TypeScript interfaces that match the server models.

### State Management

Currently using React hooks (useState, useEffect). Consider adding Context API or state management library for larger-scale features.

### Styling

The application uses **Material-UI (MUI) v5** with a custom theme defined in [theme/theme.ts](src/theme/theme.ts).

**Theme Features:**

- Custom color palette with primary blue (#1976d2)
- Consistent spacing and typography
- Responsive breakpoints for mobile/tablet/desktop

**Key MUI Components:**

- Layout: `Box`, `Container`, `Paper`, `Grid`
- Forms: `TextField`, `Select`, `Button`
- Data Display: `Table`, `Card`, `Chip`, `Accordion`
- Feedback: `Dialog`, `Alert`, `CircularProgress`
- Navigation: `Breadcrumbs`

## 🐛 Troubleshooting

### CORS Issues

Ensure the backend server has CORS configured to allow requests from `http://localhost:5173` (or your dev server URL).

### Authentication Issues

- Check that cookies are enabled
- Verify `withCredentials: true` is set in API client
- Ensure backend session configuration matches

### Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

See root LICENSE file.
