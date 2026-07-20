import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ConstrainedLayout from './routes/ConstrainedLayoutRoute';
import UnconstrainedLayout from './routes/UnconstrainedLayoutRoute';
import Root from './components/Root';

import Home from './routes/Home';
import Barycenter from './routes/Barycenter';
import Spheroid from './routes/Spheroid';
import SpiceObjects from './routes/SpiceObjects';

export default function AppRoutes() {
  return (
    <Root>
      <Routes>
        <Route element={<UnconstrainedLayout />}>
          <Route path="/barycenters/:id" element={<Barycenter />} />
          <Route path="/planets/:id" element={<Spheroid />} />
          <Route path="/satellites/:id" element={<Spheroid />} />
          <Route path="/stars/:id" element={<Spheroid />} />
          <Route path="/dwarf_planets/:id" element={<Spheroid />} />
        </Route>

        <Route element={<ConstrainedLayout />}>
          <Route path="/objects" element={<SpiceObjects />} />
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </Root>
  );
}
