# IRC Employee Report System - Server Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Database Models](#database-models)
6. [API Routes](#api-routes)
7. [Authentication & Authorization](#authentication--authorization)
8. [Middleware](#middleware)
9. [Configuration](#configuration)
10. [Setup & Running](#setup--running)

---

## Project Overview

The IRC Employee Report System is a full-stack web application designed to manage employee information and performance reports. The system supports two admin roles:

- **Global Admin**: Can view all employees and manage the system globally
- **Province Admin**: Can view and manage employees within their assigned province

The backend is built with **Node.js/Express** and uses **MongoDB** with **Mongoose** for database management and **express-session** for secure session-based authentication.

---

## Architecture

### High-Level Overview

```
Client (React/Vite)
        ↓
    Express Server
        ↓
    Middleware (CORS, Session, Auth)
        ↓
    Routes (Auth, Employees)
        ↓
    Models (Mongoose Schemas)
        ↓
    MongoDB Database
```

### Key Design Patterns

- **Modular Schema Structure**: Employee sub-schemas are separated into individual files for maintainability
- **Role-Based Access Control (RBAC)**: Auth middleware enforces role-based authorization
- **Session-Based Authentication**: Secure cookies replace JWT tokens for stateful sessions
- **Express Type Augmentation**: Custom TypeScript declarations extend Express types for session data

---

## Technology Stack

| Layer                | Technology      | Version |
| -------------------- | --------------- | ------- |
| **Runtime**          | Node.js         | -       |
| **Language**         | TypeScript      | 5.9.3   |
| **Framework**        | Express         | 5.1.0   |
| **Database**         | MongoDB         | -       |
| **ORM**              | Mongoose        | 8.3.3   |
| **Authentication**   | express-session | 1.17.3  |
| **Session Store**    | connect-mongo   | 5.1.0   |
| **Password Hashing** | bcrypt          | -       |
| **Environment**      | dotenv          | -       |
| **CORS**             | cors            | -       |

---

## Directory Structure

```
server/
├── src/
│   ├── app.ts                    # Express app configuration
│   ├── index.ts                  # Server entry point
│   ├── data-source.ts            # MongoDB connection setup
│   ├── middleware/
│   │   └── auth.ts               # Authentication & authorization middleware
│   ├── models/
│   │   ├── Employee.ts           # Employee model (main)
│   │   ├── User.ts               # User authentication model
│   │   ├── Province.ts           # Province model
│   │   └── employee-sub-schemas/
│   │       ├── BasicInfoSchema.ts              # Employee personal info
│   │       ├── WorkPlaceSchema.ts              # Workplace details
│   │       ├── AdditionalSpecificationsSchema.ts  # Education & status
│   │       └── PerformanceSchema.ts            # Monthly performance data
│   ├── routes/
│   │   ├── auth.ts               # Authentication endpoints
│   │   └── employees.ts          # Employee CRUD endpoints
│   └── types/
│       └── express.d.ts          # Express type definitions (if present)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Database Models

### 1. User Model (`User.ts`)

Stores authentication credentials and role information.

**Schema Fields:**

- `username` (String, unique, required): Admin username
- `passwordHash` (String, required): Bcrypt-hashed password
- `role` (String, enum: ["globalAdmin", "provinceAdmin"], required): User's role
- `provinceAdmin` (ObjectId ref to Province, optional): Reference to managed province

**Validation:**

- Username must be unique across all users
- Role must be one of the predefined types

---

### 2. Province Model (`Province.ts`)

Represents geographic provinces with assigned administrators.

**Schema Fields:**

- `name` (String, unique, required): Province name
- `admin` (ObjectId ref to User, required): Reference to province admin
- `employees` (Array of ObjectId refs to Employee): List of employees in province

**Purpose:**

- Segregates employee data by province
- Links province admins to their managed regions

---

### 3. Employee Model (`Employee.ts`)

Main employee document composing multiple sub-schemas.

**Schema Fields:**

- `province` (ObjectId ref to Province, required): Province assignment
- `basicInfo` (BasicInfoSchema, required): Personal information
- `workPlace` (WorkPlaceSchema, required): Workplace assignment
- `additionalSpecifications` (AdditionalSpecificationsSchema, required): Education/status
- `performances` (Array of PerformanceSchema): Monthly performance records
- `createdAt` (Date, auto): Document creation timestamp
- `updatedAt` (Date, auto): Last update timestamp

**TypeScript Interface:**

```typescript
interface IEmployee extends Document {
  province: Schema.Types.ObjectId;
  basicInfo: IBasicInfo;
  workPlace: IWorkPlace;
  additionalSpecifications: IAdditionalSpecifications;
  performances: IPerformance[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4. Employee Sub-Schemas

#### 4.1 BasicInfoSchema (`BasicInfoSchema.ts`)

**Purpose:** Stores employee's personal demographic information.

**Fields:**
| Field | Type | Validation |
|-------|------|-----------|
| `firstName` | String | Required, trimmed |
| `lastName` | String | Required, trimmed |
| `nationalID` | String | Unique, required, trimmed |
| `male` | Boolean | Required |
| `married` | Boolean | Default: false |
| `childrenCount` | Number | Default: 0, min: 0 |

**Example:**

```json
{
  "firstName": "علی",
  "lastName": "احمدی",
  "nationalID": "0012345678",
  "male": true,
  "married": true,
  "childrenCount": 2
}
```

---

#### 4.2 WorkPlaceSchema (`WorkPlaceSchema.ts`)

**Purpose:** Stores employee's workplace assignment and position details.

**Fields:**
| Field | Type | Validation |
|-------|------|-----------|
| `provinceName` | String | Required, trimmed |
| `branch` | String | Required, trimmed |
| `rank` | String | Required, trimmed |
| `licensedWorkplace` | String | Required, trimmed |
| `travelAssignment` | Boolean | Default: false |

**Example:**

```json
{
  "provinceName": "تهران",
  "branch": "شاهرخ",
  "rank": "مسئول",
  "licensedWorkplace": "مرکز اصلی",
  "travelAssignment": false
}
```

---

#### 4.3 AdditionalSpecificationsSchema (`AdditionalSpecificationsSchema.ts`)

**Purpose:** Stores employee's educational background, status, and employment dates.

**Fields:**
| Field | Type | Validation |
|-------|------|-----------|
| `educationalDegree` | String | Required, trimmed |
| `dateOfBirth` | Date | Required |
| `contactNumber` | String | Required, trimmed, regex: /^\d{10}$/ (10 digits) |
| `jobStartDate` | Date | Required |
| `jobEndDate` | Date | Optional |
| `status` | String | Enum: ['active', 'inactive', 'on_leave'], default: 'active' |

**Example:**

```json
{
  "educationalDegree": "لیسانس",
  "dateOfBirth": "1990-05-15",
  "contactNumber": "0912345678",
  "jobStartDate": "2018-01-01",
  "jobEndDate": null,
  "status": "active"
}
```

---

#### 4.4 PerformanceSchema (`PerformanceSchema.ts`)

**Purpose:** Records monthly performance metrics and attendance data (embedded in Employee as array).

**Fields:**
| Field | Type | Validation |
|-------|------|-----------|
| `dailyPerformance` | Number | Required, min: 0 |
| `shiftCountPerLocation` | Number | Required, min: 0 |
| `shiftDuration` | Number | Required, enum: [8, 16, 24] |
| `overtime` | Number | Default: 0, min: 0 |
| `dailyLeave` | Number | Default: 0, min: 0 |
| `sickLeave` | Number | Default: 0, min: 0 |
| `absence` | Number | Default: 0, min: 0 |
| `volunteerShiftCount` | Number | Default: 0, min: 0 |
| `truckDriver` | Boolean | Default: false |
| `monthYear` | String | Required (format: YYYY-MM) |
| `notes` | String | Optional, trimmed |

**Example:**

```json
{
  "dailyPerformance": 20,
  "shiftCountPerLocation": 8,
  "shiftDuration": 8,
  "overtime": 2,
  "dailyLeave": 1,
  "sickLeave": 0,
  "absence": 0,
  "volunteerShiftCount": 1,
  "truckDriver": false,
  "monthYear": "2024-11",
  "notes": "بسیار خوب"
}
```

---

## API Routes

### Base URL

```
http://localhost:3000
```

### Health Check

```
GET /health
```

**Response:** `{ "ok": true }`

---

### Authentication Routes (`/auth`)

#### 1. Login

```
POST /auth/login
```

**Request Body:**

```json
{
  "username": "admin1",
  "password": "securePassword123"
}
```

**Response (Success - 200):**

```json
{
  "message": "Logged in successfully",
  "role": "globalAdmin",
  "provinceId": null
}
```

**Response (Error - 401):**

```json
{
  "error": "Invalid credentials"
}
```

**Process:**

1. Validates username and password are provided
2. Finds user by username
3. Compares password hash using bcrypt
4. Sets session data (`userId`, `role`, `provinceId`)
5. Returns user role and provinceId

**Security:**

- Session stored in MongoDB via MongoStore
- Passwords hashed with bcrypt (10 salt rounds)
- HttpOnly cookies prevent JavaScript access

---

#### 2. Logout

```
POST /auth/logout
```

**Response (Success - 200):**

```json
{
  "message": "Logged out successfully"
}
```

**Response (Error - 500):**

```json
{
  "error": "Logout failed"
}
```

**Process:**

1. Destroys session
2. Clears session cookie

---

---

## Employee Routes (`/employees`)

#### 1. Get All Employees (Global Admin Only)

```
GET /employees/
```

**Authorization:** Requires `globalAdmin` role

**Response (Success - 200):**

```json
[
  {
    "_id": "employee-id",
    "province": {
      "_id": "province-id",
      "name": "تهران",
      "admin": "user-id",
      "employees": [...]
    },
    "basicInfo": {
      "firstName": "علی",
      "lastName": "احمدی",
      "nationalID": "0012345678",
      "male": true,
      "married": true,
      "childrenCount": 2
    },
    "workPlace": {...},
    "additionalSpecifications": {...},
    "performances": [...],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Response (Error - 401):**

```json
{
  "error": "Not authenticated"
}
```

**Response (Error - 403):**

```json
{
  "error": "Forbidden"
}
```

**Purpose:** Retrieve all employees across all provinces (admin dashboard)

---

#### 2. Get Province Employees (Province Admin Only)

```
GET /employees/my-province
```

**Authorization:** Requires `provinceAdmin` role

**Process:**

1. Verifies user is authenticated and has provinceAdmin role
2. Filters employees by `province` matching `req.user.provinceId`
3. Populates province reference data
4. Returns filtered employee list

**Response:** Same structure as Get All Employees, but filtered by province

**Purpose:** Province admins see only their assigned province's employees

---

#### 3. Get Single Employee

```
GET /employees/:id
```

**Authorization:** Both roles can view

- **globalAdmin**: Can view any employee
- **provinceAdmin**: Can only view employees in their own province

**Parameters:**

- `id`: Employee MongoDB ObjectId

**Response (Success - 200):**

```json
{
  "_id": "employee-id",
  "province": {...},
  "basicInfo": {...},
  "workPlace": {...},
  "additionalSpecifications": {...},
  "performances": [...],
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Response (Error - 403):**

```json
{
  "error": "Cannot view employees from other provinces"
}
```

**Response (Error - 404):**

```json
{
  "error": "Employee not found"
}
```

**Purpose:** Retrieve detailed information for a specific employee

---

#### 4. Create Employee

```
POST /employees/
```

**Authorization:** Both roles can create

- **globalAdmin**: Can create employees in any province
- **provinceAdmin**: Can only create employees in their own province

**Request Body:**

```json
{
  "province": "province-object-id",
  "basicInfo": {
    "firstName": "محمد",
    "lastName": "رضائی",
    "nationalID": "0023456789",
    "male": true,
    "married": false,
    "childrenCount": 0
  },
  "workPlace": {
    "provinceName": "تهران",
    "branch": "شاهرخ",
    "rank": "مسئول",
    "licensedWorkplace": "مرکز اصلی",
    "travelAssignment": false
  },
  "additionalSpecifications": {
    "educationalDegree": "لیسانس",
    "dateOfBirth": "1995-03-20",
    "contactNumber": "0912345678",
    "jobStartDate": "2020-01-01",
    "status": "active"
  },
  "performances": []
}
```

**Response (Success - 201):**

```json
{
  "_id": "new-employee-id",
  "province": "...",
  "basicInfo": {...},
  "workPlace": {...},
  "additionalSpecifications": {...},
  "performances": [],
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Response (Error - 400):**

```json
{
  "error": "Invalid employee data"
}
```

**Validation:** All required fields in sub-schemas must be provided and match schema constraints

**Purpose:** Add a new employee to the system

---

#### 5. Update Employee

```
PUT /employees/:id
```

**Authorization:** Both roles can update

- **globalAdmin**: Can update any employee in any province
- **provinceAdmin**: Can only update employees in their own province

**Parameters:**

- `id`: Employee MongoDB ObjectId

**Request Body:** Partial or full employee object (only provided fields are updated)

```json
{
  "basicInfo": {
    "firstName": "محمد",
    "lastName": "رضائی",
    "nationalID": "0023456789",
    "male": true,
    "married": true,
    "childrenCount": 1
  }
}
```

**Response (Success - 200):**

```json
{
  "_id": "employee-id",
  "province": {...},
  "basicInfo": {...},
  "workPlace": {...},
  "additionalSpecifications": {...},
  "performances": [...],
  "createdAt": "...",
  "updatedAt": "2024-11-24T10:30:00Z"
}
```

**Response (Error - 404):**

```json
{
  "error": "Employee not found"
}
```

**Response (Error - 400):**

```json
{
  "error": "Invalid employee data"
}
```

**Purpose:** Update employee information

---

#### 6. Delete Employee

```
DELETE /employees/:id
```

**Authorization:** Both roles can delete

- **globalAdmin**: Can delete any employee
- **provinceAdmin**: Can only delete employees in their own province

**Parameters:**

- `id`: Employee MongoDB ObjectId

**Response (Success - 200):**

```json
{
  "message": "Employee deleted"
}
```

**Response (Error - 403):**

```json
{
  "error": "Can only delete employees in your own province"
}
```

**Response (Error - 404):**

```json
{
  "error": "Employee not found"
}
```

**Purpose:** Permanently remove employee from system

---

## Authentication & Authorization

### Session-Based Authentication

The system uses **express-session** with **MongoDB** backend for stateful authentication:

1. **Login Process:**

   - User submits username & password
   - Server validates credentials
   - Session created in MongoDB with user data
   - HttpOnly cookie sent to client

2. **Subsequent Requests:**

   - Client includes session cookie automatically
   - express-session middleware validates session
   - Auth middleware checks role authorization
   - Request proceeds if authorized

3. **Logout Process:**
   - Session destroyed in MongoDB
   - Cookie cleared on client

### Session Data Structure

```typescript
interface SessionData {
  userId: string; // MongoDB ObjectId as string
  role: "globalAdmin" | "provinceAdmin"; // User's role
  provinceId?: string; // For provinceAdmin only
}
```

### Authorization Levels

| Role              | Permissions                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **globalAdmin**   | View ALL employees, CREATE employees (any province), UPDATE any employee, DELETE any employee                                         |
| **provinceAdmin** | View own province's employees, CREATE employees (own province only), UPDATE own province's employees, DELETE own province's employees |

### Cookie Configuration

```typescript
cookie: {
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  httpOnly: true,                                  // JavaScript cannot access
  maxAge: 24 * 60 * 60 * 1000                     // 24-hour expiration
}
```

---

## Middleware

### Auth Middleware (`middleware/auth.ts`)

**Purpose:** Validates session authentication and enforces role-based authorization on protected routes.

**Type Declarations:**
The middleware extends TypeScript's Express types to provide type safety:

```typescript
// Extends express-session to include custom session properties
declare module "express-session" {
  interface SessionData {
    userId: string;
    role: "globalAdmin" | "provinceAdmin";
    provinceId?: string;
  }
}

// Extends Express Request to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "globalAdmin" | "provinceAdmin";
        provinceId?: string;
      };
    }
  }
}
```

**Function Signature:**

```typescript
export function auth(
  requiredRole: "globalAdmin" | "provinceAdmin"
): (req: Request, res: Response, next: NextFunction) => void;
```

**Parameters:**

- `requiredRole` (mandatory): The role required to access this route
  - `"globalAdmin"`: Only global admins can proceed
  - `"provinceAdmin"`: Only province admins can proceed

**Process Flow:**

```
1. Check if req.session.userId and req.session.role exist
   └─ If not: Return 401 Unauthorized

2. Check if req.session.role matches requiredRole
   └─ If not: Return 403 Forbidden

3. Attach user data to req.user object
   ├─ id: session userId
   ├─ role: session role
   └─ provinceId: session provinceId (if present)

4. Call next() to proceed to route handler
```

**Usage Example:**

```typescript
// Only global admins can access this route
router.get("/", auth("globalAdmin"), async (_, res) => {
  // Handler code
});

// Only province admins can access this route
router.post("/", auth("provinceAdmin"), async (req, res) => {
  // Handler can access req.user for current user info
});
```

**Error Responses:**

- **401 Unauthorized**: User not authenticated or session invalid
- **403 Forbidden**: User authenticated but lacks required role

---

## Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ircdb

# Session
SESSION_SECRET=your-very-secure-random-string-here

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Default Values

If environment variables are not set, the server uses:

- **PORT**: 3000
- **MONGODB_URI**: mongodb://localhost:27017/ircdb
- **SESSION_SECRET**: your-secret-key
- **CORS_ORIGIN**: http://localhost:5173 (Vite dev server)

### CORS Configuration

```typescript
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true, // Allow cookies to be sent with requests
  })
);
```

The `credentials: true` setting is essential for session cookies to be transmitted across CORS boundaries.

---

## Setup & Running

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Navigate to server directory:**

```bash
cd server
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create `.env` file:**

```bash
cp .env.example .env  # if available
# OR
# Create manually with required variables
```

4. **Configure environment variables:**
   Edit `.env` with your MongoDB connection string and other settings.

### Running the Server

**Development Mode:**

```bash
npm run dev
```

This runs TypeScript with ts-node and watches for changes (if configured).

**Production Build:**

```bash
npm run build
npm start
```

### Verification

Once the server is running, you should see:

```
MongoDB connected
Server running on port 3000
```

### Health Check

Test the server is running:

```bash
curl http://localhost:3000/health
# Response: {"ok":true}
```

### Database Connection

Ensure MongoDB is accessible at the configured `MONGODB_URI`:

- **Local MongoDB**: `mongodb://localhost:27017/ircdb`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

---

## Common Workflows

### 1. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "admin1",
    "password": "securePassword123"
  }'
