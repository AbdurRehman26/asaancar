import React, { useState, useEffect } from 'react';
import CarFilters from './car-filters';

export type CarFiltersType = {
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

interface UniversalCarFilterProps {
  onSearch?: (filters: CarFiltersType) => void;
  onClearFilters?: () => void;
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
  min_price: '',
  max_price: '',
  tag_ids: [],
};

const UniversalCarFilter: React.FC<UniversalCarFilterProps> = ({
  onSearch,
  onClearFilters,
  initialFilters = defaultFilters,
  loading = false,
  className = '',
  fullWidth = false,
}) => {
  const [filters, setFilters] = useState<CarFiltersType>(initialFilters);

  // Sync internal filters with initialFilters prop
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleSearch = (newFilters?: Partial<CarFiltersType>) => {
    if (onSearch) {
      if (newFilters) {
        onSearch(newFilters as CarFiltersType);
      } else {
        onSearch(filters);
      }
    }
  };

  // Use fullWidth styling when fullWidth is true, otherwise use provided className
  const filterClass = fullWidth ? 'w-full max-w-none' : className;

  return (
    <div className={filterClass}>
      <CarFilters
        filters={filters}
        setFilters={setFilters}
        handleSearch={handleSearch}
        onClearFilters={onClearFilters}
        loading={loading}
      />
    </div>
  );
};

export default UniversalCarFilter; 