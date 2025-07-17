import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

export default function CreateCarPage() {
  const [searchParams] = useSearchParams();
  const storeIdParam = searchParams.get('store_id');
  const navigate = useNavigate();
  const [stores, setStores] = useState<{ id: string; name: string; address?: string }[]>([]);
  const [selectedStore, setSelectedStore] = useState<{ id: string; name: string; address?: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    brand_id: '',
    type_id: '',
    transmission: '',
    fuel_type: '',
    seats: '',
    price: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch stores for the user
    fetch('/api/customer/stores', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        setStores(data.data || []);
        // Set default selected store
        if (data.data && data.data.length > 0) {
          const defaultStore = data.data.find((s: { id: string; name: string }) => String(s.id) === String(storeIdParam)) || data.data[0];
          setSelectedStore(defaultStore);
        }
      });
  }, [storeIdParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/cars', {
        method: 'POST',
        body: JSON.stringify({ ...form, store_id: selectedStore?.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to create car');
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      console.error(e);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Add Car', href: '/create-car' }]}> 
      <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
        {/* Store Dropdown (dashboard style) */}
        <div className="flex items-center gap-4 mb-8 w-full max-w-lg">
          <div className="relative">
            <button
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold flex items-center gap-2"
              onClick={() => setStoreDropdownOpen((v: boolean) => !v)}
              type="button"
            >
              {selectedStore ? selectedStore.name : 'Select Store'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {storeDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-10">
                <ul>
                  {stores.map((store: { id: string; name: string }) => (
                    <li key={store.id}>
                      <button
                        className={`w-full text-left px-4 py-2 hover:bg-[#7e246c]/10 ${selectedStore?.id === store.id ? 'bg-[#7e246c]/20 font-bold' : ''}`}
                        onClick={() => { setSelectedStore(store); setStoreDropdownOpen(false); }}
                        type="button"
                      >
                        {store.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {selectedStore && (
            <div className="text-gray-700 dark:text-gray-200 font-medium">{selectedStore.address}</div>
          )}
        </div>
        {/* Car Form (two columns) */}
        {selectedStore && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800/80 rounded-lg shadow-lg p-8 w-full max-w-lg space-y-6 border-2 border-[#7e246c] dark:border-[#7e246c]">
            <h1 className="text-2xl font-bold text-[#7e246c] dark:text-white mb-4">Add New Car</h1>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-1">Name</label>
                <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 rounded border-2 border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] bg-white dark:bg-gray-800 text-black dark:text-white mb-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Brand ID</label>
                <input name="brand_id" value={form.brand_id} onChange={handleChange} required className="w-full px-3 py-2 rounded border-2 border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] bg-white dark:bg-gray-800 text-black dark:text-white mb-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Type ID</label>
                <input name="type_id" value={form.type_id} onChange={handleChange} required className="w-full px-3 py-2 rounded border-2 border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] bg-white dark:bg-gray-800 text-black dark:text-white mb-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Transmission</label>
                <input name="transmission" value={form.transmission} onChange={handleChange} required className="w-full px-3 py-2 rounded border-2 border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] bg-white dark:bg-gray-800 text-black dark:text-white mb-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Fuel Type</label>
                <input name="fuel_type" value={form.fuel_type} onChange={handleChange} required className="w-full px-3 py-2 rounded border-2 border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] bg-white dark:bg-gray-800 text-black dark:text-white mb-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Seats</label>
                <input name="seats" value={form.seats} onChange={handleChange} required className="w-full px-3 py-2 rounded border-2 border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] bg-white dark:bg-gray-800 text-black dark:text-white mb-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Price (per day)</label>
                <input name="price" value={form.price} onChange={handleChange} required className="w-full px-3 py-2 rounded border-2 border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] bg-white dark:bg-gray-800 text-black dark:text-white mb-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Image URL</label>
                <input name="image" value={form.image} onChange={handleChange} className="w-full px-3 py-2 rounded border-2 border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] bg-white dark:bg-gray-800 text-black dark:text-white mb-2" />
              </div>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>{loading ? 'Adding...' : 'Add Car'}</Button>
          </form>
        )}
      </div>
    </AppLayout>
  );
} 