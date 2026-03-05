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
