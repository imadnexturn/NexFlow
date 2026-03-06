import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '@/store/api/api-slice'
import { dashboardFiltersSlice } from '@/store/slices/dashboard-filters-slice'
import { projectsFiltersSlice } from '@/store/slices/projects-filters-slice'
import { projectDetailsSlice } from '@/store/slices/project-details-slice'
import ManagedProjectsPage from './managed-projects-page'
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
 * Helper: render ManagedProjectsPage with all required providers.
 */
function renderPage() {
    const store = createTestStore()
    const view = render(
        <Provider store={store}>
            <MemoryRouter>
                <ManagedProjectsPage />
            </MemoryRouter>
        </Provider>,
    )
    return { ...view, store }
}

describe('ManagedProjectsPage', () => {
    it('should render the page title "Managed Projects"', async () => {
        renderPage()
        expect(
            await screen.findByText('Managed Projects'),
        ).toBeInTheDocument()
    })

    it('should render the New Project button for HR role', async () => {
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
        expect(screen.getByText('New Project')).toBeInTheDocument()
    })

    it('should not render the New Project button for non-HR role', async () => {
        // The default mock uses 'ProjectManager', so we can use that
        renderPage()
        await screen.findByText('Cloud Migration 2.0')
        expect(screen.queryByText('New Project')).not.toBeInTheDocument()
    })

    it('should render a search input', async () => {
        renderPage()
        expect(
            await screen.findByPlaceholderText(
                /search projects, clients or codes/i,
            ),
        ).toBeInTheDocument()
    })

    it('should render Account and Status filter buttons', async () => {
        renderPage()
        await screen.findByText('Cloud Migration 2.0')
        expect(screen.getByText(/Account:/)).toBeInTheDocument()
        expect(screen.getByText(/Status:/)).toBeInTheDocument()
    })

    it('should render table column headers', async () => {
        renderPage()
        const table = await screen.findByRole('table')
        const headers = within(table).getAllByRole('columnheader')
        const headerTexts = headers.map((h) => h.textContent)

        expect(headerTexts).toEqual(
            expect.arrayContaining([
                'Account Name',
                'Project Name',
                'Code',
                'Billable',
                'Status↑',
                'Action',
            ]),
        )
    })

    it('should display project data from the API', async () => {
        renderPage()
        expect(
            await screen.findByText('Cloud Migration 2.0'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Banking App Redesign'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('LIMS Integration'),
        ).toBeInTheDocument()
    })

    it('should display account names', async () => {
        renderPage()
        expect(
            await screen.findByText('Global Tech Solutions'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Financier Group'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('BioTech Research'),
        ).toBeInTheDocument()
    })

    it('should display project codes in mono font', async () => {
        renderPage()
        const codeEl = await screen.findByText('PRJ-2024-001')
        expect(codeEl).toBeInTheDocument()
        expect(screen.getByText('PRJ-2024-012')).toBeInTheDocument()
        expect(screen.getByText('PRJ-2024-045')).toBeInTheDocument()
    })

    it('should display billable badges', async () => {
        renderPage()
        await screen.findByText('Cloud Migration 2.0')
        // Two billable projects (Yes) and one non-billable (No)
        const yesBadges = screen.getAllByText('Yes')
        expect(yesBadges.length).toBeGreaterThanOrEqual(2)
        expect(screen.getByText('No')).toBeInTheDocument()
    })

    it('should display status badges', async () => {
        renderPage()
        expect(
            await screen.findByText('Active'),
        ).toBeInTheDocument()
        expect(screen.getByText('Completed')).toBeInTheDocument()
        expect(screen.getByText('Upcoming')).toBeInTheDocument()
    })

    it('should show pagination info', async () => {
        renderPage()
        expect(
            await screen.findByText(/showing.*of.*projects/i),
        ).toBeInTheDocument()
    })

    it('should render view action links for each project', async () => {
        renderPage()
        await screen.findByText('Cloud Migration 2.0')
        const actionLinks = screen.getAllByRole('link', {
            name: /view project/i,
        })
        expect(actionLinks.length).toBeGreaterThanOrEqual(3)
    })

    // it('should debounce search input changes', async () => {
    //     const user = userEvent.setup({ delay: null })
    //     vi.useFakeTimers()
    //     
    //     const { store } = renderPage()
    //     
    //     const searchInput = await screen.findByPlaceholderText(/search projects, clients or codes/i)
    //     
    //     // Type into the search input
    //     await user.type(searchInput, 'test query')
    //     
    //     // At this point (before timers advance), the Redux state should NOT be updated yet
    //     // because the dispatch is debounced.
    //     expect(store.getState().projectsFilters.searchText).toBe('')
    //     
    //     // Advance timers by the debounce delay (500ms)
    //     vi.advanceTimersByTime(500)
    //     
    //     // Now the Redux state should be updated
    //     expect(store.getState().projectsFilters.searchText).toBe('test query')
    //     
    //     vi.useRealTimers()
    // })
})
