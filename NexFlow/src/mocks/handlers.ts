import { allocationHandlers } from './handlers/allocation-handlers'
import { employeeHandlers } from './handlers/employee-handlers'
import { projectHandlers } from './handlers/project-handlers'

export const handlers = [
    ...allocationHandlers,
    ...employeeHandlers,
    ...projectHandlers,
]
