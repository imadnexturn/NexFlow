import { useState, useEffect } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, parseISO } from 'date-fns'
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useUpdateAllocationMutation } from '@/store/api/allocations-api'
import type { Allocation } from '@/types'

interface EditAllocationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    allocation: Allocation
}

/**
 * Edit Allocation Modal — prefilled with existing allocation data.
 * Calls PUT /allocations/{id} on save.
 */
function EditAllocationModal({
    open,
    onOpenChange,
    allocation,
}: EditAllocationModalProps) {
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
    const [toDate, setToDate] = useState<Date | undefined>(undefined)
    const [percentage, setPercentage] = useState('')

    const [updateAllocation, { isLoading }] =
        useUpdateAllocationMutation()

    // Prefill from allocation data
    useEffect(() => {
        if (open && allocation) {
            setFromDate(parseISO(allocation.fromDate))
            setToDate(
                allocation.toDate
                    ? parseISO(allocation.toDate)
                    : undefined,
            )
            setPercentage(String(allocation.percentage))
        }
    }, [open, allocation])

    const handleSave = async () => {
        if (!fromDate || !percentage) return

        try {
            await updateAllocation({
                id: allocation.allocationId,
                body: {
                    fromDate: format(fromDate, 'yyyy-MM-dd'),
                    toDate: toDate
                        ? format(toDate, 'yyyy-MM-dd')
                        : undefined,
                    percentage: Number(percentage),
                    projectRole: allocation.projectRole,
                },
            }).unwrap()

            onOpenChange(false)
        } catch {
            // Error handled by RTK Query
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Edit Allocation
                    </DialogTitle>
                    <DialogDescription>
                        Update allocation for{' '}
                        {allocation.employeeName ?? 'employee'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
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
                                            !fromDate &&
                                            'text-muted-foreground',
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {fromDate
                                            ? format(
                                                fromDate,
                                                'MM/dd/yyyy',
                                            )
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
                                            !toDate &&
                                            'text-muted-foreground',
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {toDate
                                            ? format(
                                                toDate,
                                                'MM/dd/yyyy',
                                            )
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

                    {/* Allocation Percentage */}
                    <div className="space-y-2">
                        <label
                            htmlFor="edit-allocation-percentage"
                            className="text-sm font-semibold text-slate-700 uppercase tracking-wider"
                        >
                            Allocation Percentage (%)
                        </label>
                        <Input
                            id="edit-allocation-percentage"
                            type="number"
                            min={1}
                            max={100}
                            placeholder="e.g. 100"
                            value={percentage}
                            onChange={(e) =>
                                setPercentage(e.target.value)
                            }
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
                        disabled={!fromDate || !percentage || isLoading}
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default EditAllocationModal
