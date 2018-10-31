import * as THREE from 'three';
import util from '../util';


export default class Star extends THREE.Group {
  constructor() {
    super();

    const starShape = new THREE.Shape([
      new THREE.Vector2(0, 50),
      new THREE.Vector2(10, 10),
      new THREE.Vector2(40, 10),
      new THREE.Vector2(20, -10),
      new THREE.Vector2(30, -50),
      new THREE.Vector2(0, -20),
      new THREE.Vector2(-30, -50),
      new THREE.Vector2(-20, -10),
      new THREE.Vector2(-40, 10),
      new THREE.Vector2(-10, 10),
    ]);

    const geometry = new THREE.ExtrudeGeometry(starShape, {
      steps: 1,
      depth: 4,
      curveSegments: 1,
      bevelEnabled: true,
      bevelThickness: 10,
      bevelSize: 10,
      bevelSegments: 1,
    });

    util.addNoise(geometry, 0, 0, 2);

    const star = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color: 0xffd423,
      flatShading: true,
      metalness: 0,
      roughness: 0.8,
      refractionRatio: 0.25,
      emissive: 0xffd423,
      emissiveIntensity: 0.4,
    }));

    star.scale.set(0.3, 0.3, 0.3);
    this.add(star);

    const pointLight = new THREE.DirectionalLight(0xffd423, 0.4);
    pointLight.position.set( 0, 10, 0);

    this.add(pointLight);
  }

  updatePosition() {
    this.rotateY(0.005);
  }
};
