export interface PaginatedResponse<T> {
    data: T[]
    page: number
    limit: number
    totalCount: number
    totalPages: number
}

export interface ApiError {
    code: string
    message: string
    details?: Record<string, unknown>
}

export interface CapacityCheckResponse {
    empCode: string
    currentTotalPercentage: number
    maxRecommendedRemaining: number
    isAvailable: boolean
}

export interface AllocationPayload {
    empCode: string
    projectCode: string
    fromDate: string
    toDate?: string
    percentage: number
    billable: boolean
}
