import * as THREE from 'three';

const _body = Symbol('body');
const _orbit = Symbol('orbit');


export default class Satellite extends THREE.Group {
  constructor({ body, orbitalRadius, inclination = 0, revolutionDuration = 24 }) {
    super();

    const orbitRing = this.getOrbitRing(orbitalRadius);
    const satelliteOrbit = new THREE.Group();

    body.position.x = orbitalRadius;

    satelliteOrbit.add( orbitRing );
    satelliteOrbit.add( body );

    this[_body] = body;
    this[_orbit] = satelliteOrbit;

    this.add(satelliteOrbit);

    // apply the inclination
    this.rotation.z = inclination * Math.PI / 180;
  }

  getOrbitRing(radius) {
    // EllipseCurve(
    //   aX : Float,            // The X center of the ellipse. Default is 0.
    //   aY : Float,            // The Y center of the ellipse. Default is 0.
    //   xRadius : Float,       // The radius of the ellipse in the x direction. Default is 1.
    //   yRadius : Float,       // The radius of the ellipse in the y direction. Default is 1.
    //   aStartAngle : Radians, // The start angle of the curve in radians starting from the middle right side. Default is 0.
    //   aEndAngle : Radians,   // The end angle of the curve in radians starting from the middle right side. Default is 2 x Math.PI.
    //   aClockwise : Boolean,  // Whether the ellipse is drawn clockwise. Default is false.
    //   aRotation : Radians    // The rotation angle of the ellipse in radians, counterclockwise from the positive X axis (optional). Default is 0.
    // )
    const curve = new THREE.EllipseCurve(
      0,  0,            // ax, aY
      radius, radius,           // xRadius, yRadius
      0,  2 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
    );

    const points = curve.getPoints( 128 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    const material = new THREE.LineBasicMaterial( { color : 0xffffff } );

    // Create the final object to add to the scene
    const ellipse = new THREE.Line( geometry, material );
    ellipse.rotation.x = Math.PI / 2;

    // const geometry = new THREE.RingGeometry(radius - 0.01, radius, 128);
    // const material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
    // const ring = new THREE.Mesh( geometry, material );

    // ring.rotation.x = Math.PI / 2;

    return ellipse;
    return ring;
  }

  getSphere(diameter, maps) {
    // use diameter here somehow...
    const geometry = new THREE.SphereGeometry( 1, 128, 128 );
    const material = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      map: maps.map,
      displacementMap: maps.displacementMap,
      displacementScale: 0.1,
      normalMap: maps.normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      metalness: 0,
      roughness: 1,
    });

    const sphere = new THREE.Mesh( geometry, material );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    return sphere;
  }

  updatePosition() {
    // how do we tie this to revolutionDuration?
    this[_body].updatePosition();
    this[_orbit].rotation.y += 0.001;
    // this[_sphere].rotation.y += 0.001;
  }
};
