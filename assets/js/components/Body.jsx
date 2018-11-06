import React from 'react';
import { Link } from 'react-router-dom';
import BodiesTable from './BodiesTable';
import ChristmasModel from './ChristmasModel';
import PlanetModel from './PlanetModel';


export default class Body extends React.Component {
  constructor(props) {
    super(props);
    this.state = { body: {}, loading: true };

    // Get the data from our API.
    fetch(`/api/bodies/${props.match.params.id}`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ body: data.data, loading: false })
      });
  }

  render() {
    const body = this.state.body
    const content = this.state.loading
      ? <p><em>Loading...</em></p>
      : <BodiesTable bodies={[body]}/>;

    return (
      <div>
        <h1>Single Heavenly Body</h1>
        {content}
        <br /><br />
        <PlanetModel specs={body} />
        <p><Link to="/">Back to home</Link></p>
      </div>
    );
  }
};
