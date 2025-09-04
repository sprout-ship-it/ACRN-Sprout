// src/components/common/ProgressIndicator.js
import React from 'react';
import { useUserProgress } from '../../hooks/useUserProgress';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/global.css';

/**
 * Progress indicator component for onboarding and user journey tracking
 */
const ProgressIndicator = ({ 
  steps = null, 
  currentStep = null, 
  showTitle = true,
  showPercentage = true,
  variant = 'default' // 'default', 'compact', 'minimal'
}) => {
  const { progress, currentStep: contextCurrentStep, progressPercentage } = useUserProgress();
  const { hasRole } = useAuth();

  // Use provided steps or generate default steps
  const progressSteps = steps || getDefaultSteps(hasRole);
  const activeStep = currentStep || contextCurrentStep;
  const percentage = progressPercentage;

  // Generate default steps based on user role
  function getDefaultSteps(hasRole) {
    const baseSteps = [
      {
        number: 1,
        label: 'Basic Profile',
        description: 'Complete your personal information',
        completed: progress.basicProfile,
        required: true
      }
    ];

    // Add matching profile step for applicants
    if (hasRole('applicant')) {
      baseSteps.push({
        number: 2,
        label: 'Matching Profile',
        description: 'Set up your roommate preferences',
        completed: progress.matchingProfile,
        required: true
      });
    }

    // Add optional steps
    baseSteps.push(
      {
        number: hasRole('applicant') ? 3 : 2,
        label: 'Find Matches',
        description: 'Start connecting with potential roommates',
        completed: progress.activeMatching,
        required: false
      },
      {
        number: hasRole('applicant') ? 4 : 3,
        label: 'Housing Search',
        description: 'Search for housing with your match',
        completed: progress.hasMatches,
        required: false
      }
    );

    return baseSteps;
  }

  // Render based on variant
  if (variant === 'minimal') {
    return (
      <div className="progress-bar mb-2">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="progress-indicator compact">
        {showTitle && (
          <div className="progress-title">Progress: {percentage}%</div>
        )}
        <div className="progress-bar mb-2">
          <div 
            className="progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-center text-gray-500" style={{ fontSize: '0.8rem' }}>
          Step {activeStep} of {progressSteps.length}
        </div>
      </div>
    );
  }

  // Default full progress indicator
  return (
    <div className="progress-indicator">
      {showTitle && (
        <div className="progress-title">
          Your Recovery Housing Journey
          {showPercentage && (
            <span className="text-gray-600 ml-2">({percentage}% complete)</span>
          )}
        </div>
      )}
      
      <div className="progress-steps">
        {progressSteps.map((step, index) => (
          <div key={step.number} className="progress-step">
            {/* Connector line */}
            {index < progressSteps.length - 1 && (
              <div className={`step-connector ${
                step.completed ? 'step-connector-active' : ''
              }`} />
            )}
            
            {/* Step circle */}
            <div className={`step-number ${
              activeStep === step.number ? 'step-number-active' : 
              step.completed ? 'step-number-completed' : 'step-number-inactive'
            }`}>
              {step.completed ? '✓' : step.number}
            </div>
            
            {/* Step label and description */}
            <div className="step-content">
              <span className="step-label">
                {step.label}
                {step.required && <span className="text-red-500 ml-1">*</span>}
              </span>
              {step.description && (
                <div className="step-description">{step.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Simple progress bar component
 */
export const ProgressBar = ({ 
  percentage, 
  showLabel = false, 
  label = "Progress",
  color = "var(--primary-purple)",
  height = "8px" 
}) => {
  return (
    <div className="progress-container">
      {showLabel && (
        <div className="progress-label mb-1">
          {label}: {Math.round(percentage)}%
        </div>
      )}
      <div 
        className="progress-bar"
        style={{ height }}
      >
        <div 
          className="progress-fill"
          style={{ 
            width: `${Math.min(Math.max(percentage, 0), 100)}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};

/**
 * Step indicator for multi-step forms
 */
export const StepIndicator = ({ 
  steps, 
  currentStep, 
  onStepClick = null,
  variant = 'numbers' // 'numbers', 'dots', 'lines'
}) => {
  if (variant === 'dots') {
    return (
      <div className="step-indicator-dots">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step-dot ${
              index + 1 === currentStep ? 'step-dot-active' :
              index + 1 < currentStep ? 'step-dot-completed' : 'step-dot-inactive'
            }`}
            onClick={() => onStepClick && onStepClick(index + 1)}
            style={{ cursor: onStepClick ? 'pointer' : 'default' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'lines') {
    return (
      <div className="step-indicator-lines">
        {steps.map((step, index) => (
          <div key={index} className="step-line-container">
            <div
              className={`step-line ${
                index + 1 <= currentStep ? 'step-line-active' : 'step-line-inactive'
              }`}
            />
            {step.label && (
              <div className="step-line-label">{step.label}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Default numbers variant
  return (
    <div className="step-indicator-numbers">
      {steps.map((step, index) => (
        <div key={index} className="step-number-container">
          {index > 0 && (
            <div className={`step-connector ${
              index < currentStep ? 'step-connector-active' : ''
            }`} />
          )}
          <div
            className={`step-number ${
              index + 1 === currentStep ? 'step-number-active' :
              index + 1 < currentStep ? 'step-number-completed' : 'step-number-inactive'
            }`}
            onClick={() => onStepClick && onStepClick(index + 1)}
            style={{ cursor: onStepClick ? 'pointer' : 'default' }}
          >
            {index + 1 < currentStep ? '✓' : index + 1}
          </div>
          {step.label && (
            <div className="step-number-label">{step.label}</div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Circular progress indicator
 */
export const CircularProgress = ({ 
  percentage, 
  size = 60, 
  strokeWidth = 4,
  color = "var(--primary-purple)",
  backgroundColor = "var(--border-beige)",
  showPercentage = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className="circular-progress"
      style={{ width: size, height: size, position: 'relative' }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {showPercentage && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: `${size / 5}px`,
            fontWeight: '600',
            color: color
          }}
        >
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

/**
 * Milestone progress component
 */
export const MilestoneProgress = ({ milestones, currentMilestone }) => {
  return (
    <div className="milestone-progress">
      {milestones.map((milestone, index) => (
        <div key={index} className="milestone">
          <div className="milestone-header">
            <div className={`milestone-icon ${
              index < currentMilestone ? 'milestone-completed' :
              index === currentMilestone ? 'milestone-active' : 'milestone-pending'
            }`}>
              {index < currentMilestone ? '✓' : milestone.icon || (index + 1)}
            </div>
            <div className="milestone-info">
              <div className="milestone-title">{milestone.title}</div>
              {milestone.description && (
                <div className="milestone-description">{milestone.description}</div>
              )}
            </div>
          </div>
          {index < milestones.length - 1 && (
            <div className={`milestone-connector ${
              index < currentMilestone ? 'milestone-connector-completed' : ''
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressIndicator;