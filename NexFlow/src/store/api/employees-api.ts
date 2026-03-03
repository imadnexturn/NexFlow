import { apiSlice } from './api-slice'
import type { Employee, Allocation } from '@/types'

const employeesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query<Employee, void>({
            query: () => '/employees/me',
            providesTags: ['Employee'],
        }),
        getMyAllocations: builder.query<Allocation[], void>({
            query: () => '/employees/me/allocations',
            providesTags: ['MyAllocations'],
        }),
        searchEmployees: builder.query<Employee[], string>({
            query: (search) =>
                `/employees?search=${encodeURIComponent(search)}&isActive=true`,
        }),
    }),
})

export const {
    useGetMeQuery,
    useGetMyAllocationsQuery,
    useSearchEmployeesQuery,
    useLazySearchEmployeesQuery,
} = employeesApi
