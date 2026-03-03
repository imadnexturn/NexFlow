import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '@/store/api/api-slice'
import { dashboardFiltersSlice } from '@/store/slices/dashboard-filters-slice'
import DashboardPage from './dashboard-page'

/**
 * Helper: create a fresh store for each test.
 */
function createTestStore() {
    return configureStore({
        reducer: {
            [apiSlice.reducerPath]: apiSlice.reducer,
            dashboardFilters: dashboardFiltersSlice.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(apiSlice.middleware),
    })
}

/**
 * Helper: render DashboardPage with all required providers.
 */
function renderDashboard() {
    const store = createTestStore()
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        </Provider>,
    )
}

describe('DashboardPage', () => {
    it('should render the page title "Manager Allocation Dashboard"', async () => {
        renderDashboard()
        expect(
            await screen.findByText('Manager Allocation Dashboard'),
        ).toBeInTheDocument()
    })

    it('should render the Export Report button', async () => {
        renderDashboard()
        expect(
            await screen.findByRole('button', { name: /export report/i }),
        ).toBeInTheDocument()
    })

    it('should render a search input', async () => {
        renderDashboard()
        expect(
            await screen.findByPlaceholderText(/search allocations/i),
        ).toBeInTheDocument()
    })

    it('should render four stat cards', async () => {
        renderDashboard()
        expect(
            await screen.findByText('Total Active Allocations'),
        ).toBeInTheDocument()
        expect(screen.getByText('Current Allocation %')).toBeInTheDocument()
        expect(screen.getByText('Total Allocations')).toBeInTheDocument()
        expect(screen.getByText('Upcoming End Dates')).toBeInTheDocument()
    })

    it('should render the "My Allocations" section heading', async () => {
        renderDashboard()
        expect(
            await screen.findByText('My Allocations'),
        ).toBeInTheDocument()
    })

    it('should render the Filter by Status button', async () => {
        renderDashboard()
        expect(
            await screen.findByRole('button', { name: /filter by status/i }),
        ).toBeInTheDocument()
    })

    it('should render table column headers', async () => {
        renderDashboard()
        const table = await screen.findByRole('table')
        const headers = within(table).getAllByRole('columnheader')
        const headerTexts = headers.map((h) => h.textContent)

        expect(headerTexts).toEqual(
            expect.arrayContaining([
                'Project Code',
                'Project Name',
                'Allocation %',
                'From Date',
                'To Date',
            ]),
        )
    })

    it('should display allocation data from the API', async () => {
        renderDashboard()
        // Wait for MSW-backed API data to render
        expect(await screen.findByText('Project Alpha')).toBeInTheDocument()
        expect(screen.getByText('Phoenix Systems')).toBeInTheDocument()
        expect(screen.getByText('Iron Wing Dev')).toBeInTheDocument()
    })

    it('should show pagination controls', async () => {
        renderDashboard()
        expect(
            await screen.findByRole('button', { name: /previous/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /next/i }),
        ).toBeInTheDocument()
    })
})
