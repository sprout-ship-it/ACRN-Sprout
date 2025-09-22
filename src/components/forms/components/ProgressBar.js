// src/components/forms/components/ProgressBar.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ProgressBar.module.css';

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
    <div className={`${styles.progressContainer} ${className}`}>
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ 
            width: `${safePercentage}%`,
            background: `linear-gradient(135deg, ${progressColor}, ${progressColor}dd)`
          }}
        />
      </div>
      
      {/* Progress Text */}
      {showText && (
        <p className={styles.progressText}>
          {label} • {safePercentage}% Complete
          {safePercentage < 100 && (
            <span className="text-gray-500"> - Keep going!</span>
          )}
          {safePercentage === 100 && (
            <span className={styles.completeText}> - Complete!</span>
          )}
        </p>
      )}
      
      {/* Progress Steps Indicator */}
      {safePercentage > 0 && (
        <div className={styles.progressSteps}>
          <div className={styles.stepsContainer}>
            {[25, 50, 75, 100].map((step, index) => (
              <div
                key={step}
                className={`${styles.stepIndicator} ${
                  safePercentage >= step ? styles.completed : styles.incomplete
                }`}
                title={`${step}% completion`}
              >
                <div 
                  className={styles.stepDot}
                  style={safePercentage >= step ? { 
                    background: progressColor,
                    boxShadow: `0 0 0 2px ${progressColor}33`
                  } : {}}
                />
                {index < 3 && (
                  <div 
                    className={styles.stepConnector}
                    style={safePercentage >= step ? { 
                      background: `${progressColor}66`
                    } : {}}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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