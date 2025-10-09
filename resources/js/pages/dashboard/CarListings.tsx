import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import CarCard from '@/components/car-card';
import CarFilters from '@/components/car-filters';

export default function CarListings() {
    const { loading } = useAuth();
    const [selectedStore, setSelectedStore] = useState<{ id: number; name: string } | null>(null);
    const [userStores, setUserStores] = useState<Array<{ id: number; name: string }>>([]);

    // Car listing state
    const [cars, setCars] = useState<Array<{ id: string; name: string }>>([]);
    const [carLoading, setCarLoading] = useState(false);
    const [carError, setCarError] = useState<string | null>(null);
    // Update initial filters state to include store_id
    const [filters, setFilters] = useState({
        brand_id: '',
        type_id: '',
        store_id: '',
        transmission: '',
        fuel_type: '',
        min_seats: '',
        max_price: '',
        city_id: '',
        tag_ids: [] as number[]
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPageState, setPerPageState] = useState(9);

    // (No role-based redirects)

    useEffect(() => {
        // Fetch stores for the user
        fetch('/api/customer/stores', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data.stores && data.stores.length > 0) {
                    setUserStores(data.stores);
                    setSelectedStore(data.stores[0]);
                }
            })
            .catch(error => {
                console.error('Error fetching stores:', error);
            });
    }, []);

    // Fetch cars for selected store
    useEffect(() => {
        setCarLoading(true);
        setCarError(null);
        const params = new URLSearchParams();

        // Only add store_id if a specific store is selected (not "All Stores")
        if (selectedStore) {
            params.append('store_id', selectedStore.id.toString());
        }

        // Add other filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value && key !== 'store_id') {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(`${key}[]`, v.toString()));
                } else {
                    params.append(key, value.toString());
                }
            }
        });

        params.append('page', currentPage.toString());
        params.append('per_page', perPageState.toString());

        fetch(`/api/cars?${params.toString()}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(res => res.json())
            .then(data => {
                setCars(data.data || []);
                setTotalPages(data.last_page || 1);
                setCarError(null);
            })
            .catch(error => {
                console.error('Error fetching cars:', error);
                setCars([]);
                setCarError('Failed to fetch cars. Please try again.');
            })
            .finally(() => setCarLoading(false));
    }, [selectedStore, filters, currentPage, perPageState]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">Loading...</div>;
    }

    return (
        <div className="max-w-7xl sm:px-8 lg:px-12 py-6">
            {/* Store Selection Dropdown */}
            {userStores.length > 0 && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Select Store
                    </label>
                    <select
                        value={selectedStore?.id || ''}
                        onChange={(e) => {
                            const storeId = e.target.value;
                            if (storeId === 'all') {
                                setSelectedStore(null);
                            } else {
                                const store = userStores.find(s => s.id.toString() === storeId);
                                setSelectedStore(store || null);
                            }
                        }}
                        className="w-full max-w-xs border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7e246c] focus:border-[#7e246c]"
                    >
                        <option value="all">All Stores</option>
                        {userStores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Filters Sidebar */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <CarFilters
                        filters={filters}
                        setFilters={setFilters}
                        onFiltersChange={(newFilters) => {
                            setFilters(newFilters);
                            setCurrentPage(1); // Reset to first page when filters change
                        }}
                    />
                </div>

                {/* Cars Grid */}
                <div className="flex-1">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-[#7e246c] dark:text-white">Car Listings</h1>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Per page:</label>
                            <select
                                value={perPageState}
                                onChange={(e) => {
                                    setPerPageState(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value={6}>6</option>
                                <option value={9}>9</option>
                                <option value={12}>12</option>
                                <option value={24}>24</option>
                            </select>
                        </div>
                    </div>

                    {carError ? (
                        <div className="text-center py-12">
                            <p className="text-red-500 dark:text-red-400 text-lg">{carError}</p>
                        </div>
                    ) : carLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: perPageState }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
                                </div>
                            ))}
                        </div>
                    ) : cars.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No cars found matching your criteria.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cars.map((car) => (
                                    <CarCard key={car.id} car={car} hideBooking={false} showEditButton={true} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
                                    >Previous</button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
