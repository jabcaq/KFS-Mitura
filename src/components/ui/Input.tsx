import React, { useState, forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'floating';
  error?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  error = false,
  icon,
  iconPosition = 'left',
  className = '',
  placeholder,
  value,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';

  const baseClasses = `
    modern-input
    ${variant === 'floating' ? 'modern-input-floating' : 'modern-input-default'}
    ${error ? 'modern-input-error' : ''}
    ${icon ? `modern-input-with-icon modern-input-icon-${iconPosition}` : ''}
    ${className}
  `.trim();

  return (
    <div className="modern-input-wrapper">
      {icon && (
        <div className={`modern-input-icon modern-input-icon-${iconPosition}`}>
          {icon}
        </div>
      )}
      
      <input
        ref={ref}
        className={baseClasses}
        value={value}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        placeholder={placeholder}
        {...props}
      />
      
      {variant === 'floating' && placeholder && (
        <label 
          className={`modern-input-label ${isFocused || hasValue ? 'modern-input-label-active' : ''}`}
          htmlFor={props.id}
        >
          {placeholder}
        </label>
      )}
    </div>
  );
});

Input.displayName = 'Input';