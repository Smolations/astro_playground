import * as THREE from 'three';
import AstroGroup from '../lib/astro-group';
import Specs from '../lib/specs';

const _polarAxis = Symbol('polarAxis');
const _satellites = Symbol('satellites');
const _sphere = Symbol('sphere');
const _specs = Symbol('specs');


export default class Body extends AstroGroup {
  // gravitational constant
  get G() { return this.specs.mu / this.specs.mass; }

  constructor({ maps = {}, groupScalars = [], ...rawSpecs }) {
    const specs = new Specs(rawSpecs, {
      groupScalars,
      mass: { units: 'kg', scalar: 1e+24 },
      volume: { units: 'km^3', scalar: 1e+10 },
      meanDensity: { units: 'kg/m^3' },
      equatorialRadius: { units: 'km' },
      polarRadius: { units: 'km' },
      volumetricMeanRadius: { units: 'km' },
      axialTilt: { units: '\u00B0' },
      obliquityToOrbit: { units: '\u00B0' },
      siderealRotationPeriod: { units: 'hrs' },
      mu: { units: 'km^3/s^2', scalar: 1e+6, desc: 'standard gravitational parameter (mu = G*M)' },
    });

    super({ specs });

    this[_polarAxis] = this.getPolarAxis(this.specs.polarRadius);
    this[_sphere] = this.getSphere(this.specs.polarRadius, maps);

    this.add(this[_sphere]);
    this.add(this[_polarAxis]);

    // rotate so north pole is up, then apply the axial tilt
    this.rotation.x = Math.PI / 2 + this.specs.toRad('obliquityToOrbit');
  }

  getPolarAxis(radius) {
    const material = new THREE.LineBasicMaterial();
    const geometry = new THREE.Geometry();
    const diameter = radius * 2;

    // maybe use values from a given sphere to make
    // sure axis goes through the center?
    geometry.vertices.push(
      new THREE.Vector3( 0, -1 * diameter, 0 ),
      new THREE.Vector3( 0, 1 * diameter, 0 )
    );

    return new THREE.Line( geometry, material );
  }

  getSphere(radius, maps) {
    const geometry = new THREE.SphereGeometry( radius, 128, 128 );
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
    const rotationPeriod = this.specs.siderealRotationPeriod;
    const sign = rotationPeriod == 0 ? 1 : rotationPeriod / Math.abs(rotationPeriod);

    // coincides with sphere's original orientation where y is up
    this[_sphere].rotation.y += sign * 0.001;
  }
};
