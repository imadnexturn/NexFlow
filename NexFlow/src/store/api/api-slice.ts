import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * Module-level token storage for fetchBaseQuery.
 * Set by App.tsx when auth state changes via react-oidc-context.
 */
let _token: string | null = null

/** Called by App.tsx to sync the OIDC access token. */
export function setToken(token: string | null): void {
    _token = token
}

/** Read by prepareHeaders on every API request. */
export function getToken(): string | null {
    return _token
}

/**
 * Base RTK Query API slice.
 * Endpoints are injected from resource-specific files
 * (employees-api.ts, projects-api.ts, allocations-api.ts).
 */
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: (headers) => {
            const token = getToken()
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    tagTypes: [
        'Employee',
        'MyAllocations',
        'Project',
        'ProjectDetails',
        'Allocation',
    ],
    endpoints: () => ({}),
})
