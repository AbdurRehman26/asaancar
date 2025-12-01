import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, type Notification } from '@/hooks/use-notifications';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import Navbar from '@/components/navbar';

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    currentPage,
    totalPages,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  } = useNotifications();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchNotifications(1, unreadOnly);
  }, [unreadOnly, fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    const data = notification.data;
    if (data.booking_id) {
      navigate(`/dashboard/bookings/${data.booking_id}`);
    } else if (data.conversation_id) {
      navigate(`/chat`);
    } else if (data.type === 'car_offer') {
      navigate('/dashboard/cars');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      success('All notifications marked as read');
    } catch (err) {
      showError('Failed to mark all as read', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await deleteAll();
        success('All notifications deleted');
      } catch (err) {
        showError('Failed to delete notifications', err instanceof Error ? err.message : 'Unknown error');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      await Promise.all(Array.from(selectedNotifications).map(id => deleteNotification(id)));
      setSelectedNotifications(new Set());
      success('Selected notifications deleted');
    } catch (err) {
      showError('Failed to delete notifications', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const getNotificationMessage = (notification: Notification): string => {
    const data = notification.data;
    return data.message || 'New notification';
  };

  const getNotificationTime = (createdAt: string): string => {
    try {
      return formatTimeAgo(createdAt);
    } catch {
      return 'Just now';
    }
  };

  const getNotificationTypeLabel = (notification: Notification): string => {
    const data = notification.data;
    if (data.type === 'booking_created') return 'Booking';
    if (data.type === 'message_received') return 'Message';
    if (data.type === 'car_offer') return 'Car Offer';
    if (data.type === 'booking_status_changed') return 'Booking Update';
    return 'Notification';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar currentPage="notifications" />
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-[#7e246c]" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUnreadOnly(!unreadOnly)}
                  className={unreadOnly ? 'bg-[#7e246c] text-white' : ''}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {unreadOnly ? 'Show All' : 'Unread Only'}
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAll}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </Button>
                )}
              </div>
            </div>

            {selectedNotifications.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedNotifications.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedNotifications.size === notifications.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm mt-2">
                  {unreadOnly ? 'You have no unread notifications' : 'You have no notifications yet'}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.read_at ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${selectedNotifications.has(notification.id) ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#7e246c] focus:ring-[#7e246c]"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-[#7e246c] dark:text-[#9d3a8a]">
                              {getNotificationTypeLabel(notification)}
                            </span>
                            {!notification.read_at && (
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {getNotificationMessage(notification)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {getNotificationTime(notification.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.read_at && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await markAsRead(notification.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNotifications(currentPage - 1, unreadOnly)}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNotifications(currentPage + 1, unreadOnly)}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

