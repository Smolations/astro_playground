import React from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'semantic-ui-react';


export default class BodySidebarTable extends React.Component {
  render() {
    const { body } = this.props;

    return (
      <Table className={'body_sidebar_table'}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Body Name</Table.Cell>
            <Table.Cell><Link to={`/bodies/${body.id}`}>{body.name}</Link></Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Type</Table.Cell>
            <Table.Cell>{body.type}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Mass</Table.Cell>
            <Table.Cell>{body.mass} &times; 10<sup>24</sup>kg</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Equatorial Radius</Table.Cell>
            <Table.Cell>{body.equatorial_radius}km</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Oblateness</Table.Cell>
            <Table.Cell>{body.oblateness}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Axial Tilt</Table.Cell>
            <Table.Cell>{body.axial_tilt}&deg;</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Obliquity to Orbit</Table.Cell>
            <Table.Cell>{body.obliquity_to_orbit}&deg;</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Rotation Period</Table.Cell>
            <Table.Cell>{body.sidereal_rotation_period}h</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }
}
