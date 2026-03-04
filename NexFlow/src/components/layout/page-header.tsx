import type { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    subtitle?: string
    actions?: ReactNode
}

/**
 * Reusable page header with title, optional subtitle,
 * and optional action buttons.
 * Layout: title left-aligned, actions right-aligned.
 */
function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-sm font-medium text-slate-500 mt-0.5">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    )
}

export default PageHeader
