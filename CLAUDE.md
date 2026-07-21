# CLAUDE.md

Guidance for working in this repo. The root `README.md` is the original 2018
write-up and is **out of date** (telnet/HORIZONS, local `mix phx.server`, Kepler
orbital elements). This file reflects the project as it actually is today.

## What this is

AstroPlayground — a solar-system visualizer. A **Phoenix/Elixir JSON API** feeds
a **React SPA** that renders bodies and their orbital motion in WebGL (three.js).
Orbits and body orientation come from **real NAIF SPICE ephemerides** (not
Kepler elements), computed via `spiceypy`.

Dormant 2018 → revived starting 2026-07. The revival is tracked as an arc of
"directions"; see **Roadmap** below.

## Architecture

Three Docker services (`docker-compose.yml`):

| Service | What | Port |
|---|---|---|
| `db` | Postgres 16 | 5432 |
| `app` | Elixir 1.18 / Phoenix 1.7 / Bandit — the JSON API | 4000 |
| `assets` | node 22 + Vite — the React 18 SPA (dev server, HMR) | 5173 |

**Develop against http://localhost:5173** — Vite proxies `/api` and `/images` to
Phoenix. The SPA is client-only (no SSR — three.js can't render server-side).

Backend has **no host toolchain** — Erlang/Elixir/Python live in the image
(`docker/backend.Dockerfile`). Don't try to run `mix`/`python` on the host.

```
docker compose up                              # bring up db + app + assets
docker compose run --rm app mix ecto.setup     # one-time: create/migrate/SEED (downloads kernels — heavy)
docker compose run --rm app mix ecto.reset     # drop + re-seed
docker compose exec app <cmd>                  # run in the live app container
docker compose run --rm textures --tier 1      # texture tooling (behind "tools" profile)
```

`mix ecto.setup` runs `priv/repo/seeds.exs`, which **downloads ~1.8 GB of NAIF
kernels** and inserts bodies/orbits/textures. Run it deliberately.

## SPICE pipeline (the heart of the app)

Elixir shells out to Python (`System.cmd`) which calls `spiceypy` (CSPICE).

- **Elixir side:** `lib/astro_playground/spicey/spicey.ex` — `trajectory`,
  `orientation`, `size_and_shape`. Controllers in
  `lib/astro_playground_web/controllers/spicey_controller.ex`.
- **Python side:** `priv/scripts/*.py` (thin CLI wrappers) →
  `priv/scripts/modules/naif.py` (the real logic). Each invocation `furnsh`es
  the meta-kernel fresh, so **kernel changes take effect without an app restart**.
- **Meta-kernel:** `priv/kernels/meta_kernels/meta_kernel.tm` lists every loaded
  kernel (`KERNELS_TO_LOAD`); `PATH_VALUES` is the relative `priv/kernels`.

Key SPICE calls: `spkezr` (state vectors), `pxform` (body orientation),
`bodvcd`/`bodvrd` (RADII/GM), `str2et`.

**Reference frame is `ECLIPJ2000` (ecliptic), not `J2000` (equatorial).** This
single choice makes orbit inclinations correct relative to the ecliptic with
zero manual Euler rotation — it replaced the 2018 Euler-angle hurdle that stalled
the project. Verified: Mercury 7.00°, Moon 5.16°.

### Orbital motion — how it renders

Real orbits **precess** (they don't close). We don't force loops — we stream:

- **`assets/js/three/models/orbit.js` (the `Orbit` class)** holds a contiguous
  sample buffer, interpolates position with **Catmull-Rom cubic** (`positionAtEt`)
  to avoid polygonal orbits, renders a **rolling trail** with a fading tail, and
  can draw an opt-in **best-fit ellipse guide** (mu-free least-squares fit —
  shows the real path departing the ideal ellipse = perturbations visualized).
- **`assets/js/components/BarycenterModel.jsx`** is the animated system view. It
  streams contiguous windows (`POST /api/trajectory`, `close:false`) and swaps
  seamlessly (no teleport). Loads each body independently in try/catch so a body
  with missing data is skipped, not fatal.
- Speed is a **global** constant `ET_PER_WALL_SECOND` (not per-system).
- Period estimate = **first local minimum of distance-to-start** with parabolic
  refinement (a fixed-threshold version failed for fast moons; a fallback-to-
  whole-buffer version made trails solid rings).

**Sampling caveat:** fast inner moons alias with coarse time steps. Current
window is dense (`WINDOW_DAYS=40`, `SAMPLES=1000` ≈ 0.04 day/step) + Catmull-Rom.

### Axial tilt & spin (issue #1)

The two views intentionally differ: the **system view is physical**, the
**single-body view is a showcase**.

**System view (`BarycenterModel`)** orients each body from the SPICE
`orientation` endpoint (`pole` + `rotation_deg_per_day`, in ECLIPJ2000). Tilt =
align the mesh's local **+Y** (SphereGeometry's pole) to the true `pole` vector —
without it, poles point +Y (sideways to the +Z ecliptic up), which was the
"bodies look tipped" bug. Spin = rotate about that pole at the real rate;
`rotation_deg_per_day`'s sign carries prograde/retrograde. Compose **tilt ∘
spin** so the spin is about the untilted local +Y before the tilt carries it to
the true axis. The key move: spin is phased off the **same `et` clock as the
orbit**, so a synchronous rotator (Moon 13.18 °/day == its orbital rate, Io,
Titan) keeps one face to its primary for free — no special-casing.

**Single-body view (`SpheroidModel` → `Spheroid.updatePosition`)** is about
viewing one body in isolation, so it drops physical accuracy for consistent
framing: a **fixed display tilt** (`BODY_DISPLAY_TILT_DEG`, same lean for every
body) and a **uniform baseline spin** (`BODY_SPIN_SECONDS_PER_REV`, same speed
for every body). No SPICE orientation is fetched here. Because the spin isn't
physical time, this view registers no base rate, so the global time control
hides its real→sim hint (the scale is just a spin-speed multiplier here).

### Focus, real Sun lighting & "Now" (issue #10)

The system view can showcase a single body *with real context* — this is why the
standalone body view stays a stylized showcase and the "physical" body view is
just the system view zoomed in. All in `BarycenterModel`:

- **Real Sun lighting.** The Sun (NAIF `10`) is fetched as one extra interpolated
  trajectory (`this.sunOrbit`, reusing the `Orbit` class) and drives a
  `DirectionalLight` aimed from its true direction each frame — so bodies show
  real phases/terminators. Ambient is low (`AMBIENT_INTENSITY`) so the dark side
  reads. Skipped for the Solar-System barycenter (observer `'0'`, Sun ≈ centre),
  which keeps a fixed key light.
- **Focus body** (GUI button). Dollies the camera to frame the *followed* body at
  a lit 3/4 angle (`FRAME_RADII`, offset off the Sun direction by
  `FOCUS_SUN_AZIMUTH_DEG`), eased over `FOCUS_SECONDS` via `Clock.getDelta` +
  `Vector3.lerp` (`beginFocus`/`stepFocus`). No-op when following the barycenter.
  Complements the Follow dropdown, which only re-centers.
- **Now** (GUI button). `jumpTo(nowUtc())` swaps every orbit + the Sun buffer to
  today's window and resets the clock (`this.et`/`et0`) — positions *and* lighting
  jump to the body's real current state. Reuses the streaming `fetchWindow` path;
  nulls `_followName` so the camera re-anchors to the teleported positions.

## Kernels

- `.bsp`/`.tls`/`.tpc` under `priv/kernels/` are **gitignored and disposable** —
  deleted between work sessions; a clean re-fetch doubles as first-time-setup
  validation. The manifest + downloader is `AstroPlayground.Kernels`
  (`lib/astro_playground/kernels.ex`) — single source of truth for `@files`;
  `seeds.exs` just calls `Kernels.fetch/0`.
- **Preflight**: `Kernels.fetch/0` HEAD-checks every URL first and **aborts before
  downloading** if a *required* kernel (`.bsp`/`.tls`/`.tpc`/`.bpc`) 404s (NAIF
  renames are frequent), printing per-file guidance; optional metadata 404s only
  warn. Run it standalone with **`mix astro.preflight`** (no download, no DB).
  **`mix astro.doctor`** is the on-demand health check (required kernels on disk +
  DB seed counts).
- **Version check**: **`mix astro.kernels.check [year]`** queries NAIF for newer
  same-family kernels and uses each `.cmt` to confirm it still covers the current
  kernel's bodies + epoch (rejects newer-but-narrower ones — the ura116xl-dropped-
  the-majors trap). **`mix astro.kernels.upgrade OLD NEW`** is the opt-in adopt:
  verifies coverage, downloads, swaps refs in `meta_kernel.tm` + the manifest,
  keeps the old file. Never automatic.
