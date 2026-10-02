/**
 * A trip with a written story. Each one is a file, content/travel/<slug>.mdx:
 * these fields as the header, then the story itself.
 */
export interface Trip {
    /** From the file name; the story lives at /travel/<slug>. */
    slug: string;
    title: string;
    subtitle: string;
    location: string;
    /** Where the pin goes on the travel map. */
    coords: { lat: number; lng: number };
    /** Month of the trip, as YYYY-MM. */
    when: string;
    /** Who came along, for the line above the title ("with Di"). */
    with?: string;
    /** The big photo at the top of the story; also its link preview. */
    cover: string;
    /** Up to three photos for the polaroid pile, back to front: the last is the top print. */
    pile: string[];
    /** Place for the handwritten note on the polaroid, when the location's first part is too long. */
    notePlace?: string;
    /** Which side of its pin the map label sits, when the default would collide. */
    mapLabelSide?: "left" | "right";
}

/** "2026-08" → "Aug 2026". */
export function tripMonth(when: string) {
    const [year, month] = when.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1)).toLocaleString("en", { month: "short", year: "numeric", timeZone: "UTC" });
}

/** "2026-08" → "Aug '26", the way you'd scribble it on a print. */
export function scribbledMonth(when: string) {
    const [year, month] = when.split("-").map(Number);
    const name = new Date(Date.UTC(year, month - 1)).toLocaleString("en", { month: "short", timeZone: "UTC" });
    return `${name} '${String(year).slice(2)}`;
}
