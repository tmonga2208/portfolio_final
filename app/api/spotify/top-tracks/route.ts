import { NextResponse } from "next/server";
import { getTopTracks } from "@/lib/spotify";

export const dynamic = "force-dynamic";

// Top tracks move slowly: let the CDN hold the answer for an hour, so visits
// don't each cost a Spotify call.
const CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET() {
    try {
        const tracks = await getTopTracks();
        return NextResponse.json({ tracks }, { headers: { "Cache-Control": CACHE } });
    } catch (error) {
        console.error("Error fetching top tracks:", error);
        return NextResponse.json({ tracks: [] }, { status: 500 });
    }
}
