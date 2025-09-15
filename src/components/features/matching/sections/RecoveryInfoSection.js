// src/components/forms/sections/RecoveryInfoSection.js
import React from 'react';
import PropTypes from 'prop-types';
import {
  recoveryStageOptions,
  spiritualAffiliationOptions,
  primaryIssuesOptions,
  recoveryMethodsOptions,
  programTypeOptions
} from '../constants/matchingFormConstants';

const RecoveryInfoSection = ({
  formData,
  errors,
  loading,
  profile,      // Added for interface consistency
  onInputChange,
  onArrayChange,
  onRangeChange // Added for interface consistency
}) => {
  return (
    <>
      {/* Recovery Information - Enhanced */}
      <h3 className="card-title mb-4">Recovery Information</h3>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Recovery Stage <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.recoveryStage ? 'border-red-500' : ''}`}
            value={formData.recoveryStage}
            onChange={(e) => onInputChange('recoveryStage', e.target.value)}
            disabled={loading}
            required
          >
            {recoveryStageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.recoveryStage && (
            <div className="text-red-500 mt-1">{errors.recoveryStage}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">
            Spiritual Affiliation <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.spiritualAffiliation ? 'border-red-500' : ''}`}
            value={formData.spiritualAffiliation}
            onChange={(e) => onInputChange('spiritualAffiliation', e.target.value)}
            disabled={loading}
            required
          >
            {spiritualAffiliationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.spiritualAffiliation && (
            <div className="text-red-500 mt-1">{errors.spiritualAffiliation}</div>
          )}
        </div>
      </div>

      {/* Primary Issues - Enhanced with Columns */}
      <div className="form-group mb-4">
        <label className="label">
          Primary Issues <span className="text-red-500">*</span>
        </label>
        <div className="checkbox-columns-compact">
          {primaryIssuesOptions.map(issue => (
            <label key={issue} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.primaryIssues.includes(issue)}
                onChange={(e) => onArrayChange('primaryIssues', issue, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">
                {issue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
        {errors.primaryIssues && (
          <div className="text-red-500 mt-1">{errors.primaryIssues}</div>
        )}
      </div>

      {/* Recovery Methods - Enhanced with Columns */}
      <div className="form-group mb-4">
        <label className="label">
          Recovery Methods <span className="text-red-500">*</span>
        </label>
        <div className="checkbox-columns-compact">
          {recoveryMethodsOptions.map(method => (
            <label key={method} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.recoveryMethods.includes(method)}
                onChange={(e) => onArrayChange('recoveryMethods', method, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">
                {method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
        {errors.recoveryMethods && (
          <div className="text-red-500 mt-1">{errors.recoveryMethods}</div>
        )}
      </div>

      {/* Program Types - Enhanced with Columns */}
      <div className="form-group mb-4">
        <label className="label">
          Recovery Program Types <span className="text-red-500">*</span>
        </label>
        <div className="checkbox-columns">
          {programTypeOptions.map(program => (
            <label key={program} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.programType.includes(program)}
                onChange={(e) => onArrayChange('programType', program, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">{program}</span>
            </label>
          ))}
        </div>
        {errors.programType && (
          <div className="text-red-500 mt-1">{errors.programType}</div>
        )}
      </div>
    </>
  );
};

RecoveryInfoSection.propTypes = {
  formData: PropTypes.shape({
    recoveryStage: PropTypes.string.isRequired,
    spiritualAffiliation: PropTypes.string.isRequired,
    primaryIssues: PropTypes.arrayOf(PropTypes.string).isRequired,
    recoveryMethods: PropTypes.arrayOf(PropTypes.string).isRequired,
    programType: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  profile: PropTypes.shape({               // Added for interface consistency
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string
  }),
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired,
  onRangeChange: PropTypes.func.isRequired  // Added for interface consistency
};

RecoveryInfoSection.defaultProps = {
  profile: null
};

export default RecoveryInfoSection;