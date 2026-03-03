import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './api/api-slice'
import { dashboardFiltersSlice } from './slices/dashboard-filters-slice'
import { projectsFiltersSlice } from './slices/projects-filters-slice'
import { projectDetailsSlice } from './slices/project-details-slice'

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        dashboardFilters: dashboardFiltersSlice.reducer,
        projectsFilters: projectsFiltersSlice.reducer,
        projectDetails: projectDetailsSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
