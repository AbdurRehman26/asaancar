import { useEffect, useState } from 'react';
import ConversationList from '../components/conversation-list';
import Chat from '../components/chat';
import { useAuth } from '@/components/AuthContext';
import { apiFetch } from '@/lib/utils';

// Define a Conversation type for the chat page with at least id, type, booking_id, store_id properties.
// Use Conversation type for selected and conversation objects.
// Fix property access errors for id and other properties.
interface Conversation {
    id: string | number;
    type: 'booking' | 'store';
    booking_id?: string | number;
    store_id?: string | number;
}

function useQuery() {
    if (typeof window === 'undefined') return {};
    return Object.fromEntries(new URLSearchParams(window.location.search));
}

export default function ChatPage() {
    const { user } = useAuth();
    const [selected, setSelected] = useState<Conversation | null>(null);
    const query = useQuery();

    useEffect(() => {
        apiFetch('/api/chat/conversations')
            .then(async (res) => {
                const data = await res.json();
                // If booking or store param is present, auto-select or create conversation
                if (query.booking) {
                    const conv = data.find((c: Conversation) => c.type === 'booking' && String(c.booking_id) === String(query.booking));
                    if (conv) {
                        setSelected(conv);
                    } else {
                        apiFetch('/api/chat/conversations', {
                            method: 'POST',
                            body: JSON.stringify({ type: 'booking', booking_id: query.booking }),
                        }).then(async (res) => {
                            const newConv = await res.json();
                            setSelected(newConv);
                        });
                    }
                } else if (query.store) {
                    const conv = data.find((c: Conversation) => c.type === 'store' && String(c.store_id) === String(query.store));
                    if (conv) {
                        setSelected(conv);
                    } else {
                        apiFetch('/api/chat/conversations', {
                            method: 'POST',
                            body: JSON.stringify({ type: 'store', store_id: query.store }),
                        }).then(async (res) => {
                            const newConv = await res.json();
                            setSelected(newConv);
                        });
                    }
                }
            });
        // eslint-disable-next-line
    }, []);

    return (
        <div className="flex h-[80vh] gap-4 p-4 bg-gray-900 rounded-lg shadow-lg">
            <div className="w-1/3 h-full">
                <ConversationList onSelect={setSelected} selectedId={typeof selected?.id === 'string' ? Number(selected.id) : selected?.id} />
            </div>
            <div className="flex-1 h-full">
                {!user ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Please log in to start chatting.</div>
                ) : selected ? (
                    <Chat conversationId={typeof selected.id === 'string' ? Number(selected.id) : selected.id} currentUser={user} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">Select a conversation to start chatting.</div>
                )}
            </div>
        </div>
    );
} 