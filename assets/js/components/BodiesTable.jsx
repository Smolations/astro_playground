import React from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'semantic-ui-react';


export default class BodiesTable extends React.Component {
  render() {
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Body Name</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Mass</Table.HeaderCell>
            <Table.HeaderCell>Diameter</Table.HeaderCell>
            <Table.HeaderCell>Oblateness</Table.HeaderCell>
            <Table.HeaderCell>Axial Tilt</Table.HeaderCell>
            <Table.HeaderCell>Rotation Period</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.props.bodies.map((body) =>
            <Table.Row key={body.id}>
              <Table.Cell><Link to={`/bodies/${body.id}`}>{body.name}</Link></Table.Cell>
              <Table.Cell>{body.type}</Table.Cell>
              <Table.Cell>{body.mass} &times; 10<sup>24</sup>kg</Table.Cell>
              <Table.Cell>{body.diameter}km</Table.Cell>
              <Table.Cell>{body.oblateness}</Table.Cell>
              <Table.Cell>{body.axial_tilt}&deg;</Table.Cell>
              <Table.Cell>{body.rotation_period}h</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    )
  }
}
