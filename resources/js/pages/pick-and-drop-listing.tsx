import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, Filter, ArrowRight, Clock, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import { apiFetch } from '@/lib/utils';

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
    description?: string;
    price_per_person?: number;
    currency: string;
    is_active: boolean;
    stops?: PickAndDropStop[];
}

export default function PickAndDropListing() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [services, setServices] = useState<PickAndDropService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        start_location: '',
        end_location: '',
        driver_gender: '',
        min_spaces: '',
        departure_date: '',
    });
    const [showFilters, setShowFilters] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage] = useState(12);
    const [total, setTotal] = useState(0);
    const [expandedStops, setExpandedStops] = useState<Set<number>>(new Set());

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when filters change
    }, [filters, searchTerm]);

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

            const response = await apiFetch(`/api/pick-and-drop?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }
            const data = await response.json();

            // Handle paginated response from Laravel Resource collection
            // Laravel returns: { data: [...], links: {...}, meta: { current_page, last_page, per_page, total, ... } }
            if (data.data && Array.isArray(data.data)) {
                setServices(data.data);
                // Check for pagination metadata in meta object (Laravel Resource collection format)
                if (data.meta && typeof data.meta === 'object') {
                    // Handle case where meta values might be arrays (extract first value)
                    const lastPage = Array.isArray(data.meta.last_page)
                        ? data.meta.last_page[0]
                        : data.meta.last_page;
                    const total = Array.isArray(data.meta.total)
                        ? data.meta.total[0]
                        : data.meta.total;

                    if (lastPage !== undefined) {
                        setTotalPages(Number(lastPage) || 1);
                        setTotal(Number(total) || 0);
                    } else {
                        // If no pagination metadata, check if we got a full page
                        if (data.data.length === perPage) {
                            setTotalPages(2);
                            setTotal(data.data.length);
                        } else {
                            setTotalPages(1);
                            setTotal(data.data.length);
                        }
                    }
                } else if (data.last_page !== undefined) {
                    // Fallback: check if pagination data is at root level
                    const lastPage = Array.isArray(data.last_page) ? data.last_page[0] : data.last_page;
                    const total = Array.isArray(data.total) ? data.total[0] : data.total;
                    setTotalPages(Number(lastPage) || 1);
                    setTotal(Number(total) || 0);
                } else {
                    // If no pagination metadata, check if we got a full page
                    if (data.data.length === perPage) {
                        setTotalPages(2);
                        setTotal(data.data.length);
                    } else {
                        setTotalPages(1);
                        setTotal(data.data.length);
                    }
                }
            } else if (Array.isArray(data)) {
                // Fallback for non-paginated response
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

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const clearFilters = () => {
        setFilters({
            start_location: '',
            end_location: '',
            driver_gender: '',
            min_spaces: '',
            departure_date: '',
        });
        setSearchTerm('');
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-gray-900">
            <Navbar auth={{ user }} />

            <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-bold text-[#7e246c] dark:text-white mb-4">
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
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search by start or end location..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setFilters({ ...filters, start_location: e.target.value });
                                    }}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Filter className="h-5 w-5" />
                                Filters
                            </button>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Start Location
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.start_location}
                                        onChange={(e) => setFilters({ ...filters, start_location: e.target.value })}
                                        placeholder="From..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        End Location
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.end_location}
                                        onChange={(e) => setFilters({ ...filters, end_location: e.target.value })}
                                        placeholder="To..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
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

                        {(filters.start_location || filters.end_location || filters.driver_gender || filters.departure_date) && (
                            <div className="mt-4 flex items-center gap-2">
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-[#7e246c] hover:underline"
                                >
                                    Clear Filters
                                </button>
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
                                                className={`px-3 py-1 rounded font-semibold border transition-colors ${
                                                    pageNum === currentPage
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
                                <div
                                    key={service.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-shadow flex flex-col"
                                >
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="h-5 w-5 text-[#7e246c]" />
                                            <h3 className="text-lg font-semibold text-[#7e246c] dark:text-white">
                                                {service.start_location}
                                            </h3>
                                            <ArrowRight className="h-4 w-4 text-gray-400" />
                                            <h3 className="text-lg font-semibold text-[#7e246c] dark:text-white">
                                                {service.end_location}
                                            </h3>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            <p>by {service.user.name}</p>
                                            {user && service.user.phone_number && (
                                                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                    📞 {service.user.phone_number}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Calendar className="h-4 w-4" />
                                            {formatDateTime(service.departure_time)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Users className="h-4 w-4" />
                                            {service.available_spaces} space{service.available_spaces !== 1 ? 's' : ''} available
                                        </div>
                                        {service.price_per_person && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                {service.currency} {service.price_per_person.toLocaleString()} per person
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                service.driver_gender === 'female'
                                                    ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                            }`}>
                                                {service.driver_gender === 'female' ? '👩' : '👨'} {service.driver_gender === 'female' ? 'Female' : 'Male'} driver
                                            </span>
                                        </div>
                                    </div>

                                    {service.car_brand && (
                                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                            <strong>Car:</strong> {service.car_brand} {service.car_model} ({service.car_color})
                                            {service.car_seats && ` • ${service.car_seats} seats`}
                                        </div>
                                    )}

                                    {service.stops && service.stops.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={() => {
                                                    const newExpanded = new Set(expandedStops);
                                                    if (newExpanded.has(service.id)) {
                                                        newExpanded.delete(service.id);
                                                    } else {
                                                        newExpanded.add(service.id);
                                                    }
                                                    setExpandedStops(newExpanded);
                                                }}
                                                className="w-full text-left text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between gap-2 hover:text-[#7e246c] transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Stops ({service.stops.length})
                                                </div>
                                                {expandedStops.has(service.id) ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </button>
                                            {expandedStops.has(service.id) ? (
                                                <ul className="space-y-1">
                                                    {service.stops.map((stop) => (
                                                        <li key={stop.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-[#7e246c] rounded-full"></span>
                                                            {stop.location} ({formatDateTime(stop.stop_time)})
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <ul className="space-y-1">
                                                    {service.stops.slice(0, 2).map((stop) => (
                                                        <li key={stop.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-[#7e246c] rounded-full"></span>
                                                            {stop.location} ({formatDateTime(stop.stop_time)})
                                                        </li>
                                                    ))}
                                                    {service.stops.length > 2 && (
                                                        <li className="text-xs text-gray-500 dark:text-gray-500 italic">
                                                            ... and {service.stops.length - 2} more stop{service.stops.length - 2 !== 1 ? 's' : ''}
                                                        </li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    {service.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 line-clamp-2">
                                            {service.description}
                                        </p>
                                    )}

                                    <button
                                        onClick={() => navigate(`/pick-and-drop/${service.id}`)}
                                        className="mt-auto w-full py-2 px-4 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
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
                                                className={`px-3 py-1 rounded font-semibold border transition-colors ${
                                                    pageNum === currentPage
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

