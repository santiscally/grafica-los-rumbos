// frontend/src/App.js - REEMPLAZAR TODO

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Admin from './components/Admin/Admin';
import PedidoPersonalizado from './components/Landing/PedidoPersonalizado';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/pedido-personalizado" element={<PedidoPersonalizado />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;