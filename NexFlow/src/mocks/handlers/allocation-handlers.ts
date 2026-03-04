import { http, HttpResponse } from 'msw'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const allocationHandlers = [
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
    http.delete(`${BASE_URL}/allocations/:id`, ({ params }) => {
        return HttpResponse.json(null, { status: 204 })
    }),
]
