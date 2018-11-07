import * as THREE from 'three';

const _polarAxis = Symbol('polarAxis');
const _satellites = Symbol('satellites');
const _sphere = Symbol('sphere');
const _specs = Symbol('specs');
const _mu = Symbol('mu');


export default class Body extends THREE.Group {



  constructor({ diameter, mass, axialTilt = 0, rotationPeriod = 24, maps = {}, satellites = [] }) {
    super();

    this[_polarAxis] = this.getPolarAxis(diameter);
    this[_sphere] = this.getSphere(diameter, maps);
    this[_specs] = {
      diameter,
      mass,
      axialTilt,
      rotationPeriod,
    };

    // standard gravitational parameter (mu = G*M)
    this[_mu] =

    this.add(this[_sphere]);
    this.add(this[_polarAxis]);

    // this[_satellites] = satellites.map(this.addSatellite);

    // apply the axial tilt
    this.rotation.z = axialTilt * Math.PI / 180;
  }

  addSatellite({ body, orbitalRadius, inclination = 0, revolutionDuration = 24 }) {

  }

  getPolarAxis(diameter) {
    const material = new THREE.LineBasicMaterial();
    const geometry = new THREE.Geometry();

    geometry.vertices.push(
      new THREE.Vector3( 0, -1 * diameter, 0 ),
      new THREE.Vector3( 0, 1 * diameter, 0 )
    );

    return new THREE.Line( geometry, material );
  }

  getSphere(diameter, maps) {
    // use diameter here somehow...
    const geometry = new THREE.SphereGeometry( diameter / 2, 128, 128 );
    const matOpts = {
      color: 0xeeeeee,
      metalness: 0,
      roughness: 1,
    };

    if (maps.map) {
      matOpts.map = maps.map;
    }
    if (maps.displacementMap) {
      matOpts.displacementMap = maps.displacementMap;
      matOpts.displacementScale = 0.1;
    }
    if (maps.normalMap) {
      matOpts.normalMap = maps.normalMap;
      matOpts.normalScale = new THREE.Vector2(0.5, 0.5);
    }

    const material = new THREE.MeshStandardMaterial(matOpts);

    const sphere = new THREE.Mesh( geometry, material );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    return sphere;
  }

  updatePosition() {
    // how do we tie this to rotationPeriod?
    const { rotationPeriod } = this[_specs];
    const sign = rotationPeriod == 0 ? 1 : rotationPeriod / Math.abs(rotationPeriod);
    this[_sphere].rotation.y += sign * 0.001;
  }
};
