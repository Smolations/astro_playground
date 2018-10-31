import * as THREE from 'three';

import util from '../util';
import Leaf from './leaf';
import Ornament from './ornament';
import Star from './star';


export default class ChristmasTree extends THREE.Group {
  constructor() {
    super();

    this.addPot();
    this.addTrunk();
    this.grow();
    this.addOrnaments();
  }

  addOrnaments() {
    const ornamentPositions = [
      [-35, 55, 17, -0.1, 0],
      [35, 59, 17, -0.1, 0],
      [-5, 74, 17, -0.2, 0.2],
      [18, 123, 18, -0.2, 0.3],
      [43, 100, 15, -0.2, 0.3],
      [-12, 133, 1, 0, 0],
      [-35, 65, -17, 0.1, -0],
      [25, 67, -17, 0.1, -0],
      [-5, 74, -17, 0.2, -0.2],
      [10, 143, -18, 0.2, 0.3],
      [50, 85, -15, 0.2, 0.3],
    ];

    this.ornaments = [];

    for (let d = 0; d < ornamentPositions.length; d++) {
      const ornament = new Ornament();
      ornament.position.set(ornamentPositions[d][0], ornamentPositions[d][1], ornamentPositions[d][2]);
      ornament.rotateX(ornamentPositions[d][3]);
      ornament.rotateZ(ornamentPositions[d][4]);

      this.add(ornament);
      this.ornaments.push(ornament);
    }
  }

  addPot() {
    // A material for the pot
    const potMaterial = new THREE.MeshStandardMaterial( {
      color: 0xf97514,
      flatShading: true,
      metalness: 0,
      roughness: 0.8,
      refractionRatio: 0.25
    });

    // The pot
    const pot = new THREE.Mesh(
      util.addNoise(new THREE.CylinderGeometry(30, 25, 35, 8, 2), 2),
      potMaterial
    );

    pot.position.y += 17.5;
    pot.castShadow = true;
    pot.receiveShadow = true;

    this.add(pot);

    const potRim = new THREE.Mesh(
      util.addNoise(new THREE.CylinderGeometry(38, 35, 10, 8, 1), 2),
      potMaterial
    );

    potRim.position.y += 35;
    potRim.castShadow = true;
    potRim.receiveShadow = true;

    this.add(potRim);
  }

  addTrunk() {
    // A tree trunk
    const trunk = new THREE.Mesh(
      util.addNoise(new THREE.CylinderGeometry(12, 18, 30, 8, 3),2),
      new THREE.MeshStandardMaterial({
        color: 0x713918,
        flatShading: true,
        metalness: 0,
        roughness: 0.8,
        refractionRatio: 0.25,
      })
    );

    trunk.position.y += 45;
    trunk.castShadow = true;
    trunk.receiveShadow = true;

    this.add(trunk);
  }

  getLogoGeometry() {
    // A shape...
    const logo = new THREE.Shape();

    logo.moveTo(3.43, 96.86);
    logo.bezierCurveTo(2.01, 96.86, 1.38, 95.87, 2.04, 94.63);
    logo.lineTo (9.07, 83.43);
    logo.bezierCurveTo(9.72, 82.2, 11.42, 81.2, 12.84, 81.2);
    logo.lineTo (67.94, 81.2);
    logo.bezierCurveTo(69.37, 81.2 , 70, 80.2, 69.34, 78.97);
    logo.lineTo (41.58, 24.87);
    logo.bezierCurveTo(40.92, 23.64, 40.92, 21.65, 41.58, 20.41);
    logo.lineTo (49.44, 5.66);
    logo.bezierCurveTo(49.44+0.65, 5.66-1.23, 49.44+1.72, 5.66-1.23, 51.82, 5.66);
    logo.lineTo (99.22,94.63);
    logo.bezierCurveTo(99.22+0.65, 94.63+1.23, 99.22+0.02, 94.63+2.23, 97.82, 96.86);

    const extrudeSettings = {
      steps: 1,
      depth: 16,
      curveSegments: 1,
      bevelEnabled: true,
      bevelThickness: 5,
      bevelSize: 5,
      bevelSegments: 1,
    };

    const logoGeometry = new THREE.ExtrudeGeometry(logo, extrudeSettings);

    return util.addNoise(logoGeometry, 2, 2, 0.5);
  }

  grow() {
    const treeGroup = new THREE.Group();
    const logoGeometry = this.getLogoGeometry();
    const mesh = new THREE.Mesh(logoGeometry, new THREE.MeshStandardMaterial( {
      color: 0x15a46b,
      flatShading: true,
      metalness: 0,
      roughness: 0.8,
      refractionRatio: 0.25,
    }));

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    treeGroup.add(mesh);

    for (let x = 0; x < logoGeometry.vertices.length; x++) {
      const leaf = new Leaf();
      leaf.position.copy(logoGeometry.vertices[x]);
      treeGroup.add(leaf);
    }

    treeGroup.position.y += 180;
    treeGroup.position.x -= 60;
    treeGroup.position.z += 10;
    treeGroup.rotateZ(Math.PI);
    treeGroup.rotateY(Math.PI);
    treeGroup.scale.set(1.2,1.2,1.2);

    this.add(treeGroup);
  }

  updatePosition() {
    this.ornaments.forEach(ornament => ornament.updatePosition());
  }
};
