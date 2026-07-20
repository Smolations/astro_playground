import 'semantic-ui-css/semantic.min.css';
import '../scss/app.scss';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import AppRoutes from './routes';

const container = document.getElementById('react-app');
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);
