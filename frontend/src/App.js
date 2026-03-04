import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingEShopper from './components/Landing/LandingEShopper';
import LandingColegio from './components/Landing/LandingColegio';
import Admin from './components/Admin/Admin';
import PedidoPersonalizado from './components/Landing/PedidoPersonalizado';
import Precios from './components/Landing/Precios';
import Checkout from './components/Landing/Checkout';
import './styles/App.css';
import './styles/eshopper.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingEShopper />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/pedido-personalizado" element={<PedidoPersonalizado />} />
          <Route path="/precios" element={<Precios />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/catalogo/:slug" element={<LandingColegio />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;