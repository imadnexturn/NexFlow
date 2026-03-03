import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
    icon?: ReactNode
    title?: string
    description?: string
    className?: string
    children?: ReactNode
}

/**
 * Placeholder for no-data states.
 */
function EmptyState({
    icon,
    title = 'No data found',
    description,
    className,
    children,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 text-center',
                className,
            )}
        >
            <div className="mb-3 text-slate-300">
                {icon ?? <Inbox className="h-10 w-10" />}
            </div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {description && (
                <p className="mt-1 text-xs text-slate-400">
                    {description}
                </p>
            )}
            {children && <div className="mt-4">{children}</div>}
        </div>
    )
}

export default EmptyState
