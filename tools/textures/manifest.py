"""Texture manifest: what to fetch, from where, and how honest it is.

Every entry carries provenance mirroring the `textures` table columns
(source / source_url / license / attribution / fidelity / resolution) so the
database and the files on disk can never disagree about what a texture is.

fidelity:
    real      - imagery-derived global mosaic, substantially complete
    partial   - real mission data, incomplete coverage or interpolated fill
    synthetic - artistic/procedural composite, not measured surface data

kind:      color | normal | emissive | clouds
from_dem:  when true, the URL is an elevation raster and the tool DERIVES a
           normal map from it (numeric gradient transform, not a conversion).

See BODIES.md for the full per-body rationale.
"""

# --- Solar System Scope, CC BY 4.0 -----------------------------------------
# Their own site blocks scripted downloads (HTTP 403), so we pull the identical
# files from Wikimedia Commons' upload host, which has no hotlink protection.
_SSS = "Solar System Scope (via Wikimedia Commons)"
_SSS_URL = "https://www.solarsystemscope.com/textures/"
_SSS_LICENSE = "CC BY 4.0"
_SSS_ATTRIB = "Solar System Scope / INOVE"

# --- USGS Astrogeology ------------------------------------------------------
# Public domain, mission-derived. The full GeoTIFFs are impractical to fetch
# (the Moon mosaic is 5.7 GB, its DEM 8.1 GB, Venus' SAR mosaic 117 GB), so we
# use the published 1024px equirectangular previews, which are real data at a
# resolution appropriate for a WebGL sphere. Full-resolution URLs are recorded
# in HIRES below for anyone who wants to re-derive at higher quality.
_USGS = "USGS Astrogeology (Astropedia)"
_USGS_URL = "https://astrogeology.usgs.gov/search"
_USGS_LICENSE = "Public Domain (USGS/NASA)"


def _sss(body, spice_id, path, out, fidelity, kind="color",
         max_width=2048, from_dem=False):
    return {
        "body": body, "spice_id": spice_id, "kind": kind, "out": out,
        "url": f"https://upload.wikimedia.org/wikipedia/commons/{path}",
        "source": _SSS, "source_url": _SSS_URL,
        "license": _SSS_LICENSE, "attribution": _SSS_ATTRIB,
        "fidelity": fidelity, "max_width": max_width, "from_dem": from_dem,
    }


def _usgs(body, spice_id, url, out, fidelity, mission, kind="color",
          max_width=2048, from_dem=False):
    return {
        "body": body, "spice_id": spice_id, "kind": kind, "out": out,
        "url": url, "source": f"{_USGS} — {mission}", "source_url": _USGS_URL,
        "license": _USGS_LICENSE, "attribution": f"NASA / USGS ({mission})",
        "fidelity": fidelity, "max_width": max_width, "from_dem": from_dem,
    }


# --- NASA/Cassini enhanced-colour maps, public domain via Wikimedia Commons ---
# Paul Schenk's 2014 global colour mosaics of the mid-size icy moons (Cassini
# ISS, PIA18434-18439). These are ENHANCED colour (IR-GRN-UV composites that
# exaggerate real compositional differences — the moons are near-neutral gray to
# the eye), not true colour. NASA work, public domain; the Commons file pages
# carry the PD-USGov template. Commons hosts the full-res originals (5-19 MB); we
# downsample to 2k on fetch.
_SCHENK = "Wikimedia Commons — NASA/JPL-Caltech/SSI/LPI (Cassini ISS)"
_SCHENK_URL = "https://commons.wikimedia.org/wiki/Category:Maps_of_Saturn%27s_moons"
_SCHENK_LICENSE = "Public Domain (NASA)"
_SCHENK_ATTRIB = "NASA / JPL-Caltech / SSI / LPI (enhanced colour, P. Schenk 2014)"


def _schenk(body, spice_id, path, out):
    return {
        "body": body, "spice_id": spice_id, "kind": "color", "out": out,
        "url": f"https://upload.wikimedia.org/wikipedia/commons/{path}",
        "source": _SCHENK, "source_url": _SCHENK_URL,
        "license": _SCHENK_LICENSE, "attribution": _SCHENK_ATTRIB,
        "fidelity": "real", "max_width": 2048, "from_dem": False,
    }


