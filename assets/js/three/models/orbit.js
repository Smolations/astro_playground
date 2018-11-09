import * as THREE from 'three';
import _camelCase from 'lodash/camelCase';

import AstroGroup from '../lib/astro-group';
import Specs from '../lib/specs';

const _centralBody = Symbol('centralBody');
const _orbitingBody = Symbol('orbitingBody');
const _sphere = Symbol('sphere');
const _specs = Symbol('specs');
const _mu = Symbol('mu');
const _g = Symbol('g');


export default class Orbit extends AstroGroup {

  get a() { return this.specs.semiMajorAxis; }
  get b() { return Math.sqrt(Math.pow(this.a, 2) - Math.pow(this.c, 2)); }

  get c() { return this.a * this.e; }
  get d() {
    const e2 = Math.pow(this.e, 2);
    return this.c * ( 1 - e2 ) / e2;
  }

  get e() { return this.specs.eccentricity; }

  // distance from center to point on ellipse
  r(theta) { return ( this.e * this.d ) / ( 1 - this.e * Math.cos(theta) ); }

  x(t) {}

  y(t) {}

  move(theta) {
    const quaternion = new THREE.Quaternion();
    const geometry = this[_orbitingBody];

    for (let i = 0; i < geometry.vertices.length; i++) {
      // a single vertex Y position
      const yPos = geometry.vertices[i].y;
      const upVec = new THREE.Vector3(0, 1, 0);

      quaternion.setFromAxisAngle(
        upVec,
        (Math.PI / 180) * (yPos / twistAmount)
      );

      geometry.vertices[i].applyQuaternion(quaternion);
    }

    // tells Three.js to re-render this mesh
    geometry.verticesNeedUpdate = true;
  }

  constructor({ centralBody, orbitingBody, groupScalars = [], ...rawSpecs }) {
    const specs = new Specs(rawSpecs, {
      groupScalars,
      semiMajorAxis: { units: 'km', scalar: 1e+6 },
      siderealPeriod: { units: 'days' },
      periapsis: { units: 'km', scalar: 1e+6 },
      apoapsis: { units: 'km', scalar: 1e+6 },
      minVelocity: { units: 'km/s' },
      maxVelocity: { units: 'km/s' },
      inclination: { units: '\u00B0' },
      eccentricity: { required: true },
    });

    super({ specs });

    this[_centralBody] = centralBody;
    this[_orbitingBody] = orbitingBody;

    this.drawOrbit();
    this.addOrbitingBody();

    this.rotation.z = this.specs.toRad('inclination');
  }

  addOrbitingBody() {
    const centralBodyPos = this[_centralBody].position;
    const orbitingBody = this[_orbitingBody];

    orbitingBody.userData.theta = 0;
    // orbitingBody.position.add( centralBodyPos );

    console.log(`r(0) = ${this.r(0)}`);
    // console.log(orbitingBody.toString());

    this.add(orbitingBody);
  }

  drawOrbit() {
    const curve = new THREE.EllipseCurve(
      this.c,  0,       // ax, aY
      this.a, this.b,   // xRadius, yRadius
      0,  2 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
    );

    const points = curve.getPoints( 360 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const material = new THREE.LineBasicMaterial( { color : 0xffffff } );

    const ellipse = new THREE.Line( geometry, material );

    ellipse.rotation.x = Math.PI / 2;

    this.add( ellipse );
  }

  updatePosition() {
    const orbitingBody = this[_orbitingBody];
    const rotationPeriod = this.specs.siderealPeriod;
    const sign = rotationPeriod == 0 ? 1 : rotationPeriod / Math.abs(rotationPeriod);

    // how do we tie this to rotationPeriod?

    let theta = orbitingBody.userData.theta + 2 * Math.PI / 1000;

    if (theta >= 2*Math.PI) {
      theta -= 2*Math.PI;
    }

    let r = this.r(theta);

    // targets z-axis because we rotated the ellipsis from the xy plane
    // to the xz plane.
    orbitingBody.position.set( r * Math.cos(theta), 0, r * Math.sin(theta) );

    orbitingBody.userData.theta = theta;
    orbitingBody.updatePosition();
  }

  toString() {
    const str = [
      `BODIES:         ${this[_orbitingBody].specs.name} orbiting ${this[_centralBody].specs.name}`,
      super.toString(),
      `a:              ${this.a}`,
      `b:              ${this.b}`,
      `c:              ${this.c}`,
      `d:              ${this.d}`,
      `e:              ${this.e}`,
    ];
    return str.join("\n");
  }
};
