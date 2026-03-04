import { http, HttpResponse } from 'msw'
import { mockProjects } from '../fixtures/projects'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const projectHandlers = [
    http.get(`${BASE_URL}/projects`, ({ request }) => {
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') ?? '1')
        const limit = Number(url.searchParams.get('limit') ?? '10')

        const start = (page - 1) * limit
        const paginated = mockProjects.slice(start, start + limit)

        return HttpResponse.json({
            data: paginated,
            pagination: {
                page,
                limit,
                totalRecords: mockProjects.length,
                totalPages: Math.ceil(mockProjects.length / limit),
            },
        })
    }),
    http.get(`${BASE_URL}/projects/:projectCode`, ({ params }) => {
        const { projectCode } = params
        const project = mockProjects.find(
            (p) => p.projectCode === projectCode,
        )

        if (!project) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json({
            ...project,
            allocations: [
                {
                    allocationId: 'alloc-proj-1',
                    employeeId: 'emp-uuid-010',
                    empCode: 'EMP010',
                    employeeName: 'Sarah Chen',
                    projectRole: 'Sr. Project Manager',
                    projectId: project.projectId,
                    projectCode: project.projectCode,
                    projectName: project.projectName,
                    billable: true,
                    accountCode: project.accountCode,
                    accountName: project.accountName,
                    percentage: 100,
                    fromDate: '2024-01-12',
                    toDate: '2024-12-30',
                    status: 'Active',
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                },
                {
                    allocationId: 'alloc-proj-2',
                    employeeId: 'emp-uuid-011',
                    empCode: 'EMP011',
                    employeeName: 'Marcus Aurelius',
                    projectRole: 'Backend Lead',
                    projectId: project.projectId,
                    projectCode: project.projectCode,
                    projectName: project.projectName,
                    billable: true,
                    accountCode: project.accountCode,
                    accountName: project.accountName,
                    percentage: 50,
                    fromDate: '2024-02-01',
                    toDate: '2024-11-15',
                    status: 'Upcoming',
                    createdAt: '2024-01-15T00:00:00Z',
                    updatedAt: '2024-01-15T00:00:00Z',
                },
                {
                    allocationId: 'alloc-proj-3',
                    employeeId: 'emp-uuid-012',
                    empCode: 'EMP012',
                    employeeName: 'Elena Rodriguez',
                    projectRole: 'UI/UX Designer',
                    projectId: project.projectId,
                    projectCode: project.projectCode,
                    projectName: project.projectName,
                    billable: false,
                    accountCode: project.accountCode,
                    accountName: project.accountName,
                    percentage: 75,
                    fromDate: '2024-01-01',
                    toDate: '2024-03-15',
                    status: 'Ended',
                    createdAt: '2023-12-15T00:00:00Z',
                    updatedAt: '2023-12-15T00:00:00Z',
                },
                {
                    allocationId: 'alloc-proj-4',
                    employeeId: 'emp-uuid-013',
                    empCode: 'EMP013',
                    employeeName: 'David Kim',
                    projectRole: 'QA Specialist',
                    projectId: project.projectId,
                    projectCode: project.projectCode,
                    projectName: project.projectName,
                    billable: true,
                    accountCode: project.accountCode,
                    accountName: project.accountName,
                    percentage: 100,
                    fromDate: '2024-03-20',
                    toDate: '2024-12-20',
                    status: 'Active',
                    createdAt: '2024-03-10T00:00:00Z',
                    updatedAt: '2024-03-10T00:00:00Z',
                },
            ],
            teamMembers: [],
            createdAt: '2023-12-01T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z',
        })
    }),
]
