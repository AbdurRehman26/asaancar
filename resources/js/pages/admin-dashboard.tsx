import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useAuth } from '@/components/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CarCard from '../components/car-card';
import CarFilters from '../components/car-filters';
import { Car, Store, BarChart3 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
];

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Helper to parse query params
    type AdminFilters = {
        brand_id: string;
        type_id: string;
        store_id: string;
        transmission: string;
        fuel_type: string;
        min_seats: string;
        max_price: string;
    };

    const getFiltersFromQuery = useCallback((search: string): AdminFilters => {
        const queryParams = new URLSearchParams(search);
        return {
            brand_id: queryParams.get('brand_id') || '',
            type_id: queryParams.get('type_id') || '',
            store_id: queryParams.get('store_id') || '',
            transmission: queryParams.get('transmission') || '',
            fuel_type: queryParams.get('fuel_type') || '',
            min_seats: queryParams.get('min_seats') || '',
            max_price: queryParams.get('max_price') || '',
        };
    }, []);

    // Function to update URL parameters
    const updateURLParams = useCallback((newFilters: AdminFilters, page: number = 1) => {
        const params = new URLSearchParams();
        
        // Add filters to params
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== '') {
                params.set(key, value.toString());
            }
        });
        
        // Add pagination params
        params.set('page', page.toString());
        params.set('per_page', perPageState.toString());
        
        // Update URL without triggering a page reload
        navigate(`/admin-dashboard?${params.toString()}`, { replace: true });
    }, [navigate, perPageState]);
    const [stats, setStats] = useState({
        total_cars: 0,
        active_cars: 0,
        inactive_cars: 0,
    });

    // Car listing state
    const [cars, setCars] = useState<Array<{
        id: number;
        name: string;
        brand: { name: string };
        type: { name: string };
        store: { name: string };
        model: string;
        year: number;
        color: string;
        seats: number;
        transmission: string;
        fuel_type: string;
        image: string;
        images: string[];
        price_without_driver?: number;
        price_with_driver?: number;
    }>>([]);
    const [carLoading, setCarLoading] = useState(false);
    const [filters, setFilters] = useState<AdminFilters>(() => getFiltersFromQuery(window.location.search));
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPageState, setPerPageState] = useState(9);

    // Sync filters/page with URL on load
    useEffect(() => {
        setFilters(getFiltersFromQuery(location.search));
    }, [location.search, getFiltersFromQuery]);

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters: Partial<AdminFilters>) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        setCurrentPage(1);
        updateURLParams(updatedFilters, 1);
  }, [filters, updateURLParams]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const defaultFilters: AdminFilters = {
      brand_id: '',
      type_id: '',
      store_id: '',
      transmission: '',
      fuel_type: '',
      min_seats: '',
      max_price: '',
    };
    setFilters(defaultFilters);
    setCurrentPage(1);
    updateURLParams(defaultFilters, 1);
  }, [updateURLParams]);

  useEffect(() => {
        if (!loading && (!user || !Array.isArray(user.roles) || !user.roles.includes('admin'))) {
            navigate('/', { replace: true });
        }
    }, [user, loading, navigate]);

    // Fetch admin stats
    useEffect(() => {
        if (user && user.roles?.includes('admin')) {
            fetch('/api/admin/cars/stats', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
                .then(res => res.json())
                .then(data => {
                    setStats(data);
                })
                .catch(error => {
                    console.error('Error fetching admin stats:', error);
                });
        }
    }, [user]);

    // Fetch cars for admin
    useEffect(() => {
        if (!user || !user.roles?.includes('admin')) return;

        setCarLoading(true);
        const params = new URLSearchParams();

        params.append('per_page', perPageState.toString());
        params.append('page', currentPage.toString());
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        fetch(`/api/admin/cars?${params.toString()}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setCars(data.data || []);
                setTotalPages(data.last_page || 1);
                setPerPageState(data.per_page || 9);
            })
            .catch(error => {
                console.error('Error fetching cars:', error);
                setCars([]);
                setTotalPages(1);
            })
            .finally(() => setCarLoading(false));
    }, [filters, currentPage, perPageState, user]);

    if (loading || !user || !user.roles) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">Loading...</div>;
    }

    if (!Array.isArray(user.roles) || !user.roles.includes('admin')) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-red-600">You are not authorized to view this page.</div>;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 p-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
                    {/* Admin Stats */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#7e246c] dark:text-white mb-6">Admin Dashboard</h1>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cars</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_cars}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                        <Store className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Cars</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_cars}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                        <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive Cars</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inactive_cars}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Car Listings Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Cars in System</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                View and manage all cars across all stores
                            </p>
                        </div>

                        <div className="p-6">
                            <CarFilters
                                filters={filters}
                                setFilters={setFilters}
                                handleSearch={handleFilterChange}
                                onClearFilters={handleClearFilters}
                                loading={carLoading}
                            />

                            {/* Pagination Top */}
                            <div className="flex justify-center items-center gap-2 my-6">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
                                >Prev</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded font-semibold border ${page === currentPage ? 'bg-[#7e246c] text-white border-[#7e246c]' : 'border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c]'}`}
                                    >{page}</button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
                                >Next</button>
                            </div>

                            {/* Cars Grid */}
                            {carLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7e246c]"></div>
                                </div>
                            ) : cars.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {cars.map((car) => (
                                        <CarCard key={car.id} car={car} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Car className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No cars found</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Try adjusting your filters or check back later.
                                    </p>
                                </div>
                            )}

                            {/* Pagination Bottom */}
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
                                >Prev</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded font-semibold border ${page === currentPage ? 'bg-[#7e246c] text-white border-[#7e246c]' : 'border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c]'}`}
                                    >{page}</button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
                                >Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
