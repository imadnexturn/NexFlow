import { useState, useEffect } from 'react'
import { DEBOUNCE_DELAY_MS } from '@/lib/constants'

/**
 * Debounce hook for search inputs.
 * Returns the debounced value after the specified delay.
 */
function useDebounce<T>(value: T, delay: number = DEBOUNCE_DELAY_MS): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
}

export default useDebounce
