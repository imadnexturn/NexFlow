import { http, HttpResponse } from 'msw'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const allocationHandlers = [
    http.get(`${BASE_URL}/allocations`, ({ request }) => {
        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') || '1', 10)
        const limit = parseInt(url.searchParams.get('limit') || '10', 10)
        // Simple mock returning page 1 data based on user example

        return HttpResponse.json({
            data: [
                {
                    allocationId: 'c4f575d3-4a0d-4a42-b386-2474e0b58f6b',
                    employeeId: 'd4bba5b2-db56-4cdf-8a08-76128ba326ef',
                    empCode: 'EMP-003',
                    employeeName: 'Bob Reynolds',
                    projectId: '98017a81-d02f-4e63-ba5e-fe270f28bfa6',
                    projectCode: 'PRJ-MVP',
                    projectName: 'MVP Development',
                    percentage: 100,
                    fromDate: '2025-04-01',
                    toDate: '2025-10-31',
                    createdAt: '2026-03-04T12:37:14.236791Z',
                    projectRole: 'Backend Developer',
                    billable: true,
                    projectBillable: true,
                    accountCode: 'ACC-STAR',
                    accountName: 'Startup Alpha',
                    status: 'Ended',
                    updatedAt: '2026-03-04T12:37:14.236791Z',
                },
                // Add an Active one for testing stat cards
                {
                    allocationId: 'c4f575d3-4a0d-4a42-b386-2474e0b58f6c',
                    employeeId: 'd4bba5b2-db56-4cdf-8a08-76128ba326ef',
                    empCode: 'EMP-003',
                    employeeName: 'Bob Reynolds',
                    projectId: '98017a81-d02f-4e63-ba5e-fe270f28bfb7',
                    projectCode: 'PRJ-ACTIVE',
                    projectName: 'Active Project',
                    percentage: 50,
                    fromDate: '2025-04-01',
                    toDate: '2026-12-31',
                    createdAt: '2026-03-04T12:37:14.236791Z',
                    projectRole: 'Frontend Developer',
                    billable: true,
                    projectBillable: true,
                    accountCode: 'ACC-STAR',
                    accountName: 'Startup Alpha',
                    status: 'Active',
                    updatedAt: '2026-03-04T12:37:14.236791Z',
                }
            ],
            pagination: {
                page,
                limit,
                totalRecords: 2,
                totalPages: 1,
            },
        })
    }),
    http.get(`${BASE_URL}/allocations/capacity-check`, ({ request }) => {
        const url = new URL(request.url)
        const empCode = url.searchParams.get('empCode') ?? ''

        // Mock: return varying capacity based on employee
        const capacityMap: Record<string, number> = {
            EMP010: 0,
            EMP011: 50,
            EMP012: 100,
            EMP013: 0,
        }

        const available = capacityMap[empCode] ?? 100

        return HttpResponse.json({
            empCode,
            windowFrom: url.searchParams.get('fromDate') ?? '',
            windowTo: url.searchParams.get('toDate') ?? null,
            currentTotalPercentage: 100 - available,
            availablePercentage: available,
            allocationStatus:
                available === 0
                    ? 'Full'
                    : available === 100
                        ? 'Bench'
                        : 'Partial',
        })
    }),
    http.post(`${BASE_URL}/allocations`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
            {
                allocationId: `alloc-new-${Date.now()}`,
                employeeId: 'emp-uuid-new',
                empCode: body.empCode,
                employeeName: 'New Employee',
                projectRole: null,
                projectId: 'proj-uuid-new',
                projectCode: body.projectCode,
                projectName: 'Project',
                billable: false,
                accountCode: 'ACC-NEW',
                accountName: 'Account',
                percentage: body.percentage,
                fromDate: body.fromDate,
                toDate: body.toDate ?? null,
                status: 'Upcoming',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            { status: 201 },
        )
    }),
    http.put(`${BASE_URL}/allocations/:id`, async ({ request, params }) => {
        const body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
            allocationId: params.id,
            employeeId: 'emp-uuid-updated',
            empCode: 'EMP010',
            employeeName: 'Sarah Chen',
            projectRole: body.projectRole ?? null,
            projectId: 'proj-uuid-001',
            projectCode: 'PRJ-2024-001',
            projectName: 'Cloud Migration 2.0',
            billable: true,
            accountCode: 'ACC-GTS',
            accountName: 'Global Tech Solutions',
            percentage: body.percentage,
            fromDate: body.fromDate,
            toDate: body.toDate ?? null,
            status: 'Active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
        })
    }),
    http.patch(`${BASE_URL}/allocations/:id`, ({ params }) => {
        return HttpResponse.json({
            allocationId: params.id,
            employeeId: 'emp-uuid-stopped',
            empCode: 'EMP010',
            employeeName: 'Sarah Chen',
            projectRole: null,
            projectId: 'proj-uuid-001',
            projectCode: 'PRJ-2024-001',
            projectName: 'Cloud Migration 2.0',
            billable: true,
            accountCode: 'ACC-GTS',
            accountName: 'Global Tech Solutions',
            percentage: 100,
            fromDate: '2024-01-12',
            toDate: new Date().toISOString().split('T')[0],
            status: 'Ended',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
        })
    }),
    http.delete(`${BASE_URL}/allocations/:id`, () => {
        return HttpResponse.json(null, { status: 204 })
    }),
]
