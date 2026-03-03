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
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <ManagedProjectsPage />
            </MemoryRouter>
        </Provider>,
    )
}

describe('ManagedProjectsPage', () => {
    it('should render the page title "Managed Projects"', async () => {
        renderPage()
        expect(
            await screen.findByText('Managed Projects'),
        ).toBeInTheDocument()
    })

    it('should render the New Project button', async () => {
        renderPage()
        await screen.findByText('Cloud Migration 2.0')
        expect(screen.getByText('New Project')).toBeInTheDocument()
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
                'Status',
                'Action',
            ]),
        )
    })

    it('should display project data from the API', async () => {
        renderPage()
        // Wait for MSW-backed API data to render
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

    it('should render view action buttons for each project', async () => {
        renderPage()
        // Wait for data
        await screen.findByText('Cloud Migration 2.0')
        const actionButtons = screen.getAllByRole('button', {
            name: /view project/i,
        })
        expect(actionButtons.length).toBeGreaterThanOrEqual(3)
    })
})
