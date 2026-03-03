import { cn } from '@/lib/utils'

interface EmployeeAvatarProps {
    firstName: string
    lastName: string
    email?: string
    className?: string
}

/**
 * Initials avatar per DESIGN.md §5.11.
 * Shows first+last name initials in an indigo circle,
 * with optional name and email below/beside.
 */
function EmployeeAvatar({
    firstName,
    lastName,
    email,
    className,
}: EmployeeAvatarProps) {
    const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
    const fullName = `${firstName} ${lastName}`

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">
                {initials}
            </div>
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                    {fullName}
                </p>
                {email && (
                    <p className="truncate text-xs text-slate-400">
                        {email}
                    </p>
                )}
            </div>
        </div>
    )
}

export default EmployeeAvatar
