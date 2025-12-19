import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { apiFetch } from '@/lib/utils';
import { Mail, Phone, Clock, Building, Car } from 'lucide-react';

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
                day: 'numeric'
            });
        }
    };

    const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const storeId = e.target.value;
        if (storeId === 'all') {
            setSelectedStore(null);
        } else {
            const store = userStores.find(s => s.id.toString() === storeId);
            setSelectedStore(store || null);
        }
        setCurrentPage(1); // Reset to first page when changing store
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center">
                    <div className="animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Loading inquiries...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">Error</div>
                    <div className="text-gray-600 dark:text-gray-400">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="max-w-7xl px-4 sm:px-8 lg:px-12 py-6">
                {/* Store Selection Dropdown */}
                {userStores.length > 0 && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Select Store
                        </label>
                        <select
                            value={selectedStore?.id || 'all'}
                            onChange={handleStoreChange}
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

                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Inquiries</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Customer messages and inquiries from your website
                        </p>
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
                            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                {inquiries.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No inquiries yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            When customers contact you through your website, their messages will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {inquiries.map((inquiry) => (
                            <div
                                key={inquiry.id}
                                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-[#7e246c] dark:hover:border-[#9d4edd] transition-colors duration-200"
                            >
                                <div className="p-5">
                                    {/* Top Row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {inquiry.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {inquiry.name}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    {inquiry.contact_info.includes('@') ? (
                                                        <Mail className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <Phone className="h-3 w-3 mr-1" />
                                                    )}
                                                    {inquiry.contact_info}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {formatDate(inquiry.created_at)}
                                            </div>
                                            {inquiry.store && (
                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                    <Building className="h-3 w-3 mr-1" />
                                                    {inquiry.store.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="mb-4">
                                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                            {inquiry.message}
                                        </p>
                                    </div>

                                    {/* Bottom Row */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                        {inquiry.car_details ? (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <Car className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                                <span className="font-medium">{inquiry.car_details.name}</span>
                                                <span className="text-gray-400 ml-2">#{inquiry.car_details.id}</span>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                General inquiry
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:text-[#7e246c]"
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded font-semibold border ${page === currentPage ? 'bg-[#7e246c] text-white border-[#7e246c]' : 'border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white dark:border-neutral-800 dark:text-[#7e246c]'}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded border border-[#7e246c] text-[#7e246c] bg-white dark:bg-gray-800/80 hover:bg-[#7e246c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:text-[#7e246c]"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}
