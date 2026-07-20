#!/usr/bin/env python3
"""Fetch and process planetary textures into assets/static/images.

Mirrors the policy already used for SPICE kernels: large binaries stay out of
git and are re-fetched on demand.

Why this needs more than a downloader:
  * USGS ships GeoTIFF. Browsers and three.js cannot decode TIFF at all, so
    every USGS asset must be transcoded to JPEG/PNG.
  * USGS files are huge (Pluto's DEM is ~591 MB). WebGL caps texture sizes and
    we are not shipping that to a browser, so everything is downsampled.
  * A normal map is not a format conversion. It is computed from a DEM's
    elevation gradients, which is why numpy is in the tooling image.

Usage (from the repo root, via the tooling container):
    docker compose run --rm textures                 # everything
    docker compose run --rm textures --tier 1        # one tier
    docker compose run --rm textures --only Charon Triton
    docker compose run --rm textures --list          # show plan, fetch nothing
    docker compose run --rm textures --force         # re-fetch existing
"""

import argparse
import os
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import manifest  # noqa: E402

OUT_DIR = os.path.join("assets", "static", "images")

# astrogeology.usgs.gov 403s unknown agents; Commons rate-limits aggressively.
UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
THROTTLE_SECONDS = 1.5


def log(msg):
    print(msg, flush=True)


def download(url, dest, attempts=4):
    """Stream a URL to dest with a browser UA. Returns True on success.

    Wikimedia rate-limits bursts with HTTP 429 and USGS occasionally 503s;
    both are transient, so retry those with exponential backoff rather than
    failing the whole run.
    """
    import requests

    retryable = {429, 500, 502, 503, 504}

    for attempt in range(1, attempts + 1):
        try:
            with requests.get(url, headers={"User-Agent": UA}, stream=True,
                              timeout=(30, 600), allow_redirects=True) as r:
                if r.status_code in retryable and attempt < attempts:
                    # Honour Retry-After when the server sends one.
                    wait = int(r.headers.get("Retry-After") or 0) or 5 * 2 ** (attempt - 1)
                    log(f"    http {r.status_code}, retrying in {wait}s "
                        f"({attempt}/{attempts - 1})")
                    time.sleep(wait)
                    continue
                if r.status_code != 200:
                    log(f"    ERROR http {r.status_code}")
                    return False
                tmp = dest + ".part"
                with open(tmp, "wb") as fh:
                    for chunk in r.iter_content(chunk_size=1 << 20):
                        fh.write(chunk)
                os.replace(tmp, dest)
            return True
        except Exception as exc:  # network, timeout, disk
            if attempt < attempts:
                wait = 5 * 2 ** (attempt - 1)
                log(f"    {type(exc).__name__}, retrying in {wait}s")
                time.sleep(wait)
                continue
            log(f"    ERROR {type(exc).__name__}: {exc}")
            return False
    return False


def is_geotiff(path):
    return path.lower().endswith((".tif", ".tiff"))


