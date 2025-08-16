import '../css/app.css';

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { initializeTheme } from '@/hooks/use-appearance';
import CarListing from './pages/car-listing';
import CarDetail from './pages/car-detail';
import CarDetailWithOffer from './pages/car-detail-with-offer';
import Bookings from './pages/bookings';
import Chat from './pages/chat';
import Dashboard from './pages/dashboard';
import DashboardStoresPage from './pages/dashboard-stores';
import Welcome from './pages/welcome';
import SignupPage from './pages/signup';
import CreateStoreForm from './pages/create-store';
import ProfilePage from './pages/profile';
import CreateCarPage from './pages/create-car';
import EditCarPage from './pages/edit-car';
import LoginPage from './pages/login';
import StoreEditPage from './pages/stores-[id]-edit';
import { configureEcho } from '@laravel/echo-react';
import About from './pages/about';
import Contact from './pages/contact';
import ResetPassword from './pages/auth/reset-password';
import EmailVerificationSuccess from './pages/email-verification-success';

configureEcho({
    broadcaster: 'pusher',
});

function ResetPasswordWrapper() {
  const { token } = useParams();
  const search = new URLSearchParams(useLocation().search);
  const email = search.get('email') || '';
  if (!token || !email) {
    return <div className="text-center mt-20 text-red-600">Invalid or expired reset link.</div>;
  }
  return <ResetPassword token={token} email={email} />;
}

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
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cars" element={<CarListing />} />
          <Route path="/car-detail/:id" element={<CarDetail />} />
          <Route path="/car-detail/:id/edit" element={<CarDetailWithOffer />} />
          <Route path="/bookings" element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard.Home />} />
            <Route path="cars" element={<Dashboard.CarListings />} />
            <Route path="messages" element={<Dashboard.Messages />} />
            <Route path="stores" element={<DashboardStoresPage />} />
            <Route path="create-store" element={<CreateStoreForm />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="store-bookings" element={<Dashboard.StoreBookings />} />
          </Route>
          <Route path="/dashboard/stores" element={
            <ProtectedRoute>
              <DashboardStoresPage />
            </ProtectedRoute>
          } />
          <Route path="/stores/:id/edit" element={
            <ProtectedRoute>
              <StoreEditPage />
            </ProtectedRoute>
          } />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/create-car" element={
            <ProtectedRoute>
              <CreateCarPage />
            </ProtectedRoute>
          } />
          <Route path="/edit-car/:id" element={
            <ProtectedRoute>
              <EditCarPage />
            </ProtectedRoute>
          } />
          <Route path="/reset-password/:token" element={<ResetPasswordWrapper />} />
          <Route path="/email/verify/:id/:hash" element={<EmailVerificationSuccess />} />
          <Route path="/api/email/verify/:id/:hash" element={<EmailVerificationSuccess />} />
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
