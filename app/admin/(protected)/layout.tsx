import { redirect } from "next/navigation";
import { requireAuth } from "../../../lib/auth";

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  try {
    await requireAuth();
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") redirect("/admin/login");
    throw error;
  }
  return children;
}
