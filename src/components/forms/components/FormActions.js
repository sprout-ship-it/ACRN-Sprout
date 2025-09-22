// src/components/forms/components/FormActions.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './FormActions.module.css';

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
    if (isFormValid) {
      return 'btn btn-primary';
    } else {
      return 'btn btn-secondary';
    }
  };

  return (
    <div className={styles.formActions}>
      {/* Completion Status Message */}
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
      <div className={styles.helpText}>
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