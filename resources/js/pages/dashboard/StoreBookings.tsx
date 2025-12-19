import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';

interface StoreBooking {
    id: number;
    car?: { name?: string; currency?: string };
    user?: { name?: string; phone?: string; email?: string };
    guest_name?: string;
    guest_phone?: string;
    pickup_date: string;
    pickup_time: string;
    status: string;
    total_price: number;
}

export default function StoreBookings() {
    const { loading } = useAuth();
    const [bookings, setBookings] = useState<StoreBooking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [selectedStore, setSelectedStore] = useState<{ id: number; name: string } | null>(null);
    const [userStores, setUserStores] = useState<Array<{ id: number; name: string }>>([]);

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
    }, [loading]);

    // Fetch bookings for selected store
    useEffect(() => {
        if (!selectedStore) {
            setBookings([]);
            setTotalPages(1);
            return;
        }

        setBookingsLoading(true);
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('per_page', perPage.toString());
        params.append('store_id', selectedStore.id.toString());

        fetch(`/api/dashboard/store-bookings?${params.toString()}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(res => res.json())
            .then(data => {
                setBookings(data.data || []);
                setTotalPages(data.last_page || 1);
                setPerPage(data.per_page || 10);
                setError(null);
            })
            .catch(() => setError('Failed to fetch bookings.'))
            .finally(() => setBookingsLoading(false));
    }, [selectedStore, currentPage, perPage]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">Loading...</div>;
    }
    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-red-600">{error}</div>;
    }

    return (
        <div className="max-w-7xl px-4 sm:px-8 lg:px-12 py-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#7e246c] dark:text-white">Store Bookings</h2>
            </div>

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

            {/* Bookings Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {bookingsLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No bookings found for the selected store.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Booking ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Car
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Pickup Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Total Price
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            #{booking.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {booking.car?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {booking.user?.name || booking.guest_name || 'N/A'}
                                                </div>
                                                <div className="text-gray-500 dark:text-gray-400">
                                                    {booking.user?.phone || booking.guest_phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            <div>
                                                <div>{new Date(booking.pickup_date).toLocaleDateString()}</div>
                                                <div className="text-gray-400">{booking.pickup_time}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : booking.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                            {booking.total_price ? `${booking.total_price} ${booking.car?.currency || 'PKR'}` : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Show:</span>
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
                        >
                            Previous
                        </button>

                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] font-semibold bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 dark:border-neutral-800 dark:text-[#7e246c]"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
