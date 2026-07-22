---
name: verify-render
description: >-
  Verify AstroPlayground actually renders by driving the running SPA headlessly
  (screenshots + console-error capture) and reading the images back. Use whenever
  a change touches the WebGL/three.js or React render path — BarycenterModel,
  SpheroidModel, Orbit, Spheroid, lighting, camera/controls, tilt/spin, the
  lil-gui panel, or the global time control — and you need to SEE it work, not
  just typecheck. Also covers SPICE data spot-checks (trajectory / orientation /
  state vectors) and resolving DB ids. Triggers: "screenshot the app", "does this
  render", "verify the system/body view", "check the orbit / tilt / lighting /
  focus / phase", "did I break the barycenter view".
---

# Verify a render (headless Playwright)

The SPA is client-only WebGL (three.js can't render server-side), so the only way
to know a render change works is to **drive the real page and look**. This skill
packages the container recipe as a parameterized driver plus data spot-checks.

## 0. Preconditions

The Docker stack must be up (the driver joins its network to reach `assets:5173`):

```bash
docker compose ps            # db, app, assets should be "running"
docker compose up -d         # if not
```

Everything below is read-only against the running app — no rebuilds, no seeds.

## 1. Screenshot a route (the common case)

Write an ordered **steps** spec, run the driver, then Read the PNGs it saves.
Put working files in your scratchpad dir, not the repo.

```bash
SCRATCH="<your scratchpad>/render"; mkdir -p "$SCRATCH"
cat > "$SCRATCH/steps.json" <<'JSON'
[ { "goto": "/barycenters/4" }, { "wait": 9000 }, { "shot": "earthmoon" } ]
JSON
.claude/skills/verify-render/scripts/run.sh "$SCRATCH/steps.json" "$SCRATCH/shots"
```

Then **Read** `$SCRATCH/shots/earthmoon.png`. The first run installs `playwright`
into a cached dir (~15s); later runs are fast.

### Step vocabulary (`shot.js`)

One key per step, executed in order:

| Step | Effect |
|---|---|
| `{"goto":"/barycenters/4"}` | navigate (waits for DOM) |
| `{"wait":9000}` | sleep ms — **WebGL scenes need ~8–10s** to paint before a shot |
| `{"shot":"name","clip":[x,y,w,h]}` | screenshot → `<out>/name.png` (clip optional) |
| `{"gui":"Focus body"}` | click a lil-gui **button** by its exact label |
| `{"follow":"Luna"}` | set a `<select>` whose options include this value (the Follow dropdown) |
| `{"toggle":"Show markers"}` | toggle a lil-gui **checkbox** by label |
| `{"slider":["#time_scale_range",5]}` | set a range/number input (React-safe) |
| `{"eval":"document.title"}` | evaluate an expression and log its value (great for asserting state) |
| `{"log":"msg"}` | echo a marker into the run log |

`run.sh <steps.json> <out-dir> [network] [viewport] [base-url]`. Viewport
defaults to `1000x800`. Exit code: **0 clean, 1 = page error(s) occurred**
(the log prints `PAGEERROR: …`), 2 = driver crashed.

### Reading results

- **Read** each PNG and describe what you see vs. what the change intended.
- Ignore `defaultProps` / `findDOMNode` console noise — it's benign semantic-ui-react
  deprecation spam and the driver already filters it. A real regression shows as a
  `PAGEERROR:` line or a visibly broken/blank scene.
- Bodies in a system view are **tiny at true proportion** — an "empty" overview is
  usually correct, not a bug. Use `follow` + `Focus body`, or `toggle Show markers`,
  to actually see a small body.

## 2. Resolve DB ids (routes use the DB id, not the NAIF id)

Barycenter DB ids: Solar System 1, Mercury 2, Venus 3, Earth 4, Mars 5,
Jupiter 6, Saturn 7, Uranus 8, Neptune 9, Pluto 10. Routes:
`/barycenters/:id` (system view), `/planets|satellites|stars|dwarf_planets/:id`
(single body). Look up a body's id / name / spice_id:

```bash
curl -s "http://localhost:4000/api/objects?type=satellite" \
  | python3 -c "import sys,json; [print(o['id'],o['name'],o.get('spice_id')) for o in json.load(sys.stdin)['data']]"
curl -s "http://localhost:4000/api/objects/7/orbiting" \
  | python3 -c "import sys,json; [print((o.get('orbiting') or o)['name']) for o in json.load(sys.stdin)['data']]"
```

The `follow`/GUI labels match the body **name** (e.g. `Luna`, `Enceladus`),
which the Follow dropdown is built from.

## 3. Spot-check the SPICE data (not just the pixels)

When a render looks wrong, confirm whether the **data** is right before chasing a
rendering bug. Directly in the app container:

```bash
docker compose exec app python3 -c "import spiceypy as s; \
  s.furnsh('priv/kernels/meta_kernels/meta_kernel.tm'); \
  print(s.spkezr('301', s.str2et('2026-01-01'), 'ECLIPJ2000','NONE','3'))"
```

Or via the API (JSON): orientation `GET /api/objects/:id/orientation` (pole +
`rotation_deg_per_day`); a state vector `POST /api/get_state`
`{date,target,observer,frame}`; a path `POST /api/trajectory`
`{observer,target,start,stop,steps,frame,close}`. The Sun is NAIF `10`; use a
barycenter `spice_id` as `observer` for physically-correct geometry.

## Gotchas

- **Network name** is the compose project (`astro_playground_default`); `run.sh`
  auto-discovers it, but a renamed checkout may need the 3rd arg.
- **Playwright version is pinned to `v1.48.0`** to match the image tag — bump both
  together or browser/lib mismatch.
- GUI labels are matched **exactly** (`Focus body`, `Now`, `Show markers`,
  `Show ellipse guide`, `Animate?`, `Reset view`). If a click logs `NOT FOUND`,
  re-check the label text in `BarycenterModel.configureGUI` / `SpheroidModel`.
- To crop a shot (e.g. just the time-scale control), pass `clip:[x,y,w,h]`.
