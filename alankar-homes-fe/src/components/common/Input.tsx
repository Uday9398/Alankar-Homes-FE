import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full text-left">
      {label && (
        <label className="text-[10px] font-bold tracking-widest text-[#8ba5a0] uppercase">
          {label}
        </label>
      )}
      <input
        className={`input-field px-4 py-3.5 rounded-lg text-sm text-stone-100 placeholder:text-stone-600 w-full ${
          error ? 'border-red-500/80 focus:border-red-500/80' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 font-medium tracking-wide">{error}</span>}
    </div>
  );
};
