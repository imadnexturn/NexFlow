import { apiSlice } from './api-slice'
import type { Allocation, AllocationPayload, CapacityCheckResponse } from '@/types'

interface CheckCapacityArgs {
    empCode: string
    fromDate: string
    toDate?: string
    excludeAllocationId?: string
}

const allocationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createAllocation: builder.mutation<Allocation, AllocationPayload>({
            query: (body) => ({
                url: '/allocations',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ProjectDetails', 'MyAllocations'],
        }),
        updateAllocation: builder.mutation<
            Allocation,
            { id: string; body: AllocationPayload }
        >({
            query: ({ id, body }) => ({
                url: `/allocations/${encodeURIComponent(id)}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['ProjectDetails', 'MyAllocations'],
        }),
        deleteAllocation: builder.mutation<void, string>({
            query: (id) => ({
                url: `/allocations/${encodeURIComponent(id)}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProjectDetails', 'MyAllocations'],
        }),
        checkCapacity: builder.query<CapacityCheckResponse, CheckCapacityArgs>(
            {
                query: ({ empCode, fromDate, toDate, excludeAllocationId }) => {
                    const params = new URLSearchParams({
                        empCode,
                        fromDate,
                    })
                    if (toDate) params.set('toDate', toDate)
                    if (excludeAllocationId) {
                        params.set(
                            'excludeAllocationId',
                            excludeAllocationId,
                        )
                    }
                    return `/allocations/capacity-check?${params.toString()}`
                },
            },
        ),
    }),
})

export const {
    useCreateAllocationMutation,
    useUpdateAllocationMutation,
    useDeleteAllocationMutation,
    useCheckCapacityQuery,
    useLazyCheckCapacityQuery,
} = allocationsApi
