import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

import SystemsView from '../components/SystemsView';
import ObjectSearch from '../components/ObjectSearch';


export default class SpiceObjects extends React.Component {
  constructor() {
    super();
    this.state = { manifest: null, loading: true, error: null };
  }

  componentDidMount() {
    // The grouped view (systems + per-body links + renderability) comes from the
    // precomputed manifest served at /api/home_manifest (see mix astro.manifest).
    fetch('/api/home_manifest')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((manifest) => this.setState({ manifest, loading: false }))
      .catch((err) => this.setState({ error: String(err), loading: false }));
  }

  render() {
    let content;
    if (this.state.loading) {
      content = <p><em>Loading...</em></p>;
    } else if (this.state.error) {
      content = (
        <p>
          <em>Couldn’t load the object list ({this.state.error}). Has the render
          manifest been generated (<code>mix astro.manifest</code>)?</em>
        </p>
      );
    } else {
      content = (
        <Container>
          <SystemsView manifest={this.state.manifest} />
          <br />
          <ObjectSearch />
        </Container>
      );
    }

    return (
      <div>
        <h1>Solar System Objects</h1>
        <p>
          Expand a system to view individual bodies. <strong>System view</strong>{' '}
          opens the animated multi-body view; <strong>View body</strong> opens a
          single 3D model.
        </p>
        {content}
        <br /><br />
        <p><Link to="/">Back to home</Link></p>
      </div>
    );
  }
};
