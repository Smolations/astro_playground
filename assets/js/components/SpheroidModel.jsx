import React from 'react';
import * as THREE from 'three';

import Specs from '../three/lib/specs';
import Spheroid from '../three/models/spheroid';
import ThreeModel from './ThreeModel';
import QuantScale from '../three/lib/quant-scale';
import util from '../three/util';
import simSettings, { setBaseEtPerWallSecond } from '../three/lib/sim-settings';


// The single-body view has no orbital clock, so compress real time here:
// ephemeris seconds advanced per wall-second. Tuned so Earth (one sidereal
// rotation per day) spins about once every ~8 s; every other body's period
// stays true-to-scale against that — Jupiter races (~0.9 s), the Moon creeps
// (~3.6 min), Venus barely moves and turns backward.
const BODY_ET_PER_WALL_SECOND = 86400 / 8;

const _axesHelper = Symbol('axesHelper');
const _bodies = Symbol('bodies');
const _body = Symbol('body');
const _orbitals = Symbol('orbitals');


export default class SpheroidModel extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
    };

    this.maps = {};
    this.guiSettings = {};

    const bodyRadii = [
      props.specs.polar_radius,
    ].sort(util.numSort);
    console.log('bodyRadii = %o', bodyRadii);

    const prMin = bodyRadii[0];
    const prMax = bodyRadii[bodyRadii.length - 1];
    const prMinMaxScalar = prMin / prMax;
    const brMin = 0.2;
    const brMax = 5;

    this.bodyType = props.info.type;
    this.bodyScale = {
      min: brMin,
      max: brMax,
    };

    console.log('prMin: %o  |  prMax: %o  |  prMinMaxScalar: %o  |  brMin: %o', prMin, prMax, prMinMaxScalar, brMin);
    const bodyQuantScale = window.bodyQuant = new QuantScale({
      domain: [prMin, prMax],
      range: [Math.max(prMinMaxScalar * brMax, brMin), brMax],
    });

    const bodyScaleFn = (x) => {
      // console.log('body.scale(%o)', x);
      return bodyQuantScale(x);
    }

    this.bodyGroupSpecOpts = {
      mass: { scale: bodyScaleFn },
      volume: { scale: bodyScaleFn },
      density: { scale: bodyScaleFn },
      equatorialRadiusLarge: { scale: bodyScaleFn },
      equatorialRadiusSmall: { scale: bodyScaleFn },
      polarRadius: { scale: bodyScaleFn },
    };
  }


  async componentDidMount() {
    // Register this view's 1× rate so the global control's hint reflects body
    // spin time flow while a single body is on screen.
    setBaseEtPerWallSecond(BODY_ET_PER_WALL_SECOND);

    // Texture images are optional; a body with no (or a missing) map simply
    // renders as a bland sphere. Never let a failed load block the render.
    try {
      this.maps = await this.loadMaps(this.props.texture);
    } catch (err) {
      console.warn('texture loading failed; rendering without maps', err);
      this.maps = {};
    }

    // Real axial tilt + rotation sense from SPICE. Best-effort: falls back to
    // pole-up / prograde if unavailable.
    this.orientation = await fetch(`/api/objects/${this.props.info.id}/orientation`)
      .then((r) => r.json())
      .catch(() => null);

    this.setState({ loading: false });
  }

  applyOrientation(body) {
    const o = this.orientation;
    if (!o || !o.pole) return;

    // Align the body's local +Y (its pole) to the true pole vector, expressed
    // in the ecliptic (ECLIPJ2000) frame the scene uses.
    const pole = new THREE.Vector3(o.pole.x, o.pole.y, o.pole.z).normalize();
    body.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pole);
    // Real spin rate + sense; drives updatePosition. 0 leaves the body static.
    body.rotationDegPerDay = Number.isFinite(o.rotation_deg_per_day) ? o.rotation_deg_per_day : 0;
  }


  configureCamera = (camera) => {
    // Reposition the camera at an angle where axes markers would be
    // visible, and where sunlight is visible
    const yDist = {
      star: this.bodyScale.max * 2,
      planet: this.bodyScale.max * 2.5,
      dwarf_planet: this.bodyScale.max * 3, // eventually
      satellite: this.bodyScale.max * 5,
    }
    const camX = -5;
    const camY = -yDist[this.bodyType];
    const camZ = 3;

    camera.position.set(camX, camY, camZ);

    // Point the camera at the central body (origin)
    // camera.lookAt(new THREE.Vector3(0, 0, 0));

    return camera;
  }

  configureGUI = (gui) => {
    this.guiSettings.animate = true;

    // Time scale is a global control (top-center), not a per-view setting.
    gui.add( this.guiSettings, 'animate' ).name('Animate?');
    // gui.add( params, 'lookAt', bodies ).name('Look at:');

    gui.open();

    return gui;
  }

  getAxesHelper({ length = 2 } = {}) {
    // x-axis: red, y-axis: green, z-axis: blue
    return new THREE.AxesHelper( length );
  }

  getBody() {
    const { specs } = this.props;
    const { maps } = this;

    const body = new Spheroid({
      maps,
      specOpts: this.bodyGroupSpecOpts,
      ...specs,
    });

    return body;
  }

  getVernalEquinoxDirectionalLight() {
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );

    // enforces initial vernal equinox position
    directionalLight.position.set(-10, 0, 0);
    directionalLight.castShadow = true;

    return directionalLight;
  }

  async loadMaps(texture) {
    const path = '/images';
    const toLoad = [];
    const maps = {};
    let promise;

    if (texture) {
      for (const [textureType, texturePath] of Object.entries(texture)) {
        if (texturePath && !textureType.endsWith('id')) {
          promise = util.loadTexture(`${path}/${texturePath}`)
            .then((map) => {
              const key = (textureType !== 'map') ? `${textureType}Map` : textureType;
              console.log(`adding maps.${key} = %o`, map);
              maps[key] = map;
            })
            .catch(() => {
              // Missing/failed texture — skip it and render without this map.
              console.warn(`texture unavailable, skipping: ${texturePath}`);
            });

          toLoad.push(promise);
        }
      }
    }

    console.log('maps = %o', maps);
    return await Promise.all(toLoad)
      .then(() => maps);
  }


  preRender = ({ scene }) => {
    this[_axesHelper] = this.getAxesHelper({ length: this.bodyScale.max * 2 });
    this[_body] = this.getBody();
    this.applyOrientation(this[_body]);
    console.log(this[_body].toString());

    scene.add( this[_axesHelper] );
    scene.add( this[_body] );
    scene.add( this.getVernalEquinoxDirectionalLight() );
  }

  render() {
    return this.state.loading
      ? <p>Loading...</p>
      : (
          <ThreeModel
            cameraParams={{}}
            cameraConfigurator={this.configureCamera}
            rendererParams={{}}
            controlsParams={{}}
            guiParams={{}}
            guiConfigurator={this.configureGUI}
            preRender={this.preRender}
            renderScene={this.renderScene}
          />
        );
  }

  renderScene = ({ scene, camera, controls, renderer }) => {
    const clock = new THREE.Clock();
    let etElapsed = 0;

    const render = () => {
      const delta = clock.getDelta();

      if (this.guiSettings.animate) {
        // Accumulate elapsed *ephemeris* seconds incrementally, scaled by the
        // global time multiplier, so the spin period is true-to-scale (see
        // BODY_ET_PER_WALL_SECOND) and changing the scale mid-spin doesn't jump
        // (multiplying absolute elapsed time would retroactively rescale it).
        etElapsed += delta * BODY_ET_PER_WALL_SECOND * simSettings.timeScale;
        this[_body].updatePosition(etElapsed);
      }

      controls.update();

      // Render the scene/camera combination
      renderer.render(scene, camera);

      // Repeat
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }
};
