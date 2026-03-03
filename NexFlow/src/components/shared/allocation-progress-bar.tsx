import { cn } from '@/lib/utils'

interface AllocationProgressBarProps {
    percentage: number
    className?: string
}

/**
 * Allocation progress bar per DESIGN.md §5.4.
 * Color ranges: 0–50% → blue-500, 51–80% → indigo-500, 81–100% → blue-600.
 */
function AllocationProgressBar({
    percentage,
    className,
}: AllocationProgressBarProps) {
    const clampedPercentage = Math.min(100, Math.max(0, percentage))

    const barColor =
        clampedPercentage <= 50
            ? 'bg-blue-500'
            : clampedPercentage <= 80
                ? 'bg-indigo-500'
                : 'bg-blue-600'

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                    className={cn('h-full rounded-full', barColor)}
                    style={{ width: `${clampedPercentage}%` }}
                />
            </div>
            <span className="text-xs text-slate-600 whitespace-nowrap">
                {clampedPercentage}%
            </span>
        </div>
    )
}

export default AllocationProgressBar
