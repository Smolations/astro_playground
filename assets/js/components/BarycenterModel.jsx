import React from 'react';
import * as THREE from 'three';

import ThreeModel from './ThreeModel';
import Orbit from '../three/models/orbit';
import Locator from '../three/lib/marker';
import util from '../three/util';

const START_UTC = '2026-01-01T00:00:00';
// Contiguous sample window fetched per streaming step; longer than one period so
// the trail/guide have a full revolution to work with and refetches are rare.
const WINDOW_DAYS = 60;
const SAMPLES = 240;

// True proportions: the largest orbit maps to this many scene units.
const TARGET_SCENE_RADIUS = 8;

// Wall-clock seconds for one orbital period, at time scale 1. Tuned so the
// default (1) is an unhurried, take-it-in pace. (A future "actual" mode would
// make motion effectively imperceptible.)
const SECONDS_PER_ORBIT = 60;
// Prefetch the next window once this fraction of the current one is left.
const PREFETCH_FRACTION = 0.4;


export default class BarycenterModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, error: null };

    this.orbits = [];        // [{ orbit: Orbit, mesh, locator, body }]
    this.scale = 1;          // km -> scene units
    this.etPerSecond = 0;    // playback rate
    this.et = 0;             // continuous ephemeris clock
    this.guiSettings = { animate: true, timeScale: 1, follow: 'Barycenter', markers: false, guide: false };
    this._lastGuide = false;
    this._lastMarkers = false;
    this._followName = 'Barycenter';
    this._prevFollowPos = new THREE.Vector3();
  }

  async componentDidMount() {
    try {
      const barycenter = this.props.model;
      this.observer = String(barycenter.spice_id);
      this.bodyList = (this.props.orbiting || []).map((o) => o.orbiting);

      // Initial window + per-body size and texture.
      const { stopUtc, trajectories } = await this.fetchWindow(START_UTC);
      this.currentStopUtc = stopUtc;

      const [specsList, maps] = await Promise.all([
        Promise.all(
          this.bodyList.map((b) =>
            fetch(`/api/objects/${b.id}/size_and_shape`).then((r) => r.json())
          )
        ),
        Promise.all(
          this.bodyList.map((b) =>
            b.texture && b.texture.map
              ? util.loadTexture(`/images/${b.texture.map}`).catch(() => null)
              : null
          )
        ),
      ]);

      // True-proportion scale from the largest orbit radius in the system.
      const maxR = Math.max(
        ...trajectories.flatMap((t) => t.samples.map((s) => Math.hypot(s.x, s.y, s.z)))
      );
      this.scale = TARGET_SCENE_RADIUS / maxR;

      this.data = this.bodyList.map((body, i) => ({
        body,
        traj: trajectories[i],
        specs: specsList[i],
        map: maps[i],
      }));

      this.et = trajectories[0].samples[0].et;
      this.setState({ loading: false });
    } catch (err) {
      console.error('BarycenterModel load failed', err);
      this.setState({ loading: false, error: String(err) });
    }
  }

  // Fetch one contiguous window (close=false) for every orbiting body, aligned
  // to this.bodyList. Windows are contiguous in UTC so playback never jumps.
  fetchWindow = async (startUtc) => {
    const stopUtc = new Date(Date.parse(startUtc) + WINDOW_DAYS * 86400 * 1000)
      .toISOString()
      .replace(/\.\d+Z$/, '');

    const trajectories = await Promise.all(
      this.bodyList.map((body) =>
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
            close: false, // contiguous samples for continuous playback
          }),
        }).then((r) => r.json())
      )
    );

    return { stopUtc, trajectories };
  };

  configureGUI = (gui) => {
    gui.add(this.guiSettings, 'animate').name('Animate?');
    gui.add(this.guiSettings, 'timeScale', 0.1, 10).name('Time scale');
    gui.add(this.guiSettings, 'follow', ['Barycenter', ...this.bodyList.map((b) => b.name)]).name('Follow');
    gui.add(this.guiSettings, 'markers').name('Show markers');
    gui.add(this.guiSettings, 'guide').name('Show ellipse guide');
    gui.open();
    return gui;
  };

  configureCamera = (camera) => {
    camera.position.set(0, -TARGET_SCENE_RADIUS * 2.2, TARGET_SCENE_RADIUS * 0.75);
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

    this.orbits = this.data.map(({ body, specs, map, traj }) => {
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
      scene.add(mesh);

      // Findability: a constant-pixel dot that fades as the real sphere resolves.
      const locator = new Locator({ worldRadius });
      locator.object3d.visible = this.guiSettings.markers;
      scene.add(locator.object3d);

      return { orbit, mesh, locator, body };
    });

    // Playback rate: one period per SECONDS_PER_ORBIT wall-seconds.
    const period = this.orbits[0].orbit.periodEt || 27.32 * 86400;
    this.etPerSecond = period / SECONDS_PER_ORBIT;
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
        this.et += delta * this.guiSettings.timeScale * this.etPerSecond;
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
      this.orbits.forEach(({ orbit, mesh, locator }) => {
        const pos = orbit.positionAtEt(this.et);
        mesh.position.copy(pos);
        orbit.updateTrail(this.et);
        if (this.guiSettings.markers) locator.update(pos, camera, viewportHeight);
        mesh.rotation.y += 0.01;
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
