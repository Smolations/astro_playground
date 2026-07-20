# Supported Bodies

Every object AstroPlayground tracks, why it looks the way it does, and where its
surface imagery comes from.

Physical constants (radii, GM, orientation) are **not** listed here — they are
read live from NASA/NAIF SPICE kernels at request time via
`priv/scripts/size_and_shape.py` and `orientation.py`, so this document never
goes stale against them. What *is* listed here is the stuff SPICE cannot tell
us: what a body looks like, and how much of that appearance is real.

## How to read this

Bodies are grouped by system. Each entry notes its SPICE ID, and two things
that matter for rendering:

- **Texture** — the colour/albedo map wrapped around the sphere.
- **Normal source** — a DEM (digital elevation model) or shape model that can
  be converted into a normal/bump map for surface relief. USGS publishes DEMs,
  not normal maps; the conversion is ours to do.

**Fidelity** is recorded per texture in the database (`textures.fidelity`) and
is the honest part of this project:

| Fidelity | Meaning |
|---|---|
| `real` | Imagery-derived global mosaic, substantially complete coverage. |
| `partial` | Real mission data, but incomplete — one hemisphere only, or gaps interpolated/filled. |
| `synthetic` | Artistic or procedural composite. Not measured surface data. |

This distinction is not pedantry. Several of the most widely-circulated
"planet textures" on the internet are partly or wholly invented, and a project
built on real ephemerides should not quietly present fiction as measurement.

## Summary

Of **33 physical bodies** tracked (plus 10 barycenters, which have no surface):

- **13** have a genuine, substantially complete global colour mosaic.
- **5** have only a synthetic composite — the gas/ice giants and the Sun, which
  have no solid surface to map.
- **6** have real but partial (hemisphere-only) coverage.
- **9** have nothing usable — small moons that were never resolved.
- **8** have a real global DEM suitable for normal maps; **4** more have partial
  DEMs. Everything else has, at best, a crude triaxial shape model.

Normal maps are far scarcer than colour maps. Notably **Io, Ganymede and
Callisto have excellent colour but no usable global topography.**

---

## The Sun

### Sol — SPICE `10` — star
No true surface exists to map; the photosphere is a plasma boundary, not
terrain. Any "sun texture" is illustrative granulation.

- **Texture:** Solar System Scope 2K/8K — `synthetic`
- **Normal source:** none, and none is meaningful.

A future improvement worth making: the Sun is currently rendered as a flat grey
sphere like everything else. `three/models/spheroid.js` already contains an
unused glow-shader (`getGlowSphere`) intended for exactly this.

---

## Inner planets

### Mercury — SPICE `199` — planet
Extremely well mapped by MESSENGER (2011–2015).

- **Texture:** USGS MESSENGER MDIS global colour mosaic, 665 m/px — `real`
- **Normal source:** USGS MESSENGER global DEM, 665 m/px ✅
- **Caveat:** ~97–99% coverage; minor polar gaps.

### Venus — SPICE `299` — planet
A special case worth understanding. Venus' surface is permanently hidden under
cloud, so the "map" is **Magellan radar backscatter**, not visible-light albedo.
It shows roughness and slope, not colour. Rendering it as if it were a
photograph is a small scientific lie we should at least label.

- **Texture:** USGS Magellan C3-MDIR global mosaic, ~2 km/px — `real` (radar)
- **Normal source:** Magellan GTDR/GEDR radar altimetry ✅

### Earth — SPICE `399` — planet
The only body where we have better data than we can use.

- **Texture:** NASA Blue Marble, 1 km (500 m "Next Generation") — `real`
- **Normal source:** SRTM (~30–90 m) and GTOPO30 (~1 km global) ✅
- **Caveat:** SRTM covers only 60°N–56°S, land only, no bathymetry.

Solar System Scope also publishes night-lights, cloud, specular and normal maps
for Earth — the richest multi-map set available for any body, and the obvious
place to first exercise the unused `normal` / `emissive` / `specular` columns.

