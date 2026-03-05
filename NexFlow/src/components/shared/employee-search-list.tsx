import { Check, Loader2 } from 'lucide-react'
import {
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import type { EmployeeSummary } from '@/types'

interface EmployeeSearchListProps {
    employees: EmployeeSummary[]
    isSearching: boolean
    selectedEmpCode?: string
    onSelect: (employee: EmployeeSummary) => void
}

/**
 * Renders the employee search results inside a Command list.
 * Shows a spinner while loading, empty state when no results,
 * and the employee list with selection checkmarks.
 */
function EmployeeSearchList({
    employees,
    isSearching,
    selectedEmpCode,
    onSelect,
}: EmployeeSearchListProps) {
    if (isSearching) {
        return (
            <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <>
            <CommandEmpty>No employee found.</CommandEmpty>
            <CommandGroup>
                {employees.map((emp) => (
                    <CommandItem
                        key={emp.empCode}
                        value={emp.empCode}
                        onSelect={() => onSelect(emp)}
                    >
                        <Check
                            className={cn(
                                'mr-2 h-4 w-4',
                                selectedEmpCode === emp.empCode
                                    ? 'opacity-100'
                                    : 'opacity-0',
                            )}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">
                                {emp.fullName}
                            </span>
                            <span className="text-xs text-slate-400">
                                {emp.empCode} • {emp.designation}
                            </span>
                        </div>
                    </CommandItem>
                ))}
            </CommandGroup>
        </>
    )
}

export default EmployeeSearchList
