import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';

export default function CreateStorePage() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch('/api/stores', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Store creation failed');
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800/80 rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-[#7e246c] dark:text-white">Create Your Store</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">Enter your store name to get started, or skip for now.</p>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Store Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 rounded border border-[#7e246c] bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]" />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="w-full py-3 rounded bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition" disabled={loading}>{loading ? 'Creating...' : 'Create Store'}</button>
          <button type="button" onClick={handleSkip} className="w-full py-3 rounded bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Skip</button>
        </div>
        {success && <div className="mt-4 text-green-600 text-center">Store created! Redirecting...</div>}
      </form>
    </div>
  );
} 