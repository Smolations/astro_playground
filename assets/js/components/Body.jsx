import React from 'react';
import { Link } from 'react-router-dom';
import BodiesTable from './BodiesTable';
import ChristmasModel from './ChristmasModel';
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
            // just to test with earth/moon
            const orbit = data.data[0];
            // orbit.eccentricity = 0.6;
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
          <BodiesTable bodies={[body]} />
          <br /><br />
          <PlanetModel specs={body} orbiting={orbiting} />
        </div>
      );

    return (
      <div>
        <h1>Single Heavenly Body</h1>
        {content}
        <p><Link to="/">Back to home</Link></p>
      </div>
    );
  }
};
