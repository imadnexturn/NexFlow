import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '@/store/api/api-slice'
import { dashboardFiltersSlice } from '@/store/slices/dashboard-filters-slice'
import { projectsFiltersSlice } from '@/store/slices/projects-filters-slice'
import { projectDetailsSlice } from '@/store/slices/project-details-slice'
import AssignEmployeeModal from './assign-employee-modal'

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

function renderModal(props?: Partial<{
    open: boolean
    onOpenChange: (open: boolean) => void
    projectCode: string
    projectName: string
}>) {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        projectCode: 'PRJ-2024-001',
        projectName: 'Cloud Migration 2.0',
        ...props,
    }
    const store = createTestStore()
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <AssignEmployeeModal {...defaultProps} />
            </MemoryRouter>
        </Provider>,
    )
}

describe('AssignEmployeeModal', () => {
    it('should render the modal title "Assign Employee"', () => {
        renderModal()
        expect(
            screen.getByText('Assign Employee'),
        ).toBeInTheDocument()
    })

    it('should render the subtitle with project name', () => {
        renderModal()
        expect(
            screen.getByText(/Cloud Migration 2\.0/),
        ).toBeInTheDocument()
    })

    it('should render the employee name combobox trigger', () => {
        renderModal()
        expect(
            screen.getByRole('combobox', { name: /employee name/i }),
        ).toBeInTheDocument()
    })

    it('should render From Date and To Date labels', () => {
        renderModal()
        expect(screen.getByText('From Date')).toBeInTheDocument()
        expect(screen.getByText('To Date')).toBeInTheDocument()
    })

    it('should render Allocation Percentage input', () => {
        renderModal()
        expect(
            screen.getByLabelText(/allocation percentage/i),
        ).toBeInTheDocument()
    })

    it('should render Billable Status toggle', () => {
        renderModal()
        expect(
            screen.getByText('Billable Status'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('switch'),
        ).toBeInTheDocument()
    })

    it('should render Cancel and Save Assignment buttons', () => {
        renderModal()
        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /save assignment/i }),
        ).toBeInTheDocument()
    })

    it('should call onOpenChange when Cancel is clicked', async () => {
        const onOpenChange = vi.fn()
        renderModal({ onOpenChange })
        const cancelBtn = screen.getByRole('button', { name: /cancel/i })
        await userEvent.click(cancelBtn)
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('should render Role dropdown with project role options', async () => {
        renderModal()
        expect(screen.getByText('Role')).toBeInTheDocument()
        expect(screen.getByText('Select a role')).toBeInTheDocument()
    })
})
