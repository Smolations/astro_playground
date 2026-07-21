import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Accordion, List, Label, Icon, Button, Popup } from 'semantic-ui-react';

// A system's animated view is only worth linking to when it will actually
// render something. `mix astro.manifest` classifies each barycenter; we mirror
// that here to gate the "System view" CTA and explain when it's unavailable.
const STATUS = {
  ok: {
    color: 'green',
    label: 'System view',
    icon: 'play circle',
    enabled: true,
  },
  // A moonless planet: the system view renders it framed as a lone body (no
  // orbital motion), so the CTA is live — just labelled to set expectations.
  lone: {
    color: 'green',
    label: 'System view',
    icon: 'play circle',
    enabled: true,
  },
  empty: {
    color: 'grey',
    label: 'No data',
    icon: 'ban',
    enabled: false,
    reason:
      "No ephemeris is loaded for this system's bodies yet, so there's nothing to animate.",
  },
};

// Type badge colors — a quick affordance for what a body is.
const TYPE_COLOR = {
  star: 'yellow',
  planet: 'blue',
  dwarf_planet: 'teal',
  satellite: 'grey',
  barycenter: 'black',
};

function SystemViewCTA({ system }) {
  const cfg = STATUS[system.status] || STATUS.empty;

  if (cfg.enabled) {
    return (
      <Button
        as={Link}
        to={system.barycenter.route}
        color="green"
        size="small"
        floated="right"
        onClick={(e) => e.stopPropagation()} // don't toggle the accordion
      >
        <Icon name={cfg.icon} /> System view
      </Button>
    );
  }

  // A disabled button doesn't emit hover events, so wrap it for the Popup.
  return (
    <Popup
      content={cfg.reason}
      trigger={
        <span style={{ float: 'right' }} onClick={(e) => e.stopPropagation()}>
          <Button disabled size="small">
            <Icon name={cfg.icon} /> {cfg.label}
          </Button>
        </span>
      }
    />
  );
}

function BodyRow({ body, isPrimary }) {
  return (
    <List.Item>
      <List.Content floated="right">
        <Button as={Link} to={body.route} size="mini" basic>
          <Icon name="globe" /> View body
        </Button>
      </List.Content>
      <List.Content>
        <List.Header>
          <Label color={TYPE_COLOR[body.type] || 'grey'} size="mini" horizontal>
            {body.type.replace('_', ' ')}
          </Label>
          {body.name}
          {isPrimary && (
            <Label size="mini" basic style={{ marginLeft: 6 }}>
              <Icon name="star" /> primary
            </Label>
          )}
          {!body.ephemeris_ok && (
            <Label color="red" size="mini" basic style={{ marginLeft: 6 }} title={body.error || ''}>
              <Icon name="warning circle" /> no ephemeris
            </Label>
          )}
        </List.Header>
        <List.Description>
          {body.spice_name} · NAIF {body.spice_id}
        </List.Description>
      </List.Content>
    </List.Item>
  );
}

export default function SystemsView({ manifest }) {
  // Open the whole-solar-system panel by default; collapse the rest.
  const [open, setOpen] = useState(() =>
    manifest.systems.length ? { [manifest.systems[0].barycenter.id]: true } : {}
  );

  const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Accordion styled fluid>
      {manifest.systems.map((system) => {
        const id = system.barycenter.id;
        const total = system.bodies.length;
        return (
          <React.Fragment key={id}>
            <Accordion.Title active={!!open[id]} onClick={() => toggle(id)}>
              <Icon name="dropdown" />
              <strong>{system.barycenter.name}</strong>
              <Label size="tiny" style={{ marginLeft: 8 }}>
                {system.renderable_count}/{total} render
              </Label>
              <SystemViewCTA system={system} />
            </Accordion.Title>
            <Accordion.Content active={!!open[id]}>
              <List divided relaxed>
                {system.bodies.map((body) => (
                  <BodyRow key={body.id} body={body} isPrimary={body.id === system.primary_id} />
                ))}
              </List>
            </Accordion.Content>
          </React.Fragment>
        );
      })}
    </Accordion>
  );
}
