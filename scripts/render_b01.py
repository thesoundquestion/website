"""Render the editable, resolution-independent B01 lesson figures."""
from math import atan2, cos, dist, exp, log2, radians, sin
from pathlib import Path

OUTPUT = Path(__file__).resolve().parents[1] / "assets/illustrations"
LEFT, RIGHT, CENTER = (-1.1, 1.2), (1.1, 1.2), (0, 3.9)
SEATS = [(-0.65, 3.9), CENTER, (0.65, 3.9)]


def xy(point):
    return 360 + 120 * point[0], 48 + 72 * point[1]


def points(vertices):
    return " ".join(f"{x:.2f},{y:.2f}" for x, y in map(xy, vertices))


def svg(title, body, height=480):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="720" height="{height}" viewBox="0 0 720 {height}">
<title>{title}</title>
<defs>
  <linearGradient id="floor" x2="0" y2="1"><stop stop-color="#20384d"/><stop offset="1" stop-color="#0d1b2b"/></linearGradient>
  <linearGradient id="fabric" x2="0" y2="1"><stop stop-color="#64738b"/><stop offset=".48" stop-color="#3e526b"/><stop offset="1" stop-color="#293a51"/></linearGradient>
  <linearGradient id="cabinet" x2="1" y2="1"><stop stop-color="#637b8e"/><stop offset=".45" stop-color="#293c50"/><stop offset="1" stop-color="#101823"/></linearGradient>
  <radialGradient id="cone"><stop stop-color="#8296a8"/><stop offset=".42" stop-color="#35495a"/><stop offset="1" stop-color="#0b121b"/></radialGradient>
  <marker id="direct" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" viewBox="0 0 8 6"><path d="M0 0L8 3L0 6Z" fill="#67e1f6"/></marker>
  <marker id="bounce" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" viewBox="0 0 8 6"><path d="M0 0L8 3L0 6Z" fill="#ffbf72"/></marker>
</defs>
<rect width="720" height="{height}" rx="18" fill="#0a1423"/>
{body}
</svg>
"""


def furniture():
    room = """<path d="M59 438V35H661V438H648V48H72V438Z" fill="#344b61"/>
<rect x="72" y="48" width="576" height="389" fill="url(#floor)" stroke="#607789" stroke-width="1.5"/>
<path d="M77 54H643M78 60V431M642 60V431" stroke="#48657b" fill="none"/>
<rect x="175" y="225" width="370" height="151" rx="28" fill="#152539" stroke="#314a60"/>
<path d="M185 351H535M185 362H535M185 373H535" stroke="#243c50" opacity=".65"/>
<rect x="224" y="295" width="272" height="94" rx="24" fill="#071222" opacity=".68"/>
<rect x="229" y="289" width="262" height="91" rx="20" fill="url(#fabric)" stroke="#8496aa"/>
<rect x="246" y="308" width="228" height="48" rx="11" fill="#405670"/>
<path d="M322 310V354M398 310V354" stroke="#293a51" stroke-width="2"/>
<rect x="230" y="291" width="24" height="75" rx="11" fill="url(#fabric)" stroke="#718498"/>
<rect x="466" y="291" width="24" height="75" rx="11" fill="url(#fabric)" stroke="#718498"/>
<rect x="241" y="352" width="238" height="24" rx="10" fill="url(#fabric)" stroke="#718498"/>"""
    for source in (LEFT, RIGHT):
        x, y = xy(source)
        room += f"""<g transform="translate({x} {y})">
