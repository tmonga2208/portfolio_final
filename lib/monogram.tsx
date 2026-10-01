import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Light-mode --brand and --brand-foreground; icons can't read CSS variables. */
const NAVY = "#043360";
const PAPER = "#faf9f6";

/**
 * The "TM" monogram for the tab and home-screen icons: Crimson Pro Bold, as on
 * the site, on its navy. The font file is a subset holding only T and M.
 */
export async function monogram(size: number, { rounded }: { rounded: boolean }) {
  const font = await readFile(join(process.cwd(), "assets/crimson-pro-700-TM.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: NAVY,
          color: PAPER,
          fontFamily: "Crimson Pro",
          fontSize: size * 0.56,
          letterSpacing: -size * 0.02,
          borderRadius: rounded ? size * 0.22 : 0,
        }}
      >
        TM
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "Crimson Pro", data: font, weight: 700, style: "normal" }],
    }
  );
}
