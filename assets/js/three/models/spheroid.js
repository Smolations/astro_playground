import * as THREE from 'three';
import _defaultsDeep from 'lodash/defaultsDeep';

import AstroGroup from '../lib/astro-group';
import Specs from '../lib/specs';
import util from '../util';

const _glowSphere = Symbol('glowSphere');
const _polarAxis = Symbol('polarAxis');
const _spheroid = Symbol('spheroid');
const _specs = Symbol('specs');


export default class Spheroid extends AstroGroup {
  get glowVertexShader() {
    return `
      uniform vec3 viewVector;
      uniform float c;
      uniform float p;
      varying float intensity;
      void main()
      {
        vec3 vNormal = normalize( normalMatrix * normal );
        vec3 vNormel = normalize( normalMatrix * viewVector );
        intensity = pow( c - dot(vNormal, vNormel), p );

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `;
  }

  // aka pixel shader
  get glowFragmentShader() {
    return `
      uniform vec3 glowColor;
      varying float intensity;
      void main()
      {
        vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, 1.0 );
      }
    `;
  }

  constructor({ maps = {}, specOpts = {}, ...rawSpecs }) {
    // maybe worth computing within python script?
    const mass = rawSpecs.mu / util.G;

    const polarRadius = rawSpecs.polar_radius;
    const equatorialRadius = rawSpecs.equatorial_radius_large;

    const volume = (4/3) * Math.PI * Math.pow(polarRadius, 2) * equatorialRadius;
    const density = mass / volume;

    Object.assign(rawSpecs, {
      mass,
      volume,
      density,
    });

    const defaultSpecOpts = {
      mass: { units: 'kg' },
      volume: { units: 'e+10 km^3' },
      density: { units: 'kg/m^3' },
      equatorialRadiusLarge: { units: 'km' },
      equatorialRadiusSmall: { units: 'km' },
      polarRadius: { units: 'km' },
      // volumetricMeanRadius: { units: 'km' },
      // axialTilt: { units: '\u00B0' },
      obliquityToOrbit: { units: '\u00B0' },
      // siderealRotationPeriod: { units: 'hrs' },
      mu: { units: 'km^3/s^2', desc: 'standard gravitational parameter (mu = G*M)' },
    };

    const specs = new Specs(rawSpecs, _defaultsDeep({}, specOpts, defaultSpecOpts));

    super({ specs });
    console.log(this.specs)

    this[_polarAxis] = this.getPolarAxis(this.specs.polarRadius);
    this[_spheroid] = this.getSpheroid(
      this.specs.equatorialRadiusLarge,
      this.specs.polarRadius,
      this.specs.equatorialRadiusSmall,
      maps
    );

    this.add(this[_spheroid]);
    this.add(this[_polarAxis]);

    // Real axial tilt is applied by the caller, which aligns this group's local
    // +Y (the sphere's pole and the polar-axis line) to the body's true pole
    // vector. `spinSign` carries the prograde(+)/retrograde(-) sense from SPICE.
    // Default: pole up, prograde.
    this.spinSign = 1;
  }

  getPolarAxis(radius) {
    const material = new THREE.LineBasicMaterial();
    const diameter = radius * 2;

    // maybe use values from a given sphere to make
    // sure axis goes through the center?
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3( 0, -1 * diameter, 0 ),
      new THREE.Vector3( 0, 1 * diameter, 0 ),
    ]);

    return new THREE.Line( geometry, material );
  }

  getSpheroid(xRadius, yRadius, zRadius, maps) {
    const isStar = this.specs.type === 'star';

    // this is the "vertical" or polar radius. since planets bulge
    // at the equator, we will modify those scales later
    const geometry = new THREE.SphereGeometry( yRadius, 64, 64 );

    const matOpts = {
      color: 0xffffff,
      metalness: 0.1,
      roughness: 1,
    };

    // use this to make the "triaxial ellipsoid"
    // remember that we end up rotating so treat y-axis as polar axis
    const xScale = xRadius / yRadius;
    const yScale = yRadius / yRadius; // yea, yea...i know  =]
    const zScale = zRadius / yRadius;
    geometry.applyMatrix4( new THREE.Matrix4().makeScale( xScale, yScale, zScale ) );

    if (maps.map) {
      matOpts.map = maps.map;
    }
    if (maps.displacementMap) {
      matOpts.displacementMap = maps.displacementMap;
      matOpts.displacementScale = 0.1;
    }
    if (maps.normalMap) {
      matOpts.normalMap = maps.normalMap;
      matOpts.normalScale = new THREE.Vector2( 0.5, 0.5 );
    }

    const material = new THREE.MeshStandardMaterial( matOpts );
    const sphere = new THREE.Mesh( geometry, material );

    // maybe create accessors for these?
    sphere.castShadow = !isStar;
    sphere.receiveShadow = !isStar;

    return sphere;
  }

  // http://stemkoski.github.io/Three.js/Shader-Glow.html
  getGlowSphere(originalSphere) {
    // create custom material from the shader code above
    //   that is within specially labeled script tags
    const customMaterial = new THREE.ShaderMaterial({
      uniforms: {
        "c": { type: "f", value: 0.2 },
        "p": { type: "f", value: 1.9 },
        glowColor: { type: "c", value: new THREE.Color( 0xffff00 ) },
        // viewVector: { type: "v3", value: camera.position },
        viewVector: { type: "v3", value: new THREE.Vector3( -5, -6, 3 ) },
      },
      vertexShader:   this.glowVertexShader,
      fragmentShader: this.glowFragmentShader,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const glowSphere = new THREE.Mesh( originalSphere.geometry.clone(), customMaterial.clone() );

    glowSphere.position.copy( originalSphere.position );
    glowSphere.scale.multiplyScalar(1.2);

    return glowSphere;
  }

  updatePosition() {
    // Spin about the body's own axis (local +Y, aligned by the caller to the
    // real pole). spinSign carries the prograde/retrograde sense from SPICE.
    this[_spheroid].rotation.y += this.spinSign * 0.01;
  }
};
