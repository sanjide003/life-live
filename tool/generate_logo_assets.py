#!/usr/bin/env python3
"""Generate raster logo files from assets/app_logo.svg for local builds.

The review system used for this repository cannot accept binary files in PR diffs,
so the canonical logo source is committed as SVG plus Android vector XML. Run this
script in an environment with ImageMagick installed to materialize the PNG/ICO
files listed in docs/LOGO_ASSETS.md before packaging stores.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SVG = ASSETS / "app_logo.svg"
PNG_TARGETS = {
    "app_logo_1024.png": 1024,
    "app_logo_512.png": 512,
    "app_logo_192.png": 192,
    "app_logo_180.png": 180,
    "app_logo_96.png": 96,
    "app_logo_72.png": 72,
    "app_logo_48.png": 48,
    "favicon-32.png": 32,
    "favicon-16.png": 16,
    "splash_logo.png": 1024,
    "adaptive_foreground.png": 1024,
    "adaptive_background.png": 1024,
}


def main() -> None:
    convert = shutil.which("magick") or shutil.which("convert")
    if convert is None:
        raise SystemExit("ImageMagick is required: install `magick` or `convert` and rerun this script.")
    for name, size in PNG_TARGETS.items():
        output = ASSETS / name
        subprocess.run([convert, str(SVG), "-resize", f"{size}x{size}", str(output)], check=True)
    subprocess.run([convert, str(ASSETS / "favicon-16.png"), str(ASSETS / "favicon-32.png"), str(ASSETS / "favicon.ico")], check=True)
    print("Generated logo PNG and ICO assets in assets/.")


if __name__ == "__main__":
    main()
