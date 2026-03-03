export type ProjectStatus = 'Upcoming' | 'Active' | 'Completed'

export interface Project {
    projectCode: string
    projectName: string
    accountCode: string
    accountName: string
    projectManagerEmpCode: string
    status: ProjectStatus
    billable: boolean
    startDate: string
    endDate?: string
    isActive: boolean
    totalAllocatedPercentage?: number
    teamSize?: number
    availableCapacity?: number
}
