import { useState } from 'react'
import { Download, Filter, Check, X } from 'lucide-react'
import { useGetAllocationsQuery } from '@/store/api/allocations-api'
import { useAuth } from 'react-oidc-context'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setStatusFilter } from '@/store/slices/dashboard-filters-slice'
import PageHeader from '@/components/layout/page-header'
import StatCard from '@/components/shared/stat-card'
import DataTable from '@/components/shared/data-table'
import type { ColumnDef } from '@/components/shared/data-table'
import AllocationProgressBar from '@/components/shared/allocation-progress-bar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useExportEmployeesMutation } from '@/store/api/employees-api'
import { toast } from 'sonner'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type { Allocation } from '@/types'

type DashboardStatusFilter = 'All' | 'Active' | 'Upcoming' | 'Ended'

const STATUS_OPTIONS: DashboardStatusFilter[] = [
    'All',
    'Active',
    'Upcoming',
    'Ended',
]

/**
 * Format ISO date string to readable format.
 */
function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    })
}

const columns: ColumnDef<Allocation>[] = [
    {
        accessorKey: 'accountName',
        header: 'Account Name',
        cell: (row) => (
            <span className="text-sm font-semibold text-slate-900">
                {row.accountName}
            </span>
        ),
    },
    {
        accessorKey: 'projectName',
        header: 'Project Name',
        cell: (row) => (
            <span className="text-sm font-medium text-slate-600">
                {row.projectName}
            </span>
        ),
    },
    {
        accessorKey: 'projectRole',
        header: 'Role',
        cell: (row) => (
            <span className="text-sm text-slate-600">
                {row.projectRole ?? '—'}
            </span>
        ),
    },
    {
        accessorKey: 'percentage',
        header: 'Allocation %',
        cell: (row) => (
            <AllocationProgressBar percentage={row.percentage} />
        ),
    },
    {
        accessorKey: 'billable',
        header: 'Billable',
        cell: (row) => (
            row.billable
                ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"><Check className="w-3 h-3" /> Yes</span>
                : <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700"><X className="w-3 h-3" /> No</span>
        ),
    },
    {
        accessorKey: 'fromDate',
        header: 'From Date',
        cell: (row) => (
            <span className="text-sm text-slate-600">
                {formatDate(row.fromDate)}
            </span>
        ),
    },
    {
        accessorKey: 'toDate',
        header: 'To Date',
        cell: (row) => (
            <span className="text-sm text-slate-600">
                {row.toDate ? formatDate(row.toDate) : '—'}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: (row) => {
            const colorMap: Record<string, string> = {
                Active: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                Upcoming: 'bg-amber-50 text-amber-700 border-amber-200',
                Ended: 'bg-slate-100 text-slate-500 border-slate-200',
            }
            const colors = colorMap[row.status] ?? 'bg-slate-100 text-slate-600'
            return (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors}`}>
                    {row.status}
                </span>
            )
        },
    },
]

/**
 * Cycle to next status filter value.
 */
function getNextFilter(current: DashboardStatusFilter): DashboardStatusFilter {
    const idx = STATUS_OPTIONS.indexOf(current)
    return STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length]
}

/**
 * Dashboard Page — Allocation Dashboard.
 * Shows stat cards, filterable allocations table with pagination.
 */
function DashboardPage() {
    const dispatch = useAppDispatch()
    const auth = useAuth()
    const { statusFilter } = useAppSelector(
        (state) => state.dashboardFilters,
    )

    const [page, setPage] = useState(1)
    const [sortConfig, setSortConfig] = useState<{ key: keyof Allocation & string; direction: 'asc' | 'desc' }>({
        key: 'status',
        direction: 'asc',
    })

    const [exportEmployees, { isLoading: isExporting }] = useExportEmployeesMutation()

    const handleExport = async (ext: 'pdf' | 'xls') => {
        try {
            const blob = await exportEmployees({ ext }).unwrap()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `employees-export-${new Date().toISOString().split('T')[0]}.${ext}`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
        } catch {
            toast.error('Failed to export report')
        }
    }

    const handleSort = (key: keyof Allocation & string) => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }))
        setPage(1)
    }

    // Current user's identity from Keycloak token
    const empCode = auth.user?.profile?.empCode as string | undefined

    // RTK Query hooks
    const {
        data: response,
        isLoading,
    } = useGetAllocationsQuery(
        {
            empCode, // Required to fetch exclusively MY allocations
            page,
            limit: DEFAULT_PAGE_SIZE,
            sort: sortConfig.direction === 'desc' ? `-${sortConfig.key}` : sortConfig.key,
            // Only send status parameter if not "All"
            status: statusFilter === 'All' ? undefined : statusFilter,
        },
        // In tests we may not have a fully populated auth profile, so we allow it to fetch.
        { skip: false },
    )

    const allocations = response?.data ?? []

    // Pagination state
    const totalCount = response?.pagination?.totalRecords ?? 0
    const totalPages = response?.pagination?.totalPages ?? 1

    // Stat calculations (Note: only computed against the CURRENT page's data array)
    // Server-side aggregates would be needed for true global stats.
    const activeAllocations = allocations.filter(
        (a) => a.status === 'Active',
    )
    const activeCount = activeAllocations.length
    const totalPercentage = activeAllocations.reduce(
        (sum, a) => sum + a.percentage,
        0,
    )
    const billablePercentage = activeAllocations
        .filter((a) => a.billable)
        .reduce((sum, a) => sum + a.percentage, 0)
    const upcomingEndCount = allocations.filter((a) => {
        if (!a.toDate) return false
        const endDate = new Date(a.toDate)
        const now = new Date()
        const thirtyDaysLater = new Date(now)
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
        return endDate >= now && endDate <= thirtyDaysLater
    }).length

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-80" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <Skeleton className="h-64" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Allocation Dashboard"
                actions={
                    <>
                        {/* SearchInput hidden due to backend search limitations on /allocations payload */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {isExporting ? 'Exporting...' : 'Export Report'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                    Export as PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('xls')}>
                                    Export as Excel (XLS)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                }
            />

            {/* Stat Cards (Page-level stats) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Active Allocations"
                    value={activeCount}
                
                />
                <StatCard
                    label="Current Allocation %"
                    value={`${totalPercentage}%`}
                />
                <StatCard
                    label="Billable %"
                    value={`${billablePercentage}%`}
                    delta="TARGET:100%"
                    deltaType="positive"
                />
                <StatCard
                    label="Upcoming End Dates"
                    value={upcomingEndCount}
                    delta="Next 30 days"
                    deltaType="negative"
                />
            </div>

            {/* My Allocations Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                        My Allocations
                    </h3>
                    <button
                        className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                        onClick={() =>
                            dispatch(
                                setStatusFilter(
                                    getNextFilter(statusFilter),
                                ),
                            )
                        }
                    >
                        <Filter className="w-3.5 h-3.5" />
                        Filter by Status
                        {statusFilter !== 'All' && (
                            <span className="ml-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px]">
                                {statusFilter}
                            </span>
                        )}
                    </button>
                </div>

                <DataTable
                    columns={columns}
                    data={allocations}
                    pagination={{
                        page,
                        totalPages,
                        totalCount,
                        pageSize: DEFAULT_PAGE_SIZE,
                    }}
                    onPageChange={setPage}
                    onSort={handleSort}
                    currentSort={sortConfig}
                />
            </section>
        </div>
    )
}

export default DashboardPage
