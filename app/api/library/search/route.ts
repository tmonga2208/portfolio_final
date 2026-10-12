import { NextResponse } from "next/server";
import { isEditor } from "@/lib/library-auth";

interface Candidate {
    title: string;
    author: string;
    coverUrl: string;
}

interface OpenLibrarySearch {
    docs?: { title?: string; author_name?: string[]; cover_i?: number; isbn?: string[] }[];
}

const WORKS = 5;
/** Editions tried per work. Amazon has no scan for many, and the editor hides those. */
const EDITIONS = 5;

/**
 * Cover candidates for a title. Open Library identifies the book and its
 * editions; each edition's ISBN also names a scan on Amazon's image server,
 * which is usually the sharper of the two.
 */
export async function GET(request: Request) {
    if (!(await isEditor())) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

    const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 150) ?? "";
    if (query.length < 2) return NextResponse.json({ results: [] });

    let data: OpenLibrarySearch;
    try {
        const response = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${WORKS}&fields=title,author_name,cover_i,isbn`,
            { signal: AbortSignal.timeout(15_000), cache: "no-store" }
        );
        if (!response.ok) throw new Error(`Open Library answered ${response.status}`);
        data = await response.json();
    } catch (error) {
        console.error("Error searching books:", error);
        return NextResponse.json({ error: "Book search is down right now. Try again in a minute." }, { status: 502 });
    }

    const results: Candidate[] = (data.docs ?? []).flatMap((doc) => {
        if (!doc.title) return [];
        const book = { title: doc.title, author: doc.author_name?.join(", ") ?? "" };
        const isbn10s = (doc.isbn ?? []).filter((isbn) => isbn.length === 10).slice(0, EDITIONS);

        return [
            ...isbn10s.map((isbn) => ({ ...book, coverUrl: `https://m.media-amazon.com/images/P/${isbn}.01.L.jpg` })),
            ...(doc.cover_i ? [{ ...book, coverUrl: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` }] : []),
        ];
    });

    return NextResponse.json({ results });
}
