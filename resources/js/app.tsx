import '../css/app.css';

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { initializeTheme } from '@/hooks/use-appearance';
import Chat from './pages/chat';
import Dashboard from './pages/dashboard';
import AdminDashboard from './pages/admin-dashboard';
import Welcome from './pages/welcome';
import SignupPage from './pages/signup';
import LoginPage from './pages/login';
import { configureEcho } from '@laravel/echo-react';
import About from './pages/about';
import Contact from './pages/contact';
import PrivacyPolicy from './pages/privacy-policy';
import ResetPassword from './pages/auth/reset-password';
import EmailVerificationSuccess from './pages/email-verification-success';
import PickAndDropPage from './pages/dashboard/PickAndDrop';
import PickAndDropForm from './pages/dashboard/PickAndDropForm';
import PickAndDropListing from './pages/pick-and-drop-listing';
import PickAndDropDetail from './pages/pick-and-drop-detail';
import PickAndDropChat from './pages/dashboard/PickAndDropChat';
import NotificationsPage from './pages/notifications';

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
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/pick-and-drop" element={<PickAndDropListing />} />
            <Route path="/pick-and-drop/:id" element={<PickAndDropDetail />} />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
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

              <Route path="pick-and-drop-chat" element={<PickAndDropChat />} />
              <Route path="inquiries" element={<Dashboard.Inquiries />} />
              <Route path="pick-and-drop" element={<PickAndDropPage />} />
              <Route path="pick-and-drop/create" element={<PickAndDropForm />} />
              <Route path="profile" element={<Dashboard.Profile />} />
              <Route path="pick-and-drop/:id/edit" element={<PickAndDropForm />} />
            </Route>
            <Route path="/admin-dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
            <Route path="/reset-password/:token" element={<ResetPasswordWrapper />} />
            <Route path="/email/verify/:id/:hash" element={<EmailVerificationSuccess />} />
            <Route path="/api/email/verify/:id/:hash" element={<EmailVerificationSuccess />} />
            {/* Add more routes as needed */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

const rootElement = document.getElementById('app') || document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
