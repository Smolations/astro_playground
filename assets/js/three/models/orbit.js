import * as THREE from 'three';

// A body's orbit, driven by real SPICE ephemeris samples rather than a
// propagated ellipse.
//
// Real orbits don't close (they precess), so instead of looping a fixed arc
// (which teleports at the seam) we play continuous real time: the owner streams
// contiguous sample windows via setBuffer(), and the orbit renders a *trail*
// that follows the body. Precession then shows up naturally as the trail drifts.
//
// The optional guide is the best-fit focus-at-origin ellipse of the current
// samples (a mu-free least-squares fit), i.e. the "ideal" ellipse the real path
// departs from — an honest depiction of perturbations, off by default.
export default class Orbit {
  constructor({ scale, color = 0x5588ff, guideColor = 0xff3399, trailSeconds } = {}) {
    this.scale = scale;
    this.buffer = null;         // contiguous [{et,x,y,z,...}]
    this._trail = [];           // rolling [{et, v:Vector3}]
    this._trailSpanEt = null;   // ~one period; set from the first buffer
    this._trailSecondsOverride = trailSeconds;
    this._trailColor = new THREE.Color(color);

    // Pre-allocate dynamic position + colour buffers and a draw range. three's
    // setFromPoints reuses an existing attribute and won't grow it, so a static
    // geometry would freeze at its first size; we manage the buffers ourselves.
    // Per-vertex colour lets the tail fade toward black (= into the black
    // background): LineBasicMaterial has no per-vertex alpha, but fading RGB
    // reads as translucent and lets the guide show through the faded tail.
    this._trailMax = 2000;
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(this._trailMax * 3), 3).setUsage(THREE.DynamicDrawUsage)
    );
    trailGeo.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(this._trailMax * 3), 3).setUsage(THREE.DynamicDrawUsage)
    );
    trailGeo.setDrawRange(0, 0);
    this.trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true }));
    this.trail.frustumCulled = false;

    this.guide = new THREE.LineLoop(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: guideColor, transparent: true, opacity: 0.7 })
    );
    this.guide.frustumCulled = false;
    this.guide.visible = false;
  }

  get object3ds() {
    return [this.guide, this.trail];
  }

  _vec(s) {
    return new THREE.Vector3(s.x, s.y, s.z).multiplyScalar(this.scale);
  }

  // Replace the sample buffer with a new contiguous window (for streaming, the
  // next window starts where the previous ended, so playback stays continuous).
  setBuffer(samples) {
    this.buffer = samples;
    if (this._trailSpanEt == null) this._trailSpanEt = this._estimatePeriodEt(samples);
    if (this.guide.visible) this.buildGuide();
  }

  bounds() {
    const b = this.buffer;
    return b && b.length ? { startEt: b[0].et, endEt: b[b.length - 1].et } : null;
  }

  get periodEt() {
    return this._trailSpanEt;
  }

  // Interpolated scene position at ephemeris time `et` (clamped to the buffer).
  // Catmull-Rom cubic through the 4 surrounding samples, so the path follows the
  // orbit's curve rather than straight chords between samples — otherwise modest
  // samples-per-period render as polygons (or a line, for the fastest moons).
  positionAtEt(et) {
    const b = this.buffer;
    if (!b || !b.length) return new THREE.Vector3();

    const first = b[0].et;
    const last = b[b.length - 1].et;
    const cl = Math.max(first, Math.min(last, et));
    const dt = (last - first) / (b.length - 1);
    const idx = dt > 0 ? (cl - first) / dt : 0;

    const i1 = Math.min(b.length - 1, Math.floor(idx));
    const f = idx - i1;
    const i0 = Math.max(0, i1 - 1);
    const i2 = Math.min(b.length - 1, i1 + 1);
    const i3 = Math.min(b.length - 1, i1 + 2);

    const cr = (a, p, q, r) =>
      0.5 *
      (2 * p + (-a + q) * f + (2 * a - 5 * p + 4 * q - r) * f * f + (-a + 3 * p - 3 * q + r) * f * f * f);

    const s0 = b[i0];
    const s1 = b[i1];
    const s2 = b[i2];
    const s3 = b[i3];
    return new THREE.Vector3(
      cr(s0.x, s1.x, s2.x, s3.x),
      cr(s0.y, s1.y, s2.y, s3.y),
      cr(s0.z, s1.z, s2.z, s3.z)
    ).multiplyScalar(this.scale);
  }

  // Extend the trail to the body's position at `et`, dropping points older than
  // ~one period so the trail always shows roughly the current orbit.
  updateTrail(et) {
    const t = this._trail;
    const last = t[t.length - 1];
    if (last && et <= last.et) return; // paused / no time advanced

    t.push({ et, v: this.positionAtEt(et) });

    const span = this._trailSecondsOverride != null ? this._trailSecondsOverride : this._trailSpanEt;
    const cutoff = et - span;
    while (t.length > 2 && t[0].et < cutoff) t.shift();
    while (t.length > this._trailMax) t.shift();

    const pos = this.trail.geometry.attributes.position;
    const col = this.trail.geometry.attributes.color;
    const n = t.length;
    const c = this._trailColor;

    // Fade by position along the trail (0 = oldest tail, 1 = head/body):
    //   >= SOLID_FROM : full colour
    //   FADE_TO..SOLID_FROM : ramp down toward black (reads as translucent)
    //   < FADE_TO : fully transparent, and skipped via drawRange so those
    //               always-invisible vertices aren't rendered at all.
    const FADE_TO = 0.15;
    const SOLID_FROM = 0.5;
    for (let i = 0; i < n; i++) {
      pos.setXYZ(i, t[i].v.x, t[i].v.y, t[i].v.z);
      const frac = n > 1 ? i / (n - 1) : 1;
      let a;
      if (frac >= SOLID_FROM) a = 1;
      else if (frac >= FADE_TO) a = (frac - FADE_TO) / (SOLID_FROM - FADE_TO);
      else a = 0;
      col.setXYZ(i, c.r * a, c.g * a, c.b * a);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;

    const start = Math.floor(n * FADE_TO);
    this.trail.geometry.setDrawRange(start, n - start);
  }

  set guideVisible(v) {
    this.guide.visible = v;
    if (v && this.buffer) this.buildGuide();
  }

  // Best-fit focus-at-origin ellipse of the current samples. In the orbital
  // plane, 1/r = A + B cos(theta) + C sin(theta) is LINEAR in (A,B,C), so a
  // plain least-squares solve recovers the conic without needing the mass (mu).
  buildGuide() {
    let b = this.buffer;
    if (!b || b.length < 6) return;

    // Fit over ~one revolution for a crisp single ellipse (fitting many
    // precessing revolutions would smear it).
    if (this._trailSpanEt) {
      const oneRev = b.filter((s) => s.et <= b[0].et + this._trailSpanEt);
      if (oneRev.length >= 6) b = oneRev;
    }

    const pts = b.map((s) => this._vec(s));

    // Orbital-plane normal from averaged r_i x r_{i+1} (angular-momentum sense).
    const n = new THREE.Vector3();
    for (let i = 0; i < pts.length - 1; i++) {
      n.add(new THREE.Vector3().crossVectors(pts[i], pts[i + 1]));
    }
    if (n.lengthSq() === 0) return;
    n.normalize();

    // In-plane orthonormal basis (u, w).
    const u = new THREE.Vector3(1, 0, 0);
    if (Math.abs(n.dot(u)) > 0.9) u.set(0, 1, 0);
    u.crossVectors(u, n).normalize();
    const w = new THREE.Vector3().crossVectors(n, u).normalize();

    // Normal equations for 1/r = A + B cos + C sin.
    let m00 = 0, m01 = 0, m02 = 0, m11 = 0, m12 = 0, m22 = 0, r0 = 0, r1 = 0, r2 = 0;
    for (const p of pts) {
      const x = p.dot(u);
      const y = p.dot(w);
      const r = Math.hypot(x, y);
      if (r < 1e-9) continue;
      const c = x / r;
      const s = y / r;
      const val = 1 / r;
      m00 += 1; m01 += c; m02 += s;
      m11 += c * c; m12 += c * s; m22 += s * s;
      r0 += val; r1 += c * val; r2 += s * val;
    }

    const sol = solve3(
      [m00, m01, m02, m01, m11, m12, m02, m12, m22],
      [r0, r1, r2]
    );
    if (!sol) return;
    const [A, B, C] = sol;

    const out = [];
    const N = 256;
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * Math.PI * 2;
      const denom = A + B * Math.cos(th) + C * Math.sin(th);
      if (denom <= 1e-9) continue; // skip the (hyperbolic) far branch if any
      const r = 1 / denom;
      out.push(
        u.clone().multiplyScalar(r * Math.cos(th)).add(w.clone().multiplyScalar(r * Math.sin(th)))
      );
    }
    this.guide.geometry.dispose();
    this.guide.geometry = new THREE.BufferGeometry().setFromPoints(out);
  }

  // Epoch span to one revolution: the closest return to the first sample's
  // position (requires the buffer to span more than one period).
  _estimatePeriodEt(b) {
    if (!b || b.length < 4) return 0;
    const p0 = new THREE.Vector3(b[0].x, b[0].y, b[0].z);
    const dist = (i) => p0.distanceTo(new THREE.Vector3(b[i].x, b[i].y, b[i].z));

    let maxD = 0;
    for (let i = 0; i < b.length; i++) maxD = Math.max(maxD, dist(i));

    // First return = the first local MINIMUM of distance-to-start after the body
    // has departed (past half the max distance). Robust to sampling density: a
    // fixed distance threshold is never satisfied by a fast, coarsely-sampled
    // moon (its nearest sample to the start is still far), so the period
    // defaulted to the whole buffer and the trail became many overlapping loops
    // with no visible fade.
    let departed = false;
    for (let i = 2; i < b.length - 1; i++) {
      const d = dist(i);
      if (d > 0.5 * maxD) departed = true;
      if (departed && d <= dist(i - 1) && d < dist(i + 1)) {
        // parabolic sub-sample refinement of the minimum
        const dm = dist(i - 1);
        const dp = dist(i + 1);
        const denom = dm - 2 * d + dp;
        const frac = denom !== 0 ? (0.5 * (dm - dp)) / denom : 0;
        const step = b[1].et - b[0].et;
        return b[i].et - b[0].et + frac * step;
      }
    }
    return b[b.length - 1].et - b[0].et;
  }
}

// Solve a symmetric 3x3 system m (row-major, 9) * x = rhs (3) via Cramer's rule.
function solve3(m, rhs) {
  const det =
    m[0] * (m[4] * m[8] - m[5] * m[7]) -
    m[1] * (m[3] * m[8] - m[5] * m[6]) +
    m[2] * (m[3] * m[7] - m[4] * m[6]);
  if (Math.abs(det) < 1e-20) return null;

  const col = (c) => {
    const a = m.slice();
    a[0 + c] = rhs[0];
    a[3 + c] = rhs[1];
    a[6 + c] = rhs[2];
    return (
      a[0] * (a[4] * a[8] - a[5] * a[7]) -
      a[1] * (a[3] * a[8] - a[5] * a[6]) +
      a[2] * (a[3] * a[7] - a[4] * a[6])
    );
  };

  return [col(0) / det, col(1) / det, col(2) / det];
}
