import React from 'react';
import { Container, Header, Image } from 'semantic-ui-react';


export default class Root extends React.Component {
  render() {
    return (
      <Container>
        <Header dividing>
          <Image src='/images/phoenix.png' centered />
        </Header>
        {this.props.children}
      </Container>
    );
  }
};
