import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Plus, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useGetMeQuery } from '@/store/api/employees-api'
import { useGetManagedProjectsQuery } from '@/store/api/projects-api'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
    setSearchText,
    setStatusFilter,
    setAccountFilter,
} from '@/store/slices/projects-filters-slice'
import PageHeader from '@/components/layout/page-header'
import SearchInput from '@/components/shared/search-input'
import StatusBadge from '@/components/shared/status-badge'
import DataTable from '@/components/shared/data-table'
import type { ColumnDef } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type { ProjectSummary } from '@/types'

const columns: ColumnDef<ProjectSummary>[] = [
    {
        accessorKey: 'accountName',
        header: 'Account Name',
        cell: (row) => (
            <span className="text-sm font-medium text-slate-900">
                {row.accountName}
            </span>
        ),
    },
    {
        accessorKey: 'projectName',
        header: 'Project Name',
        cell: (row) => (
            <span className="text-sm font-medium text-indigo-600">
                {row.projectName}
            </span>
        ),
    },
    {
        accessorKey: 'projectCode',
        header: 'Code',
        cell: (row) => (
            <span className="text-xs font-mono text-slate-500">
                {row.projectCode}
            </span>
        ),
    },
    {
        accessorKey: 'billable',
        header: 'Billable',
        cell: (row) => (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.billable
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                    }`}
            >
                {row.billable ? 'Yes' : 'No'}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: (row) => <StatusBadge status={row.status} />,
    },
    {
        accessorKey: 'projectId',
        header: 'Action',
        cell: (row) => (
            <Link
                to={`/managed-projects/${row.projectCode}`}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
                aria-label="View project"
            >
                <Eye className="w-5 h-5" />
            </Link>
        ),
    },
]

/**
 * Managed Projects Page — lists projects using GET /projects.
 * Supports server-side search, account, and status filtering.
 */
function ManagedProjectsPage() {
    const dispatch = useAppDispatch()
    const { searchText, accountFilter, statusFilter } = useAppSelector(
        (state) => state.projectsFilters,
    )

    const [page, setPage] = useState(1)

    const { data: me, isLoading: isLoadingMe } = useGetMeQuery()

    const {
        data: projectsResponse,
        isLoading: isLoadingProjects,
    } = useGetManagedProjectsQuery(
        {
            projectManagerEmpCode: me?.empCode,
            search: searchText || undefined,
            accountCode: accountFilter || undefined,
            status: statusFilter || undefined,
            page,
            limit: DEFAULT_PAGE_SIZE,
        },
        {
            skip: !me?.empCode,
        },
    )

    const isLoading = isLoadingMe || isLoadingProjects

    const projects = projectsResponse?.data ?? []
    const pagination = projectsResponse?.pagination

    const totalCount = pagination?.totalRecords ?? 0
    const totalPages = pagination?.totalPages ?? 1

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Managed Projects"
                actions={
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        aria-label="New Project"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                }
            />

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px]">
                    <SearchInput
                        value={searchText}
                        onChange={(val) => {
                            dispatch(setSearchText(val))
                            setPage(1)
                        }}
                        placeholder="Search projects, clients or codes..."
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600"
                        aria-label={`Account: ${accountFilter || 'All'}`}
                        onClick={() => {
                            dispatch(
                                setAccountFilter(
                                    accountFilter ? '' : accountFilter,
                                ),
                            )
                            setPage(1)
                        }}
                    >
                        <span>
                            Account:{' '}
                            {accountFilter || 'All'}
                        </span>
                        <ChevronDown className="w-4 h-4" aria-hidden />
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600"
                        aria-label={`Status: ${statusFilter || 'All'}`}
                        onClick={() => {
                            dispatch(
                                setStatusFilter(
                                    statusFilter ? '' : statusFilter,
                                ),
                            )
                            setPage(1)
                        }}
                    >
                        <span>
                            Status:{' '}
                            {statusFilter || 'All'}
                        </span>
                        <SlidersHorizontal className="w-4 h-4" aria-hidden />
                    </button>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <DataTable
                    columns={columns}
                    data={projects}
                    pagination={{
                        page,
                        totalPages,
                        totalCount,
                        pageSize: DEFAULT_PAGE_SIZE,
                    }}
                    onPageChange={setPage}
                />
                {/* Pagination Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                        Showing{' '}
                        {Math.min(
                            projects.length,
                            DEFAULT_PAGE_SIZE,
                        )}{' '}
                        of {totalCount} projects
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ManagedProjectsPage
