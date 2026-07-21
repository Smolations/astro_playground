import React from 'react';
import * as THREE from 'three';

import ThreeModel from './ThreeModel';
import Orbit from '../three/models/orbit';
import Locator from '../three/lib/marker';
import util from '../three/util';
import simSettings, { setBaseEtPerWallSecond } from '../three/lib/sim-settings';

const DEFAULT_START_UTC = '2026-01-01T00:00:00';
// NAIF id for the Sun — fetched as an extra trajectory to drive real lighting.
const SUN_SPICE_ID = '10';
// Contiguous sample window fetched per streaming step; longer than one period so
// the trail/guide have a full revolution to work with and refetches are rare.
// The step (WINDOW_DAYS/SAMPLES ~ 0.04 day) must be small relative to the
// fastest moon's period or its orbit aliases (Metis/Amalthea are ~0.3-0.5 day).
const WINDOW_DAYS = 40;
const SAMPLES = 1000;

// True proportions: the largest orbit maps to this many scene units.
const TARGET_SCENE_RADIUS = 8;

// Fallback framing for a system with no orbital extent (a moonless planet on
// its own barycenter): scale so the largest body radius spans 1/this of the
// scene, rather than dividing by a ~0 orbit radius.
const MIN_EXTENT_BODY_RADII = 3;

// Frame the system on its *regular* extent: ignore orbits beyond this multiple
// of the median orbit radius when choosing the initial scale. A distant
// irregular moon (Saturn's Phoebe ~215 planet radii out, Neptune's Nereid)
// would otherwise dominate the scale and load the view absurdly zoomed out.
// Trimmed orbits still render — they just extend past the initial frame.
const FRAME_MEDIAN_MULTIPLE = 12;

// GLOBAL simulation speed: ephemeris-time seconds advanced per wall-second at
// time scale 1 — the same for every system, so a body's on-screen speed
// reflects its true period (an inner moon really is faster than an outer one).
// Calibrated to ~one lunar orbit per minute. (An "actual" mode would set this
// to 1, making motion imperceptible.)
const ET_PER_WALL_SECOND = (27.321661 * 86400) / 60;

// Prefetch the next window once this fraction of the current one is left.
const PREFETCH_FRACTION = 0.4;

const DEG2RAD = Math.PI / 180;

// SphereGeometry's poles are on local +Y, so a body's spin axis is local +Y
// before we tilt it. Scene up is +Z (the ecliptic normal), so an untilted mesh
// has its poles pointing sideways — that's the "bodies look tipped" bug (#1).
const LOCAL_POLE = new THREE.Vector3(0, 1, 0);

// Scratch quaternion reused each frame to avoid per-frame allocation.
const _spinQ = new THREE.Quaternion();

// Zoom-in cap for a focused body: closest approach leaves a full body-diameter
// of empty space between the camera and the surface, so distance-to-centre =
// radius + diameter = 3× radius. Sizing the cap to the body keeps a tiny moon
// (Earth's Moon in the system view) reachable, where a fixed floor left it a
// distant speck. Floored by MIN_SURFACE_GAP so a very small body can't dolly
// past the near clip plane.
const MIN_SURFACE_GAP = 0.02;

// Zoom-in cap when following the barycenter itself (no single focused body).
const BARY_MIN_DISTANCE = 0.15;

// Default whole-system framing offset (camera relative to the look-at target):
// a 3/4 view ~40° above the ecliptic. Used at load and to reset framing when the
// Follow target changes, so switching Follow doesn't inherit a deep Focus zoom.
const DEFAULT_VIEW_OFFSET = new THREE.Vector3(0, -TARGET_SCENE_RADIUS * 1.3, TARGET_SCENE_RADIUS * 1.05);

// Focus dolly: frame the body at this many radii from centre (~⅓ of view
// height at fov 70) and ease the move over this many seconds.
const FRAME_RADII = 4.5;
const FOCUS_SECONDS = 0.8;

// Ambient fill in the system view. Low, so the real directional Sun leaves a
// visible terminator/phase instead of washing the dark side flat.
const AMBIENT_INTENSITY = 0.2;
// Distance to park the directional Sun light — only its direction matters.
const SUN_LIGHT_DIST = 50;

