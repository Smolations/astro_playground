import React from 'react';
import { Route } from 'react-router-dom';
import Root from './components/Root';
import Home from './components/Home';
import Bodies from './components/Bodies';
import Counter from './components/Counter';

export const routes = (
  <Root>
    <Route exact path="/" component={ Home } />
    <Route path="/counter" component={ Counter } />
    <Route path="/bodies" component={ Bodies } />
  </Root>
)
