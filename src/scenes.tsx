import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, Foreground, H, lerp, loop, ramp, Shot, Stage, W, clamp01} from './ui';

export type SceneProps = {t: number; dur: number};

const Capsule: React.FC<{
  x: number;
  y: number;
  len: number;
  h: number;
  rot?: number;
  split?: number;
  opacity?: number;
  left?: string;
  right?: string;
  scale?: number;
}> = ({x, y, len, h, rot = 0, split = 0, opacity = 1, left = C.cream, right = C.red, scale = 1}) => {
  const r = h / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
      <g transform={`translate(${-split} 0)`}>
        <rect x={-len / 2} y={-h / 2} width={len} height={h} rx={r} fill={left} />
        <rect x={0} y={-h / 2} width={len / 2} height={h} rx={r} fill={right} />
        <ellipse cx={-len * 0.2} cy={-h * 0.24} rx={len * 0.16} ry={h * 0.12} fill="#fff" opacity={0.4} />
      </g>
      <g transform={`translate(${split} 0)`}>
        <rect x={0} y={-h / 2} width={len / 2} height={h} rx={r} fill={right} />
        <ellipse cx={len * 0.2} cy={-h * 0.24} rx={len * 0.14} ry={h * 0.11} fill="#fff" opacity={0.3} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ 01 hook */
export const S01Hook: React.FC<SceneProps> = ({t, dur}) => {
  const p = clamp01(t / dur);
  return (
    <Shot t={t} dur={dur} push={0.08}>
      <Stage t={t}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8C3A0" />
              <stop offset="100%" stopColor={C.skinDark} />
            </linearGradient>
            <radialGradient id="lamp" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </radialGradient>
          </defs>
          <ellipse cx={540} cy={1320} rx={430} ry={300} fill="url(#skin)" />
          <ellipse cx={540} cy={1330} rx={300} ry={190} fill="#F7B892" opacity={0.55} />
          <g transform={`translate(${140 - 30 * p} ${1150}) rotate(-12)`}>
            <rect x={-90} y={-40} width={640} height={150} rx={75} fill="url(#skin)" />
          </g>
          <Capsule x={540} y={880} len={330} h={140} rot={-16 + 4 * p} />
          <ellipse cx={540 + 220 * p} cy={700} rx={380} ry={380} fill="url(#lamp)" />
        </svg>
        <Foreground>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <rect x={-120} y={1500} width={1400} height={520} rx={160} fill="#D2835A" />
            <rect x={760} y={-60} width={520} height={900} rx={200} fill="#C97A52" opacity={0.85} />
          </svg>
        </Foreground>
      </Stage>
    </Shot>
  );
};

/* ----------------------------------------------------------------- 02 mouth */
export const S02Mouth: React.FC<SceneProps> = ({t, dur}) => {
  const fall = ramp(t, 0, dur * 0.75);
  const y = lerp(280, 1060, fall);
  return (
    <Shot t={t} dur={dur} push={0.07}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 70% at 50% 45%, #7A1F27 0%, #4A1015 60%, #2A090C 100%)'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <path d={`M0 260 Q540 ${120 + 14 * Math.sin(t / 8)} 1080 260 L1080 0 L0 0 Z`} fill="#8E2A32" />
          <ellipse cx={540} cy={1300} rx={470} ry={260} fill="#C2454B" />
          <ellipse cx={540} cy={1270} rx={330} ry={150} fill="#D95C60" opacity={0.6} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const q = loop(t, 26, i * 4.3);
            return (
              <ellipse
                key={i}
                cx={300 + i * 96 + 12 * Math.sin((t + i * 9) / 6)}
                cy={lerp(300, 1180, q)}
                rx={13}
                ry={20}
                fill="#FFD9D2"
                opacity={0.55 * (1 - q * 0.5)}
              />
            );
          })}
          <Capsule x={540} y={y} len={230} h={100} rot={22 - 40 * fall} scale={1 - 0.18 * fall} />
          <ellipse cx={540} cy={y + 40} rx={150} ry={26} fill="#4A1015" opacity={0.35 * fall} />
        </svg>
        <Foreground>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <path d="M-60 1920 L-60 1560 Q540 1420 1140 1560 L1140 1920 Z" fill="#9B3138" />
            <rect x={-80} y={-80} width={1240} height={300} rx={140} fill="#7C2028" />
          </svg>
        </Foreground>
      </AbsoluteFill>
    </Shot>
  );
};

