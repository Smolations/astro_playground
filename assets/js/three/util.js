import * as THREE from 'three';


const util = {
  /**
   *  Gravitational constant.
   *  (6.67408 × 10^-11 m^3 kg^-1 s^-2)
   *  (6.67408 × 10^-20 km^3 kg^-1 s^-2)
   *
   *  @type float
   */
  get G() { return 6.67408e-20; }

  /**
   *  Helper function to add random noise to geometry vertixes
   *
   *  @param geometry The geometry to alter
   *  @param noiseX   Amount of noise on the X axis
   *  @param noiseY   Amount of noise on the Y axis
   *  @param noiseZ   Amount of noise on the Z axis
   *  @returns the geometry object
   */
  addNoise(geometry, noiseX, noiseY, noiseZ) {
    noiseX = noiseX || 2;
    noiseY = noiseY || noiseX;
    noiseZ = noiseZ || noiseY;

    // loop through each vertex in the geometry and move it randomly
    for (let i = 0; i < geometry.vertices.length; i++) {
      let v = geometry.vertices[i];
      v.x += -noiseX / 2 + Math.random() * noiseX;
      v.y += -noiseY / 2 + Math.random() * noiseY;
      v.z += -noiseZ / 2 + Math.random() * noiseZ;
    }

    return geometry;
  },

  /**
   *  Helper function to add random noise to geometry vertixes
   *
   *  @param shapes The shapes to alter
   *  @param noiseX Amount of noise on the X axis
   *  @param noiseY Amount of noise on the Y axis
   *  @returns the shapes array
   */
  addShapeNoise(shapes, noiseX, noiseY) {
    noiseX = noiseX || 2;
    noiseY = noiseY || noiseX;

    for (let i = 0; i < shapes.length; i++) {
      let v = shapes[i];
      v.x += -noiseX / 2 + Math.random() * noiseX;
      v.y += -noiseY / 2 + Math.random() * noiseY;
      shapes[i] = v;
    }

    return shapes;
  },

  loadTexture(url, onProgress = () => {}) {
    const loader = new THREE.TextureLoader();
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, onProgress, reject);
    });
  },

  // simple number sorting because floats/non-floats won't sort
  // correctly without the explicit </> comparison
  numSort(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
};


export default util;
