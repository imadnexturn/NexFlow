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
]
