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
import EditAllocationModal from './edit-allocation-modal'
import type { Allocation } from '@/types'

const mockAllocation: Allocation = {
    allocationId: 'alloc-001',
    employeeId: 'emp-uuid-010',
    empCode: 'EMP010',
    employeeName: 'Sarah Chen',
    projectRole: 'Sr. Project Manager',
    projectId: 'proj-uuid-001',
    projectCode: 'PRJ-2024-001',
    projectName: 'Cloud Migration 2.0',
    billable: true,
    accountCode: 'ACC-GTS',
    accountName: 'Global Tech Solutions',
    percentage: 100,
    fromDate: '2024-01-12',
    toDate: '2024-12-30',
    status: 'Active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
}

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
    allocation: Allocation
}>) {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        allocation: mockAllocation,
        ...props,
    }
    const store = createTestStore()
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <EditAllocationModal {...defaultProps} />
            </MemoryRouter>
        </Provider>,
    )
}

describe('EditAllocationModal', () => {
    it('should render the modal title "Edit Allocation"', () => {
        renderModal()
        expect(
            screen.getByText('Edit Allocation'),
        ).toBeInTheDocument()
    })

    it('should display the employee name', () => {
        renderModal()
        expect(
            screen.getByText(/Sarah Chen/),
        ).toBeInTheDocument()
    })

    it('should render From Date and To Date labels', () => {
        renderModal()
        expect(screen.getByText('From Date')).toBeInTheDocument()
        expect(screen.getByText('To Date')).toBeInTheDocument()
    })

    it('should render Allocation Percentage input with prefilled value', () => {
        renderModal()
        const input = screen.getByLabelText(
            /allocation percentage/i,
        ) as HTMLInputElement
        expect(input.value).toBe('100')
    })

    it('should render Cancel and Save Changes buttons', () => {
        renderModal()
        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /save changes/i }),
        ).toBeInTheDocument()
    })

    it('should call onOpenChange when Cancel is clicked', async () => {
        const onOpenChange = vi.fn()
        renderModal({ onOpenChange })
        await userEvent.click(
            screen.getByRole('button', { name: /cancel/i }),
        )
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })
})
