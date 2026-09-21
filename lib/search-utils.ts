export function normalizeQuery(value: unknown) { return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, 100); }
