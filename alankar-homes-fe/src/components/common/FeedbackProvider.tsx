import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { FeedbackContext } from '../../hooks/useFeedback';
import type { ConfirmOptions, FeedbackContextValue, ToastType } from '../../hooks/useFeedback';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

const TOAST_DURATION = 4000;
const MAX_TOASTS = 4;

const TOAST_STYLES = {
  success: { icon: CheckCircle2, accent: 'text-emerald-400', border: 'border-emerald-800/60' },
  error: { icon: XCircle, accent: 'text-red-400', border: 'border-red-900/70' },
  info: { icon: Info, accent: 'text-[#ecc588]', border: 'border-[#caa060]/40' },
};

// Gives the whole app toasts (useToast) and a themed promise-based confirm popup (useConfirm)
export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev, { id, type, message }].slice(-MAX_TOASTS));
      setTimeout(() => dismiss(id), TOAST_DURATION);
    },
    [dismiss]
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    // A new request replaces any open one, which counts as cancelled
    resolver.current?.(false);
    setConfirmState(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setConfirmState(null);
  }, []);

  const handleCancel = useCallback(() => settle(false), [settle]);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      toast: {
        success: (message) => show('success', message),
        error: (message) => show('error', message),
        info: (message) => show('info', message),
      },
      confirm,
    }),
    [show, confirm]
  );

  const tone = confirmState?.tone ?? 'gold';

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.title ?? ''}
        icon={confirmState?.icon ?? (tone === 'danger' ? <AlertTriangle className="w-7 h-7" strokeWidth={1.5} /> : undefined)}
        confirmLabel={confirmState?.confirmLabel ?? 'Confirm'}
        cancelLabel={confirmState?.cancelLabel}
        tone={tone}
        onConfirm={() => settle(true)}
        onCancel={handleCancel}
      >
        {confirmState?.message}
      </ConfirmDialog>

      {createPortal(
        <div
          aria-live="polite"
          className="fixed z-[60] top-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:w-96 flex flex-col gap-3 pointer-events-none"
        >
          {toasts.map((t) => {
            const s = TOAST_STYLES[t.type];
            const Icon = s.icon;
            return (
              <div
                key={t.id}
                role={t.type === 'error' ? 'alert' : 'status'}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${s.border} bg-gradient-to-b from-[#06302a] to-[#011210] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)] animate-toast-in`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.accent}`} />
                <p className="flex-1 text-sm text-stone-200 leading-snug">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                  className="p-0.5 rounded text-stone-500 hover:text-stone-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </FeedbackContext.Provider>
  );
};
