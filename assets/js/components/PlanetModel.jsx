import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls';
// import { STLLoader } from 'three/examples/js/loaders/STLLoader';
// const loader = new STLLoader();console.log(loader);

import util from '../three/util';
import Body from '../three/models/body';
import Satellite from '../three/models/satellite';


const _body = Symbol('body');
const _satellites = Symbol('satellites');


export default class PlanetModel extends React.Component {
  constructor(props) {
    super(props);

    const dims = { x: 800, y: 800 };

    this.canvasRef = React.createRef();
    this.dims = dims;
    this.maps = {};

    this[_satellites] = [];

    /*
      a group or stage containing all the objects we want to render. Scenes
      allow you to set up what and where is going to be rendered by Three.js.
      This is where you place objects, lights, and cameras.
    */
    this.scene = new THREE.Scene();
  }

  addBody() {
    const { specs, texture } = this.props;
    const { maps } = this;

    const body = new Body({
      diameter: 2,
      // diameter: specs.diameter,
      axialTilt: specs.axial_tilt,
      rotationPeriod: specs.rotation_period,
      maps,
    });

    this[_body] = body;
    this.scene.add( body );
  }

  addLighting() {
    // Add an ambient lights
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    // this.scene.add(ambientLight);

    // Add a point light that will cast shadows
    // const pointLight = new THREE.PointLight(0xffffff, 0.8);
    // pointLight.position.set(80, 160, 120);
    // pointLight.castShadow = true;
    // pointLight.shadow.mapSize.width = 1024;
    // pointLight.shadow.mapSize.height = 1024;
    // this.scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(-10, 0, 10);
    directionalLight.castShadow = true;

    this.scene.add(directionalLight);
  }

  addSatellites() {
    // diameter: 3454,
    // oblateness: 0.0012,
    // axial_tilt: 6.687,
    // rotation_period: 655.704
    const moon = new Body({
      diameter: 0.2,
      axialTilt: 6.687,
      rotationPeriod: 1000,
      // maps,
    });

    const satellite = new Satellite({
      body: moon,
      orbitalRadius: 2,
      inclination: 5.145,
    });

    this.scene.add( satellite );
    this[_satellites].push(satellite);
  }

  async componentDidMount() {
    console.log('PlanetModel.componentDidMount: props %o', this.props);

    await this.loadMaps();

    this.camera = this.configureCamera();
    this.renderer = this.configureRenderer();

    this.addLighting();
    this.addBody();
    this.addSatellites();

    this.controls = this.configureControls();
    this.renderScene();
  }

  configureCamera() {
    const camera = new THREE.PerspectiveCamera(
      70,                         // field of view
      this.dims.x / this.dims.y,  // aspect ratio
      0.1,                        // near clipping pane
      100                         // far clipping pane
    );

    // Reposition the camera
    camera.position.set(0, 0.5, 5);

    // Point the camera at a given coordinate
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    return camera;
  }

  configureControls() {
    // Add an orbit control which allows us to move around the scene.
    const controls = new OrbitControls(this.camera, this.canvasRef.current );

    controls.target = new THREE.Vector3(0, 0, 0);
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 1;
    controls.maxDistance = 100;

    // add this only if there is no animation loop (requestAnimationFrame)
    // controls.addEventListener('change', () => this.renderScene());

    return controls;
  }

  configureRenderer() {
    const canvas = this.canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

    // match the size of the canvas
    renderer.setSize(this.dims.x, this.dims.y);

    // Set a near white clear color (default is black)
    // renderer.setClearColor( 0xfff6e6 );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    return renderer;
  }

  async loadMaps() {
    const path = '/images';
    const { texture } =  this.props;
    const toLoad = [];
    let promise;

    // console.log('loadMaps() texture: %o', texture);
    for (const [textureType, texturePath] of Object.entries(texture)) {
      // console.log(`${textureType} -> ${texturePath}`);
      if (texturePath && !textureType.endsWith('id')) {
        promise = util.loadTexture(`${path}/${texturePath}`)
          .then((map) => {
            const key = (textureType !== 'map') ? `${textureType}Map` : textureType;
            console.log(`adding this.${key} = %o`, map);
            this.maps[key] = map;
          });

        toLoad.push(promise);
      }
    }

    await Promise.all(toLoad);
    console.log('this.maps = %o', this.maps)
  }

  render() {
    return (
      <canvas width="{this.dims.x}" height="{this.dims.y}" id="myCanvas" ref={this.canvasRef}></canvas>
    );
  }

  renderScene() {
    const render = () => {
      this.controls.update();

      // Update animated elements
      this[_body].updatePosition();
      this[_satellites].forEach(sat => sat.updatePosition());

      // Render the scene/camera combnation
      this.renderer.render(this.scene, this.camera);

      // Repeat
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }
};
