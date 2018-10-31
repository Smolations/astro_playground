import * as THREE from 'three';
import util from '../util';


export default class Present extends THREE.Group {
  constructor() {
    super();

    // A random color assignment
    const colors = ['#ff0051', '#a53c6c', '#f19fa0', '#72bdbf', '#47689b'];
    const boxColor = colors.splice(Math.floor(Math.random() * colors.length), 1)[0];

    colors.push('#393839');

    const ribbonColor = colors.splice(Math.floor(Math.random() * colors.length), 1)[0];
    const ribbonMaterial = new THREE.MeshStandardMaterial( {
      color: ribbonColor,
      flatShading: true,
      metalness: 0,
      roughness: 1,
    });

    this.addBox(boxColor)

    this.addRibbonBoxX(ribbonMaterial);
    this.addRibbonBoxY(ribbonMaterial);

    this.addBowLoop(ribbonMaterial);
    this.addBowLoop(ribbonMaterial, -1);

    this.scale.set(2, 2, 2);
  }

  addBowLoop(material, coefficient = 1) {
    const bow = new THREE.Mesh(
      util.addNoise(new THREE.TorusGeometry(2, 1, 4, 4), 0.5),
      material
    );

    bow.position.x += coefficient * 2;
    bow.position.y += 14;
    bow.rotateZ(coefficient * Math.PI / 1.5);

    bow.castShadow = true;
    bow.receiveShadow = true;

    this.add(bow);
  }

  addBox(color) {
    const boxMaterial = new THREE.MeshStandardMaterial({
      color,
      flatShading: true,
      metalness: 0,
      roughness: 1,
    });

    const box = new THREE.Mesh(
      util.addNoise(new THREE.BoxGeometry(20, 12, 15), 2,1, 2),
      boxMaterial
    );

    box.position.y += 6;
    box.castShadow = true;
    box.receiveShadow = true;

    this.add(box);
  }

  addRibbonBoxX(material) {
    const box = new THREE.Mesh(
      util.addNoise(new THREE.BoxGeometry(22, 14, 2), 0.5),
      material
    );

    box.position.y += 6;
    box.castShadow = true;
    box.receiveShadow = true;

    this.add(box);
  }

  addRibbonBoxY(material) {
    const box = new THREE.Mesh(
      util.addNoise(new THREE.BoxGeometry(2, 14, 17), 0.5),
      material
    );

    box.position.y += 6;
    box.castShadow = true;
    box.receiveShadow = true;

    this.add(box);
  }
};
