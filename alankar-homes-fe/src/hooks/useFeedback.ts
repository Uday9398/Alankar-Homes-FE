import { createContext, useContext } from 'react';
import type React from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ConfirmOptions {
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'gold' | 'danger';
  icon?: React.ReactNode;
}

export interface FeedbackContextValue {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
  // Resolves true when the user confirms, false when they cancel
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const useFeedback = () => {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error('useToast/useConfirm must be used inside <FeedbackProvider>');
  return value;
};

export const useToast = () => useFeedback().toast;
export const useConfirm = () => useFeedback().confirm;
