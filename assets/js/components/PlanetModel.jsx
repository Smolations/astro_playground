import React from 'react';
import * as THREE from 'three';


/*
  To actually be able to display anything with three.js, we need three
  things: scene, camera and renderer, so that we can render the scene
  with camera.
*/

export default class PlanetModel extends React.Component {
  constructor(props) {
    super(props);

    const dims = { x: 600, y: 600 };

    this.canvasRef = React.createRef();
    this.dims = dims;

    /*
      a group or stage containing all the objects we want to render. Scenes
      allow you to set up what and where is going to be rendered by Three.js.
      This is where you place objects, lights, and cameras.
    */
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,               // field of view
      dims.x / dims.y,  // aspect ratio
      0.1,              // near clipping pane
      1000              // far clipping pane
    );
  }

  componentDidMount() {
    // const canvas = document.getElementById('myCanvas');
    const camera = this.camera;
    const canvas = this.canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const scene = this.scene;

    renderer.setSize(this.dims.x, this.dims.y);

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );

    scene.add( cube );

    camera.position.z = 5;

    function animate() {
      requestAnimationFrame( animate );

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render( scene, camera );
    }

    animate();
  }

  render() {
    return (
      <canvas width="{this.dims.x}" height="{this.dims.y}" id="myCanvas" ref={this.canvasRef}></canvas>
    );
  }
};
