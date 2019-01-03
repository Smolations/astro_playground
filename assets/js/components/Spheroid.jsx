import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Container,
  Icon,
  Segment,
  Sidebar,
  Sticky,
} from 'semantic-ui-react';

import BodySidebarTable from './BodySidebarTable';
import SpheroidModel from './SpheroidModel';


export default class Spheroid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spiceObject: {},
      specs: {},
      texture: {},
      loading: true,
      sidebar: false,
    };

    const objectId = props.match.params.id;
    const bodyUri = `/api/objects/${objectId}`;


    // Get the data from our API.
    Promise.all([
      fetch(bodyUri)
        .then((response) => response.json())
        .then((data) => {
          console.log('fetched spiceObject: %o', data.data);
          this.setState({ spiceObject: data.data });
        }),
      fetch(`${bodyUri}/size_and_shape`)
        .then((response) => response.json())
        .then((data) => {
          console.log('fetched size_and_shape: %o', data);
          this.setState({ specs: data });
        }),
      // fetch(`${bodyUri}/orbiting`)
      //   .then((response) => response.json())
      //   .then((data) => {
      //     console.log('fetched orbiting: %o', data.data);
      //     if (data.data && data.data.length) {
      //       this.setState({ orbiting: data.data });
      //     }
      //   }),
    ])
      .then(() => {
        // console.log('setting loading state...')
        this.setState({ loading: false });
      });
  }

  handleSidebarToggle = () => {
    return this.setState({ sidebar: !this.state.sidebar });
  }

  render() {
    const { spiceObject, sidebar, specs } = this.state;
    const content = this.state.loading
      ? <p><em>Loading...</em></p>
      : (
        <div>
          <Button.Group className="buttons">
            <Link to="/objects">
              <Button icon labelPosition="left">
                <Icon name="arrow left" />
                Back
              </Button>
            </Link>
            <Button.Or/>
            <Button toggle icon labelPosition="right" active={sidebar} onClick={this.handleSidebarToggle}>
              <Icon name="info" />
              Info
            </Button>
          </Button.Group>
          <Sidebar.Pushable as={Segment}>
            <Sidebar
              className="info_sidebar"
              animation="overlay"
              icon="labeled"
              inverted="true"
              vertical="true"
              visible={sidebar}
              width="wide"
            >
              <BodySidebarTable body={spiceObject} />
            </Sidebar>

            <Sidebar.Pusher>
              <Segment basic>
                <SpheroidModel info={spiceObject} specs={specs} texture={spiceObject.texture} />
              </Segment>
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </div>
      );

    return content;
  }
};
