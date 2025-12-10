// frontend/src/components/Admin/Login.js
import React, { useState } from 'react';
import { authService } from '../../services/api';
import Footer from '../Common/Footer';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { token } = await authService.login(credentials.email, credentials.password);
      localStorage.setItem('token', token);
      onLogin();
    } catch (err) {
      setError('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Header simple */}
      <header style={{ padding: '1rem 0' }}>
        <div className="container">
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <div style={{ width: '44px', height: '44px', background: '#0d6efd', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem' }}>
              <i className="fas fa-print"></i>
            </div>
            <span style={{ marginLeft: '0.75rem', fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>Gráfica Los Rumbos</span>
          </a>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', paddingBottom: '80px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            {/* Header del card */}
            <div style={{ padding: '2rem 2rem 1.5rem', textAlign: 'center', background: '#f8f9fa', borderBottom: '2px solid #e5e7eb' }}>
              <div style={{ width: '70px', height: '70px', background: '#0d6efd', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 12px rgba(13, 110, 253, 0.3)' }}>
                <i className="fas fa-lock" style={{ fontSize: '2rem', color: 'white' }}></i>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#343a40' }}>Acceso Administrativo</h2>
              <p style={{ margin: '0.5rem 0 0', color: '#6c757d', fontSize: '0.9375rem' }}>Ingresa tus credenciales para continuar</p>
            </div>
            
            {/* Formulario */}
            <div style={{ padding: '2rem' }}>
              {error && (
                <div style={{ padding: '0.875rem 1rem', background: '#fee', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc3545' }}>
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#343a40', fontSize: '0.9375rem' }}>
                    <i className="fas fa-envelope" style={{ marginRight: '8px', color: '#6c757d' }}></i>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    placeholder="admin@ejemplo.com"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#343a40', fontSize: '0.9375rem' }}>
                    <i className="fas fa-key" style={{ marginRight: '8px', color: '#6c757d' }}></i>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: isLoading ? '#6c757d' : '#0d6efd',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s',
                    boxShadow: isLoading ? 'none' : '0 4px 12px rgba(13, 110, 253, 0.3)'
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      Iniciar Sesión
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Link de volver */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
              <i className="fas fa-arrow-left"></i>
              Volver al sitio web
            </a>
          </div>
        </div>
      </main>

      <Footer isAdmin={true} />
    </div>
  );
};

export default Login; 