/* ---------------------------------------------------------------- 03 throat */
export const S03Throat: React.FC<SceneProps> = ({t, dur}) => {
  const p = clamp01(t / dur);
  return (
    <Shot t={t} dur={dur} push={0.1}>
      <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 50%, #93313A 0%, #5A161C 55%, #2A090C 100%)'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const k = i / 8;
            const r = lerp(620, 70, k) * (1 + 0.035 * Math.sin(t / 7 - i * 0.7));
            return (
              <ellipse
                key={i}
                cx={540}
                cy={lerp(760, 900, k)}
                rx={r}
                ry={r * 1.06}
                fill="none"
                stroke={i % 2 ? '#B0454E' : '#8E2A32'}
                strokeWidth={lerp(46, 12, k)}
                opacity={lerp(0.35, 0.95, k)}
              />
            );
          })}
          <Capsule x={540} y={lerp(700, 1000, p)} len={200} h={86} rot={8} scale={lerp(1.05, 0.5, p)} />
        </svg>
      </AbsoluteFill>
    </Shot>
  );
};

/* ----------------------------------------------------------- 04 oesophagus */
export const S04Oesophagus: React.FC<SceneProps> = ({t, dur}) => {
  const p = clamp01(t / dur);
  const waveY = lerp(260, 1560, ramp(t, dur * 0.05, dur * 0.95));
  return (
    <Shot t={t} dur={dur} push={0.06}>
      <AbsoluteFill style={{background: 'radial-gradient(70% 60% at 50% 50%, #A63942 0%, #5E171D 60%, #2A090C 100%)'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <path d="M330 0 Q420 480 340 960 Q270 1440 360 1920 L0 1920 L0 0 Z" fill="#8E2A32" opacity={0.9} />
          <path d="M750 0 Q660 480 740 960 Q810 1440 720 1920 L1080 1920 L1080 0 Z" fill="#8E2A32" opacity={0.9} />
          <rect x={300} y={0} width={480} height={1920} fill="#B0454E" opacity={0.35} />
          <ellipse cx={540} cy={waveY} rx={300} ry={130} fill="#D9636B" opacity={0.5} />
          <ellipse cx={540} cy={waveY} rx={230} ry={90} fill="#F08C8C" opacity={0.45} />
          <Capsule x={540} y={waveY + 250} len={190} h={82} rot={-90 + 14 * Math.sin(t / 9)} scale={0.92} />
        </svg>
      </AbsoluteFill>
    </Shot>
  );
};

/* --------------------------------------------------------------- 05 stomach */
export const S05Stomach: React.FC<SceneProps> = ({t, dur}) => {
  const p = clamp01(t / dur);
  const y = lerp(320, 900, ramp(t, 0, dur * 0.7));
  return (
    <Shot t={t} dur={dur} push={0.07}>
      <AbsoluteFill style={{background: 'radial-gradient(80% 65% at 50% 55%, #5B2A12 0%, #3A1608 60%, #1D0A04 100%)'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <ellipse cx={540} cy={1180} rx={520} ry={380} fill={C.acidDark} opacity={0.9} />
          <ellipse cx={540} cy={1140} rx={470} ry={320} fill={C.acid} opacity={0.75} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const q = loop(t, 34, i * 4.7);
            return (
              <circle
                key={i}
                cx={260 + i * 78 + 18 * Math.sin((t + i * 11) / 7)}
                cy={lerp(1150, 700, q)}
                r={lerp(10, 26, q)}
                fill="#E8F7A6"
                opacity={0.75 * (1 - q)}
              />
            );
          })}
          <Capsule x={540} y={y} len={230} h={100} rot={18} scale={0.95} />
          <ellipse cx={540} cy={1160} rx={170 + 30 * Math.sin(t / 6)} ry={40} fill="#E8F7A6" opacity={0.35} />
        </svg>
        <Foreground>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <path d="M-80 1920 L-80 1520 Q540 1400 1160 1520 L1160 1920 Z" fill="#2E1105" />
          </svg>
        </Foreground>
      </AbsoluteFill>
    </Shot>
  );
};

/* -------------------------------------------------------------- 06 dissolve */
export const S06Dissolve: React.FC<SceneProps> = ({t, dur}) => {
  const erode = ramp(t, 0, dur * 0.9);
  const w = lerp(330, 120, erode);
  return (
    <Shot t={t} dur={dur} push={0.09}>
      <AbsoluteFill style={{background: 'radial-gradient(80% 65% at 50% 50%, #6B3A12 0%, #3E1B08 60%, #1C0904 100%)'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <ellipse cx={540} cy={960} rx={480} ry={420} fill={C.acidDark} opacity={0.5} />
          <g transform="translate(540 960)">
            <rect x={-w / 2} y={-150} width={w} height={300} rx={150} fill={C.cream} />
            <rect x={0} y={-150} width={w / 2} height={300} rx={150} fill={C.red} opacity={0.95} />
            <rect x={-w / 2 + 22} y={-110} width={w - 44} height={220} rx={110} fill="#2A1206" opacity={0.75} />
            <ellipse cx={-w * 0.16} cy={-70} rx={34} ry={18} fill="#fff" opacity={0.28} />
          </g>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const q = loop(t, 22, i * 3.1);
            const side = i % 2 ? 1 : -1;
            return (
              <circle
                key={i}
                cx={540 + side * (w / 2 + lerp(80, 10, q))}
                cy={960 + (i - 3) * 46}
                r={lerp(18, 6, q)}
                fill="#E8F7A6"
                opacity={0.85 * (1 - q * 0.4)}
              />
            );
          })}
        </svg>
      </AbsoluteFill>
    </Shot>
  );
};