---

## The Earth–Moon system

### Luna — SPICE `301` — satellite
After Earth, the best-mapped body in the solar system.

- **Texture:** USGS LRO LROC WAC global mosaic, 100 m/px — `real`
- **Normal source:** USGS LRO LOLA DEM, 118 m/px ✅
- **Caveat:** essentially none. Near-complete global coverage.

---

## The Mars system

### Mars — SPICE `499` — planet
- **Texture:** USGS Viking MDIM 2.1, 232 m/px — `real` (newer THEMIS/CTX mosaics exist)
- **Normal source:** MGS MOLA DEM, 463 m/px ✅
- **Caveat:** essentially complete.

### Phobos — SPICE `401` — satellite
Surprisingly well imaged for a 22 km rock, thanks to Mars Express.

- **Texture:** USGS Mars Express SRC global mosaic, 12 m/px — `real`
- **Normal source:** HRSC DEM 100 m/px, plus a stereophotoclinometry shape model ✅
- **Caveat:** irregular body — the shape model, not a sphere, is the ground truth.

### Deimos — SPICE `402` — satellite
The weakest body in the inner solar system. No dedicated global mosaic was
found; the standard imagery traces to a single 1977 Viking pass.

- **Texture:** best available is Viking-era (NASA Photojournal PIA00301) — `partial`
- **Normal source:** no verified downloadable shape model.

---

## The Jupiter system

### Jupiter — SPICE `599` — planet
A gas giant: the "surface" is cloud tops. USGS does not map it.

- **Texture:** NASA Cassini global map (60°S–60°N) or Solar System Scope — `synthetic`
- **Normal source:** none (no solid surface).
- **Caveat:** polar regions beyond ±60° are absent from the Cassini map; filling
  them requires Juno data.

### Io — SPICE `501` — satellite
- **Texture:** USGS Galileo SSI global colour merge, ~1 km/px — `real`
- **Normal source:** ❌ none — only a control-point network, no raster topography.
- **Caveat:** coarser on the Jupiter-facing side. Io resurfaces itself
  volcanically, so any map is a snapshot with a shelf life.

### Europa — SPICE `502` — satellite
- **Texture:** USGS equirectangular mosaic v3, ~500 m/px best — `real`
- **Normal source:** partial — five local Galileo stereo DTMs, no global DEM.
- **Caveat:** genuine coverage gaps between imaged swaths (worst areas ~19.5 km/px).

### Ganymede — SPICE `503` — satellite
- **Texture:** USGS Voyager/Galileo colour global mosaic, 1.435 km/px — `real`
- **Normal source:** ❌ none — no resolvable large-scale topography.
- **Caveat:** largest moon in the solar system; full coverage.

### Callisto — SPICE `504` — satellite
- **Texture:** USGS Voyager/Galileo global mosaic, 1.0 km/px — `real`
- **Normal source:** ❌ none found.

### Amalthea — SPICE `505` — satellite
- **Texture:** ❌ none usable — best Galileo frames are ~5.4 km/px partial disks.
- **Normal source:** triaxial shape model only (Thomas et al. 1998, ~125×79×64 km).

### Thebe `514`, Adrastea `515`, Metis `516` — satellites
Small inner moons, imaged only as partial disks at ~7.5 km/px (Adrastea is
essentially unresolved).

- **Texture:** ❌ none usable.
- **Normal source:** crude shape models only.
- **Honest option:** render as low-poly procedural ellipsoids and label them as
  such, rather than inventing a surface.

---

## The Saturn system

### Saturn — SPICE `699` — planet
- **Texture:** Solar System Scope — `synthetic`
- **Normal source:** none (gas giant).
- **Caveat:** worth knowing that NASA's own 3D-resources Saturn map is explicitly
  labelled *"Fictional"*. The USGS Voyager 1 airbrush mosaic is real but old and
  low resolution. Saturn's rings are a separate rendering problem entirely and
  are not currently modelled.

