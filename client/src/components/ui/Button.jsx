import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  className = '',
  icon: Icon = null,
  ...props 
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold text-xs tracking-wide uppercase px-4 py-2.5 rounded-lg transition-all duration-200 focus:outline-none select-none';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-[0.98] border border-transparent disabled:bg-blue-400',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 active:scale-[0.98] disabled:bg-slate-50 disabled:text-slate-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow active:scale-[0.98] border border-transparent disabled:bg-red-400',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:scale-[0.98] border border-transparent disabled:bg-emerald-400',
  };

  const currentVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${currentVariant} ${className} disabled:opacity-75 disabled:pointer-events-none`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="-ml-0.5 mr-1.5 h-3.5 w-3.5" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
