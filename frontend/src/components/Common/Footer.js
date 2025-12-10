// frontend/src/components/Common/Footer.js
import React from 'react';

const Footer = ({ isAdmin = false }) => {
  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      borderTop: '1px solid #dee2e6',
      background: 'white',
      padding: '0.625rem 0',
      boxShadow: '0 -2px 4px rgba(0,0,0,0.05)'
    }}>
      <div className={isAdmin ? "container-fluid" : "container"}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6c757d' }}>
            © 2025 Gráfica Los Rumbos{isAdmin ? ' - Panel de Administración' : ''}
          </p>
          <a 
            href="https://simpleapps.com.ar" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8rem',
              color: '#6c757d',
              padding: '4px 10px',
              borderRadius: '15px',
              background: isAdmin ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#0d6efd';
              e.currentTarget.style.background = 'rgba(13, 110, 253, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6c757d';
              e.currentTarget.style.background = isAdmin ? 'rgba(0, 0, 0, 0.03)' : 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ opacity: 0.7 }}>powered by</span>
            <span style={{ 
              fontFamily: 'monospace', 
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              &lt;s/a&gt;
            </span>
            <span style={{ fontWeight: 500 }}>Simple Apps</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;