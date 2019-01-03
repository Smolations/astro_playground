import React from 'react';
import { Route, Switch } from 'react-router-dom';

import ConstrainedLayoutRoute from './routes/ConstrainedLayoutRoute';
import UnconstrainedLayoutRoute from './routes/UnconstrainedLayoutRoute';
import Root from './components/Root';

import Home from './routes/Home';
import Barycenter from './routes/Barycenter';
import Body from './routes/Body';
import Spheroid from './routes/Spheroid';
import SpiceObjects from './routes/SpiceObjects';


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
