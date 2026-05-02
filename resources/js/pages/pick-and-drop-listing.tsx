import { useAuth } from '@/components/AuthContext';
import Footer from '@/components/Footer';
import GooglePlacesInput from '@/components/GooglePlacesInput';
import Navbar from '@/components/navbar';
import PickAndDropCard from '@/components/PickAndDropCard';
import SEO from '@/components/SEO';
import { apiFetch } from '@/lib/utils';
import { ChevronDown, Clock, Filter, MapPin, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
        start_latitude: searchParams.get('start_latitude') || '',
        start_longitude: searchParams.get('start_longitude') || '',
        end_location: searchParams.get('end_location') || '',
        end_latitude: searchParams.get('end_latitude') || '',
        end_longitude: searchParams.get('end_longitude') || '',
        driver_gender: searchParams.get('driver_gender') || '',
        min_spaces: searchParams.get('min_spaces') || '',
        departure_date: searchParams.get('departure_date') || '',
        departure_time: searchParams.get('departure_time') || '',
    });
    const [locationInputs, setLocationInputs] = useState({
        start_location: searchParams.get('start_location') || '',
        end_location: searchParams.get('end_location') || '',
    });
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [totalPages, setTotalPages] = useState(1);
    const [perPage] = useState(12);
    const [total, setTotal] = useState(0);

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
            if (filters.start_latitude) {
                params.append('start_latitude', filters.start_latitude);
            }
            if (filters.start_longitude) {
                params.append('start_longitude', filters.start_longitude);
            }
            if (filters.end_location) {
                params.append('end_location', filters.end_location);
            }
            if (filters.end_latitude) {
                params.append('end_latitude', filters.end_latitude);
            }
            if (filters.end_longitude) {
                params.append('end_longitude', filters.end_longitude);
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

    const clearFilters = () => {
        setFilters({
            start_location: '',
            start_latitude: '',
            start_longitude: '',
            end_location: '',
            end_latitude: '',
            end_longitude: '',
            driver_gender: '',
            min_spaces: '',
            departure_date: '',
            departure_time: '',
        });
        setLocationInputs({
            start_location: '',
            end_location: '',
        });
    };

    // Get the base URL for Open Graph image
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const ogImage = `${baseUrl}/pick-n-drop.png`;

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
            <SEO
                title="Find a Ride - Multiple Stops | Asaancar"
                description="Find convenient rides from location A to location B with multiple stops. Book with male or female drivers. Search by start location, end location, departure time, and driver gender. Available in Karachi and across Pakistan."
                image={ogImage}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                type="website"
                siteName="Asaancar"
            />
            <Navbar auth={{ user }} />

            <div className="px-4 pt-20 pb-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-white/60 bg-white/80 px-6 py-7 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.28)] backdrop-blur md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-[#17141f]/88 dark:[background-image:linear-gradient(90deg,_rgba(23,20,31,0.94)_0%,_rgba(23,20,31,0.94)_44%,_rgba(255,255,255,0.14)_100%)] dark:shadow-none">
                        <div className="text-center md:text-left">
                            <h1 className="mb-4 text-4xl font-bold text-[#2b1128] dark:text-white">Find a Ride</h1>
                            <p className="text-lg text-[#6f556c] dark:text-white/65">Find rides from location A to location B with multiple stops</p>
                        </div>
                        <div className="flex flex-col items-center gap-4 md:items-end">
                            <a
                                href="https://play.google.com/store/apps/details?id=com.asaancar.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e246c]"
                            >
                                <img src="/google-play-icon.png" alt="Get it on Google Play" className="h-10 w-auto sm:h-12 md:h-14" />
                            </a>
                            {user ? (
                                <button
                                    onClick={() => navigate('/dashboard/pick-and-drop/create')}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-[#7e246c] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#6a1f5c]"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add a Ride
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-[#7e246c] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#6a1f5c]"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add a Ride
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8 rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                        <div className="mb-4 flex items-center justify-between">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 text-lg font-semibold text-[#7e246c] dark:text-white"
                            >
                                <Filter className="h-5 w-5" />
                                Filter Services
                                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {(filters.start_location ||
                                filters.end_location ||
                                filters.driver_gender ||
                                filters.departure_date ||
                                filters.departure_time) && (
                                <button onClick={clearFilters} className="text-sm text-[#7e246c] hover:underline">
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        {isFilterOpen && (
                            <div className="grid grid-cols-1 gap-4 duration-200 animate-in fade-in slide-in-from-top-4 md:grid-cols-2 lg:grid-cols-5">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75">Start Location</label>
                                    <GooglePlacesInput
                                        value={locationInputs.start_location}
                                        placeholder="From..."
                                        onChange={(value) => {
                                            setLocationInputs((prev) => ({
                                                ...prev,
                                                start_location: value,
                                            }));

                                            if (value === '') {
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    start_location: '',
                                                    start_latitude: '',
                                                    start_longitude: '',
                                                }));
                                            }
                                        }}
                                        onPlaceSelected={(place) => {
                                            setLocationInputs((prev) => ({
                                                ...prev,
                                                start_location: place.address,
                                            }));

                                            setFilters((prev) => ({
                                                ...prev,
                                                start_location: place.address,
                                                start_latitude: place.latitude?.toString() ?? '',
                                                start_longitude: place.longitude?.toString() ?? '',
                                            }));
                                        }}
                                        className="w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75">End Location</label>
                                    <GooglePlacesInput
                                        value={locationInputs.end_location}
                                        placeholder="To..."
                                        onChange={(value) => {
                                            setLocationInputs((prev) => ({
                                                ...prev,
                                                end_location: value,
                                            }));

                                            if (value === '') {
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    end_location: '',
                                                    end_latitude: '',
                                                    end_longitude: '',
                                                }));
                                            }
                                        }}
                                        onPlaceSelected={(place) => {
                                            setLocationInputs((prev) => ({
                                                ...prev,
                                                end_location: place.address,
                                            }));

                                            setFilters((prev) => ({
                                                ...prev,
                                                end_location: place.address,
                                                end_latitude: place.latitude?.toString() ?? '',
                                                end_longitude: place.longitude?.toString() ?? '',
                                            }));
                                        }}
                                        className="w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75">Driver Gender</label>
                                    <select
                                        value={filters.driver_gender}
                                        onChange={(e) => setFilters({ ...filters, driver_gender: e.target.value })}
                                        className="w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                    >
                                        <option value="">All</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-[#6b5368] dark:text-white/75">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        Departure Time
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={filters.departure_time}
                                            onChange={(e) => setFilters({ ...filters, departure_time: e.target.value })}
                                            className="w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 pr-10 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                        />
                                        {filters.departure_time && (
                                            <button
                                                type="button"
                                                onClick={() => setFilters({ ...filters, departure_time: '' })}
                                                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                title="Clear time filter"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-[#6b5368] dark:text-white/75">Departure Date</label>
                                    <input
                                        type="date"
                                        value={filters.departure_date}
                                        onChange={(e) => setFilters({ ...filters, departure_date: e.target.value })}
                                        className="w-full rounded-xl border border-[#7e246c]/12 bg-[#fcf7fb] px-4 py-2 text-[#2b1128] focus:border-[#7e246c]/30 focus:bg-white focus:ring-2 focus:ring-[#7e246c]/10 focus:outline-none dark:border-white/10 dark:bg-white/6 dark:text-white dark:focus:bg-white/8"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Pagination - Top */}
                    {!loading && services.length > 0 && totalPages > 1 && (
                        <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-[1.25rem] border border-white/70 bg-white/90 p-4 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.25)] backdrop-blur sm:flex-row dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {total > 0 ? (
                                    <>
                                        Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, total)} of {total} services
                                    </>
                                ) : (
                                    <>
                                        Showing {services.length} service{services.length !== 1 ? 's' : ''}
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="rounded border border-[#7e246c] bg-white px-4 py-2 font-semibold text-[#7e246c] transition-colors hover:bg-[#7e246c] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-gray-800/80 dark:text-[#7e246c]"
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
                                                className={`rounded border px-3 py-1 font-semibold transition-colors ${
                                                    pageNum === currentPage
                                                        ? 'border-[#7e246c] bg-[#7e246c] text-white'
                                                        : 'border-[#7e246c] bg-white text-[#7e246c] hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:bg-gray-800/80 dark:text-[#7e246c]'
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
                                    className="rounded border border-[#7e246c] bg-white px-4 py-2 font-semibold text-[#7e246c] transition-colors hover:bg-[#7e246c] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-gray-800/80 dark:text-[#7e246c]"
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
                        <div className="py-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#7e246c] border-t-transparent"></div>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-white/70 bg-white/90 py-12 text-center shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                            <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-lg text-gray-600 dark:text-gray-400">No pick and drop services found.</p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Try adjusting your filters or check back later.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {services.map((service) => (
                                <PickAndDropCard
                                    key={service.id}
                                    service={service}
                                    showUserInfo={Boolean(user)}
                                    variant="dashboard"
                                    onClick={() => navigate(`/pick-and-drop/${service.id}`)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && services.length > 0 && totalPages > 1 && (
                        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[1.25rem] border border-white/70 bg-white/90 p-4 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.25)] backdrop-blur sm:flex-row dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {total > 0 ? (
                                    <>
                                        Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, total)} of {total} services
                                    </>
                                ) : (
                                    <>
                                        Showing {services.length} service{services.length !== 1 ? 's' : ''}
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="rounded border border-[#7e246c] bg-white px-4 py-2 font-semibold text-[#7e246c] transition-colors hover:bg-[#7e246c] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-gray-800/80 dark:text-[#7e246c]"
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
                                                className={`rounded border px-3 py-1 font-semibold transition-colors ${
                                                    pageNum === currentPage
                                                        ? 'border-[#7e246c] bg-[#7e246c] text-white'
                                                        : 'border-[#7e246c] bg-white text-[#7e246c] hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:bg-gray-800/80 dark:text-[#7e246c]'
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
                                    className="rounded border border-[#7e246c] bg-white px-4 py-2 font-semibold text-[#7e246c] transition-colors hover:bg-[#7e246c] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-gray-800/80 dark:text-[#7e246c]"
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
