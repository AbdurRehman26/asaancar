import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Chat from '@/components/chat';
import ErrorBoundary from '@/components/ErrorBoundary';
import { UserCircle } from 'lucide-react';
import type { Conversation } from '@/types/dashboard';

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
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900 text-xl text-[#7e246c]">Loading...</div>;
    }

    return (
        <ErrorBoundary>
            <div className="max-w-7xl sm:px-8 lg:px-12 py-6">
                <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-neutral-800 shadow-lg p-0 h-full min-h-[500px] flex flex-col overflow-hidden">
                    <h2 className="text-xl font-bold text-[#7e246c] dark:text-white mb-0 px-8 pt-8 pb-4">Pick & Drop Chat</h2>
                    <div className="flex flex-1 min-h-0">
                        {/* Conversation List */}
                        <div className="w-80 min-w-[220px] max-w-xs border-r border-gray-300 dark:border-neutral-700 bg-white/80 dark:bg-gray-900 h-full overflow-y-auto">
                            {conversationsLoading ? (
                                <div className="p-4 text-gray-400">Loading conversations...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-4 text-gray-400">No pick and drop conversations yet.</div>
                            ) : (
                                <div className="flex flex-col">
                                    {conversations.map((conv: Conversation) => {
                                        const isActive = selectedConv && selectedConv.id === conv.id;
                                        const service = (conv as Conversation & { pickAndDropService?: { start_location?: string; end_location?: string } }).pickAndDropService;
                                        const routeLabel = service 
                                            ? `${service.start_location || 'Start'} → ${service.end_location || 'End'}`
                                            : `Service #${(conv as Conversation & { pick_and_drop_service_id?: number }).pick_and_drop_service_id || 'N/A'}`;
                                        
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
                                                            {routeLabel}
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


