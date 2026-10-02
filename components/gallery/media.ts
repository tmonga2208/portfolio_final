/**
 * What the gallery's film strips show, in order. A photo needs its file and
 * pixel size. A clip also needs a poster (a still from it), shown before it
 * plays and to anyone who has turned motion off. Keep clips short and silent:
 * a few seconds, around 480px tall, H.264 MP4.
 */
export type Media = {
  src: string;
  width: number;
  height: number;
  /** Shown in the cursor label on hover. */
  caption?: string;
} & ({ kind?: "photo" } | { kind: "video"; poster: string });

export const MEDIA: Media[] = [
  { src: "/gallery/g01.jpg", width: 1050, height: 1400, caption: "Fun with friends" },
  { src: "/gallery/g02.jpg", width: 933, height: 1400, caption: "Happy haldi, Di" },
  { src: "/gallery/g03.jpg", width: 1037, height: 1400, caption: "Corporate majdoor — just my everyday" },
  { src: "/gallery/g04.jpg", width: 1050, height: 1400, caption: "Rakhi with my sisters" },
  { src: "/gallery/g05.jpg", width: 1050, height: 1400, caption: "Harishchandragad — birthday trip 2026" },
  { src: "/gallery/g06.jpg", width: 1050, height: 1400, caption: "Fun Goa trip 2026" },
  { src: "/gallery/g07.jpg", width: 933, height: 1400, caption: "Happy wedding, Di" },
  { src: "/gallery/g08.jpg", width: 1400, height: 1050, caption: "Cute moments with my Dis" },
  { src: "/gallery/g12.png", width: 1034, height: 1400, caption: "Cutest kid me" },
  { src: "/gallery/g10.jpg", width: 1400, height: 960, caption: "Mom & Dad's 25th anniversary" },
  { src: "/gallery/g11.jpg", width: 1400, height: 1049, caption: "Best trip memory" },
];
