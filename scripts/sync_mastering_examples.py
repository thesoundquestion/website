#!/usr/bin/env python3
"""Regenerate the original figures in Decoder Lesson 23 using only Python's standard library."""

from collections import deque
from dataclasses import dataclass
from math import cos, exp, log, log10, sin, sqrt, tau
from pathlib import Path
import re


PAGE = Path(__file__).resolve().parents[1] / "decoder/mastering-dynamic-range/index.html"
SAMPLE_RATE = 48000
DURATION = 4
LOAD = 8
ACCENT = 2.08
FRAME = (64, 18, 594, 201)
WIDTH, HEIGHT = 620, 254
BUCKETS = 240
VOLTAGE_LIMIT = 12
REFERENCE = ("Original master", "#90e6f6", "")
REMASTER = ("Later remaster", "#ffc280", "6 3")
APPROACHES = (
    ("Restrained", "#90e6f6", ""),
    ("Moderate", "#b7e495", "5 3"),
    ("Heavy limiting", "#ffc280", "2 3"),
)


def make_mix():
    """Build a stereo phrase with a pitched backing and six decaying drum hits."""
    hits = ((0.42, .53), (.97, .58), (1.50, .63), (ACCENT, .93), (2.65, .72), (3.20, .63))
    channels = [], []
    for i in range(DURATION * SAMPLE_RATE):
        t = i / SAMPLE_RATE
        fade = min(1, t / .07, (DURATION - t) / .26)
        build = .7 + .3 * min(1, max(0, (t - 1.4) / .58))
        bass = .34 * build * sin(tau * 55 * t) * (.83 + .17 * cos(tau * 1.9 * t))
        notes = .130 * sin(tau * 165 * t) + .065 * sin(tau * 330 * t + .3)
        detail = .025 * sin(tau * 4650 * t) + .018 * sin(tau * 6600 * t + .2)
        drums = 0
        for start, strength in hits:
            age = t - start
            if 0 <= age < .37:
                attack = min(1, age / .0015)
                body = .60 * exp(-age / .051) * sin(tau * 94 * age)
                crack = .55 * exp(-age / .010) * (
                    sin(tau * 742 * age) + .35 * sin(tau * 3511 * age)
                )
                drums += strength * attack * (body + crack)
        channels[0].append(fade * (bass + notes + detail + drums))
        channels[1].append(fade * (bass + .82 * notes - .67 * detail + .96 * drums))
    scale = max(abs(sample) for channel in channels for sample in channel)
    return tuple([sample / scale for sample in channel] for channel in channels)


def envelope_gain(channels, threshold, ratio, attack_ms, release_ms):
    attack = exp(-1000 / (SAMPLE_RATE * attack_ms))
    release = exp(-1000 / (SAMPLE_RATE * release_ms))
    envelope = 0
    for left, right in zip(*channels):
        level = max(abs(left), abs(right))
        coefficient = attack if level > envelope else release
        envelope = coefficient * envelope + (1 - coefficient) * level
        yield max(1, envelope / threshold) ** (1 / ratio - 1)


def upcoming_peaks(channels, lookahead):
    """Return the maximum absolute sample in the next lookahead interval."""
    amplitudes = [max(abs(left), abs(right)) for left, right in zip(*channels)]
    window = deque()
    peaks = []
    for i in reversed(range(len(amplitudes))):
        while window and window[0] > i + lookahead:
            window.popleft()
        while window and amplitudes[window[-1]] <= amplitudes[i]:
            window.pop()
        window.append(i)
        peaks.append(amplitudes[window[0]])
    return reversed(peaks)


def process(channels, threshold, ratio, attack_ms, release_ms, makeup, ceiling):
    gain = list(envelope_gain(channels, threshold, ratio, attack_ms, release_ms))
    raised = tuple([v * g * makeup for v, g in zip(channel, gain)] for channel in channels)
    limiter_gain = 1
    release = exp(-1000 / (SAMPLE_RATE * 42))
    limited = [], []
    for left, right, future_peak in zip(*raised, upcoming_peaks(raised, int(.004 * SAMPLE_RATE))):
        target = min(1, ceiling / future_peak) if future_peak else 1
        limiter_gain = min(target, release * limiter_gain + 1 - release)
        limited[0].append(left * limiter_gain)
        limited[1].append(right * limiter_gain)
    return limited


