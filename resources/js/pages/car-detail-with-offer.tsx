import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { apiFetch } from '@/lib/utils';

interface Car {
  id: number;
  name: string;
  model?: string;
  year?: number;
  color?: string;
  seats?: number;
  transmission?: string;
  fuel_type?: string;
  description?: string;
  image_urls?: string[];
  image?: string;
  rental?: number;
  withDriver?: number;
  baseFare?: number;
  fuel?: number;
  overtime?: number;
  currency?: string;
  store_id?: number;
  store?: {
    id: number;
    name?: string;
    address?: string;
  };
  car_brand?: { name: string };
  car_type?: { name: string };
  car_engine?: { name: string };
  [key: string]: unknown;
}

interface RateDetails {
  with_driver: number;
  without_driver: number;
  currency: string;
  fuel_rate: number;
  overtime_rate: number;
}

export default function CarDetailWithOfferPage() {
  const { id } = useParams<{ id: string }>();
  const carId = id || 'N/A';


  const [car, setCar] = useState<Car | null>(null);
  const [rateDetails, setRateDetails] = useState<RateDetails>({
    with_driver: 0,
    without_driver: 0,
    currency: 'PKR',
    fuel_rate: 32,
    overtime_rate: 400
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchCarData = useCallback(async () => {
    if (!carId) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/cars/${carId}`);
      if (!response.ok) {
        setError('Failed to fetch car details');
        setCar(null);
      } else {
        const json = await response.json();
        setCar(json.data);
        // Initialize rate details from car data if available
        if (json.data) {
          setRateDetails({
            with_driver: json.data.withDriver || 0,
            without_driver: json.data.rental || 0,
            currency: json.data.currency || 'PKR',
            fuel_rate: 32,
            overtime_rate: 400
          });
        }
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    fetchCarData();
  }, [carId, fetchCarData]);

  const handleRateChange = (field: keyof RateDetails, value: string | number) => {
    setRateDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveRates = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/customer/cars/${carId}`, {
        method: 'PUT',
        body: JSON.stringify({
          withDriver: rateDetails.with_driver,
          rental: rateDetails.without_driver,
          currency: rateDetails.currency
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update rates');
      } else {
        setSuccess('Rates updated successfully!');
        setIsEditing(false);
        await fetchCarData();
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">
        Loading car details...
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-gray-600">
        Car not found.
      </div>
    );
  }

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Cars',
      href: '/dashboard/cars',
    },
    {
      title: 'Car Rate Management',
      href: `/car-detail/${carId}/edit`,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="mx-24 px-0 py-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-[#7e246c] dark:text-white">Car Rate Management</h2>
          </div>
          <Link
            to="/dashboard/cars"
            className="px-4 py-2 rounded bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors"
          >
            ← Back to Cars
          </Link>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-neutral-800 shadow-lg overflow-hidden flex flex-col lg:flex-row">
          {/* Left: Car Details */}
          <div className="lg:w-2/3 p-2">
            <div className="flex flex-col gap-2">
                            {/* Car Image */}
              <div className="flex justify-center items-center">
                <img
                  src={car.image_urls?.[0] || car.image || '/images/car-placeholder.jpeg'}
                  alt={car.name}
                  className="h-48 object-contain rounded-xl bg-gray-50 p-4 dark:bg-neutral-800"
                />
              </div>

              {/* Car Title */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-[#7e246c] dark:text-white mb-2">
                  {car.name}
                </h1>
                {car.model && (
                  <p className="text-base text-gray-600 dark:text-gray-300">
                    {car.car_brand?.name} {car.model}
                  </p>
                )}
              </div>

              {/* Car Specifications */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-[#7e246c] dark:text-white mb-4">
                  Car Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {car.year && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Year:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{car.year}</span>
                    </div>
                  )}
                  {car.color && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Color:</span>
                      <span className="ml-2 text-gray-900 dark:text-white capitalize">{car.color}</span>
                    </div>
                  )}
                  {car.seats && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Seats:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{car.seats}</span>
                    </div>
                  )}
                  {car.transmission && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Transmission:</span>
                      <span className="ml-2 text-gray-900 dark:text-white capitalize">{car.transmission}</span>
                    </div>
                  )}
                  {car.fuel_type && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Fuel Type:</span>
                      <span className="ml-2 text-gray-900 dark:text-white capitalize">{car.fuel_type}</span>
                    </div>
                  )}
                  {car.car_type?.name && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{car.car_type.name}</span>
                    </div>
                  )}
                  {car.car_engine?.name && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Engine:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{car.car_engine.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rate Details */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-[#7e246c] dark:text-white mb-4">Rate Details</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#7e246c] dark:text-white font-semibold border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3">Hours/Day</th>
                      <th className="text-right pb-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 dark:text-gray-300">
                    {car.withDriver && typeof car.withDriver === 'number' && car.withDriver > 0 && (
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 text-center font-semibold">10 hrs/day</td>
                        <td className="py-3 text-right font-bold text-[#7e246c] dark:text-white">
                          {car.currency || 'PKR'} {Math.round(car.withDriver).toLocaleString()}
                        </td>
                      </tr>
                    )}
                    {car.rental && typeof car.rental === 'number' && car.rental > 0 && (
                      <tr>
                        <td className="py-3 text-center font-semibold">24 hrs/day</td>
                        <td className="py-3 text-right font-bold text-[#7e246c] dark:text-white">
                          {car.currency || 'PKR'} {Math.round(car.rental).toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="mt-4 text-sm font-semibold text-[#7e246c] dark:text-white">
                  Refill fuel at the end of the day or pay <span className="font-bold">PKR 32/KM</span>
                </div>
                <div className="text-sm font-semibold text-[#7e246c] dark:text-white mt-1">
                  Overtime: <span className="font-bold">PKR 400/hr</span>
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-[#7e246c] dark:text-white mb-4">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{car.description}</p>
                </div>
              )}

              {/* Store Information */}
              {car.store && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-[#7e246c] dark:text-white mb-4">Store Information</h3>
                  <div className="space-y-2">
                    {car.store.name && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Name:</span> {car.store.name}
                      </p>
                    )}
                    {car.store.address && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Address:</span> {car.store.address}
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right: Editable Rate Details */}
          <div className="lg:w-1/3 p-2 bg-gray-50 dark:bg-gray-900/50 border-l border-gray-200 dark:border-gray-700">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rate Details</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3 py-1 rounded bg-[#7e246c] text-white text-sm font-medium hover:bg-[#6a1f5c] transition-colors"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Currency
                    </label>
                    <select
                      value={rateDetails.currency}
                      onChange={(e) => handleRateChange('currency', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    >
                      <option value="PKR">PKR</option>
                    </select>
                  </div>

                  {/* With Driver Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      With Driver Rate (per day)
                    </label>
                    <input
                      type="number"
                      value={rateDetails.with_driver}
                      onChange={(e) => handleRateChange('with_driver', parseFloat(e.target.value) || 0)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white disabled:opacity-50"
                      placeholder="Enter rate"
                    />
                  </div>

                  {/* Without Driver Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Without Driver Rate (per day)
                    </label>
                    <input
                      type="number"
                      value={rateDetails.without_driver}
                      onChange={(e) => handleRateChange('without_driver', parseFloat(e.target.value) || 0)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white disabled:opacity-50"
                      placeholder="Enter rate"
                    />
                  </div>

                  {/* Fuel Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fuel Rate (per KM)
                    </label>
                    <input
                      type="number"
                      value={rateDetails.fuel_rate}
                      onChange={(e) => handleRateChange('fuel_rate', parseFloat(e.target.value) || 0)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white disabled:opacity-50"
                      placeholder="Enter fuel rate"
                    />
                  </div>

                  {/* Overtime Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Overtime Rate (per hour)
                    </label>
                    <input
                      type="number"
                      value={rateDetails.overtime_rate}
                      onChange={(e) => handleRateChange('overtime_rate', parseFloat(e.target.value) || 0)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white disabled:opacity-50"
                      placeholder="Enter overtime rate"
                    />
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <button
                      onClick={handleSaveRates}
                      disabled={loading}
                      className="w-full mt-4 py-2 px-4 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Saving...' : 'Save Rates'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
