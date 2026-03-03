import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Allocation } from '@/types'

interface ProjectDetailsState {
    isModalOpen: boolean
    selectedAllocation: Allocation | null
    mode: 'create' | 'edit'
}

const initialState: ProjectDetailsState = {
    isModalOpen: false,
    selectedAllocation: null,
    mode: 'create',
}

export const projectDetailsSlice = createSlice({
    name: 'projectDetails',
    initialState,
    reducers: {
        openCreateModal(state) {
            state.isModalOpen = true
            state.selectedAllocation = null
            state.mode = 'create'
        },
        openEditModal(state, action: PayloadAction<Allocation>) {
            state.isModalOpen = true
            state.selectedAllocation = action.payload
            state.mode = 'edit'
        },
        closeModal(state) {
            state.isModalOpen = false
            state.selectedAllocation = null
            state.mode = 'create'
        },
    },
})

export const {
    openCreateModal,
    openEditModal,
    closeModal,
} = projectDetailsSlice.actions
