import { vi, describe, it, expect, beforeEach } from 'vitest'
import { toast } from 'sonner'
import { apiToastMiddleware } from './api-toast-middleware'
import { isRejectedWithValue, isFulfilled } from '@reduxjs/toolkit'
import type { MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit'

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

describe('apiToastMiddleware', () => {
    let store: MiddlewareAPI
    let next: Dispatch
    let invoke: (action: AnyAction) => void

    beforeEach(() => {
        vi.clearAllMocks()
        store = {
            getState: vi.fn(() => ({})),
            dispatch: vi.fn(),
        }
        next = vi.fn()
        invoke = (action: AnyAction) => apiToastMiddleware(store)(next)(action)
    })

    it('passes actions to the next middleware', () => {
        const action = { type: 'TEST_ACTION' }
        invoke(action)
        expect(next).toHaveBeenCalledWith(action)
    })

    describe('when a mutation is fulfilled', () => {
        it('shows a success toast if the action is a fulfilled mutation', () => {
            const action = {
                type: 'api/executeMutation/fulfilled',
                meta: {
                    arg: {
                        type: 'mutation',
                        endpointName: 'createProject', // Arbitrary endpoint
                    },
                },
                payload: {
                    message: 'Project created successfully', // Mock payload structure
                },
            }

            // Simulate what RTK Query's isFulfilled would match
            // We use standard action simulation. The middleware itself will need to check isFulfilled(action) and if it's a mutation
            invoke(action)

            // The middleware should extract either the message from payload or provide a generic one
            expect(toast.success).toHaveBeenCalledWith('Project created successfully')
            expect(toast.success).toHaveBeenCalledTimes(1)
        })

        it('does not show a success toast for queries (only mutations)', () => {
            const action = {
                type: 'api/executeQuery/fulfilled',
                meta: {
                    arg: {
                        type: 'query',
                        endpointName: 'getProjects',
                    },
                },
                payload: {},
            }

            invoke(action)

            expect(toast.success).not.toHaveBeenCalled()
        })
    })

    describe('when a request is rejected with value', () => {
        it('shows an error toast with the error message', () => {
            const action = {
                type: 'api/executeMutation/rejected',
                meta: {
                    arg: {
                        type: 'mutation',
                    },
                },
                payload: {
                    data: {
                        message: 'Custom error from backend',
                    },
                },
            }

            invoke(action)

            expect(toast.error).toHaveBeenCalledWith('Custom error from backend')
            expect(toast.error).toHaveBeenCalledTimes(1)
        })

        it('shows an error toast with a fallback message if payload is generic', () => {
            const action = {
                type: 'api/executeMutation/rejected',
                meta: {
                    arg: {
                        type: 'mutation',
                    },
                },
                // no specific data.message
                payload: {
                    status: 500
                },
                error: {
                    message: 'Internal Server Error'
                }
            }

            invoke(action)

            expect(toast.error).toHaveBeenCalledWith('An error occurred during the request')
        })
    })

    describe('when a query fails', () => {
        it('shows an error toast even for queries', () => {
            const action = {
                type: 'api/executeQuery/rejected',
                meta: {
                    arg: {
                        type: 'query',
                    },
                },
                payload: {
                    data: {
                        message: 'Failed to fetch projects',
                    }
                },
            }

            invoke(action)

            expect(toast.error).toHaveBeenCalledWith('Failed to fetch projects')
        })
    })
})
