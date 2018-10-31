import React from 'react';
import { Route } from 'react-router-dom';
import Root from './components/Root';
import Home from './components/Home';
import Bodies from './components/Bodies';
import Body from './components/Body';
import Counter from './components/Counter';


export const routes = (
  <Root>
    <Route path="/counter" component={ Counter } />

    <Route exact path="/" component={ Home } />
    <Route exact path="/bodies" component={ Bodies } />
    <Route path="/bodies/:id" component={ Body } />
  </Root>
);
