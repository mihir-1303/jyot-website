import { saveResearchTopic } from "../../lib/cms/research-topic-actions";

type Topic = { _id?: unknown; name?: string; slug?: string; description?: string; active?: boolean; displayOrder?: number };

export function ResearchTopicForm({ topic }: { topic?: Topic }) {
  return <form action={saveResearchTopic} className="mt-6 max-w-2xl space-y-5 border bg-white p-6">
    {Boolean(topic?._id) && <input type="hidden" name="id" value={String(topic?._id)} />}
    <label className="block text-sm font-bold">Name<input className="mt-1 block w-full border p-3 font-normal" name="name" defaultValue={String(topic?.name ?? "")} required /></label>
    <label className="block text-sm font-bold">Slug<input className="mt-1 block w-full border p-3 font-normal" name="slug" defaultValue={String(topic?.slug ?? "")} placeholder="Generated from name when blank" /></label>
    <label className="block text-sm font-bold">Description<textarea className="mt-1 block w-full border p-3 font-normal" name="description" defaultValue={String(topic?.description ?? "")} rows={3} /></label>
    <label className="block text-sm font-bold">Display order<input className="mt-1 block w-32 border p-3 font-normal" name="displayOrder" type="number" defaultValue={String(topic?.displayOrder ?? 0)} /></label>
    <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={topic?.active !== false} /> Active on public research navigation</label>
    <button className="bg-[var(--orange)] px-4 py-3 font-bold text-white" type="submit">Save topic</button>
  </form>;
}
