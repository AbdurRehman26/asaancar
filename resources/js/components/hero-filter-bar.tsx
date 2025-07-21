import React from 'react';

interface HeroFilterBarProps {
  pickupLocation: string;
  setPickupLocation: (val: string) => void;
  pickupDate: string;
  setPickupDate: (val: string) => void;
  pickupTime: string;
  setPickupTime: (val: string) => void;
  dropoffDate: string;
  setDropoffDate: (val: string) => void;
  sameLocation: boolean;
  setSameLocation: (val: boolean) => void;
  onSearch: (e: React.FormEvent) => void;
  loading?: boolean;
  className?: string;
}

const HeroFilterBar: React.FC<HeroFilterBarProps> = ({
  pickupLocation,
  setPickupLocation,
  pickupDate,
  setPickupDate,
  pickupTime,
  setPickupTime,
  dropoffDate,
  setDropoffDate,
  sameLocation,
  setSameLocation,
  onSearch,
  loading = false,
  className = '',
}) => (
  <form onSubmit={onSearch} className={`flex flex-col gap-4 md:flex-row md:items-end bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg px-6 py-6 md:py-4 md:px-8 w-full max-w-3xl mx-auto ${className}`}>
    <div className="flex-1 min-w-[180px]">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Where To Pick Up</label>
      <input
        type="text"
        className="w-full border border-[#7e246c] rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]"
        placeholder="Enter your City, Airport Or Address *"
        value={pickupLocation}
        onChange={e => setPickupLocation(e.target.value)}
        required
      />
    </div>
    <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-end">
      <div className="flex flex-col">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Pick-Up Time</label>
        <div className="flex gap-2">
          <input
            type="date"
            className="border border-[#7e246c] rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]"
            value={pickupDate}
            onChange={e => setPickupDate(e.target.value)}
            required
          />
          <input
            type="time"
            className="border border-[#7e246c] rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]"
            value={pickupTime}
            onChange={e => setPickupTime(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex flex-col">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Drop-off Date</label>
        <input
          type="date"
          className="border border-[#7e246c] rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]"
          value={dropoffDate}
          onChange={e => setDropoffDate(e.target.value)}
          required
        />
      </div>
    </div>
    <div className="flex flex-col items-center gap-2 md:ml-4">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
        <input
          type="checkbox"
          checked={sameLocation}
          onChange={e => setSameLocation(e.target.checked)}
          className="accent-[#7e246c]"
        />
        Drop-off at same location
      </label>
      <button
        type="submit"
        className="w-full bg-[#7e246c] text-white font-semibold px-6 py-3 rounded-md hover:bg-[#6a1f5c] transition flex items-center justify-center shadow mt-2"
        disabled={loading}
        style={{ pointerEvents: loading ? 'none' : 'auto' }}
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2 4-4" />
        </svg>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </div>
  </form>
);

export default HeroFilterBar; 