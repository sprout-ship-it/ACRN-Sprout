// src/components/forms/components/FormActions.js
import React from 'react';
import PropTypes from 'prop-types';

const FormActions = ({
  loading = false,
  editMode = false,
  onCancel = null,
  onSubmit,
  disabled = false,
  completionPercentage = 0,
  canSubmit = true
}) => {
  const isFormValid = completionPercentage >= 75; // Require at least 75% completion
  const isDisabled = loading || disabled || !canSubmit;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isDisabled && onSubmit) {
      onSubmit(e);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    if (onCancel && !loading) {
      onCancel(e);
    }
  };

  // Get submit button text based on state
  const getSubmitButtonText = () => {
    if (loading) {
      return editMode ? 'Updating...' : 'Saving...';
    }
    return editMode ? 'Update Profile' : 'Save Profile';
  };

  // Get submit button class based on completion
  const getSubmitButtonClass = () => {
    let baseClass = 'btn';
    
    if (isFormValid) {
      baseClass += ' btn-primary';
    } else {
      baseClass += ' btn-secondary';
    }
    
    return baseClass;
  };

  return (
    <div className="form-actions">
      {/* Completion Status Message */}
      {!editMode && completionPercentage < 100 && (
        <div className="completion-message">
          {completionPercentage < 75 ? (
            <div className="text-warning">
              <small>
                <strong>Complete at least 75% to save your profile</strong>
                <br />
                Current: {completionPercentage}%
              </small>
            </div>
          ) : (
            <div className="text-success">
              <small>
                <strong>Ready to save!</strong> Your profile is {completionPercentage}% complete.
              </small>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="button-group">
        {/* Cancel Button */}
        {onCancel && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={getSubmitButtonClass()}
          onClick={handleSubmit}
          disabled={isDisabled || (!editMode && !isFormValid)}
          title={
            !canSubmit 
              ? 'You must be an applicant to save a matching profile'
              : !isFormValid && !editMode
              ? 'Complete at least 75% of the form to save'
              : ''
          }
        >
          {loading && (
            <span className="loading-spinner small" style={{ marginRight: '8px' }}></span>
          )}
          {getSubmitButtonText()}
        </button>
      </div>

      {/* Help Text */}
      <div className="help-text">
        {!canSubmit ? (
          <small className="text-red-500">
            Matching profiles are only available for applicants seeking housing.
          </small>
        ) : !editMode && completionPercentage < 75 ? (
          <small className="text-gray-600">
            Fill out more sections to enable saving. Focus on required fields marked with *.
          </small>
        ) : (
          <small className="text-gray-600">
            {editMode 
              ? 'Your changes will be saved and your profile updated.'
              : 'Once saved, your profile will be active for matching with potential roommates.'
            }
          </small>
        )}
      </div>

      <style jsx>{`
        .form-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid var(--border-beige, #E6D5C3);
        }

        .completion-message {
          text-align: center;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid transparent;
        }

        .text-warning {
          color: var(--warning-text, #856404);
          background: var(--warning-bg, #fff3cd);
          border-color: var(--warning-border, #ffeaa7);
        }

        .text-success {
          color: var(--success-text, #155724);
          background: var(--success-bg, #d4edda);
          border-color: var(--success-border, #c3e6cb);
        }

        .button-group {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          align-items: center;
        }

        .help-text {
          text-align: center;
          font-size: 13px;
          line-height: 1.4;
        }

        .text-red-500 {
          color: #dc3545;
        }

        .text-gray-600 {
          color: var(--gray-600, #6c757d);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .button-group {
            flex-direction: column-reverse;
            gap: 8px;
          }

          .button-group .btn {
            width: 100%;
            min-width: unset;
          }

          .completion-message {
            padding: 10px;
            font-size: 13px;
          }

          .help-text {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

FormActions.propTypes = {
  loading: PropTypes.bool,
  editMode: PropTypes.bool,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  completionPercentage: PropTypes.number,
  canSubmit: PropTypes.bool
};

export default FormActions;