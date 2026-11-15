import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import manifestJson from './manifest.json';
import {FlashOverlay, HALF_WINDOW, Join, JoinLayer} from './joins';
import {SCENES} from './scenes';
import {C, Grain, Vignette, clamp01, ramp} from './ui';

type Scene = {
  id: string;
  text: string;
  start: number;
  dur: number;
  joinOut: Join;
};

const MANIFEST = manifestJson as unknown as {
  fps: number;
  width: number;
  height: number;
  scenes: Scene[];
};

const HALF = HALF_WINDOW;

/** 1–3 word caption cards, allocated across the scene by character share. */
const captionCards = (text: string, dur: number) => {
  const words = text.replace(/[^A-Za-z' ]/g, '').split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const left = words.length - i;
    const n = left <= 3 ? left : left === 4 ? 2 : 2 + (i % 3 === 2 ? 1 : 0);
    chunks.push(words.slice(i, i + n).join(' '));
    i += n;
  }
  const total = chunks.reduce((a, c) => a + c.length + 1, 0);
  let cursor = 0;
  return chunks.map((text2) => {
    const span = ((text2.length + 1) / total) * dur;
    const card = {text: text2, from: cursor, to: cursor + span};
    cursor += span;
    return card;
  });
};

const Caption: React.FC<{text: string; opacity: number}> = ({text, opacity}) => (      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 400}}>
    <div
      style={{
        opacity,
        fontFamily: 'Helvetica, Arial, "DejaVu Sans", sans-serif',
        fontSize: 78,
        fontWeight: 900,
        letterSpacing: -1,
        color: '#ffffff',
        textAlign: 'center',
        maxWidth: '82%',
        lineHeight: 1.05,
        textShadow: '0 6px 22px rgba(0,0,0,0.72), 0 2px 4px rgba(0,0,0,0.6)',
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const scenes = MANIFEST.scenes;
  const n = scenes.length;

  // Which boundary window are we inside, if any?
  let active: {i: number; p: number} | null = null;
  for (let i = 0; i < n - 1; i++) {
    const b = scenes[i + 1].start;
    if (frame >= b - HALF && frame < b + HALF) {
      active = {i, p: (frame - (b - HALF)) / (2 * HALF)};
      break;
    }
  }

  let solo = scenes.findIndex((s) => frame >= s.start && frame < s.start + s.dur);
  if (solo < 0) solo = frame < 0 ? 0 : n - 1;

  // Scene-local time is remapped across the extended window so a shot is
  // already moving before its official start and still moving after its end.
  const localT = (s: Scene) => (frame - s.start + HALF) * (s.dur / (s.dur + 2 * HALF));

  const layers: {s: Scene; role: 'out' | 'in' | 'solo'; p: number}[] = active
    ? [
        {s: scenes[active.i], role: 'out', p: active.p},
        {s: scenes[active.i + 1], role: 'in', p: active.p},
      ]
    : [{s: scenes[solo], role: 'solo', p: 0}];

  const joinCfg: Join | null = active ? scenes[active.i].joinOut : null;

  return (
    <AbsoluteFill style={{backgroundColor: C.ink}}>
      {/* narration, one file per shot, starting exactly on its frame */}
      {scenes.map((s) => (
        <Sequence key={`a-${s.id}`} from={s.start} durationInFrames={s.dur} name={`vo-${s.id}`}>
          <Audio src={staticFile(`audio/${s.id}.wav`)} />
        </Sequence>
      ))}

      {/* foley: one whoosh per join, starting 10 frames before the boundary (J-cut) */}
      {scenes.slice(0, n - 1).map((s, i) => (
        <Sequence
          key={`f-${i}`}
          from={Math.max(0, scenes[i + 1].start - 10)}
          durationInFrames={26}
          name={`foley-${i}`}
        >
          <Audio src={staticFile(`audio/foley/join-${String(i + 1).padStart(2, '0')}.wav`)} volume={0.42} />
        </Sequence>
      ))}

      {layers.map(({s, role, p}) => {
        const Comp = SCENES[s.id];
        const body = <Comp t={localT(s)} dur={s.dur} />;
        if (role === 'solo' || !joinCfg) {
          return (
            <AbsoluteFill key={s.id} style={{zIndex: 1}}>
              {body}
            </AbsoluteFill>
          );
        }
        // A flash hides its swap under the blow-out, so the OUTGOING shot must stay
        // on top until the white peaks; every other join puts the incoming on top.
        const z = joinCfg.kind === 'flash' ? (role === 'out' ? 2 : 1) : role === 'out' ? 1 : 2;
        return (
          <JoinLayer key={`${s.id}-${role}`} join={joinCfg} role={role} p={p} z={z}>
            {body}
          </JoinLayer>
        );
      })}

      {/* captions ride on top of the join, never inside it */}
      {layers.map(({s, role, p}) => {
        const cards = captionCards(s.text, s.dur);
        const lt = localT(s);
        const env =
          role === 'out' ? 1 - ramp(p, 0, 0.32) : role === 'in' ? ramp(p, 0.68, 1) : 1;
        const card = cards.find((c) => lt >= c.from && lt < c.to);
        if (!card) return null;
        const fade = Math.min(
          interpolate(lt, [card.from, card.from + 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          interpolate(lt, [card.to - 3, card.to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        );
        return (
          <div key={`cap-${s.id}`} style={{zIndex: 40, opacity: fade * env}}>
            <Caption text={card.text} opacity={1} />
          </div>
        );
      })}

      {joinCfg && joinCfg.kind === 'flash' && active ? <FlashOverlay p={active.p} /> : null}

      <Vignette />
      <Grain />

      {/* frame one is an image, never black; only the very end fades */}
      <AbsoluteFill
        style={{
          zIndex: 60,
          backgroundColor: '#000',
          opacity: interpolate(frame, [durationInFrames - 6, durationInFrames - 1], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
    </AbsoluteFill>
  );
};
