import React, { useState } from 'react';
import { apiFetch } from '@/lib/utils';

interface CarOfferFormProps {
  carId: number;
  currencies: string[];
  onOfferCreated?: () => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

interface CarOfferFormData {
  car_id: number;
  discount_percentage: number;
  currency: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function CarOfferForm({ 
  carId, 
  currencies, 
  onOfferCreated, 
  onError, 
  onSuccess 
}: CarOfferFormProps) {
  const [formData, setFormData] = useState<CarOfferFormData>({
    car_id: carId,
    discount_percentage: 0,
    currency: 'PKR',
    start_date: '',
    end_date: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.discount_percentage || formData.discount_percentage <= 0) {
      newErrors.discount_percentage = 'Discount percentage must be greater than 0';
    }

    if (formData.discount_percentage > 100) {
      newErrors.discount_percentage = 'Discount percentage cannot exceed 100%';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('/api/customer/car-offers', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to create offer';
        setErrors({ submit: errorMessage });
        onError?.(errorMessage);
        return;
      }

      await response.json();
      
      // Reset form
      setFormData({
        car_id: carId,
        discount_percentage: 0,
        currency: 'PKR',
        start_date: '',
        end_date: '',
        is_active: true,
      });
      
      setErrors({});
      onSuccess?.('Car offer created successfully!');
      onOfferCreated?.();
    } catch {
      const errorMessage = 'Network error occurred';
      setErrors({ submit: errorMessage });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Add Car Offer
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Discount Percentage */}
        <div>
          <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Discount Percentage (%)
          </label>
          <input
            type="number"
            id="discount_percentage"
            name="discount_percentage"
            value={formData.discount_percentage}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7e246c] ${
              errors.discount_percentage 
                ? 'border-red-500' 
                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }`}
            placeholder="Enter discount percentage"
          />
          {errors.discount_percentage && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.discount_percentage}</p>
          )}
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7e246c] ${
              errors.start_date 
                ? 'border-red-500' 
                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }`}
          />
          {errors.start_date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.start_date}</p>
          )}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7e246c] ${
              errors.end_date 
                ? 'border-red-500' 
                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }`}
          />
          {errors.end_date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.end_date}</p>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="h-4 w-4 text-[#7e246c] focus:ring-[#7e246c] border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Active Offer
          </label>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7e246c] text-white py-2 px-4 rounded-md hover:bg-[#6a1f5c] focus:outline-none focus:ring-2 focus:ring-[#7e246c] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating Offer...' : 'Create Offer'}
        </button>
      </form>
    </div>
  );
} 