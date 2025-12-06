import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: string[];
    [key: string]: unknown; // This allows for additional properties...
}

export interface Car {
  id: string | number;
  name: string;
  image?: string;
  images?: string[];
  brand?: string;
  car_model?: {
    id: number;
    name: string;
    slug: string;
    image?: string;
  };
  specifications?: {
    seats?: number;
    fuelType?: string;
    transmission?: string;
    type?: string;
  };
  features?: string[];
  minAge?: number;
  currency?: string;
  price?: {
    perDay?: {
      withoutDriver?: number;
      withDriver?: number;
    };
    currency?: string;
  };
  extraInfo?: string;
  rental?: number;
  withDriver?: number;
  offer?: { id: number };
  store?: {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    rating?: number;
    reviews?: number;
    description?: string;
    logo_url?: string;
  };
  [key: string]: unknown;
}
