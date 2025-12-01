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

/**
 * Formats a date string to show relative time (e.g., "2 hours ago", "yesterday", "Monday at 3:00 PM")
 */
export function formatNotificationTime(date: string): string {
    try {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        // Just now (less than 1 minute)
        if (diffSeconds < 60) {
            return 'just now';
        }

        // Minutes ago (less than 1 hour)
        if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        }

        // Hours ago (less than 24 hours)
        if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        }

        // Yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (
            then.getDate() === yesterday.getDate() &&
            then.getMonth() === yesterday.getMonth() &&
            then.getFullYear() === yesterday.getFullYear()
        ) {
            const timeStr = then.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
            return `yesterday at ${timeStr}`;
        }

        // This week (within last 7 days)
        if (diffDays < 7) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[then.getDay()];
            const timeStr = then.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
            return `${dayName} at ${timeStr}`;
        }

        // Older dates - show date and time
        const dateStr = then.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: then.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
        const timeStr = then.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        return `${dateStr} at ${timeStr}`;
    } catch {
        return 'Just now';
    }
}
