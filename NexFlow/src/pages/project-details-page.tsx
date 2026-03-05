import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ArrowLeft,
    Settings,
    UserPlus,
    Pencil,
    Trash2,
} from 'lucide-react'
import { useGetProjectDetailsQuery } from '@/store/api/projects-api'
import { useGetMeQuery } from '@/store/api/employees-api'
import PageHeader from '@/components/layout/page-header'
import StatCard from '@/components/shared/stat-card'
import StatusBadge from '@/components/shared/status-badge'
import AllocationProgressBar from '@/components/shared/allocation-progress-bar'
import DataTable from '@/components/shared/data-table'
import type { ColumnDef } from '@/components/shared/data-table'
import AssignEmployeeModal from '@/components/modals/assign-employee-modal'
import EditAllocationModal from '@/components/modals/edit-allocation-modal'
import DeleteAllocationDialog from '@/components/modals/delete-allocation-dialog'
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
    const [assignModalOpen, setAssignModalOpen] = useState(false)

    // Edit allocation state
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editingAllocation, setEditingAllocation] =
        useState<Allocation | null>(null)

    // Delete allocation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingAllocation, setDeletingAllocation] =
        useState<Allocation | null>(null)

    const handleEdit = (allocation: Allocation) => {
        setEditingAllocation(allocation)
        setEditModalOpen(true)
    }

    const handleDelete = (allocation: Allocation) => {
        setDeletingAllocation(allocation)
        setDeleteDialogOpen(true)
    }

    const columns: ColumnDef<Allocation>[] = useMemo(
        () => [
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
                    <AllocationProgressBar
                        percentage={row.percentage}
                    />
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
                cell: (row) => (
                    <div className="flex items-center gap-3">
                        <button
                            className="text-indigo-600 hover:text-indigo-800 transition-colors"
                            aria-label="Edit allocation"
                            onClick={() => handleEdit(row)}
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove allocation"
                            onClick={() => handleDelete(row)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [],
    )

    const allocations = project?.allocations ?? []

    const { data: me } = useGetMeQuery()

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
            ? totalPercentage / activeAllocations.length
            : 0

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
                    me?.role === 'HR' && (
                        <Button
                            variant="outline"
                            aria-label="Project Settings"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Project Settings
                        </Button>
                    )
                }
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Allocation"
                    value={`${totalPercentage}%`}
                />
                <StatCard
                    label="Assigned Resources"
                    value={activeAllocations.length}
                />
                <StatCard
                    label="Average Allocation"
                    value={`${avgAllocated.toFixed(2)}%`}
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
                        onClick={() => setAssignModalOpen(true)}
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
                open={assignModalOpen}
                onOpenChange={setAssignModalOpen}
                projectCode={projectCode ?? ''}
                projectName={project?.projectName ?? ''}
            />

            {/* Edit Allocation Modal */}
            {editingAllocation && (
                <EditAllocationModal
                    open={editModalOpen}
                    onOpenChange={(open) => {
                        setEditModalOpen(open)
                        if (!open) setEditingAllocation(null)
                    }}
                    allocation={editingAllocation}
                />
            )}

            {/* Delete Allocation Dialog */}
            {deletingAllocation && (
                <DeleteAllocationDialog
                    open={deleteDialogOpen}
                    onOpenChange={(open) => {
                        setDeleteDialogOpen(open)
                        if (!open) setDeletingAllocation(null)
                    }}
                    allocationId={deletingAllocation.allocationId}
                    employeeName={
                        deletingAllocation.employeeName ?? 'employee'
                    }
                />
            )}
        </div>
    )
}

export default ProjectDetailsPage
