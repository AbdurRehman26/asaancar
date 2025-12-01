import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Chat from '@/components/chat';
import ErrorBoundary from '@/components/ErrorBoundary';
import { UserCircle } from 'lucide-react';
import type { Conversation } from '@/types/dashboard';

interface RawConversation {
    id: string | number;
    type: string;
    booking_id?: string | number;
    store?: { name?: string };
    store_id?: string | number;
    unread_count?: number;
    last_message?: string | object;
    updated_at?: string | object;
    formatted_time?: string;
}

export default function RentalChat() {
    const { user, loading } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [conversationsLoading, setConversationsLoading] = useState(true);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
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
    }, []);

    useEffect(() => {
        // Fetch conversations for rental (booking and store types)
        setConversationsLoading(true);
        const params = new URLSearchParams();
        params.append('type', 'rental'); // Filter for rental conversations
        if (selectedStore) {
            params.append('store_id', selectedStore.id.toString());
        }

        fetch(`/api/chat/conversations?${params.toString()}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    const formattedConversations = data.map((conv: RawConversation) => ({
                        ...conv,
                        last_message: typeof conv.last_message === 'string' ? conv.last_message : String(conv.last_message || ''),
                        updated_at: typeof conv.updated_at === 'string' ? conv.updated_at : new Date().toISOString()
                    }));
                    setConversations(formattedConversations);
                } else {
                    setConversations([]);
                }
            })
            .catch(error => {
                console.error('Error fetching conversations:', error);
                setConversations([]);
            })
            .finally(() => setConversationsLoading(false));
    }, [selectedStore]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">Loading...</div>;
    }

    return (
        <ErrorBoundary>
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

                <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-neutral-800 shadow-lg p-0 h-full min-h-[500px] flex flex-col overflow-hidden">
                    <h2 className="text-xl font-bold text-[#7e246c] dark:text-white mb-0 px-8 pt-8 pb-4">Rental Chat</h2>
                    <div className="flex flex-1 min-h-0">
                        {/* Conversation List */}
                        <div className="w-80 min-w-[220px] max-w-xs border-r border-gray-300 dark:border-neutral-700 bg-white/80 dark:bg-gray-900 h-full overflow-y-auto">
                            {conversationsLoading ? (
                                <div className="p-4 text-gray-400">Loading conversations...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-4 text-gray-400">No rental conversations yet.</div>
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
                                                        {typeof conv.last_message === 'string' ? conv.last_message : 'No messages yet.'}
                                                    </div>
                                                </div>
                                                {/* Time */}
                                                <div 
                                                    className="ml-2 text-xs text-gray-400 whitespace-nowrap"
                                                    title={new Date(typeof conv.updated_at === 'string' ? conv.updated_at : new Date().toISOString()).toLocaleString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                >
                                                    {conv.formatted_time || new Date(typeof conv.updated_at === 'string' ? conv.updated_at : new Date().toISOString()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                    {user && selectedConv?.id ? (
                                        <Chat
                                            conversationId={parseInt(selectedConv.id.toString(), 10)}
                                            currentUser={user}
                                        />
                                    ) : null}
                                </div>
                            ) : (
                                <div className="min-h-[650px] flex items-center justify-center w-full text-gray-400 text-lg">Select a conversation to start chatting.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}


