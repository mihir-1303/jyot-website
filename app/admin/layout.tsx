import { AdminShell } from "../../components/cms/AdminShell";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <AdminShell>{children}</AdminShell>; }
