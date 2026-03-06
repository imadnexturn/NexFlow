import type {
  PaginatedResponse,
  Project,
  ProjectSummary,
  ProjectTeamMemberResponse,
} from "@/types";
import { apiSlice } from "./api-slice";

interface GetManagedProjectsArgs {
  projectManagerEmpCode?: string;
  search?: string;
  accountCode?: string;
  status?: string;
  isActive?: boolean;
  billable?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

const projectsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getManagedProjects: builder.query<
      PaginatedResponse<ProjectSummary>,
      GetManagedProjectsArgs
    >({
      query: ({
        projectManagerEmpCode,
        search,
        accountCode,
        status,
        isActive,
        billable,
        page = 1,
        limit = 10,
        sort,
      }) => {
        const params = new URLSearchParams();
        if (projectManagerEmpCode) {
          params.set("projectManagerEmpCode", projectManagerEmpCode);
        }
        if (search) params.set("search", search);
        if (accountCode) params.set("accountCode", accountCode);
        if (status) params.set("status", status);
        if (isActive !== undefined) {
          params.set("isActive", String(isActive));
        }
        if (billable !== undefined) {
          params.set("billable", String(billable));
        }
        if (sort) params.set("sort", sort);
        params.set("page", String(page));
        params.set("limit", String(limit));
        return `/projects?${params.toString()}`;
      },
      providesTags: ["Project"],
    }),
    getProjectDetails: builder.query<Project, string>({
      query: (projectCode) => `/projects/${encodeURIComponent(projectCode)}`,
      providesTags: (_result, _error, projectCode) => [
        { type: "ProjectDetails", id: projectCode },
      ],
    }),
    addTeamMember: builder.mutation<
      ProjectTeamMemberResponse,
      {
        projectCode: string;
        teamLeadEmpCode: string;
        reporteeEmpCode: string;
      }
    >({
      query: ({ projectCode, teamLeadEmpCode, reporteeEmpCode }) => ({
        url: `/projects/${encodeURIComponent(projectCode)}/team-members`,
        method: "POST",
        body: { teamLeadEmpCode, reporteeEmpCode },
      }),
      invalidatesTags: (_result, _error, { projectCode }) => [
        { type: "ProjectDetails", id: projectCode },
      ],
    }),
    removeTeamMember: builder.mutation<
      void,
      {
        projectCode: string;
        teamLeadEmpCode: string;
        reporteeEmpCode: string;
      }
    >({
      query: ({ projectCode, teamLeadEmpCode, reporteeEmpCode }) => ({
        url: `/projects/${encodeURIComponent(projectCode)}/team-members/${encodeURIComponent(teamLeadEmpCode)}/${encodeURIComponent(reporteeEmpCode)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { projectCode }) => [
        { type: "ProjectDetails", id: projectCode },
      ],
    }),
  }),
});

export const {
  useGetManagedProjectsQuery,
  useGetProjectDetailsQuery,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
} = projectsApi;