/* ----------------------------------------------------------------- 07 split */
export const S07Split: React.FC<SceneProps> = ({t, dur}) => {
  const open = ramp(t, 0, dur * 0.85);
  return (
    <Shot t={t} dur={dur} push={0.08}>
      <AbsoluteFill style={{background: 'radial-gradient(80% 65% at 50% 50%, #6B3A12 0%, #3E1B08 60%, #1C0904 100%)'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <ellipse cx={540} cy={980} rx={520} ry={400} fill={C.acidDark} opacity={0.45} />
          <Capsule x={540} y={900} len={300} h={128} rot={-6} split={open * 130} />
          {Array.from({length: 26}).map((_, i) => {
            const seed = (i * 37) % 100;
            const q = loop(t, 40, i * 1.6);
            const dx = (seed - 50) * 7 * (0.4 + open);
            return (
              <circle
                key={i}
                cx={540 + dx}
                cy={lerp(940, 1500, q)}
                r={7 + (i % 4) * 3}
                fill={i % 3 === 0 ? C.red : '#F2C89A'}
                opacity={open * (1 - q) * 0.95}
              />
            );
          })}
          <ellipse cx={540} cy={1560} rx={330} ry={90} fill={C.acid} opacity={0.5} />
        </svg>
      </AbsoluteFill>
    </Shot>
  );
};

/* -------------------------------------------------------------- 08 gut wall */
export const S08GutWall: React.FC<SceneProps> = ({t, dur}) => {
  const p = clamp01(t / dur);
  return (
    <Shot t={t} dur={dur} push={0.07}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #3E1B08 0%, #6B3A12 45%, #4A1116 100%)'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect x={0} y={880} width={1080} height={90} fill={C.membrane} opacity={0.95} />
          {Array.from({length: 9}).map((_, i) => (
            <path
              key={i}
              d={`M${i * 130} 880 q65 ${-90 - 18 * Math.sin(t / 6 + i)} 130 0`}
              fill="none"
              stroke={C.membrane}
              strokeWidth={26}
              strokeLinecap="round"
            />
          ))}
          <rect x={0} y={970} width={1080} height={950} fill={C.blood} opacity={0.9} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const q = loop(t, 44, i * 6.2);
            const y = lerp(760, 1260, q);
            return (
              <circle
                key={i}
                cx={180 + i * 120 + 26 * Math.sin((t + i * 13) / 9)}
                cy={y}
                r={16}
                fill="#FFE9A8"
                opacity={q < 0.45 ? 0.95 : 0.35 + 0.5 * p}
              />
            );
          })}
          {[0, 1, 2, 3].map((i) => {
            const q = loop(t, 30, i * 7.5);
            return (
              <ellipse
                key={`c${i}`}
                cx={lerp(-100, 1180, q)}
                cy={1180 + (i % 2) * 140}
                rx={62}
                ry={40}
                fill="#D6313C"
                opacity={0.85}
              />
            );
          })}
        </svg>
      </AbsoluteFill>
    </Shot>
  );
};

