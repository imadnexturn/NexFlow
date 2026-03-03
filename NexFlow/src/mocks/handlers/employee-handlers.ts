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
            managedProjects: [],
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        })
    }),
]
