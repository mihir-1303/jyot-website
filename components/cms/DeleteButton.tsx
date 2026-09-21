"use client";

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  return <form action={action} onSubmit={(event) => { if (!window.confirm("Delete this item? This cannot be undone.")) event.preventDefault(); }}><button className="text-red-700" type="submit">Delete</button></form>;
}
