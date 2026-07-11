import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const token = await getAccessToken();
        return NextResponse.json({ access_token: token.access_token });
    } catch (error) {
        console.error("Error getting access token:", error);
        return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
    }
}
