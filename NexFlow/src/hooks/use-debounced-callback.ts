import { useRef, useEffect, useCallback } from 'react'

/**
 * Returns a debounced version of the given callback.
 * The callback is delayed by `delay` ms; rapid successive
 * calls reset the timer. The timer is auto-cleaned on unmount.
 *
 * Also exposes a `cancel()` method on the returned function
 * so callers can cancel any pending invocation (e.g. on modal close).
 *
 * @example
 * const debouncedSearch = useDebouncedCallback(
 *     (term: string) => void searchApi({ search: term }),
 *     500,
 * )
 * debouncedSearch('query')   // fires after 500ms
 * debouncedSearch.cancel()   // cancels pending call
 */
function useDebouncedCallback<T extends (...args: never[]) => void>(
    callback: T,
    delay: number,
): T & { cancel: () => void } {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const callbackRef = useRef(callback)

    // Keep callback ref up-to-date without re-creating the debounced fn
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    const cancel = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const debouncedFn = useCallback(
        ((...args: Parameters<T>) => {
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
                callbackRef.current(...args)
            }, delay)
        }) as T,
        [delay],
    )

    // Attach cancel method to the function
    const result = debouncedFn as T & { cancel: () => void }
    result.cancel = cancel

    return result
}

export default useDebouncedCallback
