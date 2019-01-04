import React from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'semantic-ui-react';


export default class SpiceObjectsTable extends React.Component {
  render() {
    return (
      <Table className={'spice_objects_table'}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Spice Name</Table.HeaderCell>
            <Table.HeaderCell>Spice ID</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.props.spiceObjects.map((spiceObj) =>
            <Table.Row key={spiceObj.id}>
              <Table.Cell><Link to={`/${spiceObj.type}s/${spiceObj.id}`}>{spiceObj.name}</Link></Table.Cell>
              <Table.Cell>{spiceObj.type}</Table.Cell>
              <Table.Cell>{spiceObj.spice_name}</Table.Cell>
              <Table.Cell>{spiceObj.spice_id}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    )
  }
}
