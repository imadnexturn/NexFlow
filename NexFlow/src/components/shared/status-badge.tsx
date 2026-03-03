import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AllocationRecordStatus, ProjectStatus } from '@/types'

type StatusType = AllocationRecordStatus | ProjectStatus | 'Bench'

const statusStyles: Record<StatusType, string> = {
    Active: 'bg-blue-50 text-blue-700 hover:bg-blue-50',
    Upcoming: 'bg-orange-50 text-orange-700 hover:bg-orange-50',
    Ended: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
    Completed: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
    Bench: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50',
}

interface StatusBadgeProps {
    status: StatusType
    className?: string
}

/**
 * Color-coded status badge per DESIGN.md §5.5.
 */
function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <Badge
            variant="secondary"
            className={cn(
                'rounded-full border-0 text-xs font-medium',
                statusStyles[status] ?? 'bg-slate-100 text-slate-600',
                className,
            )}
        >
            {status}
        </Badge>
    )
}

export default StatusBadge
