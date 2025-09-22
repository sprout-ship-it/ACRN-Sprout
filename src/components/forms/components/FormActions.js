// src/components/forms/components/FormActions.js - Enhanced for multi-step forms
import React from 'react';
import PropTypes from 'prop-types';
import styles from './FormActions.module.css';

const FormActions = ({
  // Loading states
  loading = false,
  isSubmitting = false,
  
  // Form context
  editMode = false,
  completionPercentage = 0,
  canSubmit = true,
  disabled = false,
  
  // Multi-step navigation
  isFirstSection = false,
  isLastSection = false,
  
  // Action handlers
  onCancel = null,
  onSubmit = null,
  onSave = null,
  onPrevious = null,
  onNext = null,
  
  // Button customization
  showSaveProgress = true,
  saveButtonText = 'Save Progress',
  submitButtonText = null, // Auto-determined if null
  previousButtonText = 'Previous',
  nextButtonText = 'Next',
  cancelButtonText = 'Cancel'
}) => {
  // Determine if form is valid for submission
  const isFormValid = completionPercentage >= 75;
  const isGenerallyDisabled = loading || isSubmitting || disabled;

  // Auto-determine submit button text
  const getSubmitButtonText = () => {
    if (submitButtonText) return submitButtonText;
    
    if (isSubmitting) {
      return editMode ? 'Updating...' : 'Completing Profile...';
    }
    return editMode ? 'Update Profile' : 'Complete Profile';
  };

  // Get submit button class based on completion and context
  const getSubmitButtonClass = () => {
    if (isLastSection && (isFormValid || editMode)) {
      return 'btn btn-primary';
    }
    return 'btn btn-secondary';
  };

  // Handle button clicks with proper event handling
  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isGenerallyDisabled && onSave) {
      onSave(e);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading && !isSubmitting && onCancel) {
      onCancel(e);
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isGenerallyDisabled && onPrevious) {
      onPrevious(e);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isGenerallyDisabled && onNext) {
      onNext(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isGenerallyDisabled && onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className={styles.formActions}>
      {/* Completion Status Message (for non-edit mode) */}
      {!editMode && completionPercentage < 100 && (
        <div className={styles.completionMessage}>
          {completionPercentage < 75 ? (
            <div className="alert alert-warning">
              <small>
                <strong>Complete at least 75% to save your profile</strong>
                <br />
                Current: {completionPercentage}%
              </small>
            </div>
          ) : (
            <div className="alert alert-success">
              <small>
                <strong>Ready to save!</strong> Your profile is {completionPercentage}% complete.
              </small>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.buttonGroup}>
        {/* Save Progress Button */}
        {showSaveProgress && onSave && (
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-outline"
            disabled={isGenerallyDisabled}
          >
            {(loading && !isSubmitting) ? (
              <>
                <span className="loading-spinner small"></span>
                Saving...
              </>
            ) : (
              saveButtonText
            )}
          </button>
        )}
        
        {/* Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={loading || isSubmitting}
          >
            {cancelButtonText}
          </button>
        )}
        
        {/* Previous Button */}
        {!isFirstSection && onPrevious && (
          <button
            type="button"
            onClick={handlePrevious}
            className="btn btn-secondary"
            disabled={isGenerallyDisabled}
          >
            {previousButtonText}
          </button>
        )}
        
        {/* Next Button (multi-step) */}
        {!isLastSection && onNext ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary"
            disabled={isGenerallyDisabled}
          >
            {nextButtonText}
          </button>
        ) : 
        
        /* Submit Button (last step or single step) */
        onSubmit && (
          <button
            type="submit"
            className={getSubmitButtonClass()}
            disabled={isGenerallyDisabled || (!canSubmit && !editMode) || (!isFormValid && !editMode)}
            onClick={handleSubmit}
            title={
              !canSubmit 
                ? 'You must be an applicant to save a matching profile'
                : !isFormValid && !editMode
                ? 'Complete at least 75% of the form to save'
                : ''
            }
          >
            {isSubmitting && (
              <span className="loading-spinner small" style={{ marginRight: '8px' }}></span>
            )}
            {getSubmitButtonText()}
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className={styles.helpText}>
        {!canSubmit ? (
          <small className="text-red-500">
            Matching profiles are only available for applicants seeking housing.
          </small>
        ) : !editMode && completionPercentage < 75 ? (
          <small className="text-gray-600">
            Fill out more sections to enable saving. Focus on required fields marked with *.
          </small>
        ) : isLastSection ? (
          <small className="text-gray-600">
            {editMode 
              ? 'Your changes will be saved and your profile updated.'
              : 'Once saved, your profile will be active for matching with potential roommates.'
            }
          </small>
        ) : (
          <small className="text-gray-600">
            Continue through all sections to complete your profile. Your progress is automatically saved.
          </small>
        )}
      </div>
    </div>
  );
};

FormActions.propTypes = {
  // Loading states
  loading: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  
  // Form context  
  editMode: PropTypes.bool,
  completionPercentage: PropTypes.number,
  canSubmit: PropTypes.bool,
  disabled: PropTypes.bool,
  
  // Multi-step navigation
  isFirstSection: PropTypes.bool,
  isLastSection: PropTypes.bool,
  
  // Action handlers
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onSave: PropTypes.func,
  onPrevious: PropTypes.func,
  onNext: PropTypes.func,
  
  // Button customization
  showSaveProgress: PropTypes.bool,
  saveButtonText: PropTypes.string,
  submitButtonText: PropTypes.string,
  previousButtonText: PropTypes.string,
  nextButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string
};

export default FormActions;