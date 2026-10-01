import { toast } from "@/components/toast";

export const EMAIL = "tarunmonga2208@gmail.com";
export const GITHUB_URL = "https://github.com/tmonga2208";
export const LINKEDIN_URL = "https://www.linkedin.com/in/tarun-monga-b00008181/";

/** Copy the email address and confirm with a toast. Returns whether it worked. */
export async function copyEmail(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(EMAIL);
    toast("Email copied ✓");
    return true;
  } catch {
    // Clipboard is blocked (insecure context, permissions) — let the caller fall back.
    return false;
  }
}
