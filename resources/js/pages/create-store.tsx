import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';

export default function CreateStoreForm() {
  const [name, setName] = useState('');
  const [cityId, setCityId] = useState('');
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/cities')
      .then(res => res.json())
      .then(data => setCities(data.data || data))
      .catch(() => setCities([]));
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // For now, logo upload is UI only. To support backend upload, use FormData.
      const res = await apiFetch('/api/customer/stores', {
        method: 'POST',
        body: JSON.stringify({
          name,
          city_id: cityId ? Number(cityId) : undefined,
          description,
          ...(phone ? { phone } : {}),
          ...(address ? { address } : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Store creation failed');
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (e) {
      console.error(e);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl text-left">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Create Store</h1>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">City</label>
            <select
              value={cityId}
              onChange={e => setCityId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="" disabled>Select a city</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full border rounded px-3 py-2"
            />
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="mt-2 h-20 rounded border object-contain bg-gray-50 dark:bg-gray-800"
              />
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Address</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={2}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-[#7e246c] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#6a1f5c] transition"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Store'}
            </button>
            {success && <div className="text-green-600 mt-2 ml-4 self-center">Store created!</div>}
          </div>
        </form>
      </div>
    </div>
  );
} 