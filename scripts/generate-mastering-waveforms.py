#!/usr/bin/env python3
"""Create Audacity-style stereo min/max waveform SVGs from published Mastering FLACs.

Offline GitHub Actions build ONLY. NEVER download audio or decode waveform data
for visitors merely opening the Mastering lesson. Source files are not committed.

Each of 960 horizontal bins measures *signed* sample minima and maxima of
both stereo channels, plus per-bin RMS. Every master uses the SAME vertical
sample-amplitude scale. This retains actual attacks, asymmetry, peak limits
and average level rather than independently normalizing away the differences.
"""
from array import array
from datetime import datetime, timezone
from hashlib import sha256
import json
import math
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "waveforms"
HOST = "https://tsq-lab-audio.thesoundquestion.workers.dev"
SOURCES = {
    "dynamic": ("mastering/dynamic.flac", "Dynamic master", "#81dded"),
    "moderate": ("mastering/moderate.flac", "Moderately compressed master", "#b7e5ad"),
    "brickwalled": ("mastering/brickwalled.flac", "Brickwalled master", "#ffb88c"),
}
BINS = 960
WIDTH, HEIGHT = 960, 108
CENTERS = (28.0, 80.0)
AMPLITUDE = 20.0

def run(cmd):
    return subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout

def download(path, dest):
    request = Request(HOST + "/" + path, headers={"User-Agent": "TSQ-Static-Waveform-Generator/2.0"})
    with urlopen(request, timeout=120) as response:
        if response.status != 200:
            raise RuntimeError(f"Unexpected HTTP {response.status} for {path}")
        dest.write_bytes(response.read())
    if not 100_000 < dest.stat().st_size < 25 * 1024 * 1024:
        raise RuntimeError(f"Unexpected FLAC size for {path}")
    return sha256(dest.read_bytes()).hexdigest()

def measure(path):
    info = json.loads(run(["ffprobe", "-v", "error", "-select_streams", "a:0",
                           "-show_entries", "stream=codec_name,sample_rate,channels:format=duration",
                           "-of", "json", str(path)]))
    stream, fmt = info["streams"][0], info["format"]
    if stream["codec_name"] != "flac" or int(stream["sample_rate"]) != 44100 or int(stream["channels"]) != 2:
        raise RuntimeError(f"Unexpected audio parameters: {path}: {stream}")
    seconds = float(fmt["duration"])
    if not 39 <= seconds <= 41:
        raise RuntimeError(f"Expected the full 40-second mastering sample: {path}: {seconds}")
    raw = run(["ffmpeg", "-hide_banner", "-v", "error", "-nostdin", "-i", str(path),
               "-map", "0:a:0", "-ar", "44100", "-ac", "2", "-f", "f32le", "pipe:1"])
    if len(raw) % 8:
        raise RuntimeError(f"Unexpected PCM byte count: {path}")
    samples = array("f")
    samples.frombytes(raw)
    if sys.byteorder != "little":
        samples.byteswap()
    frames = len(samples) // 2
    if frames < 44100 * 39:
        raise RuntimeError("Too few audio frames")
    envelopes = [[], []]
    for index in range(BINS):
        start = index * frames // BINS
        stop = (index + 1) * frames // BINS
        count = stop - start
        lows = [float("inf"), float("inf")]
        highs = [float("-inf"), float("-inf")]
        energies = [0.0, 0.0]
        for pos in range(start * 2, stop * 2, 2):
            for channel in (0, 1):
                x = samples[pos + channel]
                if not math.isfinite(x):
                    raise RuntimeError("Invalid sample in source")
                lows[channel] = min(lows[channel], x)
                highs[channel] = max(highs[channel], x)
                energies[channel] += x * x
        for channel in (0, 1):
            envelopes[channel].append({
                "min": lows[channel],
                "max": highs[channel],
                "rms": math.sqrt(energies[channel] / count),
            })
    return {"duration_seconds": round(seconds, 5), "sample_rate": 44100,
            "channels": 2, "frames": frames, "envelopes": envelopes}

def path_bounds(points, center, scale):
    # Signed (min, max) raw extremes. Exact same linear voltage scale throughout.
    positive = [(i, center - max(0.0, v["max"]) / scale * AMPLITUDE)
                for i, v in enumerate(points)]
    negative = [(i, center - min(0.0, v["min"]) / scale * AMPLITUDE)
                for i, v in enumerate(points)]
    return "M" + " ".join(f"{i},{y:.2f}" for i, y in positive) + \
           " L" + " ".join(f"{i},{y:.2f}" for i, y in reversed(negative)) + " Z"

