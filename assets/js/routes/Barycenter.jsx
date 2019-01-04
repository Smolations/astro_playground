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

import BodySidebarTable from '../components/BodySidebarTable';
import BarycenterModel from '../components/BarycenterModel';


export default class Barycenter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spiceObject: {},
      orbiting: [],
      specs: {},
      loading: true,
      sidebar: false,
    };
  }

  componentDidMount() {
    const objectId = this.props.match.params.id;
    const bodyUri = `/api/objects/${objectId}`;

    // Get the data from our API.
    Promise.all([
      fetch(bodyUri)
        .then((response) => response.json())
        .then((data) => {
          console.log('fetched spiceObject: %o', data.data);
          this.setState({ spiceObject: data.data });
        }),
      fetch(`${bodyUri}/orbiting`)
        .then((response) => response.json())
        .then((data) => {
          console.log('fetched orbiting: %o', data.data);
          if (data.data && data.data.length) {
            this.setState({ orbiting: data.data });
          }
        }),
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
    const { orbiting, spiceObject, sidebar, specs } = this.state; console.log('spiceObject %o', spiceObject)
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
                <BarycenterModel
                  model={spiceObject}
                  orbiting={orbiting}
                />
              </Segment>
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </div>
      );

    return content;
  }
};
