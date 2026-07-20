import _defaults from 'lodash/defaults';
import _identity from 'lodash/identity';

import React from 'react';
import GUI from 'lil-gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
// const loader = new STLLoader();console.log(loader);

import windowResize from '../three/lib/window-resize';


export default class ThreeModel extends React.Component {

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
    };
  }


  componentDidMount() {
    console.log('ThreeModel.componentDidMount: props %o', this.props);

    const camera = this.getCamera(this.props.cameraParams);
    this.something.camera = this.cameraConfigurator(camera);

    const renderer = this.getRenderer(this.props.rendererParams);
    this.something.renderer = this.rendererConfigurator(renderer);

    this.windowResize = windowResize(this.something.renderer, this.something.camera);

    const controls = this.getControls({ camera: this.something.camera });
    this.something.controls = this.controlsConfigurator(controls);

    // Capture the initial (page-load) camera framing so "Reset view" can return
    // to it. This is the preferred default angle, set up against the solar-
    // system ecliptic (the ECLIPJ2000 world frame).
    this.initialView = {
      position: this.something.camera.position.clone(),
      up: this.something.camera.up.clone(),
      target: this.something.controls.target.clone(),
    };

    // simply creating the instance creates an overlay so must make
    // it conditional.
    if (this.props.guiConfigurator) {
      const gui = this.getGUI(this.props.guiParams);
      this.something.gui = this.props.guiConfigurator(gui);
      gui.add({ reset: this.resetView }, 'reset').name('Reset view');
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
    this.something.gui && this.something.gui.destroy();

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

  // Restore the initial page-load framing — the preferred default angle for
  // every body, set against the solar-system ecliptic.
  resetView = () => {
    const { camera, controls } = this.something;
    if (!camera || !controls || !this.initialView) return;

    camera.position.copy(this.initialView.position);
    camera.up.copy(this.initialView.up);
    controls.target.copy(this.initialView.target);
    camera.lookAt(this.initialView.target);
    controls.update();
  };

  getControls({ camera }) {
    // Add an orbit control which allows us to move around the scene.
    const controls = new OrbitControls(camera, this.canvasRef.current );

    controls.target = new THREE.Vector3(0, 0, 0);
    controls.maxPolarAngle =  Math.PI;
    controls.minDistance = 1;
    // Bodies are scaled to ~5 units, so 999 was a needlessly huge dolly range
    // that made each scroll feel tiny. Tighten the range and speed up zoom.
    controls.maxDistance = 100;
    controls.zoomSpeed = 4;

    return controls;
  }

  getGUI(options = {}) {
    const opts = _defaults({ name: 'Astro Playground' }, options);

    // https://lil-gui.georgealways.com/
    const gui = new GUI(options);

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
