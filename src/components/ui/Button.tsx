import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = `
    modern-button
    modern-button-${variant}
    modern-button-${size}
    ${fullWidth ? 'modern-button-full' : ''}
    ${loading ? 'modern-button-loading' : ''}
    ${className}
  `.trim();

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={baseClasses}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg 
          className="modern-button-spinner" 
          viewBox="0 0 24 24" 
          fill="none"
          aria-hidden="true"
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
            className="opacity-25"
          />
          <path 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            className="opacity-75"
          />
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="modern-button-icon modern-button-icon-left">
          {icon}
        </span>
      )}
      
      <span className="modern-button-text">
        {children}
      </span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="modern-button-icon modern-button-icon-right">
          {icon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';