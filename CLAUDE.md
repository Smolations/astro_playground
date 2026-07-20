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

## Kernels

- `.bsp`/`.tls`/`.tpc` under `priv/kernels/` are **gitignored and disposable** —
  deleted between work sessions; a clean re-fetch doubles as first-time-setup
  validation. Download list + fetcher (`NaifFiles`) live in `priv/repo/seeds.exs`.
- **NAIF renames/supersedes filenames constantly.** The 2018 names (jup310,
  mar097, plu055...) 404. Current: `jup365`, `mar099s`, `plu060`, `nep097`
  (Triton), `nep105` (Nereid), `ura111` (Uranus majors, from `a_old_versions/`),
  `de432s` (planets).
- **Check coverage WITHOUT downloading:** every `foo.bsp` has a `foo.cmt`
  comment file at the same URL. `grep -A15 'Bodies on the File'` lists the
  covered bodies; also check the timespan covers the render epoch. A newer file
  is **not always a superset** — e.g. `ura116xl` dropped the five major moons
  (keeps only minor 716–724); the majors live in the older `ura111`.

## API (base `/api`, all JSON)

`GET /objects` (`?type=`, `?spice_name=`), `GET /objects/:id`,
`/objects/:id/size_and_shape` (radii + mu; `radii_measured:false` +
nominal-placeholder fallback when RADII missing; `mu:0` when GM missing),
`/objects/:id/orientation`, `/objects/:id/orbiting`, `/objects/:id/textures`,
`POST /trajectory`, `POST /get_state`, `/identify_code/:code`,
`/identify_name/:name`. (No formal schema yet — issue #2 proposes OpenAPI.)

## Frontend map (`assets/js/`)

- `routes.jsx` — RR6 routes: `/barycenters/:id` → system view (`Barycenter.jsx`
  → `BarycenterModel.jsx`); `/planets|satellites|stars|dwarf_planets/:id` →
  single body (`Spheroid.jsx` → `SpheroidModel.jsx`); `/objects` → home table.
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

## Roadmap / open issues

Revival directions: (1) findability markers ✅ · (2) moon systems ✅ (Earth,
Jupiter, Mars, Pluto, Uranus, Neptune — every system with available ephemeris;
Saturn moons not yet seeded) · (3) **Sun + planets finale** — forces the deferred
true-vs-exaggerated **scale toggle** (issue #4, intentionally held).

GitHub issues track the rest: #1 system-view axial tilt/spin (bodies look tipped
— `SpheroidModel.applyOrientation` does it right, reuse in `BarycenterModel`),
#2 OpenAPI docs, #3 kernel caching/subsetting, #5 validate home-page links +
grouping, #6 fresh-clone setup validation, #7 kernel-version upgrade check,
#8 UI polish, #9 project-specific Claude skills.

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
