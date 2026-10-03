import "server-only";

const fallback = "/admin/dashboard";

export function getSafeAdminRedirect(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/admin/") || value.startsWith("//") || value === "/admin/login") return fallback;
  return value;
}
