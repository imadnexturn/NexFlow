import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '@/store/api/api-slice'
import { dashboardFiltersSlice } from '@/store/slices/dashboard-filters-slice'
import { projectsFiltersSlice } from '@/store/slices/projects-filters-slice'
import { projectDetailsSlice } from '@/store/slices/project-details-slice'
import StopAllocationDialog from './stop-allocation-dialog'

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

function renderDialog(props?: Partial<{
    open: boolean
    onOpenChange: (open: boolean) => void
    allocationId: string
    employeeName: string
}>) {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        allocationId: 'alloc-001',
        employeeName: 'Sarah Chen',
        ...props,
    }
    const store = createTestStore()
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <StopAllocationDialog {...defaultProps} />
            </MemoryRouter>
        </Provider>,
    )
}

describe('StopAllocationDialog', () => {
    it('should render the dialog title', () => {
        renderDialog()
        expect(
            screen.getByRole('heading', {
                name: /stop allocation/i,
            }),
        ).toBeInTheDocument()
    })

    it('should display the employee name in the message', () => {
        renderDialog()
        expect(
            screen.getByText(/Sarah Chen/),
        ).toBeInTheDocument()
    })

    it('should render Cancel and Stop buttons', () => {
        renderDialog()
        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /stop allocation/i }),
        ).toBeInTheDocument()
    })
})
