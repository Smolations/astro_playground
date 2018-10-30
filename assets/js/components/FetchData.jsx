import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Button } from 'semantic-ui-react';


export default class FetchData extends React.Component {
  constructor() {
    super();
    this.state = { bodies: [], loading: true };

    // Get the data from our API.
    fetch('/api/bodies')
      .then((response) => response.json())
      .then((data) => {
        this.setState({ bodies: data.data, loading: false })
      })
  }

  static renderBodiesTable(bodies) {
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Body</Table.HeaderCell>
            <Table.HeaderCell>Diameter</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {bodies.map((body) =>
            <Table.Row key={body.id}>
              <Table.Cell>{body.name}</Table.Cell>
              <Table.Cell>{body.diameter}km</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    )
  }

  render() {
    const content = this.state.loading
      ? <p><em>Loading...</em></p>
      : FetchData.renderBodiesTable(this.state.bodies)

    return (
      <div>
        <h1>Fetch Data</h1>
        <p>This component demonstrates fetching data from the Phoenix API endpoint.</p>
        {content}
        <br /><br />
        <p><Link to="/">Back to home</Link></p>
      </div>
    )
  }
}
