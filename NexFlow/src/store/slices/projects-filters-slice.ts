import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface ProjectsFiltersState {
    searchText: string
    accountFilter: string
    statusFilter: string
}

const initialState: ProjectsFiltersState = {
    searchText: '',
    accountFilter: '',
    statusFilter: '',
}

export const projectsFiltersSlice = createSlice({
    name: 'projectsFilters',
    initialState,
    reducers: {
        setSearchText(state, action: PayloadAction<string>) {
            state.searchText = action.payload
        },
        setAccountFilter(state, action: PayloadAction<string>) {
            state.accountFilter = action.payload
        },
        setStatusFilter(state, action: PayloadAction<string>) {
            state.statusFilter = action.payload
        },
        resetFilters() {
            return initialState
        },
    },
})

export const {
    setSearchText,
    setAccountFilter,
    setStatusFilter,
    resetFilters,
} = projectsFiltersSlice.actions
