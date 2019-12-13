import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import ProjectList from './ProjectList';

const App: React.FC = () => (
  <BrowserRouter>
    <Route path="/:id?/:namespace?/:kind?" component={ProjectList}/>
  </BrowserRouter>
);

export default App;
