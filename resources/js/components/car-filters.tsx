import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import TagSelector from './TagSelector';

type CarFiltersType = {
  brand_id: string;
  type_id: string;
  store_id: string;
  transmission: string;
  fuel_type: string;
  min_seats: string;
  max_price: string;
  city_id: string;
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

type City = {
  id: number;
  name: string;
};

type CarFiltersProps = {
  filters: CarFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<CarFiltersType>>;
  handleSearch: () => void;
  loading?: boolean;
};

const CarFilters: React.FC<CarFiltersProps> = ({
  filters,
  setFilters,
  handleSearch,
  loading = false
}) => {
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [carTypesLoading, setCarTypesLoading] = useState(true);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

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

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities');
        const data = await response.json();
        const allCities = data.data || data;
        // Filter to only show Karachi for now
        const karachiOnly = allCities.filter((city: City) => 
          city.name.toLowerCase() === 'karachi'
        );
        setCities(karachiOnly);
        // Auto-select Karachi if it exists and no city is selected
        if (karachiOnly.length > 0 && !filters.city_id) {
          setFilters(prev => ({ ...prev, city_id: karachiOnly[0].id.toString() }));
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, [filters.city_id, setFilters]);

  return (
    <div className="bg-white dark:bg-gray-800/80 border-2 border-[#7e246c] rounded-lg mx-0 my-4 w-full max-w-none">
      <div className="px-4 py-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 w-full">
          <div>
            <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">City</label>
            <select 
              value={filters.city_id} 
              onChange={(e) => setFilters({...filters, city_id: e.target.value})}
              className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-black dark:placeholder-white"
              disabled={citiesLoading}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Brand</label>
            <select 
              value={filters.brand_id} 
              onChange={(e) => setFilters({...filters, brand_id: e.target.value})}
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
              onChange={(e) => setFilters({...filters, type_id: e.target.value})}
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
          <div className="col-span-2">
            <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">Tags</label>
            <TagSelector
              selectedTags={filters.tag_ids || []}
              onTagsChange={(tagIds) => setFilters({...filters, tag_ids: tagIds})}
              placeholder="Search tags to filter cars..."
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
};

export default CarFilters; 