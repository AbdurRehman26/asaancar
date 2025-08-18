import { useEffect, useRef, useState } from 'react';
import echo from '../lib/echo';
import { apiFetch } from '../lib/utils';

interface User {
    id: number;
    name: string;
}

interface Message {
    id: number;
    sender: User;
    message: string;
    created_at: string;
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
                    setMessages(await res.json());
                }
            })
            .catch(() => setError('Failed to load messages'))
            .finally(() => setLoading(false));
    }, [conversationId]);

    useEffect(() => {
        const channel = echo.private(`conversation.${conversationId}`);
        channel.listen('MessageSent', (event: unknown) => {
            const message = event as Message;
            // Only add if not sent by current user and not already present
            setMessages((prev) => {
                if (message.sender.id === currentUser.id) return prev;
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
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
            // Only add if not already present
            setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
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
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.sender.id === currentUser.id ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`px-4 py-2 rounded-lg max-w-xs 
                                ${msg.sender.id === currentUser.id 
                                    ? 'bg-primary text-white dark:bg-primary dark:text-white' 
                                    : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'}
                            `}>
                                <span className="block text-xs font-semibold mb-1">{msg.sender.name}</span>
                                <span>{msg.message}</span>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
                        </div>
                    ))
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
