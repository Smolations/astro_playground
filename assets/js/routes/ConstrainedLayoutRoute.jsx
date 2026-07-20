import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Header, Image } from 'semantic-ui-react';

// react-router v6 layout route: renders the matched child via <Outlet />.
export default function ConstrainedLayout() {
  return (
    <Container>
      <Header dividing>
        <Image src="/images/phoenix.png" centered />
      </Header>
      <Outlet />
    </Container>
  );
}
