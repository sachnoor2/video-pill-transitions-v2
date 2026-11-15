# Continuous joins — how this film is cut

A 38-second vertical short, built to answer one criticism: that scene-to-scene transitions
read as clips stitched together instead of one film.

The fix is not a transition effect. It is a rule about how two shots are authored:

> Shot A is still **moving** when it ends, and shot B is **already moving** on its first frame.
> The join is decided before anything is drawn — the two shots agree on motion direction,
> speed, framing scale and light.

## The engine — `src/joins.tsx`

A join is a shared motion value, `p`, that runs 0→1 across an 18-frame window centred on the
nominal cut (9 frames before, 9 after). Both shots are rendered simultaneously and both are
transformed by the same `p`.

| Kind | What it does | Used on |
|---|---|---|
| `push` | The outgoing shot keeps growing past the lens while a circular hole at the subject opens into the next world. The hole only blows out at the very end — a mask that reaches full frame halfway is a cut, not a dive. | 6 joins |
| `portal` | Same idea, harder: the outgoing world blows past the camera (scale ×8, heavy blur) and the incoming world opens out from the same point, starting small. | 4 joins |
| `squeeze` | The outgoing frame compresses to zero width while the incoming arrives at exactly the same rate, so the two edges stay welded. Sliding two full-bleed layers instead leaves a hole of background — the tell that made the first pass look stitched. | 1 join |
| `flash` | One blow-out, held for ~4 frames. The outgoing shot stays **on top** until the white peaks, so the swap happens hidden inside the flash. | 1 join |

Two defects the QA strips caught on the first render, both fixed here:

1. `squeeze` was sliding both layers, leaving a black gap between them.
2. `flash` put the incoming shot on top, so the swap happened *before* the blow-out — it read
   as a cut with a bright frame after it.

## Motion never stops

`src/Film.tsx` remaps each shot's local time across its extended window
(`dur + 2 × HALF`) so a shot is already moving during its pre-roll and still moving after its
official end. `Shot` in `src/ui.tsx` adds a slow push to every scene, and each scene carries
its own secondary motion (falling saliva, rising bubbles, spilling granules, flowing cells,
drifting dust). No shot is a still.

## Sound carries the join

- One whoosh per join, starting **10 frames before** the boundary (a J-cut — you hear the
  change before you see it).
- A low impact layered under the whoosh at the flash join.
- Narration is one file per shot, starting exactly on its frame; shot length is derived from
  the measured audio, never typed.

## Measured on the delivered file

- 1080×1920, 30 fps, h264 + aac, 38.4 s, 12 shots → **18.8 shots/min** (target 15–22)
- mean volume −17.0 dB, peak −2.9 dB
- `blackdetect` at scene boundaries: **none**
- speaking rate **~175 wpm** (was 206 — slowed with `speed: 0.85`; the TTS step now fails
  loudly above 200 wpm)
- every shot's final 50 ms is silence, so no line is clipped mid-word

## Rebuilding

```
python scripts/tts.py     # Kokoro am_michael -> public/audio/*.wav + src/manifest.json
python scripts/foley.py   # whooshes and the impact
npx remotion render src/index.ts Film out/video.mp4
```

GitHub Actions (`.github/workflows/render.yml`) runs all of it on push and uploads the MP4.
