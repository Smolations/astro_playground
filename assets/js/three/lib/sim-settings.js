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

const simSettings = {
  timeScale: load(),
};

export function setTimeScale(value) {
  const v = clamp(value);
  simSettings.timeScale = v;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(v));
  } catch (e) {
    // Non-fatal: the in-memory value still drives the sim this session.
  }
  listeners.forEach((fn) => fn(v));
}

// Subscribe to changes (for UI that mirrors the value). Returns an unsubscriber.
export function subscribeTimeScale(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export default simSettings;
