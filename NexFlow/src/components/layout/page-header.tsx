import type { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    actions?: ReactNode
}

/**
 * Reusable page header with title and optional action buttons.
 * Layout: title left-aligned, actions right-aligned.
 */
function PageHeader({ title, actions }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
                {title}
            </h1>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    )
}

export default PageHeader
