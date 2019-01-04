import React from 'react';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls';
// import { STLLoader } from 'three/examples/js/loaders/STLLoader';
// const loader = new STLLoader();console.log(loader);

import Specs from '../three/lib/specs';
import Spheroid from '../three/models/spheroid';
import ThreeModel from './ThreeModel';
import QuantScale from '../three/lib/quant-scale';
import util from '../three/util';


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
    console.log('SpheroidModel.componentDidMount: props %o', this.props);
    this.maps = await this.loadMaps(this.props.texture);

    this.setState({ loading: false });
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
    this.guiSettings.timeScale = 10;

    gui.add( this.guiSettings, 'animate' ).name('Animate?');
    // gui.add( params, 'timeScale' ).min(1).max(20).step(1).name('Time Scale x');
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

    const render = () => {
      if (!this.guiSettings.animate) {
        controls.update();

      } else {
        const t = clock.getElapsedTime();

        // Update animated elements
        this[_body].updatePosition(t);
      }

      // Render the scene/camera combination
      renderer.render(scene, camera);

      // Repeat
      requestAnimationFrame(render);
    };

    // this.renderer.autoClear = false;

    requestAnimationFrame(render);
  }
};
