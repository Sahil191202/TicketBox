# Day 10 checklist — wrap-up

Checkpoint: **auto-stop + backup path work**, and **report docs** (architecture, cost, teardown) are ready.

## Auto-stop / start

- [ ] Lambda deployed from `Backend/infra/lambda/ec2-schedule/`
- [ ] `INSTANCE_IDS` set correctly
- [ ] EventBridge stop + start rules created (times match course)
- [ ] Manual test: stop then start
- [ ] Elastic IP still associated after stop
- [ ] After start: `pm2 status` OK + `https://yourdomain.com` loads

## Backups

- [ ] `/var/backups/ticketbox` exists and is writable
- [ ] `11-pg-dump-backup.sh` produced a `.dump` file
- [ ] Optional: object visible under `BACKUP_S3_URI`
- [ ] Cron installed (or documented why manual for demo week)
- [ ] Optional restore drill with `12-restore-from-dump.sh` on a safe target

## Report pack

- [ ] `ARCHITECTURE.md` reviewed / exported if needed
- [ ] `COST_REPORT.md` numbers filled
- [ ] `BUDGET_PROOF.md` screenshots captured (off-repo OK)
- [ ] `TEARDOWN.md` read — execution only when course says so
- [ ] `RUNBOOK.md` Day 10 section makes sense to both partners

## Stop here

Week 2 coding track ends at Day 10 wrap-up. Do not invent Day 11 features. Submit / teardown per PRD calendar.
