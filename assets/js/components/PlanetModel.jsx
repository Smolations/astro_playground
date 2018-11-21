import React from 'react';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls';
// import { STLLoader } from 'three/examples/js/loaders/STLLoader';
// const loader = new STLLoader();console.log(loader);

import util from '../three/util';
import Body from '../three/models/body';
import Orbit from '../three/models/orbit';
import Specs from '../three/lib/specs';
import QuantScale from '../three/lib/quant-scale';
import windowResize from '../three/lib/window-resize';


const _body = Symbol('body');
const _orbitals = Symbol('orbitals');


export default class PlanetModel extends React.Component {
  numSort(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  constructor(props) {
    super(props);

    const SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    // const dims = { x: 1127, y: 1127 };
    const dims = { x: SCREEN_WIDTH, y: SCREEN_HEIGHT };

    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

    this.canvasRef = React.createRef();
    this.dims = dims;
    this.maps = {};

    const orbiting = props.orbiting || [];

    const bodyRadii = [
      props.specs.polar_radius,
      ...orbiting.map(orbit => orbit.orbiting_body.polar_radius),
    ].sort(this.numSort);
    console.log('bodyRadii = %o', bodyRadii);

    const prMin = bodyRadii[0];
    const prMax = bodyRadii[bodyRadii.length - 1];
    const prMinMaxScalar = prMin / prMax;
    const brMin = 0.2;
    const brMax = props.specs.type == 'star' ? 5 : 3;

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
      equatorialRadius: { scale: bodyScaleFn },
      polarRadius: { scale: bodyScaleFn },
      volumetricMeanRadius: { scale: bodyScaleFn },
    };

    const orbitScaleFn = (x) => {
      console.log('orbit.scale(%o)', x);
      // return bodyQuantScale(x) / (props.specs.type == 'star' ? 250 : 4); // works for earth/moon
      return bodyQuantScale(x) / (props.specs.type == 'star' ? 250 : 1); // works for mars/phobos/deimos
    }

    this.orbitSpecOpts = {
      semiMajorAxis: { scale: orbitScaleFn },
      periapsis: { scale: orbitScaleFn },
      apoapsis: { scale: orbitScaleFn },
    };

    this[_orbitals] = [];

    this.scene = new THREE.Scene();
  }


  async componentDidMount() {
    console.log('PlanetModel.componentDidMount: props %o', this.props);
    this.maps = await this.loadMaps(this.props.specs.texture);

    this.camera = this.configureCamera();
    this.renderer = this.configureRenderer();
    this.params = this.configureGUI();
    this.windowResize = windowResize(this.renderer, this.camera);

    this.drawAxes();
    this.addLighting();
    this.addBody();
    this.addOrbitals();

    this.controls = this.configureControls();
    this.renderScene();
  }

  addBody() {
    const { specs } = this.props;
    const { maps } = this;

    const body = new Body({
      maps,
      specOpts: this.bodyGroupSpecOpts,
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

    // const [aMin, aMax] = orbits.reduce((pair, orbit) => {
    //   if (orbit.semiMajorAxis < pair[0])
    // }, [Infinity, -Infinity]);

    const promises = orbits.map((orbit, ndx) => {
      return this.loadMaps(orbit.orbiting_body.texture)
        .then(map => maps[ndx] = map);
    });

    await Promise.all(promises);

    // new QuantScale({
    //   domain: [1738, props.specs.polar_radius],
    //   range: [0.25, 2],
    // });

    orbits.forEach((orbit, ndx) => {
      const { central_body, orbiting_body, ...rawSpecs } = orbit;

      const orbitingBody = new Body({
        specOpts: this.bodyGroupSpecOpts,
        maps: maps[ndx],
        ...orbiting_body,
      });

      const orbital = new Orbit({
        orbitingBody,
        centralBody: this[_body],
        specOpts: this.orbitSpecOpts,
        ...rawSpecs,
      });

      console.log(orbitingBody.toString());
      // console.log(orbital);
      console.log(orbital.toString());

      this.scene.add( orbital );

      this[_orbitals].push(orbital);
    });
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

  configureGUI() {
    const gui = window.gui = new dat.GUI({
      name: 'Astro Playground',
    });
    // https://github.com/dataarts/dat.gui/blob/master/API.md
    // {
    //   a: 200, // numeric
    //   b: 200, // numeric slider
    //   c: "Hello, GUI!", // string
    //   d: false, // boolean (checkbox)
    //   e: "#ff8800", // color (hex)
    //   f: function() { alert("Hello!") },
    //   g: function() { alert( parameters.c ) },
    //   v : 0,    // dummy value, only type is important
    //   w: "...", // dummy value, only type is important
    //   x: 0, y: 0, z: 0
    // };
    const params = {
      timeScale: 10,
    };


    gui.add( params, 'timeScale' ).min(1).max(20).step(1).name('Time Scale x');

    gui.open();

    return params;
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
      this[_orbitals].forEach(orbit => orbit.updatePosition(t * this.params.timeScale));

      // Render the scene/camera combnation
      this.renderer.render(this.scene, this.camera);

      // Repeat
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }
};
