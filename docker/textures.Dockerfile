# One-shot tooling image for fetching and processing planetary textures.
#
# Deliberately NOT part of the running stack and NOT merged into the backend
# image — GDAL is heavy and only needed when (re)building texture assets.
#
#   docker compose run --rm textures            # fetch + process everything
#   docker compose run --rm textures --only Charon
#
# Why each tool:
#   gdal        - USGS ships large, tiled, 16-bit GeoTIFFs. gdal_translate reads
#                 and downsamples them reliably where ImageMagick struggles.
#   imagemagick - generic convert/resize for ordinary JPEG/PNG sources.
#   numpy       - DEM -> normal map is a numeric gradient transform, not a
#                 format conversion; neither GDAL nor IM does it directly.
FROM ghcr.io/osgeo/gdal:ubuntu-small-latest

RUN apt-get update \
 && apt-get install -y --no-install-recommends imagemagick python3-pip \
 && rm -rf /var/lib/apt/lists/* \
 && pip3 install --no-cache-dir --break-system-packages numpy pillow requests

WORKDIR /app
ENTRYPOINT ["python3", "tools/textures/fetch.py"]
