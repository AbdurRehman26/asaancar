import '../css/app.css';

import { AuthProvider } from '@/components/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ToastProvider } from '@/contexts/ToastContext';
import { initializeTheme } from '@/hooks/use-appearance';
import { configureEcho } from '@laravel/echo-react';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import About from './pages/about';
import AdminDashboard from './pages/admin-dashboard';
import ResetPassword from './pages/auth/reset-password';
import Chat from './pages/chat';
import Contact from './pages/contact';
import Dashboard from './pages/dashboard';
import PickAndDropPage from './pages/dashboard/PickAndDrop';
import PickAndDropChat from './pages/dashboard/PickAndDropChat';
import PickAndDropForm from './pages/dashboard/PickAndDropForm';
import RideRequestForm from './pages/dashboard/RideRequestForm';
import RideRequestsPage from './pages/dashboard/RideRequests';
import EmailVerificationSuccess from './pages/email-verification-success';
import LoginPage from './pages/login';
import NotificationsPage from './pages/notifications';
import PickAndDropDetail from './pages/pick-and-drop-detail';
import PickAndDropListing from './pages/pick-and-drop-listing';
import PrivacyPolicy from './pages/privacy-policy';
import RideRequestDetail from './pages/ride-request-detail';
import RideRequestListing from './pages/ride-request-listing';
import SignupPage from './pages/signup';
import Welcome from './pages/welcome';

configureEcho({
    broadcaster: 'pusher',
});

function ResetPasswordWrapper() {
    const { token } = useParams();
    const search = new URLSearchParams(useLocation().search);
    const email = search.get('email') || '';
    if (!token || !email) {
        return <div className="mt-20 text-center text-red-600">Invalid or expired reset link.</div>;
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
                        <Route path="/ride-requests" element={<RideRequestListing />} />
                        <Route path="/ride-requests/:id" element={<RideRequestDetail />} />
                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <NotificationsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Dashboard.Home />} />

                            <Route path="pick-and-drop-chat" element={<PickAndDropChat />} />
                            <Route path="inquiries" element={<Dashboard.Inquiries />} />
                            <Route path="pick-and-drop" element={<PickAndDropPage />} />
                            <Route path="pick-and-drop/create" element={<PickAndDropForm />} />
                            <Route path="ride-requests" element={<RideRequestsPage />} />
                            <Route path="ride-requests/create" element={<RideRequestForm />} />
                            <Route path="ride-requests/:id/edit" element={<RideRequestForm />} />
                            <Route path="profile" element={<Dashboard.Profile />} />
                            <Route path="pick-and-drop/:id/edit" element={<PickAndDropForm />} />
                        </Route>
                        <Route
                            path="/admin-dashboard"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
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
