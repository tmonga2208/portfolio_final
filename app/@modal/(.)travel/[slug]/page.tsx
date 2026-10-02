import { notFound } from "next/navigation";
import { StoryOverlay } from "@/components/travel/story-overlay";
import { TripStory } from "@/components/travel/trip-story";
import { getStory, getTrips } from "@/lib/trips";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getTrips()).map((trip) => ({ slug: trip.slug }));
}

/** /travel/<slug> reached from the home page: the story over the page, not a new one. */
export default async function TripOverlay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) notFound();

  return (
    <StoryOverlay slug={slug}>
      <TripStory story={story} inOverlay />
    </StoryOverlay>
  );
}