- **NAIF renames/supersedes filenames constantly.** The 2018 names (jup310,
  mar097, plu055...) 404. Current: `jup365`, `sat427` (Saturn majors +
  co-orbitals, from `a_old_versions/`), `mar099s`, `plu060`, `nep097` (Triton),
  `nep105` (Nereid), `ura111` (Uranus majors, from `a_old_versions/`),
  `de432s` (planets).
- **Check coverage WITHOUT downloading:** every `foo.bsp` has a `foo.cmt`
  comment file at the same URL. `grep -A15 'Bodies on the File'` lists the
  covered bodies; also check the timespan covers the render epoch. A newer file
  is **not always a superset** — e.g. `ura116xl` dropped the five major moons
  (keeps only minor 716–724), and Saturn's newest `sat45x`/`sat459` hold only the
  planet + provisional irregulars (no majors); the majors live in the older
  `ura111` / `sat427`. (The `.cmt` can mislead here: it lists moons in its
  constants table even when the file has no ephemeris segment for them — confirm
  with `spkobj`/`brief`, not just the comment.)

## API (base `/api`, all JSON)

`GET /objects` (`?type=`, `?spice_name=`), `GET /objects/:id`,
`/objects/:id/size_and_shape` (radii + mu; `radii_measured:false` +
nominal-placeholder fallback when RADII missing; `mu:0` when GM missing),
`/objects/:id/orientation`, `/objects/:id/orbiting`, `/objects/:id/textures`,
`POST /trajectory`, `POST /get_state`, `/identify_code/:code`,
`/identify_name/:name`, `GET /home_manifest` (serves the precomputed
`priv/render_manifest.json` — no per-request SPICE work).

