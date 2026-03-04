import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useStopAllocationMutation } from '@/store/api/allocations-api'

interface StopAllocationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    allocationId: string
    employeeName: string
}

/**
 * Stop Allocation confirmation dialog.
 * Calls PATCH /allocations/{id} with { action: "stop" }.
 */
function StopAllocationDialog({
    open,
    onOpenChange,
    allocationId,
    employeeName,
}: StopAllocationDialogProps) {
    const [stopAllocation, { isLoading }] =
        useStopAllocationMutation()

    const handleStop = async () => {
        try {
            await stopAllocation({
                id: allocationId,
                body: { action: 'stop' },
            }).unwrap()

            onOpenChange(false)
        } catch {
            // Error handled by RTK Query
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-bold">
                        Stop Allocation
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to stop the allocation
                        for <strong>{employeeName}</strong>? This will
                        set the end date to today and cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleStop}
                        disabled={isLoading}
                    >
                        Stop Allocation
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default StopAllocationDialog
