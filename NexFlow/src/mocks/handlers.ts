import { employeeHandlers } from './handlers/employee-handlers'
import { projectHandlers } from './handlers/project-handlers'

export const handlers = [
    ...employeeHandlers,
    ...projectHandlers,
]
