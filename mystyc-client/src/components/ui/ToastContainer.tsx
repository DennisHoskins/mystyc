'use client';

import { useToastContext } from '@/components/context/ToastContext';

export default function ToastContainer() {
  const { toasts } = useToastContext();

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-black/90 text-white px-4 py-2 rounded-lg shadow-lg animate-toast-in"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}