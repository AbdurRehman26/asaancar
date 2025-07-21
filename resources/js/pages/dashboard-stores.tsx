import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Store } from '@/types/store';

export default function DashboardStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [storeToDeactivate, setStoreToDeactivate] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/customer/stores', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch stores');
        const data = await res.json();
        setStores(data.stores || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDeactivate = async (storeId: number) => {
    try {
      const res = await fetch(`/api/customer/stores/${storeId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      if (res.ok) {
        setStores(stores.filter(store => store.id !== storeId));
      } else {
        alert('Failed to deactivate store');
      }
    } catch (err) {
      console.error('Error deactivating store:', err);
      alert('Error deactivating store');
    }
    setShowModal(false);
    setStoreToDeactivate(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Car Stores</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your car rental stores</p>
        </div>
        {stores.length > 0 && (
          <Link
            to="/dashboard/create-store"
            className="bg-[#7e246c] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#6a1f5c] transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Store
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7e246c]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No stores found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first car rental store.</p>
          <Link
            to="/dashboard/create-store"
            className="inline-flex items-center px-4 py-2 bg-[#7e246c] text-white font-medium rounded-md hover:bg-[#6a1f5c] transition"
          >
            Create Your First Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {store.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @{store.store_username}
                    </p>
                  </div>
                  {store.logo_url && (
                    <img
                      src={store.logo_url}
                      alt={`${store.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                    />
                  )}
                </div>

                {store.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {store.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {store.city && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {store.city}
                    </div>
                  )}
                  {store.contact_phone && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {store.contact_phone}
                    </div>
                  )}
                  {store.created_at && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created {new Date(store.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/stores/${store.id}/edit`}
                    className="flex-1 px-3 py-2 text-sm font-medium text-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => { setShowModal(true); setStoreToDeactivate(store.id); }}
                    className="flex-1 px-3 py-2 text-sm font-medium text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition cursor-pointer"
                    type="button"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-lg">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Deactivate Store</h2>
            <p className="mb-6">Are you sure you want to deactivate this store?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => { setShowModal(false); setStoreToDeactivate(null); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => storeToDeactivate && handleDeactivate(storeToDeactivate)}
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 