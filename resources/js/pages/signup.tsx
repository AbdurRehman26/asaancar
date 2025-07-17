import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import Navbar from '../components/navbar';
import DarkModeToggle from '../components/ui/dark-mode-toggle';

const roles = [
  { value: 'user', label: 'User' },
  { value: 'store_owner', label: 'Store Owner' },
];

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          role,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Registration failed');
      } else {
        setSuccess(true);
      }
    } catch (e) {
      console.error(e);
      setError('Network error' + e);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800/80 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-[#7e246c] dark:text-white">Check your email</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">A verification link has been sent to <span className="font-semibold">{email}</span>. Please verify your email to continue.</p>
          <button className="mt-4 px-6 py-2 rounded bg-[#7e246c] text-white font-semibold" onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      <div className="absolute top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      <Navbar />
      {/* Left: Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white dark:bg-gray-900 mt-20">
        <div className="max-w-md w-full mx-auto">
          {/* Logo and Headline */}
          <div className="flex items-center gap-2 mb-6">
            <svg className="h-8 w-8 text-[#7e246c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
            </svg>
            <span className="text-2xl font-bold text-[#7e246c] dark:text-white">AsaanCar</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Get Started with AsaanCar</h1>
          <p className="text-gray-500 dark:text-gray-300 mb-6">Create your account</p>
          {/* Step Indicator */}
          <div className="mb-6 text-sm text-[#7e246c] font-semibold">Step 1 of 1</div>
          {/* Section Title */}
          <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Account Information</div>
          {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base" placeholder="Enter your name" />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base" placeholder="Enter your email" />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base" placeholder="Enter your password" />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
              <input type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base" placeholder="Confirm your password" />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base">
                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full py-3 rounded-lg bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition text-base" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
          </form>
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
