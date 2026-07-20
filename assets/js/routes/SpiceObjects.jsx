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
    // List every body (planets, satellites, star, dwarf planet, barycenters).
    fetch('/api/objects')
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
        <h1>Solar System Objects</h1>
        <p>Click a body to view its 3D model.</p>
        {content}
        <br /><br />
        <p><Link to="/">Back to home</Link></p>
      </div>
    );
  }
};
