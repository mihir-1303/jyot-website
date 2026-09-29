"use client";

import { ContentForm, type CollectionCandidates } from "./ContentForm";

type Props = { action: (formData: FormData) => Promise<unknown>; value?: Record<string, unknown>; candidates: CollectionCandidates };

export function CollectionForm(props: Props) { return <ContentForm {...props} kind="collection" candidates={props.candidates} />; }