_CKAN = "https://astrogeology.usgs.gov/ckan/dataset"

# ---------------------------------------------------------------------------
# Tier 1 — Solar System Scope via Commons.
#
# The Sun and gas/ice giants are `synthetic`: no solid surface exists to map,
# and the Uranus texture is explicitly gap-filled with invented terrain.
# ---------------------------------------------------------------------------
TIER1 = [
    _sss("Sol", 10, "c/cb/Solarsystemscope_texture_2k_sun.jpg",
         "sun_2k_color.jpg", "synthetic"),
    _sss("Jupiter", 599, "b/be/Solarsystemscope_texture_2k_jupiter.jpg",
         "jupiter_2k_color.jpg", "synthetic"),
    _sss("Saturn", 699, "e/ea/Solarsystemscope_texture_2k_saturn.jpg",
         "saturn_2k_color.jpg", "synthetic"),
    _sss("Uranus", 799, "9/95/Solarsystemscope_texture_2k_uranus.jpg",
         "uranus_2k_color.jpg", "synthetic"),
    _sss("Neptune", 899, "1/1e/Solarsystemscope_texture_2k_neptune.jpg",
         "neptune_2k_color.jpg", "synthetic"),

    _sss("Mercury", 199, "9/92/Solarsystemscope_texture_2k_mercury.jpg",
         "mercury_2k_color.jpg", "real"),
    _sss("Venus", 299, "4/40/Solarsystemscope_texture_2k_venus_surface.jpg",
         "venus_2k_color.jpg", "real"),
    _sss("Earth", 399, "c/c3/Solarsystemscope_texture_2k_earth_daymap.jpg",
         "earth_daymap_2k_color.jpg", "real"),
    _sss("Luna", 301, "2/26/Solarsystemscope_texture_2k_moon.jpg",
         "moon_2k_color.jpg", "real"),
    _sss("Mars", 499, "4/46/Solarsystemscope_texture_2k_mars.jpg",
         "mars_2k_color.jpg", "real"),

    # Earth's extra maps — the richest multi-map set available for any body,
    # and the first use of the long-empty normal/emissive columns. This one is
    # already a normal map, so it is transcoded, not derived from a DEM.
    _sss("Earth", 399, "5/53/Solarsystemscope_texture_2k_earth_normal_map.tif",
         "earth_2k_normal.png", "real", kind="normal"),
    _sss("Earth", 399, "b/b3/Solarsystemscope_texture_8k_earth_nightmap.jpg",
         "earth_nightmap_2k.jpg", "real", kind="emissive"),
]

# ---------------------------------------------------------------------------
# Tier 2 — USGS, for bodies Solar System Scope does not cover.
# Output filenames intentionally match the names already in the database.
# ---------------------------------------------------------------------------
TIER2 = [
    _usgs("Phobos", 401,
          f"{_CKAN}/ca781f2d-0e29-4560-a14e-1b41269c74a9/resource/"
          "6c47165c-4094-4ff5-8a21-065deb4319d6/download/"
          "phobos_me_src_mosaic_global_1024.jpg",
          "phobos_1440x720_gray.jpg", "real", "Mars Express SRC"),
    _usgs("Io", 501,
          f"{_CKAN}/0fc15885-24ee-4d9d-9666-11de0667c10c/resource/"
          "73d4c1f7-8c07-4b28-90ea-f47f7531c5ca/download/full.jpg",
          "io_2k_color.jpg", "real", "Galileo SSI"),
    _usgs("Europa", 502,
          f"{_CKAN}/4080036f-afc5-422e-abe9-1c0c8e4f98ea/resource/"
          "3647e7b3-425e-4dcf-951b-cc4a22fb0129/download/"
          "europa_voyager_galileossi_global_mosaic_500m_1024.jpg",
          "europa_2k_color.jpg", "real", "Voyager / Galileo SSI"),
    _usgs("Ganymede", 503,
          f"{_CKAN}/e1422336-3291-4b65-b903-c942d53de073/resource/"
          "eb32abd7-fee2-47d1-9f96-9d7d8824cc3a/download/"
          "ganymede_voyager_galileossi_global_clrmosaic_1024.jpg",
          "ganymede_1024x512_color.jpg", "real", "Voyager / Galileo SSI"),
    _usgs("Callisto", 504,
          f"{_CKAN}/a80abd68-7ed9-440e-829a-76376779164f/resource/"
          "ac628525-cb1c-4742-928b-5a0a60f372cd/download/"
          "callisto_voyager_galileossi_global_mosaic_1024.jpg",
          "callisto_1800x900_color.jpg", "real", "Voyager / Galileo SSI"),
    _usgs("Pluto", 999,
          f"{_CKAN}/a5f1b7f4-9822-4697-a201-e23ef4bd3e16/resource/"
          "96be2aa1-f384-4a9f-9458-a8431a0e7956/download/"
          "pluto_newhorizons_global_mosaic_300m_jul2017_1024.jpg",
          "pluto_1k_grayscale.jpg", "partial", "New Horizons LORRI/MVIC"),
]

