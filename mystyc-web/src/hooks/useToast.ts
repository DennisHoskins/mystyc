import { useToastContext } from '@/components/context/ToastContext';

export function useToast() {
  const { addToast } = useToastContext();
  return { showToast: addToast };
}