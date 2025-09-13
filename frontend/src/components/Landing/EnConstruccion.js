// frontend/src/components/EnConstruccion/EnConstruccion.js
import React, { useEffect, useState } from 'react';

const EnConstruccion = () => {
  const [titleText, setTitleText] = useState('');
  const fullTitle = 'Rumbos Gráfica & Copias';
  
  useEffect(() => {
    // Efecto de escritura animada
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullTitle.length) {
        setTitleText(fullTitle.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    animatedBg: {
      position: 'absolute',
      width: '200%',
      height: '200%',
      background: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 255, 255, 0.03) 10px,
        rgba(255, 255, 255, 0.03) 20px
      )`,
      animation: 'move 20s linear infinite'
    },
    mainCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '50px 40px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      maxWidth: '600px',
      width: '100%',
      textAlign: 'center',
      position: 'relative',
      zIndex: 1,
      animation: 'fadeIn 0.8s ease-out'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '30px',
      minHeight: '60px'
    },
    constructionBadge: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white',
      padding: '15px 30px',
      borderRadius: '50px',
      display: 'inline-block',
      fontSize: '1.2rem',
      fontWeight: '600',
      margin: '20px 0',
      boxShadow: '0 5px 15px rgba(245, 87, 108, 0.4)',
      animation: 'pulse 2s infinite'
    },
    message: {
      color: '#555',
      fontSize: '1.1rem',
      lineHeight: '1.6',
      margin: '20px 0'
    },
    loadingBar: {
      width: '100%',
      height: '4px',
      background: '#f0f0f0',
      borderRadius: '2px',
      margin: '30px 0 10px',
      overflow: 'hidden'
    },
    loadingProgress: {
      height: '100%',
      background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
      backgroundSize: '200% 100%',
      animation: 'loading 2s ease-in-out infinite',
      width: '100%'
    },
    contactSection: {
      marginTop: '40px',
      paddingTop: '30px',
      borderTop: '2px solid #f0f0f0'
    },
    contactTitle: {
      color: '#2c3e50',
      marginBottom: '20px',
      fontSize: '1.3rem'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '15px 0',
      transition: 'transform 0.3s ease'
    },
    contactIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '15px',
      fontSize: '1.1rem'
    },
    contactLink: {
      color: '#555',
      textDecoration: 'none',
      fontSize: '1.05rem',
      transition: 'color 0.3s ease'
    },
    whatsappBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      background: '#25D366',
      color: 'white',
      padding: '12px 25px',
      borderRadius: '50px',
      textDecoration: 'none',
      marginTop: '20px',
      fontWeight: '600',
      fontSize: '1.1rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 5px 15px rgba(37, 211, 102, 0.3)',
      border: 'none',
      cursor: 'pointer'
    },
    floatingIcon: {
      position: 'absolute',
      color: 'rgba(255, 255, 255, 0.1)',
      fontSize: '2rem',
      animation: 'float 15s infinite',
      zIndex: 0
    }
  };

  // Estilos para animaciones
  const animationStyles = `
    @keyframes move {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      33% { transform: translateY(-20px) rotate(120deg); }
      66% { transform: translateY(20px) rotate(240deg); }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `;

  return (
    <>
      <style>{animationStyles}</style>
      <div style={styles.container}>
        <div style={styles.animatedBg}></div>
        
        {/* Iconos flotantes decorativos */}
        <i className="fas fa-cog" style={{...styles.floatingIcon, top: '10%', left: '10%', animationDelay: '0s'}}></i>
        <i className="fas fa-wrench" style={{...styles.floatingIcon, top: '70%', right: '10%', animationDelay: '5s'}}></i>
        <i className="fas fa-hammer" style={{...styles.floatingIcon, bottom: '10%', left: '50%', animationDelay: '10s'}}></i>
        
        <div style={styles.mainCard}>
          <h1 style={styles.title}>{titleText}</h1>
          
          {/* Icono de construcción SVG */}
          <svg width="200" height="150" viewBox="0 0 200 150" style={{ margin: '20px 0', animation: 'bounce 2s infinite' }}>
            <rect x="10" y="80" width="180" height="50" fill="#FFC107" rx="5"/>
            <path d="M10 85 L35 130 L55 130 L30 85 Z" fill="#333"/>
            <path d="M50 85 L75 130 L95 130 L70 85 Z" fill="#333"/>
            <path d="M90 85 L115 130 L135 130 L110 85 Z" fill="#333"/>
            <path d="M130 85 L155 130 L175 130 L150 85 Z" fill="#333"/>
            <path d="M170 85 L190 125 L190 130 L175 130 Z" fill="#333"/>
            <rect x="70" y="20" width="60" height="60" fill="#FFC107" transform="rotate(45 100 50)"/>
            <text x="100" y="53" textAnchor="middle" fontFamily="Arial" fontSize="10" fontWeight="bold" fill="#333">EN</text>
            <text x="100" y="65" textAnchor="middle" fontFamily="Arial" fontSize="8" fill="#333">TRABAJO</text>
            <path d="M30 80 L35 60 L40 80 Z" fill="#FF5722"/>
            <path d="M160 80 L165 60 L170 80 Z" fill="#FF5722"/>
            <rect x="32" y="65" width="6" height="1" fill="#FFF"/>
            <rect x="32" y="70" width="6" height="1" fill="#FFF"/>
            <rect x="162" y="65" width="6" height="1" fill="#FFF"/>
            <rect x="162" y="70" width="6" height="1" fill="#FFF"/>
          </svg>
          
          <div style={styles.constructionBadge}>
            🚧 SITIO EN CONSTRUCCIÓN 🚧
          </div>
          
          <p style={styles.message}>
            Estamos trabajando para brindarte una mejor experiencia.<br/>
            Nuestro nuevo sitio web estará disponible muy pronto.
          </p>
          
          <div style={styles.loadingBar}>
            <div style={styles.loadingProgress}></div>
          </div>
          
          <div style={styles.contactSection}>
            <h3 style={styles.contactTitle}>📞 Contáctanos</h3>
            
            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>
                <i className="fas fa-envelope"></i>
              </div>
              <a href="mailto:info@graficalosrumbos.com" style={styles.contactLink}>
                info@graficalosrumbos.com
              </a>
            </div>
            
            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>
                <i className="fas fa-phone"></i>
              </div>
              <a href="tel:+541145678901" style={styles.contactLink}>
                +54 11 4567-8901
              </a>
            </div>
            
            <a 
              href="https://wa.me/5491125042343?text=Hola,%20quiero%20información%20sobre%20sus%20servicios" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.whatsappBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#20bd5a';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 211, 102, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#25D366';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(37, 211, 102, 0.3)';
              }}
            >
              <i className="fab fa-whatsapp" style={{ marginRight: '10px', fontSize: '1.3rem' }}></i>
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnConstruccion;