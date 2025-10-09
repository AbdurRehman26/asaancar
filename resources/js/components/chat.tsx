import { useEffect, useRef, useState } from 'react';
import echo from '../lib/echo';
import { apiFetch } from '@/lib/utils';

interface User {
    id: number;
    name: string;
}

interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    message: string | object;
    is_read: boolean;
    created_at: string | object;
    updated_at: string | object;
    sender?: User; // Optional sender object for when it's populated
}

interface RawMessage {
    id: number | string;
    conversation_id: number | string;
    sender_id: number | string;
    message: string | object;
    is_read: boolean;
    created_at: string | object;
    updated_at: string | object;
}

interface ChatProps {
    conversationId: number;
    currentUser: User;
}

export default function Chat({ conversationId, currentUser }: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        apiFetch(`/api/chat/conversations/${conversationId}/messages`)
            .then(async (res) => {
                if (!res.ok) {
                    setError('Failed to load messages');
                    setMessages([]);
                } else {
                    const messagesData = await res.json();
                    // Ensure all message properties are properly formatted
                    const formattedMessages = messagesData.map((msg: RawMessage) => {
                        return {
                            id: Number(msg.id) || 0,
                            conversation_id: Number(msg.conversation_id) || 0,
                            sender_id: Number(msg.sender_id) || 0,
                            message: String(msg.message || ''),
                            is_read: Boolean(msg.is_read),
                            created_at: String(msg.created_at || new Date().toISOString()),
                            updated_at: String(msg.updated_at || new Date().toISOString())
                        };
                    });
                    setMessages(formattedMessages);
                }
            })
            .catch(() => setError('Failed to load messages'))
            .finally(() => setLoading(false));
    }, [conversationId]);

    useEffect(() => {
        const channel = echo.private(`conversation.${conversationId}`);
        channel.listen('MessageSent', (event: unknown) => {
            const message = event as RawMessage;
            // Format the message to ensure proper types
            const formattedMessage = {
                id: Number(message.id) || 0,
                conversation_id: Number(message.conversation_id) || 0,
                sender_id: Number(message.sender_id) || 0,
                message: String(message.message || ''),
                is_read: Boolean(message.is_read),
                created_at: String(message.created_at || new Date().toISOString()),
                updated_at: String(message.updated_at || new Date().toISOString())
            };
            // Only add if not sent by current user and not already present
            setMessages((prev) => {
                if (formattedMessage.sender_id === currentUser.id) return prev;
                if (prev.some((m) => m.id === formattedMessage.id)) return prev;
                return [...prev, formattedMessage];
            });
        });
        return () => {
            channel.stopListening('MessageSent');
        };
    }, [conversationId, currentUser.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        setSending(true);
        try {
            const res = await apiFetch(`/api/chat/conversations/${conversationId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ message: input }),
            });
            const msg = await res.json();
            // Format the message to ensure proper types
            const formattedMsg = {
                id: Number(msg.id) || 0,
                conversation_id: Number(msg.conversation_id) || 0,
                sender_id: Number(msg.sender_id) || 0,
                message: String(msg.message || ''),
                is_read: Boolean(msg.is_read),
                created_at: String(msg.created_at || new Date().toISOString()),
                updated_at: String(msg.updated_at || new Date().toISOString())
            };
            // Only add if not already present
            setMessages((prev) => {
                if (prev.some((m) => m.id === formattedMsg.id)) return prev;
                return [...prev, formattedMsg];
            });
            setInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-300 dark:border-gray-800 h-[500px] max-h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Loading messages...</div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full text-red-500">{error}</div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">No messages yet.</div>
                ) : (
                    messages.map((msg) => {
                        const isCurrentUser = msg.sender_id === currentUser.id;
                        const senderName = isCurrentUser ? currentUser.name : `User ${msg.sender_id}`;

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`px-4 py-2 rounded-lg max-w-xs
                                    ${isCurrentUser
                                        ? 'bg-primary text-white dark:bg-primary dark:text-white'
                                        : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'}
                                `}>
                                    <span className="block text-xs font-semibold mb-1">{senderName}</span>
                                    <span>{typeof msg.message === 'string' ? msg.message : JSON.stringify(msg.message)}</span>
                                </div>
                                <span className="text-xs text-gray-400 mt-1">{new Date(typeof msg.created_at === 'string' ? msg.created_at : JSON.stringify(msg.created_at)).toLocaleTimeString()}</span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 flex gap-2 border-t border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900">
                <input
                    className="flex-1 rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-white px-4 py-2 focus:outline-none border border-gray-300 dark:border-gray-700"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                />
                <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                        sending
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
                    }`}
                    disabled={sending || !input.trim()}
                >
                    {sending ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                        </>
                    ) : (
                        'Send'
                    )}
                </button>
            </form>
        </div>
    );
}
