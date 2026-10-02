/** Places on the travel map besides the trips (which live in content/travel). */
export interface Place {
    name: string;
    coords: { lat: number; lng: number };
}

export const HOME: Place = { name: "Ludhiana", coords: { lat: 30.9, lng: 75.85 } };

/** Where Tarun is right now — working client-side. */
export const NOW: Place = { name: "Pune", coords: { lat: 18.52, lng: 73.86 } };

/** Been there; no photo story (yet). */
export const ALSO_VISITED: Place[] = [
    { name: "Amritsar", coords: { lat: 31.63, lng: 74.87 } },
    { name: "Shimla", coords: { lat: 31.1, lng: 77.17 } },
    { name: "Vaishno Devi", coords: { lat: 33.03, lng: 74.95 } },
    { name: "Kedarnath", coords: { lat: 30.73, lng: 79.07 } },
    { name: "Rishikesh", coords: { lat: 30.09, lng: 78.27 } },
    { name: "Bhubaneswar", coords: { lat: 20.3, lng: 85.82 } },
    { name: "Puri", coords: { lat: 19.81, lng: 85.83 } },
];

/** Not yet. */
export const SOMEDAY = ["Greece", "Rome", "Japan", "Iceland"];
