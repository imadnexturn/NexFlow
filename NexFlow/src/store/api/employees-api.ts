import { apiSlice } from './api-slice'
import type { Employee, EmployeeSummary, PaginatedResponse } from '@/types'

interface SearchEmployeesArgs {
    search?: string
    role?: string
    isActive?: boolean
    benchOnly?: boolean
    windowFrom?: string
    windowTo?: string
    page?: number
    limit?: number
}

const employeesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query<Employee, void>({
            query: () => '/employees/me',
            providesTags: ['Employee'],
        }),
        getMyAllocations: builder.query<Employee, void>({
            query: () => '/employees/me',
            providesTags: ['MyAllocations', 'Employee'],
        }),
        searchEmployees: builder.query<
            PaginatedResponse<EmployeeSummary>,
            SearchEmployeesArgs
        >({
            query: ({
                search,
                role,
                isActive,
                benchOnly,
                windowFrom,
                windowTo,
                page = 1,
                limit = 10,
            }) => {
                const params = new URLSearchParams()
                if (search) params.set('search', search)
                if (role) params.set('role', role)
                if (isActive !== undefined) {
                    params.set('isActive', String(isActive))
                }
                if (benchOnly) params.set('benchOnly', 'true')
                if (windowFrom) params.set('windowFrom', windowFrom)
                if (windowTo) params.set('windowTo', windowTo)
                params.set('page', String(page))
                params.set('limit', String(limit))
                return `/employees?${params.toString()}`
            },
        }),
        getEmployeeByCode: builder.query<Employee, string>({
            query: (empCode) =>
                `/employees/${encodeURIComponent(empCode)}`,
        }),
        exportEmployees: builder.mutation<
            Blob,
            SearchEmployeesArgs & { ext: 'pdf' | 'xls'; columnMap?: Record<string, string> }
        >({
            query: ({ ext, columnMap, ...searchArgs }) => {
                const params = new URLSearchParams()
                params.set('ext', ext)
                if (searchArgs.search) params.set('search', searchArgs.search)
                if (searchArgs.role) params.set('role', searchArgs.role)
                if (searchArgs.isActive !== undefined) {
                    params.set('isActive', String(searchArgs.isActive))
                }
                if (searchArgs.benchOnly) params.set('benchOnly', 'true')
                if (searchArgs.windowFrom) params.set('windowFrom', searchArgs.windowFrom)
                if (searchArgs.windowTo) params.set('windowTo', searchArgs.windowTo)

                return {
                    url: `/employees/export?${params.toString()}`,
                    method: 'POST',
                    body: columnMap || {},
                    responseHandler: (response) => response.blob(),
                }
            },
        }),
    }),
})

export const {
    useGetMeQuery,
    useGetMyAllocationsQuery,
    useSearchEmployeesQuery,
    useLazySearchEmployeesQuery,
    useGetEmployeeByCodeQuery,
    useExportEmployeesMutation,
} = employeesApi
