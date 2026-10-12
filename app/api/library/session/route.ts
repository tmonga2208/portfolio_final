import { NextResponse } from "next/server";
import { endSession, passwordMatches, startSession } from "@/lib/library-auth";
import { clientIp, isSameOrigin, rateLimit } from "@/lib/rate-limit";

const ATTEMPTS = 5;
const WINDOW_MS = 15 * 60_000;

/** Log in to the library editor. */
export async function POST(request: Request) {
    if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!rateLimit(`library-login:${clientIp(request)}`, ATTEMPTS, WINDOW_MS)) {
        return NextResponse.json({ error: "Too many attempts. Try again in a while." }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const attempt = typeof body?.password === "string" ? body.password : "";
    if (!passwordMatches(attempt)) {
        return NextResponse.json({ error: "Wrong password." }, { status: 401 });
    }

    await startSession();
    return NextResponse.json({ ok: true });
}

/** Log out. */
export async function DELETE() {
    await endSession();
    return NextResponse.json({ ok: true });
}
