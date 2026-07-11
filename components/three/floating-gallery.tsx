"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image as DreiImage, Preload } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { MathUtils, type Group, type Mesh } from "three";

type Photo = {
  url: string;
  /** Resting position. Idle float and hover are applied as offsets from here. */
  position: [number, number, number];
  size: [number, number];
};

/**
 * Asymmetric on purpose: the hero wordmark sits under the canvas, so the mass is
 * kept high and to the sides rather than dead centre.
 */
const PHOTOS: Photo[] = [
  { url: "/img5.jpeg", position: [0, 0.1, 0], size: [3.0, 3.9] },
  { url: "/img1.JPG", position: [-2.75, 1.0, -1.4], size: [1.7, 2.2] },
  { url: "/img2.jpg", position: [-2.35, -1.5, -0.9], size: [1.6, 2.0] },
  { url: "/img3.JPG", position: [2.75, 1.35, -1.2], size: [1.6, 2.05] },
  { url: "/img4.jpg", position: [2.4, -1.45, -0.7], size: [1.7, 2.2] },
];

/** Reference width (world units) the resting positions below were composed against. */
const BASE_VIEWPORT_WIDTH = 9;

function Plane({ photo, index }: { photo: Photo; index: number }) {
  const ref = useRef<Mesh>(null);
  const { viewport } = useThree();
  const [hovered, setHovered] = useState(false);
  const [x, y, z] = photo.position;
  const [w, h] = photo.size;

  // A wide window sees far more world-space than the layout was composed for, which
  // would leave the planes bunched in the middle. Push them outward to match.
  const spread = MathUtils.clamp(viewport.width / BASE_VIEWPORT_WIDTH, 1, 1.9);
  const restX = x * spread;

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;

    const t = state.clock.elapsedTime;
    // Phase-shift each plane so the group never breathes in unison.
    const floatY = Math.sin(t * 0.45 + index * 1.7) * 0.085;
    const floatX = Math.cos(t * 0.32 + index * 1.1) * 0.05;

    mesh.position.x = MathUtils.lerp(mesh.position.x, restX + floatX, 0.06);
    mesh.position.y = MathUtils.lerp(mesh.position.y, y + floatY, 0.06);
    mesh.position.z = MathUtils.lerp(mesh.position.z, z + (hovered ? 0.5 : 0), 0.08);

    const target = hovered ? 1.05 : 1;
    mesh.scale.x = MathUtils.lerp(mesh.scale.x, w * target, 0.1);
    mesh.scale.y = MathUtils.lerp(mesh.scale.y, h * target, 0.1);
  });

  return (
    <DreiImage
      ref={ref}
      url={photo.url}
      position={[restX, y, z]}
      scale={[w, h]}
      radius={0.12}
      transparent
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    />
  );
}

/** Tilts the whole group toward the pointer and drifts it as the hero scrolls away. */
function Rig({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  const scrollRatio = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      scrollRatio.current = window.scrollY / Math.max(window.innerHeight, 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state) => {
    const group = ref.current;
    if (!group) return;

    const { x: px, y: py } = state.pointer;
    group.rotation.y = MathUtils.lerp(group.rotation.y, px * 0.16, 0.045);
    group.rotation.x = MathUtils.lerp(group.rotation.x, -py * 0.1, 0.045);
    group.position.x = MathUtils.lerp(group.position.x, px * 0.3, 0.045);
    // Push the gallery up and back as you scroll past it.
    group.position.y = MathUtils.lerp(group.position.y, scrollRatio.current * 1.6, 0.06);
    group.position.z = MathUtils.lerp(group.position.z, -scrollRatio.current * 1.2, 0.06);
  });

  return <group ref={ref}>{children}</group>;
}

/**
 * Renders only once its siblings inside <Suspense> have resolved — i.e. every texture
 * has decoded. Lets the caller keep a DOM fallback on screen until the scene is real.
 */
function SignalReady({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

export default function FloatingGallery({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.5], fov: 42 }}
      gl={{ antialias: true }}
      style={{ pointerEvents: "auto" }}
    >
      <Suspense fallback={null}>
        <Rig>
          {PHOTOS.map((photo, i) => (
            <Plane key={photo.url} photo={photo} index={i} />
          ))}
        </Rig>
        <Preload all />
        {onReady && <SignalReady onReady={onReady} />}
      </Suspense>
    </Canvas>
  );
}
