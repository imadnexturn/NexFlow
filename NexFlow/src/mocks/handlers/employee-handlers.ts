import { http, HttpResponse } from 'msw'
import { mockAllocations } from '../fixtures/allocations'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const employeeHandlers = [
    http.get(`${BASE_URL}/employees/me/allocations`, () => {
        return HttpResponse.json(mockAllocations)
    }),

    http.get(`${BASE_URL}/employees/me`, () => {
        return HttpResponse.json({
            empCode: 'EMP001',
            firstName: 'Alex',
            lastName: 'Thompson',
            email: 'alex.thompson@company.com',
            designation: 'Senior Engineer',
            role: 'ProjectManager',
            isActive: true,
        })
    }),
]
