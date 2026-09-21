import type { Permission, PermissionOverride, Role } from "../types/domain";

const allPermissions: Set<Permission> = new Set([
  "articles.create", "articles.read", "articles.editOwn", "articles.editAll", "articles.publish", "articles.delete",
  "videos.create", "videos.read", "videos.editOwn", "videos.editAll", "videos.publish", "videos.delete",
  "research.create", "research.read", "research.editOwn", "research.editAll", "research.publish", "research.delete",
  "collections.create", "collections.read", "collections.edit", "collections.publish", "collections.delete",
  "media.upload", "media.read", "media.editMetadata", "media.delete",
  "homepage.view", "homepage.edit", "homepage.publish",
  "authors.create", "authors.read", "authors.edit", "authors.delete",
  "categories.create", "categories.read", "categories.edit", "categories.delete",
  "tags.create", "tags.read", "tags.edit", "tags.delete",
  "users.read", "users.create", "users.edit", "users.disable", "users.delete",
  "roles.read", "roles.create", "roles.edit", "roles.delete",
  "settings.read", "settings.edit",
]);

export const roleDefaultPermissions: Record<Role, ReadonlySet<Permission>> = {
  ADMIN: allPermissions,
  EDITOR: new Set([...allPermissions].filter((permission) => !permission.startsWith("users.") && !permission.startsWith("roles.") && !permission.startsWith("settings."))),
  AUTHOR: new Set(["articles.create", "articles.read", "articles.editOwn", "videos.create", "videos.read", "videos.editOwn", "research.create", "research.read", "research.editOwn", "media.upload", "media.read"]),
  VIEWER: new Set(["articles.read", "videos.read", "research.read", "media.read"]),
  CONTRIBUTOR: new Set(["articles.read", "videos.read", "research.read", "media.read"]),
};

export function hasRolePermission(role: Role, permission: Permission, overrides: PermissionOverride[] = []) {
  const override = overrides.find((item) => item.permission === permission);
  return override ? override.allowed : roleDefaultPermissions[role]?.has(permission) ?? false;
}
