#!/usr/bin/env python3
"""One-off palette migration: navy+gold -> warm cream + steel blue.

Direction agreed June 2026 (see colour-palette-proposal):
  page bg #F4EFE6, surface #FDFAF3, alt #EDE8DE, dark section #2B3A42,
  text #1E1C17 / muted #6A6560, accent steel blue (#3E7188 text-safe,
  #5A8FA6 decorative), muted sage/amber statuses, border #DDD6CB.
"""
import re, sys, pathlib

HEX_MAP = {
    # navy structural -> blue-charcoal
    "1a3a52": "2b3a42",
    "142e41": "233038",
    "0f2436": "1e2b32",
    "2a5a7a": "3d5260",
    "142040": "233038",
    "1a3a6b": "3d5260",
    "ebf4f8": "e8eef1",
    "ebf2f7": "e8eef1",
    "9dbdd4": "a9c2cd",
    # gold accent -> steel blue
    "a3700f": "3e7188",
    "a56d0e": "3e7188",
    "8a5a0b": "2f5a6e",
    "8a6015": "2f5a6e",
    "fef5e4": "edf4f8",
    "f6cc85": "a9cbd9",
    "fdf6ec": "edf4f8",
    "d9b06a": "c8dde6",
    "c8913a": "5a8fa6",
    "e6ac2a": "7baabb",
    "f0bd48": "8fc0cf",
    # backgrounds -> warm cream
    "f7f5f1": "f4efe6",
    "f5f3ef": "f4efe6",
    "eae8e2": "ede8de",
    "f9f8f5": "f7f2e9",
    "f7f5f3": "f7f2e9",
    "f1ede5": "ece5d6",
    "d6d2ca": "ddd6cb",
    "ddd9d0": "ddd6cb",
    "a8a39a": "a39c8e",
    # text -> warm near-black / warm greys
    "1a2332": "1e1c17",
    "4b5568": "56524a",
    "6b7280": "6a6560",
    "718096": "6a6560",
    # success / tip / teal -> muted sage
    "0d7a5f": "4a6b50",
    "065f46": "3f5f45",
    "ecfdf6": "e9f0e6",
    "ecfdf5": "e9f0e6",
    "6ee7b7": "a9c8ad",
    "86efcd": "a9c8ad",
    "d1fae5": "dff0e4",
    "34d399": "7ba884",
    "2a9d8f": "4f8573",
    "1f7a6f": "3f6b5c",
    # warning -> warm amber
    "92400e": "875325",
    "fffbeb": "f7efdc",
    "fcd34d": "d9bb86",
    # info -> steel blue
    "1d4ed8": "3e7188",
    "eff6ff": "edf4f8",
    "93c5fd": "a9cbd9",
    "60a5fa": "7baabb",
    # destructive / red -> muted warm red
    "9b1c1c": "9b3434",
    "b91c1c": "a83a3a",
    "7f1d1d": "7f2d2d",
    "fef2f2": "f8ece7",
    "fca5a5": "dfa9a0",
    "fee2e2": "f5ded6",
    "feb8b8": "e4b3aa",
    "c0492c": "b04a38",
}

RGBA_MAP = {
    (26, 35, 50): (30, 28, 23),      # old text-navy tints (borders, shadows, overlays)
    (26, 58, 107): (43, 58, 66),     # old blue radial gradients
    (163, 112, 15): (62, 113, 136),  # gold borders -> steel
    (200, 169, 110): (90, 143, 166), # gold tints -> steel
    (200, 145, 58): (90, 143, 166),
    (42, 157, 143): (79, 133, 115),  # teal tints -> sage
    (231, 111, 81): (176, 74, 56),   # coral alert tints -> muted red
    (138, 154, 181): (106, 101, 96), # old muted-blue tint -> warm grey
}

def swap(text: str) -> str:
    def hex_repl(m):
        body = m.group(1)
        new = HEX_MAP.get(body.lower())
        return "#" + new if new else m.group(0)
    text = re.sub(r"#([0-9a-fA-F]{6})\b", hex_repl, text)

    def rgba_repl(m):
        r, g, b = int(m.group(2)), int(m.group(3)), int(m.group(4))
        rest = m.group(5) or ""
        new = RGBA_MAP.get((r, g, b))
        if not new:
            return m.group(0)
        return f"{m.group(1)}({new[0]},{new[1]},{new[2]}{rest})"
    text = re.sub(
        r"\b(rgba?)\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,[^)]+)?\)",
        rgba_repl, text)
    return text

changed = 0
for path in sys.argv[1:]:
    p = pathlib.Path(path)
    orig = p.read_text()
    new = swap(orig)
    if new != orig:
        p.write_text(new)
        changed += 1
        print(f"updated {p}")
print(f"{changed} files changed")
