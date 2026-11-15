"""Synthesises the foley: one whoosh per join, plus a low impact on the twist.

Written as 48 kHz mono WAVs so the mix has no dead air at any boundary.
"""
import os
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "audio", "foley")
os.makedirs(OUT, exist_ok=True)

SR = 48000
rng = np.random.default_rng(7)


def smooth_noise(n, window_start=90, window_end=12):
    """White noise whose low-pass window shrinks: a rising, then opening band."""
    noise = rng.normal(0, 1, n)
    out = np.zeros(n)
    acc = 0.0
    for i in range(n):
        k = i / max(1, n - 1)
        win = int(window_start + (window_end - window_start) * k)
        win = max(2, win)
        acc = acc * (1 - 1 / win) + noise[i] / win
        out[i] = acc
    return out / (np.max(np.abs(out)) or 1)


def whoosh(dur=0.55, tilt=1.0):
    n = int(SR * dur)
    body = smooth_noise(n)
    env = np.exp(-((np.linspace(0, 1, n) - 0.42) ** 2) / 0.055)
    tail = np.linspace(1, 0, n) ** 1.4
    sig = body * env * tail
    sig += 0.35 * np.sin(2 * np.pi * np.linspace(180, 90, n) * tilt * np.linspace(0, dur, n)) * env * 0.25
    return sig / (np.max(np.abs(sig)) or 1) * 0.72


def impact(dur=0.9):
    n = int(SR * dur)
    t = np.linspace(0, dur, n)
    thump = np.sin(2 * np.pi * (58 - 18 * t) * t) * np.exp(-t * 5.5)
    click = rng.normal(0, 1, n) * np.exp(-t * 40) * 0.35
    sig = thump * 0.9 + click
    return sig / (np.max(np.abs(sig)) or 1) * 0.85


def write(name, sig):
    path = os.path.join(OUT, name)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(sig, -1, 1) * 32767).astype("<i2").tobytes())
    print("wrote", name, f"{len(sig) / SR:.2f}s")


for i in range(1, 12):
    if i == 10:  # the flash join: impact over a short whoosh
        w = whoosh(0.42)
        imp = impact()
        mixed = np.zeros(max(len(w), len(imp)))
        mixed[: len(w)] += w * 0.5
        mixed[: len(imp)] += imp
        write(f"join-{i:02d}.wav", mixed)
    else:
        write(f"join-{i:02d}.wav", whoosh(0.55, tilt=1.0 if i % 2 else 0.82))
