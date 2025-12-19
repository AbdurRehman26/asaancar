export interface Conversation {
  id: number | string;
  type: string;
  booking_id?: number | string;
  store_id?: number | string;
  store?: {
    name?: string;
  };
  last_message?: string | object;
  unread_count?: number;
  updated_at: string | object;
  created_at?: string;
  formatted_time?: string;
}