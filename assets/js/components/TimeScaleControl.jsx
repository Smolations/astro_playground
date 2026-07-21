import React from 'react';

import simSettings, {
  setTimeScale,
  subscribeTimeScale,
  TIME_SCALE_MIN,
  TIME_SCALE_MAX,
} from '../three/lib/sim-settings';

// Global, top-center time-scale control. Mounted in the UnconstrainedLayout that
// wraps the system + single-body routes, so it appears on every animated view —
// signalling that the pace is a global setting shared across them, not a
// per-view knob. Reads/writes the shared `simSettings` store.
export default function TimeScaleControl() {
  const [value, setValue] = React.useState(simSettings.timeScale);

  // Mirror external changes (e.g. another mount) and keep the label live.
  React.useEffect(() => subscribeTimeScale(setValue), []);

  const onChange = (e) => setTimeScale(parseFloat(e.target.value));

  return (
    <div className="time_scale">
      <label htmlFor="time_scale_range">Time</label>
      <input
        id="time_scale_range"
        type="range"
        min={TIME_SCALE_MIN}
        max={TIME_SCALE_MAX}
        step="0.1"
        value={value}
        onChange={onChange}
      />
      <span className="time_scale_value">{value.toFixed(1)}&times;</span>
    </div>
  );
}
