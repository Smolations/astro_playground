import React from 'react';
import { Link } from 'react-router-dom';
import { Sticky } from 'semantic-ui-react';

import BodiesTable from './BodiesTable';
import PlanetModel from './PlanetModel';


export default class Body extends React.Component {
  constructor(props) {
    super(props);
    this.state = { body: {}, texture: {}, orbiting: [], loading: true };

    const bodyId = props.match.params.id;
    const bodyUri = `/api/bodies/${bodyId}`;

    // Get the data from our API.
    Promise.all([
      fetch(bodyUri)
        .then((response) => response.json())
        .then((data) => {
          // console.log('fetched body: %o', data);
          this.setState({ body: data.data });
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

  render() {
    const { body, orbiting } = this.state;
    const content = this.state.loading
      ? <p><em>Loading...</em></p>
      : (
        <div>
          <PlanetModel specs={body} orbiting={orbiting} />
          {/*<Sticky>
                    </Sticky>*/}
            <BodiesTable bodies={[body]} />
        </div>
      );

    return content;

    return (
      <div>
        {content}
        <p><Link to="/">Back to home</Link></p>
      </div>
    );
  }
};
