import React from 'react';

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  completedSteps,
  className = ''
}) => {
  return (
    <nav className={`progress-steps ${className}`} aria-label="Progress">
      <ol className="progress-steps-list">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;

          return (
            <li 
              key={step.id} 
              className={`progress-step ${
                isCompleted ? 'completed' : 
                isCurrent ? 'current' : 
                'upcoming'
              }`}
            >
              <div className="progress-step-content">
                <div className="progress-step-indicator">
                  {isCompleted ? (
                    <svg className="progress-step-check" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : step.icon ? (
                    <div className="progress-step-icon">{step.icon}</div>
                  ) : (
                    <span className="progress-step-number">{stepNumber}</span>
                  )}
                </div>
                
                <div className="progress-step-text">
                  <div className="progress-step-title">{step.title}</div>
                  {step.description && (
                    <div className="progress-step-description">{step.description}</div>
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={`progress-step-connector ${
                    isCompleted ? 'completed' : 'incomplete'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};