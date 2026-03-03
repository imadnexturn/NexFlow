import { apiSlice } from './api-slice'
import type { Project, PaginatedResponse } from '@/types'

interface GetManagedProjectsArgs {
    empCode: string
    page?: number
    limit?: number
}

const projectsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getManagedProjects: builder.query<
            PaginatedResponse<Project>,
            GetManagedProjectsArgs
        >({
            query: ({ empCode, page = 1, limit = 10 }) =>
                `/projects?projectManagerEmpCode=${encodeURIComponent(empCode)}&page=${page}&limit=${limit}`,
            providesTags: ['Project'],
        }),
        getProjectDetails: builder.query<Project, string>({
            query: (projectCode) =>
                `/projects/${encodeURIComponent(projectCode)}`,
            providesTags: (_result, _error, projectCode) => [
                { type: 'ProjectDetails', id: projectCode },
            ],
        }),
    }),
})

export const {
    useGetManagedProjectsQuery,
    useGetProjectDetailsQuery,
} = projectsApi