*No Saturnian moons are currently tracked* — a notable gap, since Titan,
Enceladus, Iapetus, Rhea, Dione, Tethys and Mimas are all well mapped by
Cassini and would be among the highest-quality additions available.

---

## The Uranus system

Everything here traces to a **single Voyager 2 flyby in January 1986**. Uranus'
extreme axial tilt meant the northern hemispheres of its moons were in darkness
during the encounter, so roughly half of every Uranian moon has *never been
seen by anything*. All five are `partial`, permanently, until a new mission goes.

### Uranus — SPICE `799` — planet
- **Texture:** Solar System Scope 2K — `synthetic`
- **Caveat:** Voyager 2 saw a nearly featureless disk. The commonly used texture
  is **explicitly gap-filled with fictional terrain**. There is no real global
  photomosaic of Uranus.

### Miranda — SPICE `705` — satellite
The most visually spectacular of the group — giant fault scarps and coronae.

- **Texture:** Voyager 2 mosaic ~560–740 m/px (NASA PIA00043) — `partial`
- **Normal source:** Schenk stereo DEM ~250 m/px ✅ (best of the Uranian moons)
- **Caveat:** only the southern crescent was seen close up.

### Ariel — SPICE `701` — satellite
- **Texture:** Voyager 2, ~2.4 km/px — `partial`
- **Normal source:** Schenk & Moore (2020) stereo DEM ~1 km/px ✅ (southern only)
- **Caveat:** only ~35–40% imaged.

### Titania — SPICE `703` — satellite
- **Texture:** USGS southern-hemisphere photomosaic ~3.4 km/px — `partial`
- **Normal source:** Schenk stereo DEM ✅ (partial)
- **Caveat:** ~40% imaged, only ~24% at mapping quality.

### Umbriel — SPICE `702` — satellite
- **Texture:** USGS southern-hemisphere photomosaic ~5.2 km/px — `partial`
- **Normal source:** ❌ none — no useful stereo/DEM is constructible; only crude
  limb profiles.
- **Caveat:** worst of the five (~20% at mapping quality).

### Oberon — SPICE `704` — satellite
- **Texture:** USGS southern-hemisphere photomosaic ~6 km/px — `partial`
- **Normal source:** ❌ limb profile only (which is how its 11 km mountain was found).
- **Caveat:** ~40% imaged, ~25% at mapping quality.

---

## The Neptune system

### Neptune — SPICE `899` — planet
- **Texture:** Solar System Scope, **2K only** — `synthetic`
- **Normal source:** none (ice giant).
- **Caveat:** one Voyager 2 flyby; no real global photomosaic.

### Triton — SPICE `801` — satellite
A captured Kuiper Belt object and one of the few geologically active worlds in
the outer system — a high-value body despite the data being 1989-vintage.

- **Texture:** USGS Voyager 2 global colour mosaic, 600 m/px — `partial`
- **Normal source:** ❌ none — a single flyby gave no stereo coverage.
- **Caveat:** the USGS file is literally named **`GlobalFill`** — gaps are
  interpolated from neighbouring terrain. Only the sunlit south polar region was
  genuinely imaged. This is exactly the case the `partial` label exists for.

### Nereid — SPICE `802` — satellite
- **Texture:** ❌ none. Best Voyager 2 imagery is **43 km/px** — enough to
  establish size and albedo, nothing more.
- **Normal source:** none.
- **Recommendation:** do not pursue. A neutral placeholder sphere is the honest
  representation.

---

## The Pluto system

### Pluto — SPICE `999` — dwarf planet
- **Texture:** USGS New Horizons LORRI/MVIC global mosaic, 300 m/px — `partial`
- **Normal source:** matching USGS global DEM, 300 m/px ✅
- **Caveat:** the DEM explicitly covers only the hemisphere visible at closest
  approach; the far side is coarse approach-only imagery.

