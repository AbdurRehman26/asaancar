import '../css/app.css';

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthContext';
import { initializeTheme } from '@/hooks/use-appearance';
import CarListing from './pages/car-listing';
import CarDetail from './pages/car-detail';
import Bookings from './pages/bookings';
import Chat from './pages/chat';
import Dashboard from './pages/dashboard';
import Welcome from './pages/welcome';
import SignupPage from './pages/signup';
import CreateStorePage from './pages/create-store';
import ProfilePage from './pages/profile';
import CreateCarPage from './pages/create-car';
import EditCarPage from './pages/edit-car';

function App() {
  useEffect(() => {
    // Initialize theme on app start
    initializeTheme();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/cars" element={<CarListing />} />
          <Route path="/car-detail/:id" element={<CarDetail />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Dashboard.Home />} />
            <Route path="cars" element={<Dashboard.CarListings />} />
            <Route path="messages" element={<Dashboard.Messages />} />
          </Route>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/create-store" element={<CreateStorePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-car" element={<CreateCarPage />} />
          <Route path="/edit-car/:id" element={<EditCarPage />} />
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
