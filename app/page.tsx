import { HomePage } from "@/components/home-page";
import { getTrips } from "@/lib/trips";

/** Reads the travel stories from disk, then hands over to the (client) home page. */
export default async function Page() {
  return <HomePage trips={await getTrips()} />;
}
