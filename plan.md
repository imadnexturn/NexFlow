# NexFlow – Frontend Implementation Plan (ProjectManager MVP)

**Stack:** React + Vite + TypeScript + Tailwind CSS + Shadcn UI
**API Base:** `https://localhost:5001/api/v1` (local dev)
**Auth:** Mock Keycloak Bearer token with role `ProjectManager` for MVP
**Methodology:** Strict TDD — every feature requires a failing test before implementation

---

## Phase 1: Project Setup & Foundation

- [ ] Task 1.1: Initialize Vite + React + TypeScript project (`npm create vite@latest`)
- [ ] Task 1.2: Install and configure Tailwind CSS + Shadcn UI
- [ ] Task 1.3: Install testing libraries: Vitest + React Testing Library + MSW (Mock Service Worker)
- [ ] Task 1.4: Create base project folder structure:
  - `src/api/` — API service functions (one file per resource)
  - `src/components/` — Shared/reusable UI components
  - `src/pages/` — Page-level components
  - `src/types/` — TypeScript interfaces from spec
  - `src/hooks/` — Custom React hooks
  - `src/mocks/` — MSW handlers for all API endpoints
- [ ] Task 1.5: Define all TypeScript types (`Project`, `Allocation`, `Employee`, enums) in `src/types/index.ts`
- [ ] Task 1.6: Set up React Router v6 with routes: `/dashboard`, `/managed-projects`, `/managed-projects/:projectCode`
- [ ] Task 1.7: Build shared `AppLayout` component (sidebar + header shell) matching the design's dark sidebar navigation

---

## Phase 2: Page 1 – Dashboard (Allocation Dashboard)

**API Used:** `GET /employees/me/allocations`, `GET /employees/me`
**Screen:** `project_view_dashboard_screen.png`

- [ ] Task 2.1: **TDD** — Write failing test for `DashboardPage` rendering stat cards (Total Active Allocations, Current Allocation %, Upcoming End Dates)
- [ ] Task 2.2: Implement `DashboardPage` shell with stat card layout
- [ ] Task 2.3: **TDD** — Write failing test for `AllocationTable` component (columns: Account Name, Project Name, Role, Allocation %, Billable, From Date, To Date, Status)
- [ ] Task 2.4: Implement `AllocationTable` component with progress bar for allocation %, color-coded status badges
- [ ] Task 2.5: **TDD** — Write failing test for `useMyAllocations` hook (calls `GET /employees/me/allocations`, handles loading/error states)
- [ ] Task 2.6: Implement `useMyAllocations` hook wired to the Dashboard table
- [ ] Task 2.7: **TDD** — Write failing test for Status filter dropdown on Dashboard
- [ ] Task 2.8: Implement filter by Status (Active / Upcoming / Ended) + pagination (Previous/Next)

---

## Phase 3: Page 2 – Managed Projects

**API Used:** `GET /projects?projectManagerEmpCode={empCode}&page=X&limit=10`
**Screen:** `managed_projects_view_screen.png`

