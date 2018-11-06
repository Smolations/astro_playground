import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls';
// import { STLLoader } from 'three/examples/js/loaders/STLLoader';
// const loader = new STLLoader();console.log(loader);

import util from '../three/util';


/*
  To actually be able to display anything with three.js, we need three
  things: scene, camera and renderer, so that we can render the scene
  with camera.
*/

export default class PlanetModel extends React.Component {
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

  addBody() {
    const { specs } = this.props;
    const geometry = new THREE.SphereGeometry( 1, 128, 128 );
    const material = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      map: this.maps.textureMap,
      displacementMap: this.maps.displacementMap,
      displacementScale: 0.1,
      normalMap: this.maps.normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      metalness: 0,
      roughness: 1,
    });

    const sphere = new THREE.Mesh( geometry, material );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const axialTiltDeg = 25.19;

    const sphereWrap = new THREE.Group();
    sphereWrap.add(sphere);

    sphereWrap.rotation.z = specs.axial_tilt * Math.PI / 180;

    this.sphere = sphere;
    this.scene.add( sphereWrap );
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

  async componentDidMount() {
    await this.loadMaps();

    console.log('PlanetModel: props %o', this.props);

    this.camera = this.configureCamera();
    this.renderer = this.configureRenderer();

    this.addLighting();
    this.addBody();

    this.controls = this.configureControls();
    this.renderScene();
    // mix phx.gen.schema Bodies.
  }

  configureCamera() {
    const camera = new THREE.PerspectiveCamera(
      70,                         // field of view
      this.dims.x / this.dims.y,  // aspect ratio
      0.1,                        // near clipping pane
      100                         // far clipping pane
    );

    // Reposition the camera
    camera.position.set(0, 0, 5);

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
    // const loader = new THREE.TextureLoader();
    const [textureMap, displacementMap, normalMap] = await Promise.all([
      util.loadTexture('/images/mars_8k_color.jpg'),
      util.loadTexture('/images/mars_2k_displacement.jpg'),
      util.loadTexture('/images/mars_2k_normal.jpg'),
    ]);

    this.maps = { textureMap, displacementMap, normalMap };
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
      // this.tree.updatePosition();
      // this.star.updatePosition();
      // sphere.rotation.x += 0.01;
      this.sphere.rotation.y += 0.001;

      // Render the scene/camera combnation
      this.renderer.render(this.scene, this.camera);

      // Repeat
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }
};
