
import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/utils';
import { Search, Calendar, Clock, User, X, ChevronDown } from 'lucide-react';

export type PickAndDropFiltersType = {
    start_location: string;
    end_location: string;
    driver_gender: string;
    departure_date: string;
    departure_time: string;
};

interface PickAndDropFilterProps {
    onSearch: (filters: PickAndDropFiltersType) => void;
    className?: string;
    fullWidth?: boolean;
}


const SearchableAreaSelect = ({
    value,
    onChange,
    cityId,
    areas,
    label,
    placeholder = "Search or select area..."
}: {
    value: number | undefined;
    onChange: (areaId: number | undefined) => void;
    cityId: number | undefined;
    areas: { [cityId: number]: { id: number; name: string }[] };
    label: string;
    placeholder?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayValue, setDisplayValue] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const availableAreas = cityId ? (areas[cityId] || []) : [];

    // Sync display value with selected value
    useEffect(() => {
        if (value) {
            const area = availableAreas.find(a => a.id === value);
            if (area) {
                setDisplayValue(area.name);
                setSearchTerm(''); // Clear search term when value is selected
            }
        } else if (!searchTerm) {
            setDisplayValue('');
        }
    }, [value, availableAreas]);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 300); // Wait 300ms

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Filter logic based on debounced term
    const filteredAreas = availableAreas.filter(area =>
        area.name.toLowerCase().includes(debouncedTerm.toLowerCase())
    );

    // Only show dropdown if searching (>= 3 chars) or if explicitly focused with existing list? 
    // User requirement: "start search after 3 letters".
    // So we only show results if debouncedTerm.length >= 3.
    const shouldShowDropdown = isOpen && cityId && debouncedTerm.length >= 3;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (areaId: number) => {
        onChange(areaId);
        setIsOpen(false);
        setSearchTerm('');
        setDebouncedTerm('');
    };

    const handleClear = () => {
        onChange(undefined);
        setSearchTerm('');
        setDebouncedTerm('');
        setDisplayValue('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm || displayValue}
                    onChange={(e) => {
                        const val = e.target.value;
                        setSearchTerm(val);
                        setDisplayValue(val);
                        setIsOpen(true);

                        // If user clears input, clear selection immediately
                        if (!val) {
                            onChange(undefined);
                        }
                    }}
                    onFocus={() => {
                        if (cityId) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={!cityId}
                    className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#7e246c] placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {(value || searchTerm) && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {shouldShowDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredAreas.length > 0 ? (
                        filteredAreas.map((area) => (
                            <button
                                key={area.id}
                                type="button"
                                onClick={() => handleSelect(area.id)}
                                className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white ${value === area.id ? 'bg-[#7e246c]/10 dark:bg-[#7e246c]/20' : ''
                                    }`}
                            >
                                {area.name}
                            </button>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                            No areas found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PickAndDropFilter: React.FC<PickAndDropFilterProps> = ({
    onSearch,
    className = '',
    fullWidth = false,
}) => {
    const [filters, setFilters] = useState<PickAndDropFiltersType>({
        start_location: '',
        end_location: '',
        driver_gender: '',
        departure_date: '',
        departure_time: '',
    });

    const [startAreaId, setStartAreaId] = useState<number | undefined>(undefined);
    const [endAreaId, setEndAreaId] = useState<number | undefined>(undefined);

    const [karachiCityId, setKarachiCityId] = useState<number | undefined>(undefined);
    const [karachiAreas, setKarachiAreas] = useState<{ id: number; name: string }[]>([]);
    const areasByCity = karachiCityId ? { [karachiCityId]: karachiAreas } : {};

    // Fetch Karachi city and areas
    useEffect(() => {
        const fetchKarachiAreas = async () => {
            try {
                const citiesRes = await apiFetch('/api/cities');
                if (citiesRes.ok) {
                    const citiesData = await citiesRes.json();
                    const cities = citiesData.data || citiesData;
                    const karachi = cities.find((c: { name: string }) => c.name === 'Karachi');
                    if (karachi) {
                        setKarachiCityId(karachi.id);
                        const areasRes = await apiFetch(`/api/areas?city_id=${karachi.id}`);
                        if (areasRes.ok) {
                            const areasData = await areasRes.json();
                            const areas = (areasData.data || areasData).filter((a: { is_active?: boolean }) => a.is_active !== false);
                            setKarachiAreas(areas);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch Karachi areas:', err);
            }
        };
        fetchKarachiAreas();
    }, []);

    // Update filters when area selections change
    useEffect(() => {
        const startArea = startAreaId ? karachiAreas.find(a => a.id === startAreaId) : null;
        const endArea = endAreaId ? karachiAreas.find(a => a.id === endAreaId) : null;
        setFilters(prev => ({
            ...prev,
            start_location: startArea ? startArea.name : '',
            end_location: endArea ? endArea.name : '',
        }));
    }, [startAreaId, endAreaId, karachiAreas]);

    const handleSearch = () => {
        onSearch(filters);
    };

    const filterClass = fullWidth ? 'w-full max-w-none' : className;

    return (
        <div className={`${filterClass} bg-white dark:bg-gray-800/80 border-2 border-[#7e246c] rounded-lg mx-0 my-4 p-4 md:p-6 shadow-lg relative`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <SearchableAreaSelect
                    value={startAreaId}
                    onChange={setStartAreaId}
                    cityId={karachiCityId}
                    areas={areasByCity}
                    label="Start Location"
                    placeholder="E.g. Clifton"
                />
                <SearchableAreaSelect
                    value={endAreaId}
                    onChange={setEndAreaId}
                    cityId={karachiCityId}
                    areas={areasByCity}
                    label="End Location"
                    placeholder="E.g. Gulshan"
                />
                <div>
                    <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">
                        Driver Gender
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={filters.driver_gender}
                            onChange={(e) => setFilters({ ...filters, driver_gender: e.target.value })}
                            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#7e246c]"
                        >
                            <option value="">Any</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">
                        Departure Date
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="date"
                            value={filters.departure_date}
                            onChange={(e) => setFilters({ ...filters, departure_date: e.target.value })}
                            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#7e246c]"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-[#7e246c] dark:text-white mb-1">
                        Departure Time
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="time"
                            value={filters.departure_time}
                            onChange={(e) => setFilters({ ...filters, departure_time: e.target.value })}
                            className="w-full border border-[#7e246c] bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#7e246c]"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleSearch}
                    className="w-full md:w-auto px-8 py-3 bg-[#7e246c] text-white font-bold rounded-lg hover:bg-[#6a1f5c] transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                    <Search className="h-5 w-5" />
                    Search Pick & Drop
                </button>
            </div>
        </div>
    );
};

export default PickAndDropFilter;
