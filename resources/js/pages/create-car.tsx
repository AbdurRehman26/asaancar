import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';

export default function CreateCarPage() {
  const [searchParams] = useSearchParams();
  const storeIdParam = searchParams.get('store_id');
  const navigate = useNavigate();
  
  // Form state
  const [form, setForm] = useState({
    name: '',
    model: '',
    year: '',
    color: '',
    seats: '',
    transmission: '',
    fuel_type: '',
    description: '',
    car_brand_id: '',
    car_type_id: '',
    car_engine_id: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Data state
  const [stores, setStores] = useState<{ id: string; name: string; address?: string }[]>([]);
  const [selectedStore, setSelectedStore] = useState<{ id: string; name: string; address?: string } | null>(null);
  const [carBrands, setCarBrands] = useState<{ id: number; name: string }[]>([]);
  const [carTypes, setCarTypes] = useState<{ id: number; name: string }[]>([]);
  const [carEngines, setCarEngines] = useState<{ id: number; name: string }[]>([]);

  // Image upload state
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Load all required data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load stores
        const storesRes = await apiFetch('/api/customer/stores');
        const storesData = await storesRes.json();
        setStores(storesData.stores || []);
        
        // Set default selected store
        if (storesData.stores && storesData.stores.length > 0) {
          const defaultStore = storesData.stores.find((s: { id: string; name: string }) => 
            String(s.id) === String(storeIdParam)
          ) || storesData.stores[0];
          setSelectedStore(defaultStore);
        }

        // Load car brands
        const brandsRes = await apiFetch('/api/customer/car-brands');
        const brandsData = await brandsRes.json();
        setCarBrands(brandsData.data || []);

        // Load car types
        const typesRes = await apiFetch('/api/customer/car-types');
        const typesData = await typesRes.json();
        setCarTypes(typesData.data || []);

        // Load car engines
        const enginesRes = await apiFetch('/api/customer/car-engines');
        const enginesData = await enginesRes.json();
        setCarEngines(enginesData.data || []);

      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load form data');
      }
    };

    loadData();
  }, [storeIdParam]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      // Create previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // For now, image upload is UI only. To support backend upload, use FormData.
      const carData = {
        ...form,
        store_id: selectedStore?.id,
        year: form.year ? parseInt(form.year) : undefined,
        seats: form.seats ? parseInt(form.seats) : undefined,
        car_brand_id: form.car_brand_id ? parseInt(form.car_brand_id) : undefined,
        car_type_id: form.car_type_id ? parseInt(form.car_type_id) : undefined,
        car_engine_id: form.car_engine_id ? parseInt(form.car_engine_id) : undefined,
        // image_urls: imagePreviews, // This would be handled by backend upload
      };

      const res = await apiFetch('/api/customer/cars', {
        method: 'POST',
        body: JSON.stringify(carData),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to create car');
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard/cars'), 1000);
      }
    } catch (e) {
      console.error(e);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/dashboard' }, 
      { title: 'Cars', href: '/dashboard/cars' }, 
      { title: 'Add Car', href: '/create-car' }
    ]}>
      <div className="p-6 max-w-4xl text-left">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Add New Car</h1>
          
          {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
          
          {/* Store Selection */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">Store</label>
            <select
              value={selectedStore?.id || ''}
              onChange={(e) => {
                const store = stores.find(s => String(s.id) === e.target.value);
                setSelectedStore(store || null);
              }}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="" disabled>Select a store</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name} {store.address && `- ${store.address}`}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Basic Information */}
            <div>
              <label className="block mb-1 font-medium">Car Name</label>
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
              <label className="block mb-1 font-medium">Model</label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
                placeholder="e.g., Civic"
              />
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

            {/* Description - Full Width */}
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

            {/* Image Upload - Full Width */}
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Car Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full border rounded px-3 py-2"
              />
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Car image ${index + 1}`}
                        className="w-full h-24 rounded border object-cover bg-gray-50 dark:bg-gray-800"
                      />
                                    <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-md w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 cursor-pointer"
              >
                ×
              </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button - Full Width */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#7e246c] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#6a1f5c] transition cursor-pointer disabled:cursor-not-allowed"
                disabled={loading || !selectedStore}
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