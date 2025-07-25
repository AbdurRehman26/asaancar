import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useAuth } from '@/components/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import CarCard from '../components/car-card';
import CarFilters from '../components/car-filters';
import { Car, UserCircle, BookOpen, Store, MessageSquare } from 'lucide-react';
import Chat from '../components/chat';
import type { Conversation } from '@/types/dashboard';

// Remove local Conversation interface

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 p-6">
                <Outlet />
            </div>
        </AppLayout>
    );
}

// Car Listings Section
export function CarListings() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [selectedStore, setSelectedStore] = useState<{ id: string; name: string } | null>(null);

    // Car listing state
    const [cars, setCars] = useState<Array<{ id: string; name: string }>>([]);
    const [carLoading, setCarLoading] = useState(false);
    // Update initial filters state to include store_id
    const [filters, setFilters] = useState({
        brand_id: '',
        type_id: '',
        store_id: '',
        transmission: '',
        fuel_type: '',
        min_seats: '',
        max_price: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPageState, setPerPageState] = useState(9);

    useEffect(() => {
        if (!loading && (!user || !Array.isArray(user.roles) || !user.roles.includes('store_owner'))) {
            navigate('/', { replace: true });
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        // Fetch stores for the user
        fetch('/api/customer/stores', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data.stores && data.stores.length > 0) {
                    setSelectedStore(data.stores[0]);
                }
            })
            .catch(error => {
                console.error('Error fetching stores:', error);
            });
    }, []);

    // Fetch cars for selected store
    useEffect(() => {
        if (!selectedStore) {
            setCars([]);
            setTotalPages(1);
            return;
        }
        setCarLoading(true);
        const params = new URLSearchParams();
        params.append('store_id', selectedStore.id);
        params.append('per_page', perPageState.toString());
        params.append('page', currentPage.toString());
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        fetch(`/api/customer/cars?${params.toString()}`, {
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
    }, [selectedStore, filters, currentPage, perPageState]);

    const handleSearch = () => {
        setCurrentPage(1);
        // Triggers useEffect
    };

    if (loading || !user || !user.roles) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">Loading...</div>;
    }
    if (!Array.isArray(user.roles) || !user.roles.includes('store_owner')) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-red-600">You are not authorized to view this page.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#7e246c] dark:text-white">Car Listings</h2>
                {selectedStore && (
                    <Link
                        to={`/create-car?store_id=${selectedStore.id}`}
                        className="px-4 py-2 rounded bg-[#7e246c] text-white font-semibold hover:bg-[#6a1f5c] transition-colors"
                    >
                        + Add Car
                    </Link>
                )}
            </div>
            {!selectedStore && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200">
                        No stores found. Please create a store first to manage cars.
                    </p>
                </div>
            )}
            <div className="grid grid-cols-1 gap-8">
                <div>
                    <CarFilters
                        filters={filters}
                        setFilters={setFilters}
                        handleSearch={handleSearch}
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
                    <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-neutral-800 shadow-lg p-6 md:p-10 mt-6">
                        {carLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-4 text-gray-600 dark:text-neutral-400">Searching for cars...</p>
                            </div>
                        ) : cars.length === 0 ? (
                            <div className="text-center py-12">
                                <Car className="h-16 w-16 text-gray-400 dark:text-neutral-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No cars available</h3>
                                <p className="text-gray-600 dark:text-neutral-400">Try adjusting your filters or check back later.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                                {cars.map((car) => (
                                    <div key={car.id} className="relative">
                                        <CarCard car={{ ...car, name: car.name || 'Car' }} hideBooking={true} />
                                                                                <Link
                                            to={`/car-detail/${car.id}/edit`}
                                            className="absolute top-2 right-2 px-3 py-1 rounded bg-[#7e246c] text-white text-xs font-semibold hover:bg-[#6a1f5c] transition-colors"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Pagination Bottom */}
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
                    </div>
                </div>
            </div>
        </div>
    );
}

// Messages Section
export function Messages() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [conversationsLoading, setConversationsLoading] = useState(true);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

    useEffect(() => {
        if (!loading && (!user || !Array.isArray(user.roles) || !user.roles.includes('store_owner'))) {
            navigate('/', { replace: true });
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        // Fetch conversations for the store owner
        setConversationsLoading(true);
        fetch('/api/chat/conversations', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(res => res.json())
            .then(data => {
                setConversations(data);
            })
            .finally(() => setConversationsLoading(false));
    }, []);

    if (loading || !user || !user.roles) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">Loading...</div>;
    }
    if (!Array.isArray(user.roles) || !user.roles.includes('store_owner')) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-red-600">You are not authorized to view this page.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
            <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-neutral-800 shadow-lg p-0 h-full min-h-[500px] flex flex-col overflow-hidden">
                <h2 className="text-xl font-bold text-[#7e246c] dark:text-white mb-0 px-8 pt-8 pb-4">Messages</h2>
                <div className="flex flex-1 min-h-0">
                    {/* Conversation List */}
                    <div className="w-80 min-w-[220px] max-w-xs border-r border-gray-300 dark:border-neutral-700 bg-white/80 dark:bg-gray-900 h-full overflow-y-auto">
                        {conversationsLoading ? (
                            <div className="p-4 text-gray-400">Loading conversations...</div>
                        ) : conversations.length === 0 ? (
                            <div className="p-4 text-gray-400">No conversations yet.</div>
                        ) : (
                            <div className="flex flex-col">
                                {conversations.map((conv: Conversation) => {
                                    const isActive = selectedConv && selectedConv.id === conv.id;
                                    return (
                                        <button
                                            key={conv.id}
                                            className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-neutral-800 transition-colors text-left hover:bg-[#f3e6f2] dark:hover:bg-[#2a1e28] ${isActive ? 'bg-[#7e246c]/10 dark:bg-[#7e246c]/20' : ''}`}
                                            onClick={() => setSelectedConv(conv)}
                                        >
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-[#7e246c] flex items-center justify-center text-white font-bold text-lg">
                                                    <UserCircle className="w-8 h-8" />
                                                </div>
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-[#7e246c] dark:text-white truncate">
                                                        {conv.type === 'booking' ? `Booking #${conv.booking_id}` : conv.store?.name || `Store #${conv.store_id}`}
                                                    </span>
                                                    {typeof conv.unread_count === 'number' && conv.unread_count > 0 && (
                                                        <span className="ml-2 inline-block min-w-[20px] px-2 py-0.5 rounded-full bg-red-600 text-white text-xs text-center">{String(conv.unread_count)}</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-300 truncate">
                                                    {conv.last_message || 'No messages yet.'}
                                                </div>
                                            </div>
                                            {/* Time */}
                                            <div className="ml-2 text-xs text-gray-400 whitespace-nowrap">
                                                {new Date(conv.updated_at ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    {/* Chat Window */}
                    <div className="flex-1 flex items-center justify-center bg-white/80 dark:bg-gray-900 h-full min-h-[400px]">
                        {selectedConv ? (
                            <div className="w-full h-full flex flex-col">
                                <Chat conversationId={typeof selectedConv.id === 'string' ? Number(selectedConv.id) : selectedConv.id} currentUser={user} />
                            </div>
                        ) : (
                            <div className="min-h-[650px] flex items-center justify-center w-full text-gray-400 text-lg">Select a conversation to start chatting.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Dashboard Home Section
export function Home() {
    const [stats, setStats] = useState({ cars: 0, bookings: 0, stores: 0, messages: 0 });
    const { user } = useAuth();
    useEffect(() => {
        async function fetchStore() {
            if (!user || !Array.isArray(user.roles) || !user.roles.includes('store_owner')) {
                return;
            }
            const token = localStorage.getItem('token');
            await fetch('/api/customer/stores', { headers: { Authorization: `Bearer ${token}` } });
        }
        fetchStore();
    }, [user]);
    useEffect(() => {
        async function fetchStats() {
            const token = localStorage.getItem('token');
            const [carsRes, bookingsRes, storesRes, messagesRes] = await Promise.all([
                fetch('/api/customer/cars/stats', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/bookings/stats', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/customer/stores', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/chat/conversations', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const carsData = await carsRes.json();
            const bookingsData = await bookingsRes.json();
            const storesData = await storesRes.json();
            const messagesData = await messagesRes.json();
            setStats({
                cars: carsData.count || 0,
                bookings: bookingsData.count || 0,
                stores: Array.isArray(storesData.stores) ? storesData.stores.length : 0,
                messages: Array.isArray(messagesData) ? messagesData.length : 0,
            });
        }
        fetchStats();
    }, []);
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                        <Car className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[#7e246c]">{stats.cars}</div>
                        <div className="text-gray-700 dark:text-gray-300">Cars</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[#7e246c]">{stats.bookings}</div>
                        <div className="text-gray-700 dark:text-gray-300">Bookings</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                        <Store className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[#7e246c]">{stats.stores}</div>
                        <div className="text-gray-700 dark:text-gray-300">Stores</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-gray-300 dark:border-neutral-800 bg-white dark:bg-gray-800/80 p-6 shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/20">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[#7e246c]">{stats.messages}</div>
                        <div className="text-gray-700 dark:text-gray-300">Messages</div>
                    </div>
                </div>
            </div>
            <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-neutral-800 shadow-lg p-10 text-center">
                <h2 className="text-3xl font-bold text-[#7e246c] dark:text-white mb-4">Welcome to your Dashboard</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300">Select an option from the sidebar to get started.</p>
            </div>
        </div>
    );
}

// Store Bookings Section
export function StoreBookings() {
    const { user, loading } = useAuth();
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
    const [bookings, setBookings] = useState<StoreBooking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useEffect(() => {
        if (!loading && (!user || !Array.isArray(user.roles) || !user.roles.includes('store_owner'))) {
            setError('You are not authorized to view this page.');
            setBookingsLoading(false);
            return;
        }
        setBookingsLoading(true);
        fetch(`/api/dashboard/store-bookings?page=${currentPage}&per_page=${perPage}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(res => res.json())
            .then(data => {
                setBookings(data.data || []);
                setTotalPages(data.last_page || 1);
                setPerPage(data.per_page || 10);
            })
            .catch(() => setError('Failed to fetch bookings.'))
            .finally(() => setBookingsLoading(false));
    }, [user, loading, currentPage, perPage]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">Loading...</div>;
    }
    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-red-600">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#7e246c] dark:text-white">Store Bookings</h2>
            </div>
            <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-neutral-800 shadow-lg p-6 md:p-10 mt-6">
                {bookingsLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-neutral-400">Loading bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-400 dark:text-neutral-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings found</h3>
                        <p className="text-gray-600 dark:text-neutral-400">No bookings for your stores yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pickup Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pickup Time</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-neutral-700">
                                {bookings.map((booking: StoreBooking) => (
                                    <tr key={booking.id}>
                                        <td className="px-4 py-2 whitespace-nowrap">{booking.id}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{booking.car?.name || '-'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {booking.guest_name || booking.user?.name || '-'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {booking.guest_phone || booking.user?.phone || booking.user?.email || '-'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{booking.pickup_date}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{booking.pickup_time}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{booking.status}</span>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{booking.total_price} {booking.car?.currency || 'PKR'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination */}
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
                    </div>
                )}
            </div>
        </div>
    );
}

// Attach as properties for router usage
Dashboard.CarListings = CarListings;
Dashboard.Messages = Messages;
Dashboard.Home = Home;
Dashboard.StoreBookings = StoreBookings;
