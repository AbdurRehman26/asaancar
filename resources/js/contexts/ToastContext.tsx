import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 3000, // Default 3 seconds
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);
    setProgress(prev => ({ ...prev, [id]: 100 }));

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      // Update progress every 50ms
      const interval = setInterval(() => {
        setProgress(prev => {
          const currentProgress = prev[id] || 100;
          const newProgress = currentProgress - (100 / (newToast.duration / 50));
          
          if (newProgress <= 0) {
            clearInterval(interval);
            removeToast(id);
            return { ...prev, [id]: 0 };
          }
          
          return { ...prev, [id]: newProgress };
        });
      }, 50);
    }
  }, [removeToast]);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration: duration ?? 3000 });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration: duration ?? 3000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration: duration ?? 3000 });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration: duration ?? 3000 });
  }, [addToast]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 dark:bg-green-900 dark:border-green-400';
      case 'error':
        return 'bg-red-50 border-red-500 dark:bg-red-900 dark:border-red-400';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900 dark:border-yellow-400';
      case 'info':
        return 'bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400';
      default:
        return 'bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
              className={`
                w-80 min-w-80 max-w-md shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 overflow-hidden border-2
                ${getToastStyles(toast.type)}
              `}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getToastIcon(toast.type)}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {toast.title}
                    </p>
                    {toast.message && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                        {toast.message}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className="rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => removeToast(toast.id)}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {/* Progress Bar */}
                {toast.duration && toast.duration > 0 && (
                  <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-400 dark:bg-gray-400 transition-all duration-75 ease-linear"
                      style={{ width: `${progress[toast.id] || 100}%` }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