### Charon — SPICE `901` — satellite
**The single highest-value body currently missing.** New Horizons mapped it
alongside Pluto, and USGS publishes both products with live download links.

- **Texture:** USGS New Horizons global mosaic, 300 m/px — `partial`
- **Normal source:** matching USGS global DEM, 300 m/px ✅
- **Caveat:** anti-encounter hemisphere is lower resolution.

### Nix `902`, Hydra `903`, Kerberos `904`, Styx `905` — satellites
Small, irregular, and seen only in discrete frames from one flyby. Kerberos is
bilobate (~8 km + ~5 km lobes); Styx is essentially unresolved.

- **Texture:** ❌ no global mosaics exist.
- **Normal source:** shape models exist in the literature (Weaver et al. 2016),
  but no verified public download was found — would require the PDS Small Body
  Mapping Tool or the paper's supplementary data.

---

## Barycenters

Ten barycenters are tracked (`SPICE 0`–`9`): the Solar System Barycenter plus
one per planetary system. These are **not physical objects** — they are the
centre of mass a system orbits about, a point in empty space.

They are deliberately rendered as **wireframe reference spheres**
(`components/BarycenterModel.jsx`) rather than solid bodies, precisely because
there is nothing there to see. They have no textures and never will.

They matter enormously for motion, though: a moon does not orbit its planet's
*centre*, it orbits their common barycenter. Getting that right is one of the
open items from the original project README.

---

## Sourcing and licensing

Texture binaries are **not committed to this repository** (`.gitignore` excludes
`assets/static/images`), the same policy applied to SPICE kernels. They are
fetched on demand. Provenance for each is recorded in the `textures` table
(`source`, `source_url`, `license`, `attribution`, `resolution`, `fidelity`).

**USGS Astrogeology / Astropedia** — <https://astrogeology.usgs.gov/search>
The authoritative source going forward. Mission-derived, public domain, stable,
citable. Products are GeoTIFF and often very large (Pluto's DEM is ~591 MB), so
they require conversion and downscaling before a browser can use them.

> Note: `astrogeology.usgs.gov` rejects unrecognised user agents with HTTP 403.
> The fetch script sends a browser user-agent.

**Solar System Scope** — <https://www.solarsystemscope.com/textures/>
CC BY 4.0 (use, adapt, share, even commercially — **attribution required**).
The practical source for the Sun and the four gas/ice giants, which USGS does
not map. Their own site blocks direct scripted downloads (HTTP 403), so the
fetch script pulls the identical files from their Wikimedia Commons mirror.

**JHT's Planetary Pixel Emporium** — <https://planetpixelemporium.com/>
Almost certainly the original source of this project's moon textures — the
irregular dimensions in the legacy filenames (`1440x720`, `1800x900`,
`1024x512`) match its style. As of this writing the domain does not resolve.
It is not the source of truth going forward, but may be worth revisiting if it
returns and its maps prove better than the USGS equivalents.

---

## Known gaps, in priority order

1. **Charon** — full 300 m colour mosaic *and* matching DEM, both live. Easiest high-quality win available.
2. **Triton** — 600 m global mosaic (mind the `GlobalFill` caveat).
3. **Miranda** — best Uranian moon data: good mosaic plus the group's best DEM.
4. **Ariel, Titania** — partial mosaics, each with a real partial DEM.
5. **Umbriel, Oberon** — colour only; no usable DEM.
6. **Saturn's moons** — not currently tracked at all, yet Titan/Enceladus/Iapetus/Rhea/Dione/Tethys/Mimas are superbly mapped by Cassini. Probably the largest single upgrade available to this project.
7. **Normal maps generally** — every `normal`, `bump`, `displacement`, `emissive` and `ambient_occlusion` column is currently empty for all 18 textured bodies. Eight bodies have real global DEMs ready to convert.
8. **Thebe, Adrastea, Metis, Nix, Hydra, Kerberos, Styx** — procedural ellipsoids; no real imagery exists.
9. **Nereid** — skip.
