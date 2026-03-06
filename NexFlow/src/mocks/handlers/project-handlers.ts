import type { ProjectTeamMemberResponse } from "@/types";
import { http, HttpResponse } from "msw";
import { mockProjects } from "../fixtures/projects";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Mock employee lookups (mirrors allocation mock data) ─────────────────────

const MOCK_EMP_NAMES: Record<string, string> = {
  EMP001: "Alex Thompson",
  EMP010: "Sarah Chen",
  EMP011: "Marcus Aurelius",
  EMP012: "Elena Rodriguez",
  EMP013: "David Kim",
};

const MOCK_EMP_IDS: Record<string, string> = {
  EMP001: "emp-uuid-001",
  EMP010: "emp-uuid-010",
  EMP011: "emp-uuid-011",
  EMP012: "emp-uuid-012",
  EMP013: "emp-uuid-013",
};

// ─── Per-project team-member state (mutable, reset on page reload) ────────────

const teamMembersStore: Record<string, ProjectTeamMemberResponse[]> = {};

function initTeamMembers(
  projectCode: string,
  projectId: string,
): ProjectTeamMemberResponse[] {
  return [
    {
      id: "tm-uuid-001",
      projectId,
      projectCode,
      teamLeadId: MOCK_EMP_IDS["EMP011"] ?? "emp-uuid-011",
      teamLeadEmpCode: "EMP011",
      teamLeadFullName: "Marcus Aurelius",
      reporteeId: MOCK_EMP_IDS["EMP013"] ?? "emp-uuid-013",
      reporteeEmpCode: "EMP013",
      reporteeFullName: "David Kim",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tm-uuid-002",
      projectId,
      projectCode,
      teamLeadId: MOCK_EMP_IDS["EMP012"] ?? "emp-uuid-012",
      teamLeadEmpCode: "EMP012",
      teamLeadFullName: "Elena Rodriguez",
      reporteeId: MOCK_EMP_IDS["EMP010"] ?? "emp-uuid-010",
      reporteeEmpCode: "EMP010",
      reporteeFullName: "Sarah Chen",
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];
}

function getTeamMembers(
  projectCode: string,
  projectId: string,
): ProjectTeamMemberResponse[] {
  if (!teamMembersStore[projectCode]) {
    teamMembersStore[projectCode] = initTeamMembers(projectCode, projectId);
  }
  return teamMembersStore[projectCode];
}

export const projectHandlers = [
  http.get(`${BASE_URL}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const search = (url.searchParams.get("search") ?? "").toLowerCase();
    const accountCode = url.searchParams.get("accountCode") ?? "";
    const status = url.searchParams.get("status") ?? "";

    let filtered = mockProjects;

    if (search) {
      filtered = filtered.filter(
        (p) =>
          (p.projectName?.toLowerCase().includes(search) ?? false) ||
          (p.accountName?.toLowerCase().includes(search) ?? false) ||
          p.projectCode.toLowerCase().includes(search),
      );
    }
    if (accountCode) {
      filtered = filtered.filter((p) => p.accountCode === accountCode);
    }
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data: paginated,
      pagination: {
        page,
        limit,
        totalRecords: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  }),
  http.get(`${BASE_URL}/projects/:projectCode`, ({ params }) => {
    const { projectCode } = params;
    const project = mockProjects.find((p) => p.projectCode === projectCode);

    if (!project) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      ...project,
      allocations: [
        {
          allocationId: "alloc-proj-1",
          employeeId: "emp-uuid-010",
          empCode: "EMP010",
          employeeName: "Sarah Chen",
          projectRole: "Sr. Project Manager",
          projectId: project.projectId,
          projectCode: project.projectCode,
          projectName: project.projectName,
          billable: true,
          accountCode: project.accountCode,
          accountName: project.accountName,
          percentage: 100,
          fromDate: "2024-01-12",
          toDate: "2024-12-30",
          status: "Active",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          allocationId: "alloc-proj-2",
          employeeId: "emp-uuid-011",
          empCode: "EMP011",
          employeeName: "Marcus Aurelius",
          projectRole: "Backend Lead",
          projectId: project.projectId,
          projectCode: project.projectCode,
          projectName: project.projectName,
          billable: true,
          accountCode: project.accountCode,
          accountName: project.accountName,
          percentage: 50,
          fromDate: "2024-02-01",
          toDate: "2024-11-15",
          status: "Upcoming",
          createdAt: "2024-01-15T00:00:00Z",
          updatedAt: "2024-01-15T00:00:00Z",
        },
        {
          allocationId: "alloc-proj-3",
          employeeId: "emp-uuid-012",
          empCode: "EMP012",
          employeeName: "Elena Rodriguez",
          projectRole: "UI/UX Designer",
          projectId: project.projectId,
          projectCode: project.projectCode,
          projectName: project.projectName,
          billable: false,
          accountCode: project.accountCode,
          accountName: project.accountName,
          percentage: 75,
          fromDate: "2024-01-01",
          toDate: "2024-03-15",
          status: "Ended",
          createdAt: "2023-12-15T00:00:00Z",
          updatedAt: "2023-12-15T00:00:00Z",
        },
        {
          allocationId: "alloc-proj-4",
          employeeId: "emp-uuid-013",
          empCode: "EMP013",
          employeeName: "David Kim",
          projectRole: "QA Specialist",
          projectId: project.projectId,
          projectCode: project.projectCode,
          projectName: project.projectName,
          billable: true,
          accountCode: project.accountCode,
          accountName: project.accountName,
          percentage: 100,
          fromDate: "2024-03-20",
          toDate: "2024-12-20",
          status: "Active",
          createdAt: "2024-03-10T00:00:00Z",
          updatedAt: "2024-03-10T00:00:00Z",
        },
      ],
      teamMembers: getTeamMembers(project.projectCode, project.projectId),
      createdAt: "2023-12-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    });
  }),

  // ── POST /projects/:projectCode/team-members ──────────────────────────────
  http.post(
    `${BASE_URL}/projects/:projectCode/team-members`,
    async ({ request, params }) => {
      const { projectCode } = params as { projectCode: string };
      const project = mockProjects.find((p) => p.projectCode === projectCode);
      if (!project) return new HttpResponse(null, { status: 404 });

      const body = (await request.json()) as {
        teamLeadEmpCode: string;
        reporteeEmpCode: string;
      };
      const { teamLeadEmpCode, reporteeEmpCode } = body;

      // Guard against duplicate pairs
      const existing = getTeamMembers(projectCode, project.projectId);
      const duplicate = existing.some(
        (tm) =>
          tm.teamLeadEmpCode === teamLeadEmpCode &&
          tm.reporteeEmpCode === reporteeEmpCode,
      );
      if (duplicate) {
        return HttpResponse.json(
          { error: "Relationship already exists" },
          { status: 409 },
        );
      }

      const newEntry: ProjectTeamMemberResponse = {
        id: `tm-uuid-${Date.now()}`,
        projectId: project.projectId,
        projectCode,
        teamLeadId:
          MOCK_EMP_IDS[teamLeadEmpCode] ?? `emp-uuid-${teamLeadEmpCode}`,
        teamLeadEmpCode,
        teamLeadFullName: MOCK_EMP_NAMES[teamLeadEmpCode] ?? teamLeadEmpCode,
        reporteeId:
          MOCK_EMP_IDS[reporteeEmpCode] ?? `emp-uuid-${reporteeEmpCode}`,
        reporteeEmpCode,
        reporteeFullName: MOCK_EMP_NAMES[reporteeEmpCode] ?? reporteeEmpCode,
        createdAt: new Date().toISOString(),
      };

      teamMembersStore[projectCode] = [...existing, newEntry];
      return HttpResponse.json(newEntry, { status: 201 });
    },
  ),

  // ── DELETE /projects/:projectCode/team-members/:tlCode/:repCode ───────────
  http.delete(
    `${BASE_URL}/projects/:projectCode/team-members/:teamLeadEmpCode/:reporteeEmpCode`,
    ({ params }) => {
      const { projectCode, teamLeadEmpCode, reporteeEmpCode } = params as {
        projectCode: string;
        teamLeadEmpCode: string;
        reporteeEmpCode: string;
      };
      const project = mockProjects.find((p) => p.projectCode === projectCode);
      if (!project) return new HttpResponse(null, { status: 404 });

      const current = getTeamMembers(projectCode, project.projectId);
      teamMembersStore[projectCode] = current.filter(
        (tm) =>
          !(
            tm.teamLeadEmpCode === teamLeadEmpCode &&
            tm.reporteeEmpCode === reporteeEmpCode
          ),
      );
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
