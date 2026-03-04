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
    http.get(`${BASE_URL}/employees`, ({ request }) => {
        const url = new URL(request.url)
        const search = (url.searchParams.get('search') ?? '').toLowerCase()

        const allEmployees = [
            {
                employeeId: 'emp-uuid-010',
                empCode: 'EMP010',
                fullName: 'Sarah Chen',
                designation: 'Sr. Project Manager',
                role: 'Staff',
                isActive: true,
                availabilityPercentage: 0,
                allocationStatus: 'Full',
                skills: ['Project Management'],
            },
            {
                employeeId: 'emp-uuid-011',
                empCode: 'EMP011',
                fullName: 'Marcus Aurelius',
                designation: 'Backend Lead',
                role: 'Staff',
                isActive: true,
                availabilityPercentage: 50,
                allocationStatus: 'Partial',
                skills: ['Java', 'Spring Boot'],
            },
            {
                employeeId: 'emp-uuid-012',
                empCode: 'EMP012',
                fullName: 'Elena Rodriguez',
                designation: 'UI/UX Designer',
                role: 'Staff',
                isActive: true,
                availabilityPercentage: 100,
                allocationStatus: 'Bench',
                skills: ['Figma', 'CSS'],
            },
            {
                employeeId: 'emp-uuid-013',
                empCode: 'EMP013',
                fullName: 'David Kim',
                designation: 'QA Specialist',
                role: 'Staff',
                isActive: true,
                availabilityPercentage: 0,
                allocationStatus: 'Full',
                skills: ['Selenium', 'Cypress'],
            },
        ]

        const filtered = search
            ? allEmployees.filter(
                (e) =>
                    (e.fullName?.toLowerCase().includes(search) ?? false) ||
                    e.empCode.toLowerCase().includes(search),
            )
            : allEmployees

        return HttpResponse.json({
            data: filtered,
            pagination: {
                page: 1,
                limit: 20,
                totalRecords: filtered.length,
                totalPages: 1,
            },
        })
    }),
]
