import { redirect } from "next/navigation";
export default async function EditVideoRedirect({ params }: { params: Promise<{ id: string }> }) { redirect(`/admin/videos/${(await params).id}/edit`); }
