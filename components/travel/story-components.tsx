import Image from "next/image";
import path from "node:path";
import sharp from "sharp";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { LoopingClip } from "@/components/media/looping-clip";

/*
 * What a story file can use besides plain paragraphs:
 *
 *   <Photo src="/travel/goa2.jpg" caption="Low tide, Palolem" />
 *   <Pair a="/travel/dm1.jpg" b="/travel/dm2.jpg" caption="…" />
 *   <Clip src="/travel/waves.mp4" poster="/travel/waves.jpg" caption="…" />
 *
 * Photos keep their real shape: the size is read from the file at build time.
 * Run new photos through `npm run photos` first, so they carry no location.
 */

async function sizeOf(src: string) {
  const { width = 4, height = 3 } = await sharp(path.join(process.cwd(), "public", src)).metadata();
  return { width, height };
}

function Caption({ children }: { children?: string }) {
  if (!children) return null;
  return <figcaption className="mt-3 text-center text-base italic text-muted-foreground">{children}</figcaption>;
}

async function Photo({ src, alt = "", caption }: { src: string; alt?: string; caption?: string }) {
  const { width, height } = await sizeOf(src);
  // Uprights would tower over the text at full width, so they sit narrower.
  const upright = height > width;
  return (
    <figure className={upright ? "mx-auto my-12 max-w-md" : "my-12"}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={upright ? "(min-width: 768px) 448px, 100vw" : "(min-width: 768px) 672px, 100vw"}
        className="h-auto w-full rounded-2xl"
      />
      <Caption>{caption}</Caption>
    </figure>
  );
}

function Pair({ a, b, caption }: { a: string; b: string; caption?: string }) {
  return (
    <figure className="my-12">
      <div className="grid grid-cols-2 gap-3">
        {[a, b].map((src) => (
          <div key={src} className="relative aspect-3/4 overflow-hidden rounded-2xl">
            <Image src={src} alt="" fill sizes="(min-width: 768px) 336px, 50vw" className="object-cover" />
          </div>
        ))}
      </div>
      <Caption>{caption}</Caption>
    </figure>
  );
}

function Clip({ src, poster, caption }: { src: string; poster: string; caption?: string }) {
  return (
    <figure className="mx-auto my-12 max-w-md">
      <LoopingClip src={src} poster={poster} className="h-auto w-full rounded-2xl" />
      <Caption>{caption}</Caption>
    </figure>
  );
}

export const storyComponents: MDXRemoteProps["components"] = {
  Photo,
  Pair,
  Clip,
  p: (props) => <p className="my-6 text-xl leading-relaxed text-foreground/85 md:text-[1.375rem]" {...props} />,
  h2: (props) => <h2 className="mt-14 mb-4 text-3xl font-bold text-brand" {...props} />,
  a: (props) => <a className="link-underline text-brand" {...props} />,
};
