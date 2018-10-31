import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls';

import ChristmasTree from '../three/models/christmas-tree';
import Present from '../three/models/present';
import Star from '../three/models/star';


/*
  To actually be able to display anything with three.js, we need three
  things: scene, camera and renderer, so that we can render the scene
  with camera.
*/
export default class ChristmasModel extends React.Component {
  constructor(props) {
    super(props);

    const dims = { x: 800, y: 800 };

    this.canvasRef = React.createRef();
    this.dims = dims;

    /*
      a group or stage containing all the objects we want to render. Scenes
      allow you to set up what and where is going to be rendered by Three.js.
      This is where you place objects, lights, and cameras.
    */
    this.scene = new THREE.Scene();
  }

  addLighting() {
    // Add an ambient lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // Add a point light that will cast shadows
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(80, 160, 120);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;
    this.scene.add(pointLight);
  }

  addPlane() {
    // A basic material that shows the geometry wireframe.
    const shadowMaterial = new THREE.ShadowMaterial({ color: 0x000000 });
    shadowMaterial.opacity = 0.5;

    const groundMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1000, 0.1, 1000),
      shadowMaterial
    );

    groundMesh.receiveShadow = true;

    this.scene.add(groundMesh);
  }

  addTree() {
    const tree = new ChristmasTree();
    this.tree = tree;
    this.scene.add(tree);
  }

  addStar() {
    const star = new Star();
    star.position.y += 200;
    this.star = star;
    this.scene.add(star);
  }

  addPresents() {
    // Loop around the tree, adding presents every 20 to 40 degrees.
    for (let angle = 0; angle < 360; angle += Math.random() * 20 + 20) {
      const p = new Present();
      const radius = Math.random() * 40 + 50;
      p.position.x =  Math.cos(angle * Math.PI / 180) * radius;
      p.position.z =  Math.sin(angle * Math.PI / 180) * radius;
      p.scale.set(Math.random() + 1, Math.random() + 1, Math.random() + 1);
      this.scene.add(p);
    }
  }

  componentDidMount() {
    this.camera = this.configureCamera();
    this.renderer = this.configureRenderer();

    this.addPlane();
    this.addLighting();
    this.addTree();
    this.addStar();
    this.addPresents();

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

    // Reposition the camera
    camera.position.set(-60, 80, 210);

    // Point the camera at a given coordinate
    camera.lookAt(new THREE.Vector3(0, 80, 0));

    return camera;
  }

  configureControls() {
    // Add an orbit control which allows us to move around the scene.
    const controls = new OrbitControls(this.camera, this.canvasRef.current );
    controls.target = new THREE.Vector3(0, 80, 0);
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 100;
    controls.maxDistance = 220;

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
    renderer.setClearColor( 0xfff6e6 );

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
    const render = () => {
      this.controls.update();

      // Update animated elements
      this.tree.updatePosition();
      this.star.updatePosition();

      // Render the scene/camera combnation
      this.renderer.render(this.scene, this.camera);

      // Repeat
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }
};
