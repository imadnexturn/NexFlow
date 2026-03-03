import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AllocationRecordStatus } from '@/types'

type DashboardStatusFilter = 'All' | AllocationRecordStatus

interface DashboardFiltersState {
    statusFilter: DashboardStatusFilter
    searchText: string
}

const initialState: DashboardFiltersState = {
    statusFilter: 'All',
    searchText: '',
}

export const dashboardFiltersSlice = createSlice({
    name: 'dashboardFilters',
    initialState,
    reducers: {
        setStatusFilter(state, action: PayloadAction<DashboardStatusFilter>) {
            state.statusFilter = action.payload
        },
        setSearchText(state, action: PayloadAction<string>) {
            state.searchText = action.payload
        },
        resetFilters() {
            return initialState
        },
    },
})

export const {
    setStatusFilter,
    setSearchText,
    resetFilters,
} = dashboardFiltersSlice.actions
