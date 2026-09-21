import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db/mongodb";
import { User } from "./db/models";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [Credentials({ credentials: { email: {}, password: {} }, async authorize(credentials) { const email = String(credentials?.email ?? "").trim().toLowerCase(); const password = String(credentials?.password ?? ""); if (!email || !password) return null; await connectToDatabase(); const user = await User.findOne({ email, disabledAt: { $exists: false } }).select("name email passwordHash role permissionOverrides").lean() as unknown as { _id: unknown; name: string; email: string; passwordHash?: string; role: string } | null; if (!user || typeof user.passwordHash !== "string" || !(await bcrypt.compare(password, user.passwordHash))) return null; return { id: String(user._id), name: user.name, email: user.email, role: user.role }; } })],
  callbacks: { jwt({ token, user }) { if (user) { token.sub = user.id; token.role = (user as { role?: string }).role; } return token; }, session({ session, token }) { if (session.user) { session.user.id = token.sub ?? ""; session.user.role = token.role as string; } return session; } },
});

export const isLocalCmsBypassEnabled = process.env.NODE_ENV === "development" && process.env.CMS_LOCAL_DEV_BYPASS !== "false";
export const localCmsUser = { id: "000000000000000000000001", name: "Local CMS Developer", email: "local-cms@localhost", role: "ADMIN" as const };
export async function getCurrentUser() { if (isLocalCmsBypassEnabled) return localCmsUser; const session = await auth(); return session?.user ?? null; }
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");
  if (isLocalCmsBypassEnabled) return user;
  await connectToDatabase();
  const activeUser = await User.exists({ _id: user.id, disabledAt: { $exists: false } });
  if (!activeUser) throw new Error("Unauthorized");
  return user;
}
