import { toastStore } from '@skeletonlabs/skeleton';
import type { ToastSettings } from '@skeletonlabs/skeleton';

export const triggerError = (message: string) => {
  const t: ToastSettings = {
    message: message,
    background: 'variant-filled-error'
  };
  toastStore.trigger(t);
};
