import React from 'react';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls';
// import { STLLoader } from 'three/examples/js/loaders/STLLoader';
// const loader = new STLLoader();console.log(loader);

import Specs from '../three/lib/specs';
import SpiceObjectModel from './SpiceObjectModel';
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
  }


  async componentDidMount() {
    console.log('BarycenterModel.componentDidMount: props %o', this.props);
    // this.maps = await this.loadMaps(this.props.texture);
    this.setState({ loading: false });
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

  preRender = ({ scene }) => {
    console.log('BarycenterModel preRender()');
    const axesHelper = this.getAxesHelper(); console.log(axesHelper);
    const directionalLight = this.getVernalEquinoxDirectionalLight(); console.log(directionalLight);
    const axis = this.getPolarAxis(2);
    const sphere = this.getSphere();

    scene.add( directionalLight );
    scene.add( axesHelper  );
    scene.add( axis  );
    scene.add( sphere  );
  }

  getPolarAxis(radius) {
    const material = new THREE.LineBasicMaterial();
    const geometry = new THREE.Geometry();
    const diameter = radius * 2;

    // maybe use values from a given sphere to make
    // sure axis goes through the center?
    geometry.vertices.push(
      new THREE.Vector3( 0, -1 * diameter, 0 ),
      new THREE.Vector3( 0, 1 * diameter, 0 )
    );

    return new THREE.Line( geometry, material );
  }

  getSphere() {
    const geometry = new THREE.SphereBufferGeometry( 1, 32, 32 );

    const matOpts = {
      color: 0xffffff,
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

  render() {
    return this.state.loading
      ? <p>Loading...</p>
      : (
          <SpiceObjectModel
            model={{}}
            cameraParams={{}}
            rendererParams={{}}
            controlsParams={{}}
            guiParams={{}}
            preRender={this.preRender}
            renderScene={this.renderScene}
          />
        );

    return (
      <SpiceObjectModel
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

  renderScene({ scene, camera, controls, renderer }) {
    const clock = new THREE.Clock();
    console.log('BarycenterModel renderScene %o', { scene, camera, controls, renderer });

    const render = () => {
      controls.update();

      renderer.render(scene, camera);

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }
};
