import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/spotify";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        const nowPlaying = await getNowPlaying();

        if (!nowPlaying) {
            return NextResponse.json({ isPlaying: false });
        }

        return NextResponse.json(nowPlaying);
    } catch (error) {
        console.error("Error fetching now playing:", error);
        return NextResponse.json({ isPlaying: false }, { status: 500 });
    }
}
