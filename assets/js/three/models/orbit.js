import * as THREE from 'three';
import _camelCase from 'lodash/camelCase';

import AstroGroup from '../lib/astro-group';
import JPL from '../lib/jpl';
import Specs from '../lib/specs';

const _centralBody = Symbol('centralBody');
const _orbitingBody = Symbol('orbitingBody');
const _sphere = Symbol('sphere');
const _specs = Symbol('specs');

const _ascendingNode = Symbol('ascendingNode');
const _eccentricity = Symbol('eccentricity');
const _focus = Symbol('focus');
const _gravitationalParam = Symbol('gravitationalParam');
const _inclination = Symbol('inclination');
const _semiLatusRectum = Symbol('semiLatusRectum');
const _semiMinorAxis = Symbol('semiMinorAxis');
const _semiMajorAxis = Symbol('semiMajorAxis');
const _specificAngularMomentum = Symbol('specificAngularMomentum');

const _hVec = Symbol('hVec');
const _nVec = Symbol('nVec');
const _rVec = Symbol('rVec');
const _vVec = Symbol('vVec');

const jpl = new JPL();


export default class Orbit extends AstroGroup {

  get a() { return this[_semiMajorAxis]; }
  get b() { return this[_semiMinorAxis]; }
  get c() { return this[_focus]; } // foci at (-c, 0) and (c, 0)
  get e() { return this[_eccentricity]; }
  get h() { return this[_specificAngularMomentum]; }
  get i() { return this[_inclination]; }
  get p() { return this[_semiLatusRectum]; }
  get μ() { return this[_gravitationalParam]; }
  get Ω() { return this[_ascendingNode]; }

  // position vector
  get rVec() { return this[_rVec]; }
  // velocity vector
  get vVec() { return this[_vVec]; }

  // node vector
  get nVec() { return this[_nVec].set( -this.hVec.y, this.hVec.x, 0 ); }

  // specific angular momentum vector
  get hVec() { return this[_hVec].crossVectors( this.rVec, this.vVec ); }

  // eccentricity vector
  get eVec() { return this[_eVec]; }

  // argument of periapsis
  // get ω() {}
  // specific mechanical energy
  // get ε() {}
  // time of periapsis passage
  // get T() {}
  // longitude of periapsis (instead of argument of periapsis)
  // get Π() { return this.Ω + this.ω; }


  rVecFromAngle(theta) {
    const rVec = new THREE.Vector3( Math.cos(theta), Math.sin(theta), 0 );
    return rVec.multiplyScalar( this.r(theta) );
  }

  vVecFromAngle(theta) {
    const vVec = new THREE.Vector3( -Math.sin(theta), this.e + Math.cos(theta), 0 );
    return vVec.multiplyScalar( Math.sqrt( this.μ / this.p ) );
  }

  // distance from center to point on ellipse
  r(theta) { return this.p / ( 1 + this.e * Math.cos(theta) ); }

  x(t) {}

  y(t) {}

