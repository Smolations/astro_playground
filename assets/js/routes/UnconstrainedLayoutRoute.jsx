import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

// react-router v6 layout route: renders the matched child via <Outlet />.
export default function UnconstrainedLayout() {
  return (
    <Container fluid>
      <Outlet />
    </Container>
  );
}
