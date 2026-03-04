import { useState, useCallback, useEffect } from 'react'
import { CalendarIcon, ChevronsUpDown, Check, Search } from 'lucide-react'
import { format } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useLazySearchEmployeesQuery } from '@/store/api/employees-api'
import { useLazyCheckCapacityQuery } from '@/store/api/allocations-api'
import { useCreateAllocationMutation } from '@/store/api/allocations-api'
import type { EmployeeSummary } from '@/types'

interface AssignEmployeeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectCode: string
    projectName: string
}

/**
 * Assign Employee Modal — 3-step flow:
 * 1. Search & select employee
 * 2. Check capacity
 * 3. Create allocation
 */
function AssignEmployeeModal({
    open,
    onOpenChange,
    projectCode,
    projectName,
}: AssignEmployeeModalProps) {
    // Form state
    const [selectedEmployee, setSelectedEmployee] =
        useState<EmployeeSummary | null>(null)
    const [comboboxOpen, setComboboxOpen] = useState(false)
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
    const [toDate, setToDate] = useState<Date | undefined>(undefined)
    const [percentage, setPercentage] = useState('')
    const [projectRole, setProjectRole] = useState('')
    const [billable, setBillable] = useState(false)

    // API hooks
    const [searchEmployees, { data: employeesData }] =
        useLazySearchEmployeesQuery()
    const [checkCapacity, { data: capacityData }] =
        useLazyCheckCapacityQuery()
    const [createAllocation, { isLoading: isCreating }] =
        useCreateAllocationMutation()

    // Search employees on input change
    const handleEmployeeSearch = useCallback(
        (search: string) => {
            if (search.length >= 1) {
                void searchEmployees({
                    search,
                    isActive: true,
                    limit: 20,
                })
            }
        },
        [searchEmployees],
    )

    // Check capacity when employee + dates change
    useEffect(() => {
        if (selectedEmployee && fromDate) {
            void checkCapacity({
                empCode: selectedEmployee.empCode,
                fromDate: format(fromDate, 'yyyy-MM-dd'),
                toDate: toDate
                    ? format(toDate, 'yyyy-MM-dd')
                    : undefined,
            })
        }
    }, [selectedEmployee, fromDate, toDate, checkCapacity])

    const availablePercentage = capacityData?.availablePercentage ?? 100
    const enteredPercentage = Number(percentage) || 0
    const overAllocated = enteredPercentage > availablePercentage

    // Reset form on close
    useEffect(() => {
        if (!open) {
            setSelectedEmployee(null)
            setFromDate(undefined)
            setToDate(undefined)
            setPercentage('')
            setProjectRole('')
            setBillable(false)
        }
    }, [open])

    const handleSave = async () => {
        if (!selectedEmployee || !fromDate || !percentage) return

        try {
            await createAllocation({
                empCode: selectedEmployee.empCode,
                projectCode,
                fromDate: format(fromDate, 'yyyy-MM-dd'),
                toDate: toDate
                    ? format(toDate, 'yyyy-MM-dd')
                    : undefined,
                percentage: Number(percentage),
                projectRole: projectRole || null,
            }).unwrap()

            onOpenChange(false)
        } catch {
            // Error handled by RTK Query
        }
    }

    const employees = employeesData?.data ?? []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Assign Employee
                    </DialogTitle>
                    <DialogDescription>
                        Add a new resource to {projectName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Employee Name Combobox */}
                    <div className="space-y-2">
                        <label
                            className="text-sm font-semibold text-slate-700 uppercase tracking-wider"
                            id="employee-label"
                        >
                            Employee Name
                        </label>
                        <Popover
                            open={comboboxOpen}
                            onOpenChange={setComboboxOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={comboboxOpen}
                                    aria-label="Employee Name"
                                    className="w-full justify-between font-normal"
                                >
                                    {selectedEmployee ? (
                                        <span className="flex items-center gap-2">
                                            <Search className="w-4 h-4 text-slate-400" />
                                            {selectedEmployee.fullName}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 text-slate-400">
                                            <Search className="w-4 h-4" />
                                            Select an employee...
                                        </span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[432px] p-0"
                                align="start"
                            >
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Search employees..."
                                        onValueChange={handleEmployeeSearch}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            No employee found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {employees.map((emp) => (
                                                <CommandItem
                                                    key={emp.empCode}
                                                    value={emp.empCode}
                                                    onSelect={() => {
                                                        setSelectedEmployee(emp)
                                                        setComboboxOpen(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mr-2 h-4 w-4',
                                                            selectedEmployee?.empCode ===
                                                                emp.empCode
                                                                ? 'opacity-100'
                                                                : 'opacity-0',
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">
                                                            {emp.fullName}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {emp.empCode} •{' '}
                                                            {emp.designation}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Date pickers */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                From Date
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !fromDate && 'text-muted-foreground',
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {fromDate
                                            ? format(fromDate, 'MM/dd/yyyy')
                                            : 'mm/dd/yyyy'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={fromDate}
                                        onSelect={setFromDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                To Date
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !toDate && 'text-muted-foreground',
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {toDate
                                            ? format(toDate, 'MM/dd/yyyy')
                                            : 'mm/dd/yyyy'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={toDate}
                                        onSelect={setToDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <label
                            htmlFor="project-role"
                            className="text-sm font-semibold text-slate-700 uppercase tracking-wider"
                        >
                            Role
                        </label>
                        <Input
                            id="project-role"
                            type="text"
                            placeholder="e.g. Backend Lead, QA Specialist"
                            value={projectRole}
                            onChange={(e) =>
                                setProjectRole(e.target.value)
                            }
                        />
                    </div>

                    {/* Allocation Percentage */}
                    <div className="space-y-2">
                        <label
                            htmlFor="allocation-percentage"
                            className="text-sm font-semibold text-slate-700 uppercase tracking-wider"
                        >
                            Allocation Percentage (%)
                        </label>
                        <Input
                            id="allocation-percentage"
                            type="number"
                            min={1}
                            max={100}
                            placeholder="e.g. 100"
                            value={percentage}
                            onChange={(e) =>
                                setPercentage(e.target.value)
                            }
                            className="pl-8"
                        />
                        {selectedEmployee && fromDate && (
                            <p
                                className={cn(
                                    'text-xs font-medium',
                                    overAllocated
                                        ? 'text-amber-600'
                                        : 'text-slate-400',
                                )}
                            >
                                {overAllocated
                                    ? `⚠ Warning: exceeds available capacity (${availablePercentage}% remaining)`
                                    : `Maximum recommended remaining: ${availablePercentage}%`}
                            </p>
                        )}
                    </div>

                    {/* Billable Status */}
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-700">
                                Billable Status
                            </p>
                            <p className="text-xs text-slate-400">
                                Is this allocation billable to the client?
                            </p>
                        </div>
                        <Switch
                            checked={billable}
                            onCheckedChange={setBillable}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleSave}
                        disabled={
                            !selectedEmployee ||
                            !fromDate ||
                            !percentage ||
                            isCreating
                        }
                    >
                        Save Assignment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AssignEmployeeModal