**Interactive docs (issue #2 ✅):** SwaggerUI at `/api/docs` (live "Try it out",
linked from the home page), OpenAPI 3 spec at `GET /api/openapi`. Generated by
`open_api_spex` from the `operation` specs on the controllers plus the schema
modules in `lib/astro_playground_web/api_schemas.ex` (assembled in
`api_spec.ex`). The read/query endpoints above are documented; the texture
write-CRUD isn't yet. Both docs routes run on their own router pipelines so a
spec-build error can't take down the JSON API.

## Frontend map (`assets/js/`)

- `routes.jsx` — RR6 routes: `/barycenters/:id` → system view (`Barycenter.jsx`
  → `BarycenterModel.jsx`); `/planets|satellites|stars|dwarf_planets/:id` →
  single body (`Spheroid.jsx` → `SpheroidModel.jsx`); `/objects` → home page,
  now grouped by system (`components/SystemsView.jsx` — a collapsible section per
  barycenter, each with a renderability-gated "System view" CTA (live for
  `ok`/`lone`, disabled with a tooltip for `empty`) plus per-body "View body"
  links; reads `GET /home_manifest`; replaced the removed flat `SpiceObjectsTable.jsx`).
- `three/models/orbit.js`, `three/models/spheroid.js`, `three/lib/marker.js`
  (`Locator` — constant-pixel findability dots that fade as the real sphere
  resolves).
- `components/BodySidebarTable.jsx` — info panel; shows the nominal-size warning
  row and texture provenance.

Barycenter DB ids: Solar System 1, Mercury 2 … Uranus 8, Neptune 9, Pluto 10.

## Verifying renders (headless Playwright)

