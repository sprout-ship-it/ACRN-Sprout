// src/components/forms/components/ProgressBar.js
import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = ({ 
  percentage, 
  showText = true, 
  editMode = false,
  className = '',
  label = 'Form completion'
}) => {
  // Don't show progress bar in edit mode
  if (editMode) {
    return null;
  }

  // Ensure percentage is within valid range
  const safePercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Determine progress color based on completion level
  const getProgressColor = (percent) => {
    if (percent < 25) return '#FF6F61'; // coral for low completion
    if (percent < 50) return '#FFD700'; // gold for medium-low completion
    if (percent < 75) return '#20B2AA'; // teal for medium-high completion
    return '#A020F0'; // purple for high completion
  };

  const progressColor = getProgressColor(safePercentage);

  return (
    <div className={`progress-container ${className}`}>
      {/* Progress Bar */}
      <div className="progress-bar mb-2">
        <div 
          className="progress-fill"
          style={{ 
            width: `${safePercentage}%`,
            background: `linear-gradient(135deg, ${progressColor}, ${progressColor}dd)`
          }}
        />
      </div>
      
      {/* Progress Text */}
      {showText && (
        <p className="progress-text">
          {label}: {safePercentage}%
          {safePercentage < 100 && (
            <span className="text-gray-500"> - Keep going!</span>
          )}
          {safePercentage === 100 && (
            <span className="text-green-600"> - Complete!</span>
          )}
        </p>
      )}
      
      {/* Progress Steps Indicator */}
      {safePercentage > 0 && (
        <div className="progress-steps-mini">
          <div className="steps-container">
            {[25, 50, 75, 100].map((step, index) => (
              <div
                key={step}
                className={`step-indicator ${safePercentage >= step ? 'completed' : 'incomplete'}`}
                title={`${step}% completion`}
              >
                <div className="step-dot"></div>
                {index < 3 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .progress-steps-mini {
          margin-top: 12px;
          display: flex;
          justify-content: center;
        }
        
        .steps-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .step-indicator.completed .step-dot {
          background: ${progressColor};
          box-shadow: 0 0 0 2px ${progressColor}33;
        }
        
        .step-indicator.incomplete .step-dot {
          background: var(--border-beige, #E6D5C3);
          border: 1px solid var(--gray-300, #dee2e6);
        }
        
        .step-connector {
          width: 16px;
          height: 2px;
          background: var(--border-beige, #E6D5C3);
        }
        
        .step-indicator.completed .step-connector {
          background: ${progressColor}66;
        }
        
        @media (max-width: 480px) {
          .progress-steps-mini {
            margin-top: 8px;
          }
          
          .steps-container {
            gap: 6px;
          }
          
          .step-dot {
            width: 6px;
            height: 6px;
          }
          
          .step-connector {
            width: 12px;
            height: 1px;
          }
        }
      `}</style>
    </div>
  );
};

ProgressBar.propTypes = {
  percentage: PropTypes.number.isRequired,
  showText: PropTypes.bool,
  editMode: PropTypes.bool,
  className: PropTypes.string,
  label: PropTypes.string
};

export default ProgressBar;