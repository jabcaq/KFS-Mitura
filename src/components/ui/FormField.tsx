import React, { useState, useId } from 'react';

interface FormFieldProps {
  label: string | React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  children,
  description,
  className = ''
}) => {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`form-field ${className}`}>
      <div className="form-field-wrapper">
        <label 
          htmlFor={id} 
          className={`form-label ${isFocused || error ? 'focused' : ''} ${error ? 'error' : ''}`}
        >
          {label}
          {required && <span className="form-label-required" aria-label="required">*</span>}
        </label>
        
        <div 
          className={`form-control-wrapper ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {React.isValidElement(children) ? React.cloneElement(children, { 
            id,
            'aria-invalid': !!error,
            'aria-describedby': error ? `${id}-error` : description ? `${id}-description` : undefined
          } as any) : children}
        </div>

        {description && !error && (
          <p id={`${id}-description`} className="form-description">
            {description}
          </p>
        )}

        {error && (
          <p 
            id={`${id}-error`} 
            className="form-error" 
            role="alert"
            aria-live="polite"
          >
            <svg className="form-error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};