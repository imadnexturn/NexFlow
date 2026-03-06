import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useAddTeamMemberMutation } from '@/store/api/projects-api'
import type { Allocation, ProjectTeamMemberResponse } from '@/types'
import { useMemo, useState } from 'react'

interface ManageHierarchyModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectCode: string
    projectName: string
    /** All allocations for this project — used to populate employee dropdowns. */
    allocations: Allocation[]
    /** Already-existing TL → Reportee pairs, used to filter out duplicates. */
    existingPairs: ProjectTeamMemberResponse[]
    /** The PM's empCode — excluded from the reportee dropdown. */
    projectManagerEmpCode: string | null
}

export default function ManageHierarchyModal({
    open,
    onOpenChange,
    projectCode,
    projectName,
    allocations,
    existingPairs,
    projectManagerEmpCode,
}: ManageHierarchyModalProps) {
    const [teamLeadEmpCode, setTeamLeadEmpCode] = useState('')
    const [reporteeEmpCode, setReporteeEmpCode] = useState('')
    const [addTeamMember, { isLoading }] = useAddTeamMemberMutation()

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setTeamLeadEmpCode('')
            setReporteeEmpCode('')
        }
        onOpenChange(nextOpen)
    }

    // Reset reportee whenever the team lead selection changes
    const handleTLChange = (val: string) => {
        setTeamLeadEmpCode(val)
        setReporteeEmpCode('')
    }

    // Deduplicate allocations by empCode (multiple allocations per person possible)
    const uniqueAllocations = useMemo(() => {
        const seen = new Set<string>()
        return allocations.filter((a) => {
            if (seen.has(a.empCode)) return false
            seen.add(a.empCode)
            return true
        })
    }, [allocations])

    // Reportees already assigned under the selected TL — must be excluded
    const existingReporteesForTL = useMemo(
        () =>
            new Set(
                existingPairs
                    .filter((p) => p.teamLeadEmpCode === teamLeadEmpCode)
                    .map((p) => p.reporteeEmpCode),
            ),
        [existingPairs, teamLeadEmpCode],
    )

    // Employees who already report to someone — each person can only have one
    // direct team lead, so we exclude them from the reportee dropdown entirely.
    const alreadyHaveTeamLead = useMemo(
        () => new Set(existingPairs.map((p) => p.reporteeEmpCode)),
        [existingPairs],
    )

    // Walk up the ancestor chain of the selected TL to prevent cycles.
    // e.g. Sarah→David: if David is selected as TL, Sarah is his ancestor.
    // Allowing Sarah as David's reportee would create a Sarah↔David loop.
    const ancestorsOfTL = useMemo(() => {
        const ancestors = new Set<string>()
        if (!teamLeadEmpCode) return ancestors

        // reporteeEmpCode → who they report to
        const reporteeToTL = new Map(
            existingPairs.map((p) => [p.reporteeEmpCode, p.teamLeadEmpCode]),
        )

        let current: string | undefined = reporteeToTL.get(teamLeadEmpCode)
        while (current !== undefined) {
            ancestors.add(current)
            current = reporteeToTL.get(current)
        }
        return ancestors
    }, [existingPairs, teamLeadEmpCode])

    const reporteeOptions = uniqueAllocations.filter(
        (a) =>
            a.empCode !== teamLeadEmpCode &&
            a.empCode !== projectManagerEmpCode &&
            !existingReporteesForTL.has(a.empCode) &&
            !alreadyHaveTeamLead.has(a.empCode) &&
            !ancestorsOfTL.has(a.empCode),
    )

    const canSave =
        teamLeadEmpCode !== '' && reporteeEmpCode !== '' && !isLoading

    const handleSave = async () => {
        if (!canSave) return
        try {
            await addTeamMember({
                projectCode,
                teamLeadEmpCode,
                reporteeEmpCode,
            }).unwrap()
            handleOpenChange(false)
        } catch {
            // Errors handled by the api-toast-middleware
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-110">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Add Reporting Relationship
                    </DialogTitle>
                    <DialogDescription>
                        Define a Team Lead → Reportee relationship in{' '}
                        {projectName}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Team Lead */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Team Lead
                        </label>
                        <Select
                            value={teamLeadEmpCode}
                            onValueChange={handleTLChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select team lead…" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueAllocations
                                    .filter(
                                        (a) =>
                                            a.empCode !==
                                            projectManagerEmpCode,
                                    )
                                    .map((a) => (
                                        <SelectItem
                                            key={a.empCode}
                                            value={a.empCode}
                                        >
                                            {a.employeeName ?? a.empCode}
                                            {a.projectRole
                                                ? ` — ${a.projectRole}`
                                                : ''}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reportee */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Reportee
                        </label>
                        <Select
                            value={reporteeEmpCode}
                            onValueChange={setReporteeEmpCode}
                            disabled={!teamLeadEmpCode}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        teamLeadEmpCode
                                            ? 'Select reportee…'
                                            : 'Select a team lead first'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {reporteeOptions.map((a) => (
                                    <SelectItem
                                        key={a.empCode}
                                        value={a.empCode}
                                    >
                                        {a.employeeName ?? a.empCode}
                                        {a.projectRole
                                            ? ` — ${a.projectRole}`
                                            : ''}
                                    </SelectItem>
                                ))}
                                {reporteeOptions.length === 0 && (
                                    <div className="px-3 py-2 text-sm text-slate-400">
                                        No available reportees
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => void handleSave()}
                        disabled={!canSave}
                    >
                        {isLoading ? 'Saving…' : 'Add Relationship'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
