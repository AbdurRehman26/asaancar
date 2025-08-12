import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import ImageUpload from '@/components/ImageUpload';

interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

export default function CreateCarPage() {
  const navigate = useNavigate();
  // Form state
  const [form, setForm] = useState({
    name: '',
    car_brand_id: '',
    car_type_id: '',
    car_engine_id: '',
    store_id: '',
    model: '',
    year: '',
    color: '',
    seats: '',
    transmission: '',
    fuel_type: '',
    description: '',
    with_driver_rate: '',
    without_driver_rate: '',
  });
  // Data state
  const [carBrands, setCarBrands] = useState<{ id: number; name: string }[]>([]);
  const [carTypes, setCarTypes] = useState<{ id: number; name: string }[]>([]);
  const [carEngines, setCarEngines] = useState<{ id: number; name: string }[]>([]);
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [brandsRes, typesRes, enginesRes, storesRes] = await Promise.all([
          apiFetch('/api/customer/car-brands'),
          apiFetch('/api/customer/car-types'),
          apiFetch('/api/customer/car-engines'),
          apiFetch('/api/customer/stores'),
        ]);
        const brandsData = await brandsRes.json();
        const typesData = await typesRes.json();
        const enginesData = await enginesRes.json();
        const storesData = await storesRes.json();
        setCarBrands(brandsData.data || []);
        setCarTypes(typesData.data || []);
        setCarEngines(enginesData.data || []);
        setStores(storesData.stores || []);
      } catch {
        setError('Failed to load car form data');
      }
    }
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImagesChange = (images: UploadedImage[]) => {
    setUploadedImages(images);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        body.append(key, value);
      });
      uploadedImages.forEach(img => {
        body.append('image_urls[]', img.url);
      });
      body.append('with_driver_rate', form.with_driver_rate);
      body.append('without_driver_rate', form.without_driver_rate);
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
    } catch {
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
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Name (optional)</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                maxLength={255}
                placeholder="e.g., Custom car display name (optional)"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Store</label>
              <select
                name="store_id"
                value={form.store_id}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="" disabled>Select a store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Brand</label>
              <select
                name="car_brand_id"
                value={form.car_brand_id}
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
                name="car_type_id"
                value={form.car_type_id}
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
                name="car_engine_id"
                value={form.car_engine_id}
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
              <label className="block mb-1 font-medium">Model</label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
                maxLength={255}
                placeholder="e.g., Civic"
              />
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
                min="1990"
                max="2025"
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
                maxLength={255}
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
                maxLength={1000}
                placeholder="Describe the car's features, condition, and any special notes..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Car Images</label>
              <ImageUpload
                onImagesChange={handleImagesChange}
                maxImages={5}
                directory="car-images"
                disabled={loading}
              />
            </div>
            {/* Rate Details Section */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-[#7e246c] dark:text-white mb-4">Rate Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">With Driver (10 hrs/day)</label>
                    <input
                      type="number"
                      name="with_driver_rate"
                      value={form.with_driver_rate || ''}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      required
                      min="0"
                      placeholder="e.g., 7000"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Without Driver (24 hrs/day)</label>
                    <input
                      type="number"
                      name="without_driver_rate"
                      value={form.without_driver_rate || ''}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      required
                      min="0"
                      placeholder="e.g., 5000"
                    />
                  </div>
                </div>
                <div className="mt-4 text-sm font-semibold text-[#7e246c] dark:text-white">
                  Refill fuel at the end of the day or pay <span className="font-bold">PKR 32/KM</span>
                </div>
                <div className="text-sm font-semibold text-[#7e246c] dark:text-white mt-1">
                  Overtime: <span className="font-bold">PKR 400/hr</span>
                </div>
              </div>
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