def lowpass_coefficient(frequency):
    return exp(-tau * frequency / SAMPLE_RATE)


LOW = lowpass_coefficient(165)
HIGH = lowpass_coefficient(3600)
BOOST = 10 ** (2.5 / 20) - 1
CUT = 10 ** (-2.5 / 20) - 1


def equalize(channel):
    low = high = 0
    output = []
    for sample in channel:
        low = LOW * low + (1 - LOW) * sample
        high = HIGH * high + (1 - HIGH) * sample
        output.append(sample + BOOST * low + CUT * (sample - high))
    return output


def eq_db(frequency):
    angle = -tau * frequency / SAMPLE_RATE
    delay = complex(cos(angle), sin(angle))
    low = (1 - LOW) / (1 - LOW * delay)
    high = 1 - (1 - HIGH) / (1 - HIGH * delay)
    return 20 * log10(abs(1 + BOOST * low + CUT * high))


@dataclass(frozen=True)
class Levels:
    peak: float
    rms: float

    @classmethod
    def measure(cls, signal):
        return cls(max(map(abs, signal)), sqrt(sum(v * v for v in signal) / len(signal)))

    @property
    def crest(self):
        return 20 * log10(self.peak / self.rms)

    @property
    def average_watts(self):
        return self.rms ** 2 / LOAD

    @property
    def instantaneous_watts(self):
        return self.peak ** 2 / LOAD


def to_volts(signal, scale):
    return [scale * value for value in signal]


def match(signal, metric, target):
    return to_volts(signal, target / getattr(Levels.measure(signal), metric))


def axis(ticks, lower, upper, logarithmic=False):
    left, top, right, bottom = FRAME
    high = 4 if logarithmic else VOLTAGE_LIMIT

    def x(value):
        if logarithmic:
            return left + (right - left) * log(value / lower) / log(upper / lower)
        fraction = (value - lower) / (upper - lower)
        return left + (right - left) * fraction

    def y(value):
        return bottom - (bottom - top) * (value + high) / (2 * high)

    items = [f'<rect class="ma-grid-frame" x="{left}" y="{top}" width="{right-left}" height="{bottom-top}" rx="3"/>']
    for level in ((-4, -2, 0, 2, 4) if logarithmic else (-10, -5, 0, 5, 10)):
        ordinate = y(level)
        grid_class = "ma-zero" if level == 0 else "ma-gridline"
        items.append(f'<path class="{grid_class}" d="M{left} {ordinate:.1f}H{right}"/>')
        items.append(f'<text class="ma-tick" x="{left-9}" y="{ordinate:.1f}" dy=".33em" text-anchor="end">{str(level).replace("-", "−")}</text>')
    for value, label in ticks:
        abscissa = x(value)
        items.append(f'<path class="ma-gridline" d="M{abscissa:.1f} {top}V{bottom}"/>')
        items.append(f'<text class="ma-tick" x="{abscissa:.1f}" y="{bottom+29}" text-anchor="middle">{label}</text>')
    return items, x, y


def trace(style, points, x, y):
    label, stroke, dash = style
    path = " ".join(
        "M" + " ".join(f"{x(time):.1f},{y(value):.1f}" for time, value in segment)
        for segment in points
    )
    dashed = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path data-trace="{label}" class="ma-trace" stroke="{stroke}"{dashed} d="{path}"/>'


def wave_plot(series):
    ticks = [(i, f"{i} s" if i == DURATION else str(i)) for i in range(DURATION + 1)]
    items, x, y = axis(ticks, 0, DURATION)
    items.append(f'<path class="ma-hit" d="M{x(ACCENT):.1f} {FRAME[1]}V{FRAME[3]}"/>')
    for style, signal in series:
        if Levels.measure(signal).peak > VOLTAGE_LIMIT:
            raise ValueError(f"{style[0]} exceeds the common ±{VOLTAGE_LIMIT} V chart scale")
        step = len(signal) // BUCKETS
        lows, highs = [], []
        for start in range(0, len(signal), step):
            samples = signal[start:start + step]
            t = (start + len(samples) / 2) / SAMPLE_RATE
            lows.append((t, min(samples)))
            highs.append((t, max(samples)))
        items.append(trace(style, (highs, lows), x, y))
    return "\n".join(items)