def path_rms(points, center, scale):
    # Audacity-style translucent central RMS band exposes average density.
    positive = [(i, center - v["rms"] / scale * AMPLITUDE)
                for i, v in enumerate(points)]
    negative = [(i, center + v["rms"] / scale * AMPLITUDE)
                for i, v in enumerate(points)]
    return "M" + " ".join(f"{i},{y:.2f}" for i, y in positive) + \
           " L" + " ".join(f"{i},{y:.2f}" for i, y in reversed(negative)) + " Z"

def svg(label, envelopes, scale, color):
    # All three use the same 0..40 second axis and signed peak/RMS scaling.
    content = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" '
        f'preserveAspectRatio="none" role="img" aria-label="{label}: measured left and right channel waveforms">',
        f'<title>{label}: original 40-second stereo waveform</title>',
        '<desc>Positive and negative sample peaks and a lighter RMS band, '
        'with the same amplitude scale as the other two mastering examples.</desc>',
        '<rect width="960" height="108" fill="#081a2a"/>',
    ]
    for t in range(0, 41, 5):
        x = int(t * WIDTH / 40)
        content.append(f'<path d="M{x} 2V104" stroke="#39546c" stroke-width="1" '
                       f'stroke-opacity="{".48" if t % 10 == 0 else ".23"}"/>')
    for channel, (center, key) in enumerate(zip(CENTERS, ("L", "R"))):
        content.append(f'<path d="M0 {center:.0f}H960" stroke="#8ba8bd" '
                       'stroke-width="1" stroke-opacity=".48" stroke-dasharray="5 4"/>')
        content.append(f'<path d="{path_bounds(envelopes[channel], center, scale)}" '
                       f'fill="{color}" fill-opacity=".48"/>')
        content.append(f'<path d="{path_rms(envelopes[channel], center, scale)}" '
                       f'fill="{color}" fill-opacity=".84"/>')
        content.append(f'<text x="8" y="{center-13:.0f}" fill="#e6f2ff" '
                       f'font-family="sans-serif" font-size="11" font-weight="700">{key}</text>')
    content.append('<path d="M0 54H960" stroke="#46617a" stroke-width="1"/>')
    content.append('</svg>\n')
    return "".join(content)

def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    prepared = {}
    with TemporaryDirectory(prefix="tsq-mastering-waveforms-") as temp:
        for name, (source, label, color) in SOURCES.items():
            path = Path(temp) / (name + ".flac")
            digest = download(source, path)
            measured = measure(path)
            prepared[name] = {"source_url": HOST + "/" + source, "sha256": digest,
                              "label": label, "color": color, **measured}
            print(f"Decoded {name}: {measured['duration_seconds']} s, {measured['frames']} frames, "
                  f"SHA256 {digest}", flush=True)

    common_max = max(abs(item["min"]) for sample in prepared.values()
                     for channel in sample["envelopes"] for item in channel)
    common_max = max(common_max, max(abs(item["max"]) for sample in prepared.values()
                                     for channel in sample["envelopes"] for item in channel))
    if not 0 < common_max <= 2.0 or not math.isfinite(common_max):
        raise RuntimeError("Invalid shared amplitude scale")
    provenance = {
        "description": "Audacity-style sample-peak and RMS waveform SVGs measured from the published 40-second FLAC masters",
        "method": "960 signed min/max and RMS bins, separate stereo channels, fixed common linear sample-amplitude scale",
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "bins": BINS, "channels": 2, "shared_absolute_peak": round(common_max, 9),
        "sources": {},
    }
    for name, item in prepared.items():
        dest = OUTPUT / ("mastering-" + name + ".svg")
        dest.write_text(svg(item["label"], item["envelopes"], common_max, item["color"]), encoding="utf-8")
        if not 1000 < dest.stat().st_size < 120_000:
            raise RuntimeError(f"Unexpected waveform image size {dest}: {dest.stat().st_size}")
        provenance["sources"][name] = {
            "source_url": item["source_url"], "sha256": item["sha256"],
            "duration_seconds": item["duration_seconds"], "frames": item["frames"],
            "svg": "/" + dest.relative_to(ROOT).as_posix(),
            "svg_sha256": sha256(dest.read_bytes()).hexdigest(),
            "peak": round(max(max(abs(v["min"]), abs(v["max"]))
                              for channel in item["envelopes"] for v in channel), 9),
        }
        print(f"Created {dest.relative_to(ROOT)}: {dest.stat().st_size} bytes", flush=True)
    (OUTPUT / "mastering-provenance.json").write_text(
        json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    print("SOURCE-MEASURED TWO-CHANNEL WAVES COMPLETE", flush=True)

if __name__ == "__main__":
    main()
