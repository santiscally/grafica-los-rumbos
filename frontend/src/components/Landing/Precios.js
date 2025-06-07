// Crear archivo: frontend/src/components/Precios/Precios.js

import React from 'react';
import { Link } from 'react-router-dom';

const Precios = () => {
  const precios = [
    { servicio: 'Fotocopia A4 Blanco y Negro', precio: 5.00 },
    { servicio: 'Fotocopia A4 Color', precio: 25.00 },
    { servicio: 'Impresión A4 Blanco y Negro', precio: 10.00 },
    { servicio: 'Impresión A4 Color', precio: 30.00 },
    { servicio: 'Fotocopia A3 Blanco y Negro', precio: 10.00 },
    { servicio: 'Fotocopia A3 Color', precio: 45.00 },
    { servicio: 'Plastificado A4', precio: 50.00 },
    { servicio: 'Plastificado A3', precio: 80.00 },
    { servicio: 'Encuadernación Espiral (hasta 50 hojas)', precio: 150.00 },
    { servicio: 'Encuadernación Espiral (50-100 hojas)', precio: 200.00 },
    { servicio: 'Encuadernación Térmica', precio: 250.00 },
    { servicio: 'Escaneo de Documentos (por hoja)', precio: 5.00 },
    { servicio: 'Papel Fotográfico A4', precio: 50.00 },
    { servicio: 'Transparencias', precio: 40.00 }
  ];

  return (
    <div className="min-h-100vh bg-light">
      {/* Header */}
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
              <h2 className="display-5 fw-bold mb-3">Precios de Servicios Básicos</h2>
              <p className="text-muted lead">Precios actualizados - Consulte por trabajos especiales</p>
            </div>

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
                    {precios.map((item, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4">{item.servicio}</td>
                        <td className="py-3 px-4 text-end fw-bold text-primary">
                          ${item.precio.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
                Solicitar Presupuesto Personalizado
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Precios;