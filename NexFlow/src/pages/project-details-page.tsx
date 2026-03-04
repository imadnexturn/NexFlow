import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ArrowLeft,
    Settings,
    UserPlus,
    Pencil,
    Trash2,
} from 'lucide-react'
import { useGetProjectDetailsQuery } from '@/store/api/projects-api'
import PageHeader from '@/components/layout/page-header'
import StatCard from '@/components/shared/stat-card'
import StatusBadge from '@/components/shared/status-badge'
import AllocationProgressBar from '@/components/shared/allocation-progress-bar'
import DataTable from '@/components/shared/data-table'
import type { ColumnDef } from '@/components/shared/data-table'
import AssignEmployeeModal from '@/components/modals/assign-employee-modal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type { Allocation } from '@/types'

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
        accessorKey: 'employeeName',
        header: 'Employee Name',
        cell: (row) => (
            <span className="text-sm font-semibold text-slate-900">
                {row.employeeName ?? '—'}
            </span>
        ),
    },
    {
        accessorKey: 'projectRole',
        header: 'Role',
        cell: (row) => (
            <span className="text-sm font-medium text-slate-600">
                {row.projectRole ?? '—'}
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
        accessorKey: 'percentage',
        header: 'Allocation %',
        cell: (row) => (
            <AllocationProgressBar percentage={row.percentage} />
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: (row) => <StatusBadge status={row.status} />,
    },
    {
        accessorKey: 'allocationId',
        header: 'Actions',
        cell: () => (
            <div className="flex items-center gap-3">
                <button
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    aria-label="Edit allocation"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                <button
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove allocation"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        ),
    },
]

/**
 * Project Details Page — shows project info, stat cards,
 * and resource allocations table for a specific project.
 */
function ProjectDetailsPage() {
    const { projectCode } = useParams<{ projectCode: string }>()
    const {
        data: project,
        isLoading,
    } = useGetProjectDetailsQuery(projectCode ?? '', {
        skip: !projectCode,
    })

    const [page, setPage] = useState(1)
    const [modalOpen, setModalOpen] = useState(false)

    const allocations = project?.allocations ?? []

    // Stat calculations
    const activeAllocations = allocations.filter(
        (a) => a.status === 'Active',
    )
    const totalPercentage = activeAllocations.reduce(
        (sum, a) => sum + a.percentage,
        0,
    )
    const avgAllocated =
        activeAllocations.length > 0
            ? Math.round(totalPercentage / activeAllocations.length)
            : 0
    const availableCapacity = Math.max(0, 100 - avgAllocated)

    // Client-side pagination
    const totalCount = allocations.length
    const totalPages = Math.max(
        1,
        Math.ceil(totalCount / DEFAULT_PAGE_SIZE),
    )
    const paginatedAllocations = allocations.slice(
        (page - 1) * DEFAULT_PAGE_SIZE,
        page * DEFAULT_PAGE_SIZE,
    )

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-80" />
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28" />
                    ))}
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link
                to="/managed-projects"
                className="inline-flex items-center gap-2 text-indigo-600 text-sm font-medium hover:underline"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Managed Projects
            </Link>

            {/* Page Header */}
            <PageHeader
                title={project?.projectName ?? 'Project Details'}
                subtitle={`${project?.accountName ?? ''} • ${project?.status ?? ''}`}
                actions={
                    <Button
                        variant="outline"
                        aria-label="Project Settings"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Project Settings
                    </Button>
                }
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Allocated %"
                    value={`${avgAllocated}%`}
                />
                <StatCard
                    label="Total Team Members"
                    value={allocations.length}
                />
                <StatCard
                    label="Available Capacity"
                    value={`${availableCapacity}%`}
                />
            </div>

            {/* Resource Allocations */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                        Resource Allocations
                    </h3>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        aria-label="Assign Employee"
                        onClick={() => setModalOpen(true)}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign Employee
                    </Button>
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
            </div>

            {/* Assign Employee Modal */}
            <AssignEmployeeModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                projectCode={projectCode ?? ''}
                projectName={project?.projectName ?? ''}
            />
        </div>
    )
}

export default ProjectDetailsPage
