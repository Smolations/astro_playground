import React from 'react';
import { Table } from 'semantic-ui-react';


export default class BodiesTable extends React.Component {
  render() {
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Body</Table.HeaderCell>
            <Table.HeaderCell>Diameter</Table.HeaderCell>
            <Table.HeaderCell>Orbital Radius</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.props.bodies.map((body) =>
            <Table.Row key={body.id}>
              <Table.Cell>{body.name}</Table.Cell>
              <Table.Cell>{body.diameter}km</Table.Cell>
              <Table.Cell>{body.orbital_radius}km</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    )
  }
}