# ---------------------------------------------------------------------------
# Tier 3 — new bodies, not previously textured in this project.
#
# Charon is the standout: New Horizons produced BOTH a colour mosaic and a
# matching DEM, so it is the one body where we can ship a real, derived normal
# map. The DEM is 154 MB; the fetch downsamples on read.
# ---------------------------------------------------------------------------
TIER3 = [
    _usgs("Charon", 901,
          f"{_CKAN}/93827f6c-8feb-42b6-98e6-b0ce57c7d2c8/resource/"
          "1abf318c-3290-4aa0-932e-a34f32d7f6ad/download/"
          "charon_newhorizons_global_mosaic_300m_jul2017_1024.jpg",
          "charon_1k_color.jpg", "partial", "New Horizons LORRI/MVIC"),
    _usgs("Triton", 801,
          f"{_CKAN}/445b4c39-e87a-4e4d-88a8-e48d8e755c5c/resource/"
          "de0ba9f1-303e-4e5f-a99a-3201fba9a764/download/"
          "triton_voyager2_clrmosaic_1024.jpg",
          "triton_1k_color.jpg", "partial", "Voyager 2"),
    # Derived normal map from the New Horizons DEM (154 MB GeoTIFF).
    _usgs("Charon", 901,
          "https://planetarymaps.usgs.gov/mosaic/"
          "Charon_NewHorizons_Global_DEM_300m_Jul2017_16bit.tif",
          "charon_1k_normal.png", "partial", "New Horizons DEM",
          kind="normal", max_width=1024, from_dem=True),
]

# ---------------------------------------------------------------------------
# Tier 4 — Saturn's major moons.
#
# The six mid-size icy moons get NASA public-domain ENHANCED-colour global
# mosaics (Schenk 2014, via Commons) — richer than the clear-filter grayscale
# USGS holds, and colour is the only route that covers Mimas at all (USGS has no
# Mimas photomosaic). Titan has NO public-domain colour surface map, so it keeps
# the USGS grayscale 938 nm ISS mosaic (`partial` — coarse, haze-limited).
# Hyperion, Phoebe and the five small co-orbitals have no global map (see
# UNOBTAINABLE) and stay untextured.
# ---------------------------------------------------------------------------
TIER4 = [
    _schenk("Mimas", 601,
            "4/4f/Map_of_Mimas_colorized_2014-04_PIA18437.jpg",
            "mimas_2k_color.jpg"),
    _schenk("Enceladus", 602, "a/aa/Enceladus_Color_Map.jpg",
            "enceladus_2k_color.jpg"),
    _schenk("Tethys", 603, "4/40/Tethys_Color_Map.jpg",
            "tethys_2k_color.jpg"),
    _schenk("Dione", 604, "1/18/Dione_Color_Map.jpg",
            "dione_2k_color.jpg"),
    _schenk("Rhea", 605, "2/21/Rhea_Color_Map.jpg",
            "rhea_2k_color.jpg"),
    _schenk("Iapetus", 608, "5/53/Iapetus_Color_Map.jpg",
            "iapetus_2k_color.jpg"),

    # Titan: no PD colour surface map exists — keep the grayscale 938 nm mosaic.
    _usgs("Titan", 606,
          f"{_CKAN}/8ee17e4e-26c6-4e22-9c23-bc9a4c7ed35e/resource/"
          "c3f3006c-3174-4716-920f-44f5dc749a4a/download/"
          "titan_iss_p19658_mosaic_global_1024.jpg",
          "titan_1k_grayscale.jpg", "partial", "Cassini ISS"),
]

