import { NextResponse } from "next/server";
import { publishScheduledContent } from "../../../../lib/cms/scheduler";
export async function POST(request: Request) { const secret = process.env.SCHEDULER_SECRET; const authorization = request.headers.get("authorization"); if (!secret || authorization !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { return NextResponse.json(await publishScheduledContent()); } catch { return NextResponse.json({ error: "Scheduler unavailable" }, { status: 503 }); } }
