import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthContext';
import CarListing from './pages/car-listing';
import CarDetail from './pages/car-detail';
import Bookings from './pages/bookings';
import Chat from './pages/chat';
import Dashboard from './pages/dashboard';
import Welcome from './pages/welcome';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/cars" element={<CarListing />} />
          <Route path="/car-detail/:id" element={<CarDetail />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more routes as needed */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const rootElement = document.getElementById('app') || document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
