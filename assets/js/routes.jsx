import React from 'react';
import { Route, Switch } from 'react-router-dom';

import ConstrainedLayoutRoute from './components/ConstrainedLayoutRoute';
import UnconstrainedLayoutRoute from './components/UnconstrainedLayoutRoute';
import Root from './components/Root';

import Home from './components/Home';
import SpiceObjects from './components/SpiceObjects';
import Barycenter from './components/Barycenter';
import Body from './components/Body';
import Spheroid from './components/Spheroid';


export const routes = (
  <Root>
    <Switch>
      <UnconstrainedLayoutRoute path="/objects/:id" component={ Body } />

      <UnconstrainedLayoutRoute path="/barycenters/:id" component={ Barycenter } />
      <UnconstrainedLayoutRoute path="/planets/:id" component={ Spheroid } />
      <UnconstrainedLayoutRoute path="/satellites/:id" component={ Spheroid } />

      <ConstrainedLayoutRoute exact path="/objects" component={ SpiceObjects } />
      <ConstrainedLayoutRoute exact path="/" component={ Home } />
    </Switch>
  </Root>
);
