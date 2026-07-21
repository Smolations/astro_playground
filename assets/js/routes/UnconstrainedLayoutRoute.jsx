import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

import TimeScaleControl from '../components/TimeScaleControl';

// react-router v6 layout route: renders the matched child via <Outlet />. The
// global time-scale control lives here so it's shown on every animated view
// (system + single-body) but not on the home/list pages.
export default function UnconstrainedLayout() {
  return (
    <Container fluid>
      <TimeScaleControl />
      <Outlet />
    </Container>
  );
}
