import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Car, BookOpen, Store, MessageSquare } from 'lucide-react';

export default function Home() {
    const [stats, setStats] = useState({ cars: 0, bookings: 0, stores: 0, messages: 0 });
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState<string | null>(null);
    const { user } = useAuth();
    const [selectedStore, setSelectedStore] = useState<{ id: number; name: string } | null>(null);
    const [userStores, setUserStores] = useState<Array<{ id: number; name: string }>>([]);

    useEffect(() => {
        async function fetchStores() {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/customer/stores', { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (data.stores && data.stores.length > 0) {
                setUserStores(data.stores);
                setSelectedStore(data.stores[0]);
            }
        }
        fetchStores();
    }, [user]);

    useEffect(() => {
        async function fetchStats() {
            setStatsLoading(true);
            setStatsError(null);

            try {
                const token = localStorage.getItem('token');
                const params = new URLSearchParams();
                if (selectedStore) {
                    params.append('store_id', selectedStore.id.toString());
                }

                const [carsRes, bookingsRes, storesRes, messagesRes] = await Promise.all([
                    fetch(`/api/admin/cars/stats?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`/api/bookings/stats?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/customer/stores', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`/api/chat/conversations?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                // Check if all responses are ok
                if (!carsRes.ok || !bookingsRes.ok || !storesRes.ok || !messagesRes.ok) {
                    throw new Error('Failed to fetch statistics data');
                }

                const carsData = await carsRes.json();
                const bookingsData = await bookingsRes.json();
                const storesData = await storesRes.json();
                const messagesData = await messagesRes.json();

                setStats({
                    cars: carsData.total_cars || 0,
                    bookings: bookingsData.count || 0,
                    stores: Array.isArray(storesData.stores) ? storesData.stores.length : 0,
                    messages: Array.isArray(messagesData) ? messagesData.length : 0,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
                setStatsError('Failed to load statistics. Please try again.');
            } finally {
                setStatsLoading(false);
            }
        }
        fetchStats();
    }, [selectedStore]);

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

            {statsError ? (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">{statsError}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                            <Car className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#7e246c]">
                                {statsLoading ? (
                                    <div className="w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    stats.cars
                                )}
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">Cars</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#7e246c]">
                                {statsLoading ? (
                                    <div className="w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    stats.bookings
                                )}
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">Bookings</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                            <Store className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#7e246c]">
                                {statsLoading ? (
                                    <div className="w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    stats.stores
                                )}
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">Stores</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#7e246c]">
                                {statsLoading ? (
                                    <div className="w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    stats.messages
                                )}
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">Messages</div>
                        </div>
                    </div>
                </div>
            )}
            <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-neutral-800 shadow-lg p-10 text-center">
                <h2 className="text-3xl font-bold text-[#7e246c] dark:text-white mb-4">Welcome to your Dashboard</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300">Select an option from the sidebar to get started.</p>
            </div>
        </div>
    );
}
