# Local CMS access

During `next dev`, CMS authentication is bypassed centrally in `lib/auth.ts` and `lib/permissions.ts` using a non-persistent local ADMIN actor. Set `CMS_LOCAL_DEV_BYPASS=false` to disable it.

This bypass is active only when `NODE_ENV=development`; production builds continue to use the existing Auth.js and database-backed RBAC checks. The Auth.js configuration, User model, roles, permissions, ownership checks, and password-provisioning command remain available for later re-enablement.

Open `http://localhost:3000/admin` or `http://localhost:3000/admin/dashboard` after starting the development server.
