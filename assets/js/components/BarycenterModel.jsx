import React from 'react';
import * as THREE from 'three';

import ThreeModel from './ThreeModel';
import Orbit from '../three/models/orbit';
import Locator from '../three/lib/marker';
import util from '../three/util';
import simSettings from '../three/lib/sim-settings';

const START_UTC = '2026-01-01T00:00:00';
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
  }

  async componentDidMount() {
    try {
      const barycenter = this.props.model;
      this.observer = String(barycenter.spice_id);
      const orbiting = (this.props.orbiting || []).map((o) => o.orbiting);

      const start = START_UTC;
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
      // Phase reference for spin: all bodies share START_UTC, and the SPICE
      // orientation epoch is that same instant, so spin angle is measured from
      // here. Driving spin off this shared clock is what makes tidal locking
      // fall out for free (the Moon's 13.18 deg/day == its orbital rate).
      this.et0 = this.et;
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

  // Streaming: next contiguous window for the (already-filtered) body list.
  fetchWindow = async (startUtc) => {
    const stopUtc = this.windowStop(startUtc);
    const trajectories = await Promise.all(
      this.bodyList.map((body) => this.fetchTrajectory(body, startUtc, stopUtc))
    );
    return { stopUtc, trajectories };
  };

  configureGUI = (gui) => {
    gui.add(this.guiSettings, 'animate').name('Animate?');
    gui.add(this.guiSettings, 'follow', ['Barycenter', ...this.bodyList.map((b) => b.name)]).name('Follow');
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
    camera.position.set(0, -TARGET_SCENE_RADIUS * 1.3, TARGET_SCENE_RADIUS * 1.05);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
  };

  preRender = ({ scene }) => {
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(-10, -6, 4);
    scene.add(key);

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

      return { orbit, mesh, locator, body, tiltQuat, spinRate };
    });
  };

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
      const offset = camera.position.clone().sub(controls.target);
      controls.target.copy(followPos);
      camera.position.copy(followPos).add(offset);
      this._followName = this.guiSettings.follow;
    } else {
      const d = followPos.clone().sub(this._prevFollowPos);
      camera.position.add(d);
      controls.target.add(d);
    }

    this._prevFollowPos.copy(followPos);
  }

  renderScene = ({ scene, camera, controls, renderer }) => {
    const clock = new THREE.Clock();

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

      this.applyFollow(camera, controls);
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
