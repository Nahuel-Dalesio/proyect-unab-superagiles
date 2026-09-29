import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar'; // <-- Importamos la barra que creaste

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* El Navbar se dibuja arriba de todo y lee automáticamente el rol */}
        <Navbar /> 
        
        <div style={{ padding: '20px' }}>
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}



