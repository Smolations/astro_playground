import React from 'react';
import { Route, Switch } from 'react-router-dom';

import ConstrainedLayoutRoute from './components/ConstrainedLayoutRoute';
import UnconstrainedLayoutRoute from './components/UnconstrainedLayoutRoute';
import Root from './components/Root';

import Home from './components/Home';
import Bodies from './components/Bodies';
import Body from './components/Body';


export const routes = (
  <Root>
    <Switch>
      <UnconstrainedLayoutRoute path="/bodies/:id" component={ Body } />
      <ConstrainedLayoutRoute exact path="/bodies" component={ Bodies } />
      <ConstrainedLayoutRoute exact path="/" component={ Home } />
    </Switch>
  </Root>
);
