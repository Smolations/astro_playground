import * as THREE from 'three';


const util = {
  /**
   *  Gravitational constant.
   *  (6.67408 × 10^-11 m^3 kg^-1 s^-2)
   *  (6.67408 × 10^-20 km^3 kg^-1 s^-2)
   *
   *  @type float
   */
  get G() { return 6.67408e-20; },

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
