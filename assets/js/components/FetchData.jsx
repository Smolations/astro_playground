import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Button } from 'semantic-ui-react';


export default class FetchData extends React.Component {
  constructor() {
    super();
    this.state = { languages: [], loading: true };

    // Get the data from our API.
    fetch('/api/languages')
      .then((response) => response.json())
      .then((data) => {
        this.setState({ languages: data.data, loading: false })
      })
  }

  static renderLanguagesTable(languages) {
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Language</Table.HeaderCell>
            <Table.HeaderCell>Example proverb</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {languages.map((language) =>
            <Table.Row key={language.id}>
              <Table.Cell>{language.name}</Table.Cell>
              <Table.Cell>{language.proverb}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    )
  }

  render() {
    const content = this.state.loading
      ? <p><em>Loading...</em></p>
      : FetchData.renderLanguagesTable(this.state.languages)

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
