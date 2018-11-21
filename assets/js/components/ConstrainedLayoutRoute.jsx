import React from 'react';
import { Route } from 'react-router-dom';
import { Container, Header, Image } from 'semantic-ui-react';


export default function ConstrainedLayoutRoute({ component: Component, ...rest }) {
  return (
    <Container>
      <Header dividing>
        <Image src='/images/phoenix.png' centered />
      </Header>
      <Route
        {...rest}
        render={props => <Component {...props} />}
      />
    </Container>
  );
};
