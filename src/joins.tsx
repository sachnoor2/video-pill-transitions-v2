import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';

/**
 * The join engine.
 *
 * A join is NOT an effect laid over two finished shots. It is a shared motion
 * value: the outgoing shot is still travelling when the boundary arrives, and
 * the incoming shot is already travelling on its first frame. Every kind below
 * moves BOTH sides, so the eye tracks one continuous movement through the
 * boundary instead of registering a change of picture.
 */

export type JoinKind = 'push' | 'portal' | 'squeeze' | 'flash';

export type Join = {
  kind: JoinKind;
  anchor?: {x: number; y: number; r: number};
  dir?: 1 | -1;
};

export const ease = (p: number) =>
  Easing.bezier(0.33, 0, 0.15, 1)(Math.min(1, Math.max(0, p)));

const DEFAULT_ANCHOR = {x: 540, y: 900, r: 150};

/** How many frames either side of the nominal cut the join occupies. */
export const HALF_WINDOW = 9;

export const joinStyles = (
  join: Join,
  role: 'out' | 'in',
  p: number,
): React.CSSProperties => {
  const e = ease(p);
  const a = join.anchor ?? DEFAULT_ANCHOR;

  switch (join.kind) {
    case 'push': {
      // Outgoing keeps growing as if the camera is still moving into it.
      // Incoming arrives already slightly oversized, so it settles rather than starts.
      // The hole stays a hole for most of the join and only blows out at the end:
      // a mask that reaches full frame by the halfway point is a cut, not a dive.
      if (role === 'out') {
        return {
          transform: `scale(${1 + 2.6 * e})`,
          transformOrigin: `${a.x}px ${a.y}px`,
          filter: `blur(${e * 10}px)`,
        };
      }
      return {
        transform: `scale(${1.22 - 0.22 * e})`,
        transformOrigin: `${a.x}px ${a.y}px`,
        clipPath: `circle(${a.r + Math.pow(p, 2.6) * (2100 - a.r)}px at ${a.x}px ${a.y}px)`,
      };
    }

    case 'portal': {
      // A dive through an opening: the outgoing world blows past the lens,
      // the incoming world opens out from the same point.
      if (role === 'out') {
        return {
          transform: `scale(${1 + 7.5 * e})`,
          transformOrigin: `${a.x}px ${a.y}px`,
          filter: `blur(${e * 16}px)`,
        };
      }
      return {
        transform: `scale(${0.38 + 0.62 * e})`,
        transformOrigin: `${a.x}px ${a.y}px`,
        clipPath: `circle(${a.r * 0.55 + Math.pow(p, 2.2) * (2100 - a.r * 0.55)}px at ${a.x}px ${a.y}px)`,
      };
    }

    case 'squeeze': {
      // A true squeeze wipe: the outgoing frame compresses to zero width while the
      // incoming arrives at exactly the same rate, so the two edges stay welded.
      // (Sliding two full-bleed layers instead leaves a hole of background between
      // them — the tell that made the first pass look stitched.)
      const d = join.dir ?? 1;
      if (role === 'out') {
        return {
          transform: `scaleX(${Math.max(0, 1 - e)})`,
          transformOrigin: `${d > 0 ? 'left' : 'right'} center`,
          filter: `blur(${e * 3}px)`,
        };
      }
      return {
        transform: `translateX(${d * (1 - e) * 100}%)`,
      };
    }

    case 'flash': {
      // One blow-out, used at most once. Both sides keep scaling through it so
      // the white is a wipe across a moving world, not a stop.
      if (role === 'out') {
        return {transform: `scale(${1 + 0.22 * e})`};
      }
      return {transform: `scale(${0.9 + 0.1 * e})`};
    }
  }
};

export const JoinLayer: React.FC<{
  join: Join;
  role: 'out' | 'in';
  p: number;
  z: number;
  children: React.ReactNode;
}> = ({join, role, p, z, children}) => {
  return (
    <AbsoluteFill
      style={{
        ...joinStyles(join, role, p),
        zIndex: z,
        willChange: 'transform, filter, clip-path',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** The white blow-out drawn over a flash join. */
export const FlashOverlay: React.FC<{p: number}> = ({p}) => {
  // Ramp in, HOLD full white for ~4 frames, ramp out. A flash that only touches
  // full white for a single frame reads as a grey wash, not a blow-out.
  const opacity = interpolate(
    p,
    [0, 0.38, 0.62, 1],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)},
  );
  return (
    <AbsoluteFill
      style={{
        zIndex: 50,
        opacity,
        background:
          'radial-gradient(circle at 50% 45%, #ffffff 0%, #f3fbff 55%, #dff2ff 100%)',
        pointerEvents: 'none',
      }}
    />
  );
};