- [ ] Task 3.1: **TDD** — Write failing test for `ManagedProjectsPage` rendering the projects table (Account Name, Project Name, Code, Team, Allocation %, Billable, Status, Action)
- [ ] Task 3.2: Implement `ManagedProjectsPage` table layout with clickable rows
- [ ] Task 3.3: **TDD** — Write failing test for `useManagedProjects` hook (fetches projects scoped to logged-in PM's `empCode`)
- [ ] Task 3.4: Implement `useManagedProjects` hook with server-side pagination
- [ ] Task 3.5: **TDD** — Write failing test for search input filtering projects by name/code
- [ ] Task 3.6: Implement search + Account/Status filter dropdowns
- [ ] Task 3.7: Verify clicking a project row navigates to `/managed-projects/:projectCode`

---

## Phase 4: Page 3 – Managed Project Details (Hero Screen)

**API Used:** `GET /projects/{projectCode}` + project allocations
**Screen:** `managed_project_details_screen.png`

- [ ] Task 4.1: **TDD** — Write failing test for `ProjectDetailsPage` rendering project header (name, account, priority, stat cards)
- [ ] Task 4.2: Implement `ProjectDetailsPage` with breadcrumb, stat cards (Total Allocated %, Team Members, Available Capacity)
- [ ] Task 4.3: **TDD** — Write failing test for `ResourceAllocationsTable` (Employee Name, Role, From, To, Allocation %, Status, Actions)
- [ ] Task 4.4: Implement `ResourceAllocationsTable` with avatar + email in employee cell, progress bar, Edit/Remove action buttons
- [ ] Task 4.5: **TDD** — Write failing test for `useProjectDetails` hook (GET `/projects/{projectCode}`)
- [ ] Task 4.6: Implement `useProjectDetails` hook
- [ ] Task 4.7: **TDD** — Write failing test for "Remove" action calling `DELETE /allocations/{allocationId}` with confirmation dialog
- [ ] Task 4.8: Implement Remove action with confirm dialog + optimistic UI update

---

## Phase 5: Modal – Assign Employee

**API Used:** `POST /allocations`, `PUT /allocations/{id}`, `GET /employees?search=`, `GET /allocations/capacity-check`
**Screen:** `project_allocation_details_screen.png`

- [ ] Task 5.1: **TDD** — Write failing test for `AssignEmployeeModal` rendering form fields (Employee dropdown, From Date, To Date, Allocation %, Billable toggle)
- [ ] Task 5.2: Implement `AssignEmployeeModal` component (Shadcn Dialog)
- [ ] Task 5.3: **TDD** — Write failing test for employee search-as-you-type in the dropdown (`GET /employees?search=...`)
- [ ] Task 5.4: Implement employee combobox with debounced search
- [ ] Task 5.5: **TDD** — Write failing test for capacity hint display ("Maximum recommended remaining: X%") from `GET /allocations/capacity-check`
- [ ] Task 5.6: Implement dynamic capacity hint that updates when employee + dates are selected
- [ ] Task 5.7: **TDD** — Write failing test for form submission calling `POST /allocations` and showing API error inline (`ERR_CAPACITY_EXCEEDED`)
- [ ] Task 5.8: Implement Create Assignment (POST) with React Hook Form + Zod schema validation
- [ ] Task 5.9: **TDD** — Write failing test for Edit mode: modal pre-filled from existing allocation, calling `PUT /allocations/{id}`
- [ ] Task 5.10: Implement Edit Assignment (PUT) — same modal, different submit target

---

## Phase 6: Shared Components & Polish

- [ ] Task 6.1: `StatusBadge` component (Active=blue, Upcoming=orange, Completed/Ended=grey)
- [ ] Task 6.2: `AllocationProgressBar` component (color indicator by percentage)
- [ ] Task 6.3: `DataTable` generic reusable table component with Shadcn Table
- [ ] Task 6.4: `ConfirmDialog` component for destructive actions (Remove, Stop)
- [ ] Task 6.5: Global error toast notification (Shadcn Toast)
- [ ] Task 6.6: Skeleton loading states for all tables and stat cards
- [ ] Task 6.7: Empty state components for: no projects, no allocations, no bench employees

---

## Phase 7: MSW Mocks & Integration Testing

- [ ] Task 7.1: Set up MSW with handlers for all 8 API endpoints used in PM MVP
- [ ] Task 7.2: Create realistic mock fixture data matching API shapes from spec
- [ ] Task 7.3: Integration test: Dashboard loads and displays mock allocations
- [ ] Task 7.4: Integration test: Managed Projects table loads, filters, and paginates
- [ ] Task 7.5: Integration test: Project Details loads, and Edit/Remove allocation actions work end-to-end
- [ ] Task 7.6: Integration test: Assign Employee modal submits and shows inline capacity error

---

## Handoff Gate (Before Implementation Starts)

| Gate | Required |
|---|---|
| ✅ Test file exists | `*.test.tsx` for each component |
| ✅ Tests run red | `npm test -- --run <file>` shows assertion failures |
| ✅ Red is valid | Test runner executed, not crashed |
