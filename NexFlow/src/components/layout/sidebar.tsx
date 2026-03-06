import { NavLink } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import {
    LayoutDashboard,
    Briefcase,
    Layers,
    Users,
    Bell,
    Settings,
    LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
    label: string
    icon: React.ReactNode
    to: string
    disabled?: boolean
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
        to: '/dashboard',
    },
    {
        label: 'Managed Projects',
        icon: <Briefcase className="w-4 h-4" />,
        to: '/managed-projects',
    },
    {
        label: 'Allocations',
        icon: <Layers className="w-4 h-4" />,
        to: '/allocations',
        disabled: true,
    },
    {
        label: 'Resources',
        icon: <Users className="w-4 h-4" />,
        to: '/resources',
        disabled: true,
    },
]

function Sidebar() {
    const auth = useAuth()
    const userProfile = auth.user?.profile
    const displayName = userProfile
        ? `${userProfile.given_name ?? ''} ${userProfile.family_name ?? ''}`.trim() ||
        userProfile.preferred_username ||
        'User'
        : 'User'

    const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-slate-900">
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 py-5">
                <svg className="h-8 w-8 shrink-0" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        {/* Shine gradient */}
                        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="white" stopOpacity="0" />
                            <stop offset="50%" stopColor="white" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                        {/* Clip everything to the rounded square */}
                        <clipPath id="clipLogo">
                            <rect width="44" height="44" rx="10" />
                        </clipPath>
                    </defs>
                    {/* Logo Background */}
                    <rect width="44" height="44" rx="10" fill="#5048e5" />
                    {/* Logo Letter */}
                    <path d="M11 32 L11 12 L19 12 L27 25 L27 12 L33 12 L33 32 L25 32 L17 19 L17 32 Z" fill="white" />
                    {/* Shine */}
                    <g clipPath="url(#clipLogo)">
                        <rect className="shine" x="-60" y="0" width="40" height="80" fill="url(#shine)" transform="rotate(25)" />
                    </g>
                </svg>
                <div>
                    <div className="text-sm font-semibold text-white">
                        NexFlow
                    </div>
                    <div className="text-[10px] text-slate-400">
                        Enterprise Resource Planning
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-2">
                {navItems.map((item) =>
                    item.disabled ? (
                        <span
                            key={item.label}
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
                        >
                            {item.icon}
                            {item.label}
                        </span>
                    ) : (
                        <NavLink
                            key={item.label}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                                    isActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                                )
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ),
                )}
            </nav>

            {/* Bottom section */}
            <div className="space-y-1 px-2 py-2 border-t border-slate-800">
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150">
                    <Bell className="w-4 h-4" />
                    Notifications
                </button>
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150">
                    <Settings className="w-4 h-4" />
                    Settings
                </button>
            </div>

            {/* User profile */}
            <div className="border-t border-slate-800 px-3 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                            {displayName}
                        </p>
                    </div>
                    <button
                        onClick={() => void auth.signoutRedirect()}
                        className="text-slate-400 hover:text-white transition-colors duration-150"
                        title="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
