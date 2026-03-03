# NexFlow – Resource Allocation Management System (MVP Specification)

**App Name:** NexFlow
**API Source:** Project Allocation Management System (PAMS) REST API v1.4.0
**Auth:** Keycloak OIDC Bearer token (auth handled externally; role derived from token claims)

---

## 1. System Overview

NexFlow is a frontend-only enterprise web application that consumes the PAMS REST API. It provides a role-aware interface for resource allocation and bench management. The frontend does **not** implement any business logic or authentication — all data, role enforcement, and capacity validation is handled server-side by the PAMS API.

---

## 2. User Roles

| Role | System Value | Access |
|---|---|---|
| **HR** | `HR` | Full admin access to all accounts, projects, employees, and allocations |
| **Project Manager** | `ProjectManager` | Dashboard (own allocations), Managed Projects (own projects only), Project Resource Allocation |
| **Staff** | `Staff` | Dashboard (own allocations) only |

> **MVP Focus:** Only the **ProjectManager** role view is being built in this iteration.

---

## 3. Application Structure — 3 Pages + 1 Modal

### Page 1: Dashboard (Manager Allocation Dashboard)
**Route:** `/dashboard`
**Design Ref:** `project_view_dashboard_screen.png`
**API:** `GET /employees/me/allocations`

This is the **personal dashboard** for the logged-in Project Manager (who is also an employee). It shows their own allocations to projects they are working on — **not** the projects they manage.

**UI Components:**
- **Header:** "Manager Allocation Dashboard" + Export Report button + Search bar
- **Summary Stat Cards (top row):**
  - Total Active Allocations (count + delta badge)
  - Current Allocation % (donut chart with percentage + billable %)
  - Upcoming End Dates (count + label "Next 30 days")
- **"My Allocations" Table:**
  - Columns: `Account Name`, `Project Name`, `Role`, `Allocation %` (progress bar), `Billable`, `From Date`, `To Date`, `Status`
  - Status badge variants: `Active` (blue), `Upcoming` (orange), `Completed` (grey)
  - Filter by Status (dropdown)
  - Pagination: Previous / Next

**API Field Mapping:**
- `GET /employees/me/allocations` → `allocations[]`
  - `projectName`, `accountCode`, `roleOnProject`, `percentage`, `billable`, `fromDate`, `toDate`, `status` (Active/Upcoming/Ended)

---

### Page 2: Managed Projects
**Route:** `/managed-projects`
**Design Ref:** `managed_projects_view_screen.png`
**API:** `GET /projects?projectManagerEmpCode={currentUserEmpCode}&page=1&limit=10`

A structured table listing all projects the logged-in Project Manager manages.

**UI Components:**
- **Header:** "Managed Projects" + "+ New Project" button (visible but action gated to HR; PM can view only)
- **Search bar:** search by project name, client, or project codes
- **Filter dropdowns:** `Account: All` | `Status: All`
- **Projects Table:**
  - Columns: `Account Name`, `Project Name`, `Code`, `Team` (headcount), `Allocation %` (progress bar), `Billable`, `Status` badge, `Action` (eye/view icon)
  - Status badge variants: `Active` (green), `Completed` (grey), `Upcoming` (orange)
- **Pagination:** showing X of N projects

**API Field Mapping:**
- `GET /projects?projectManagerEmpCode=...` → `data[]`
  - `accountName`, `projectName`, `projectCode`, `teamSize` (allocated headcount), `totalAllocationPercentage`, `billable`, `status`

---

### Page 3: Managed Project Details
**Route:** `/managed-projects/:projectCode`
**Design Ref:** `managed_project_details_screen.png`
**API:** `GET /projects/{projectCode}` + `GET /allocations` (filtered by project)

Detailed view of a single project's resource allocations. This is the **hero / main demo screen**.

**UI Components:**
- **Breadcrumb:** ← Back to Managed Projects
- **Project Header:** Project Name (large), Account Name + Priority badge, Project Settings button
- **Summary Stat Cards:**
  - Total Allocated % (progress bar)
  - Total Team Members (count + delta vs last month)
  - Available Capacity % (remaining allocation space)
- **"Resource Allocations" Table:**
  - Header: "Resource Allocations" label + **"Assign Employee" button** (primary CTA)
  - Columns: `Employee Name` (avatar + email), `Role`, `From Date`, `To Date`, `Allocation %` (progress bar), `Status` badge, `Actions` (Edit | Remove)
  - Status badge variants: `Active` (blue), `Upcoming` (orange), `Completed` (grey)
  - Pagination with row count
- **Interactions:**
  - Click **"Assign Employee"** → opens the Assign Employee Modal
  - Click **"Edit"** inline → opens the Assign Employee Modal pre-filled for that allocation
  - Click **"Remove"** → soft-deletes the allocation (calls `DELETE /allocations/{allocationId}`); shows confirmation

**API Field Mapping:**
- `GET /projects/{projectCode}` → `projectName`, `accountName`, `status`, `startDate`, `endDate`, `totalAllocatedPercentage`, `teamSize`, `availableCapacity`
- Allocation rows: from project allocations embedded in the project detail response or `GET /employees/{empCode}` for each member

