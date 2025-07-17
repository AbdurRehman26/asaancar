import { useEffect, useRef, useState } from 'react';
import echo from '../lib/echo';
import { apiFetch } from '@/lib/utils';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        apiFetch(`/api/chat/conversations/${conversationId}/messages`)
            .then(async (res) => setMessages(await res.json()));
    }, [conversationId]);

    useEffect(() => {
        const channel = echo.private(`conversation.${conversationId}`);
        channel.listen('MessageSent', (event: unknown) => {
            setMessages((prev) => [...prev, event as Message]);
        });
        return () => {
            channel.stopListening('MessageSent');
        };
    }, [conversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const res = await apiFetch(`/api/chat/conversations/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message: input }),
        });
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full min-h-[650px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-300 dark:border-gray-800">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg) => (
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
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 flex gap-2 border-t border-gray-300 dark:border-gray-800">
                <input
                    className="flex-1 rounded bg-white text-gray-900 dark:bg-gray-800 dark:text-white px-4 py-2 focus:outline-none border border-gray-300 dark:border-gray-700"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg">Send</button>
            </form>
        </div>
    );
} 