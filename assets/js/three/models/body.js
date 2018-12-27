import * as THREE from 'three';
import _defaultsDeep from 'lodash/defaultsDeep';

import AstroGroup from '../lib/astro-group';
import Specs from '../lib/specs';

const _glowSphere = Symbol('glowSphere');
const _polarAxis = Symbol('polarAxis');
const _satellites = Symbol('satellites');
const _sphere = Symbol('sphere');
const _specs = Symbol('specs');


export default class Body extends AstroGroup {
  // gravitational constant
  // (6.67408 × 10^-11 m^3 kg^-1 s^-2)
  // (6.67408 × 10^-20 km^3 kg^-1 s^-2)
  get G() { return 6.67408e-20; }

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
    const defaultSpecOpts = {
      mass: { units: 'kg' },
      volume: { units: 'e+10 km^3' },
      meanDensity: { units: 'kg/m^3' },
      equatorialRadius: { units: 'km' },
      polarRadius: { units: 'km' },
      volumetricMeanRadius: { units: 'km' },
      axialTilt: { units: '\u00B0' },
      obliquityToOrbit: { units: '\u00B0' },
      siderealRotationPeriod: { units: 'hrs' },
      mu: { units: 'km^3/s^2', desc: 'standard gravitational parameter (mu = G*M)' },
    };

    const polarRadius = rawSpecs.polar_radius;
    const equatorialRadius = rawSpecs.equatorial_radius;

    const volume = (4/3) * Math.PI * Math.pow(polarRadius, 2) * equatorialRadius;
    const density = rawSpecs.mass / volume;

    const specs = new Specs(rawSpecs, _defaultsDeep({}, specOpts, defaultSpecOpts));

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
    const isStar = this.specs.type === 'star';
    const geometry = new THREE.SphereBufferGeometry( radius, 64, 64 );
    const matOpts = {
      color: 0xffffff,
      metalness: 0.1,
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
      matOpts.normalScale = new THREE.Vector2( 0.5, 0.5 );
    }

    const material = new THREE.MeshStandardMaterial( matOpts );
    const sphere = new THREE.Mesh( geometry, material );

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
    // how do we tie this to rotationPeriod?
    const rotationPeriod = this.specs.siderealRotationPeriod;
    const sign = rotationPeriod == 0 ? 1 : rotationPeriod / Math.abs(rotationPeriod);

    // coincides with sphere's original orientation where y is up
    this[_sphere].rotation.y += sign * 0.001;
  }
};
