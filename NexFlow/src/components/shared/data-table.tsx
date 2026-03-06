import type { ReactNode } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Column definition for DataTable.
 */
export interface ColumnDef<T> {
    /** Unique key or accessor path */
    accessorKey: keyof T & string
    /** Column header label */
    header: string
    /** Custom cell renderer */
    cell?: (row: T) => ReactNode
}

interface PaginationProps {
    page: number
    totalPages: number
    totalCount: number
    pageSize: number
}

interface DataTableProps<T> {
    columns: ColumnDef<T>[]
    data: T[]
    pagination?: PaginationProps
    onPageChange?: (page: number) => void
    onRowClick?: (row: T) => void
    emptyMessage?: string
    onSort?: (key: keyof T & string) => void
    currentSort?: { key: keyof T & string; direction: 'asc' | 'desc' }
}

/**
 * Generic data table with shadcn Table, pagination controls,
 * and optional row click handler. Styled per DESIGN.md §5.3.
 */
function DataTable<T>({
    columns,
    data,
    pagination,
    onPageChange,
    onRowClick,
    emptyMessage = 'No data available',
    onSort,
    currentSort,
}: DataTableProps<T>) {
    const startIndex = pagination
        ? (pagination.page - 1) * pagination.pageSize + 1
        : 1
    const endIndex = pagination
        ? Math.min(pagination.page * pagination.pageSize, pagination.totalCount)
        : data.length
    const showingText = pagination
        ? `Showing ${startIndex}–${endIndex} of ${pagination.totalCount}`
        : `Showing ${data.length} results`

    return (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        {columns.map((col) => {
                            const isSorted = currentSort?.key === col.accessorKey;
                            return (
                                <TableHead
                                    key={col.accessorKey}
                                    className={`text-xs font-medium uppercase tracking-wider text-slate-500 px-4 py-3 ${onSort ? 'cursor-pointer select-none hover:text-slate-700' : ''}`}
                                    onClick={() => onSort?.(col.accessorKey)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {isSorted && (
                                            <span className="text-indigo-600">
                                                {currentSort.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </TableHead>
                            )
                        })}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="text-center text-sm text-slate-500 py-8"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row, idx) => (
                            <TableRow
                                key={idx}
                                className={
                                    onRowClick
                                        ? 'cursor-pointer hover:bg-slate-50 transition-colors duration-100'
                                        : 'hover:bg-slate-50 transition-colors duration-100'
                                }
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((col) => (
                                    <TableCell
                                        key={col.accessorKey}
                                        className="px-4 py-3 text-sm text-slate-700"
                                    >
                                        {col.cell
                                            ? col.cell(row)
                                            : String(row[col.accessorKey] ?? '')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">
                        {showingText}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() =>
                                onPageChange?.(pagination.page - 1)
                            }
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                pagination.page >= pagination.totalPages
                            }
                            onClick={() =>
                                onPageChange?.(pagination.page + 1)
                            }
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DataTable