def to_jpeg(src, dest, max_width):
    """Transcode/downsample to JPEG. GDAL for GeoTIFF, Pillow otherwise."""
    if is_geotiff(src):
        # gdal_translate handles tiled/16-bit/huge rasters that Pillow and
        # ImageMagick choke on. -outsize keeps aspect via 0 for height.
        cmd = [
            "gdal_translate", "-of", "JPEG",
            "-outsize", str(max_width), "0",
            "-scale",           # stretch to 8-bit for 16-bit sources
            "-co", "QUALITY=90",
            src, dest,
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            log(f"    ERROR gdal_translate: {res.stderr.strip()[:300]}")
            return False
        # gdal writes a sidecar world file we don't need
        for junk in (dest + ".aux.xml", dest + ".wld"):
            if os.path.exists(junk):
                os.remove(junk)
        return True

    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None  # these are legitimately enormous
    with Image.open(src) as im:
        im = im.convert("RGB")
        if im.width > max_width:
            height = round(im.height * max_width / im.width)
            im = im.resize((max_width, height), Image.LANCZOS)
        im.save(dest, "JPEG", quality=90)
    return True


def to_png(src, dest, max_width):
    """Lossless transcode/downsample. Used for normal maps, where JPEG
    compression artifacts would corrupt the encoded vectors."""
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    with Image.open(src) as im:
        im = im.convert("RGB")
        if im.width > max_width:
            height = round(im.height * max_width / im.width)
            im = im.resize((max_width, height), Image.LANCZOS)
        im.save(dest, "PNG", optimize=True)
    return True


def dem_to_normal_map(src, dest, max_width, strength=1.0):
    """Convert a DEM (elevation raster) into a tangent-space normal map.

    Elevation is a height field; a normal map encodes the surface gradient.
    For each texel we take central differences in x/y, build the normal
    (-dz/dx, -dz/dy, 1), normalise, and pack from [-1,1] into [0,255].
    """
    import numpy as np
    from osgeo import gdal
    from PIL import Image

    ds = gdal.Open(src)
    if ds is None:
        log("    ERROR gdal could not open DEM")
        return False

    band = ds.GetRasterBand(1)
    # Downsample during read so we never materialise the full raster.
    w = min(max_width, ds.RasterXSize)
    h = max(1, round(ds.RasterYSize * w / ds.RasterXSize))
    heights = band.ReadAsArray(buf_xsize=w, buf_ysize=h).astype("float32")

    nodata = band.GetNoDataValue()
    if nodata is not None:
        heights[heights == nodata] = np.nanmedian(heights[heights != nodata])
    heights = np.nan_to_num(heights)

    # Normalise height range so `strength` behaves consistently across bodies
    # whose relief differs by orders of magnitude.
    span = float(heights.max() - heights.min())
    if span > 0:
        heights = (heights - heights.min()) / span

    dzdx, dzdy = np.gradient(heights)
    scale = strength * max(w, h) / 32.0
    nx, ny = -dzdx * scale, -dzdy * scale
    nz = np.ones_like(heights)

    length = np.sqrt(nx * nx + ny * ny + nz * nz)
    rgb = np.stack([nx / length, ny / length, nz / length], axis=-1)
    rgb = ((rgb * 0.5 + 0.5) * 255).clip(0, 255).astype("uint8")

    Image.fromarray(rgb, mode="RGB").save(dest, "PNG", optimize=True)
    return True


def process(entry, force=False):
    out_path = os.path.join(OUT_DIR, entry["out"])
    if os.path.exists(out_path) and not force:
        log(f"  exists   {entry['out']}")
        return "skipped"

    os.makedirs(OUT_DIR, exist_ok=True)
    url = entry["url"]
    max_width = entry.get("max_width", 2048)

    log(f"  fetch    {entry['body']}: {entry['out']}")
    log(f"           {url}")

    raw_ext = os.path.splitext(url.split("?")[0])[1] or ".bin"
    raw_path = os.path.join(OUT_DIR, f".raw_{entry['out']}{raw_ext}")

    if not download(url, raw_path):
        return "failed"

    try:
        if entry.get("from_dem"):
            # Elevation raster -> derived normal map (numeric transform).
            ok = dem_to_normal_map(raw_path, out_path, max_width,
                                   entry.get("strength", 1.0))
        elif out_path.lower().endswith(".png"):
            # Already a normal map (or other data map): transcode losslessly.
            # JPEG artifacts corrupt normals, so these stay PNG.
            ok = to_png(raw_path, out_path, max_width)
        else:
            ok = to_jpeg(raw_path, out_path, max_width)
    finally:
        if os.path.exists(raw_path):
            os.remove(raw_path)

    if ok:
        size = os.path.getsize(out_path) / 1024
        log(f"    ok     {entry['out']} ({size:.0f} KB)")
        return "ok"
    return "failed"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--tier", choices=sorted(manifest.TIERS), help="only this tier")
    ap.add_argument("--only", nargs="+", metavar="BODY", help="only these bodies")
    ap.add_argument("--list", action="store_true", help="show plan, fetch nothing")
    ap.add_argument("--force", action="store_true", help="re-fetch existing files")
    args = ap.parse_args()

    entries = manifest.TIERS[args.tier] if args.tier else manifest.all_entries()
    if args.only:
        wanted = {b.lower() for b in args.only}
        entries = [e for e in entries if e["body"].lower() in wanted]

    if not entries:
        log("No matching manifest entries.")
        return 0

    if args.list:
        log(f"{len(entries)} entries:")
        for e in entries:
            log(f"  {e['body']:<10} {e['kind']:<6} {e['fidelity']:<9} "
                f"{e['out']:<30} {e['source']}")
        return 0

    results = {"ok": 0, "skipped": 0, "failed": 0}
    failures = []
    for i, entry in enumerate(entries):
        outcome = process(entry, force=args.force)
        results[outcome] += 1
        if outcome == "failed":
            failures.append(entry["out"])
        if outcome != "skipped" and i < len(entries) - 1:
            time.sleep(THROTTLE_SECONDS)  # be a good citizen

    log("")
    log(f"done: {results['ok']} fetched, {results['skipped']} already present, "
        f"{results['failed']} failed")
    if failures:
        log("failed: " + ", ".join(failures))
    # Missing textures are non-fatal: the renderer degrades to a bland sphere.
    return 0


if __name__ == "__main__":
    sys.exit(main())
