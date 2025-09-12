// frontend/src/components/Landing/Precios.js - REEMPLAZAR TODO
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { priceService } from '../../services/api';

const Precios = () => {
  const [precios, setPrecios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrecios();
  }, []);

  const fetchPrecios = async () => {
    try {
      setLoading(true);
      const data = await priceService.getPrices();
      setPrecios(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los precios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="min-h-100vh bg-light">
      <header className="border-bottom bg-white shadow-sm">
        <div className="container">
          <div className="py-3">
            <div className="d-flex align-items-center gap-3">
              <Link to="/" className="btn btn-ghost btn-sm d-flex align-items-center gap-2">
                <i className="fas fa-arrow-left"></i>
                Volver
              </Link>
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-list-alt text-primary" style={{ fontSize: '2rem' }}></i>
                <h1 className="h3 mb-0 fw-bold">Lista de Precios</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold mb-3">Precios de Servicios</h2>
              <p className="text-muted lead">Precios actualizados - Consulte por trabajos especiales</p>
            </div>

            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="card shadow-sm">
                <div className="card-body p-0">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3 px-4">Servicio</th>
                        <th className="py-3 px-4 text-end">Precio por Unidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {precios.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="text-center py-4">
                            No hay precios disponibles
                          </td>
                        </tr>
                      ) : (
                        precios.map((item) => (
                          <tr key={item._id}>
                            <td className="py-3 px-4">{item.servicio}</td>
                            <td className="py-3 px-4 text-end fw-bold text-primary">
                              ${formatPrice(item.precio)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-5">
              <div className="alert alert-info">
                <h5 className="alert-heading">
                  <i className="fas fa-info-circle me-2"></i>
                  Información Importante
                </h5>
                <ul className="mb-0">
                  <li>Los precios pueden variar según la cantidad solicitada</li>
                  <li>Descuentos especiales para trabajos de gran volumen</li>
                  <li>Consulte por servicios no listados</li>
                  <li>Precios sujetos a cambios sin previo aviso</li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-4">
              <Link to="/pedido-personalizado" className="btn btn-primary btn-lg">
                <i className="fas fa-upload me-2"></i>
                Realizar Pedido
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer minimalista con powered by */}
      <footer className="mt-auto border-top bg-white py-3">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <p className="text-muted mb-0 small">&copy; 2025 Rumbos Gráfica & Copias</p>
            <a 
              href="https://simpleapps.com.ar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-decoration-none d-flex align-items-center gap-1"
              style={{
                fontSize: '0.8rem',
                color: '#6c757d',
                padding: '4px 10px',
                borderRadius: '15px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0d6efd';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6c757d';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ opacity: 0.7 }}>powered by</span>
              <span style={{ 
                fontFamily: 'monospace', 
                fontWeight: '700',
                fontSize: '0.9rem'
              }}>
                &lt;s/a&gt;
              </span>
              <span style={{ fontWeight: '500' }}>Simple Apps</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Precios;