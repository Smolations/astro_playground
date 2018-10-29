import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { BrowserRouter } from 'react-router-dom';
import { routes } from './routes';

// just until i'm ready for theming...
// import 'semantic-ui-css/semantic.min.css';


ReactDOM.render(
  <BrowserRouter children={ routes } />,
  document.getElementById('react-app')
);
