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

const _r0Vec = Symbol('r0Vec');
const _rVec = Symbol('rVec');
const _v0Vec = Symbol('v0Vec');
const _vVec = Symbol('vVec');
const _rootMu = Symbol('rootMu');



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
  get rootMu() { return this[_rootMu]; }

  // position vector
  get rVec() { return this[_rVec]; }
  // velocity vector
  get vVec() { return this[_vVec]; }

  // initial position vector
  get r0Vec() { return this[_r0Vec]; }
  // initial velocity vector
  get v0Vec() { return this[_v0Vec]; }


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

    // set up constants (order matters)
    this[_gravitationalParam] = 1; // this.μ
    this[_rootMu] = Math.sqrt( this.μ );
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

    // store references for animation, etc.
    this[_orbitGroup] = new THREE.Group();
    this[_centralBody] = centralBody;
    this[_orbitingBody] = orbitingBody;

    // get stuffs added to group
    this.drawOrbit();
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
  // for elliptical orbits, works as a good first guess for newton iteration.
  x(t) { return ( this.rootMu * t ) / this.a; }

  // newton iteration scheme to get accurate value of x
  // note: this was the final piece of the puzzle to get
  // the orbit to match the drawn ellipse!
  xNewton(t) {
    let x = this.x(t);
    let tn, dtdxn, xn;

    do {
      tn = this.tn(x);
      dtdxn = this.dtdxn(x);
      xn = x + ( t - tn ) / dtdxn;
      x = xn;
    } while ( Math.abs( t - tn ) > 1e-6 );

    return xn;
  }

  // nth value of t, given x
  tn(x) {
    const r0 = this.r0Vec.length();
    const term1 = ( this.r0Vec.dot( this.v0Vec ) / this.rootMu ) * Math.pow(x, 2) * this.C(x);
    const term2 = ( 1 - r0 / this.a ) * Math.pow(x, 3) * this.S(x);
    const term3 = r0 * x;

    return ( term1 + term2 + term3 ) / this.rootMu;
  }

  // nth dt/dx term, given x
  dtdxn(x) {
    const r0 = this.r0Vec.length();
    const z = this.z(x);
    const term1 = Math.pow(x, 2) * this.C(x);
    const term2 = ( this.r0Vec.dot( this.v0Vec ) / this.rootMu ) * x * ( 1 - z * this.S(x) );
    const term3 = r0 * ( 1 - z * this.C(x) );

    return ( term1 + term2 + term3 ) / this.rootMu;
  }

  z(x) { return Math.pow(x, 2) / this.a; }

  f(x) {
    const r0 = this.r0Vec.length();
    return 1 - ( Math.pow(x, 2) / r0 ) * this.C(x);
  }

  g(x, t) {
    return t - ( Math.pow(x, 3) / this.rootMu ) * this.S(x);
  }

  fPrime(x, r) {
    const r0 = this.r0Vec.length();
    const z = this.z(x);
    return ( this.rootMu / ( r0 * r ) ) * x * ( z * this.S(x) - 1 );
  }

  gPrime(x, r) {
    return 1 - ( Math.pow(x, 2) / r ) * this.C(x);
  }

  C(x) {
    const z = this.z(x);
    return ( 1 - Math.cos( Math.sqrt(z) ) ) / z;
  }

  S(x) {
    const z = this.z(x);
    const rootZ = Math.sqrt(z);
    return ( rootZ - Math.sin(rootZ) ) / Math.sqrt( Math.pow(z, 3) );
  }

  // algorithm for solution to the kepler problem
  // (aka universal variable foumulation)
  //
  // the advantages of this method over other methods are that only one
  // set of equations works for all conic orbits and accuracy and
  // convergence for nearly parabolic orbits is better.
  solveKeplers(t) {
    // 1) from r0Vec, v0Vec, determine r0 and a
    // these are used within other functions used below

    // 2) given t-t0 (usually t0 is assumed to be zero), solve the universal
    // time of flight equation for x using a Newton iteration scheme
    // const x = this.x(t);
    const x = this.xNewton(t);

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
    const r = this.rVec.length();
    const fPrime = this.fPrime(x, r);
    const gPrime = this.gPrime(x, r);
    const vVec = new THREE.Vector3();

    vVec.addScaledVector( this.r0Vec, fPrime );
    vVec.addScaledVector( this.v0Vec, gPrime );

    this.vVec.copy(vVec);
  }

  updatePosition(t) {
    const orbitingBody = this[_orbitingBody];

    this.solveKeplers(t);

    orbitingBody.position.copy(this.rVec);

    orbitingBody.updatePosition(t);
  }

  toString() {
    const str = [
      `BODIES:         ${this[_orbitingBody].specs.name} orbiting ${this[_centralBody].specs.name}`,
      super.toString(),
    ];
    return str.join("\n");
  }
};
