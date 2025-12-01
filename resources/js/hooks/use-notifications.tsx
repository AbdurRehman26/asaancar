import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/utils';
import { useAuth } from '@/components/AuthContext';

export interface Notification {
  id: string;
  type: string;
  data: {
    type?: string;
    message?: string;
    booking_id?: number;
    conversation_id?: number;
    message_id?: number;
    sender_name?: string;
    car_name?: string;
    customer_name?: string;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
  formatted_time?: string;
}

interface NotificationResponse {
  data: Notification[];
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  fetchNotifications: (page?: number, unreadOnly?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAll: (readOnly?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const res = await apiFetch('/api/notifications/unread-count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [user]);

  const fetchNotifications = useCallback(async (page = 1, unreadOnly = false) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '15',
      });
      
      if (unreadOnly) {
        params.append('unread_only', 'true');
      }
      
      const res = await apiFetch(`/api/notifications?${params.toString()}`);
      
      if (res.ok) {
        const data: NotificationResponse = await res.json();
        setNotifications(data.data || []);
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      
      if (res.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif
          )
        );
        await fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await apiFetch('/api/notifications/read-all', {
        method: 'PUT',
      });
      
      if (res.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
        );
        await fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [fetchUnreadCount]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        await fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [fetchUnreadCount]);

  const deleteAll = useCallback(async (readOnly = false) => {
    try {
      const params = readOnly ? '?read_only=true' : '';
      const res = await apiFetch(`/api/notifications${params}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setNotifications([]);
        await fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
    }
  }, [fetchUnreadCount]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchNotifications(currentPage), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount, currentPage]);

  // Fetch unread count on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore: currentPage < totalPages,
    currentPage,
    totalPages,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    refresh,
  };
}

