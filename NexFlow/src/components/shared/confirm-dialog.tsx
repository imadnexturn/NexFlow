import type { ReactNode } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
    trigger: ReactNode
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    destructive?: boolean
}

/**
 * Wrapper around shadcn AlertDialog for destructive action confirmation.
 */
function ConfirmDialog({
    trigger,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    destructive = true,
}: ConfirmDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={
                            destructive
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : undefined
                        }
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ConfirmDialog
