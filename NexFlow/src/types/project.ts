export type ProjectStatus = 'Upcoming' | 'Active' | 'Completed'

/**
 * Project summary as returned by the PAMS API.
 * Matches `ProjectSummaryResponse` from api-spec v1.
 */
export interface ProjectSummary {
    projectId: string
    projectCode: string
    projectName: string | null
    accountId: string
    accountCode: string | null
    accountName: string | null
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
 * Matches `ProjectDetailResponse` from api-spec v1.
 */
export interface Project extends ProjectSummary {
    createdAt: string
    updatedAt: string
}
