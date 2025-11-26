import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { apiFetch } from '@/lib/utils';
import Navbar from '../components/navbar';

type AuthMethod = 'otp' | 'password';

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('otp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  // Check if user just verified their email
  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      // Show success message for email verification
      setError(null);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (authMethod === 'otp') {
        // OTP login flow
        const res = await apiFetch('/api/send-login-otp', {
          method: 'POST',
          body: JSON.stringify({
            phone_number: '+92' + phoneNumber,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Failed to send OTP');
          showError('OTP Failed', data.message || '');
        } else {
          setOtpSent(true);
          setIdentifier(data.identifier);
        }
      } else {
        // Password login flow
        const res = await apiFetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({
            login_method: 'password',
            phone_number: '+92' + phoneNumber,
            password: password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Login failed');
          showError('Login Failed', data.message || '');
        } else {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setUser(data.user?.data || data.user);
          showSuccess('Login Successful', 'Welcome back!');
          navigate('/');
        }
      }
    } catch (e) {
      console.error(e);
      setError('Network error: ' + e);
      showError('Network Error', 'Unable to connect. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      const res = await apiFetch('/api/verify-login-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier,
          otp,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'OTP verification failed');
        showError('Verification Failed', data.message || '');
      } else {
        // Store token and user
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user?.data || data.user);
        showSuccess('Login Successful', 'Welcome back! You have been logged in successfully.');
        navigate('/');
      }
    } catch (e) {
      console.error(e);
      setError('Network error: ' + e);
      showError('Network Error', 'Unable to connect. Please check your internet connection and try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (otpSent) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white dark:bg-gray-900 md:pt-0 pt-16">
          <div className="max-w-md w-full mx-auto">
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Verify Your Phone</h1>
            <p className="text-gray-500 dark:text-gray-300 mb-6">
              We've sent a 6-digit OTP to your phone number
            </p>
            {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm">{error}</div>}
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition text-base cursor-pointer"
                disabled={verifying || otp.length !== 6}
                style={{ pointerEvents: verifying || otp.length !== 6 ? 'none' : 'auto' }}
              >
                {verifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-[#7e246c] hover:underline font-semibold"
                onClick={() => setOtpSent(false)}
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-white dark:bg-gray-900 p-12 relative">
          <div className="max-w-lg w-full text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Verify Your Login</h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">Enter the OTP sent to your phone number to complete login</p>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/images/car-2.png"
                alt="Car rental illustration"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Navbar />
      {/* Left: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white dark:bg-gray-900 md:pt-0 pt-16">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-300 mb-6">Log in to your account</p>

          {searchParams.get('verified') === '1' && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                  Account verified successfully! You can now log in to your account.
                </span>
              </div>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Authentication method</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod('otp')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition ${
                    authMethod === 'otp'
                      ? 'bg-[#7e246c] text-white border-[#7e246c]'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  OTP
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('password')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition ${
                    authMethod === 'password'
                      ? 'bg-[#7e246c] text-white border-[#7e246c]'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Password
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Phone Number</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <span className="text-xl">🇵🇰</span>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">+92</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full pl-20 pr-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base"
                  placeholder="3001234567"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter your 10-digit phone number without the country code</p>
            </div>
            {authMethod === 'password' && (
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base"
                  placeholder="Enter your password"
                />
              </div>
            )}
            {error && <div className="mt-3 text-red-600 text-center text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition text-base cursor-pointer"
              disabled={loading}
              style={{ pointerEvents: loading ? 'none' : 'auto' }}
            >
              {loading 
                ? (authMethod === 'otp' ? 'Sending OTP...' : 'Logging in...')
                : (authMethod === 'otp' ? 'Send OTP' : 'Login')
              }
            </button>
          </form>
          {/* Signup Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600 dark:text-gray-300">Don't have an account? </span>
            <a href="/signup" className="text-[#7e246c] hover:underline font-semibold">
              Sign up
            </a>
          </div>
        </div>
      </div>
      {/* Right: Car Image */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-white dark:bg-gray-900 p-12 relative">
        <div className="max-w-lg w-full text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to AsaanCar</h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">Your trusted partner for seamless car rental experiences</p>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/images/car-2.png"
              alt="Car rental illustration"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
