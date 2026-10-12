import { readFile as readLocalFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { BOOK_STATUSES, type Book, type BookStatus } from "@/types/library";
import { commitFiles, hasGitHub, readFile, type FileChange } from "@/lib/github";

const LIBRARY_PATH = "content/library.json";
const COVER_DIR = "public/library";

/** The only places a cover may be fetched from, so the route can't be aimed elsewhere. */
const COVER_HOSTS = ["covers.openlibrary.org", "m.media-amazon.com"];
const COVER_MAX_EDGE = 600;
const COVER_MAX_BYTES = 8_000_000;

export type Edit =
    | { op: "add"; title: string; author: string; series?: string; status: BookStatus; coverUrl: string }
    | { op: "status"; id: number; status: BookStatus }
    | { op: "remove"; id: number };

export interface SaveResult {
    books: Book[];
    /** What was (or, in a dry run, would have been) committed. */
    commit: { message: string; files: string[]; sha?: string };
    dryRun: boolean;
}

/** A problem with what the editor sent, safe to show back to them. */
export class EditError extends Error {}

const isStatus = (value: unknown): value is BookStatus =>
    BOOK_STATUSES.includes(value as BookStatus);

function text(value: unknown, field: string, max: number, required = true): string {
    const clean = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
    if (!clean && required) throw new EditError(`${field} is required.`);
    if (clean.length > max) throw new EditError(`${field} is too long.`);
    return clean;
}

/** Checks an untrusted request body and narrows it to an Edit. */
export function parseEdit(body: unknown): Edit {
    const input = (body ?? {}) as Record<string, unknown>;

    if (input.op === "add") {
        if (!isStatus(input.status)) throw new EditError("Pick a status.");
        return {
            op: "add",
            title: text(input.title, "Title", 200),
            author: text(input.author, "Author", 120),
            series: text(input.series, "Series", 120, false) || undefined,
            status: input.status,
            coverUrl: text(input.coverUrl, "Cover", 500),
        };
    }

    if (input.op === "status" || input.op === "remove") {
        if (!Number.isInteger(input.id)) throw new EditError("Unknown book.");
        const id = input.id as number;
        if (input.op === "remove") return { op: "remove", id };
        if (!isStatus(input.status)) throw new EditError("Pick a status.");
        return { op: "status", id, status: input.status };
    }

    throw new EditError("Unknown edit.");
}

/**
 * The shelf as it stands on the deploy branch, which can be ahead of the copy
 * this deployment was built with. Without a token (local development) it is
 * the file on disk.
 */
export async function readBooks(): Promise<Book[]> {
    const json = hasGitHub()
        ? await readFile(LIBRARY_PATH)
        : await readLocalFile(join(process.cwd(), LIBRARY_PATH), "utf8");
    return JSON.parse(json) as Book[];
}

const slug = (title: string) =>
    title.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Downloads a cover from an allowed host and returns it as a small, metadata-free JPEG. */
async function fetchCover(url: string): Promise<Buffer> {
    let source: URL;
    try {
        source = new URL(url);
    } catch {
        throw new EditError("That cover link isn't valid.");
    }
    if (source.protocol !== "https:" || !COVER_HOSTS.includes(source.hostname)) {
        throw new EditError("Covers can only come from the search results.");
    }

    try {
        const response = await fetch(source, { signal: AbortSignal.timeout(20_000), cache: "no-store" });
        if (!response.ok) throw new Error(`status ${response.status}`);

        const original = Buffer.from(await response.arrayBuffer());
        if (original.length > COVER_MAX_BYTES) throw new Error("too large");

        const image = sharp(original).rotate();
        const { width = 0, height = 0 } = await image.metadata();
        // Hosts answer a missing cover with a 1px placeholder rather than an error.
        if (width < 100 || height < 100) throw new Error("placeholder image");

        return await image
            .resize({ width: COVER_MAX_EDGE, height: COVER_MAX_EDGE, fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 82 })
            .toBuffer();
    } catch (error) {
        console.error("Cover download failed:", url, error);
        throw new EditError("That cover wouldn't download. Pick another one.");
    }
}

/** Works out the new shelf and the files to commit for one edit. */
async function plan(books: Book[], edit: Edit): Promise<{ books: Book[]; message: string; changes: FileChange[] }> {
    if (edit.op === "add") {
        const duplicate = books.some((b) => b.title.toLowerCase() === edit.title.toLowerCase());
        if (duplicate) throw new EditError(`"${edit.title}" is already on the shelf.`);

        const id = Math.max(0, ...books.map((b) => b.id)) + 1;
        const file = `${slug(edit.title) || "book"}-${id}.jpg`;
        const cover = await fetchCover(edit.coverUrl);
        const book: Book = {
            id,
            title: edit.title,
            author: edit.author,
            ...(edit.series ? { series: edit.series } : {}),
            coverUrl: `/library/${file}`,
            status: edit.status,
            buyLink: `https://www.amazon.in/s?k=${encodeURIComponent(`${edit.title} ${edit.author}`)}`,
        };
        return {
            books: [...books, book],
            message: `chore(library): add "${edit.title}"`,
            changes: [{ path: `${COVER_DIR}/${file}`, data: cover }],
        };
    }

    const book = books.find((b) => b.id === edit.id);
    if (!book) throw new EditError("That book is no longer on the shelf.");

    if (edit.op === "remove") {
        const local = book.coverUrl.startsWith("/library/");
        return {
            books: books.filter((b) => b !== book),
            message: `chore(library): remove "${book.title}"`,
            changes: local ? [{ path: `public${book.coverUrl}`, data: null }] : [],
        };
    }

    if (book.status === edit.status) throw new EditError("It already has that status.");
    return {
        books: books.map((b) => (b === book ? { ...b, status: edit.status } : b)),
        message: `chore(library): mark "${book.title}" as ${edit.status}`,
        changes: [],
    };
}

/** Applies one edit to the shelf and commits it, which is what publishes it. */
export async function saveEdit(edit: Edit): Promise<SaveResult> {
    const planned = await plan(await readBooks(), edit);
    const changes: FileChange[] = [
        ...planned.changes,
        { path: LIBRARY_PATH, data: `${JSON.stringify(planned.books, null, 2)}\n` },
    ];
    const commit = { message: planned.message, files: changes.map((c) => (c.data === null ? `${c.path} (deleted)` : c.path)) };

    if (!hasGitHub()) return { books: planned.books, commit, dryRun: true };

    const sha = await commitFiles(planned.message, changes);
    return { books: planned.books, commit: { ...commit, sha }, dryRun: false };
}
