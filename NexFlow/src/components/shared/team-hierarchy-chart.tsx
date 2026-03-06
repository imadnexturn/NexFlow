import ConfirmDialog from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";
import type { Allocation, ProjectTeamMemberResponse } from "@/types";
import { Plus, X } from "lucide-react";
import { useMemo } from "react";

// ─── Internal tree node type ──────────────────────────────────────────────────

interface HierarchyNode {
  empCode: string;
  name: string;
  role: "ProjectManager" | "TeamLead" | "Resource";
  projectRole: string | null;
  percentage: number | null;
  /**
   * The empCode of the Team Lead this node reports to, as recorded in the
   * teamMembers array.  null for root-level Team Leads (they are not a
   * reportee of anyone in teamMembers) and for the PM.
   */
  teamLeadEmpCode: string | null;
  children: HierarchyNode[];
}

// ─── Tree builder ─────────────────────────────────────────────────────────────

function buildTree(
  teamMembers: ProjectTeamMemberResponse[],
  allocations: Allocation[],
  pmEmpCode: string | null,
  pmName: string | null,
): HierarchyNode | null {
  if (!pmEmpCode) return null;

  const allocationMap = new Map(allocations.map((a) => [a.empCode, a]));

  // Build teamLead → [reportees] map
  const childrenMap = new Map<string, string[]>();
  const allReportees = new Set<string>();
  for (const tm of teamMembers) {
    if (!childrenMap.has(tm.teamLeadEmpCode)) {
      childrenMap.set(tm.teamLeadEmpCode, []);
    }
    childrenMap.get(tm.teamLeadEmpCode)!.push(tm.reporteeEmpCode);
    allReportees.add(tm.reporteeEmpCode);
  }

  // Root TLs = team leads who are not reportees of any other TL
  const rootTLs = [...childrenMap.keys()].filter((tl) => !allReportees.has(tl));

  function resolveName(empCode: string): string {
    const alloc = allocationMap.get(empCode);
    if (alloc?.employeeName) return alloc.employeeName;
    const asTL = teamMembers.find((tm) => tm.teamLeadEmpCode === empCode);
    if (asTL?.teamLeadFullName) return asTL.teamLeadFullName;
    const asRep = teamMembers.find((tm) => tm.reporteeEmpCode === empCode);
    if (asRep?.reporteeFullName) return asRep.reporteeFullName;
    return empCode;
  }

  function buildNode(empCode: string, tlEmpCode: string | null): HierarchyNode {
    const alloc = allocationMap.get(empCode);
    const childCodes = childrenMap.get(empCode) ?? [];
    // Whoever has entries in childrenMap is a TeamLead; others are Resources
    const role: HierarchyNode["role"] =
      empCode === pmEmpCode
        ? "ProjectManager"
        : childrenMap.has(empCode)
          ? "TeamLead"
          : "Resource";
    return {
      empCode,
      name: resolveName(empCode),
      role,
      projectRole: alloc?.projectRole ?? null,
      percentage: alloc?.percentage ?? null,
      teamLeadEmpCode: tlEmpCode,
      children: childCodes.map((code) => buildNode(code, empCode)),
    };
  }

  const pmAlloc = allocationMap.get(pmEmpCode);
  return {
    empCode: pmEmpCode,
    name: pmName ?? resolveName(pmEmpCode),
    role: "ProjectManager",
    projectRole: pmAlloc?.projectRole ?? null,
    percentage: pmAlloc?.percentage ?? null,
    teamLeadEmpCode: null,
    // Root TLs are direct children of PM; unparented resources also
    // attach directly to PM (shown as "reporting to PM by default")
    children: [
      ...rootTLs.map((code) => buildNode(code, null)),
      // Unparented resources: allocated to the project but absent from
      // the teamMembers array entirely (neither a TL nor a reportee),
      // and not the PM themselves
      ...[...allocationMap.keys()]
        .filter(
          (code) =>
            code !== pmEmpCode &&
            !childrenMap.has(code) &&
            !allReportees.has(code),
        )
        .map((code) => buildNode(code, null)),
    ],
  };
}

// ─── Styling maps ─────────────────────────────────────────────────────────────

const NODE_STYLE: Record<HierarchyNode["role"], string> = {
  ProjectManager: "border-purple-300 bg-purple-50",
  TeamLead: "border-blue-300 bg-blue-50",
  Resource: "border-slate-200 bg-white",
};

const BADGE_STYLE: Record<HierarchyNode["role"], string> = {
  ProjectManager: "bg-purple-100 text-purple-700",
  TeamLead: "bg-blue-100 text-blue-700",
  Resource: "bg-slate-100 text-slate-600",
};

