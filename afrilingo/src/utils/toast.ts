import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Trophy,
  Flame,
  Star,
  PartyPopper,
  type LucideIcon
} from 'lucide-react';
import { createElement } from 'react';

// Custom toast configurations
const toastConfig = {
  duration: 3000,
  position: 'top-center' as const,
  style: {
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
  },
};

// Icon components for different toast types
const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  achievement: Trophy,
  streak: Flame,
  levelUp: Star,
  celebration: PartyPopper,
} as const;

// Custom toast functions with built-in icons
export const showToast = {
  success: (message: string, duration?: number) => {
    return toast.success(message, {
      ...toastConfig,
      duration: duration || toastConfig.duration,
      icon: createElement(icons.success, { size: 20, className: 'text-green-600' }),
    });
  },

  error: (message: string, duration?: number) => {
    return toast.error(message, {
      ...toastConfig,
      duration: duration || toastConfig.duration,
      icon: createElement(icons.error, { size: 20, className: 'text-red-600' }),
    });
  },

  info: (message: string, duration?: number) => {
    return toast(message, {
      ...toastConfig,
      duration: duration || toastConfig.duration,
      icon: createElement(icons.info, { size: 20, className: 'text-blue-600' }),
    });
  },

  achievement: (message: string, duration?: number) => {
    return toast.success(message, {
      ...toastConfig,
      duration: duration || 5000,
      icon: createElement(icons.achievement, { size: 20, className: 'text-yellow-600' }),
      style: {
        ...toastConfig.style,
        border: '1px solid #fbbf24',
        backgroundColor: '#fffbeb',
      },
    });
  },

  streak: (message: string, duration?: number) => {
    return toast.success(message, {
      ...toastConfig,
      duration: duration || 4000,
      icon: createElement(icons.streak, { size: 20, className: 'text-orange-600' }),
      style: {
        ...toastConfig.style,
        border: '1px solid #fb923c',
        backgroundColor: '#fff7ed',
      },
    });
  },

  levelUp: (message: string, duration?: number) => {
    return toast.success(message, {
      ...toastConfig,
      duration: duration || 4000,
      icon: createElement(icons.levelUp, { size: 20, className: 'text-purple-600' }),
      style: {
        ...toastConfig.style,
        border: '1px solid #a855f7',
        backgroundColor: '#faf5ff',
      },
    });
  },

  celebration: (message: string, duration?: number) => {
    return toast.success(message, {
      ...toastConfig,
      duration: duration || 4000,
      icon: createElement(icons.celebration, { size: 20, className: 'text-nigeria-green' }),
      style: {
        ...toastConfig.style,
        border: '1px solid #008751',
        backgroundColor: '#f0fdf4',
      },
    });
  },

  // Custom toast with any Lucide icon
  custom: (message: string, IconComponent: LucideIcon, className?: string, duration?: number) => {
    return toast(message, {
      ...toastConfig,
      duration: duration || toastConfig.duration,
      icon: createElement(IconComponent, { size: 20, className: className || 'text-gray-600' }),
    });
  },

  // Dismissible toast
  dismissible: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const iconComponent = icons[type];
    const iconColor = type === 'success' ? 'text-green-600' : 
                      type === 'error' ? 'text-red-600' : 'text-blue-600';
    
    const toastOptions = {
      ...toastConfig,
      duration: Infinity,
      icon: createElement(iconComponent, { size: 20, className: iconColor }),
    };

    // Use the appropriate toast method based on type
    if (type === 'success') {
      return toast.success(message, toastOptions);
    } else if (type === 'error') {
      return toast.error(message, toastOptions);
    } else {
      return toast(message, toastOptions);
    }
  },

  // Promise-based toast (for async operations)
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
    duration?: number
  ) => {
    return toast.promise(promise, messages, {
      ...toastConfig,
      duration: duration || toastConfig.duration,
    });
  },
};

// Export the original toast for advanced usage
export { toast as rawToast };

// Type exports for better TypeScript support
export type ToastType = 'success' | 'error' | 'info' | 'achievement' | 'streak' | 'levelUp' | 'celebration';