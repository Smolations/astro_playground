import * as THREE from 'three';


export default class Leaf extends THREE.Group {
  constructor() {
    super();

    const leaf = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 1.6, 3, 4),
      new THREE.MeshStandardMaterial({
        color: 0x0b8450,
        flatShading: true,
        metalness: 0,
        roughness: 0.8,
        refractionRatio: 0.25,
      })
    );

    leaf.rotateX(Math.random() * Math.PI * 2);
    leaf.rotateZ(Math.random() * Math.PI * 2);
    leaf.rotateY(Math.random() * Math.PI * 2);

    leaf.receiveShadow = true;
    leaf.castShadow = true;

    this.add(leaf);
  }
};
