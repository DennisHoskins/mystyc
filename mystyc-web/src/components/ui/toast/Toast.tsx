'use client'

import { useAppStore } from '@/store/appStore';

import styles from './Toast.module.css';
import Text from '@/components/ui/Text';

export default function Toast() {
  const toasts = useAppStore((state) => state.toasts);
  const hideToast = useAppStore((state) => state.hideToast);

  if (toasts.length === 0) return null;

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const colors = {
    success: {
      bg: 'bg-purple-700',
      icon: 'text-white',
      text: 'text-white',
      close: 'text-white/70 hover:text-white'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      icon: 'text-white',
      text: 'text-white',
      close: 'text-white/70 hover:text-white'
    },
    info: {
      bg: 'bg-[var(--color-main)]',
      icon: 'text-white',
      text: 'text-white',
      close: 'text-white/70 hover:text-white'
    }
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${styles.animateToastIn}
            ${colors[toast.type].bg}
            p-4 rounded-xl shadow-2xl min-w-[320px] max-w-md
            backdrop-blur-sm transform transition-all duration-300
            hover:scale-[1.02] hover:shadow-3xl
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`${colors[toast.type].icon} flex-shrink-0 mt-0.5`}>
              {icons[toast.type]}
            </div>
            <Text 
              variant="small" 
              className={`${colors[toast.type].text} flex-1 font-medium`}
            >
              {toast.message}
            </Text>
            <button
              onClick={() => hideToast(toast.id)}
              className={`${colors[toast.type].close} flex-shrink-0 transition-colors duration-200`}
              aria-label="Close notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}