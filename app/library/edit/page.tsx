import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { LibraryEditor, LibraryLogin } from "@/components/library/editor";
import { editorConfigured, isEditor } from "@/lib/library-auth";

export const metadata: Metadata = {
    title: "Edit library",
    robots: { index: false, follow: false },
};

// Never prerender: what this page shows depends on the visitor's cookie.
export const dynamic = "force-dynamic";

/** The private side of the library. Everything it can do is re-checked by the API. */
export default async function LibraryEditPage() {
    const authed = await isEditor();

    return (
        <>
            <SiteNav />
            <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 md:px-8">
                {authed ? <LibraryEditor /> : <LibraryLogin configured={editorConfigured()} />}
            </main>
        </>
    );
}