<ellipse cy="-7" rx="29" ry="20" fill="#090f18" opacity=".55"/>
<rect x="-20" y="-41" width="40" height="41" rx="6" fill="url(#cabinet)" stroke="#657b8c"/>
<rect x="-20" y="-23" width="40" height="26" rx="4" fill="#142335"/>
<circle cy="-10" r="9" fill="url(#cone)" stroke="#8795a3"/>
<circle cx="-13" cy="-10" r="2.6" fill="#8197a9"/>
</g>"""
    return room


def seat_marks():
    return "".join(
        f'<circle cx="{x}" cy="{y}" r="6" fill="#e1effb" stroke="#15283d" stroke-width="2"/>'
        for x, y in map(xy, SEATS)
    )


def coverage(width):
    overlays = []
    for source in (LEFT, RIGHT):
        axis = atan2(CENTER[1] - source[1], CENTER[0] - source[0])
        # At the couch plane, the two angular boundaries intersect y = 3.9 m.
        vertices = [source]
        for angle in (axis - radians(width), axis + radians(width)):
            depth = CENTER[1] - source[1]
            vertices.append((source[0] + depth * cos(angle) / sin(angle), CENTER[1]))
        overlays.append(f'<polygon points="{points(vertices)}" fill="#48cde9" fill-opacity=".20" stroke="#67e1f6" stroke-width="2"/>')
        overlays.append(f'<polyline points="{points([source, CENTER])}" fill="none" stroke="#d0f7ff" stroke-dasharray="5 6" opacity=".75"/>')
    return "".join(overlays)


def reflect():
    lines = []
    for source, wall in ((LEFT, -2.4), (RIGHT, 2.4)):
        image = (2 * wall - source[0], source[1])
        fraction = (wall - image[0]) / (CENTER[0] - image[0])
        contact = (wall, image[1] + fraction * (CENTER[1] - image[1]))
        direct = dist(source, CENTER)
        reflected = dist(source, contact) + dist(contact, CENTER)
        assert abs(reflected - dist(image, CENTER)) < 1e-9
        assert round((reflected - direct) / 343 * 1000, 2) == 4.85
        x, y = xy(contact)
        lines.append(f'<circle cx="{x}" cy="{y}" r="5" fill="#ffbf72"/>')
        lines.append(f'<polyline points="{points([source, contact, CENTER])}" fill="none" stroke="#ffbf72" stroke-width="3.5" stroke-dasharray="10 6" marker-end="url(#bounce)"/>')
        lines.append(f'<polyline points="{points([source, CENTER])}" fill="none" stroke="#67e1f6" stroke-width="3.5" marker-end="url(#direct)"/>')
    return "".join(lines)


def spectral_plot():
    left, right, top, bottom = 78, 684, 52, 288

    def x(f):
        return left + (right - left) * log2(f / 250) / 6

    def y(db):
        return top - db * (bottom - top) / 12

    def label(x_pos, y_pos, value, anchor="middle"):
        return f'<text x="{x_pos}" y="{y_pos}" text-anchor="{anchor}" fill="#dbe9f5" font-family="sans-serif" font-size="23">{value}</text>'

    parts = [label(78, 33, "dB relative to on-axis", "start")]
    for db in range(0, -13, -3):
        yy = y(db)
        parts.extend([f'<path d="M{left} {yy}H{right}" stroke="#526b7e"/>', label(64, yy + 7, str(db), "end")])
    for f in (250, 500, 1000, 2000, 4000, 8000, 16000):
        xx = x(f)
        parts.extend([f'<path d="M{xx} {top}V{bottom}" stroke="#344c62"/>', label(xx, 320, f"{f // 1000}k" if f >= 1000 else str(f))])
    parts.append(label(381, 354, "Frequency (Hz)"))
    for uneven in (False, True):
        vertices = []
        for index in range(121):
            octave = index / 20
            level = -2 - 0.65 * octave
            if uneven:
                level -= 6 * exp(-0.5 * ((octave - 4) / 0.32) ** 2)
            vertices.append(f"{x(250 * 2**octave):.2f},{y(level):.2f}")
        style = 'stroke="#d5b8ff" stroke-dasharray="10 6"' if uneven else 'stroke="#67e1f6"'
        parts.append(f'<polyline points="{" ".join(vertices)}" fill="none" {style} stroke-width="4"/>')
    return "".join(parts)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    room = furniture()
    images = {
        "b01-room-master": svg("Shared B01 listening room", room + seat_marks()),
        "spk-01-wide": svg("Wider horizontal coverage", room + coverage(27) + seat_marks()),
        "spk-01-narrow": svg("Narrower horizontal coverage", room + coverage(8) + seat_marks()),
        "spk-02-off-axis": svg("Synthetic off-axis frequency responses at the same angle", spectral_plot(), 378),
        "spk-03-reflections": svg("Direct and first sidewall paths", room + reflect() + seat_marks()),
    }
    for name, image in images.items():
        (OUTPUT / f"{name}.svg").write_text(image, encoding="utf-8")


if __name__ == "__main__":
    main()
