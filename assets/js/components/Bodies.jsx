import React from 'react';
import { Link } from 'react-router-dom';
import BodiesTable from './BodiesTable';


export default class FetchData extends React.Component {
  constructor() {
    super();
    this.state = { bodies: [], loading: true };

    // Get the data from our API.
    fetch('/api/bodies')
      .then((response) => response.json())
      .then((data) => {
        this.setState({ bodies: data.data, loading: false })
      });
  }

  render() {
    const content = this.state.loading
      ? <p><em>Loading...</em></p>
      : <BodiesTable bodies={this.state.bodies}/>;

    return (
      <div>
        <h1>Heavenly Bodies</h1>
        <p>This component demonstrates fetching data from a Phoenix API endpoint.</p>
        {content}
        <br /><br />
        <p><Link to="/">Back to home</Link></p>
      </div>
    );
  }
};
