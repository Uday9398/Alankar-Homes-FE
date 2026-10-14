import React from 'react';
import {
  CUSTOM_STATUS_LABELS,
  CUSTOM_STATUS_STYLES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from '../../utils/constants';

export const Spinner: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-[#8ba5a0]">
    <span className="w-8 h-8 border-2 border-[#caa060] border-t-transparent rounded-full animate-spin"></span>
    <span className="text-xs tracking-wide">{label}</span>
  </div>
);

export const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="text-red-400 text-sm bg-red-950/45 border border-red-900/60 p-4 rounded-lg text-left flex items-center justify-between gap-4">
    <span>{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="text-[#caa060] hover:text-[#ecc588] font-semibold text-xs shrink-0 cursor-pointer">
        Try again
      </button>
    )}
  </div>
);

export const SuccessMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-emerald-400 text-sm bg-emerald-950/45 border border-emerald-900/60 p-4 rounded-lg text-left">
    {message}
  </div>
);

export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; children?: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <div className="glass-card rounded-2xl p-10 md:p-14 flex flex-col items-center text-center gap-4">
    <div className="text-[#caa060]/60">{icon}</div>
    <h2 className="font-serif text-xl text-[#ecc588]">{title}</h2>
    {children}
  </div>
);

// Order labels by default; pass another set (e.g. custom request statuses) to reuse the badge
export const StatusBadge: React.FC<{
  status: string;
  labels?: Record<string, string>;
  styles?: Record<string, string>;
}> = ({ status, labels = ORDER_STATUS_LABELS, styles = ORDER_STATUS_STYLES }) => (
  <span
    className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
      styles[status] || ''
    }`}
  >
    {labels[status] || status}
  </span>
);

export const CustomStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <StatusBadge status={status} labels={CUSTOM_STATUS_LABELS} styles={CUSTOM_STATUS_STYLES} />
);