---

### Modal: Assign Employee
**Trigger:** "Assign Employee" button on Page 3 (also used for Edit)
**Design Ref:** `project_allocation_details_screen.png`
**API (Create):** `POST /allocations`
**API (Update):** `PUT /allocations/{allocationId}`

A modal dialog overlaid on the Project Details page.

**UI Components:**
- **Title:** "Assign Employee" + subtitle "Add a new resource to [Project Name]"
- **Form Fields:**
  - `Employee Name` — searchable dropdown (`GET /employees?search=...`)
  - `From Date` — date picker (required)
  - `To Date` — date picker (optional)
  - `Allocation Percentage (%)` — number input (validates min 25%, multiples of 5%, max 100%; "Maximum recommended remaining: X%" hint shown dynamically)
  - `Billable Status` — toggle switch ("Is this allocation billable to the client?")
- **Actions:** Cancel | **Save Assignment** (primary button)
- **Error Handling:** Display API error messages inline (e.g., `ERR_CAPACITY_EXCEEDED` → "Employee is already allocated X%. Only Y% available")

**API Field Mapping (POST/PUT `/allocations`):**
```json
{
  "empCode": "string",
  "projectCode": "string",
  "fromDate": "YYYY-MM-DD",
  "toDate": "YYYY-MM-DD",
  "percentage": 50,
  "billable": true
}
```

---

## 4. Data Model (Frontend Entities from PAMS API)

### Enums
```ts
type AccountType = 'Client' | 'Internal' | 'Bench'
type EmployeeRole = 'HR' | 'ProjectManager' | 'Staff'
type ProjectStatus = 'Upcoming' | 'Active' | 'Completed'
type AllocationStatus = 'Bench' | 'Partial' | 'Full'
type AllocationRecordStatus = 'Active' | 'Upcoming' | 'Ended'
```

### Core Interfaces
```ts
interface Project {
  projectCode: string
  projectName: string
  accountCode: string
  accountName: string
  projectManagerEmpCode: string
  status: ProjectStatus
  billable: boolean
  startDate: string   // ISO 8601
  endDate?: string
  isActive: boolean
  // Computed summary stats
  totalAllocatedPercentage?: number
  teamSize?: number
  availableCapacity?: number
}

interface Allocation {
  allocationId: string   // UUID
  empCode: string
  employeeName: string
  employeeEmail?: string
  roleOnProject?: string
  projectCode: string
  projectName: string
  accountCode: string
  fromDate: string
  toDate?: string
  percentage: number
  billable: boolean
  status: AllocationRecordStatus
}

interface Employee {
  empCode: string
  firstName: string
  lastName: string
  email: string
  designation: string
  role: EmployeeRole
  reportsToEmpCode?: string
  isActive: boolean
  currentAllocationStatus?: AllocationStatus
  currentAllocations?: Allocation[]
}
```

---

## 5. Key API Endpoints (PM-scoped for MVP)

| Purpose | Method | Endpoint |
|---|---|---|
| Get current user profile | `GET` | `/employees/me` |
| Get own allocations (Dashboard) | `GET` | `/employees/me/allocations` |
| List PM's managed projects | `GET` | `/projects?projectManagerEmpCode={empCode}` |
| Get single project details | `GET` | `/projects/{projectCode}` |
| Search employees (for assign dropdown) | `GET` | `/employees?search={q}&isActive=true` |
| Create allocation | `POST` | `/allocations` |
| Update allocation | `PUT` | `/allocations/{allocationId}` |
| Stop allocation | `PATCH` | `/allocations/{allocationId}` `{"action":"stop"}` |
| Remove (soft-delete) allocation | `DELETE` | `/allocations/{allocationId}` |
| Check capacity before assign | `GET` | `/allocations/capacity-check?empCode=...&fromDate=...` |

---

## 6. UI/UX Requirements

- **Styling:** Clean enterprise design, dark sidebar, white content area
- **Component Library:** Shadcn UI + Radix UI primitives + Tailwind CSS
- **Tables:** Sortable, responsive, with progress bar column for allocation %
- **Status Badges:** Color-coded (Active=blue, Upcoming=orange, Completed=grey, Active in nav = highlighted)
- **Error States:** All API errors surfaced gracefully as inline form errors or toast notifications
- **Loading States:** Skeleton loaders for tables; spinner for modals
- **Pagination:** Server-side pagination using `page` and `limit` query params

---

## 7. Navigation (Sidebar — ProjectManager role)

- Dashboard (icon: grid)
- Managed Projects (icon: briefcase)
- Allocations (icon: layers) — *future*
- Resources (icon: users) — *future*
- --- (separator)
- Notifications
- Settings
- User profile (bottom of sidebar)

---

## 8. Constraints & Assumptions

- No authentication implementation — a mock JWT token with role `ProjectManager` is used for local development.
- All business logic and validation (capacity check, % minimum, etc.) is API-driven; frontend only surfaces API responses.
- The app is a read-write frontend — no backend code lives here.
- Code identifiers (`accountCode`, `projectCode`, `empCode`) are used in URL paths (not UUIDs) per the API design.
