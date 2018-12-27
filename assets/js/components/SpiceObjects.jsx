import React from 'react';
import { Link } from 'react-router-dom';
import SpiceObjectsTable from './SpiceObjectsTable';


export default class SpiceObjects extends React.Component {
  constructor() {
    super();
    this.state = { spiceObjects: [], loading: true };

    // Get the data from our API.
    fetch('/api/objects?type=barycenter')
      .then((response) => response.json())
      .then((data) => {
        this.setState({ spiceObjects: data.data, loading: false })
      });
  }

  render() {
    const content = this.state.loading
      ? <p><em>Loading...</em></p>
      : <SpiceObjectsTable spiceObjects={this.state.spiceObjects}/>;

    return (
      <div>
        <h1>Spice Objects</h1>
        <p>This component demonstrates fetching data from a Phoenix API endpoint.</p>
        {content}
        <br /><br />
        <p><Link to="/">Back to home</Link></p>
      </div>
    );
  }
};
