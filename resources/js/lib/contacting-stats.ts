import { apiFetch } from '@/lib/utils';

type ContactMethod = 'call' | 'whatsapp' | 'chat';
type ContactableType = 'pick_and_drop' | 'ride_request';

interface RecordContactingStatPayload {
    recipientUserId: number;
    contactableType: ContactableType;
    contactableId: number;
    contactMethod: ContactMethod;
}

export function recordContactingStat(payload: RecordContactingStatPayload): void {
    void apiFetch('/api/contacting-stats', {
        method: 'POST',
        keepalive: true,
        body: JSON.stringify({
            recipient_user_id: payload.recipientUserId,
            contactable_type: payload.contactableType,
            contactable_id: payload.contactableId,
            contact_method: payload.contactMethod,
        }),
    }).catch(() => null);
}
