import React from 'react';
import { Route } from 'react-router-dom';
import { Container } from 'semantic-ui-react';


export default function UnconstrainedLayoutRoute({ component: Component, ...rest }) {
  return (
    <Container fluid={true}>
      <Route
        {...rest}
        render={props => <Component {...props} />}
      />
    </Container>
  );
};
