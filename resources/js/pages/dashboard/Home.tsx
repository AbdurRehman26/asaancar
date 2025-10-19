import { useState, useEffect } from 'react';
import { Car, BookOpen, Store, MessageSquare } from 'lucide-react';

export default function Home() {
    const [stats, setStats] = useState({ cars: 0, bookings: 0, stores: 0, messages: 0 });
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            setStatsLoading(true);
            setStatsError(null);

            try {
                const token = localStorage.getItem('token');
                const params = new URLSearchParams();

                // Fetch each endpoint individually to better handle errors
                let carsData = { total_cars: 0 };
                let bookingsData = { count: 0 };
                let storesData = { stores: [] };
                let messagesData = [];

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
    }, []);

    return (
        <div className="max-w-7xl sm:px-8 lg:px-12 py-6">

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
