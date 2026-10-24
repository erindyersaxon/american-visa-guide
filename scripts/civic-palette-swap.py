#!/usr/bin/env python3
"""Civic Editorial palette swap, driven by scripts/civic-palette-map.json.

Usage: python3 scripts/civic-palette-swap.py FILE...
Rewrites 6-digit hex and rgb/rgba triples in place. 3-digit hex is out of scope.
"""
import json, pathlib, re, sys

MAP_PATH = pathlib.Path(__file__).resolve().parent / "civic-palette-map.json"


def load_map():
    return json.loads(MAP_PATH.read_text())


def swap(text: str, cmap: dict) -> str:
    hex_map = {k.lower(): v for k, v in cmap["hex"].items()}
    rgba_map = {tuple(a): tuple(b) for a, b in cmap["rgba"]}

    def hex_repl(m):
        new = hex_map.get(m.group(1).lower())
        return "#" + new if new else m.group(0)
    text = re.sub(r"#([0-9a-fA-F]{6})\b", hex_repl, text)

    def rgba_repl(m):
        key = (int(m.group(2)), int(m.group(3)), int(m.group(4)))
        rest = m.group(5) or ""
        new = rgba_map.get(key)
        if not new:
            return m.group(0)
        return f"{m.group(1)}({new[0]},{new[1]},{new[2]}{rest})"
    return re.sub(
        r"\b(rgba?)\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,[^)]+)?\)",
        rgba_repl, text)


def main(paths):
    cmap = load_map()
    changed = 0
    for path in paths:
        p = pathlib.Path(path)
        orig = p.read_text()
        new = swap(orig, cmap)
        if new != orig:
            p.write_text(new)
            changed += 1
            print(f"updated {p}")
    print(f"{changed} files changed")


if __name__ == "__main__":
    main(sys.argv[1:])
