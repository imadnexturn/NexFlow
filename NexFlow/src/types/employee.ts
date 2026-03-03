import type { Allocation, AllocationStatus } from './allocation'

export type EmployeeRole = 'HR' | 'ProjectManager' | 'Staff'
export type AccountType = 'Client' | 'Internal' | 'Bench'

/**
 * Employee summary as returned by the PAMS API.
 * Matches `EmployeeSummaryResponse` from api-spec v1.
 */
export interface EmployeeSummary {
    employeeId: string
    empCode: string
    fullName: string | null
    designation: string | null
    role: EmployeeRole
    isActive: boolean
    availabilityPercentage: number
    allocationStatus: AllocationStatus
    skills: string[]
}

/**
 * Employee detail as returned by the PAMS API.
 * Matches `EmployeeDetailResponse` from api-spec v1.
 */
export interface Employee extends EmployeeSummary {
    firstName: string | null
    lastName: string | null
    email: string | null
    reportsToEmpCode: string | null
    reportsToName: string | null
    skillDetails: SkillResponse[]
    currentAllocations: Allocation[]
    createdAt: string
    updatedAt: string
}

/**
 * Skill detail as returned by the PAMS API.
 * Matches `SkillResponse` from api-spec v1.
 */
export interface SkillResponse {
    skillId: string
    skillName: string | null
    isActive: boolean
}
