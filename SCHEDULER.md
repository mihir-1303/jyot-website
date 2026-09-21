# Scheduled publishing

Set `SCHEDULER_SECRET` in the deployment secret manager. Configure the platform cron or an external scheduler to send `POST /api/internal/publish-scheduled` with `Authorization: Bearer <secret>`.

Each invocation processes at most 25 ready records per content type. Publication is an atomic `scheduled` to `published` transition, so retries and overlapping invocations are safe. Failed records remain scheduled for retry. The repository does not run a scheduler automatically until deployment cron is configured.
