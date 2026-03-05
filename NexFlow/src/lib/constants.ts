export const DEFAULT_PAGE_SIZE = 10
export const DEBOUNCE_DELAY_MS = 300

/**
 * Available project roles for the Assign Employee modal dropdown.
 */
export const PROJECT_ROLES = [
    { label: 'HR', value: 'HR' },
    { label: 'Business Analyst', value: 'Business Analyst' },
    { label: 'Backend Developer', value: 'Backend Developer' },
    { label: 'Frontend Developer', value: 'Frontend Developer' },
    { label: 'DevOps Engineer', value: 'DevOps Engineer' },
] as const

/**
 * Allocation percentage validation rules and messages.
 */
export const ALLOCATION_MIN_PERCENTAGE = 25
export const ALLOCATION_MAX_PERCENTAGE = 100
export const ALLOCATION_STEP_PERCENTAGE = 5

export const ALLOCATION_ERRORS = {
    MIN: `Minimum allocation is ${ALLOCATION_MIN_PERCENTAGE}%`,
    MAX: `Maximum allocation is ${ALLOCATION_MAX_PERCENTAGE}%`,
    STEP: `Allocation must be a multiple of ${ALLOCATION_STEP_PERCENTAGE}%`,
} as const

/**
 * Validates an allocation percentage value.
 * Returns an error message string or null if valid.
 */
export function validateAllocationPercentage(
    value: number,
): string | null {
    if (value < ALLOCATION_MIN_PERCENTAGE) return ALLOCATION_ERRORS.MIN
    if (value > ALLOCATION_MAX_PERCENTAGE) return ALLOCATION_ERRORS.MAX
    if (value % ALLOCATION_STEP_PERCENTAGE !== 0) return ALLOCATION_ERRORS.STEP
    return null
}
