import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/spotify";
import { clientIp, isSameOrigin, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// This token carries playback scopes for a real Spotify account, and the Web
// Playback SDK can only run with it in the browser. Nothing here makes handing
// it out safe — it narrows the blast radius to visitors who are actually
// loading the player on this origin.
const LIMIT = 30;
const WINDOW_MS = 5 * 60 * 1000;

export async function GET(request: Request) {
    if (!isSameOrigin(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!rateLimit(`spotify-token:${clientIp(request)}`, LIMIT, WINDOW_MS)) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429, headers: { "Retry-After": String(WINDOW_MS / 1000) } }
        );
    }

    try {
        const token = await getAccessToken();
        return NextResponse.json(
            { access_token: token.access_token, expires_in: token.expires_in },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Error getting access token:", error);
        return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
    }
}
