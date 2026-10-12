import { NextResponse } from "next/server";
import { isEditor } from "@/lib/library-auth";
import { EditError, parseEdit, readBooks, saveEdit } from "@/lib/library-edit";
import { isSameOrigin } from "@/lib/rate-limit";

const unauthorized = () => NextResponse.json({ error: "Not logged in." }, { status: 401 });

/** The shelf as it stands in the repo, which may be ahead of the deployed site. */
export async function GET() {
    if (!(await isEditor())) return unauthorized();

    try {
        return NextResponse.json({ books: await readBooks() });
    } catch (error) {
        console.error("Error reading library:", error);
        return NextResponse.json({ error: "Couldn't load the shelf from GitHub." }, { status: 502 });
    }
}

/** Add a book, change a status or remove a book. Each call is one commit. */
export async function POST(request: Request) {
    if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!(await isEditor())) return unauthorized();

    try {
        const edit = parseEdit(await request.json().catch(() => null));
        return NextResponse.json(await saveEdit(edit));
    } catch (error) {
        if (error instanceof EditError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error("Error saving library:", error);
        return NextResponse.json({ error: "Couldn't save to GitHub. Nothing was changed; try again." }, { status: 502 });
    }
}
