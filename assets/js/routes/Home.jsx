import React from 'react';
import { Link } from 'react-router-dom';
import { List } from 'semantic-ui-react';

export default class Home extends React.Component {
  render() {
    return (
      <List>
        <List.Item><Link to="/objects">Solar System Objects</Link></List.Item>
        <List.Item>
          {/* Served by Phoenix (OpenApiSpex SwaggerUI), not a router route — a
              plain anchor that opens the interactive API docs in a new tab. */}
          <a href="/api/docs" target="_blank" rel="noopener noreferrer">API docs (Swagger)</a>
        </List.Item>
      </List>
    );
  }
}
