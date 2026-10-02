import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { TripStory } from "@/components/travel/trip-story";
import { getStory, getTrips } from "@/lib/trips";

type Props = { params: Promise<{ slug: string }> };

// Every story is built ahead of time; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getTrips()).map((trip) => ({ slug: trip.slug }));
}

/** Title, description and the cover photo as the link preview. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return {};
  const { trip } = story;
  const title = `${trip.title} · Tarun Monga`;
  return {
    title,
    description: trip.subtitle,
    alternates: { canonical: `/travel/${slug}` },
    openGraph: {
      type: "article",
      title,
      description: trip.subtitle,
      url: `/travel/${slug}`,
      images: [{ url: trip.cover, alt: trip.title }],
    },
    twitter: { card: "summary_large_image", title, description: trip.subtitle, images: [trip.cover] },
  };
}

/** A story as its own page: shared links and refreshes land here. */
export default async function TripPage({ params }: Props) {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) notFound();

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 pt-24 font-crimson md:px-8 md:pt-28">
        <TripStory story={story} />
        <p className="pb-24 text-center">
          <Link
            href="/#travel"
            className="link-underline text-xs uppercase tracking-[0.25em] text-muted-foreground"
          >
            All trips
          </Link>
        </p>
      </main>
    </>
  );
}
