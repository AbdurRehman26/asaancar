import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import Navbar from '../components/navbar';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

type SignupStep = 'info' | 'otp' | 'password' | 'complete';

export default function SignupPage() {
  const [step, setStep] = useState<SignupStep>('info');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [wantsPassword, setWantsPassword] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch('/api/send-signup-otp', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: '+92' + phoneNumber,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to send OTP');
      } else {
        const data = await res.json();
        setIdentifier(data.identifier);
        setStep('otp');
      }
    } catch (e) {
      console.error(e);
      setError('Network error: ' + e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch('/api/verify-signup-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier,
          otp,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'OTP verification failed');
      } else {
        const data = await res.json();
        // If user already exists, they're logged in - redirect to home
        if (data.is_existing_user && data.token && data.user) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setUser(data.user);
          navigate('/');
        } else {
          // New user - proceed to password step
          setStep('password');
        }
      }
    } catch (e) {
      console.error(e);
      setError('Network error: ' + e);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch('/api/set-password', {
        method: 'POST',
        body: JSON.stringify({
          identifier,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to set password');
      } else {
        handleCompleteSignup(true);
      }
    } catch (e) {
      console.error(e);
      setError('Network error: ' + e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async (hasPassword: boolean) => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          phone_number: '+92' + phoneNumber,
          password: hasPassword ? password : null,
          password_confirmation: hasPassword ? passwordConfirmation : null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Registration failed');
      } else {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setUser(data.user);
          // Automatically redirect to home after successful signup
          navigate('/');
        } else {
          setStep('complete');
        }
      }
    } catch (e) {
      console.error(e);
      setError('Network error: ' + e);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800/80 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-[#7e246c] dark:text-white">Account Created!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Your account has been successfully created.</p>
          <button className="mt-4 px-6 py-2 rounded bg-[#7e246c] text-white font-semibold" onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
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
                disabled={loading || otp.length !== 6}
                style={{ pointerEvents: loading || otp.length !== 6 ? 'none' : 'auto' }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-[#7e246c] hover:underline font-semibold"
                onClick={() => setStep('info')}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white dark:bg-gray-900 md:pt-0 pt-16">
          <div className="max-w-md w-full mx-auto">
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Set Password (Optional)</h1>
            <p className="text-gray-500 dark:text-gray-300 mb-6">
              Would you like to set a password for your account? You can skip this and set it later.
            </p>
            {wantsPassword === null ? (
              <div className="space-y-4">
                <button
                  onClick={() => setWantsPassword(true)}
                  className="w-full py-3 rounded-lg bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition"
                >
                  Yes, set a password
                </button>
                <button
                  onClick={() => handleCompleteSignup(false)}
                  className="w-full py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Skip for now'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSetPassword} className="space-y-4">
                {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm">{error}</div>}
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
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirmation ? 'text' : 'password'}
                      value={passwordConfirmation}
                      onChange={e => setPasswordConfirmation(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base pr-12"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#7e246c] focus:outline-none"
                      onClick={() => setShowPasswordConfirmation((v) => !v)}
                    >
                      {showPasswordConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition"
                  disabled={loading}
                >
                  {loading ? 'Setting password...' : 'Set Password & Complete'}
                </button>
                <button
                  type="button"
                  onClick={() => handleCompleteSignup(false)}
                  className="w-full py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  disabled={loading}
                >
                  Skip
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white dark:bg-gray-900 md:pt-0 pt-16">
        <div className="max-w-md w-full mx-auto">
          <div className="mt-24">
            <p className="text-gray-500 dark:text-gray-300 mb-6">Create your account</p>
            <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Account Information</div>
            {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm">{error}</div>}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base" placeholder="Enter your name" />
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
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition text-base cursor-pointer"
                disabled={loading}
                style={{ pointerEvents: loading ? 'none' : 'auto' }}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <span className="text-gray-600 dark:text-gray-300">Already have an account? </span>
              <a href="/login" className="text-[#7e246c] hover:underline font-semibold">
                Log in
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-white dark:bg-gray-900 p-12 relative">
        <div className="max-w-lg w-full text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Join AsaanCar Today</h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">Start your journey with the best car rental platform</p>
          <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
            <img 
              src="/images/car-2.png" 
              alt="Car rental illustration" 
              className="w-full h-auto object-contain"
            />
          </div>
          {/* Play Store Download Button */}
          <a
            href="https://play.google.com/store/apps/details?id=com.asaancar.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
          >
            <img
              src="/google-play-download-android-app-logo.svg"
              alt="Get it on Google Play"
              className="h-40 w-auto sm:h-48"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
