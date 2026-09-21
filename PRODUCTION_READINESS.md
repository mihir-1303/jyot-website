# Production readiness notes

## Rate limiting

No rate-limiting dependency is installed. Before production exposure, apply edge/WAF rate limits (Cloudflare is already part of the media architecture) to Auth.js login, media upload, and `/search`. Public page requests should be protected by the hosting/CDN layer. A shared distributed limiter is preferable once multiple application instances are deployed.

## Backups and recovery

MongoDB Atlas backups must be enabled and periodically restore-tested by the deployment owner. R2 versioning/retention or an equivalent object backup policy should be enabled if media recovery is required. MongoDB references and R2 objects are not one transaction: deletion/upload failure windows require operational reconciliation. Store environment secrets in the deployment secret manager and retain a documented recovery/rotation procedure. No backups are configured or claimed by this repository.
