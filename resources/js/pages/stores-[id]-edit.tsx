import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/layouts/app-layout';
import type { StoreForm } from '@/types/store';
import { apiFetch } from '@/lib/utils';

export default function StoreEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreForm & { city_id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/customer/stores/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch store');
        const data = await res.json();
        setStore({
          store_username: data.data?.store_username || '',
          name: data.data?.name || '',
          description: data.data?.description || '',
          logo_url: data.data?.logo_url || '',
          city: data.data?.city || '',
          city_id: data.data?.city_id ? String(data.data.city_id) : '',
          contact_phone: data.data?.contact_phone || '',
          address: data.data?.address || '',
        });
        setLogoPreview(data.data?.logo_url || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // Fetch cities
    apiFetch('/api/cities')
      .then(res => res.json())
      .then(data => setCities(data.data || data))
      .catch(() => setCities([]));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!store) return;
    setStore({ ...store, [e.target.name]: e.target.value });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!store) return;
    setStore({ ...store, city_id: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
      if (store) setStore({ ...store, logo_url: '' }); // Clear logo_url if uploading new
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await apiFetch(`/api/customer/stores/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...store,
          city_id: store?.city_id || '',
        }),
      });
      if (!res.ok) throw new Error('Failed to update store');
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/stores'), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Car Stores', href: '/dashboard/stores' },
      { title: 'Edit Store', href: `/stores/${id}/edit` }
    ]}>
      <div className="p-6 max-w-3xl text-left">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Edit Store</h1>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500 mb-4">{error}</div>
          ) : store ? (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <label className="block mb-1 font-medium">Store Username (optional)</label>
                <input
                  type="text"
                  name="store_username"
                  value={store.store_username}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., downtown_rental"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={store.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={store.description || ''}
                  onChange={handleChange}
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
                <label className="block mb-1 font-medium">City</label>
                <select
                  name="city_id"
                  value={store.city_id || ''}
                  onChange={handleCityChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="" disabled>Select a city</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Contact Phone (optional)</label>
                <input
                  type="text"
                  name="contact_phone"
                  value={store.contact_phone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., +1234567890"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium">Address (optional)</label>
                <textarea
                  name="address"
                  value={store.address || ''}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                  placeholder="e.g., 123 Main St, City"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#7e246c] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#6a1f5c] transition cursor-pointer"
                  disabled={saving}
                  style={{ pointerEvents: saving ? 'none' : 'auto' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {success && <div className="text-green-600 mt-2 ml-4 self-center">Store updated!</div>}
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
} 