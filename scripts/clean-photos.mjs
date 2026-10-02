#!/usr/bin/env node

/**
 * Prepares photos for the site: bakes in the camera's rotation, strips the
 * metadata (GPS location, phone model, timestamps) and caps the long edge.
 * Files are rewritten in place, in their own format. The colour profile is
 * kept, so wide-gamut phone photos don't shift colour.
 *
 *   npm run photos -- public/travel                # long edge capped at 2048px
 *   npm run photos -- public/gallery --max 800
 *
 * Run it on every photo before it goes into public/: the site serves these
 * files as they are, and phone photos record exactly where they were taken.
 */

import sharp from "sharp";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const args = process.argv.slice(2);
const maxAt = args.indexOf("--max");
const max = maxAt === -1 ? 2048 : Number(args[maxAt + 1]);
const targets = maxAt === -1 ? args : args.filter((_, i) => i !== maxAt && i !== maxAt + 1);

if (!targets.length || !Number.isFinite(max)) {
    console.error("Usage: npm run photos -- <file|folder>... [--max px]");
    process.exit(1);
}

const PHOTO = /\.(jpe?g|png|webp)$/i;
const files = targets.flatMap((target) =>
    statSync(target).isDirectory()
        ? readdirSync(target).map((name) => join(target, name)).filter((path) => PHOTO.test(path))
        : [target]
);

for (const file of files) {
    const input = readFileSync(file);
    const ext = extname(file).toLowerCase();
    const resized = sharp(input)
        .rotate()
        .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
        .keepIccProfile();
    const encoded =
        ext === ".png"
            ? resized.png({ compressionLevel: 9 })
            : ext === ".webp"
              ? resized.webp({ quality: 85 })
              : resized.jpeg({ quality: 85, mozjpeg: true });
    const { data, info } = await encoded.toBuffer({ resolveWithObject: true });
    writeFileSync(file, data);
    console.log(`${file}  ${info.width}x${info.height}  ${Math.round(input.length / 1024)}KB → ${Math.round(data.length / 1024)}KB`);
}
