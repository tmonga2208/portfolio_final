import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import { storyComponents } from "@/components/travel/story-components";
import type { Trip } from "@/types/travel";

/** One file per trip: a header of Trip fields, then the story. */
const DIR = path.join(process.cwd(), "content/travel");

const REQUIRED = ["title", "subtitle", "location", "coords", "when", "cover", "pile"] as const;

async function compile(slug: string) {
  const source = await readFile(path.join(DIR, `${slug}.mdx`), "utf8");
  const { content, frontmatter } = await compileMDX<Omit<Trip, "slug">>({
    source,
    components: storyComponents,
    options: { parseFrontmatter: true },
  });

  // Fail the build with a readable message rather than a broken page.
  for (const key of REQUIRED) {
    if (frontmatter[key] == null) throw new Error(`content/travel/${slug}.mdx is missing "${key}" in its header`);
  }
  const when = String(frontmatter.when);
  if (!/^\d{4}-\d{2}$/.test(when)) throw new Error(`content/travel/${slug}.mdx: "when" should look like "2026-08"`);

  const trip: Trip = { ...frontmatter, slug, when };
  return { trip, content };
}

/** Every trip, newest first. */
export const getTrips = cache(async (): Promise<Trip[]> => {
  const files = (await readdir(DIR)).filter((file) => file.endsWith(".mdx"));
  const trips = await Promise.all(files.map(async (file) => (await compile(file.replace(/\.mdx$/, ""))).trip));
  return trips.sort((a, b) => b.when.localeCompare(a.when));
});

/** One trip's story, with the trips either side of it for the links at the end. */
export const getStory = cache(async (slug: string) => {
  const trips = await getTrips();
  // Only slugs that exist as files are ever read.
  const index = trips.findIndex((trip) => trip.slug === slug);
  if (index === -1) return null;
  const { trip, content } = await compile(slug);
  return { trip, content, later: trips[index - 1] ?? null, earlier: trips[index + 1] ?? null };
});

export type Story = NonNullable<Awaited<ReturnType<typeof getStory>>>;
