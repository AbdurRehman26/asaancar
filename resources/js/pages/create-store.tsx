import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/lib/utils';
import ImageUpload from '@/components/ImageUpload';

interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

export default function CreateStoreForm() {
  const [name, setName] = useState('');
  const [storeUsername, setStoreUsername] = useState('');
  const [cityId, setCityId] = useState('');
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/cities')
      .then(res => res.json())
      .then(data => setCities(data.data || data))
      .catch(() => setCities([]));
  }, []);

  const handleImagesChange = (images: UploadedImage[]) => {
    setUploadedImages(images);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (storeUsername) formData.append('store_username', storeUsername);
      if (cityId) formData.append('city_id', cityId);
      if (description) formData.append('description', description);
      if (phone) formData.append('phone', phone);
      if (address) formData.append('address', address);
      
      // Add logo image if uploaded
      if (uploadedImages.length > 0) {
        formData.append('logo_url', uploadedImages[0].url);
      }

      const res = await apiFetch('/api/customer/stores', {
        method: 'POST',
        body: formData,
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
          <div>
            <label className="block mb-1 font-medium">Store Username (optional)</label>
            <input
              type="text"
              value={storeUsername}
              onChange={e => setStoreUsername(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., downtown_rental"
            />
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
            <ImageUpload
              onImagesChange={handleImagesChange}
              maxImages={1}
              directory="store-logos"
              disabled={loading}
            />
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
              className="bg-[#7e246c] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#6a1f5c] transition cursor-pointer"
              disabled={loading}
              style={{ pointerEvents: loading ? 'none' : 'auto' }}
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