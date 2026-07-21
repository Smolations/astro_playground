import React from 'react';

import simSettings, {
  setTimeScale,
  subscribe,
  TIME_SCALE_MIN,
  TIME_SCALE_MAX,
} from '../three/lib/sim-settings';

// Largest-fitting unit for the "1 real second ≈ N sim-<unit>" hint.
const UNITS = [
  ['year', 365.25 * 86400],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

function formatMapping(simSecondsPerRealSecond) {
  for (const [name, secs] of UNITS) {
    const v = simSecondsPerRealSecond / secs;
    if (v >= 1 || name === 'second') {
      const rounded = v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
      const unit = rounded === 1 ? name : `${name}s`;
      return `1 sec ≈ ${rounded} sim-${unit}`;
    }
  }
  return '';
}

// Global, top-center time-scale control. Mounted in the UnconstrainedLayout that
// wraps the system + single-body routes, so it appears on every animated view —
// signalling that the pace is a global setting shared across them, not a
// per-view knob. Reads/writes the shared `simSettings` store. The hint under the
// slider translates the abstract multiplier into an approximate real→sim time
// mapping for whatever view is active (each view registers its own base rate).
export default function TimeScaleControl() {
  const [, force] = React.useReducer((x) => x + 1, 0);

  // Re-render on any settings change (slider moved, or a view registered its
  // base rate on mount).
  React.useEffect(() => subscribe(force), []);

  const { timeScale, baseEtPerWallSecond } = simSettings;
  const onChange = (e) => setTimeScale(parseFloat(e.target.value));

  return (
    <div className="time_scale">
      <div className="time_scale_row">
        <label htmlFor="time_scale_range">Time</label>
        <input
          id="time_scale_range"
          type="range"
          min={TIME_SCALE_MIN}
          max={TIME_SCALE_MAX}
          step="0.1"
          value={timeScale}
          onChange={onChange}
        />
        <span className="time_scale_value">{timeScale.toFixed(1)}&times;</span>
      </div>
      {baseEtPerWallSecond && (
        <div className="time_scale_hint">
          {formatMapping(baseEtPerWallSecond * timeScale)}
        </div>
      )}
    </div>
  );
}
