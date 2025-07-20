export interface Conversation {
  id: string;
  type: string;
  booking_id?: string;
  store?: { name?: string };
  store_id?: string;
  unread_count?: number;
  last_message?: string;
  updated_at?: string;
} 