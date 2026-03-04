import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { User } from 'oidc-client-ts'

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
            // Read directly from the underlying oidc-client-ts storage
            // This ensures tokens are immediately available and not subject to
            // React render cycles or useEffect timing delays.
            const authority = import.meta.env.VITE_OIDC_AUTHORITY
            const clientId = import.meta.env.VITE_OIDC_CLIENT_ID
            const storageKey = `oidc.user:${authority}:${clientId}`

            const oidcStorage = sessionStorage.getItem(storageKey)

            if (oidcStorage) {
                try {
                    const user = User.fromStorageString(oidcStorage)
                    if (user && user.access_token) {
                        headers.set('Authorization', `Bearer ${user.access_token}`)
                    }
                } catch (e) {
                    console.error('Failed to parse OIDC user from storage', e)
                }
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
