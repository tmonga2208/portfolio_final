import { monogram } from "@/lib/monogram";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Square corners: iOS rounds home-screen icons itself. */
export default function AppleIcon() {
  return monogram(size.width, { rounded: false });
}
