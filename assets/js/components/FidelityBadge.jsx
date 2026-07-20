import React from 'react';
import { Label, Icon } from 'semantic-ui-react';

// Communicates how trustworthy a texture is as a depiction of the real body.
// Several common planetary textures are partly or wholly invented, so the app
// says so rather than presenting fiction as measurement.
const FIDELITY = {
  real: {
    color: 'green',
    icon: 'check circle',
    text: 'Real imagery',
    detail: 'Imagery-derived global mosaic.',
  },
  partial: {
    color: 'yellow',
    icon: 'adjust',
    text: 'Partial coverage',
    detail: 'Real mission data, but hemisphere-only or with interpolated fill.',
  },
  synthetic: {
    color: 'orange',
    icon: 'paint brush',
    text: 'Synthetic',
    detail: 'Artistic/procedural composite — not measured surface data.',
  },
};

export default function FidelityBadge({ texture }) {
  const fidelity = texture && texture.fidelity;
  const cfg = FIDELITY[fidelity];
  if (!cfg) return null;

  return (
    <Label color={cfg.color} size="small" title={cfg.detail}>
      <Icon name={cfg.icon} />
      {cfg.text}
    </Label>
  );
}
