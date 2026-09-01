# Day 10 — Ops wrap-up

**Goal:** Auto-stop EC2, nightly DB dumps, cost/budget proof, architecture + teardown docs. No new product features.

Canonical guide (Ram + shared): **[`../Backend/docs/DAY10_EC2.md`](../Backend/docs/DAY10_EC2.md)**  
Tick-box: **[`wrapup-checklist.md`](./wrapup-checklist.md)**

**Stop when:** Lambda schedule + backup path are documented/runnable, and report artifacts (architecture, cost, teardown) exist. Teardown **execution** waits for the course.

---

## Quick links

| Artifact | Path |
|---|---|
| Day 10 EC2 checklist | `Backend/docs/DAY10_EC2.md` |
| Lambda stop/start | `Backend/infra/lambda/ec2-schedule/` |
| `pg_dump` / restore | `Backend/infra/scripts/11-*.sh`, `12-*.sh` |
| Architecture | `Backend/docs/ARCHITECTURE.md` |
| Cost report | `Backend/docs/COST_REPORT.md` |
| Budget proof | `Backend/docs/BUDGET_PROOF.md` |
| Teardown | `Backend/docs/TEARDOWN.md` |
| RUNBOOK | `Backend/docs/RUNBOOK.md` |

---

## Sahil notes

1. Confirm admin still works after a stop/start cycle (`https://app.…`)
2. Keep a local copy of the latest admin `dist/` zip (`npm run package:admin`)
3. Help fill cost/budget tables; do not commit AWS account screenshots with secrets
4. Optional Lighthouse score from Day 9 goes in the Week 2 report, not a blocker here

---

## Verify

- [ ] Manual Lambda invoke stop → start once
- [ ] One `pg_dump` succeeded (S3 optional but preferred)
- [ ] Architecture + cost + teardown docs filled/linked
- [ ] RUNBOOK Day 10 section usable at 11PM panic time
