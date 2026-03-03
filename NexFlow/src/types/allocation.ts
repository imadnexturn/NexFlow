export type AllocationRecordStatus = 'Active' | 'Upcoming' | 'Ended'
export type AllocationStatus = 'Bench' | 'Partial' | 'Full'

export interface Allocation {
    allocationId: string
    empCode: string
    employeeName: string
    employeeEmail?: string
    roleOnProject?: string
    projectCode: string
    projectName: string
    accountCode: string
    fromDate: string
    toDate?: string
    percentage: number
    billable: boolean
    status: AllocationRecordStatus
}
