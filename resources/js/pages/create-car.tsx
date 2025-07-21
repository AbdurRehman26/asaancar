import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';

export default function CreateCarPage() {
  const navigate = useNavigate();
  // Form state
  const [form, setForm] = useState({
    name: '',
    brand_id: '',
    type_id: '',
    engine_id: '',
    transmission: '',
    fuel_type: '',
    seats: '',
    price: '',
    year: '',
    color: '',
    description: '',
    image: '', // keep as string for URL if needed
  });
  // Data state
  const [carBrands, setCarBrands] = useState<{ id: number; name: string }[]>([]);
  const [carTypes, setCarTypes] = useState<{ id: number; name: string }[]>([]);
  const [carEngines, setCarEngines] = useState<{ id: number; name: string }[]>([]);
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [brandsRes, typesRes, enginesRes] = await Promise.all([
          apiFetch('/api/customer/car-brands'),
          apiFetch('/api/customer/car-types'),
          apiFetch('/api/customer/car-engines'),
        ]);
        const brandsData = await brandsRes.json();
        const typesData = await typesRes.json();
        const enginesData = await enginesRes.json();
        setCarBrands(brandsData.data || []);
        setCarTypes(typesData.data || []);
        setCarEngines(enginesData.data || []);
      } catch (e) {
        setError('Failed to load car form data');
      }
    }
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let body: any = {};
      if (imageFile) {
        body = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          body.append(key, value);
        });
        body.append('image', imageFile);
      } else {
        body = JSON.stringify(form);
      }
      const res = await apiFetch('/api/customer/cars', {
        method: 'POST',
        body,
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to create car');
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard/cars'), 1000);
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Cars', href: '/dashboard/cars' },
      { title: 'Add Car', href: '/create-car' },
    ]}>
      <div className="p-6 max-w-3xl text-left ml-0">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Add New Car</h1>
          {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
                placeholder="e.g., Honda Civic"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Brand</label>
              <select
                name="brand_id"
                value={form.brand_id}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="" disabled>Select a brand</option>
                {carBrands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Type</label>
              <select
                name="type_id"
                value={form.type_id}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="" disabled>Select a type</option>
                {carTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Engine</label>
              <select
                name="engine_id"
                value={form.engine_id}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="" disabled>Select an engine</option>
                {carEngines.map(engine => (
                  <option key={engine.id} value={engine.id}>{engine.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Year</label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                placeholder="e.g., 2023"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Color</label>
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
                placeholder="e.g., Blue"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Number of Seats</label>
              <input
                type="number"
                name="seats"
                value={form.seats}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
                min="1"
                max="20"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Transmission</label>
              <select
                name="transmission"
                value={form.transmission}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="" disabled>Select transmission</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Fuel Type</label>
              <select
                name="fuel_type"
                value={form.fuel_type}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="" disabled>Select fuel type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Describe the car's features, condition, and any special notes..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Car Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border rounded px-3 py-2"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Car Preview"
                  className="mt-2 h-20 rounded border object-contain bg-gray-50 dark:bg-gray-800"
                />
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Price (per day)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
                min="0"
                placeholder="e.g., 5000"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#7e246c] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#6a1f5c] transition"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Add Car'}
              </button>
              {success && <div className="text-green-600 mt-2 ml-4 self-center">Car created successfully!</div>}
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
} 