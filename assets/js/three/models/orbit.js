import * as THREE from 'three';
import _camelCase from 'lodash/camelCase';

import AstroGroup from '../lib/astro-group';
import Specs from '../lib/specs';

const _centralBody = Symbol('centralBody');
const _orbitGroup = Symbol('orbitGroup');
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
const _r0Vec = Symbol('r0Vec');
const _rVec = Symbol('rVec');
const _v0Vec = Symbol('v0Vec');
const _vVec = Symbol('vVec');



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

  // initial position vector
  get r0Vec() { return this[_r0Vec]; }
  // initial velocity vector
  get v0Vec() { return this[_v0Vec]; }

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

  // distance from center of central body to point on ellipse
  r(theta) { return this.p / ( 1 + this.e * Math.cos(theta) ); }

  // this is not x in terms of the axis, this is a created variable
  // to assist in solving kepler's problem.
  // for elliptical orbits, works as a good first guess
  x(t) { return ( Math.sqrt(this.μ) * t ) / this.a; }

  z(x) { return Math.pow(x, 2) / this.a }

  f(x) {
    const r0 = this.r0Vec.x;
    const z = this.z(x);
    return 1 - ( Math.pow(x, 2) / r0 ) * this.C(z);
  }

  g(x, t) {
    const z = this.z(x);
    return t - ( Math.pow(x, 3) / Math.sqrt(this.μ) ) * this.S(z);
  }

  fPrime(x, r) {
    const r0 = this.r0Vec.x;
    const z = this.z(x);
    return ( Math.sqrt(this.μ) / ( r0 * r ) ) * x * ( z * this.S(z) - 1 );
  }

  gPrime(x, r) {
    const z = this.z(x);
    return 1 - ( Math.pow(x, 2) / r ) * this.C(z);
  }

  C(z) { return ( 1 - Math.cos( Math.sqrt(z) ) ) / z; }

  S(z) {
    const rootZ = Math.sqrt(z);
    return ( rootZ - Math.sin(rootZ) ) / Math.sqrt( Math.pow(z, 3) );
  }

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

  solveKeplers(t) {
    // 1) from r0Vec, v0Vec, determine r0 and a
    const a = this.a;
    const r0 = this.rVec.x;

    // 2) given t-t0 (usually t0 is assumed to be zero), solve the universal
    // time of flight equation for x using a Newton iteration scheme
    const x = this.x(t);

    // 3) Evaluate f and g from quations (4.4-31) and (4.4-34); then compute
    // rVec and r from equation (4.4-18).
    const f = this.f(x);
    const g = this.g(x, t);
    const rVec = new THREE.Vector3();

    rVec.addScaledVector( this.r0Vec, f );
    rVec.addScaledVector( this.v0Vec, g );

    this.rVec.copy(rVec);


    // 4) Evaluate fPrime and gPrime from equations (4.4-35) and (4.4-36);
    // then compute vVec from equation (4.4-19).
    const r = this.rVec.length;
    const fPrime = this.fPrime(x, r);
    const gPrime = this.gPrime(x, r);
    const vVec = new THREE.Vector3();

    vVec.addScaledVector( this.r0Vec, fPrime );
    vVec.addScaledVector( this.v0Vec, gPrime );

    this.vVec.copy(vVec);
  }

  constructor({ centralBody, orbitingBody, groupScalars = [], ...rawSpecs }) {
    const specs = new Specs(rawSpecs, {
      groupScalars,
      semiMajorAxis: { units: 'km' },
      siderealPeriod: { units: 'days' },
      periapsis: { units: 'km' },
      apoapsis: { units: 'km' },
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
    this[_r0Vec] = this.rVecFromAngle(0);
    this[_v0Vec] = this.vVecFromAngle(0);

    // set up initial dynamic values
    this[_rVec] = this.rVecFromAngle(0);
    this[_vVec] = this.vVecFromAngle(0);
    // this[_hVec] = new THREE.Vector3( 0, 0, 0 );

    // store references for animation, etc.
    this[_orbitGroup] = new THREE.Group();
    this[_centralBody] = centralBody;
    this[_orbitingBody] = orbitingBody;

    // get stuffs added to group
    this.drawOrbit();
    // this.addOrbitingBody();
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
    // ellipse.rotation.y = this.i;

    // now we can think of the orbit as a simple 2D plane
    this[_orbitGroup].add(ellipse);
    this[_orbitGroup].add(this[_orbitingBody]);
    this[_orbitGroup].rotation.y = this.i;

    const fociPivot = new THREE.Group();
    fociPivot.add( this[_orbitGroup] );

    // enforce longitude of periapsis
    fociPivot.rotation.z = this.Ω;

    this.add( fociPivot );
  }

  updatePosition(t) {
    const orbitingBody = this[_orbitingBody];
    // const clock = new THREE.Clock();
    // const rotationPeriod = this.specs.siderealPeriod;
    // const sign = rotationPeriod == 0 ? 1 : rotationPeriod / Math.abs(rotationPeriod);

    // how do we tie this to rotationPeriod?

    // let theta = orbitingBody.userData.theta + 2 * Math.PI / 1000;

    // if (theta >= 2*Math.PI) {
    //   theta -= 2*Math.PI;
    // }

    // let r = this.r(theta);

    // targets z-axis because we rotated the ellipsis from the xy plane
    // to the xz plane.
    // orbitingBody.position.set( r * Math.cos(theta), r * Math.sin(theta), 0 );

    this.solveKeplers(t);

    orbitingBody.position.copy(this.rVec);

    // orbitingBody.userData.theta = theta;
    orbitingBody.updatePosition(t);
  }

  // https://space.stackexchange.com/questions/8911/determining-orbital-position-at-a-future-point-in-time
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
    ];
    return str.join("\n");
  }
};
