import type { MiddlewareAPI } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiToastMiddleware } from "./api-toast-middleware";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ─── Helpers that build properly shaped RTK action objects ────────────────────
// isFulfilled / isRejectedWithValue check action.meta.requestStatus, not the
// type string, so we must include it for the guards to fire.

function fulfilledAction(argType: "mutation" | "query", payload: unknown) {
  return {
    type: `api/execute${argType === "mutation" ? "Mutation" : "Query"}/fulfilled`,
    meta: {
      arg: { type: argType },
      requestStatus: "fulfilled",
      requestId: "test-id",
    },
    payload,
  };
}

function rejectedWithValueAction(payload: unknown) {
  return {
    type: "api/executeMutation/rejected",
    meta: {
      arg: { type: "mutation" },
      requestStatus: "rejected",
      rejectedWithValue: true,
      requestId: "test-id",
    },
    payload,
    error: { message: "Rejected" },
  };
}

function rejectedQueryAction(payload: unknown) {
  return {
    type: "api/executeQuery/rejected",
    meta: {
      arg: { type: "query" },
      requestStatus: "rejected",
      rejectedWithValue: true,
      requestId: "test-id",
    },
    payload,
    error: { message: "Rejected" },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("apiToastMiddleware", () => {
  let store: MiddlewareAPI;
  let next: (action: unknown) => unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let invoke: (action: any) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    store = { getState: vi.fn(() => ({})), dispatch: vi.fn() };
    next = vi.fn();
    invoke = (action) => apiToastMiddleware(store)(next)(action);
  });

  it("always forwards the action to next", () => {
    const action = { type: "SOME_ACTION" };
    invoke(action);
    expect(next).toHaveBeenCalledWith(action);
  });

  describe("mutation fulfilled", () => {
    it("shows a success toast with the payload message", () => {
      invoke(fulfilledAction("mutation", { message: "Project created" }));
      expect(toast.success).toHaveBeenCalledWith(
        "Project created",
        expect.any(Object),
      );
      expect(toast.success).toHaveBeenCalledTimes(1);
    });

    it('falls back to "Operation successful" when payload has no message', () => {
      invoke(fulfilledAction("mutation", {}));
      expect(toast.success).toHaveBeenCalledWith(
        "Operation successful",
        expect.any(Object),
      );
    });

    it("does NOT show a success toast for a fulfilled query", () => {
      invoke(fulfilledAction("query", {}));
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe("rejected with value (HTTP error from server)", () => {
    it("shows an error toast using ApiError.detail", () => {
      invoke(rejectedWithValueAction({ data: { detail: "Not found" } }));
      expect(toast.error).toHaveBeenCalledWith("Not found", expect.any(Object));
    });

    it("falls back to ApiError.title when detail is absent", () => {
      invoke(rejectedWithValueAction({ data: { title: "Bad Request" } }));
      expect(toast.error).toHaveBeenCalledWith(
        "Bad Request",
        expect.any(Object),
      );
    });

    it("falls back to the generic message when payload carries no ApiError", () => {
      invoke(rejectedWithValueAction({ status: 500 }));
      expect(toast.error).toHaveBeenCalledWith(
        "An error occurred during the request",
        expect.any(Object),
      );
    });

    it("shows an error toast for a rejected query too", () => {
      invoke(rejectedQueryAction({ data: { detail: "Fetch failed" } }));
      expect(toast.error).toHaveBeenCalledWith(
        "Fetch failed",
        expect.any(Object),
      );
    });
  });
});
