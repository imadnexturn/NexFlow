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
import { useDeleteAllocationMutation } from '@/store/api/allocations-api'
interface DeleteAllocationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    allocationId: string
    employeeName: string
}
/**
 * Delete Allocation confirmation dialog.
 * Calls DELETE /allocations/{id}.
 */
function DeleteAllocationDialog({
    open,
    onOpenChange,
    allocationId,
    employeeName,
}: DeleteAllocationDialogProps) {
    const [deleteAllocation, { isLoading }] =
        useDeleteAllocationMutation()

    const handleDelete = async () => {
        try {
            await deleteAllocation(allocationId).unwrap()

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
                        Delete Allocation
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the resource allocation
                        for <strong>{employeeName}</strong>? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        Delete Allocation
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteAllocationDialog
