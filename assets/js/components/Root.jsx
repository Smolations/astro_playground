import React from 'react';
import { Container, Header, Image } from 'semantic-ui-react';


export default class ConstrainedLayout extends React.Component {
  render() {
    return (
      <Container fluid={true}>
        {this.props.children}
      </Container>
    );
  }
};
