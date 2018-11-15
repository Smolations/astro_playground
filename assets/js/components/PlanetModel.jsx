import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls';
// import { STLLoader } from 'three/examples/js/loaders/STLLoader';
// const loader = new STLLoader();console.log(loader);

import util from '../three/util';
import Body from '../three/models/body';
import Orbit from '../three/models/orbit';
import Specs from '../three/lib/specs';


const _body = Symbol('body');
const _orbitals = Symbol('orbitals');


export default class PlanetModel extends React.Component {
  constructor(props) {
    super(props);

    const dims = { x: 1127, y: 1127 };

    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

    this.canvasRef = React.createRef();
    this.dims = dims;
    this.maps = {};
    this.bodyGroupScalar = {
      scalar: 1,
      keys: [
        'mass',
        'volume',
        'equatorialRadius',
        'polarRadius',
        'volumetricMeanRadius',
      ],
    };
    this.orbitGroupScalar = {
      scalar: 1,
      keys: [
        'semiMajorAxis',
        'periapsis',
        'apoapsis',
      ],
    };

    this[_orbitals] = [];

    this.scene = new THREE.Scene();
  }

  addBody() {
    const { specs } = this.props;
    const { maps } = this;

    const body = new Body({
      groupScalars: [this.bodyGroupScalar],
      maps,
      ...specs,
    });
    console.log(body.toString());

    this[_body] = body;
    this.scene.add( body );
  }

  addLighting() {
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );

    // enforces initial vernal equinox position
    directionalLight.position.set(-10, 0, 0);
    directionalLight.castShadow = true;

    this.scene.add(directionalLight);
  }

  async addOrbitals() {
    const orbits = this.props.orbiting;
    const maps = {};

    const promises = orbits.map((orbit, ndx) => {
      return this.loadMaps(orbit.orbiting_body.texture)
        .then(map => maps[ndx] = map);
    });

    await Promise.all(promises);

    orbits.forEach((orbit, ndx) => {
      const { central_body, orbiting_body, ...rawSpecs } = orbit;

      const orbitingBody = new Body({
        groupScalars: [this.bodyGroupScalar],
        maps: maps[ndx],
        ...orbiting_body,
      });

      const orbital = new Orbit({
        groupScalars: [this.orbitGroupScalar],
        centralBody: this[_body],
        orbitingBody,
        ...rawSpecs,
      });

      console.log(orbital);
      console.log(orbital.toString());

      this.scene.add( orbital );

      this[_orbitals].push(orbital);
    });
  }

  async componentDidMount() {
    console.log('PlanetModel.componentDidMount: props %o', this.props);
    this.bodyGroupScalar.scalar = 1 / this.props.specs.polar_radius;
    this.orbitGroupScalar.scalar = this.bodyGroupScalar.scalar/4;

    this.maps = await this.loadMaps(this.props.specs.texture);

    this.camera = this.configureCamera();
    this.renderer = this.configureRenderer();

    this.drawAxes();
    this.addLighting();
    this.addBody();
    this.addOrbitals();

    this.controls = this.configureControls();
    this.renderScene();
  }

  configureCamera() {
    const camera = new THREE.PerspectiveCamera(
      70,                         // field of view
      this.dims.x / this.dims.y,  // aspect ratio
      0.1,                        // near clipping pane
      1000                        // far clipping pane
    );

    // Reposition the camera at an angle where axes markers would be
    // visible, and where sunlight is visible
    camera.position.set(-5, -10, 5);

    // tell camera that axes orientation rotates 90deg away from eyes.
    // this more closely matches the rectangular reference frame
    // in astrodynamics.
    // camera.up = new THREE.Vector3(0, 0, 1);

    // Point the camera at a given coordinate
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    return camera;
  }

  configureControls() {
    // Add an orbit control which allows us to move around the scene.
    const controls = new OrbitControls(this.camera, this.canvasRef.current );

    controls.target = new THREE.Vector3(0, 0, 0);
    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 1;
    controls.maxDistance = 999;

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

  drawAxes() {
    // x-axis: red, y-axis: green, z-axis: blue
    const axesHelper = new THREE.AxesHelper( 5 );
    this.scene.add( axesHelper );
  }

  async loadMaps(texture) {
    const path = '/images';
    const toLoad = [];
    const maps = {};
    let promise;

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

    console.log('maps = %o', maps);
    return await Promise.all(toLoad)
      .then(() => maps);
  }

  render() {
    return (
      <canvas width="{this.dims.x}" height="{this.dims.y}" id="myCanvas" ref={this.canvasRef}></canvas>
    );
  }

  renderScene() {
    const clock = new THREE.Clock();

    const render = () => {
      const t = clock.getElapsedTime();

      this.controls.update();

      // Update animated elements
      this[_body].updatePosition(t);
      this[_orbitals].forEach(orbit => orbit.updatePosition(t * 5));

      // Render the scene/camera combnation
      this.renderer.render(this.scene, this.camera);

      // Repeat
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }
};
