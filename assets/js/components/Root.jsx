import React from 'react';
import { Container } from 'semantic-ui-react';


export default class Root extends React.Component {
  render() {
    return (
      <Container fluid={true}>
        {this.props.children}
      </Container>
    );
  }
};