def eq_plot():
    ticks = [(30, "30"), (100, "100"), (1000, "1k"), (10000, "10k"), (15000, "")]
    items, x, y = axis(ticks, 30, 15000, logarithmic=True)
    frequencies = [30 * (15000 / 30) ** (i / 160) for i in range(161)]
    items.append(trace(REFERENCE, ([(30, 0), (15000, 0)],), x, y))
    items.append(trace(REMASTER, ([(f, eq_db(f)) for f in frequencies],), x, y))
    return "\n".join(items)


def chart(cases):
    groups = []
    for i, (key, description, markup) in enumerate(cases):
        hidden = "" if i == 0 else " hidden"
        groups.append(f'<g data-plot-case="{key}" data-plot-summary="{description}"{hidden}>\n{markup}\n</g>')
    groups_markup = "\n".join(groups)
    return f'<svg class="dl-graph ma-graph" viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-label="{cases[0][1]}">\n{groups_markup}\n</svg>'


def level_cards(series):
    cards = []
    for (label, color, _), signal in series:
        level = Levels.measure(signal)
        values = (
            ("Peak level", f"{level.peak:.2f} V"),
            ("Average level", f"{level.rms:.2f} V"),
            ("Peak above average", f"{level.crest:.1f} dB"),
            ("Average power", f"{level.average_watts:.2f} W"),
            ("Power at peak", f"{level.instantaneous_watts:.2f} W"),
        )
        stats = "".join(f"<div><dt>{name}</dt><dd>{value}</dd></div>" for name, value in values)
        cards.append(f'<div class="ma-level" style="--trace:{color}"><h4>{label}</h4><dl>{stats}</dl></div>')
    return '<div class="ma-levels">\n' + "\n".join(cards) + "\n</div>"


def figures():
    mix = make_mix()
    moderate = process(mix, .32, 2.5, 7, 95, 1.3, .72)
    heavy = process(mix, .23, 4, 4, 82, 2.15, .48)
    original = mix[0]
    signals = original, moderate[0], heavy[0]
    peaks = list(zip(APPROACHES, [match(signal, "peak", 10) for signal in signals]))
    averages = list(zip(APPROACHES, [match(signal, "rms", 2) for signal in signals]))
    voltage_scale = 10 / Levels.measure(original).peak
    remastered = process(tuple(equalize(c) for c in mix), .38, 2, 10, 100, 1.30, .89)[0]
    versions = [(REFERENCE, to_volts(original, voltage_scale)), (REMASTER, to_volts(remastered, voltage_scale))]
    return {
        "LEVEL_WAVES": chart([
            ("peak", "Three versions with the same peak level of 10 volts. The heavily limited version stays at a higher level between drum hits. Time runs from zero to four seconds.", wave_plot(peaks)),
            ("rms", "Three versions with the same average level of 2 volts RMS. The restrained version has the largest drum hit. Time runs from zero to four seconds.", wave_plot(averages)),
        ]),
        "LEVEL_PEAK_CARDS": level_cards(peaks),
        "LEVEL_RMS_CARDS": level_cards(averages),
        "REMASTER_PLOTS": chart([
            ("dynamics", "Original and remastered versions at the same playback setting. The remaster has a lower peak level and a higher average level.", wave_plot(versions)),
            ("tone", "Equalizer gain before dynamics processing. Bass is boosted and treble is reduced for the later master. The original is flat at zero decibels.", eq_plot()),
        ]),
        "REMASTER_CARDS": level_cards(versions),
    }


def sync():
    page = PAGE.read_text(encoding="utf-8")
    for key, markup in figures().items():
        pattern = rf"(<!-- {key}_BEGIN -->)\n[\s\S]*?(<!-- {key}_END -->)"
        page, matches = re.subn(pattern, lambda m: f"{m[1]}\n{markup}\n{m[2]}", page)
        if matches != 1:
            raise SystemExit(f"Expected one generated slot for {key}, found {matches}")
    PAGE.write_text(page, encoding="utf-8")


if __name__ == "__main__":
    sync()
