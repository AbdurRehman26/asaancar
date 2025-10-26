import React, { useState, useEffect } from 'react';

type CarFiltersType = {
  brand_id: string;
  type_id: string;
  store_id: string;
  transmission: string;
  fuel_type: string;
  min_seats: string;
  min_price: string;
  max_price: string;
  tag_ids: number[];
};

type CarBrand = {
  id: number;
  name: string;
};

type CarType = {
  id: number;
  name: string;
};

type CarFiltersProps = {
  filters: CarFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<CarFiltersType>>;
  handleSearch: (newFilters?: Partial<CarFiltersType>) => void;
  onClearFilters?: () => void;
  loading?: boolean;
};

const CarFilters: React.FC<CarFiltersProps> = ({
  filters,
  setFilters,
  handleSearch,
  onClearFilters,
  loading = false
}) => {
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [carTypesLoading, setCarTypesLoading] = useState(true);

  // Fetch car brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/car-brands');
        const data = await response.json();
        setBrands(data.data || []);
      } catch (error) {
        console.error('Error fetching car brands:', error);
        setBrands([]);
      } finally {
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Fetch car types from API
  useEffect(() => {
    const fetchCarTypes = async () => {
      try {
        const response = await fetch('/api/car-types');
        const data = await response.json();
        setCarTypes(data.data || []);
      } catch (error) {
        console.error('Error fetching car types:', error);
        setCarTypes([]);
      } finally {
        setCarTypesLoading(false);
      }
    };

    fetchCarTypes();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800/80 border-2 border-[#7e246c] rounded-lg mx-0 my-4 w-full max-w-none">
      <div className="px-4 py-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 w-full">
          <div>
            <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Brand</label>
            <select
              value={filters.brand_id}
              onChange={(e) => {
                const newFilters = {...filters, brand_id: e.target.value};
                setFilters(newFilters);
                handleSearch(newFilters);
              }}
              className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
              disabled={brandsLoading}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Type</label>
            <select
              value={filters.type_id}
              onChange={(e) => {
                const newFilters = {...filters, type_id: e.target.value};
                setFilters(newFilters);
                handleSearch(newFilters);
              }}
              className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
              disabled={carTypesLoading}
            >
              <option value="">All Types</option>
              {carTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Transmission</label>
            <select
              value={filters.transmission}
              onChange={(e) => {
                const newFilters = {...filters, transmission: e.target.value};
                setFilters(newFilters);
                handleSearch(newFilters);
              }}
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
              onChange={(e) => {
                const newFilters = {...filters, fuel_type: e.target.value};
                setFilters(newFilters);
                handleSearch(newFilters);
              }}
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
              onChange={(e) => {
                const newFilters = {...filters, min_seats: e.target.value};
                setFilters(newFilters);
                handleSearch(newFilters);
              }}
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
            <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Min Price</label>
            <select
              value={filters.min_price || ''}
              onChange={(e) => {
                const newFilters = {...filters, min_price: e.target.value};
                setFilters(newFilters);
                handleSearch(newFilters);
              }}
              className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white min-w-[140px]"
            >
              <option value="">Any Price</option>
              <option value="1000">1,000 PKR</option>
              <option value="3000">3,000 PKR</option>
              <option value="5000">5,000 PKR</option>
              <option value="10000">10,000 PKR</option>
              <option value="15000">15,000 PKR</option>
              <option value="20000">20,000 PKR</option>
              <option value="25000">25,000 PKR</option>
              <option value="30000">30,000 PKR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Max Price</label>
            <select
              value={filters.max_price}
              onChange={(e) => {
                const newFilters = {...filters, max_price: e.target.value};
                setFilters(newFilters);
                handleSearch(newFilters);
              }}
              className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white min-w-[140px]"
            >
              <option value="">Any Price</option>
              <option value="3000">3,000 PKR</option>
              <option value="6000">6,000 PKR</option>
              <option value="10000">10,000 PKR</option>
              <option value="15000">15,000 PKR</option>
              <option value="20000">20,000 PKR</option>
              <option value="25000">25,000 PKR</option>
              <option value="30000">30,000 PKR</option>
              <option value="50000">50,000 PKR</option>
            </select>
          </div>
          <div className="flex items-end justify-end gap-2">
            <button
              onClick={() => {
                if (onClearFilters) {
                  onClearFilters();
                } else {
                  // Fallback: clear filters locally and trigger search
                  const defaultFilters = {
                    brand_id: '',
                    type_id: '',
                    store_id: '',
                    transmission: '',
                    fuel_type: '',
                    min_seats: '',
                    min_price: '',
                    max_price: '',
                    tag_ids: []
                  };
                  setFilters(defaultFilters);
                  handleSearch(defaultFilters);
                }
              }}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center shadow"
              title="Clear all filters"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarFilters;
