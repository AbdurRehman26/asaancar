import React, { useState } from 'react';
import CarFilters from './car-filters';

export type CarFiltersType = {
  brand_id: string;
  type_id: string;
  store_id: string;
  transmission: string;
  fuel_type: string;
  min_seats: string;
  max_price: string;
};

interface UniversalCarFilterProps {
  onSearch?: (filters: CarFiltersType) => void;
  initialFilters?: CarFiltersType;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const defaultFilters: CarFiltersType = {
  brand_id: '',
  type_id: '',
  store_id: '',
  transmission: '',
  fuel_type: '',
  min_seats: '',
  max_price: '',
};

const UniversalCarFilter: React.FC<UniversalCarFilterProps> = ({
  onSearch,
  initialFilters = defaultFilters,
  loading = false,
  className = '',
  fullWidth = false,
}) => {
  const [filters, setFilters] = useState<CarFiltersType>(initialFilters);

  const handleSearch = () => {
    if (onSearch) onSearch(filters);
  };

  // Override CarFilters container classes for fullWidth
  const filterClass = fullWidth ? 'w-full my-4' : className;

  return (
    <div className={filterClass}>
      <CarFilters
        filters={filters}
        setFilters={setFilters}
        handleSearch={handleSearch}
        loading={loading}
      />
    </div>
  );
};

export default UniversalCarFilter; 