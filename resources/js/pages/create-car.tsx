import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import ImageUpload from '@/components/ImageUpload';
import ModelSelector from '@/components/ModelSelector';

interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

export default function CreateCarPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Form state
  const [form, setForm] = useState({
    name: '',
    car_brand_id: '',
    car_type_id: '',
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
  const [colors, setColors] = useState<{ id: number; name: string; hex_code: string }[]>([]);
  const [years, setYears] = useState<{ id: number; year: number }[]>([]);
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
        const [brandsRes, typesRes, colorsRes, yearsRes, storesRes] = await Promise.all([
          apiFetch('/api/customer/car-brands'),
          apiFetch('/api/customer/car-types'),
          apiFetch('/api/colors'),
          apiFetch('/api/years'),
          apiFetch('/api/customer/stores'),
        ]);

        const brandsData = await brandsRes.json();
        const typesData = await typesRes.json();
        const colorsData = await colorsRes.json();
        const yearsData = await yearsRes.json();
        const storesData = await storesRes.json();

        setCarBrands(brandsData.data || []);
        setCarTypes(typesData.data || []);
        setColors(colorsData.data || []);
        setYears(yearsData.data || []);
        setStores(storesData.stores || []);

        // Auto-select store if user has only one store or if store_id is in URL
        const storeIdFromUrl = searchParams.get('store_id');
        if (storeIdFromUrl) {
          setForm(prev => ({ ...prev, store_id: storeIdFromUrl }));
        } else if (storesData.stores && storesData.stores.length === 1) {
          setForm(prev => ({ ...prev, store_id: storesData.stores[0].id.toString() }));
        }
      } catch {
        setError('Failed to load car form data');
      }
    }
    fetchData();
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleModelChange = (modelName: string) => {
    setForm({ ...form, model: modelName });
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
      <AppLayout
          breadcrumbs={[
              { title: 'Dashboard', href: '/dashboard' },
              { title: 'Cars', href: '/dashboard/cars' },
              { title: 'Add Car', href: '/create-car' },
          ]}
      >
          <div className="p-6 max-w-3xl text-left ml-0">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow p-8">
                  <h1 className="mb-6 text-2xl font-bold">Add New Car</h1>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 text-left md:grid-cols-2">
                      <div className="md:col-span-2">
                          <label className="mb-1 block font-medium">Name (optional)</label>
                          <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleInputChange}
                              className="w-full rounded border px-3 py-2"
                              maxLength={255}
                              placeholder="e.g., Custom car display name (optional)"
                          />
                      </div>
                      <div>
                          <label className="mb-1 block font-medium">Store</label>
                          <select
                              name="store_id"
                              value={form.store_id}
                              onChange={handleInputChange}
                              className="w-full rounded border px-3 py-2"
                              required
                          >
                              <option value="" disabled>
                                  Select a store
                              </option>
                              {stores.map((store) => (
                                  <option key={store.id} value={store.id}>
                                      {store.name}
                                  </option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="mb-1 block font-medium">Type</label>
                          <select
                              name="car_type_id"
                              value={form.car_type_id}
                              onChange={handleInputChange}
                              className="w-full rounded border px-3 py-2"
                              required
                          >
                              <option value="" disabled>
                                  Select a type
                              </option>
                              {carTypes.map((type) => (
                                  <option key={type.id} value={type.id}>
                                      {type.name}
                                  </option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="mb-1 block font-medium">Brand</label>
                          <select
                              name="car_brand_id"
                              value={form.car_brand_id}
                              onChange={handleInputChange}
                              className="w-full rounded border px-3 py-2"
                              required
                          >
                              <option value="" disabled>
                                  Select a brand
                              </option>
                              {carBrands.map((brand) => (
                                  <option key={brand.id} value={brand.id}>
                                      {brand.name}
                                  </option>
                              ))}
                          </select>
                      </div>

                      <div>
                          <label className="mb-1 block font-medium">Model</label>
                          <ModelSelector
                              selectedModel={form.model}
                              onModelChange={handleModelChange}
                              brandId={form.car_brand_id}
                              placeholder="Type or select a model..."
                              disabled={!form.car_brand_id}
                          />
                      </div>
                      <div>
                          <label className="mb-1 block font-medium">Year</label>
                          <select name="year" value={form.year} onChange={handleInputChange} className="w-full rounded border px-3 py-2" required>
                              <option value="" disabled>
                                  Select a year
                              </option>
                              {years.map((year) => (
                                  <option key={year.id} value={year.year}>
                                      {year.year}
                                  </option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="mb-1 block font-medium">Color</label>
                          <select name="color" value={form.color} onChange={handleInputChange} className="w-full rounded border px-3 py-2" required>
                              <option value="" disabled>
                                  Select a color
                              </option>
                              {colors.map((color) => (
                                  <option key={color.id} value={color.name}>
                                      {color.name}
                                  </option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="mb-1 block font-medium">Number of Seats</label>
                          <input
                              type="number"
                              name="seats"
                              value={form.seats}
                              onChange={handleInputChange}
                              className="w-full rounded border px-3 py-2"
                              required
                              min="1"
                              max="20"
                              placeholder="e.g., 5"
                          />
                      </div>
                      <div>
                          <label className="mb-1 block font-medium">Transmission</label>
                          <select
                              name="transmission"
                              value={form.transmission}
                              onChange={handleInputChange}
                              className="w-full rounded border px-3 py-2"
                              required
                          >
                              <option value="" disabled>
                                  Select transmission
                              </option>
                              <option value="manual">Manual</option>
                              <option value="automatic">Automatic</option>
                          </select>
                      </div>
                      <div>
                          <label className="mb-1 block font-medium">Fuel Type</label>
                          <select
                              name="fuel_type"
                              value={form.fuel_type}
                              onChange={handleInputChange}
                              className="w-full rounded border px-3 py-2"
                              required
                          >
                              <option value="" disabled>
                                  Select fuel type
                              </option>
                              <option value="petrol">Petrol</option>
                              <option value="diesel">Diesel</option>
                              <option value="electric">Electric</option>
                              <option value="hybrid">Hybrid</option>
                          </select>
                      </div>
                      <div className="md:col-span-2">
                          <label className="mb-1 block font-medium">Description</label>
                          <textarea
                              name="description"
                              value={form.description}
                              onChange={handleInputChange}
                              className="w-full rounded border px-3 py-2"
                              rows={3}
                              maxLength={1000}
                              placeholder="Describe the car's features, condition, and any special notes..."
                          />
                      </div>
                      <div className="md:col-span-2">
                          <label className="mb-1 block font-medium">Car Images</label>
                          <ImageUpload onImagesChange={handleImagesChange} maxImages={5} directory="car-images" disabled={loading} />
                      </div>
                      {/* Rate Details Section */}
                      <div className="md:col-span-2">
                          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
                              <h3 className="mb-4 text-lg font-bold text-[#7e246c] dark:text-white">Rate Details</h3>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div>
                                      <label className="mb-1 block font-medium">With Driver (10 hrs/day)</label>
                                      <input
                                          type="number"
                                          name="with_driver_rate"
                                          value={form.with_driver_rate || ''}
                                          onChange={handleInputChange}
                                          className="w-full rounded border px-3 py-2"
                                          required
                                          min="0"
                                          placeholder="e.g., 7000"
                                      />
                                  </div>
                                  <div>
                                      <label className="mb-1 block font-medium">Without Driver (24 hrs/day)</label>
                                      <input
                                          type="number"
                                          name="without_driver_rate"
                                          value={form.without_driver_rate || ''}
                                          onChange={handleInputChange}
                                          className="w-full rounded border px-3 py-2"
                                          required
                                          min="0"
                                          placeholder="e.g., 5000"
                                      />
                                  </div>
                              </div>
                              <div className="mt-4 text-sm font-semibold text-[#7e246c] dark:text-white">
                                  Refill fuel at the end of the day or pay <span className="font-bold">PKR 32/KM</span>
                              </div>
                              <div className="mt-1 text-sm font-semibold text-[#7e246c] dark:text-white">
                                  Overtime: <span className="font-bold">PKR 400/hr</span>
                              </div>
                          </div>
                      </div>
                      <div className="flex items-center justify-end gap-4 md:col-span-2">
                          {error && <div className="text-sm text-red-600">{error}</div>}
                          <button
                              type="submit"
                              className="cursor-pointer rounded-md bg-[#7e246c] px-6 py-2 font-semibold text-white transition hover:bg-[#6a1f5c]"
                              disabled={loading}
                              style={{ pointerEvents: loading ? 'none' : 'auto' }}
                          >
                              {loading ? 'Creating...' : 'Add Car'}
                          </button>
                          {success && <div className="text-sm text-green-600">Car created successfully!</div>}
                      </div>
                   </form>
              </div>
          </div>
       </AppLayout>
  );
}
