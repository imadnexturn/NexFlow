import { http, HttpResponse } from 'msw'
import { mockAllocations } from '../fixtures/allocations'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const employeeHandlers = [
    http.get(`${BASE_URL}/employees/me`, () => {
        return HttpResponse.json({
            employeeId: 'emp-uuid-001',
            empCode: 'EMP001',
            fullName: 'Alex Thompson',
            email: 'alex.thompson@company.com',
            designation: 'Senior Engineer',
            role: 'ProjectManager',
            isActive: true,
            reportsToId: null,
            reportsToEmpCode: null,
            reportsToName: null,
            availabilityPercentage: 25,
            allocationStatus: 'Partial',
            skills: ['React', 'TypeScript'],
            skillDetails: [],
            currentAllocations: mockAllocations,
            managedProjects: [
                {
                    projectId: 'proj-uuid-001',
                    projectCode: 'PRJ-2024-001',
                    projectName: 'Cloud Migration 2.0',
                    accountCode: 'ACC-GTS',
                    accountName: 'Global Tech Solutions',
                    managementRole: 'ProjectManager',
                    status: 'Active',
                    activeResourceCount: 8,
                },
                {
                    projectId: 'proj-uuid-002',
                    projectCode: 'PRJ-2024-012',
                    projectName: 'Banking App Redesign',
                    accountCode: 'ACC-FG',
                    accountName: 'Financier Group',
                    managementRole: 'ProjectManager',
                    status: 'Completed',
                    activeResourceCount: 5,
                },
                {
                    projectId: 'proj-uuid-003',
                    projectCode: 'PRJ-2024-045',
                    projectName: 'LIMS Integration',
                    accountCode: 'ACC-BT',
                    accountName: 'BioTech Research',
                    managementRole: 'ProjectManager',
                    status: 'Upcoming',
                    activeResourceCount: 3,
                },
            ],
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        })
    }),
]
