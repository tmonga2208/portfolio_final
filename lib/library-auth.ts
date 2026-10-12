import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "library_session";
const SESSION_DAYS = 30;

const password = () => process.env.LIBRARY_PASSWORD ?? "";

/**
 * The editor only opens when there is a password to check and somewhere to
 * save. Development may run without a GitHub token: saves become dry runs.
 */
export function editorConfigured(): boolean {
    if (!password()) return false;
    return Boolean(process.env.GITHUB_TOKEN) || process.env.NODE_ENV !== "production";
}

function safeEqual(a: string, b: string): boolean {
    // Hash first so both sides are the same length, as timingSafeEqual requires.
    const hash = (value: string) => createHash("sha256").update(value).digest();
    return timingSafeEqual(hash(a), hash(b));
}

export function passwordMatches(attempt: string): boolean {
    return editorConfigured() && safeEqual(attempt, password());
}

/** Signed with the password itself, so changing it logs every device out. */
function sign(expires: string): string {
    return createHmac("sha256", password()).update(`library:${expires}`).digest("hex");
}

export async function startSession(): Promise<void> {
    const expires = String(Date.now() + SESSION_DAYS * 86_400_000);
    (await cookies()).set(SESSION_COOKIE, `${expires}.${sign(expires)}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_DAYS * 86_400,
    });
}

export async function endSession(): Promise<void> {
    (await cookies()).delete(SESSION_COOKIE);
}

/** True only for a request carrying an unexpired cookie this server signed. */
export async function isEditor(): Promise<boolean> {
    if (!editorConfigured()) return false;

    const value = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
    const [expires, signature] = value.split(".");
    if (!expires || !signature) return false;

    return safeEqual(signature, sign(expires)) && Number(expires) > Date.now();
}