# ---------------------------------------------------------------------------
# Full-resolution USGS sources, recorded but NOT fetched by default — these
# are hundreds of MB to multiple GB. Use --tier hires deliberately.
# ---------------------------------------------------------------------------
HIRES_NOTES = {
    "mercury_color": "https://planetarymaps.usgs.gov/mosaic/Mercury_MESSENGER_ClrMosaic_global_665m_v3.tif (761 MB)",
    "mercury_dem": "https://planetarymaps.usgs.gov/mosaic/Mercury_Messenger_USGS_DEM_Global_665m_v2.tif (506 MB)",
    "venus_dem": "https://planetarymaps.usgs.gov/mosaic/Venus_Magellan_Topography_Global_4641m_v02.tif (64 MB)",
    "moon_color": "https://planetarymaps.usgs.gov/mosaic/Lunar_LRO_LROC-WAC_Mosaic_global_100m_June2013.tif (5.7 GB)",
    "moon_dem": "https://planetarymaps.usgs.gov/mosaic/Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014.tif (8.1 GB)",
    "mars_color": "https://planetarymaps.usgs.gov/mosaic/Mars_Viking_ClrMosaic_global_925m.tif (761 MB)",
    "mars_dem": "https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif (2.0 GB)",
    "io_color": "https://planetarymaps.usgs.gov/mosaic/Io_Galileo_SSI_Global_Mosaic_ClrMerge_1km.tif (188 MB)",
    "europa_color": "https://planetarymaps.usgs.gov/mosaic/Europa_Voyager_GalileoSSI_global_mosaic_500m.tif (184 MB)",
    "ganymede_color": "https://planetarymaps.usgs.gov/mosaic/Ganymede_Voyager_GalileoSSI_Global_ClrMosaic_1435m.tif (190 MB)",
    "callisto_color": "https://planetarymaps.usgs.gov/mosaic/Callisto_Voyager_GalileoSSI_global_mosaic_1km.tif (109 MB)",
    "triton_color": "https://planetarymaps.usgs.gov/mosaic/Triton_Voyager2_ClrMosaic_GlobalFill_600m.tif (286 MB)",
    "pluto_color": "https://planetarymaps.usgs.gov/mosaic/Pluto_NewHorizons_Global_Mosaic_300m_Jul2017_8bit.tif (295 MB)",
    "pluto_dem": "https://planetarymaps.usgs.gov/mosaic/Pluto_NewHorizons_Global_DEM_300m_Jul2017_16bit.tif (591 MB)",
    "charon_color": "https://planetarymaps.usgs.gov/mosaic/Charon_NewHorizons_Global_Mosaic_300m_Jul2017_8bit.tif (77 MB)",
    # Venus' 75 m SAR mosaic is 117 GB. Deliberately not listed as fetchable.
}

# Bodies with NO obtainable raster, documented so nobody re-researches them:
#   Ariel, Umbriel, Titania, Oberon, Miranda - USGS holds only Voyager control
#     -network tables and PDFs for these; no texture or DEM raster exists.
#   Deimos, Amalthea, Thebe, Adrastea, Metis, Nereid, Nix, Hydra, Kerberos,
#     Styx - never resolved well enough for a global map.
#   Hyperion, Phoebe - no global mosaic; Hyperion is a chaotic irregular and
#     Phoebe has only partial flyby coverage. (Mimas has no USGS grayscale
#     mosaic but IS covered by the Schenk enhanced-colour map in TIER4.)
#   Helene, Telesto, Calypso, Methone, Polydeuces - tiny co-orbitals, no map.
UNOBTAINABLE = [
    "Ariel", "Umbriel", "Titania", "Oberon", "Miranda", "Deimos", "Amalthea",
    "Thebe", "Adrastea", "Metis", "Nereid", "Nix", "Hydra", "Kerberos", "Styx",
    "Hyperion", "Phoebe", "Helene", "Telesto", "Calypso", "Methone",
    "Polydeuces",
]


def all_entries():
    return TIER1 + TIER2 + TIER3 + TIER4


TIERS = {"1": TIER1, "2": TIER2, "3": TIER3, "4": TIER4}
