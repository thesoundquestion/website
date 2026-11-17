#!/usr/bin/env python3
"""Generate tiny static SVG previews from the *actual published* mastering FLACs.

Run only during asset preparation (e.g. GitHub Actions), NOT from the browser.
Same full 40-second audio files heard in the original Mastering mode.
Outputs three static SVGs and a SHA256-based provenance manifest; no FLAC is
committed to Pages and no runtime audio requests are needed for previews.
"""
from array import array
from datetime import datetime, timezone
from hashlib import sha256
import json
import math
from pathlib import Path
import struct
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
BINS = 180
WIDTH, HEIGHT = 420, 40


def run(cmd):
    return subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout


def download(path, dest):
    req = Request(HOST + "/" + path, headers={"User-Agent": "TSQ-Static-Waveform-Generator/1.0"})
    with urlopen(req, timeout=120) as response:
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
        raise RuntimeError(f"Wrong file parameters: {path}: {stream}")
    seconds = float(fmt["duration"])
    if not 39.0 <= seconds <= 41.0:
        raise RuntimeError(f"Expected 40 seconds, got {seconds} for {path}")

    raw = run(["ffmpeg", "-hide_banner", "-v", "error", "-nostdin", "-i", str(path),
               "-map", "0:a:0", "-ar", "44100", "-ac", "2", "-f", "f32le", "pipe:1"])
    if len(raw) % 8:
        raise RuntimeError(f"Unexpected PCM byte count for {path}")
    values = array("f")
    values.frombytes(raw)
    if sys.byteorder != "little":
        values.byteswap()
    frames = len(values) // 2
    if frames < 1:
        raise RuntimeError(f"No decoded samples for {path}")

    # A stereo envelope: for each time-bin use the largest mean absolute
    # instantaneous stereo amplitude. This matches the previous JS preview.
    peaks = []
    for index in range(BINS):
        begin = index * frames // BINS
        end = min(frames, (index + 1) * frames // BINS)
        maximum = 0.0
        for sample in range(begin * 2, end * 2, 2):
            amplitude = (abs(values[sample]) + abs(values[sample + 1])) / 2
            if amplitude > maximum:
                maximum = amplitude
        peaks.append(maximum)
    return {"duration_seconds": round(seconds, 5), "sample_rate": 44100,
            "channels": 2, "frames": frames, "peaks": peaks}


def svg(label, peaks, overall_peak, color):
    half, margin = HEIGHT / 2, 2
    top, bottom = [], []
    for index, value in enumerate(peaks):
        x = index * WIDTH / (len(peaks) - 1)
        amp = min(1, value / max(overall_peak, 0.001)) * (half - margin)
        top.append(f"{x:.2f},{half-amp:.2f}")
        bottom.append(f"{x:.2f},{half+amp:.2f}")
    contour = " ".join(top + list(reversed(bottom)))
    crest = " ".join(top)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" '
            f'preserveAspectRatio="none" role="img" aria-label="{label} waveform">'
            f'<line x1="0" y1="{half:.0f}" x2="{WIDTH}" y2="{half:.0f}" '
            'stroke="#8ba8bd" stroke-opacity=".35" stroke-dasharray="3 4"/>'
            f'<polygon points="{contour}" fill="{color}" fill-opacity=".32"/>'
            f'<polyline points="{crest}" fill="none" stroke="{color}" '
            'stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>'
            '</svg>\n')


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    prepared = {}
    with TemporaryDirectory(prefix="tsq-mastering-waveforms-") as temp:
        for kind, (source, label, color) in SOURCES.items():
            path = Path(temp) / (kind + ".flac")
            digest = download(source, path)
            info = measure(path)
            prepared[kind] = {"source_url": HOST + "/" + source,
                              "sha256": digest,
                              "label": label, "color": color, **info}
            print(f"Prepared {kind}: {info['duration_seconds']}s, "
                  f"{info['frames']} frames, source SHA256 {digest}", flush=True)

    # All three comparisons use the *same* vertical scaling. Normalizing each
    # independently would hide the visible differences in waveform density.
    common_peak = max(max(item["peaks"]) for item in prepared.values())
    if not math.isfinite(common_peak) or common_peak <= 0:
        raise RuntimeError("Audio waveform peaks were invalid")
    result = {"description": "Static 40-second mastering waveform previews, measured from the actual publicly streamed FLAC files",
              "method": "180 stereo mean-absolute-peak bins per recording; shared vertical scale across all three",
              "generated_utc": datetime.now(timezone.utc).isoformat(),
              "bins": BINS, "common_peak": round(common_peak, 8), "sources": {}}
    for kind, item in prepared.items():
        dest = OUTPUT / ("mastering-" + kind + ".svg")
        dest.write_text(svg(item["label"], item["peaks"], common_peak, item["color"]), encoding="utf-8")
        result["sources"][kind] = {"source_url": item["source_url"], "sha256": item["sha256"],
                                   "duration_seconds": item["duration_seconds"],
                                   "frames": item["frames"], "svg": "/" + dest.relative_to(ROOT).as_posix(),
                                   "svg_sha256": sha256(dest.read_bytes()).hexdigest(),
                                   "peak": round(max(item["peaks"]), 8)}
        print(f"{dest.relative_to(ROOT)}: {dest.stat().st_size} bytes", flush=True)
    (OUTPUT / "mastering-provenance.json").write_text(
        json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print("THREE REAL MASTERING WAVEFORM ASSETS GENERATED", flush=True)


if __name__ == "__main__":
    main()
