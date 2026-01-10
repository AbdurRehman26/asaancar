import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Plus, ChevronDown, X, Filter } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import { apiFetch } from '@/lib/utils';
import SEO from '@/components/SEO';
import PickAndDropCard from '@/components/PickAndDropCard';

interface PickAndDropStop {
    id: number;
    location: string;
    stop_time: string;
    order: number;
    notes?: string;
}

interface PickAndDropService {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone_number?: string;
    };
    car?: {
        id: number;
        name: string;
    };
    start_location: string;
    end_location: string;
    available_spaces: number;
    driver_gender: 'male' | 'female';
    car_brand?: string;
    car_model?: string;
    car_color?: string;
    car_seats?: number;
    car_transmission?: string;
    car_fuel_type?: string;
    departure_time: string;
    formatted_departure_time?: string;
    description?: string;
    price_per_person?: number;
    currency: string;
    is_active: boolean;
    is_everyday?: boolean;
    is_roundtrip?: boolean;
    return_time?: string;
    formatted_return_time?: string;
    stops?: PickAndDropStop[];
    schedule_type: 'once' | 'everyday' | 'custom' | 'weekend' | 'weekdays';
    selected_days?: string;
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

export default function PickAndDropListing() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const [services, setServices] = useState<PickAndDropService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(min-width: 768px)').matches;
        }
        return false;
    });

    const [filters, setFilters] = useState({
        start_location: searchParams.get('start_location') || '',
        end_location: searchParams.get('end_location') || '',
        driver_gender: searchParams.get('driver_gender') || '',
        min_spaces: searchParams.get('min_spaces') || '',
        departure_date: searchParams.get('departure_date') || '',
        departure_time: searchParams.get('departure_time') || '',
    });
    const [startAreaId, setStartAreaId] = useState<number | undefined>(undefined);
    const [endAreaId, setEndAreaId] = useState<number | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [totalPages, setTotalPages] = useState(1);
    const [perPage] = useState(12);
    const [total, setTotal] = useState(0);

    const [karachiCityId, setKarachiCityId] = useState<number | undefined>(undefined);
    const [karachiAreas, setKarachiAreas] = useState<{ id: number; name: string }[]>([]);
    const areasByCity = karachiCityId ? { [karachiCityId]: karachiAreas } : {};

    useEffect(() => {
        // Sync filters to URL
        const params = new URLSearchParams(window.location.search); // Use existing params

        if (currentPage > 1) {
            params.set('page', currentPage.toString());
        } else {
            params.delete('page');
        }

        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        setSearchParams(params, { replace: true });
    }, [filters, currentPage, setSearchParams]);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when filters change
    }, [filters]);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage.toString());
            params.append('per_page', perPage.toString());

            if (filters.start_location) {
                params.append('start_location', filters.start_location);
            }
            if (filters.end_location) {
                params.append('end_location', filters.end_location);
            }
            if (filters.driver_gender) {
                params.append('driver_gender', filters.driver_gender);
            }
            if (filters.min_spaces) {
                params.append('min_spaces', filters.min_spaces);
            }
            if (filters.departure_date) {
                params.append('departure_date', filters.departure_date);
            }
            if (filters.departure_time) {
                params.append('departure_time', filters.departure_time);
            }

            const response = await apiFetch(`/api/pick-and-drop?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }
            const data = await response.json();

            // Handle paginated response from Laravel Resource collection
            if (data.data && Array.isArray(data.data)) {
                setServices(data.data);
                // Check for pagination metadata
                if (data.meta && typeof data.meta === 'object') {
                    const lastPage = Array.isArray(data.meta.last_page) ? data.meta.last_page[0] : data.meta.last_page;
                    const total = Array.isArray(data.meta.total) ? data.meta.total[0] : data.meta.total;

                    if (lastPage !== undefined) {
                        setTotalPages(Number(lastPage) || 1);
                        setTotal(Number(total) || 0);
                    } else {
                        if (data.data.length === perPage) {
                            setTotalPages(2);
                            setTotal(data.data.length);
                        } else {
                            setTotalPages(1);
                            setTotal(data.data.length);
                        }
                    }
                } else if (data.last_page !== undefined) {
                    const lastPage = Array.isArray(data.last_page) ? data.last_page[0] : data.last_page;
                    const total = Array.isArray(data.total) ? data.total[0] : data.total;
                    setTotalPages(Number(lastPage) || 1);
                    setTotal(Number(total) || 0);
                } else {
                    if (data.data.length === perPage) {
                        setTotalPages(2);
                        setTotal(data.data.length);
                    } else {
                        setTotalPages(1);
                        setTotal(data.data.length);
                    }
                }
            } else if (Array.isArray(data)) {
                setServices(data);
                setTotalPages(1);
                setTotal(data.length);
            } else {
                setServices([]);
                setTotalPages(1);
                setTotal(0);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load services');
            setServices([]);
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage, perPage]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

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

    // Sync state IDs with filter names once areas are loaded (initial load only)
    useEffect(() => {
        if (karachiAreas.length > 0) {
            if (filters.start_location && !startAreaId) {
                const area = karachiAreas.find(a => a.name === filters.start_location);
                if (area) setStartAreaId(area.id);
            }
            if (filters.end_location && !endAreaId) {
                const area = karachiAreas.find(a => a.name === filters.end_location);
                if (area) setEndAreaId(area.id);
            }
        }
    }, [karachiAreas, filters.start_location, filters.end_location]);

    const clearFilters = () => {
        setFilters({
            start_location: '',
            end_location: '',
            driver_gender: '',
            min_spaces: '',
            departure_date: '',
            departure_time: '',
        });
        setStartAreaId(undefined);
        setEndAreaId(undefined);
    };

    // Get the base URL for Open Graph image
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const ogImage = `${baseUrl}/pick-n-drop.png`;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
            <SEO
                title="Pick & Drop Services - Find Rides with Multiple Stops | Asaancar"
                description="Find convenient pick and drop services from location A to location B with multiple stops. Book rides with male or female drivers. Search by start location, end location, departure time, and driver gender. Available in Karachi and across Pakistan."
                image={ogImage}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                type="website"
                siteName="Asaancar"
            />
            <Navbar auth={{ user }} />

            <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-bold text-[#7e246c] dark:text-white mb-4 mt-8">
                                Pick & Drop Services
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                Find rides from location A to location B with multiple stops
                            </p>
                        </div>
                        {user ? (
                            <button
                                onClick={() => navigate('/dashboard/pick-and-drop/create')}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors font-semibold"
                            >
                                <Plus className="h-5 w-5" />
                                Add Service
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors font-semibold"
                            >
                                <Plus className="h-5 w-5" />
                                Add Service
                            </button>
                        )}
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 text-lg font-semibold text-[#7e246c] dark:text-white"
                            >
                                <Filter className="h-5 w-5" />
                                Filter Services
                                <ChevronDown
                                    className={`h-5 w-5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {(filters.start_location || filters.end_location || filters.driver_gender || filters.departure_date || filters.departure_time) && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-[#7e246c] hover:underline"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        {isFilterOpen && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
                                <SearchableAreaSelect
                                    value={startAreaId}
                                    onChange={(id) => {
                                        setStartAreaId(id);
                                        const area = id ? karachiAreas.find(a => a.id === id) : null;
                                        setFilters(prev => ({
                                            ...prev,
                                            start_location: area ? area.name : ''
                                        }));
                                    }}
                                    cityId={karachiCityId}
                                    areas={areasByCity}
                                    label="Start Location"
                                    placeholder="From..."
                                />
                                <SearchableAreaSelect
                                    value={endAreaId}
                                    onChange={(id) => {
                                        setEndAreaId(id);
                                        const area = id ? karachiAreas.find(a => a.id === id) : null;
                                        setFilters(prev => ({
                                            ...prev,
                                            end_location: area ? area.name : ''
                                        }));
                                    }}
                                    cityId={karachiCityId}
                                    areas={areasByCity}
                                    label="End Location"
                                    placeholder="To..."
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Driver Gender
                                    </label>
                                    <select
                                        value={filters.driver_gender}
                                        onChange={(e) => setFilters({ ...filters, driver_gender: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">All</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        Departure Time
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={filters.departure_time}
                                            onChange={(e) => setFilters({ ...filters, departure_time: e.target.value })}
                                            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                        />
                                        {filters.departure_time && (
                                            <button
                                                type="button"
                                                onClick={() => setFilters({ ...filters, departure_time: '' })}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                title="Clear time filter"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Departure Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.departure_date}
                                        onChange={(e) => setFilters({ ...filters, departure_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Pagination - Top */}
                    {!loading && services.length > 0 && totalPages > 1 && (
                        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {total > 0 ? (
                                    <>Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} services</>
                                ) : (
                                    <>Showing {services.length} service{services.length !== 1 ? 's' : ''}</>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:text-[#7e246c] transition-colors"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 7) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 4) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 3) {
                                            pageNum = totalPages - 6 + i;
                                        } else {
                                            pageNum = currentPage - 3 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1 rounded font-semibold border transition-colors ${pageNum === currentPage
                                                    ? 'bg-[#7e246c] text-white border-[#7e246c]'
                                                    : 'border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c]'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:text-[#7e246c] transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 text-lg">No pick and drop services found.</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try adjusting your filters or check back later.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <PickAndDropCard
                                    key={service.id}
                                    service={service}
                                    onClick={() => navigate(`/pick-and-drop/${service.id}`)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && services.length > 0 && totalPages > 1 && (
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {total > 0 ? (
                                    <>Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} services</>
                                ) : (
                                    <>Showing {services.length} service{services.length !== 1 ? 's' : ''}</>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:text-[#7e246c] transition-colors"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 7) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 4) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 3) {
                                            pageNum = totalPages - 6 + i;
                                        } else {
                                            pageNum = currentPage - 3 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1 rounded font-semibold border transition-colors ${pageNum === currentPage
                                                    ? 'bg-[#7e246c] text-white border-[#7e246c]'
                                                    : 'border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c]'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:text-[#7e246c] transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
