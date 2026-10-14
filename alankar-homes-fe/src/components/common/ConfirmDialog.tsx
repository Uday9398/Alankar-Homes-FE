import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'gold' | 'danger';
  isLoading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const TONES = {
  gold: {
    halo: 'from-[#ecc588] via-[#caa060]/40 to-[#b88543]',
    icon: 'text-[#ecc588]',
    glow: 'bg-amber-500/10',
    button: 'bg-gold-gradient text-stone-950 hover:shadow-[0_0_24px_rgba(236,197,136,0.35)]',
    spinner: 'border-stone-950',
  },
  danger: {
    halo: 'from-red-400 via-red-700/40 to-red-900',
    icon: 'text-red-300',
    glow: 'bg-red-500/10',
    button: 'bg-gradient-to-b from-red-600 to-red-800 text-red-50 hover:shadow-[0_0_24px_rgba(239,68,68,0.35)]',
    spinner: 'border-white',
  },
};

// A themed replacement for window.confirm
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  icon,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'gold',
  isLoading = false,
  error,
  onConfirm,
  onCancel,
}) => {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const t = TONES[tone];

  // Escape closes, the page behind doesn't scroll, and focus starts on the safe choice
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onCancel();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    cancelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#000806]/75 backdrop-blur-sm animate-backdrop-in"
        onClick={() => !isLoading && onCancel()}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-2xl overflow-hidden animate-dialog-in shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        {/* Thin gold edge around the card */}
        <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-b from-[#caa060]/50 via-[#0e3f38] to-[#0e3f38] pointer-events-none" />

        <div className="relative m-px rounded-2xl bg-gradient-to-b from-[#06302a] via-[#021a17] to-[#011210] px-6 pt-8 pb-6 sm:px-8">
          {/* Soft spotlight at the top */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 rounded-full bg-[#caa060]/10 blur-3xl pointer-events-none" />

          <button
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-500 hover:text-stone-200 hover:bg-white/5 cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative flex flex-col items-center text-center gap-4">
            {icon && (
              <div className="relative">
                <div className={`absolute inset-0 -m-3 rounded-full blur-xl ${t.glow}`} />
                <div className={`relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-b ${t.halo}`}>
                  <div className={`w-full h-full rounded-full bg-[#031f1b] border-2 border-[#0c2e28] flex items-center justify-center ${t.icon}`}>
                    {icon}
                  </div>
                </div>
              </div>
            )}

            <h2 id={titleId} className="font-serif text-xl sm:text-2xl text-[#ecc588] tracking-wide leading-snug">
              {title}
            </h2>

            {children && <div className="w-full text-sm text-[#8ba5a0] leading-relaxed">{children}</div>}

            {error && (
              <div className="w-full text-left text-xs font-medium text-red-300 bg-red-950/50 border border-red-900/60 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>

          <div className="relative mt-7 flex flex-col-reverse sm:flex-row gap-3">
            <button
              ref={cancelRef}
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-lg text-sm font-medium border border-[#0e3f38] text-stone-300 hover:bg-white/5 hover:border-[#1a5a50] transition-colors cursor-pointer disabled:opacity-40"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-wait ${t.button}`}
            >
              {isLoading && <span className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${t.spinner}`} />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
