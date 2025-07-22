import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.current_password) errs.current_password = 'Current password is required.';
    if (!form.new_password) errs.new_password = 'New password is required.';
    if (form.new_password.length < 8) errs.new_password = 'Password must be at least 8 characters.';
    if (form.new_password !== form.confirm_password) errs.confirm_password = 'Passwords do not match.';
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    const validationErrs = validate();
    if (Object.keys(validationErrs).length) {
      setErrors(validationErrs);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
          new_password_confirmation: form.confirm_password,
        }),
      });
      if (res.ok) {
        setSuccess('Password changed successfully!');
        setForm({ current_password: '', new_password: '', confirm_password: '' });
        setErrors({});
      } else if (res.status === 422) {
        const data = await res.json();
        const filtered: Record<string, string> = {};
        if (data.errors) {
          Object.entries(data.errors).forEach(([k, v]) => {
            if (typeof v === 'string') {
              filtered[k] = v;
            } else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') {
              filtered[k] = v[0];
            }
          });
        }
        setErrors(filtered);
      } else {
        setErrors({ current_password: 'Failed to change password. Please try again.' });
      }
    } catch {
      setErrors({ current_password: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <title>Change Password - AsaanCar</title>
      <Navbar auth={{ user }} />
      <main className="bg-neutral-50 dark:bg-gray-900 min-h-screen">
        <section className="max-w-lg mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold text-[#7e246c] mb-6">Change Password</h1>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800/80 p-8 rounded-xl shadow border border-neutral-200 dark:border-neutral-700">
            <div>
              <label htmlFor="current_password" className="block text-sm font-semibold mb-1 text-gray-900 dark:text-white">Current Password</label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                className="w-full border border-[#7e246c] rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]"
                required
              />
              {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password}</p>}
            </div>
            <div>
              <label htmlFor="new_password" className="block text-sm font-semibold mb-1 text-gray-900 dark:text-white">New Password</label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={form.new_password}
                onChange={handleChange}
                className="w-full border border-[#7e246c] rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]"
                required
              />
              {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>}
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-semibold mb-1 text-gray-900 dark:text-white">Confirm New Password</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                className="w-full border border-[#7e246c] rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]"
                required
              />
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#7e246c] text-white font-semibold px-6 py-3 rounded-md hover:bg-[#6a1f5c] transition shadow cursor-pointer"
              style={{ pointerEvents: loading ? 'none' : 'auto' }}
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
            {success && <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded mt-4">{success}</div>}
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
} 