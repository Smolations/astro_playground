import React from 'react';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls';
// import { STLLoader } from 'three/examples/js/loaders/STLLoader';
// const loader = new STLLoader();console.log(loader);

import Specs from '../three/lib/specs';
import ThreeModel from './ThreeModel';
import Spheroid from '../three/models/spheroid';
import QuantScale from '../three/lib/quant-scale';
import util from '../three/util';
import windowResize from '../three/lib/window-resize';


const _axesHelper = Symbol('axesHelper');
const _bodies = Symbol('bodies');
const _body = Symbol('body');
const _orbitals = Symbol('orbitals');


export default class BarycenterModel extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
    };

    this.baryScene = new THREE.Scene();
  }


  async componentDidMount() {
    console.log('BarycenterModel.componentDidMount: props %o', this.props);
    // this.maps = await this.loadMaps(this.props.texture);
    this.setState({ loading: false });
  }

  getAmbientLight() {
    const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
    return ambientLight;
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

  getSphere() {
    const geometry = new THREE.SphereBufferGeometry( 1, 32, 32 );

    const matOpts = {
      color: 0xaec7fd,
      metalness: 0.1,
      roughness: 1,
    };

    const material = new THREE.MeshStandardMaterial( matOpts );
    const sphere = new THREE.Mesh( geometry, material );

    // maybe create accessors for these?
    sphere.castShadow = false;
    sphere.receiveShadow = false;

    return sphere;
  }

  preRender = ({ scene }) => {
    console.log('BarycenterModel preRender()');
    const axesHelper = this.getAxesHelper();
    const ambientLight = this.getAmbientLight();
    const sphere = this.getSphere();

    scene.add( axesHelper  );

    this.baryScene.add( sphere  );
    this.baryScene.add( ambientLight );
  }

  render() {
    return this.state.loading
      ? <p>Loading...</p>
      : (
          <ThreeModel
            cameraParams={{}}
            rendererParams={{}}
            controlsParams={{}}
            guiParams={{}}
            preRender={this.preRender}
            renderScene={this.renderScene}
          />
        );

    return (
      <ThreeModel
        model={{}}
        cameraParams={{}}
        cameraConfigurator={() => {}}
        rendererParams={{}}
        rendererConfigurator={() => {}}
        guiParams={{}}
        guiConfigurator={() => {}}
        controlsConfigurator={() => {}}
        renderScene={() => {}}
      />
    );
  }

  renderScene = ({ scene, camera, controls, renderer }) => {
    const clock = new THREE.Clock();
    console.log('BarycenterModel renderScene %o', { scene, camera, controls, renderer });

    const render = () => {
      controls.update();

      renderer.clear();
      renderer.render(scene, camera);
      renderer.render(this.baryScene, camera);

      requestAnimationFrame(render);
    }

    // needed for multiple scenes
    renderer.autoClear = false;

    requestAnimationFrame(render);
  }
};