```

### 2. Get All Employees (requires globalAdmin)

```bash
curl http://localhost:3000/employees/ -b cookies.txt
```

### 3. Create Employee

```bash
curl -X POST http://localhost:3000/employees/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "province": "province-id",
    "basicInfo": {...},
    "workPlace": {...},
    "additionalSpecifications": {...}
  }'
```

---

## Error Handling

### Authentication Errors

| Status | Error Message                    | Meaning                  |
| ------ | -------------------------------- | ------------------------ |
| 400    | "Username and password required" | Missing credentials      |
| 401    | "Invalid credentials"            | Wrong username/password  |
| 401    | "Not authenticated"              | No valid session         |
| 403    | "Forbidden"                      | Insufficient permissions |

### Resource Errors

| Status | Error Message           | Meaning                  |
| ------ | ----------------------- | ------------------------ |
| 400    | "Invalid employee data" | Schema validation failed |
| 404    | "Employee not found"    | Resource doesn't exist   |

### Server Errors

| Status | Error Message               | Meaning                   |
| ------ | --------------------------- | ------------------------- |
| 500    | "Login failed"              | Server error during login |
| 500    | "Failed to fetch employees" | Database query error      |

---

## Security Considerations

1. **Session Security:**

   - Sessions stored in MongoDB (not memory)
   - HttpOnly cookies prevent XSS attacks
   - Secure flag enabled in production (HTTPS only)
   - 24-hour session expiration

2. **Password Security:**

   - Passwords hashed with bcrypt (10 salt rounds)
   - Never stored in plaintext
   - Compared securely using bcrypt.compare()

3. **Authorization:**

   - All sensitive routes protected by auth middleware
   - Role checks happen before database operations
   - Fine-grained access control (globalAdmin vs provinceAdmin)

4. **CORS:**

   - Limited to specified origin
   - Credentials allowed only for trusted domains

5. **Environment Secrets:**
   - SESSION_SECRET should be strong and random
   - MONGODB_URI with authentication in production
   - Never commit `.env` file to version control

---

## Troubleshooting

### MongoDB Connection Error

```
Error: MongoDB connection error: connect ECONNREFUSED
```

**Solution:** Ensure MongoDB is running and `MONGODB_URI` is correct.

### Session Not Persisting

**Cause:** Cookie not being sent with requests
**Solution:** Ensure client uses `credentials: 'include'` in fetch/axios requests

### "Not authenticated" on Protected Routes

**Cause:** Session expired or not logged in
**Solution:** Login first via `/auth/login` endpoint

### TypeScript Compilation Errors

**Solution:** Ensure `tsconfig.json` has `"strict": true` and rebuild

---

## Future Enhancements

1. **Audit Logging**: Track all employee data changes
2. **Bulk Operations**: Import/export employee data
3. **Performance Analytics**: Dashboard with charts and metrics
4. **Email Notifications**: Notify admins of important changes
5. **Two-Factor Authentication**: Enhanced security for admin accounts
6. **Data Encryption**: Encrypt sensitive employee information

---

## Support & Contact

For issues, questions, or improvements, please refer to the project repository or contact the development team.

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Status:** Current Production Build