const smoothstep = (t) => t * t * (3 - 2 * t);

// Treat a non-2xx response (e.g. a 500 HTML error page) as a failure rather
// than trying to JSON.parse "<!DOCTYPE ...".
function okJson(r) {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}


export default class BarycenterModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, error: null };

    this.orbits = [];        // [{ orbit: Orbit, mesh, locator, body }]
    this.scale = 1;          // km -> scene units
    this.et = 0;             // continuous ephemeris clock
    // timeScale is global (top-center TimeScaleControl) — not a per-view knob.
    this.guiSettings = { animate: true, follow: 'Barycenter', markers: false, guide: false };
    this._lastGuide = false;
    this._lastMarkers = false;
    this._followName = 'Barycenter';
    this._prevFollowPos = new THREE.Vector3();

    this.startUtc = DEFAULT_START_UTC;
    this.sunOrbit = null;        // interpolated Sun path driving the key light
    this._focus = null;          // active dolly transition, or null
    this._focusRequested = false;
  }

  async componentDidMount() {
    // Register this view's 1× rate so the global control's hint reflects
    // orbital time flow while a system is on screen.
    setBaseEtPerWallSecond(ET_PER_WALL_SECOND);
    try {
      const barycenter = this.props.model;
      this.observer = String(barycenter.spice_id);
      const orbiting = (this.props.orbiting || []).map((o) => o.orbiting);

      const start = this.startUtc;
      const stop = this.windowStop(start);
      this.currentStopUtc = stop;

      // Load each body independently and skip any whose trajectory or size
      // fails (tiny moons with no measured radii, or bodies with no loaded
      // ephemeris kernel) — one missing body shouldn't blank the whole system.
      const loaded = await Promise.all(
        orbiting.map(async (body) => {
          try {
            const traj = await this.fetchTrajectory(body, start, stop);
            if (!traj || !traj.samples || !traj.samples.length) return null;

            const specs = await fetch(`/api/objects/${body.id}/size_and_shape`).then(okJson);
            const map =
              body.texture && body.texture.map
                ? await util.loadTexture(`/images/${body.texture.map}`).catch(() => null)
                : null;

            // Real axial tilt + rotation sense/rate from SPICE (in ECLIPJ2000,
            // the scene frame). Best-effort: a body without orientation falls
            // back to pole-up / no spin rather than being skipped.
            const orientation = await fetch(`/api/objects/${body.id}/orientation`)
              .then(okJson)
              .catch(() => null);

            return { body, traj, specs, map, orientation };
          } catch (e) {
            console.warn(`Skipping ${body.name} in system view:`, String(e));
            return null;
          }
        })
      );

      this.data = loaded.filter(Boolean);
      this.bodyList = this.data.map((d) => d.body);
      if (!this.data.length) throw new Error('no renderable bodies in this system');

      // True-proportion scale, framed on the system's regular extent. Take each
      // body's max distance from the barycenter over the window, then frame on
      // the largest that's within FRAME_MEDIAN_MULTIPLE of the median — so a
      // distant irregular moon (Phoebe, Nereid) doesn't blow out the scale and
      // leave the main system a speck. Trimmed orbits still render past the frame.
      const bodyRadii = this.data
        .map((d) => Math.max(...d.traj.samples.map((s) => Math.hypot(s.x, s.y, s.z))))
        .sort((a, b) => a - b);

      const median = bodyRadii[Math.floor(bodyRadii.length / 2)];
      const cap = median * FRAME_MEDIAN_MULTIPLE;
      const framed = bodyRadii.filter((r) => r <= cap);
      const frameR = framed.length ? framed[framed.length - 1] : bodyRadii[bodyRadii.length - 1];

      // A moonless planet sits essentially on its own barycenter, so frameR ~ 0 —
      // dividing by it yields an infinite scale and a NaN-sized (invisible)
      // sphere. Floor the extent by the largest body radius so it stays visible.
      const maxBodyR = Math.max(
        ...this.data.map((d) => d.specs.polar_radius || d.specs.equatorial_radius_large || 1000)
      );
      const extentKm = Math.max(frameR, maxBodyR * MIN_EXTENT_BODY_RADII);
      this.scale = TARGET_SCENE_RADIUS / extentKm;

      this.et = this.data[0].traj.samples[0].et;
      // Phase reference for spin: spin angle is measured from the window start
      // (reset on a "Now" jump). Driving spin off this shared clock at the real
      // rate is what makes tidal locking fall out for free (the Moon's 13.18
      // deg/day == its orbital rate), regardless of the absolute epoch.
      this.et0 = this.et;

      // Sun as an extra interpolated trajectory to drive real lighting. Skip
      // for the Solar-System barycenter (observer '0'), where the Sun ≈ the
      // centre and its direction degenerates — that view keeps a fixed key light.
      if (this.observer !== '0') {
        this.sunSamples = await this.fetchTrajectory({ spice_id: SUN_SPICE_ID }, start, stop)
          .then((t) => (t && t.samples && t.samples.length ? t.samples : null))
          .catch(() => null);
      }

      this.setState({ loading: false });
    } catch (err) {
      console.error('BarycenterModel load failed', err);
      this.setState({ loading: false, error: String(err) });
    }
  }

  windowStop(startUtc) {
    return new Date(Date.parse(startUtc) + WINDOW_DAYS * 86400 * 1000)
      .toISOString()
      .replace(/\.\d+Z$/, '');
  }

  // One contiguous window (close=false) for a single body.
  fetchTrajectory = (body, startUtc, stopUtc) =>
    fetch('/api/trajectory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        observer: this.observer,
        target: String(body.spice_id),
        start: startUtc,
        stop: stopUtc,
        steps: SAMPLES,
        frame: 'ECLIPJ2000',
        close: false,
      }),
    }).then(okJson);

  // Streaming: next contiguous window for the (already-filtered) body list,
  // plus the Sun window (when lit) so the light tracks the epoch too.
  fetchWindow = async (startUtc) => {
    const stopUtc = this.windowStop(startUtc);
    const [trajectories, sunTrajectory] = await Promise.all([
      Promise.all(this.bodyList.map((body) => this.fetchTrajectory(body, startUtc, stopUtc))),
      this.sunOrbit
        ? this.fetchTrajectory({ spice_id: SUN_SPICE_ID }, startUtc, stopUtc).catch(() => null)
        : Promise.resolve(null),
    ]);
    return { stopUtc, trajectories, sunTrajectory };
  };

  // Reset the whole view to a new start epoch (the "Now" button). Meshes/orbits
  // already exist, so this is just a buffer swap + clock reset via the streaming
  // path — bodies jump to that date's real positions and the lighting follows.
  jumpTo = async (startUtc) => {
    if (this._jumping || !this.orbits.length) return;
    this._jumping = true;
    try {
      const { stopUtc, trajectories, sunTrajectory } = await this.fetchWindow(startUtc);
      this.orbits.forEach(({ orbit }, i) => {
        const t = trajectories[i];
        if (t && t.samples && t.samples.length) orbit.setBuffer(t.samples);
      });
      if (this.sunOrbit && sunTrajectory && sunTrajectory.samples) {
        this.sunOrbit.setBuffer(sunTrajectory.samples);
      }
      this.startUtc = startUtc;
      this.currentStopUtc = stopUtc;
      this._pending = null;
      // Reset the clock (and spin phase reference) to the new window's start.
      this.et = this.et0 = this.orbits[0].orbit.bounds().startEt;
      // Leave `_followName`/`_prevFollowPos` alone: next frame applyFollow's
      // track branch translates the camera by the teleport delta (new − stale
      // followPos), so the followed body stays framed at the same zoom through
      // the jump — and it deliberately does NOT reset framing the way a Follow
      // *switch* does.
    } catch (e) {
      console.warn('jumpTo failed', String(e));
    } finally {
      this._jumping = false;
    }
  };

  // Current UTC trimmed to the API's second-resolution format.
  nowUtc() {
    return new Date().toISOString().replace(/\.\d+Z$/, '');
  }

  configureGUI = (gui) => {
    gui.add(this.guiSettings, 'animate').name('Animate?');
    gui.add(this.guiSettings, 'follow', ['Barycenter', ...this.bodyList.map((b) => b.name)]).name('Follow');
    // Dolly in to frame the followed body at a lit 3/4 angle (no-op for Barycenter).
    gui.add({ focus: () => { this._focusRequested = true; } }, 'focus').name('Focus body');
    // Jump the whole system to today's real positions + lighting.
    gui.add({ now: () => this.jumpTo(this.nowUtc()) }, 'now').name('Now');
    gui.add(this.guiSettings, 'markers').name('Show markers');
    gui.add(this.guiSettings, 'guide').name('Show ellipse guide');
    gui.open();
    return gui;
  };

  configureCamera = (camera) => {
    // A 3/4 top-down view (~40° above the orbital plane): orbits open into
    // legible ellipses and the system fills the frame, while enough obliquity
    // remains to read inclinations. A near-edge-on default made every system
    // look like a flat smear.
    camera.position.copy(DEFAULT_VIEW_OFFSET);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
  };

  preRender = ({ scene }) => {
    scene.add(new THREE.AmbientLight(0xffffff, AMBIENT_INTENSITY));

    if (this.sunSamples) {
      // Real Sun: a directional light aimed from the Sun's true position (updated
      // each frame from an interpolated Sun path), so bodies show real phases.
      this.sunOrbit = new Orbit({ scale: this.scale });
      this.sunOrbit.setBuffer(this.sunSamples);
      this.sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
      scene.add(this.sunLight);
    } else {
      // Fallback (Solar-System barycenter): the old fixed key light.
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(-10, -6, 4);
      scene.add(key);
    }

    // Barycenter locator: a constant-size gold dot. No physical size, so it
    // never fades. Hidden unless markers are enabled.
    this.baryLocator = new Locator({ color: 0xffcc33, size: 9, worldRadius: 0 });
    this.baryLocator.update(new THREE.Vector3(0, 0, 0));
    this.baryLocator.object3d.visible = this.guiSettings.markers;
    scene.add(this.baryLocator.object3d);
    scene.add(new THREE.AxesHelper(TARGET_SCENE_RADIUS * 0.5));

    this.orbits = this.data.map(({ body, specs, map, traj, orientation }) => {
      const orbit = new Orbit({ scale: this.scale });
      orbit.setBuffer(traj.samples);
      orbit.object3ds.forEach((o) => scene.add(o));

      const radiusKm = specs.polar_radius || specs.equatorial_radius_large || 1000;
      const worldRadius = radiusKm * this.scale;

      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1,
        metalness: 0.05,
      });
      if (map) material.map = map;

      const mesh = new THREE.Mesh(new THREE.SphereGeometry(worldRadius, 48, 48), material);

      // Tilt the spin axis to the body's true pole, expressed in ECLIPJ2000
      // (the scene frame). Missing orientation → pole up (ecliptic north).
      const tiltQuat = new THREE.Quaternion();
      const pole =
        orientation && orientation.pole
          ? new THREE.Vector3(orientation.pole.x, orientation.pole.y, orientation.pole.z)
          : new THREE.Vector3(0, 0, 1);
      tiltQuat.setFromUnitVectors(LOCAL_POLE, pole.normalize());
      mesh.quaternion.copy(tiltQuat);

      // deg/day; sign encodes prograde(+)/retrograde(-). No orientation → no spin.
      const spinRate =
        orientation && Number.isFinite(orientation.rotation_deg_per_day)
          ? orientation.rotation_deg_per_day
          : 0;

      scene.add(mesh);

      // Findability: a constant-pixel dot that fades as the real sphere resolves.
      const locator = new Locator({ worldRadius });
      locator.object3d.visible = this.guiSettings.markers;
      scene.add(locator.object3d);

      return { orbit, mesh, locator, body, tiltQuat, spinRate, worldRadius };
    });
  };

  // Cap zoom-in relative to the focused body's size: you can approach until the
  // camera is one body-diameter off the surface, then it stops. Keeps small
  // bodies reachable while never letting the camera punch into a large one.
  updateMinDistance(controls) {
    if (this.guiSettings.follow === 'Barycenter') {
      controls.minDistance = BARY_MIN_DISTANCE;
      return;
    }
    const entry = this.orbits.find((o) => o.body && o.body.name === this.guiSettings.follow);
    const r = entry ? entry.worldRadius : 0;
    controls.minDistance = r > 0 ? r + Math.max(2 * r, MIN_SURFACE_GAP) : BARY_MIN_DISTANCE;
  }

  // Stream the next contiguous window as we near the current one's end, and swap
  // buffers once consumed. `et` is clamped to available data so a slow fetch
  // pauses motion briefly rather than teleporting.
  maybeStream() {
    const b = this.orbits[0] && this.orbits[0].orbit.bounds();
    if (!b) return;

    const windowEt = WINDOW_DAYS * 86400;
    if (!this._streaming && !this._pending && this.et > b.endEt - windowEt * PREFETCH_FRACTION) {
      this._streaming = true;
      this.fetchWindow(this.currentStopUtc)
        .then((res) => {
          this._pending = res;
          this._streaming = false;
        })
        .catch(() => {
          this._streaming = false;
        });
    }

    if (this._pending && this.et >= b.endEt) {
      this.orbits.forEach(({ orbit }, i) =>
        orbit.setBuffer(this._pending.trajectories[i].samples)
      );
      if (this.sunOrbit && this._pending.sunTrajectory && this._pending.sunTrajectory.samples) {
        this.sunOrbit.setBuffer(this._pending.sunTrajectory.samples);
      }
      this.currentStopUtc = this._pending.stopUtc;
      this._pending = null;
    }

    this.et = Math.min(this.et, this.orbits[0].orbit.bounds().endEt);
  }

  getFollowPos() {
    if (this.guiSettings.follow === 'Barycenter') return new THREE.Vector3(0, 0, 0);
    const entry = this.orbits.find((o) => o.body && o.body.name === this.guiSettings.follow);
    return entry ? entry.orbit.positionAtEt(this.et) : new THREE.Vector3(0, 0, 0);
  }

  // Keep the followed body centred: on switch, re-anchor to it while preserving
  // the current view offset; otherwise translate camera + target by how far it
  // moved this frame.
  applyFollow(camera, controls) {
    const followPos = this.getFollowPos();

    if (this.guiSettings.follow !== this._followName) {
      // Reset to the default whole-system framing, then centre on the new
      // target — don't inherit the current (possibly deep Focus) zoom, or
      // switching Follow could bury the camera inside a large body.
      controls.target.copy(followPos);
      camera.position.copy(followPos).add(DEFAULT_VIEW_OFFSET);
      this._followName = this.guiSettings.follow;
      this.updateMinDistance(controls);
    } else {
      const d = followPos.clone().sub(this._prevFollowPos);
      camera.position.add(d);
      controls.target.add(d);
    }

    this._prevFollowPos.copy(followPos);
  }

  // Begin a dolly that frames the followed body. No-op when following the
  // barycenter (nothing specific to frame).
  beginFocus(camera, controls) {
    const name = this.guiSettings.follow;
    if (name === 'Barycenter') return;
    const entry = this.orbits.find((o) => o.body && o.body.name === name);
    if (!entry) return;

    const d = Math.max(FRAME_RADII * entry.worldRadius, entry.worldRadius + MIN_SURFACE_GAP);

    // Dolly straight in along the CURRENT sightline: keep the user's orientation
    // (don't reorient the orbital plane — a sun-relative angle could swing the
    // system edge-on/vertical, which is disorienting, especially for a tilted
    // moon plane like Saturn's). Real Sun lighting still gives the phase; the
    // user can orbit for a different angle. Fall back to the default 3/4
    // direction only if the camera sits right on the target.
    const dir = camera.position.clone().sub(controls.target);
    if (dir.lengthSq() < 1e-9) dir.set(0, -1.3, 1.05);
    dir.normalize();

    this._focus = {
      t: 0,
      name,
      entry,
      from: camera.position.clone(),
      fromTarget: controls.target.clone(),
      destOffset: dir.multiplyScalar(d),
    };
    this.guiSettings.follow = name; // so applyFollow tracks it after the dolly
    this.updateMinDistance(controls);
  }

  // Advance the active dolly; hand control back to applyFollow when it lands.
  stepFocus(camera, controls, delta) {
    const f = this._focus;
    f.t = Math.min(1, f.t + delta / FOCUS_SECONDS);
    const e = smoothstep(f.t);

    const bodyPos = f.entry.orbit.positionAtEt(this.et);
    const destPos = bodyPos.clone().add(f.destOffset);
    camera.position.lerpVectors(f.from, destPos, e);
    controls.target.lerpVectors(f.fromTarget, bodyPos, e);

    if (f.t >= 1) {
      this._followName = f.name;
      this._prevFollowPos.copy(bodyPos);
      this._focus = null;
    }
  }

  renderScene = ({ scene, camera, controls, renderer }) => {
    const clock = new THREE.Clock();

    // Initial cap for the default follow (Barycenter); refreshed on each switch.
    this.updateMinDistance(controls);

    const render = () => {
      const delta = clock.getDelta();
      if (this.guiSettings.animate) {
        this.et += delta * simSettings.timeScale * ET_PER_WALL_SECOND;
      }

      this.maybeStream();

      if (this.guiSettings.guide !== this._lastGuide) {
        this.orbits.forEach(({ orbit }) => {
          orbit.guideVisible = this.guiSettings.guide;
        });
        this._lastGuide = this.guiSettings.guide;
      }

      if (this.guiSettings.markers !== this._lastMarkers) {
        this.baryLocator.object3d.visible = this.guiSettings.markers;
        this.orbits.forEach(({ locator }) => {
          locator.object3d.visible = this.guiSettings.markers;
        });
        this._lastMarkers = this.guiSettings.markers;
      }

      const viewportHeight = renderer.domElement.height;
      this.orbits.forEach(({ orbit, mesh, locator, tiltQuat, spinRate }) => {
        const pos = orbit.positionAtEt(this.et);
        mesh.position.copy(pos);
        orbit.updateTrail(this.et);
        if (this.guiSettings.markers) locator.update(pos, camera, viewportHeight);

        // Spin about the true pole at the real rate, phased off the same
        // ephemeris clock as the orbit. Compose tilt ∘ spin: spin is about the
        // untilted local pole (+Y), then tilt carries it to the real pole — so
        // the net rotation is about the true axis. Because the spin shares the
        // orbit's clock, a synchronous rotator (Moon, Io, Titan) keeps one face
        // toward its primary instead of tumbling.
        const spinAngle = spinRate * (this.et - this.et0) / 86400 * DEG2RAD;
        _spinQ.setFromAxisAngle(LOCAL_POLE, spinAngle);
        mesh.quaternion.copy(tiltQuat).multiply(_spinQ);
      });

      // Aim the real Sun light from the Sun's current direction.
      if (this.sunOrbit && this.sunLight) {
        const s = this.sunOrbit.positionAtEt(this.et);
        if (s.lengthSq() > 1e-9) this.sunLight.position.copy(s.normalize()).multiplyScalar(SUN_LIGHT_DIST);
      }

      if (this._focusRequested) {
        this._focusRequested = false;
        this.beginFocus(camera, controls);
      }
      if (this._focus) this.stepFocus(camera, controls, delta);
      else this.applyFollow(camera, controls);
      controls.update();

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  };

  render() {
    if (this.state.loading) return <p>Loading system…</p>;
    if (this.state.error) return <p>Failed to load system: {this.state.error}</p>;

    return (
      <ThreeModel
        cameraParams={{ nearClip: 0.01, farClip: 100000 }}
        cameraConfigurator={this.configureCamera}
        guiParams={{}}
        guiConfigurator={this.configureGUI}
        preRender={this.preRender}
        renderScene={this.renderScene}
      />
    );
  }
}
