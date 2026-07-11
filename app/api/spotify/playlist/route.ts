import { NextResponse } from "next/server";
import { getPlaylist } from "@/lib/spotify";

const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID || "5zm54nM2Y2gEGS3VeWF3vY";

export async function GET() {
    try {
        const playlist = await getPlaylist(PLAYLIST_ID);

        if (!playlist) {
            return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
        }

        return NextResponse.json(playlist);
    } catch (error) {
        console.error("Error fetching playlist:", error);
        return NextResponse.json({ error: "Failed to fetch playlist" }, { status: 500 });
    }
}
