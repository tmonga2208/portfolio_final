import type { MetadataRoute } from "next";
import { getTrips } from "@/lib/trips";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const trips = await getTrips();
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/library`, changeFrequency: "monthly", priority: 0.6 },
    ...trips.map((trip) => ({
      url: `${SITE_URL}/travel/${trip.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
