import Image from "next/image";
import type { ReactNode } from "react";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { LoopingClip } from "@/components/media/looping-clip";

/*
 * What a story file can use besides plain paragraphs:
 *
 *   <Photo src="/travel/goa2.jpg" caption="Low tide, Palolem" />
 *   <Row>                                  ← photos side by side, filling the width
 *     <Photo src="/travel/dm1.jpg" />
 *     <Photo src="/travel/dm2.jpg" />
 *   </Row>
 *   <Clip src="/travel/waves.mp4" poster="/travel/waves.jpg" caption="…" />
 *
 * Photos are cropped to squares, so frame the subject near the middle.
 * Run new photos through `npm run photos` first, so they carry no location.
 */

function Caption({ children }: { children?: string }) {
  if (!children) return null;
  return <figcaption className="mt-3 text-center text-base italic text-muted-foreground">{children}</figcaption>;
}

function Photo({ src, alt = "", caption }: { src: string; alt?: string; caption?: string }) {
  return (
    <figure className="my-12">
      <div className="relative aspect-square overflow-hidden rounded-2xl">
        <Image src={src} alt={alt} fill sizes="(min-width: 768px) 672px, 100vw" className="object-cover" />
      </div>
      <Caption>{caption}</Caption>
    </figure>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="my-12 grid auto-cols-fr grid-flow-col gap-3 [&>figure]:my-0">{children}</div>;
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
  Row,
  Clip,
  p: (props) => <p className="my-6 text-xl leading-relaxed text-foreground/85 md:text-[1.375rem]" {...props} />,
  h2: (props) => <h2 className="mt-14 mb-4 text-3xl font-bold text-brand" {...props} />,
  a: (props) => <a className="link-underline text-brand" {...props} />,
};
