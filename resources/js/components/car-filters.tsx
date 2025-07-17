import React from 'react';
import { Search } from 'lucide-react';

type CarFiltersType = {
  brand_id: string;
  type_id: string;
  store_id: string;
  transmission: string;
  fuel_type: string;
  min_seats: string;
  max_price: string;
};

type CarFiltersProps = {
  filters: CarFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<CarFiltersType>>;
  duration: string;
  setDuration: (duration: string) => void;
  bookingDate: string;
  setBookingDate: (date: string) => void;
  bookingTime: string;
  setBookingTime: (time: string) => void;
  handleSearch: () => void;
  clearFilters: () => void;
  loading: boolean;
};

const CarFilters: React.FC<CarFiltersProps> = ({
  filters,
  setFilters,
  duration,
  setDuration,
  bookingDate,
  setBookingDate,
  bookingTime,
  setBookingTime,
  handleSearch,
  clearFilters,
  loading
}) => (
  <div className="bg-white dark:bg-gray-800/80 border-2 border-[#7e246c] rounded-lg mx-4 my-4">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Duration</label>
          <select 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)}
            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Date</label>
          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Time</label>
          <input
            type="time"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
          />
        </div>
        <div className="flex items-end space-x-2">
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 bg-[#7e246c] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#6a1f5c] transition-colors disabled:opacity-50 shadow"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button 
            onClick={clearFilters}
            className="px-4 py-2 border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div>
          <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Brand</label>
          <select 
            value={filters.brand_id} 
            onChange={(e) => setFilters({...filters, brand_id: e.target.value})}
            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
          >
            <option value="">All Brands</option>
            <option value="1">Toyota</option>
            <option value="2">Honda</option>
            <option value="3">Tesla</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Type</label>
          <select 
            value={filters.type_id} 
            onChange={(e) => setFilters({...filters, type_id: e.target.value})}
            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
          >
            <option value="">All Types</option>
            <option value="1">Sedan</option>
            <option value="2">SUV</option>
            <option value="3">Electric</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Transmission</label>
          <select 
            value={filters.transmission} 
            onChange={(e) => setFilters({...filters, transmission: e.target.value})}
            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
          >
            <option value="">All</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Fuel Type</label>
          <select 
            value={filters.fuel_type} 
            onChange={(e) => setFilters({...filters, fuel_type: e.target.value})}
            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
          >
            <option value="">All</option>
            <option value="gasoline">Gasoline</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Min Seats</label>
          <select 
            value={filters.min_seats} 
            onChange={(e) => setFilters({...filters, min_seats: e.target.value})}
            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
          >
            <option value="">Any</option>
            <option value="2">2+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
            <option value="7">7+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Max Price</label>
          <input
            type="number"
            placeholder="Max price"
            value={filters.max_price}
            onChange={(e) => setFilters({...filters, max_price: e.target.value})}
            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
          />
        </div>
        <div className="flex items-end">
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-[#7e246c] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#6a1f5c] transition-colors disabled:opacity-50 flex items-center justify-center shadow"
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Searching...' : 'Filter'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default CarFilters; 