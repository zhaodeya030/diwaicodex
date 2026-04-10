#!/usr/bin/env python3
"""
Generate a 1024x1024 source icon for DailyDo.
No external dependencies — uses only Python built-ins.

Usage:
    python3 scripts/gen-icon.py
    # Then Tauri will generate all required sizes:
    npx tauri icon app-icon.png
"""

import struct
import zlib
import os
import math

def make_rgba_png(width, height, pixels):
    """
    Build a PNG from a flat list of (r, g, b, a) tuples.
    pixels: list of (r,g,b,a), length = width * height, row-major.
    """
    raw_rows = b""
    for y in range(height):
        row = bytes([0])  # filter type = None
        for x in range(width):
            r, g, b, a = pixels[y * width + x]
            row += bytes([r, g, b, a])
        raw_rows += row

    compressed = zlib.compress(raw_rows, 9)

    def chunk(name: bytes, data: bytes) -> bytes:
        crc_data = name + data
        crc = zlib.crc32(crc_data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + crc_data + struct.pack(">I", crc)

    # IHDR: width, height, 8-bit, RGBA (color_type=6), deflate, filter=0, no interlace
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", ihdr)
    png += chunk(b"IDAT", compressed)
    png += chunk(b"IEND", b"")
    return png


def lerp(a, b, t):
    return int(a + (b - a) * t)


def generate_dailydo_icon(size=1024):
    pixels = []

    # Background gradient: deep indigo → bright blue (top → bottom)
    top_color    = (30,  60, 180)   # deep indigo
    bottom_color = (0,  140, 255)   # bright blue

    # Checkmark path (scaled to icon size)
    # We draw a thick rounded checkmark in white
    check_scale = size / 1024.0

    def in_circle(x, y, cx, cy, r):
        return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2

    # Checkmark as thick polyline segments: left leg + right leg
    # Tip of the check at (320, 580), left corner at (200, 440), right end at (780, 270)
    p1 = (200 * check_scale, 440 * check_scale)
    p2 = (320 * check_scale, 580 * check_scale)
    p3 = (780 * check_scale, 270 * check_scale)
    thickness = 90 * check_scale

    def dist_point_to_segment(px, py, ax, ay, bx, by):
        dx, dy = bx - ax, by - ay
        if dx == 0 and dy == 0:
            return math.hypot(px - ax, py - ay)
        t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        nx, ny = ax + t * dx, ay + t * dy
        return math.hypot(px - nx, py - ny)

    def on_check(x, y):
        d1 = dist_point_to_segment(x, y, p1[0], p1[1], p2[0], p2[1])
        d2 = dist_point_to_segment(x, y, p2[0], p2[1], p3[0], p3[1])
        return min(d1, d2) < thickness / 2

    # Rounded square background with padding
    corner_r = size * 0.22
    pad = size * 0.0  # fill whole canvas

    for y in range(size):
        for x in range(size):
            t = y / (size - 1)
            bg_r = lerp(top_color[0], bottom_color[0], t)
            bg_g = lerp(top_color[1], bottom_color[1], t)
            bg_b = lerp(top_color[2], bottom_color[2], t)

            if on_check(x, y):
                # White checkmark with soft anti-alias edge
                d1 = dist_point_to_segment(x, y, p1[0], p1[1], p2[0], p2[1])
                d2 = dist_point_to_segment(x, y, p2[0], p2[1], p3[0], p3[1])
                d = min(d1, d2)
                half = thickness / 2
                alpha = max(0.0, min(1.0, (half - d) / (half * 0.15) + 1))
                pr = lerp(bg_r, 255, alpha)
                pg = lerp(bg_g, 255, alpha)
                pb = lerp(bg_b, 255, alpha)
                pixels.append((pr, pg, pb, 255))
            else:
                pixels.append((bg_r, bg_g, bg_b, 255))

    return make_rgba_png(size, size, pixels)


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "app-icon.png")
    out = os.path.normpath(out)

    print("Generating DailyDo icon (1024×1024)…")
    data = generate_dailydo_icon(1024)
    with open(out, "wb") as f:
        f.write(data)

    size_kb = len(data) / 1024
    print(f"✓  Saved: {out}  ({size_kb:.1f} KB)")
    print()
    print("Next step — generate all icon sizes:")
    print("  npx tauri icon app-icon.png")
