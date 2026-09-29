"use client";

import { ContentForm } from "./ContentForm";

type Option = { id: string; name: string };
type Props = { action: (formData: FormData) => Promise<unknown>; value?: Record<string, unknown>; options?: { authors: Option[]; categories: Option[]; tags: Option[] } };

export function VideoForm(props: Props) { return <ContentForm {...props} kind="video" />; }
