import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'w-full py-3.5 px-4 rounded-lg font-medium text-sm tracking-wide transition-all duration-300 transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gold-gradient text-stone-950 hover:shadow-lg font-semibold',
    secondary: 'bg-stone-850 hover:bg-stone-900 text-white border border-stone-700',
    outline: 'border border-[#0e3f38] text-stone-300 hover:bg-stone-950/45',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
      ) : null}
      {children}
    </button>
  );
};
