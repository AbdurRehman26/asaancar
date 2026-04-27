import { apiFetch } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface UnreadSummaryResponse {
    unread_conversations?: number;
    unread_messages?: number;
}

export function useChatUnreadSummary(enabled = true) {
    const [unreadConversations, setUnreadConversations] = useState(0);

    useEffect(() => {
        if (!enabled) {
            setUnreadConversations(0);

            return;
        }

        let isMounted = true;

        const fetchUnreadSummary = async () => {
            try {
                const response = await apiFetch('/api/chat/unread-summary');

                if (!response.ok) {
                    return;
                }

                const data: UnreadSummaryResponse = await response.json();

                if (isMounted) {
                    setUnreadConversations(data.unread_conversations ?? 0);
                }
            } catch {
                if (isMounted) {
                    setUnreadConversations(0);
                }
            }
        };

        void fetchUnreadSummary();

        const intervalId = window.setInterval(() => {
            void fetchUnreadSummary();
        }, 30000);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
        };
    }, [enabled]);

    return { unreadConversations };
}
