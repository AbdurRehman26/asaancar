import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ImageUpload from '@/components/ImageUpload';
import ModelSelector from '@/components/ModelSelector';

export default function EditCarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    without_driver_rate: '',
    with_driver_rate: '',
  });
  const [carBrands, setCarBrands] = useState<{ id: number; name: string }[]>([]);
  const [carTypes, setCarTypes] = useState<{ id: number; name: string }[]>([]);
  const [colors, setColors] = useState<{ id: number; name: string; hex_code: string }[]>([]);
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; filename: string; size: number; mime_type: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch car data and form options in parallel
        const [carRes, brandsRes, typesRes, colorsRes, storesRes] = await Promise.all([
          apiFetch(`/api/customer/cars/${id}`),
          apiFetch('/api/customer/car-brands'),
          apiFetch('/api/customer/car-types'),
          apiFetch('/api/colors'),
          apiFetch('/api/customer/stores'),
        ]);

        // Set form options first
        const brandsData = await brandsRes.json();
        const typesData = await typesRes.json();
        const colorsData = await colorsRes.json();
        const storesData = await storesRes.json();
        
        setCarBrands(brandsData.data || []);
        setCarTypes(typesData.data || []);
        setColors(colorsData.data || []);
        setStores(storesData.stores || []);

        if (carRes.ok) {
          const response = await carRes.json();
          const carData = response.data; // Extract data from the nested structure
          console.log('Car data received:', carData);
          
          // Extract values from the nested structure
          const store = carData.store || {};
          
          // Use IDs directly from the API response
          const brandId = carData.car_brand_id?.toString() || '';
          const typeId = carData.car_type_id?.toString() || '';
          

          
          const formData = {
            name: carData.name || '',
            car_brand_id: brandId,
            car_type_id: typeId,
            store_id: store.id?.toString() || '',
            model: carData.model || '',
            year: carData.year?.toString() || '',
            color: carData.color || '',
            seats: carData.seats?.toString() || '',
            transmission: carData.transmission || '',
            fuel_type: carData.fuel_type || '',
            description: carData.description || '',
            without_driver_rate: carData.withoutDriver?.toString() || '',
            with_driver_rate: carData.withDriver?.toString() || '',
          };
          
          console.log('Setting form data:', formData);
          setForm(formData);
          
          // Debug: Check if form is populated correctly after a delay
          setTimeout(() => {
            console.log('Form state after setting:', form);
          }, 100);
          
          // Set uploaded images if they exist
          if (carData.images && Array.isArray(carData.images)) {
            const images = carData.images.map((url: string) => ({
              url,
              filename: url.split('/').pop() || 'image',
              size: 0,
              mime_type: 'image/jpeg'
            }));
            setUploadedImages(images);
          }
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
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleModelChange = (modelName: string) => {
    setForm({ ...form, model: modelName });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...uploadedImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setUploadedImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if form data is loaded
    if (!form.car_brand_id || !form.car_type_id || !form.store_id) {
      setError('Form data is still loading. Please wait and try again.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Validate required fields
    const requiredFields = ['car_brand_id', 'car_type_id', 'store_id', 'model', 'year', 'color', 'seats', 'transmission', 'fuel_type'];
    const missingFields = requiredFields.filter(field => !form[field as keyof typeof form]);
    
    console.log('Form data at submission:', form);
    console.log('Missing fields:', missingFields);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }
    try {
      // Prepare the request body as JSON
      const requestBody = {
        ...form,
        image_urls: uploadedImages.map(img => img.url),
        with_driver_rate: form.with_driver_rate,
        without_driver_rate: form.without_driver_rate,
      };
      
      // Debug: Log what's being sent
      console.log('Request body being sent:', requestBody);
      
      const res = await apiFetch(`/api/customer/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const err = await res.json();
        console.log('Update error response:', err);
        if (res.status === 401) {
          setError('Authentication required. Please log in again.');
        } else if (res.status === 422) {
          // Validation errors
          const validationErrors = err.errors || {};
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          setError(`Validation errors: ${errorMessages}`);
        } else {
          setError(err.message || 'Failed to update car');
        }
      } else {
        navigate('/dashboard/cars');
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
      { title: 'Edit Car', href: `/edit-car/${id}` },
    ]}>
      <div className="p-6 max-w-3xl text-left ml-0">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Edit Car</h1>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Name (optional)</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
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
                onChange={handleChange}
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
              <label className="block mb-1 font-medium">Type</label>
              <select
                name="car_type_id"
                value={form.car_type_id}
                onChange={handleChange}
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
              <label className="block mb-1 font-medium">Brand</label>
              <select
                name="car_brand_id"
                value={form.car_brand_id}
                onChange={handleChange}
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
              <label className="block mb-1 font-medium">Model</label>
              <ModelSelector
                selectedModel={form.model}
                onModelChange={handleModelChange}
                brandId={form.car_brand_id}
                placeholder="Type or select a model..."
                disabled={!form.car_brand_id}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Year</label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                min="1990"
                max="2025"
                placeholder="e.g., 2023"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Color</label>
              <select
                name="color"
                value={form.color}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="" disabled>Select a color</option>
                {colors.map(color => (
                  <option key={color.id} value={color.name}>{color.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Number of Seats</label>
              <input
                type="number"
                name="seats"
                value={form.seats}
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows={3}
                maxLength={1000}
                placeholder="Describe the car's features, condition, and any special notes..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Car Images</label>
              <p className="text-xs text-gray-500 mb-2">Images are displayed in upload order. Use ↑↓ buttons to reorder.</p>
              
              {/* All Images Display */}
              {uploadedImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Images ({uploadedImages.length}/5):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={`${image.url}-${index}`} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={image.url}
                            alt={image.filename}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/car-placeholder.jpeg';
                            }}
                          />
                        </div>
                        
                        {/* Reorder Controls */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index - 1)}
                              className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
                              disabled={loading}
                              title="Move up"
                            >
                              ↑
                            </button>
                          )}
                          {index < uploadedImages.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index + 1)}
                              className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
                              disabled={loading}
                              title="Move down"
                            >
                              ↓
                            </button>
                          )}
                        </div>
                        
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = uploadedImages.filter((_, i) => i !== index);
                            setUploadedImages(newImages);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          disabled={loading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        {/* Image Info */}
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <p className="truncate">{image.filename}</p>
                          <p className="text-xs">Order: {index + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add New Images */}
              {uploadedImages.length < 5 && (
                <ImageUpload
                  onImagesChange={(newImages) => {
                    // Add new images to the end of the list
                    setUploadedImages(prev => [...prev, ...newImages]);
                  }}
                  maxImages={5 - uploadedImages.length}
                  directory="car-images"
                  disabled={loading}
                />
              )}
            </div>
            <div className="md:col-span-2 flex justify-end items-center gap-4">
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button
                type="submit"
                className="bg-[#7e246c] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#6a1f5c] transition cursor-pointer"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
} 