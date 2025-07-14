import { useEffect, useState } from 'react';
import axios from 'axios';
import { apiFetch } from '@/lib/utils';

interface Conversation {
    id: number;
    type: 'booking' | 'store';
    booking_id?: number;
    store_id?: number;
    booking?: { id: number };
    store?: { id: number; name: string };
    updated_at: string;
    unread_count?: number;
}

interface ConversationListProps {
    onSelect: (conversation: Conversation) => void;
    selectedId?: number;
}

export default function ConversationList({ onSelect, selectedId }: ConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/api/chat/conversations')
            .then(async (res) => {
                setConversations(await res.json());
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-4 text-gray-400">Loading conversations...</div>;
    if (!conversations.length) return <div className="p-4 text-gray-400">No conversations yet.</div>;

    return (
        <div className="flex flex-col gap-2 p-2 bg-gray-900 rounded-lg shadow-lg h-full">
            {conversations.map((conv) => (
                <button
                    key={conv.id}
                    className={`text-left px-4 py-3 rounded-lg transition-colors w-full ${selectedId === conv.id ? 'bg-primary text-white' : 'bg-gray-800 text-gray-100 hover:bg-gray-700'}`}
                    onClick={() => onSelect(conv)}
                >
                    <div className="font-semibold flex items-center gap-2">
                        {conv.type === 'booking' ? `Booking #${conv.booking_id}` : conv.store?.name || `Store #${conv.store_id}`}
                        {typeof conv.unread_count === 'number' && conv.unread_count > 0 && (
                            <span className="ml-2 inline-block min-w-[20px] px-2 py-0.5 rounded-full bg-red-600 text-white text-xs text-center">{conv.unread_count}</span>
                        )}
                    </div>
                    <div className="text-xs text-gray-400">Last updated: {new Date(conv.updated_at).toLocaleString()}</div>
                </button>
            ))}
        </div>
    );
} 