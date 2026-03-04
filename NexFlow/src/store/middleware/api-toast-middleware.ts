import type { Middleware, AnyAction } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const apiToastMiddleware: Middleware = () => (next) => (action) => {
    const anyAction = action as AnyAction;

    // Only show success toasts for mutations, not queries
    if (anyAction.type?.endsWith('/fulfilled')) {
        const isMutation = anyAction.meta?.arg?.type === 'mutation'
        if (isMutation) {
            const message = anyAction.payload?.message || 'Operation successful'
            toast.success(message)
        }
    }

    // Always show error toasts for rejected RTK Query actions (both queries and mutations)
    if (anyAction.type?.endsWith('/rejected')) {
        const message = anyAction.payload?.data?.message || 'An error occurred during the request'
        toast.error(message)
    }

    return next(action)
}
