// frontend/src/components/Common/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <>
      {/* Footer principal scrolleable */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <div className="footer-brand">
                <i className="fas fa-print"></i>
                <h4>Rumbos Grafica y Copias</h4>
              </div>
              <p>Tu centro de confianza para servicios de impresion y fotocopiado.</p>
            </div>
            
            <div className="footer-section">
              <h5>Contacto</h5>
              <ul className="footer-contact">
                <li>
                  <i className="fas fa-phone"></i>
                  <span>+54 11 4567-8901</span>
                </li>
                <li>
                  <i className="fas fa-envelope"></i>
                  <span>info@graficalosrumbos.com</span>
                </li>
                <li>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Buenos Aires, Argentina</span>
                </li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h5>Horarios</h5>
              <ul className="footer-hours">
                <li>
                  <span className="day">Lunes a Viernes</span>
                  <span className="time">9:00 - 19:00</span>
                </li>
                <li>
                  <span className="day">Sabados</span>
                  <span className="time">9:00 - 14:00</span>
                </li>
                <li>
                  <span className="day">Domingos</span>
                  <span className="time">Cerrado</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Barra de copyright fija - solo desktop */}
      <div className="footer-fixed-bar">
        <div className="footer-fixed-content">
          <p>&copy; 2025 Rumbos Grafica y Copias. Todos los derechos reservados.</p>
          <a 
            href="https://simpleapps.com.ar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="powered-by"
          >
            <span className="powered-text">powered by</span>
            <span className="powered-logo">&lt;s/a&gt;</span>
            <span className="powered-name">Simple Apps</span>
          </a>
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          background: #111827;
          color: white;
          padding: 3rem 0 2rem;
          margin-top: auto;
          margin-bottom: 56px;
        }

        @media (max-width: 991px) {
          .site-footer {
            margin-bottom: 0;
          }
        }

        .site-footer .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .footer-section h4,
        .footer-section h5 {
          color: white;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .footer-section h5 {
          font-size: 1rem;
          position: relative;
          padding-bottom: 0.75rem;
        }

        .footer-section h5::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: #0d6efd;
          border-radius: 2px;
        }

        .footer-section p {
          color: #9ca3af;
          line-height: 1.6;
          font-size: 0.9375rem;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .footer-brand i {
          font-size: 1.5rem;
          color: #0d6efd;
        }

        .footer-brand h4 {
          margin: 0;
          font-size: 1.125rem;
        }

        .footer-contact,
        .footer-hours {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-contact li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #9ca3af;
          margin-bottom: 0.75rem;
          font-size: 0.9375rem;
        }

        .footer-contact li i {
          width: 18px;
          color: #0d6efd;
        }

        .footer-hours li {
          display: flex;
          justify-content: space-between;
          color: #9ca3af;
          margin-bottom: 0.5rem;
          font-size: 0.9375rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .footer-hours li:last-child {
          border-bottom: none;
        }

        .footer-hours .day {
          color: #d1d5db;
        }

        .footer-hours .time {
          color: #0d6efd;
          font-weight: 500;
        }

        .footer-fixed-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #111827;
          border-top: 1px solid rgba(255,255,255,0.1);
          z-index: 800;
          padding: 0.875rem 1rem;
        }

        @media (max-width: 991px) {
          .footer-fixed-bar {
            display: none;
          }
        }

        .footer-fixed-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        .footer-fixed-bar p {
          color: #6b7280;
          margin: 0;
          font-size: 0.8125rem;
        }

        .powered-by {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          text-decoration: none;
          transition: all 0.3s;
        }

        .powered-by:hover {
          background: rgba(13,110,253,0.15);
          transform: translateY(-2px);
        }

        .powered-text {
          color: #6b7280;
          font-size: 0.6875rem;
        }

        .powered-logo {
          font-family: monospace;
          font-weight: 700;
          color: #0d6efd;
          font-size: 0.8125rem;
        }

        .powered-name {
          color: #9ca3af;
          font-weight: 500;
          font-size: 0.75rem;
        }

        .powered-by:hover .powered-name,
        .powered-by:hover .powered-text {
          color: #d1d5db;
        }
      `}</style>
    </>
  );
};

export default Footer;