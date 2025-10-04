import toast, { Toaster } from 'react-hot-toast';

// Custom toast styles with glassmorphism
export const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    padding: '16px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#ffffff',
    },
    style: {
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)',
      color: '#ffffff',
      border: '1px solid rgba(16, 185, 129, 0.3)',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#ffffff',
    },
    style: {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)',
      color: '#ffffff',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    },
  },
  loading: {
    iconTheme: {
      primary: '#6366f1',
      secondary: '#ffffff',
    },
    style: {
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(79, 70, 229, 0.9) 100%)',
      color: '#ffffff',
      border: '1px solid rgba(99, 102, 241, 0.3)',
    },
  },
};

// Custom toast functions
export const showToast = {
  success: (message: string) => toast.success(message, toastConfig.success),
  error: (message: string) => toast.error(message, toastConfig.error),
  loading: (message: string) => toast.loading(message, toastConfig.loading),
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => toast.promise(promise, messages, toastConfig),
};

export { Toaster };
export default toast;