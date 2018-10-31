import React from 'react';
import { Link } from 'react-router-dom';
import { List } from 'semantic-ui-react';

export default class Home extends React.Component {
  render() {
    return (
      <List>
        <List.Item><Link to="/counter">Counter Example</Link></List.Item>
        <List.Item><Link to="/bodies">Heavenly Bodies</Link></List.Item>
      </List>
    );
  }
}
