// frontend/src/components/Landing/Precios.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { priceService } from '../../services/api';
import Footer from '../Common/Footer';

const Precios = () => {
  const [precios, setPrecios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchPrecios(); }, []);

  const fetchPrecios = async () => {
    try {
      setLoading(true);
      const data = await priceService.getPrices();
      setPrecios(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los precios');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header fijo */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'white', borderBottom: '1px solid #dee2e6', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="container">
          <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '8px', background: '#f8f9fa' }}>
              <i className="fas fa-arrow-left"></i><span>Volver</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', background: '#0d6efd', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem' }}>
                <i className="fas fa-tags"></i>
              </div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#343a40' }}>Lista de Precios</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '100vh' }}>
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#343a40' }}>Precios de Servicios</h2>
                <p style={{ color: '#6c757d', fontSize: '1.125rem' }}>Precios actualizados - Consulte por trabajos especiales</p>
              </div>

              {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              )}

              {error && (
                <div style={{ padding: '1rem', borderRadius: '10px', background: '#fee', color: '#dc3545', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className="fas fa-exclamation-circle"></i>{error}
                </div>
              )}

              {!loading && !error && (
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600, color: '#343a40' }}>
                          <i className="fas fa-print" style={{ marginRight: '10px', color: '#0d6efd' }}></i>Servicio
                        </th>
                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600, color: '#343a40' }}>Precio por Unidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {precios.length === 0 ? (
                        <tr>
                          <td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                            <i className="fas fa-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem', opacity: 0.5 }}></i>No hay precios disponibles
                          </td>
                        </tr>
                      ) : (
                        precios.map((item, index) => (
                          <tr key={item._id} style={{ borderBottom: index < precios.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                            <td style={{ padding: '1rem 1.5rem' }}><span style={{ fontWeight: 500 }}>{item.servicio}</span></td>
                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#0d6efd', fontSize: '1.125rem' }}>${formatPrice(item.precio)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#e3f2fd', borderRadius: '12px', border: '2px solid #bbdefb' }}>
                <h5 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', color: '#1565c0' }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '10px' }}></i>Información Importante
                </h5>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1565c0' }}>
                  <li style={{ marginBottom: '0.5rem' }}>Los precios pueden variar según la cantidad solicitada</li>
                  <li style={{ marginBottom: '0.5rem' }}>Descuentos especiales para trabajos de gran volumen</li>
                  <li style={{ marginBottom: '0.5rem' }}>Consulte por servicios no listados</li>
                  <li>Precios sujetos a cambios sin previo aviso</li>
                </ul>
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/pedido-personalizado" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', background: '#0d6efd', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '1.0625rem', boxShadow: '0 4px 12px rgba(13, 110, 253, 0.3)' }}>
                  <i className="fas fa-upload"></i>Realizar Pedido
                </Link>
              </div>

              {/* Cards de servicios */}
              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#343a40', textAlign: 'center' }}>Nuestros Servicios</h3>
                <div className="row g-3">
                  {[
                    { icon: 'fa-copy', title: 'Fotocopias', desc: 'Blanco y negro o color, simple o doble faz', bg: '#e3f2fd', color: '#0d6efd' },
                    { icon: 'fa-print', title: 'Impresiones', desc: 'Alta calidad en diversos formatos', bg: '#e8f5e9', color: '#2e7d32' },
                    { icon: 'fa-book', title: 'Encuadernación', desc: 'Anillado, espiralado y más', bg: '#fff3e0', color: '#e65100' }
                  ].map((service, i) => (
                    <div key={i} className="col-md-4">
                      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%' }}>
                        <div style={{ width: '60px', height: '60px', background: service.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: service.color, fontSize: '1.5rem' }}>
                          <i className={`fas ${service.icon}`}></i>
                        </div>
                        <h5 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{service.title}</h5>
                        <p style={{ color: '#6c757d', fontSize: '0.875rem', margin: 0 }}>{service.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Precios;