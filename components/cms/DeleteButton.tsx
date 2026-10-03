"use client";

import { useRef, useState } from "react";
import { ConfirmationModal } from "./ConfirmationModal";

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  const [open, setOpen] = useState(false); const allowSubmit = useRef(false); const formRef = useRef<HTMLFormElement>(null);
  const confirm = () => { setOpen(false); allowSubmit.current = true; formRef.current?.requestSubmit(); };
  return <><form ref={formRef} action={action} onSubmit={(event) => { if (!allowSubmit.current) { event.preventDefault(); setOpen(true); } allowSubmit.current = false; }}><button className="text-red-700" type="submit">Delete</button></form><ConfirmationModal open={open} title="Delete this item?" message="This cannot be undone." confirmLabel="Delete" danger onClose={() => setOpen(false)} onConfirm={confirm} /></>;
}