const ROLE_LABEL: Record<HierarchyNode["role"], string> = {
  ProjectManager: "PM",
  TeamLead: "Team Lead",
  Resource: "Resource",
};

// ─── Node card ────────────────────────────────────────────────────────────────

interface NodeCardProps {
  node: HierarchyNode;
  canManage: boolean;
  onRemove: (teamLeadEmpCode: string, reporteeEmpCode: string) => void;
}

function NodeCard({ node, canManage, onRemove }: NodeCardProps) {
  // A node can only be removed when it exists in teamMembers as a reportee
  const canRemove = canManage && node.teamLeadEmpCode !== null;

  return (
    <div className="relative group">
      <div
        className={cn(
          "rounded-xl border-2 px-3 py-3 w-44 shadow-sm text-center",
          NODE_STYLE[node.role],
        )}
      >
        <p className="text-sm font-semibold text-slate-900 truncate">
          {node.name}
        </p>
        <span
          className={cn(
            "inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1",
            BADGE_STYLE[node.role],
          )}
        >
          {ROLE_LABEL[node.role]}
        </span>
        {node.projectRole && (
          <p className="text-xs text-slate-500 truncate mt-1">
            {node.projectRole}
          </p>
        )}
        {node.percentage !== null && (
          <p className="text-xs font-semibold text-slate-600 mt-0.5">
            {node.percentage}%
          </p>
        )}
      </div>

      {canRemove && (
        <ConfirmDialog
          trigger={
            <button
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-red-600"
              title={`Remove ${node.name} from hierarchy`}
              aria-label={`Remove ${node.name} from hierarchy`}
            >
              <X className="w-3 h-3" />
            </button>
          }
          title="Remove from hierarchy?"
          description={`Remove ${node.name} from reporting under their Team Lead? Their project allocation is not affected.`}
          confirmLabel="Remove"
          onConfirm={() => onRemove(node.teamLeadEmpCode!, node.empCode)}
        />
      )}
    </div>
  );
}

// ─── Recursive tree node ──────────────────────────────────────────────────────

interface TreeNodeProps {
  node: HierarchyNode;
  canManage: boolean;
  onRemove: (teamLeadEmpCode: string, reporteeEmpCode: string) => void;
}

function TreeNode({ node, canManage, onRemove }: TreeNodeProps) {
  return (
    <div className="flex flex-col items-center">
      <NodeCard node={node} canManage={canManage} onRemove={onRemove} />

      {node.children.length > 0 && (
        <>
          {/* Vertical stem from parent to bus */}
          <div className="w-px h-8 bg-slate-200" />

          {/* Children row */}
          <div className="flex items-start">
            {node.children.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === node.children.length - 1;
              const isOnly = node.children.length === 1;

              return (
                <div
                  key={child.empCode}
                  className="flex flex-col items-center relative px-6"
                >
                  {/* Horizontal bus segment — skipped for single child */}
                  {!isOnly && (
                    <div
                      className="absolute top-0 h-px bg-slate-200"
                      style={{
                        left: isFirst ? "50%" : 0,
                        right: isLast ? "50%" : 0,
                      }}
                    />
                  )}
                  {/* Drop line from bus to child */}
                  <div className="w-px h-8 bg-slate-200" />
                  <TreeNode
                    node={child}
                    canManage={canManage}
                    onRemove={onRemove}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export interface TeamHierarchyChartProps {
  teamMembers: ProjectTeamMemberResponse[];
  allocations: Allocation[];
  projectManagerEmpCode: string | null;
  projectManagerName: string | null;
  canManage: boolean;
  onRemoveMember: (teamLeadEmpCode: string, reporteeEmpCode: string) => void;
  onAddClick: () => void;
}

export default function TeamHierarchyChart({
  teamMembers,
  allocations,
  projectManagerEmpCode,
  projectManagerName,
  canManage,
  onRemoveMember,
  onAddClick,
}: TeamHierarchyChartProps) {
  const rootNode = useMemo(
    () =>
      buildTree(
        teamMembers,
        allocations,
        projectManagerEmpCode,
        projectManagerName,
      ),
    [teamMembers, allocations, projectManagerEmpCode, projectManagerName],
  );

  if (!rootNode) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <p className="text-sm">No project manager assigned.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">
          Reporting Hierarchy
        </h3>

        {canManage && (
          <button
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            onClick={onAddClick}
          >
            <Plus className="w-4 h-4" />
            Add Relationship
          </button>
        )}
      </div>

      <div className="overflow-x-auto px-6 py-8">
        <div className="inline-flex min-w-full justify-center">
          <TreeNode
            node={rootNode}
            canManage={canManage}
            onRemove={onRemoveMember}
          />
        </div>
      </div>
    </div>
  );
}
