import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
    label: string
    value: string | number
    delta?: string
    deltaType?: 'positive' | 'negative' | 'neutral'
    icon?: ReactNode
    className?: string
}

/**
 * Summary stat card per DESIGN.md §5.2.
 * Label (uppercase caption), large value, optional delta badge, optional icon.
 */
function StatCard({
    label,
    value,
    delta,
    deltaType = 'neutral',
    icon,
    className,
}: StatCardProps) {
    const deltaColor =
        deltaType === 'positive'
            ? 'text-green-600'
            : deltaType === 'negative'
                ? 'text-orange-500'
                : 'text-slate-500'

    return (
        <Card
            className={cn(
                'border border-slate-200 shadow-none',
                className,
            )}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase text-slate-500">
                            {label}
                        </p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">
                            {value}
                        </p>
                        {delta && (
                            <p className={cn('mt-1 text-xs', deltaColor)}>
                                {delta}
                            </p>
                        )}
                    </div>
                    {icon && (
                        <div className="text-slate-400">{icon}</div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default StatCard
