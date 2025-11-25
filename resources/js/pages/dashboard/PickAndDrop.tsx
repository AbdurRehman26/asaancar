import { useState, useEffect } from 'react';
import { Plus, MapPin, Calendar, Users, Edit, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { apiFetch } from '@/lib/utils';
import { Link } from 'react-router-dom';

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

export default function PickAndDropPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<PickAndDropService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        driver_gender: '',
        min_spaces: '',
        departure_date: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage] = useState(12);

    useEffect(() => {
        fetchServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, searchTerm, user, currentPage]);

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            // Check if user is admin
            const isAdmin = user && Array.isArray(user.roles) && user.roles.includes('admin');
            
            // Build query parameters
            const params = new URLSearchParams();
            if (searchTerm) {
                params.append('start_location', searchTerm);
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
            params.append('page', currentPage.toString());
            params.append('per_page', perPage.toString());

            // If not admin, only fetch user's own services
            if (!isAdmin) {
                const response = await apiFetch(`/api/customer/pick-and-drop/my-services?${params.toString()}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch your services');
                }
                const data = await response.json();
                setServices(data.data || []);
                setTotalPages(data.meta?.last_page || 1);
            } else {
                // Admin can see all services
                const response = await apiFetch(`/api/pick-and-drop?${params.toString()}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch services');
                }
                const data = await response.json();
                setServices(data.data || []);
                setTotalPages(data.meta?.last_page || 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyServices = async () => {
        if (!user) return;
        setCurrentPage(1);
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('page', '1');
            params.append('per_page', perPage.toString());
            
            const response = await apiFetch(`/api/customer/pick-and-drop/my-services?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch your services');
            }
            const data = await response.json();
            setServices(data.data || []);
            setTotalPages(data.meta?.last_page || 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load your services');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            const response = await apiFetch(`/api/customer/pick-and-drop/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete service');
            }
            setServices(services.filter(s => s.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete service');
        }
    };

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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#7e246c] dark:text-white">Pick & Drop Services</h1>
                {user && (
                    <Link
                        to="/dashboard/pick-and-drop/create"
                        className="flex items-center gap-2 px-4 py-2 bg-[#7e246c] text-white rounded-lg hover:bg-[#6a1f5c] transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add Service
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by location..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c] dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <select
                        value={filters.driver_gender}
                        onChange={(e) => {
                            setFilters({ ...filters, driver_gender: e.target.value });
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Genders</option>
                        <option value="male">Male Driver</option>
                        <option value="female">Female Driver</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Min Spaces"
                        value={filters.min_spaces}
                        onChange={(e) => {
                            setFilters({ ...filters, min_spaces: e.target.value });
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                    />
                    <input
                        type="date"
                        value={filters.departure_date}
                        onChange={(e) => {
                            setFilters({ ...filters, departure_date: e.target.value });
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7e246c] dark:bg-gray-700 dark:text-white"
                    />
                    {user && Array.isArray(user.roles) && user.roles.includes('admin') && (
                        <button
                            onClick={() => {
                                setCurrentPage(1);
                                fetchMyServices();
                            }}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            My Services
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : services.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No pick and drop services found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#7e246c] dark:text-white">
                                        {service.start_location} → {service.end_location}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        by {service.user.name}
                                    </p>
                                </div>
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/pick-and-drop/${service.id}`}
                                            className="p-2 text-[#7e246c] hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded"
                                            title="View Details"
                                        >
                                            <MapPin className="h-4 w-4" />
                                        </Link>
                                        {user && user.id === service.user.id && (
                                            <>
                                                <Link
                                                    to={`/dashboard/pick-and-drop/${service.id}/edit`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </>
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
                                    {service.available_spaces} spaces available
                                </div>
                                {service.price_per_person && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        {service.currency} {service.price_per_person} per person
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        service.driver_gender === 'female'
                                            ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    }`}>
                                        {service.driver_gender === 'female' ? '👩' : '👨'} {service.driver_gender} driver
                                    </span>
                                </div>
                            </div>

                            {service.car_brand && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    Car: {service.car_brand} {service.car_model} ({service.car_color})
                                </div>
                            )}

                            {service.stops && service.stops.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Stops:</p>
                                    <ul className="space-y-1">
                                        {service.stops.map((stop) => (
                                            <li key={stop.id} className="text-xs text-gray-600 dark:text-gray-400">
                                                • {stop.location} ({formatDateTime(stop.stop_time)})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {service.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 line-clamp-2">
                                    {service.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && services.length > 0 && totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:text-[#7e246c]"
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded font-semibold border ${
                                page === currentPage
                                    ? 'bg-[#7e246c] text-white border-[#7e246c]'
                                    : 'border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c]'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:text-[#7e246c]"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

