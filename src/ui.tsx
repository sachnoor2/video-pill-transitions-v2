import React from 'react';
import {AbsoluteFill, interpolate, Easing} from 'remotion';

export const W = 1080;
export const H = 1920;

export const C = {
  stage1: '#63B8EA',
  stage2: '#3D95CE',
  stage3: '#16618F',
  cream: '#F7EFE4',
  red: '#E74C3C',
  dark: '#12232E',
  skin: '#F0A87C',
  skinDark: '#D2835A',
  acid: '#C9E05C',
  acidDark: '#8FBF3F',
  blood: '#B3232B',
  bloodDark: '#7C121A',
  membrane: '#F3B9A6',
  ink: '#0B1720',
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Smooth 0..1 ramp of `v` between `from` and `to`. */
export const ramp = (v: number, from: number, to: number, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(v, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** A repeating 0..1 loop for continuous secondary motion (bubbles, cells, dust). */
export const loop = (t: number, period: number, offset = 0) => {
  const v = ((t + offset) % period) / period;
  return v < 0 ? v + 1 : v;
};

export const Stage: React.FC<{t: number; children?: React.ReactNode}> = ({t, children}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(115% 85% at 50% 40%, ${C.stage1} 0%, ${C.stage2} 48%, ${C.stage3} 100%)`,
    }}
  >
    <AbsoluteFill
      style={{
        opacity: 0.09,
        backgroundImage:
          'linear-gradient(#ffffff 2px, transparent 2px), linear-gradient(90deg,#ffffff 2px, transparent 2px)',
        backgroundSize: '120px 120px',
        transform: `translateY(${(t * 0.5) % 120}px)`,
      }}
    />
    {children}
  </AbsoluteFill>
);

/** Every shot carries its own slow camera push, so no shot is ever a still. */
export const Shot: React.FC<{
  t: number;
  dur: number;
  push?: number;
  children: React.ReactNode;
}> = ({t, dur, push = 0.06, children}) => {
  const p = clamp01(t / dur);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${1 + push * p})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Blurred foreground element: the depth tell that reads as a real lens. */
export const Foreground: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{filter: 'blur(26px)', opacity: 0.95}}>{children}</AbsoluteFill>
);

export const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      opacity: 0.05,
      mixBlendMode: 'overlay',
      backgroundImage:
        'radial-gradient(#ffffff 0.6px, transparent 0.7px), radial-gradient(#000000 0.6px, transparent 0.7px)',
      backgroundSize: '5px 5px, 7px 7px',
      backgroundPosition: '0 0, 3px 3px',
    }}
  />
);

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(78% 58% at 50% 46%, rgba(0,0,0,0) 40%, rgba(4,18,28,0.42) 100%)',
      pointerEvents: 'none',
    }}
  />
);
