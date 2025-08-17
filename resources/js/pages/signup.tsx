import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import Navbar from '../components/navbar';
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
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
    <div className="min-h-screen flex flex-col md:flex-row">
      <Navbar />
      {/* Left: Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white dark:bg-gray-900 md:pt-0 pt-16">
        <div className="max-w-md w-full mx-auto">

          <div className="mt-24">
          <p className="text-gray-500 dark:text-gray-300 mb-6">Create your account</p>
          {/* Step Indicator */}
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
                  aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
                >
                  {showPasswordConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-[#7e246c] bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] text-base">
                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition text-base cursor-pointer"
              disabled={loading}
              style={{ pointerEvents: loading ? 'none' : 'auto' }}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600 dark:text-gray-300">Already have an account? </span>
            <a href="/login" className="text-[#7e246c] hover:underline font-semibold">
              Log in
            </a>
          </div>
          </div>
        </div>
      </div>
      {/* Right: Car Image */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-white dark:bg-gray-900 p-12 relative">
        <div className="max-w-lg w-full text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Join AsaanCar Today</h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">Start your journey with the best car rental platform</p>
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