/* ----------------------------------------------------------------- 09 blood */
export const S09Blood: React.FC<SceneProps> = ({t, dur}) => {
  return (
    <Shot t={t} dur={dur} push={0.11}>
      <AbsoluteFill style={{background: 'radial-gradient(70% 60% at 50% 50%, #C3303A 0%, #8C1822 55%, #4A0A10 100%)'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <path d="M0 620 Q540 480 1080 620 L1080 1300 Q540 1440 0 1300 Z" fill="#D6313C" opacity={0.55} />
          <path d="M0 700 Q540 580 1080 700 L1080 1220 Q540 1340 0 1220 Z" fill="#E2464F" opacity={0.35} />
          {Array.from({length: 14}).map((_, i) => {
            const q = loop(t, 52, i * 3.7);
            return (
              <ellipse
                key={i}
                cx={lerp(1180, -160, q)}
                cy={760 + (i % 5) * 96 + 16 * Math.sin((t + i * 7) / 8)}
                rx={58}
                ry={38}
                fill="#B3232B"
                opacity={0.9}
              />
            );
          })}
          <circle cx={lerp(1180, -160, loop(t, 52, 20))} cy={960} r={22} fill="#FFE9A8" />
        </svg>
      </AbsoluteFill>
    </Shot>
  );
};

/* ----------------------------------------------------------------- 10 liver */
export const S10Liver: React.FC<SceneProps> = ({t, dur}) => {
  return (
    <Shot t={t} dur={dur} push={0.06}>
      <AbsoluteFill style={{background: 'radial-gradient(80% 65% at 55% 50%, #6E2A16 0%, #3B1108 60%, #1B0603 100%)'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <path
            d="M240 760 Q420 620 700 690 Q900 740 880 940 Q860 1160 620 1190 Q380 1220 260 1040 Q180 900 240 760 Z"
            fill="#8C3A22"
          />
          <path
            d="M300 800 Q440 700 660 760 Q820 810 800 950 Q780 1110 600 1130 Q420 1150 330 1010 Q270 910 300 800 Z"
            fill="#A6482C"
            opacity={0.8}
          />
          {Array.from({length: 16}).map((_, i) => {
            const q = loop(t, 60, i * 4.4);
            const arrive = q > 0.42;
            const cx = lerp(-120, 560, q);
            return (
              <circle
                key={i}
                cx={cx}
                cy={960 + (i % 4) * 60 - 90}
                r={16}
                fill="#FFE9A8"
                opacity={arrive && i % 3 !== 0 ? 0 : 0.95}
              />
            );
          })}
          {[0, 1, 2].map((i) => {
            const q = loop(t, 60, i * 9.5 + 30);
            return (
              <circle
                key={`out${i}`}
                cx={lerp(820, 1220, q)}
                cy={880 + i * 70}
                r={15}
                fill="#FFE9A8"
                opacity={0.9}
              />
            );
          })}
        </svg>
        <Foreground>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <rect x={-140} y={1500} width={1400} height={560} rx={200} fill="#2A0C05" />
          </svg>
        </Foreground>
      </AbsoluteFill>
    </Shot>
  );
};

/* --------------------------------------------------------------- 11 the share */
export const S11Share: React.FC<SceneProps> = ({t, dur}) => {
  const show = ramp(t, dur * 0.1, dur * 0.6);
  const taken = ramp(t, dur * 0.45, dur * 0.95);
  return (
    <Shot t={t} dur={dur} push={0.05}>
      <Stage t={t}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect x={110} y={840} width={860} height={240} rx={120} fill="#0E2A3A" opacity={0.28} />
          {Array.from({length: 10}).map((_, i) => {
            const x = 200 + i * 76;
            const isTaken = i < 6;
            return (
              <circle
                key={i}
                cx={x}
                cy={960}
                r={26}
                fill={isTaken ? C.red : '#FFE9A8'}
                opacity={show * (isTaken ? 1 - taken * 0.85 : 1)}
              />
            );
          })}
          <rect
            x={110}
            y={1150}
            width={860 * taken}
            height={10}
            rx={5}
            fill={C.cream}
            opacity={0.5 * taken}
          />
        </svg>
      </Stage>
    </Shot>
  );
};

/* --------------------------------------------------------------- 12 answer */
export const S12Answer: React.FC<SceneProps> = ({t, dur}) => {
  const pulse = 0.5 + 0.5 * Math.sin(t / 9);
  return (
    <Shot t={t} dur={dur} push={0.04}>
      <Stage t={t}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <circle cx={540} cy={940} r={230 + pulse * 26} fill="none" stroke={C.cream} strokeWidth={5} opacity={0.3} />
          <circle cx={540} cy={940} r={310 + pulse * 40} fill="none" stroke={C.cream} strokeWidth={3} opacity={0.16} />
          <Capsule x={540} y={940} len={330} h={140} rot={-14} />
          {[0, 1, 2].map((i) => {
            const q = loop(t, 70, i * 23);
            return (
              <circle
                key={i}
                cx={540 + 400 * Math.cos(q * Math.PI * 2)}
                cy={940 + 400 * Math.sin(q * Math.PI * 2)}
                r={14}
                fill="#FFE9A8"
                opacity={0.9}
              />
            );
          })}
        </svg>
      </Stage>
    </Shot>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  '01-hook': S01Hook,
  '02-mouth': S02Mouth,
  '03-throat': S03Throat,
  '04-oesophagus': S04Oesophagus,
  '05-stomach': S05Stomach,
  '06-dissolve': S06Dissolve,
  '07-split': S07Split,
  '08-gutwall': S08GutWall,
  '09-blood': S09Blood,
  '10-liver': S10Liver,
  '11-share': S11Share,
  '12-answer': S12Answer,
};
