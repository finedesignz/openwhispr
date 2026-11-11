"""Regenerates the EdgeAssistant icon set from the geometry in resources/fork/edgeassistant-icon.svg.

Usage: python scripts/fork-generate-icons.py   (needs Pillow)
Writes src/assets/icon.png, icon.ico, icon.icns, brand-mark.png and iconTemplate@3x.png.
"""
import io
import struct
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "src" / "assets"
BG, ACCENT = (11, 18, 32, 255), (45, 212, 191, 255)
BARS = [(144, 392, 240), (304, 272, 480), (464, 192, 640), (624, 312, 400), (784, 412, 200)]
S = 1024


def render(size, bg=True, color=ACCENT):
    scale = 4
    big = S * scale
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if bg:
        d.rounded_rectangle([0, 0, big - 1, big - 1], radius=224 * scale, fill=BG)
    for x, y, h in BARS:
        d.rounded_rectangle(
            [x * scale, y * scale, (x + 96) * scale - 1, (y + h) * scale - 1],
            radius=48 * scale,
            fill=color,
        )
    return img.resize((size, size), Image.LANCZOS)


def icns(sizes):
    chunks = b""
    for tag, size in sizes:
        buf = io.BytesIO()
        render(size).save(buf, "PNG")
        data = buf.getvalue()
        chunks += tag + struct.pack(">I", len(data) + 8) + data
    return b"icns" + struct.pack(">I", len(chunks) + 8) + chunks


render(256).save(ASSETS / "icon.png")
render(256).save(
    ASSETS / "icon.ico",
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
(ASSETS / "icon.icns").write_bytes(
    icns([(b"ic07", 128), (b"ic08", 256), (b"ic09", 512), (b"ic10", 1024)])
)
render(136, bg=False).save(ASSETS / "brand-mark.png")
render(48, bg=False, color=(255, 255, 255, 255)).save(ASSETS / "iconTemplate@3x.png")
print("ok")
