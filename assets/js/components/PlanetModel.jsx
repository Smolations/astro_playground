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


const _axesHelper = Symbol('axesHelper');
const _bodies = Symbol('bodies');
const _body = Symbol('body');
const _orbitals = Symbol('orbitals');


export default class PlanetModel extends React.Component {

  constructor(props) {
    super(props);

    const SCREEN_WIDTH = window.innerWidth;
    const SCREEN_HEIGHT = window.innerHeight;
    const dims = { x: SCREEN_WIDTH, y: SCREEN_HEIGHT };

    // tell camera that axes orientation rotates 90deg away from eyes.
    // this more closely matches the rectangular reference frame
    // in astrodynamics. often set on the camera instance itself.
    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

    this.canvasRef = React.createRef();
    this.dims = dims;
    this.maps = {};

    const orbiting = props.orbiting || [];

    const bodyRadii = [
      props.specs.polar_radius,
      ...orbiting.map(orbit => orbit.orbiting_body.polar_radius),
    ].sort(util.numSort);
    console.log('bodyRadii = %o', bodyRadii);

    const prMin = bodyRadii[0];
    const prMax = bodyRadii[bodyRadii.length - 1];
    const prMinMaxScalar = prMin / prMax;
    const brMin = 0.2;
    const brMax = 50;

    this.bodyType = props.specs.type;
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
      equatorialRadius: { scale: bodyScaleFn },
      polarRadius: { scale: bodyScaleFn },
      volumetricMeanRadius: { scale: bodyScaleFn },
    };

    const orbitScaleFn = (x) => {
      // console.log('orbit.scale(%o)', x);
      // return bodyQuantScale(x) / (props.specs.type == 'star' ? 250 : 4); // works for earth/moon
      return bodyQuantScale(x) / (props.specs.type == 'star' ? 25 : 1); // works for mars/phobos/deimos
    }

    this.orbitSpecOpts = {
      semiMajorAxis: { scale: orbitScaleFn },
      periapsis: { scale: orbitScaleFn },
      apoapsis: { scale: orbitScaleFn },
    };

    this[_orbitals] = [];
    this[_bodies] = [];

    this.scene = new THREE.Scene();
    this.scene2 = new THREE.Scene();
  }


  async componentDidMount() {
    console.log('PlanetModel.componentDidMount: props %o', this.props);
    this.maps = await this.loadMaps(this.props.specs.texture);

    this.camera = this.configureCamera();
    this.cameraStartPos = this.camera.position.clone();console.log('cameraStartPos: %o', this.cameraStartPos);
    this.renderer = this.configureRenderer();
    this.windowResize = windowResize(this.renderer, this.camera);

    this[_axesHelper] = this.getAxesHelper();
    this[_body] = this.getBody(); console.log(this[_body].toString());
    this[_bodies].push(this[_body]);

    await this.addOrbitals();

    if (this.bodyType === 'star') {
      this.scene2.add( this[_axesHelper] );
      this.scene2.add( this[_body] );
      this.scene2.add( this.getStarAmbientLight() );
      this.scene.add( this.getStarPointLight() );
    } else {
      this.scene.add( this[_axesHelper] );
      this.scene.add( this[_body] );
      this.scene.add( this.getVernalEquinoxDirectionalLight() );
    }

    this.controls = this.configureControls();
    this.params = this.configureGUI();
    this.renderScene();
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
      console.log(orbital.toString());

      this.scene.add( orbital );

      this[_orbitals].push(orbital);
      this[_bodies].push(orbitingBody);
    });
  }

  configureCamera() {
    const camera = new THREE.PerspectiveCamera(
      70,                         // field of view
      this.dims.x / this.dims.y,  // aspect ratio
      0.1,                        // near clipping pane
      10000                       // far clipping pane
    );

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
      animate: true,
      timeScale: 10,
      lookAt: 0,
    };

    const bodies = this[_bodies].reduce((opts, body, ndx) => {
      opts[body.name] = ndx;
      return opts;
    }, {});


    gui.add( params, 'animate' ).name('Animate?');
    // gui.add( params, 'timeScale' ).min(1).max(20).step(1).name('Time Scale x');
    gui.add( params, 'lookAt', bodies ).name('Look at:');

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

  getAxesHelper() {
    // x-axis: red, y-axis: green, z-axis: blue
    return new THREE.AxesHelper( this.bodyScale.max * 2 );
  }

  getBody() {
    const { specs } = this.props;
    const { maps } = this;

    const body = new Body({
      maps,
      specOpts: this.bodyGroupSpecOpts,
      ...specs,
    });

    return body;
  }

  getMaxOrbitalDistance() {
    return this[_orbitals].reduce((max, orbit) => {
      const a = orbit.specs.semiMajorAxis; console.log('a: %o', a);
      return max < a ? a : max;
    }, 0);
  }

  getStarAmbientLight() {
    // light the star evenly
    return new THREE.AmbientLight( 0xffffff );
  }

  getStarPointLight() {
    const pointLight = new THREE.PointLight( 0xffffff, 1.2, Infinity );

    // initial far clipping pane for the light's shadow is 500, but some
    // objects are thousands of units away
    const maxDistance = this.getMaxOrbitalDistance() || 500;
    const lightShadowCam = new THREE.PerspectiveCamera( 90, 1, 0.5, maxDistance + this.bodyScale.max );

    pointLight.shadow = new THREE.LightShadow( lightShadowCam );

    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;

    return pointLight;
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

  render() {
    return (
      <canvas width="{this.dims.x}" height="{this.dims.y}" id="myCanvas" ref={this.canvasRef}></canvas>
    );
  }

  renderScene() {
    const clock = new THREE.Clock();

    const render = () => {
      if (!this.params.animate) {
        this.controls.update();

      } else {
        const t = clock.getElapsedTime();

        const lookAt = this.params.lookAt;
        const targetBody = this[_bodies][lookAt];
        const targetCamPos = this.camera.position;
        let targetBodyPos;

        if (lookAt === 0) {
          targetBodyPos = this[_body].position.clone();

        } else {
          targetBodyPos = new THREE.Vector3();
          // console.log('targetBodyPos: %o', targetBodyPos);

          targetBody.getWorldPosition(targetBodyPos);
          // console.log('(targetBodyPos): %o', targetBodyPos);
        }

        this.camera.position.set( targetCamPos.x, targetCamPos.y, targetCamPos.z );
        this.camera.lookAt( targetBodyPos );

        this.controls.target = targetBodyPos;

        // Update animated elements
        this[_body].updatePosition(t);
        this[_orbitals].forEach(orbit => orbit.updatePosition(t / this.params.timeScale));
      }


      // Render the scene/camera combination
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.renderer.render(this.scene2, this.camera);

      // Repeat
      requestAnimationFrame(render);
    };

    this.renderer.autoClear = false;

    requestAnimationFrame(render);
  }
};
