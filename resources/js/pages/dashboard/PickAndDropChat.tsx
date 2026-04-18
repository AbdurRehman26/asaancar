import { useAuth } from '@/components/AuthContext';
import Chat from '@/components/chat';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { Conversation } from '@/types/dashboard';
import { UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RawConversation {
    id: string | number;
    type: string;
    pick_and_drop_service_id?: string | number;
    pickAndDropService?: { id: number; start_location?: string; end_location?: string };
    unread_count?: number;
    last_message?: string | object;
    updated_at?: string | object;
    formatted_time?: string;
}

export default function PickAndDropChat() {
    const { user, loading } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [conversationsLoading, setConversationsLoading] = useState(true);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

    useEffect(() => {
        // Fetch conversations for pick and drop
        setConversationsLoading(true);
        const params = new URLSearchParams();
        params.append('type', 'pick_and_drop'); // Filter for pick and drop conversations

        fetch(`/api/chat/conversations?${params.toString()}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    const formattedConversations = data.map((conv: RawConversation) => ({
                        ...conv,
                        last_message: typeof conv.last_message === 'string' ? conv.last_message : String(conv.last_message || ''),
                        updated_at: typeof conv.updated_at === 'string' ? conv.updated_at : new Date().toISOString(),
                    }));
                    setConversations(formattedConversations);
                } else {
                    setConversations([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching conversations:', error);
                setConversations([]);
            })
            .finally(() => setConversationsLoading(false));
    }, []);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-xl text-[#7e246c] dark:bg-gray-900">Loading...</div>;
    }

    return (
        <ErrorBoundary>
            <div className="max-w-7xl py-6 sm:px-8 lg:px-12">
                <div className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white/80 p-0 shadow-lg dark:border-neutral-800 dark:bg-gray-800/80">
                    <h2 className="mb-0 px-8 pt-8 pb-4 text-xl font-bold text-[#7e246c] dark:text-white">Ride Chat</h2>
                    <div className="flex min-h-0 flex-1">
                        {/* Conversation List */}
                        <div className="h-full w-80 max-w-xs min-w-[220px] overflow-y-auto border-r border-gray-300 bg-white/80 dark:border-neutral-700 dark:bg-gray-900">
                            {conversationsLoading ? (
                                <div className="p-4 text-gray-400">Loading conversations...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-4 text-gray-400">No ride conversations yet.</div>
                            ) : (
                                <div className="flex flex-col">
                                    {conversations.map((conv: Conversation) => {
                                        const isActive = selectedConv && selectedConv.id === conv.id;
                                        const service = (
                                            conv as Conversation & { pickAndDropService?: { start_location?: string; end_location?: string } }
                                        ).pickAndDropService;
                                        const routeLabel = service
                                            ? `${service.start_location || 'Start'} → ${service.end_location || 'End'}`
                                            : `Service #${(conv as Conversation & { pick_and_drop_service_id?: number }).pick_and_drop_service_id || 'N/A'}`;

                                        return (
                                            <button
                                                key={conv.id}
                                                className={`flex items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-[#f3e6f2] dark:border-neutral-800 dark:hover:bg-[#2a1e28] ${isActive ? 'bg-[#7e246c]/10 dark:bg-[#7e246c]/20' : ''}`}
                                                onClick={() => setSelectedConv(conv)}
                                            >
                                                {/* Avatar */}
                                                <div className="flex-shrink-0">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7e246c] text-lg font-bold text-white">
                                                        <UserCircle className="h-8 w-8" />
                                                    </div>
                                                </div>
                                                {/* Info */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate font-semibold text-[#7e246c] dark:text-white">{routeLabel}</span>
                                                        {typeof conv.unread_count === 'number' && conv.unread_count > 0 && (
                                                            <span className="ml-2 inline-block min-w-[20px] rounded-full bg-red-600 px-2 py-0.5 text-center text-xs text-white">
                                                                {String(conv.unread_count)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="truncate text-xs text-gray-500 dark:text-gray-300">
                                                        {typeof conv.last_message === 'string' ? conv.last_message : 'No messages yet.'}
                                                    </div>
                                                </div>
                                                {/* Time */}
                                                <div
                                                    className="ml-2 text-xs whitespace-nowrap text-gray-400"
                                                    title={new Date(
                                                        typeof conv.updated_at === 'string' ? conv.updated_at : new Date().toISOString(),
                                                    ).toLocaleString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                >
                                                    {conv.formatted_time ||
                                                        new Date(
                                                            typeof conv.updated_at === 'string' ? conv.updated_at : new Date().toISOString(),
                                                        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {/* Chat Window */}
                        <div className="flex h-full min-h-[400px] flex-1 items-center justify-center bg-white/80 dark:bg-gray-900">
                            {selectedConv ? (
                                <div className="flex h-full w-full flex-col">
                                    {user && selectedConv?.id ? (
                                        <Chat conversationId={parseInt(selectedConv.id.toString(), 10)} currentUser={user} />
                                    ) : null}
                                </div>
                            ) : (
                                <div className="flex min-h-[650px] w-full items-center justify-center text-lg text-gray-400">
                                    Select a conversation to start chatting.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
