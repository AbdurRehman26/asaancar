import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * apiFetch: fetch wrapper that adds Bearer token from localStorage if present.
 * Usage: apiFetch(url, options)
 */
export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = new Headers(init.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    if (!(init.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    return fetch(input, { ...init, headers });
}
