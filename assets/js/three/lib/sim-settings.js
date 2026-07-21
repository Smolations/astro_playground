// Global simulation settings shared across every animated view.
//
// The time-scale multiplier is deliberately GLOBAL: the base speed is already
// the same for every system (orbital motion via `ET_PER_WALL_SECOND`, body spin
// via `BODY_ET_PER_WALL_SECOND`), and this multiplier rides on top of it — so a
// single control paces whatever simulation is on screen, and the setting
// persists as you navigate between the system and single-body views. Render
// loops read `simSettings.timeScale` fresh each frame; the top-center
// TimeScaleControl is the sole writer. Persisted to localStorage so it also
// survives a reload.
//
// `baseEtPerWallSecond` is the ephemeris seconds advanced per wall-second at 1×
// for the *active* view. Orbit motion and body spin are calibrated to different
// base rates, so each view registers its own on mount; the control uses it only
// to show an approximate real→sim time mapping under the slider.

const STORAGE_KEY = 'astro.timeScale';

export const TIME_SCALE_MIN = 0.1;
export const TIME_SCALE_MAX = 10;

const clamp = (v) => Math.min(TIME_SCALE_MAX, Math.max(TIME_SCALE_MIN, v));

function load() {
  try {
    const v = parseFloat(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(v)) return clamp(v);
  } catch (e) {
    // localStorage unavailable (private mode, etc.) — fall through to default.
  }
  return 1;
}

const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn(simSettings));

const simSettings = {
  timeScale: load(),
  baseEtPerWallSecond: null, // set by the active view on mount
};

export function setTimeScale(value) {
  const v = clamp(value);
  simSettings.timeScale = v;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(v));
  } catch (e) {
    // Non-fatal: the in-memory value still drives the sim this session.
  }
  notify();
}

// The active view registers its 1× base rate (ephemeris s / wall s) so the
// control can show the approximate real→sim time mapping for what's on screen.
export function setBaseEtPerWallSecond(rate) {
  if (Number.isFinite(rate) && rate > 0) {
    simSettings.baseEtPerWallSecond = rate;
    notify();
  }
}

// Clear the base rate so the control drops its real→sim hint. Used by views
// whose motion doesn't represent physical time (the isolated body showcase),
// where the time scale is just a spin-speed multiplier.
export function clearBaseEtPerWallSecond() {
  simSettings.baseEtPerWallSecond = null;
  notify();
}

// Subscribe to any settings change (for UI that mirrors the value). The
// callback receives the live settings object. Returns an unsubscriber.
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export default simSettings;
