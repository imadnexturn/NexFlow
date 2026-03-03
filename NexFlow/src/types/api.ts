/**
 * Standard pagination metadata from the PAMS API.
 * Matches `PaginationMeta` from api-spec v1.
 */
export interface PaginationMeta {
    page: number
    limit: number
    totalRecords: number
    totalPages: number
}

/**
 * Standard paginated response wrapper from the PAMS API.
 */
export interface PaginatedResponse<T> {
    data: T[]
    pagination: PaginationMeta
}

/**
 * RFC 7807 Problem Details error response.
 * Matches `ProblemDetails` from api-spec v1.
 */
export interface ApiError {
    type: string
    title: string
    status: number
    detail: string
    instance?: string
    traceId?: string
}

/**
 * Capacity check response.
 * Matches `CapacityCheckResponse` from api-spec v1.
 */
export interface CapacityCheckResponse {
    empCode: string
    windowFrom: string
    windowTo: string | null
    currentTotalPercentage: number
    availablePercentage: number
    allocationStatus: 'Bench' | 'Partial' | 'Full'
}

/**
 * Payload for creating an allocation.
 * Matches `CreateAllocationCommand` from api-spec v1.
 */
export interface AllocationPayload {
    empCode: string
    projectCode: string
    fromDate: string
    toDate?: string
    percentage: number
}

/**
 * Payload for updating an allocation.
 * Matches `UpdateAllocationRequest` from api-spec v1.
 */
export interface UpdateAllocationPayload {
    fromDate: string
    toDate?: string
    percentage: number
}

/**
 * Stop allocation request.
 * Matches `StopAllocationRequest` from api-spec v1.
 */
export interface StopAllocationPayload {
    action: 'stop'
}
