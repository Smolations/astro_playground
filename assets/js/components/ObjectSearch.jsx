import React from 'react';
import { Link, withRouter } from 'react-router-dom'
import { Container, Grid, List, Search } from 'semantic-ui-react';
import _debounce from 'lodash/debounce';


class ObjectSearch extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      objects: [],
      value: '',
    };
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ loading: true, value });

    // for simplicity, maybe just search names?
    // const uri = /^\d+$/.test(value)
    //   ? `/api/objects?spice_id=${value}`
    //   : `/api/objects?spice_name=${value}`;

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent();

      fetch(`/api/objects?spice_name=${value}`)
        .then((response) => response.json())
        .then((data) => {
          const objects = data.data.map(obj => {
            return { key: obj.id, title: obj.spice_name, ...obj };
          });
          this.setState({ objects, loading: false });
        });
    }, 300)
  };

  handleResultSelect = (e, { result }) => {
    const { id, type } = result;
    const uri = `/${type}s/${id}`;
    this.props.history.push(uri);
  };

  resetComponent = () => this.setState({ loading: false, objects: [], value: '' });

  resultRenderer = ({ spice_name, type }) => {
    return (
      <List>
        <List.Item>
          <strong>{spice_name}</strong> ({type})
        </List.Item>
      </List>
    );
  };

  render() {
    const { loading, value, objects } = this.state;

    return (
      <Grid centered columns={2}>
        <Grid.Column>
          <Container textAlign='center'>
            <Search
              fluid
              minCharacters={2}
              loading={loading}
              onResultSelect={this.handleResultSelect}
              onSearchChange={_debounce(this.handleSearchChange, 500, { leading: true })}
              results={objects}
              resultRenderer={this.resultRenderer}
              value={value}
            />
          </Container>
        </Grid.Column>
      </Grid>
    );
  }
}


export default withRouter(ObjectSearch);
