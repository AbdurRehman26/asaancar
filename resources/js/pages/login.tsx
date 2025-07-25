import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import Navbar from '../components/navbar';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError(authError || 'Login failed');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(false);
    setForgotLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (!res.ok) {
        const err = await res.json();
        setForgotError(err.message || 'Request failed');
      } else {
        setForgotSuccess(true);
      }
    } catch {
      setForgotError('Network error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Navbar />
      {/* Left: Login or Forgot Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white dark:bg-gray-900 md:pt-0 pt-16">
        <div className="max-w-md w-full mx-auto">
          {/* Logo and Headline */}
          <div className="flex items-center gap-2 mb-6">
            <svg className="h-8 w-8 text-[#7e246c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
            </svg>
            <span className="text-2xl font-bold text-[#7e246c] dark:text-white">AsaanCar</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-300 mb-6">Log in to your account</p>
          {!showForgot ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base" placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#7e246c] focus:outline-none"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="mt-2 text-right">
                    <button type="button" className="text-sm text-[#7e246c] hover:underline" onClick={() => setShowForgot(true)}>
                      Forgot password?
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition text-base cursor-pointer"
                  disabled={loading}
                  style={{ pointerEvents: loading ? 'none' : 'auto' }}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
                {error && <div className="mt-3 text-red-600 text-center">{error}</div>}
              </form>
              {/* Signup Link */}
              <div className="mt-6 text-center">
                <span className="text-gray-600 dark:text-gray-300">Don't have an account? </span>
                <a href="/signup" className="text-[#7e246c] hover:underline font-semibold">
                  Sign up
                </a>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Email</label>
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base" placeholder="Enter your email" />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition text-base cursor-pointer"
                  disabled={forgotLoading}
                  style={{ pointerEvents: forgotLoading ? 'none' : 'auto' }}
                >
                  {forgotLoading ? 'Sending...' : 'Email password reset link'}
                </button>
                {forgotError && <div className="mt-3 text-red-600 text-center">{forgotError}</div>}
                {forgotSuccess && <div className="mt-3 text-green-600 text-center">Reset link sent!</div>}
              </form>
              <div className="mt-6 text-center">
                <button type="button" className="text-[#7e246c] hover:underline font-semibold" onClick={() => setShowForgot(false)}>
                  Back to login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Right: Marketing/Visual Content */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-12 relative">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold mb-4">Empower Your Car Rental Experience</h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">From booking to management, AsaanCar gives you everything you need in one intuitive platform.</p>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-neutral-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
            {/* Placeholder for app screenshot or illustration */}
            <div className="h-64 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">[ App Screenshot / Illustration ]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 