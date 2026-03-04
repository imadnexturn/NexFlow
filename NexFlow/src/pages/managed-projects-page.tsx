import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Plus, ChevronDown, SlidersHorizontal, Users } from 'lucide-react'
import { useGetMeQuery } from '@/store/api/employees-api'
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
import type { ManagedProjectItem } from '@/types'

const columns: ColumnDef<ManagedProjectItem>[] = [
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
        accessorKey: 'managementRole',
        header: 'Role',
        cell: (row) => (
            <span className="text-sm text-slate-600">
                {row.managementRole}
            </span>
        ),
    },
    {
        accessorKey: 'activeResourceCount',
        header: 'Resources',
        cell: (row) => (
            <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                <Users className="w-3.5 h-3.5" />
                {row.activeResourceCount}
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
 * Managed Projects Page — lists projects managed by the current PM.
 * Uses GET /employees/me and reads managedProjects[].
 */
function ManagedProjectsPage() {
    const dispatch = useAppDispatch()
    const { searchText, accountFilter, statusFilter } = useAppSelector(
        (state) => state.projectsFilters,
    )
    const {
        data: me,
        isLoading,
    } = useGetMeQuery()

    const [page, setPage] = useState(1)

    const allProjects = me?.managedProjects ?? []

    // Client-side filtering
    const filteredProjects = allProjects.filter((p) => {
        const matchesSearch =
            !searchText ||
            p.projectName
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
            p.accountName
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
            p.projectCode
                .toLowerCase()
                .includes(searchText.toLowerCase())
        const matchesStatus =
            !statusFilter || p.status === statusFilter
        const matchesAccount =
            !accountFilter || p.accountCode === accountFilter
        return matchesSearch && matchesStatus && matchesAccount
    })

    // Client-side pagination
    const totalCount = filteredProjects.length
    const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE))
    const paginatedProjects = filteredProjects.slice(
        (page - 1) * DEFAULT_PAGE_SIZE,
        page * DEFAULT_PAGE_SIZE,
    )

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
                        onChange={(val) =>
                            dispatch(setSearchText(val))
                        }
                        placeholder="Search projects, clients or codes..."
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600"
                        aria-label={`Account: ${accountFilter || 'All'}`}
                        onClick={() =>
                            dispatch(
                                setAccountFilter(
                                    accountFilter ? '' : accountFilter,
                                ),
                            )
                        }
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
                        onClick={() =>
                            dispatch(
                                setStatusFilter(
                                    statusFilter ? '' : statusFilter,
                                ),
                            )
                        }
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
                    data={paginatedProjects}
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
                            paginatedProjects.length,
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
