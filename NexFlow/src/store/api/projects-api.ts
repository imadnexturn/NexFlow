import { apiSlice } from './api-slice'
import type { Project, ProjectSummary, PaginatedResponse } from '@/types'

interface GetManagedProjectsArgs {
    projectManagerEmpCode?: string
    search?: string
    accountCode?: string
    status?: string
    isActive?: boolean
    billable?: boolean
    page?: number
    limit?: number
}

const projectsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getManagedProjects: builder.query<
            PaginatedResponse<ProjectSummary>,
            GetManagedProjectsArgs
        >({
            query: ({
                projectManagerEmpCode,
                search,
                accountCode,
                status,
                isActive,
                billable,
                page = 1,
                limit = 10,
            }) => {
                const params = new URLSearchParams()
                if (projectManagerEmpCode) {
                    params.set('projectManagerEmpCode', projectManagerEmpCode)
                }
                if (search) params.set('search', search)
                if (accountCode) params.set('accountCode', accountCode)
                if (status) params.set('status', status)
                if (isActive !== undefined) {
                    params.set('isActive', String(isActive))
                }
                if (billable !== undefined) {
                    params.set('billable', String(billable))
                }
                params.set('page', String(page))
                params.set('limit', String(limit))
                return `/projects?${params.toString()}`
            },
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
