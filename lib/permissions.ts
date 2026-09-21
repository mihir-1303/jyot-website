import "server-only";
import { getCurrentUser, isLocalCmsBypassEnabled, localCmsUser } from "./auth";
import { connectToDatabase } from "./db/mongodb";
import { User } from "./db/models";
import type { Permission, PermissionOverride, Role } from "./types/domain";
import { hasRolePermission } from "./rbac/policy";

export const hasPermission = hasRolePermission;
async function effectiveUser() { const sessionUser = await getCurrentUser(); if (!sessionUser) return null; if (isLocalCmsBypassEnabled) return { ...localCmsUser, permissionOverrides: [] as PermissionOverride[] }; await connectToDatabase(); const user = await User.findById(sessionUser.id).select("name email role permissionOverrides disabledAt").lean() as unknown as { _id: unknown; name?: string; email?: string; role: Role; permissionOverrides?: PermissionOverride[]; disabledAt?: Date } | null; if (!user || user.disabledAt) return null; return { id: String(user._id), name: user.name, email: user.email, role: user.role, permissionOverrides: user.permissionOverrides ?? [] }; }
export async function requirePermission(permission: Permission) { const user = await effectiveUser(); if (!user || !hasPermission(user.role, permission, user.permissionOverrides)) throw new Error("Forbidden"); return user; }
export async function canEditOwn(permission: Permission, ownerId: string) { const user = await effectiveUser(); return Boolean(user && user.id === ownerId && hasPermission(user.role, permission, user.permissionOverrides)); }
