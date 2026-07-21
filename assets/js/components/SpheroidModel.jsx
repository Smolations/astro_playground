import React from 'react';
import * as THREE from 'three';

import Specs from '../three/lib/specs';
import Spheroid from '../three/models/spheroid';
import ThreeModel from './ThreeModel';
import QuantScale from '../three/lib/quant-scale';
import util from '../three/util';
import simSettings, { clearBaseEtPerWallSecond } from '../three/lib/sim-settings';


// The isolated single-body view is a showcase, not a physics sim: it's about
// looking at one body on its own. So every body gets the SAME calm baseline
// spin and the SAME fixed axial tilt — framing stays consistent from body to
// body. (Real per-body obliquity + rotation, and satellite tidal-locking, live
// in the system view.) One revolution per this many wall-seconds at 1×; the
// global time scale multiplies it.
const BODY_SPIN_SECONDS_PER_REV = 8;

// Consistent display tilt (deg) for every body's pole — a recognizable "tilted
// globe" lean, identical for all so the polar axis always reads the same angle.
const BODY_DISPLAY_TILT_DEG = 23.4;

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
    // The showcase view uses a fixed display tilt + uniform spin (no SPICE
    // orientation needed). Clear any base rate a prior system view registered,
    // so the global control drops its real→sim hint — the showcase spin isn't
    // physical time, so the time scale is just a spin-speed multiplier here.
    clearBaseEtPerWallSecond();

    // Texture images are optional; a body with no (or a missing) map simply
    // renders as a bland sphere. Never let a failed load block the render.
    try {
      this.maps = await this.loadMaps(this.props.texture);
    } catch (err) {
      console.warn('texture loading failed; rendering without maps', err);
      this.maps = {};
    }

    this.setState({ loading: false });
  }

  applyDisplayTilt(body) {
    // Fixed, consistent orientation for the showcase view: put the pole (local
    // +Y) up (+Z), then lean it a constant amount so every body shows the same
    // recognizable axial tilt regardless of its real obliquity.
    const poleUp = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1)
    );
    const lean = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      THREE.MathUtils.degToRad(BODY_DISPLAY_TILT_DEG)
    );
    body.quaternion.copy(lean).multiply(poleUp);
  }


  configureCamera = (camera) => {
    // A 3/4 hero view from above the equator, with up = ecliptic +Z, so the
    // fixed display tilt reads as a near-vertical polar axis (a globe on a
    // stand) rather than the old near-edge-on framing that left the axis lying
    // closer to horizontal. Distance is keyed to body type for a nice frame.
    const dist = {
      star: this.bodyScale.max * 2.4,
      planet: this.bodyScale.max * 3,
      dwarf_planet: this.bodyScale.max * 3.5,
      satellite: this.bodyScale.max * 5,
    }[this.bodyType] || this.bodyScale.max * 3;

    camera.up.set(0, 0, 1);
    camera.position.set(-dist * 0.35, -dist * 0.82, dist * 0.5);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

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
    this.applyDisplayTilt(this[_body]);
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
    let spinRad = 0;
    const spinRadPerSec = (2 * Math.PI) / BODY_SPIN_SECONDS_PER_REV;

    const render = () => {
      const delta = clock.getDelta();

      if (this.guiSettings.animate) {
        // Uniform baseline spin for every body, scaled by the global time
        // multiplier. Accumulated incrementally so a mid-spin scale change
        // doesn't jump.
        spinRad += delta * spinRadPerSec * simSettings.timeScale;
        this[_body].updatePosition(spinRad);
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
