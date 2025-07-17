import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function EditCarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    async function fetchCar() {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/cars/${id}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            name: data.name || '',
            brand_id: data.brand_id || '',
            type_id: data.type_id || '',
            transmission: data.transmission || '',
            fuel_type: data.fuel_type || '',
            seats: data.seats || '',
            price: data.price || '',
            image: data.image || '',
          });
        } else {
          setError('Car not found');
        }
      } catch (e) {
        console.error(e);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchCar();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/cars/${id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to update car');
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
    <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800/80 rounded-lg shadow-lg p-8 w-full max-w-lg space-y-6 border border-gray-100 dark:border-neutral-800">
        <h1 className="text-2xl font-bold text-[#7e246c] dark:text-white mb-4">Edit Car</h1>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Brand ID</label>
          <input name="brand_id" value={form.brand_id} onChange={handleChange} required className="w-full px-3 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Type ID</label>
          <input name="type_id" value={form.type_id} onChange={handleChange} required className="w-full px-3 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Transmission</label>
          <input name="transmission" value={form.transmission} onChange={handleChange} required className="w-full px-3 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Fuel Type</label>
          <input name="fuel_type" value={form.fuel_type} onChange={handleChange} required className="w-full px-3 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Seats</label>
          <input name="seats" value={form.seats} onChange={handleChange} required className="w-full px-3 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Price (per day)</label>
          <input name="price" value={form.price} onChange={handleChange} required className="w-full px-3 py-2 rounded border" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Image URL</label>
          <input name="image" value={form.image} onChange={handleChange} className="w-full px-3 py-2 rounded border" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
      </form>
    </div>
  );
} 