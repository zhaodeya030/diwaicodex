#!/usr/bin/env python3
"""
DailyDo icon generator — 1024×1024 PNG with "DYTD" block letters.
No external dependencies. Output: app-icon.png

Usage:
    python3 scripts/gen-icon.py
    npx tauri icon app-icon.png   # generates all required sizes
"""
import struct, zlib, math, os

SIZE = 1024
buf  = bytearray(SIZE * SIZE * 4)   # RGBA flat buffer

def put(x, y, r, g, b, a=255):
    if 0 <= x < SIZE and 0 <= y < SIZE:
        i = (y * SIZE + x) * 4
        buf[i], buf[i+1], buf[i+2], buf[i+3] = r, g, b, a

def lerp(a, b, t):
    return int(a + (b - a) * t)

# ── Rounded-square background, dark navy gradient ───────────────
PAD, RAD = 68, 172

for y in range(PAD, SIZE - PAD):
    t  = y / (SIZE - 1)
    br = lerp(42, 20, t)
    bg = lerp(44, 22, t)
    bb = lerp(62, 38, t)

    dy_top = y - (PAD + RAD)
    dy_bot = y - (SIZE - PAD - RAD)
    if dy_top < 0:
        dx = int(math.sqrt(max(0, RAD*RAD - dy_top*dy_top)))
        x0, x1 = PAD + RAD - dx, SIZE - PAD - RAD + dx
    elif dy_bot > 0:
        dx = int(math.sqrt(max(0, RAD*RAD - dy_bot*dy_bot)))
        x0, x1 = PAD + RAD - dx, SIZE - PAD - RAD + dx
    else:
        x0, x1 = PAD, SIZE - PAD - 1

    for x in range(x0, x1 + 1):
        put(x, y, br, bg, bb)

# ── Letter definitions: 5 cols × 8 rows (1 = filled, 0 = empty) ──
GLYPHS = {
    'D': ["11110",
          "10001",
          "10001",
          "10001",
          "10001",
          "10001",
          "10001",
          "11110"],

    'Y': ["10001",
          "10001",
          "01010",
          "01010",
          "00100",
          "00100",
          "00100",
          "00100"],

    'T': ["11111",
          "00100",
          "00100",
          "00100",
          "00100",
          "00100",
          "00100",
          "00100"],
}

# Layout: two rows — "DY" top, "TD" bottom
CELL    = 58          # px per grid cell
COLS    = 5
ROWS    = 8
LW      = COLS * CELL   # 290 px wide per letter
LH      = ROWS * CELL   # 464 px tall per letter
H_GAP   = 30            # gap between the two letters in a row
V_GAP   = 48            # gap between the two rows

total_w = 2 * LW + H_GAP            # 610
total_h = 2 * LH + V_GAP            # 976  (fits inside 1024-2*68=888 ... tight)

# Use smaller cell if it doesn't fit
if total_h > SIZE - 2 * PAD:
    CELL   = 46
    LW     = COLS * CELL
    LH     = ROWS * CELL
    V_GAP  = 36
    total_w = 2 * LW + H_GAP
    total_h = 2 * LH + V_GAP

ox = (SIZE - total_w) // 2
oy = (SIZE - total_h) // 2

ROWS_LAYOUT = [("DY", ox, oy), ("TD", ox, oy + LH + V_GAP)]

for word, row_x, row_y in ROWS_LAYOUT:
    for i, ch in enumerate(word):
        rows = GLYPHS[ch]
        lx = row_x + i * (LW + H_GAP)
        for gy, row in enumerate(rows):
            for gx, bit in enumerate(row):
                if bit == '1':
                    # Filled cell with 3 px inner padding → rounded feel
                    pad = 3
                    x0 = lx + gx * CELL + pad
                    y0 = row_y + gy * CELL + pad
                    x1 = x0 + CELL - 2 * pad
                    y1 = y0 + CELL - 2 * pad
                    for py in range(y0, y1):
                        for px in range(x0, x1):
                            put(px, py, 255, 255, 255, 235)

# ── Encode PNG ──────────────────────────────────────────────────
def chunk(tag, data):
    crc = zlib.crc32(tag + data) & 0xFFFFFFFF
    return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', crc)

rows_bytes = []
for y in range(SIZE):
    rows_bytes.append(b'\x00')
    rows_bytes.append(bytes(buf[y * SIZE * 4:(y + 1) * SIZE * 4]))
raw = b''.join(rows_bytes)

ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', SIZE, SIZE, 8, 6, 0, 0, 0))
idat = chunk(b'IDAT', zlib.compress(raw, 6))
iend = chunk(b'IEND', b'')

out = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'app-icon.png'))
with open(out, 'wb') as f:
    f.write(b'\x89PNG\r\n\x1a\n' + ihdr + idat + iend)

print(f'✓  app-icon.png  ({SIZE}×{SIZE}, dark "DYTD" logo)')
print()
print('Next — generate all icon sizes:')
print('  npx tauri icon app-icon.png')
