// frontend/src/App.js - ACTUALIZADO CON NUEVA LANDING
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingEShopper from './components/Landing/LandingEShopper'; // Nueva landing
import Landing from './components/Landing/Landing'; // Landing antigua (como backup)
import Admin from './components/Admin/Admin';
import PedidoPersonalizado from './components/Landing/PedidoPersonalizado';
import Precios from './components/Landing/Precios';
import Checkout from './components/Landing/Checkout'; // Nuevo componente para checkout
import './styles/App.css';
import './styles/eshopper.css'; // Estilos de la nueva landing

function App() {
  // Variable para cambiar entre landings si es necesario
  const useNewLanding = true; // Cambiar a false para usar la landing antigua

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={useNewLanding ? <LandingEShopper /> : <Landing />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/pedido-personalizado" element={<PedidoPersonalizado />} />
          <Route path="/precios" element={<Precios />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;