  move() {
    const orbitingBody = this[_orbitingBody];

    let theta = orbitingBody.userData.theta + 2 * Math.PI / 1000;

    if (theta >= 2*Math.PI) {
      theta -= 2*Math.PI;
    }

    let r = this.r(theta);

    // targets z-axis because we rotated the ellipsis from the xy plane
    // to the xz plane.
    orbitingBody.position.set( r * Math.cos(theta), 0, r * Math.sin(theta) );

    orbitingBody.userData.theta = theta;
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
      ascendingNode: { units: '\u00B0' },
    });

    super({ specs });

    // initial setup requires minimal given information:
    // semi-major axis, eccentricity, and inclination

    // set up constants (order matters)
    this[_gravitationalParam] = 1; // this.μ
    this[_eccentricity] = this.specs.eccentricity; // this.e
    this[_inclination] = this.specs.toRad('inclination'); // this.i
    this[_ascendingNode] = this.specs.toRad('ascendingNode'); // this.Ω
    this[_semiMajorAxis] = this.specs.semiMajorAxis; // this.a
    this[_focus] = this.a * this.e; // this.c
    this[_semiLatusRectum] = this.a * ( 1 - Math.pow(this.e, 2) ); // this.p
    this[_semiMinorAxis] = Math.sqrt(Math.pow(this.a, 2) - Math.pow(this.c, 2)); // this.b
    this[_specificAngularMomentum] = Math.sqrt( this.p * this.μ ); // this.h

    // set up initial dynamic values
    this[_rVec] = new THREE.Vector3( this.r(0), 0, 0 );
    this[_vVec] = new THREE.Vector3( 0, 0, 0 ); // this needs attention
    this[_hVec] = new THREE.Vector3( 0, 0, 0 );

    // store references for animation, etc.
    this[_centralBody] = centralBody;
    this[_orbitingBody] = orbitingBody;

    // get stuffs added to group
    this.drawOrbit();
    this.addOrbitingBody();
  }

  addOrbitingBody() {
    const centralBodyPos = this[_centralBody].position;
    const orbitingBody = this[_orbitingBody];

    orbitingBody.userData.theta = 0;
    // orbitingBody.position.add( centralBodyPos );

    this.add(orbitingBody);
  }

  drawOrbit() {
    // we'll rotate the container
    const curve = new THREE.EllipseCurve(
      -this.c,  0,      // ax, aY
      this.a, this.b,   // xRadius, yRadius
      0,  2 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
    );

    const points = curve.getPoints( 360 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const material = new THREE.LineBasicMaterial( { color : 0xffffff } );

    const ellipse = new THREE.Line( geometry, material );
    ellipse.rotation.y = this.i;

    const fociPivot = new THREE.Group();
    fociPivot.add( ellipse );

    // enforce longitude of periapsis
    fociPivot.rotation.z = this.Ω;

    this.add( fociPivot );
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
    orbitingBody.position.set( r * Math.cos(theta), r * Math.sin(theta), 0 );

    orbitingBody.userData.theta = theta;
    orbitingBody.updatePosition();
  }

  getOrbit() {
    // Calculate the time t in centuries from J2000:
    // month is zero-indexed, so 0 is January
    var tMillisFromJ2000 = Date.now() - Date.UTC(2000, 0, 1, 12, 0, 0);
    var tCenturiesFromJ2000 = tMillisFromJ2000 / (1000*60*60*24*365.25*100);

    // Now we calculate the current values of each of the orbital
    // parameters. For example, the semimajor axis of Earth
    // a0 = 1.00000261; adot = 0.00000562
    var a = a0 + adot * tCenturiesFromJ2000;

    // L0 = 34.33479152; Ldot = 3034.90371757
    // b = -0.00012452
    // c =  0.06064060
    // s = -0.35635438
    // f = 38.35125000
    var L = L0 + Ldot * tCenturiesFromJ2000
               + b * Math.pow(tCenturiesFromJ2000, 2)
               + c * Math.cos(f * tCenturiesFromJ2000)
               + s * Math.sin(f * tCenturiesFromJ2000);

    var M = L - p // p is the longitude of periapsis
    var w = p - W // W is the longitude of the ascending node

    E = M;
    while(true) {
      var dE = (E - e * Math.sin(E) - M)/(1 - e * Math.cos(E));
      E -= dE;
      if( Math.abs(dE) < 1e-6 ) break;
    }

    var P = a * (Math.cos(E) - e);
    var Q = a * Math.sin(E) * Math.sqrt(1 - Math.pow(e, 2));

    // rotate by argument of periapsis
    var x = Math.cos(w) * P - Math.sin(w) * Q;
    var y = Math.sin(w) * P + Math.cos(w) * Q;
    // rotate by inclination
    var z = Math.sin(i) * x;
        x = Math.cos(i) * x;
    // rotate by longitude of ascending node
    var xtemp = x;
    x = Math.cos(W) * xtemp - Math.sin(W) * y;
    y = Math.sin(W) * xtemp + Math.cos(W) * y;
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
