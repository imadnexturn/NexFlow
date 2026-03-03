import { apiSlice } from './api-slice'
import type {
    Allocation,
    AllocationPayload,
    UpdateAllocationPayload,
    StopAllocationPayload,
    CapacityCheckResponse,
} from '@/types'

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
            { id: string; body: UpdateAllocationPayload }
        >({
            query: ({ id, body }) => ({
                url: `/allocations/${encodeURIComponent(id)}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['ProjectDetails', 'MyAllocations'],
        }),
        stopAllocation: builder.mutation<
            Allocation,
            { id: string; body: StopAllocationPayload }
        >({
            query: ({ id, body }) => ({
                url: `/allocations/${encodeURIComponent(id)}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['ProjectDetails', 'MyAllocations'],
        }),
        deleteAllocation: builder.mutation<Allocation, string>({
            query: (id) => ({
                url: `/allocations/${encodeURIComponent(id)}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProjectDetails', 'MyAllocations'],
        }),
        checkCapacity: builder.query<CapacityCheckResponse, CheckCapacityArgs>(
            {
                query: ({ empCode, fromDate, toDate, excludeAllocationId }) => {
                    const params = new URLSearchParams()
                    if (empCode) params.set('empCode', empCode)
                    if (fromDate) params.set('fromDate', fromDate)
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
    useStopAllocationMutation,
    useDeleteAllocationMutation,
    useCheckCapacityQuery,
    useLazyCheckCapacityQuery,
} = allocationsApi
