import type { Allocation } from './allocation'

export type EmployeeRole = 'HR' | 'ProjectManager' | 'Staff'
export type AccountType = 'Client' | 'Internal' | 'Bench'

export interface Employee {
    empCode: string
    firstName: string
    lastName: string
    email: string
    designation: string
    role: EmployeeRole
    reportsToEmpCode?: string
    isActive: boolean
    currentAllocationStatus?: 'Bench' | 'Partial' | 'Full'
    currentAllocations?: Allocation[]
}
