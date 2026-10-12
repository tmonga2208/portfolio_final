import data from "@/content/library.json";

export const BOOK_STATUSES = ["reading", "read", "chose not to finish"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export interface Book {
    id: number;
    title: string;
    author: string;
    /** The series it belongs to; books sharing one sit on the same shelf. */
    series?: string;
    coverUrl: string;
    status: BookStatus | "";
    rating?: number;
    buyLink?: string;
}

/**
 * The shelf lives in content/library.json so the editor at /library/edit can
 * rewrite it; this is the copy the site was built with.
 */
export const books = data as Book[];
