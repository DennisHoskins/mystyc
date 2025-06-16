'use client';

import { useAppStore } from '@/store/appStore';
import Text from '@/components/ui/Text';

export default function Toast() {
  const toasts = useAppStore((state) => state.toasts);
  const hideToast = useAppStore((state) => state.hideToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            p-4 rounded-lg shadow-lg min-w-80 max-w-md animate-toast-in
            ${toast.type === 'success' ? 'bg-green-50 border border-green-200' : ''}
            ${toast.type === 'error' ? 'bg-red-50 border border-red-200' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 border border-blue-200' : ''}
          `}
        >
          <div className="flex justify-between items-start">
            <Text 
              variant="small" 
              className={`
                ${toast.type === 'success' ? 'text-green-800' : ''}
                ${toast.type === 'error' ? 'text-red-800' : ''}
                ${toast.type === 'info' ? 'text-blue-800' : ''}
              `}
            >
              {toast.message}
            </Text>
            <button
              onClick={() => hideToast(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}