The `mcr.microsoft.com/playwright` image ships browsers but **not** the
`playwright` npm package, and it must join the compose network to reach
`http://assets:5173`. Recipe that works (install the package at runtime):

```bash
docker run --rm --network astro_playground_default \
  -v "$SCRATCH/shot.js:/shot.js" -v "$SCRATCH/shots:/out" \
  mcr.microsoft.com/playwright:v1.48.0-jammy \
  bash -c 'cd /tmp && npm i playwright@1.48.0 >/dev/null 2>&1 && NODE_PATH=/tmp/node_modules node /shot.js'
```

The script launches chromium with `--use-gl=swiftshader`, `goto` the route,
`waitForTimeout(~9s)` for the WebGL scene, `screenshot` to `/out`. Then Read the
PNG. Ignore the semantic-ui-react `defaultProps`/`findDOMNode` deprecation
warnings — they're benign noise. (This is a good skill candidate — issue #9.)

Also verify trajectories directly:
`docker compose exec app python3 -c "import spiceypy as s; s.furnsh('priv/kernels/meta_kernels/meta_kernel.tm'); print(s.spkezr('705', s.str2et('2026-01-01'), 'ECLIPJ2000','NONE','7'))"`

**`mix astro.manifest`** is the automated home-page-link validator (issue #5
goal 1). It walks every seeded object plus the orbit parent/child graph and,
via a batch SPICE probe (`priv/scripts/renderability.py`), determines what each
link renders and whether it can — emitting a UI-ready, committed
`priv/render_manifest.json` (the data source for the grouped home page, goal 2)
plus a console report. Per-barycenter `status`: `ok` (multiple bodies with
orbital extent — animated view is meaningful), `lone` (a single body coincident
with its barycenter, i.e. a moonless planet like Mercury/Venus — renders, but as
a lone body with no orbital motion), `empty` (no child ephemeris resolves, so
nothing renders — the state Saturn was in before `sat427` was seeded; no system
is currently `empty`). Flags: `--out PATH`,
`--check` (exit non-zero if any system is `empty` — CI gate). Runs automatically
as the last step of `mix ecto.setup`, so the committed manifest regenerates on
seed/reset.

## Roadmap / open issues

Revival directions: (1) findability markers ✅ · (2) moon systems ✅ (Earth,
Jupiter, Mars, Saturn, Pluto, Uranus, Neptune — every system with available
ephemeris; Saturn's 14 named moons from `sat427.bsp`, six textured with NASA
public-domain enhanced-colour Cassini mosaics — Titan stays grayscale, and
Hyperion/Phoebe/the five co-orbitals stay bland) · (3) **Sun + planets finale**
— forces the deferred true-vs-exaggerated **scale toggle** (issue #4,
intentionally held).

Open GitHub issues track the rest: #3 kernel caching/subsetting, #8 UI polish,
#9 project-specific Claude skills. Done: #10 system-view Focus + real Sun
lighting + "Now" (dolly to frame a followed body, lit by the true Sun direction,
jumpable to today's real positions — the "enhanced body view" is the system view
focused; see above), #1 axial tilt/spin (real pole +
`rotation_deg_per_day` from SPICE applied in both views — see below), #2
OpenAPI/Swagger docs (`/api/docs`), #5 home-page link validation + grouping
(`mix astro.manifest` + `SystemsView`), #6 fresh-clone setup, #7 kernel-version
upgrade check.

## Conventions & gotchas

- **Mainline is `main`** (renamed from `master`). "Always-works" gate: only
  advance mainline once it builds + boots. Direction work happens on feature
  branches off `main`.
- End commit messages with the `Co-Authored-By: Claude Opus 4.8` trailer.
- **Workflow: stop between tasks for validation** — don't batch multiple
  deliverables without checking in.
- **three r170:** `setFromPoints` reuses an existing attribute and won't grow it
  → pre-allocate a `DynamicDrawUsage` buffer + `setDrawRange`. `SphereGeometry`
  poles are on local +Y; scene up is +Z (ecliptic normal).
- **Env is WSL2** — keep the whole stack in Docker; avoid Windows-node hazards.
- `BODIES.md` documents all seeded bodies.
