import { useState, useEffect } from 'react';
import { Car, BookOpen, Store, MessageSquare, Users, Mail } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

export default function Home() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ cars: 0, bookings: 0, stores: 0, messages: 0, users: 0, inquiries: 0 });
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [selectedStore, setSelectedStore] = useState<{ id: number; name: string } | null>(null);
    const [userStores, setUserStores] = useState<Array<{ id: number; name: string }>>([]);

    // Fetch user stores
    useEffect(() => {
        if (!user) return;

        fetch('/api/customer/stores', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(res => res.json())
            .then(data => {
                setUserStores(data.stores || []);
            })
            .catch(error => {
                console.error('Error fetching stores:', error);
            });
    }, [user]);

    useEffect(() => {
        async function fetchStats() {
            setStatsLoading(true);
            setStatsError(null);

            try {
                const token = localStorage.getItem('token');
                const params = new URLSearchParams();

                // Add store filter if selected
                if (selectedStore) {
                    params.append('store_id', selectedStore.id.toString());
                }

                // Fetch each endpoint individually to better handle errors
                let carsData = { total_cars: 0 };
                let bookingsData = { count: 0 };
                let storesData = { stores: [] };
                let messagesData = [];
                let usersData = { total_users: 0 };
                let inquiriesData = { total_inquiries: 0 };

                try {
                    const carsRes = await fetch(`/api/admin/cars/stats?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (carsRes.ok) {
                        carsData = await carsRes.json();
                    } else {
                        console.error('Cars stats failed:', carsRes.status, carsRes.statusText);
                    }
                } catch (error) {
                    console.error('Cars stats error:', error);
                }

                try {
                    const bookingsRes = await fetch(`/api/bookings/stats?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (bookingsRes.ok) {
                        bookingsData = await bookingsRes.json();
                    } else {
                        console.error('Bookings stats failed:', bookingsRes.status, bookingsRes.statusText);
                    }
                } catch (error) {
                    console.error('Bookings stats error:', error);
                }

                // Only fetch stores stats if user is admin
                if (user?.roles?.includes('admin')) {
                    try {
                        const storesRes = await fetch('/api/customer/stores', { headers: { Authorization: `Bearer ${token}` } });
                        if (storesRes.ok) {
                            storesData = await storesRes.json();
                        } else {
                            console.error('Stores failed:', storesRes.status, storesRes.statusText);
                        }
                    } catch (error) {
                        console.error('Stores error:', error);
                    }
                }

                try {
                    const messagesRes = await fetch(`/api/chat/conversations?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (messagesRes.ok) {
                        messagesData = await messagesRes.json();
                    } else {
                        console.error('Messages failed:', messagesRes.status, messagesRes.statusText);
                    }
                } catch (error) {
                    console.error('Messages error:', error);
                }

                // Only fetch users stats if user is admin
                if (user?.roles?.includes('admin')) {
                    try {
                        const usersRes = await fetch(`/api/admin/users/stats?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
                        if (usersRes.ok) {
                            usersData = await usersRes.json();
                        } else {
                            console.error('Users stats failed:', usersRes.status, usersRes.statusText);
                        }
                    } catch (error) {
                        console.error('Users stats error:', error);
                    }
                }

                try {
                    const inquiriesRes = await fetch(`/api/admin/contact-messages/stats?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (inquiriesRes.ok) {
                        inquiriesData = await inquiriesRes.json();
                    } else {
                        console.error('Inquiries stats failed:', inquiriesRes.status, inquiriesRes.statusText);
                    }
                } catch (error) {
                    console.error('Inquiries stats error:', error);
                }

                // Calculate stores count based on store filter
                let storesCount = 0;
                if (user?.roles?.includes('admin')) {
                    if (selectedStore) {
                        // If specific store is selected, count is 1
                        storesCount = 1;
                    } else {
                        // If no store selected, show total stores count
                        storesCount = Array.isArray(storesData.stores) ? storesData.stores.length : 0;
                    }
                }

                setStats({
                    cars: carsData.total_cars || 0,
                    bookings: bookingsData.count || 0,
                    stores: storesCount,
                    messages: Array.isArray(messagesData) ? messagesData.length : 0,
                    users: usersData.total_users || 0,
                    inquiries: inquiriesData.total_inquiries || 0,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
                setStatsError('Failed to load statistics. Please try again.');
            } finally {
                setStatsLoading(false);
            }
        }
        fetchStats();
    }, [selectedStore, user]);

    return (
        <div className="max-w-7xl px-4 sm:px-8 lg:px-12 py-6">
            {/* Store Filter Dropdown */}
            {userStores.length > 0 && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Select Store
                    </label>
                    <select
                        value={selectedStore?.id || 'all'}
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
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${user?.roles?.includes('admin') ? 'xl:grid-cols-6' : 'xl:grid-cols-4'} gap-6 mb-8`}>
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
                    {user?.roles?.includes('admin') && (
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
                    )}
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
                    {user?.roles?.includes('admin') && (
                        <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[#7e246c]">
                                    {statsLoading ? (
                                        <div className="w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        stats.users
                                    )}
                                </div>
                                <div className="text-gray-700 dark:text-gray-300">Users</div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-[#7e246c]">
                                {statsLoading ? (
                                    <div className="w-8 h-8 border-2 border-[#7e246c] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    stats.inquiries
                                )}
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">Inquiries</div>
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
