import * as THREE from 'three';

// A soft round dot texture, shared across all locators.
let _dotTexture = null;
function dotTexture() {
  if (_dotTexture) return _dotTexture;
  const s = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = s;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.85)');
  g.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  _dotTexture = new THREE.CanvasTexture(canvas);
  return _dotTexture;
}

// A locator marks a body with a constant-pixel-size dot so it's findable even
// when the body is sub-pixel at true scale. It fades out once the body itself
// is clearly visible on screen (so up close you see the real sphere, not a dot).
export default class Locator {
  constructor({ color = 0xffffff, size = 11, worldRadius = 0 } = {}) {
    this.worldRadius = worldRadius; // true rendered radius in scene units

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));

    this.material = new THREE.PointsMaterial({
      map: dotTexture(),
      color,
      size, // pixels (sizeAttenuation off -> constant on screen)
      sizeAttenuation: false,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 999; // always on top
  }

  get object3d() {
    return this.points;
  }

  // Place the dot at `position` and fade it by the body's apparent on-screen
  // radius: full when the body is a speck, gone once it's clearly resolved.
  update(position, camera, viewportHeight) {
    this.points.position.copy(position);

    if (this.worldRadius > 0 && camera && viewportHeight) {
      const dist = camera.position.distanceTo(position);
      const fovRad = (camera.fov * Math.PI) / 180;
      const px = (this.worldRadius / dist) * (viewportHeight / (2 * Math.tan(fovRad / 2)));
      const LOW = 3;
      const HIGH = 16;
      this.material.opacity = Math.max(0, Math.min(1, (HIGH - px) / (HIGH - LOW)));
    }
  }
}
