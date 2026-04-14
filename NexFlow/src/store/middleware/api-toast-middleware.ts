import type { ApiError } from "@/types";
import type { Middleware } from "@reduxjs/toolkit";
import { isFulfilled, isRejectedWithValue } from "@reduxjs/toolkit";
import { toast } from "sonner";

export const apiToastMiddleware: Middleware = () => (next) => (action) => {
  // ── Mutation success ──────────────────────────────────────────────────────
  // isFulfilled matches every fulfilled RTK Query action. We gate on
  // meta.arg.type === 'mutation' to skip query results (no toast needed).
  if (isFulfilled(action)) {
    const argType = (action.meta as { arg?: { type?: string } }).arg?.type;
    if (argType === "mutation") {
      const message =
        (action.payload as { message?: string } | undefined)?.message ??
        "Operation successful";
      toast.success(message, { richColors: true });
    }
  }

  // ── Mutation / query failure ───────────────────────────────────────────────
  // isRejectedWithValue means fetchBaseQuery received a non-2xx HTTP response
  // and put the parsed JSON body in `payload.data` (RFC 7807 ProblemDetails).
  if (isRejectedWithValue(action)) {
    const data = (action.payload as { data?: ApiError } | undefined)?.data;
    const message =
      data?.detail ?? data?.title ?? "An error occurred during the request";
    toast.error(message, { richColors: true });
  }

  return next(action);
};
