import React from 'react';
import { Route, Switch } from 'react-router-dom';

import ConstrainedLayoutRoute from './components/ConstrainedLayoutRoute';
import UnconstrainedLayoutRoute from './components/UnconstrainedLayoutRoute';
import Root from './components/Root';

import Home from './components/Home';
import SpiceObjects from './components/SpiceObjects';
import Body from './components/Body';


export const routes = (
  <Root>
    <Switch>
      <UnconstrainedLayoutRoute path="/objects/:id" component={ Body } />
      <ConstrainedLayoutRoute exact path="/objects" component={ SpiceObjects } />
      <ConstrainedLayoutRoute exact path="/" component={ Home } />
    </Switch>
  </Root>
);
