"""Kokoro TTS for the film. Writes one WAV per shot and the timing manifest.

Scene length is DERIVED from the measured audio, never typed by hand.
"""
import json
import os
import wave

import numpy as np
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NARR = json.load(open(os.path.join(ROOT, "narration.json")))
OUT_AUDIO = os.path.join(ROOT, "public", "audio")
os.makedirs(OUT_AUDIO, exist_ok=True)

kokoro = Kokoro(
    os.path.join(ROOT, "models", "kokoro-v1.0.onnx"),
    os.path.join(ROOT, "models", "voices-v1.0.bin"),
)

fps = NARR["fps"]
pad = NARR["pad"]
min_s = NARR["minSeconds"]
cursor = 0
scenes = []

for sc in NARR["scenes"]:
    samples, sr = kokoro.create(
        sc["text"],
        voice=NARR["voice"],
        speed=NARR.get("speed", 1.0),
        lang=NARR["lang"],
    )
    samples = np.asarray(samples, dtype=np.float32)
    peak = float(np.max(np.abs(samples))) or 1.0
    samples = samples / peak
    # soft-knee limiting: lifts the average level ~5 dB without clipping the peaks,
    # so the narration lands in the -22..-14 dB mean window the QA gate wants
    samples = np.tanh(samples * 2.2)
    samples = samples / (float(np.max(np.abs(samples))) or 1.0) * 0.97

    path = os.path.join(OUT_AUDIO, f"{sc['id']}.wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((samples * 32767).astype("<i2").tobytes())

    measured = len(samples) / sr
    seconds = max(measured, min_s)
    dur = int(round((seconds + pad) * fps))

    scenes.append(
        {
            "id": sc["id"],
            "text": sc["text"],
            "start": cursor,
            "dur": dur,
            "seconds": round(seconds, 3),
            "joinOut": sc["joinOut"],
        }
    )
    cursor += dur
    print(f"{sc['id']:>14}  {measured:5.2f}s raw  {seconds:5.2f}s used  {dur:4d}f  start {cursor}")

manifest = {
    "fps": fps,
    "width": NARR["width"],
    "height": NARR["height"],
    "title": NARR["title"],
    "voice": NARR["voice"],
    "scenes": scenes,
    "totalFrames": cursor,
    "totalSeconds": round(cursor / fps, 3),
}

with open(os.path.join(ROOT, "src", "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)

print(f"\ntotal {cursor} frames = {cursor / fps:.2f}s, {len(scenes)} shots")
print(f"cut density {(len(scenes)) / (cursor / fps / 60):.1f} shots/min")
