# Engineering Backlog

This backlog collects cross-cutting or future action items that emerge from reviews and planning.

Routing guidance:

- Use this file for non-urgent optimizations, refactors, or follow-ups that span multiple stories/epics.
- Must-fix items to ship a story belong in that story’s `Tasks / Subtasks`.
- Same-epic improvements may also be captured under the epic Tech Spec `Post-Review Follow-ups` section.

| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ | ----- |
| 2025-11-28 | 1.2 | 1 | Enhancement | Medium | TBD | Open | Enhance CI/CD to confirm local execution readiness of frontend. [file: .github/workflows/main.yml] |
| 2025-11-28 | 1.2 | 1 | Enhancement | Medium | TBD | Open | Enhance CI/CD to confirm local execution readiness of backend. [file: .github/workflows/main.yml] |
| 2025-11-28 | 1.2 | 1 | Enhancement | Low | TBD | Open | Reconsider ignoring backend health check test. [file: .github/workflows/main.yml] |
| fredag 28. november 2025 | 1.3 | 1 | Bug | Medium | TBD | Open | Add RLS integration test for `profiles` table (AC #3). [file: `backend/tests/test_supabase.py`] |