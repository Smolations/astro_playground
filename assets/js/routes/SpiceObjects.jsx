import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

import SpiceObjectsTable from '../components/SpiceObjectsTable';
import ObjectSearch from '../components/ObjectSearch';


export default class SpiceObjects extends React.Component {
  constructor() {
    super();
    this.state = { spiceObjects: [], loading: true };
  }

  componentDidMount() {
    // Get the data from our API.
    fetch('/api/objects?type=barycenter')
      .then((response) => response.json())
      .then((data) => {
        this.setState({ spiceObjects: data.data, loading: false })
      });
  }

  render() {
    const objectContent = (
      <Container>
        <SpiceObjectsTable spiceObjects={this.state.spiceObjects}/>
        <ObjectSearch/>
      </Container>
    );
    const content = this.state.loading
      ? <p><em>Loading...</em></p>
      : objectContent;

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
