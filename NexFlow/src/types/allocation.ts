export type AllocationRecordStatus = 'Active' | 'Upcoming' | 'Ended'
export type AllocationStatus = 'Bench' | 'Partial' | 'Full'

/**
 * Allocation detail as returned by the PAMS API.
 * Matches `AllocationDetailResponse` from api-spec v1.9.0.
 */
export interface Allocation {
    allocationId: string
    employeeId: string
    empCode: string
    employeeName: string | null
    projectRole: string | null
    projectId: string
    projectCode: string
    projectName: string | null
    billable: boolean
    accountCode: string
    accountName: string
    percentage: number
    fromDate: string
    toDate: string | null
    status: AllocationRecordStatus
    createdAt: string
    updatedAt: string
}
