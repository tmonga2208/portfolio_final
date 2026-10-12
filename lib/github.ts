const REPO = process.env.GITHUB_REPO ?? "tmonga2208/portfolio_final";
// Production deploys from main, so that is where an edit has to land to go live.
const BRANCH = process.env.LIBRARY_BRANCH ?? "main";

export interface FileChange {
    path: string;
    /** New contents, or null to delete the file. */
    data: Buffer | string | null;
}

export const hasGitHub = () => Boolean(process.env.GITHUB_TOKEN);

async function github<T>(path: string, init: RequestInit & { raw?: boolean } = {}): Promise<T> {
    const response = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: init.raw ? "application/vnd.github.raw+json" : "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            ...(init.body ? { "Content-Type": "application/json" } : {}),
        },
    });

    if (!response.ok) {
        throw new Error(`GitHub ${init.method ?? "GET"} ${path} failed: ${response.status}`);
    }
    return (init.raw ? response.text() : response.json()) as Promise<T>;
}

const post = <T>(path: string, body: unknown, method = "POST") =>
    github<T>(path, { method, body: JSON.stringify(body) });

/** A text file as it currently stands on the deploy branch. */
export function readFile(path: string): Promise<string> {
    return github<string>(`/contents/${path}?ref=${BRANCH}`, { raw: true });
}

/**
 * Writes every change as a single commit, so a new book and its cover trigger
 * one deploy rather than two. The branch update is not forced: if someone
 * pushed in the meantime GitHub refuses, and the caller retries from scratch.
 */
export async function commitFiles(message: string, changes: FileChange[]): Promise<string> {
    const ref = await github<{ object: { sha: string } }>(`/git/ref/heads/${BRANCH}`);
    const parent = ref.object.sha;
    const head = await github<{ tree: { sha: string } }>(`/git/commits/${parent}`);

    const entries = await Promise.all(
        changes.map(async ({ path, data }) => {
            const entry = { path, mode: "100644", type: "blob" };
            if (data === null) return { ...entry, sha: null };
            if (typeof data === "string") return { ...entry, content: data };

            const blob = await post<{ sha: string }>("/git/blobs", {
                content: data.toString("base64"),
                encoding: "base64",
            });
            return { ...entry, sha: blob.sha };
        })
    );

    const tree = await post<{ sha: string }>("/git/trees", { base_tree: head.tree.sha, tree: entries });
    const commit = await post<{ sha: string }>("/git/commits", {
        message,
        tree: tree.sha,
        parents: [parent],
    });
    await post(`/git/refs/heads/${BRANCH}`, { sha: commit.sha }, "PATCH");

    return commit.sha;
}
