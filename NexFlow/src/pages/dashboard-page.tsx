import { useState } from 'react'
import { Download, Filter } from 'lucide-react'
import { useGetMyAllocationsQuery } from '@/store/api/employees-api'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
    setStatusFilter,
    setSearchText,
} from '@/store/slices/dashboard-filters-slice'
import PageHeader from '@/components/layout/page-header'
import SearchInput from '@/components/shared/search-input'
import StatCard from '@/components/shared/stat-card'
import DataTable from '@/components/shared/data-table'
import type { ColumnDef } from '@/components/shared/data-table'
import StatusBadge from '@/components/shared/status-badge'
import AllocationProgressBar from '@/components/shared/allocation-progress-bar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type { Allocation, AllocationRecordStatus } from '@/types'

type DashboardStatusFilter = 'All' | AllocationRecordStatus

const STATUS_OPTIONS: DashboardStatusFilter[] = [
    'All',
    'Active',
    'Upcoming',
    'Ended',
]

const columns: ColumnDef<Allocation>[] = [
    {
        accessorKey: 'accountCode',
        header: 'Account Name',
        cell: (row) => (
            <span className="text-sm font-semibold text-slate-900">
                {row.accountCode}
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
        accessorKey: 'roleOnProject',
        header: 'Role',
        cell: (row) => (
            <span className="text-sm text-slate-600">
                {row.roleOnProject ?? '—'}
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
            <span
                className={
                    row.billable
                        ? 'px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100 uppercase'
                        : 'px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded border border-slate-200 uppercase'
                }
            >
                {row.billable ? 'Yes' : 'No'}
            </span>
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
        cell: (row) => <StatusBadge status={row.status} />,
    },
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

/**
 * Cycle to next status filter value.
 */
function getNextFilter(current: DashboardStatusFilter): DashboardStatusFilter {
    const idx = STATUS_OPTIONS.indexOf(current)
    return STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length]
}

/**
 * Dashboard Page — Manager Allocation Dashboard.
 * Shows stat cards, filterable allocations table with pagination.
 */
function DashboardPage() {
    const dispatch = useAppDispatch()
    const { statusFilter, searchText } = useAppSelector(
        (state) => state.dashboardFilters,
    )
    const {
        data: allocations,
        isLoading,
    } = useGetMyAllocationsQuery()

    const [page, setPage] = useState(1)

    // Client-side filtering
    const filteredAllocations = !allocations
        ? []
        : allocations.filter((a) => {
            const matchesStatus =
                statusFilter === 'All' || a.status === statusFilter
            const matchesSearch =
                !searchText ||
                a.projectName
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                a.accountCode
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
            return matchesStatus && matchesSearch
        })

    // Pagination
    const totalCount = filteredAllocations.length
    const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE))
    const paginatedAllocations = filteredAllocations.slice(
        (page - 1) * DEFAULT_PAGE_SIZE,
        page * DEFAULT_PAGE_SIZE,
    )

    // Stat calculations
    const activeCount = allocations
        ? allocations.filter((a) => a.status === 'Active').length
        : 0
    const totalPercentage = allocations
        ? allocations
            .filter((a) => a.status === 'Active')
            .reduce((sum, a) => sum + a.percentage, 0)
        : 0
    const avgAllocation =
        activeCount > 0 ? Math.round(totalPercentage / activeCount) : 0
    const billableCount = allocations
        ? allocations.filter((a) => a.billable && a.status === 'Active').length
        : 0
    const billablePercent =
        activeCount > 0 ? Math.round((billableCount / activeCount) * 100) : 0
    const upcomingEndCount = allocations
        ? allocations.filter((a) => {
            if (!a.toDate) return false
            const endDate = new Date(a.toDate)
            const now = new Date()
            const thirtyDaysLater = new Date(now)
            thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
            return endDate >= now && endDate <= thirtyDaysLater
        }).length
        : 0

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
                title="Manager Allocation Dashboard"
                actions={
                    <>
                        <SearchInput
                            value={searchText}
                            onChange={(val) =>
                                dispatch(setSearchText(val))
                            }
                            placeholder="Search allocations..."
                            className="w-64"
                        />
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Download className="w-4 h-4 mr-2" />
                            Export Report
                        </Button>
                    </>
                }
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Active Allocations"
                    value={activeCount}
                    delta={`+${activeCount}`}
                    deltaType="positive"
                />
                <StatCard
                    label="Current Allocation %"
                    value={`${avgAllocation}%`}
                />
                <StatCard
                    label="Billable %"
                    value={`${billablePercent}%`}
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
                    data={paginatedAllocations}
                    pagination={{
                        page,
                        totalPages,
                        totalCount,
                        pageSize: DEFAULT_PAGE_SIZE,
                    }}
                    onPageChange={setPage}
                />
            </section>
        </div>
    )
}

export default DashboardPage
