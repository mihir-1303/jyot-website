export function localDateTimeToUtc(value: string, timeZone: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("A valid scheduled date and time are required.");
  const [date, time] = value.split("T"); const [year, month, day] = date.split("-").map(Number); const [hour, minute] = time.split(":").map(Number); const guess = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const parts = Object.fromEntries(formatter.formatToParts(new Date(guess)).filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute); const result = new Date(guess - (represented - guess)); if (Number.isNaN(result.getTime())) throw new Error("Invalid timezone."); return result;
}
export function validateFutureSchedule(value: Date, now = new Date()) { if (!(value instanceof Date) || Number.isNaN(value.getTime()) || value <= now) throw new Error("Scheduled publication must be in the future."); return value; }
