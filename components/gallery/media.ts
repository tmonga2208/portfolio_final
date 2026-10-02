/**
 * What the gallery's film strips show, in order. A photo needs its file and
 * pixel size (run `npm run photos -- <file> --max 800` on it first). A clip also
 * needs a poster (a still from it), shown before it plays and to anyone who has
 * turned motion off. Keep clips short and silent; this also drops the location
 * phones record, which ffmpeg would otherwise copy across:
 *
 *   ffmpeg -i in.mov -t 5 -vf scale=-2:480 -an -map_metadata -1 -c:v libx264 -crf 26 -movflags +faststart clip.mp4
 *   ffmpeg -i clip.mp4 -frames:v 1 clip.jpg
 */
export type Media = {
  src: string;
  width: number;
  height: number;
  /** Shown in the cursor label on hover. */
  caption?: string;
} & ({ kind?: "photo" } | { kind: "video"; poster: string });

export const MEDIA: Media[] = [
  { src: "/gallery/g01.jpg", width: 600, height: 800, caption: "Fun with friends" },
  { src: "/gallery/g02.jpg", width: 533, height: 800, caption: "Happy haldi, Di" },
  { src: "/gallery/g03.jpg", width: 593, height: 800, caption: "Corporate majdoor — just my everyday" },
  { src: "/gallery/g04.jpg", width: 600, height: 800, caption: "Rakhi with my sisters" },
  { src: "/gallery/g05.jpg", width: 600, height: 800, caption: "Harishchandragad — birthday trip 2026" },
  { src: "/gallery/g06.jpg", width: 600, height: 800, caption: "Fun Goa trip 2026" },
  { src: "/gallery/g07.jpg", width: 533, height: 800, caption: "Happy wedding, Di" },
  { src: "/gallery/g08.jpg", width: 800, height: 600, caption: "Cute moments with my Dis" },
  { src: "/gallery/g12.jpg", width: 591, height: 800, caption: "Cutest kid me" },
  { src: "/gallery/g10.jpg", width: 800, height: 549, caption: "Mom & Dad's 25th anniversary" },
  { src: "/gallery/g11.jpg", width: 800, height: 599, caption: "Best trip memory" },
];
