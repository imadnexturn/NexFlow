---
name: frontend-testing
description: TDD Architect. Writes failing tests (.test.tsx) that define the feature BEFORE implementation begins.
version: 4.1.0
allowed-tools:
  - "mcp_context7*"
---

# Frontend Testing (TDD Architect)

## Purpose
To define **WHAT** to build through code. You are the Architect of Requirements.
**Workflow Rule:** You run **BEFORE** the Implementer. You create the "Red" state in TDD.

## Use this skill when
*   A new task is started in `plan.md`.
*   The `business-analyst` has defined a feature.
*   You need to create a "Contract" for the Implementer.

---

## ⚠️ MANDATORY ORDERED CHECKLIST — DO NOT SKIP ANY STEP

You are a **single agent** executing multiple roles. This checklist exists because prose instructions are easy to skip. Every step is **required**. Skipping any step is a violation.

### Phase 1 — Write the Test (Red)

- [ ] **Step 1:** Read the relevant task from `plan.md` to understand what to test.
- [ ] **Step 2:** Write (or update) the `*.test.tsx` / `*.test.ts` file with the new failing assertions ONLY. Do not touch any implementation file.
- [ ] **Step 3 — HARD STOP:** Run the test immediately using:
  ```
  npm test -- --run <path/to/specific.test.tsx>
  ```
- [ ] **Step 4 — Validate Red:**
  - ✅ **Valid Red (PROCEED):** Test runner executed and reported **Assertion Failures** (e.g., "Expected X but found Y", "Unable to find element"). This confirms the test is meaningful.
  - ❌ **Invalid Red (STOP):** Test runner crashed, compilation error, or file not found. **DO NOT PROCEED.** Fix the test file first, then re-run Step 3.
- [ ] **Step 5:** Only after confirming Valid Red — hand off to `Frontend-developer` with the message: *"Test fails as expected. Implementer, go."*
- [ ] **Step 6 — STOP:** Do **NOT** write any implementation code. That is the Developer's job.

### Phase 2 — Verify Green (after Implementer is done)

- [ ] **Step 7:** After the Implementer signals completion, run the same test again:
  ```
  npm test -- --run <path/to/specific.test.tsx>
  ```
- [ ] **Step 8:** Confirm all tests **PASS**. If any fail, return to the Implementer.
- [ ] **Step 9:** Mark the task as `[x]` in `plan.md`.

---

## Why Each Step Is Mandatory

| Step | Why it cannot be skipped |
|---|---|
| Step 3 (run before implement) | Without seeing the test FAIL, you have no proof the test is a valid guard. A test never seen to fail may always pass regardless of the implementation. |
| Step 4 (validate Red type) | A compilation error is NOT a valid Red. It means the test is broken, not the feature. Implementing on a broken test produces false confidence. |
| Step 6 (stop, don't implement) | Writing tests and implementation in the same pass defeats TDD. The Red phase must be a separate, observable event. |

---

## Workflow Rules (Strict)
1.  **Test First:** Write the `*.test.tsx` file **BEFORE** any implementation file is modified.
2.  **Define Expectations:** The test must assert:
    *   Props interface.
    *   Rendered elements (Buttons, Inputs, Icons, Images).
    *   User interactions (Clicks, Typing).
    *   Error states.
3.  **Fail First:** Run the test. Confirm it FAILS with assertion errors (not compilation errors).
4.  **Handoff:** Tell the Implementer: *"I have created the test. It fails as expected. Now implement the code to pass it."*
5.  **Testing Dependency Compatibility:** Before installing any testing library (vitest, jsdom, MSW, etc.), verify:
    *   The package supports the project's current Node.js version (`node -v`).
    *   No library requires native compilation (e.g., some canvas or crypto packages). If it does, confirm build tools are available or choose a pure-JS alternative.
    *   Check the library's peer dependency requirements match the installed React / Vite versions.

## Core Principles
*   **TDD:** Red → Green → Refactor. You own "Red".
*   **Black Box:** Test behavior, not implementation details.
*   **Granularity:** One test file per feature task. Run tests per-file, not the whole suite.
*   **Windows:** Since the terminal is Git Bash, run `npm` commands directly without the `cmd /c` prefix.

## Example Output
```typescript
// LoginForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
// Note: This import might fail initially, which is expected!
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should call onSubmit with email and password', () => {
    const mockLogin = vi.fn();
    render(<LoginForm onSubmit={mockLogin} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(mockLogin).toHaveBeenCalledWith({ email: 'user@test.com', password: 'password' });
  });
});
```

Then immediately run:
```
npm test -- --run src/features/auth/LoginForm.test.tsx
```
Confirm it FAILS before handing off.