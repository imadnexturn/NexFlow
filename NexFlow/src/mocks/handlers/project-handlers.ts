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
]
