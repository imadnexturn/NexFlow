import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '@/store/api/api-slice'
import { dashboardFiltersSlice } from '@/store/slices/dashboard-filters-slice'
import { projectsFiltersSlice } from '@/store/slices/projects-filters-slice'
import { projectDetailsSlice } from '@/store/slices/project-details-slice'
import ProjectDetailsPage from './project-details-page'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'
import { mockAllocations } from '@/mocks/fixtures/allocations'

/**
 * Helper: create a fresh store for each test.
 */
function createTestStore() {
    return configureStore({
        reducer: {
            [apiSlice.reducerPath]: apiSlice.reducer,
            dashboardFilters: dashboardFiltersSlice.reducer,
            projectsFilters: projectsFiltersSlice.reducer,
            projectDetails: projectDetailsSlice.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(apiSlice.middleware),
    })
}

/**
 * Helper: render ProjectDetailsPage at /managed-projects/:projectCode.
 */
function renderPage(projectCode = 'PRJ-2024-001') {
    const store = createTestStore()
    return render(
        <Provider store={store}>
            <MemoryRouter
                initialEntries={[`/managed-projects/${projectCode}`]}
            >
                <Routes>
                    <Route
                        path="/managed-projects/:projectCode"
                        element={<ProjectDetailsPage />}
                    />
                </Routes>
            </MemoryRouter>
        </Provider>,
    )
}

describe('ProjectDetailsPage', () => {
    it('should render "Back to Managed Projects" link', async () => {
        renderPage()
        expect(
            await screen.findByText(/back to managed projects/i),
        ).toBeInTheDocument()
    })

    it('should render the project name from API', async () => {
        renderPage()
        expect(
            await screen.findByText('Cloud Migration 2.0'),
        ).toBeInTheDocument()
    })

    it('should render the account name subtitle', async () => {
        renderPage()
        await screen.findByText('Cloud Migration 2.0')
        expect(
            screen.getByText(/Global Tech Solutions/),
        ).toBeInTheDocument()
    })

    it('should render the "Project Settings" button for HR role', async () => {
        // Override the default mock to return an HR role for this test
        server.use(
            http.get(`${import.meta.env.VITE_API_BASE_URL}/employees/me`, () => {
                return HttpResponse.json({
                    ...mockAllocations[0], // Base data structure doesn't matter much here, we just need role
                    employeeId: 'emp-uuid-hr',
                    empCode: 'EMP-HR',
                    fullName: 'HR User',
                    role: 'HR',
                })
            })
        )
        
        renderPage()
        await screen.findByText('Cloud Migration 2.0')
        expect(
            screen.getByRole('button', { name: /project settings/i }),
        ).toBeInTheDocument()
    })

    it('should not render the "Project Settings" button for non-HR role', async () => {
        // The default mock uses 'ProjectManager', so we can use that
        renderPage()
        await screen.findByText('Cloud Migration 2.0')
        expect(
            screen.queryByRole('button', { name: /project settings/i }),
        ).not.toBeInTheDocument()
    })

    it('should render 3 stat cards', async () => {
        renderPage()
        await screen.findByText('Cloud Migration 2.0')
        expect(
            screen.getByText('Total Allocation'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Assigned Resources'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Average Allocation'),
        ).toBeInTheDocument()
    })

    it('should render "Resource Allocations" heading', async () => {
        renderPage()
        expect(
            await screen.findByText('Resource Allocations'),
        ).toBeInTheDocument()
    })

    it('should render "Assign Employee" button', async () => {
        renderPage()
        await screen.findByText('Cloud Migration 2.0')
        expect(
            screen.getByRole('button', { name: /assign employee/i }),
        ).toBeInTheDocument()
    })

    it('should render table column headers', async () => {
        renderPage()
        const table = await screen.findByRole('table')
        const headers = within(table).getAllByRole('columnheader')
        const headerTexts = headers.map((h) => h.textContent)

        expect(headerTexts).toEqual(
            expect.arrayContaining([
                'Employee Name',
                'Role',
                'From Date',
                'To Date',
                'Allocation %',
                'Status',
                'Actions',
            ]),
        )
    })

    it('should display allocation data (employee names)', async () => {
        renderPage()
        expect(
            await screen.findByText('Sarah Chen'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Marcus Aurelius'),
        ).toBeInTheDocument()
    })

    it('should render edit action buttons', async () => {
        renderPage()
        await screen.findByText('Sarah Chen')
        const editButtons = screen.getAllByRole('button', {
            name: /edit allocation/i,
        })
        expect(editButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('should render remove action buttons', async () => {
        renderPage()
        await screen.findByText('Sarah Chen')
        const removeButtons = screen.getAllByRole('button', {
            name: /remove allocation/i,
        })
        expect(removeButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('should disable edit and delete actions for the logged in user', async () => {
        // Mock logged in user to be Sarah Chen. We need her empCode to match the one in the project mock.
        // Even if we don't know her exact empCode, we can override the project mock, OR we can just check what the test data uses.
        // Assuming her empCode is 'EMP-001' or similar. Better yet, let's mock it using what's available.
        // Wait, the test already finds "Sarah Chen". Let's assume her empCode is what we set in the mock or we can just provide "EMP-001".
        // Actually, if we look at `mockAllocations[0]`, it has empCode "EMP001". Let's assume the project details mock uses EMP001 for her or something similar.
        // Let's just mock /employees/me to return the exact data for Sarah Chen.
        server.use(
            http.get(`${import.meta.env.VITE_API_BASE_URL}/employees/me`, () => {
                return HttpResponse.json({
                    employeeId: 'emp-uuid-010',
                    empCode: 'EMP010', // exact empCode used in project-handlers.ts for Sarah
                    fullName: 'Sarah Chen',
                    role: 'ProjectManager',
                })
            })
        )
        
        renderPage()
        
        // Find the row for the logged in user (Sarah Chen)
        const row = await screen.findByText('Sarah Chen')
        const rowContainer = row.closest('tr')!
        
        // Verify buttons in this row. If EMP-001 is wrong, they won't be disabled. We'll find out.
        const editButton = within(rowContainer).getByRole('button', { name: /edit allocation/i })
        const removeButton = within(rowContainer).getByRole('button', { name: /remove allocation/i })
        
        expect(editButton).toBeDisabled()
        expect(removeButton).toBeDisabled()
    })

    it('should show pagination controls', async () => {
        renderPage()
        await screen.findByText('Sarah Chen')
        expect(
            screen.getByRole('button', { name: /previous/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /next/i }),
        ).toBeInTheDocument()
    })
})
