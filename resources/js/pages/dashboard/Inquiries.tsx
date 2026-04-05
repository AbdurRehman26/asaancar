import { useAuth } from '@/components/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { apiFetch } from '@/lib/utils';
import { Building, Car, Clock, Mail, Phone } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ContactMessage {
    id: number;
    name: string;
    contact_info: string;
    message: string;
    store_id?: number;
    car_details?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
    store?: {
        id: number;
        name: string;
    };
}

interface Store {
    id: number;
    name: string;
}

export default function Inquiries() {
    const { user } = useAuth();
    const isSuperAdmin = user?.id === 1;
    const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
    const [userStores, setUserStores] = useState<Store[]>([]);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPageState, setPerPageState] = useState(10);

    useEffect(() => {
        if (!isSuperAdmin) {
            setUserStores([]);
            setSelectedStore(null);
            return;
        }

        // Fetch stores for the user
        fetch('/api/customer/stores', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.stores && data.stores.length > 0) {
                    setUserStores(data.stores);
                    setSelectedStore(data.stores[0]);
                }
            })
            .catch((error) => {
                console.error('Error fetching stores:', error);
            });
    }, [isSuperAdmin]);

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams();
                params.append('page', currentPage.toString());
                params.append('per_page', perPageState.toString());

                if (selectedStore) {
                    params.append('store_id', selectedStore.id.toString());
                }

                const response = await apiFetch(`/api/admin/contact-messages?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setInquiries(data.data || []);
                    setTotalPages(data.last_page || 1);
                } else {
                    setError('Failed to fetch inquiries');
                }
            } catch (err) {
                setError('Failed to fetch inquiries');
                console.error('Error fetching inquiries:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchInquiries();
        }
    }, [user, selectedStore, currentPage, perPageState]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const storeId = e.target.value;
        if (storeId === 'all') {
            setSelectedStore(null);
        } else {
            const store = userStores.find((s) => s.id.toString() === storeId);
            setSelectedStore(store || null);
        }
        setCurrentPage(1); // Reset to first page when changing store
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-pulse">
                        <div className="mb-4 h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Loading inquiries...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <Mail className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="mb-2 text-lg font-semibold text-red-600 dark:text-red-400">Error</div>
                    <div className="text-gray-600 dark:text-gray-400">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="max-w-7xl px-4 py-6 sm:px-8 lg:px-12">
                {/* Store Selection Dropdown */}
                {isSuperAdmin && userStores.length > 0 && (
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Select Store</label>
                        <select
                            value={selectedStore?.id || 'all'}
                            onChange={handleStoreChange}
                            className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Inquiries</h1>
                        <p className="text-gray-600 dark:text-gray-400">Customer messages and inquiries from your website</p>
                    </div>

                    {/* Per page selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Per page:</label>
                        <select
                            value={perPageState}
                            onChange={(e) => {
                                setPerPageState(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="rounded border border-gray-300 bg-white px-2 py-1 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                {inquiries.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <Mail className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No inquiries yet</h3>
                        <p className="mx-auto max-w-md text-gray-500 dark:text-gray-400">
                            When customers contact you through your website, their messages will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {inquiries.map((inquiry) => (
                            <div
                                key={inquiry.id}
                                className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors duration-200 hover:border-[#7e246c] dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#9d4edd]"
                            >
                                <div className="p-5">
                                    {/* Top Row */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                                                {inquiry.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{inquiry.name}</h3>
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    {inquiry.contact_info.includes('@') ? (
                                                        <Mail className="mr-1 h-3 w-3" />
                                                    ) : (
                                                        <Phone className="mr-1 h-3 w-3" />
                                                    )}
                                                    {inquiry.contact_info}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="mb-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {formatDate(inquiry.created_at)}
                                            </div>
                                            {inquiry.store && (
                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                    <Building className="mr-1 h-3 w-3" />
                                                    {inquiry.store.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="mb-4">
                                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{inquiry.message}</p>
                                    </div>

                                    {/* Bottom Row */}
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                                        {inquiry.car_details ? (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <Car className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                                                <span className="font-medium">{inquiry.car_details.name}</span>
                                                <span className="ml-2 text-gray-400">#{inquiry.car_details.id}</span>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">General inquiry</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded border border-[#7e246c] bg-white px-3 py-1 text-[#7e246c] hover:bg-[#7e246c] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-gray-800/80 dark:text-[#7e246c]"
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`rounded border px-3 py-1 font-semibold ${page === currentPage ? 'border-[#7e246c] bg-[#7e246c] text-white' : 'border-[#7e246c] bg-white text-[#7e246c] hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:bg-gray-800/80 dark:text-[#7e246c]'}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="rounded border border-[#7e246c] bg-white px-3 py-1 text-[#7e246c] hover:bg-[#7e246c] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-gray-800/80 dark:text-[#7e246c]"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}
