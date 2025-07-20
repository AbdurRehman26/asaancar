export interface StoreForm {
  store_username: string;
  name: string;
  description?: string;
  logo_url?: string;
  city: string;
  contact_phone: string;
  address?: string;
}

export interface Store {
  id: number;
  store_username: string;
  name: string;
  description?: string;
  logo_url?: string;
  city: string;
  contact_phone: string;
  address?: string;
  created_at: string;
  updated_at: string;
} 