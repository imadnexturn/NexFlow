import type { Allocation } from './allocation'

export type ProjectStatus = 'Upcoming' | 'Active' | 'Completed'
export type ManagementRole = 'ProjectManager' | 'TeamLead'

/**
 * Project summary as returned by the PAMS API.
 * Matches `ProjectSummary` from api-spec v1.9.0.
 */
export interface ProjectSummary {
    projectId: string
    projectCode: string
    projectName: string | null
    accountId: string
    accountCode: string | null
    accountName: string | null
    projectManagerId: string | null
    projectManagerEmpCode: string | null
    projectManagerName: string | null
    status: ProjectStatus
    billable: boolean
    isActive: boolean
    startDate: string
    endDate: string | null
}

/**
 * Project detail as returned by the PAMS API.
 * Matches `ProjectResponse` from api-spec v1.9.0.
 * Includes enriched allocations[] and teamMembers[].
 */
export interface Project extends ProjectSummary {
    allocations: Allocation[]
    teamMembers: ProjectTeamMemberResponse[]
    createdAt: string
    updatedAt: string
}

/**
 * A project where the employee is either the PM or a Team Lead.
 * Matches `ManagedProjectItem` from api-spec v1.9.0.
 */
export interface ManagedProjectItem {
    projectId: string
    projectCode: string
    projectName: string
    accountCode: string
    accountName: string
    managementRole: ManagementRole
    status: ProjectStatus
    activeResourceCount: number
}

/**
 * Project-scoped Team Lead → Reportee assignment.
 * Matches `ProjectTeamMemberResponse` from api-spec v1.9.0.
 */
export interface ProjectTeamMemberResponse {
    id: string
    projectId: string
    projectCode: string
    teamLeadId: string
    teamLeadEmpCode: string
    teamLeadFullName: string
    reporteeId: string
    reporteeEmpCode: string
    reporteeFullName: string
    createdAt: string
}
