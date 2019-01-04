import _defaults from 'lodash/defaults';
import _identity from 'lodash/identity';
import React from 'react';
import * as dat from 'dat.gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls';
// import { STLLoader } from 'three/examples/js/loaders/STLLoader';
// const loader = new STLLoader();console.log(loader);

import util from '../three/util';
import Specs from '../three/lib/specs';
import Spheroid from '../three/models/spheroid';
import QuantScale from '../three/lib/quant-scale';
import windowResize from '../three/lib/window-resize';

const _axesHelper = Symbol('axesHelper');


export default class SpiceObjectModel extends React.Component {

  constructor(props) {
    super(props);

    const SCREEN_WIDTH = window.innerWidth;
    const SCREEN_HEIGHT = window.innerHeight;

    // tell camera that axes orientation rotates 90deg away from eyes.
    // this more closely matches the rectangular reference frame
    // in astrodynamics. often set on the camera instance itself.
    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

    this.canvasRef = React.createRef();
    this.dims = { x: SCREEN_WIDTH, y: SCREEN_HEIGHT };

    this.cameraConfigurator = props.cameraConfigurator || _identity;
    this.rendererConfigurator = props.rendererConfigurator || _identity;
    this.controlsConfigurator = props.controlsConfigurator || _identity;
    this.guiConfigurator = props.guiConfigurator;
    this.preRender = props.preRender || _identity;

    this.something = {
      scene: new THREE.Scene(),
      camera: null,
      renderer: null,
      controls: null,
      gui: null,
      guiSettings: {},
    };
  }


  componentDidMount() {
    console.log('SpiceObjectModel.componentDidMount: props %o', this.props);

    const camera = this.getCamera(this.props.cameraParams);
    this.something.camera = this.cameraConfigurator(camera);

    const renderer = this.getRenderer(this.props.rendererParams);
    this.something.renderer = this.rendererConfigurator(renderer);

    this.windowResize = windowResize(this.something.renderer, this.something.camera);

    const controls = this.getControls({ camera: this.something.camera });
    this.something.controls = this.controlsConfigurator(controls);

    // simply creating the instance creates an overlay so must make
    // it conditional. here, the `guiParams` are params given to the
    // dat.GUI constructor while the `guiSettings` is the dictionary
    // object properties the GUI sections control.
    if (this.props.guiConfigurator) {
      const _gui = this.getGUI(this.props.guiParams);
      const { gui, settings } = this.props.guiConfigurator({
        gui: _gui,
        settings: this.something.guiSettings,
      });

      this.something.gui = gui;
      this.something.guiSettings = settings;
    }

    // this allows for other components to add their own stuff to the
    // scene, change camera, etc.
    this.preRender(this.something);

    this.renderScene();
  }

  componentWillUnmount() {
    // kill auto-resizing of canvas
    this.windowResize.stop();

    // kill gui
    this.something.gui.destroy();

    // stop requesting animation frame?
  }


  // getAxesHelper({ length = 2 } = {}) {
  //   // x-axis: red, y-axis: green, z-axis: blue
  //   return new THREE.AxesHelper( length );
  // }

  getCamera({
    fov = 70,
    nearClip = 0.1,
    farClip = 10000,
    camPos = [-5, -20, 3],
  } = {}) {
    const camera = new THREE.PerspectiveCamera(
      fov,                        // field of view
      this.dims.x / this.dims.y,  // aspect ratio
      nearClip,                   // near clipping pane
      farClip                     // far clipping pane
    );

    // Reposition the camera at an angle where axes markers would be
    // visible, and where sunlight is visible
    const [camX, camY, camZ] = camPos;

    camera.position.set(camX, camY, camZ);

    // Point the camera at the origin
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    return camera;
  }

  getControls({ camera }) {
    // Add an orbit control which allows us to move around the scene.
    const controls = new OrbitControls(camera, this.canvasRef.current );

    controls.target = new THREE.Vector3(0, 0, 0);
    controls.maxPolarAngle =  Math.PI;
    controls.minDistance = 1;
    controls.maxDistance = 999;

    return controls;
  }

  getGUI(options = {}) {
    const opts = _defaults({ name: 'Astro Playground' }, options);

    // https://github.com/dataarts/dat.gui/blob/master/API.md
    const gui = new dat.GUI(options);

    return gui;
  }

  getRenderer(options = {}) {
    const canvas = this.canvasRef.current;
    const opts = _defaults({ canvas, antialias: true }, options);

    const renderer = new THREE.WebGLRenderer(opts);

    // match the size of the canvas
    renderer.setSize(this.dims.x, this.dims.y);

    // Set a near white clear color (default is black)
    // renderer.setClearColor( 0xfff6e6 );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    return renderer;
  }

  render() {
    return (
      <canvas width="{this.dims.x}" height="{this.dims.y}" id="myCanvas" ref={this.canvasRef}></canvas>
    );
  }

  renderScene() {
    const render = this.props.renderScene
      ? () => this.props.renderScene(this.something)
      : () => {
          // Render the scene/camera combination
          this.something.renderer.render(this.something.scene, this.something.camera);

          // Repeat
          requestAnimationFrame(render);
        };

    requestAnimationFrame(render);
  }
};
