// src/components/features/matching/sections/RecoveryInfoSection.js - PRODUCTION READY
import React, { useMemo, useCallback } from 'react';
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
  profile,
  onInputChange,
  onArrayChange,
  onRangeChange,
  styles = {},
  fieldMapping,
  sectionId,
  isActive,
  validationMessage
}) => {
  // Helper to format array fields for display
  const formatArrayForDisplay = useCallback((array, formatter = (item) => item) => {
    if (!Array.isArray(array) || array.length === 0) return 'None selected';
    return array.map(formatter).join(', ');
  }, []);

  // Validate recovery date (sobriety date)
  const validateSobrietyDate = useCallback((date) => {
    if (!date) return null;
    const sobrietyDate = new Date(date);
    const today = new Date();
    const maxPastDate = new Date();
    maxPastDate.setFullYear(maxPastDate.getFullYear() - 50);
    
    if (sobrietyDate > today) {
      return 'Sobriety date cannot be in the future';
    }
    if (sobrietyDate < maxPastDate) {
      return 'Sobriety date seems too far in the past';
    }
    return null;
  }, []);

  // Calculate time in recovery from sobriety date
  const calculateTimeInRecovery = useCallback((sobrietyDate) => {
    if (!sobrietyDate) return null;
    
    const recovery = new Date(sobrietyDate);
    const today = new Date();
    const diffTime = today - recovery;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      let result = `${years} year${years > 1 ? 's' : ''}`;
      if (remainingMonths > 0) {
        result += `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
      }
      return result;
    }
  }, []);

  // Enhanced validation for required arrays
  const validateRequiredArray = useCallback((fieldName, array, minItems = 1) => {
    if (!Array.isArray(array) || array.length < minItems) {
      return `Please select at least ${minItems} option${minItems > 1 ? 's' : ''} for ${fieldName.replace(/_/g, ' ')}`;
    }
    return null;
  }, []);

  const sobrietyDateError = validateSobrietyDate(formData.sobriety_date);
  const timeInRecovery = formData.sobriety_date ? calculateTimeInRecovery(formData.sobriety_date) : null;

  // Validation for required array fields
  const primaryIssuesError = validateRequiredArray('primary_issues', formData.primary_issues);
  const recoveryMethodsError = validateRequiredArray('recovery_methods', formData.recovery_methods);
  const programTypesError = validateRequiredArray('program_types', formData.program_types);

  return (
    <>
      {/* Recovery Information Header */}
      <div className="section-intro">
        <h3 className="card-title mb-4">Recovery Journey Information</h3>
        <div className="alert alert-info mb-4">
          <h4 className="mb-2">
            <span style={{ marginRight: '8px' }}>🌱</span>
            Recovery-Focused Compatibility Matching
          </h4>
          <p className="mb-0">
            This information helps us match you with roommates who understand and support your recovery journey. 
            All recovery details remain confidential and are only shared with verified, compatible potential matches.
          </p>
        </div>
      </div>

      {/* Current Recovery Status */}
      <div className="card-header">
        <h4 className="card-title">Current Recovery Status</h4>
        <p className="card-subtitle">
          Help us understand where you are in your recovery journey for optimal roommate compatibility
        </p>
      </div>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Recovery Stage <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.recovery_stage || (!formData.recovery_stage || formData.recovery_stage === '') ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.recovery_stage || ''}
            onChange={(e) => onInputChange('recovery_stage', e.target.value)}
            disabled={loading}
            required
          >
            <option value="">-- Select your recovery stage --</option>
            {recoveryStageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.recovery_stage && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.recovery_stage}</div>
          )}
          {!formData.recovery_stage && !errors.recovery_stage && (
            <div className="text-red-500 mt-1 text-sm font-medium">Please select your recovery stage to continue</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Your current recovery stage helps match with supportive roommates
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">
            Spiritual/Religious Approach <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.spiritual_affiliation || (!formData.spiritual_affiliation || formData.spiritual_affiliation === '') ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.spiritual_affiliation || ''}
            onChange={(e) => onInputChange('spiritual_affiliation', e.target.value)}
            disabled={loading}
            required
          >
            <option value="">-- Select your spiritual approach --</option>
            {spiritualAffiliationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.spiritual_affiliation && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.spiritual_affiliation}</div>
          )}
          {!formData.spiritual_affiliation && !errors.spiritual_affiliation && (
            <div className="text-red-500 mt-1 text-sm font-medium">Please select your spiritual approach to continue</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Spiritual alignment can enhance roommate compatibility and support
          </div>
        </div>
      </div>

      {/* Recovery Timeline Information */}
      <div className="form-group mb-4">
        <label className="label">Sobriety Date</label>
        <input
          className={`input ${errors.sobriety_date || sobrietyDateError ? 'border-red-500 bg-red-50' : ''}`}
          type="date"
          value={formData.sobriety_date || ''}
          onChange={(e) => onInputChange('sobriety_date', e.target.value)}
          disabled={loading}
          max={new Date().toISOString().split('T')[0]}
        />
        {timeInRecovery && (
          <div className="text-blue-600 mt-1 text-sm font-medium">
            Time in recovery: {timeInRecovery}
          </div>
        )}
        {sobrietyDateError && (
          <div className="text-red-500 mt-1 text-sm font-medium">{sobrietyDateError}</div>
        )}
        {errors.sobriety_date && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.sobriety_date}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          Optional - helps with milestone and experience matching
        </div>
      </div>

      {/* Recovery Focus Areas */}
      <div className="card-header">
        <h4 className="card-title">Recovery Focus Areas</h4>
        <p className="card-subtitle">
          What are the primary areas you're addressing in your recovery journey?
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">
          Primary Issues <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all issues that apply to your recovery journey. This helps us match you with others who understand similar challenges.
        </div>
        
        <div className={styles.checkboxColumnsCompact || 'grid-2'}>
          {primaryIssuesOptions.map(issue => (
            <label key={issue} className={styles.checkboxLabel || 'checkbox-item'}>
              <input
                type="checkbox"
                checked={(formData.primary_issues || []).includes(issue)}
                onChange={(e) => onArrayChange('primary_issues', issue, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText || ''}>
                {issue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
        
        {primaryIssuesError && !errors.primary_issues && (
          <div className="text-red-500 mt-1 text-sm font-medium">{primaryIssuesError}</div>
        )}
        {errors.primary_issues && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.primary_issues}</div>
        )}
        
        {(formData.primary_issues || []).length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-blue-800 text-sm">
              <strong>Selected issues:</strong> {formatArrayForDisplay(
                formData.primary_issues, 
                issue => issue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              )}
            </div>
          </div>
        )}
        {(formData.primary_issues || []).length === 0 && (
          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
            <div className="text-red-800 text-sm">
              <strong>⚠️ Required:</strong> Please select at least one primary issue to continue
            </div>
          </div>
        )}
      </div>

      {/* Recovery Methods & Approaches */}
      <div className="card-header">
        <h4 className="card-title">Recovery Methods & Tools</h4>
        <p className="card-subtitle">
          What methods and tools are you actively using or interested in using for your recovery?
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">
          Recovery Methods <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all recovery methods you actively use or are interested in exploring.
        </div>
        
        <div className={styles.checkboxColumnsCompact || 'grid-2'}>
          {recoveryMethodsOptions.map(method => (
            <label key={method} className={styles.checkboxLabel || 'checkbox-item'}>
              <input
                type="checkbox"
                checked={(formData.recovery_methods || []).includes(method)}
                onChange={(e) => onArrayChange('recovery_methods', method, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText || ''}>
                {method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
        
        {recoveryMethodsError && !errors.recovery_methods && (
          <div className="text-red-500 mt-1 text-sm font-medium">{recoveryMethodsError}</div>
        )}
        {errors.recovery_methods && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.recovery_methods}</div>
        )}
        
        {(formData.recovery_methods || []).length > 0 && (
          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
            <div className="text-green-800 text-sm">
              <strong>Selected methods:</strong> {formatArrayForDisplay(
                formData.recovery_methods, 
                method => method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              )}
            </div>
          </div>
        )}
        {(formData.recovery_methods || []).length === 0 && (
          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
            <div className="text-red-800 text-sm">
              <strong>⚠️ Required:</strong> Please select at least one recovery method to continue
            </div>
          </div>
        )}
      </div>

      {/* Recovery Programs */}
      <div className="card-header">
        <h4 className="card-title">Recovery Programs & Support Groups</h4>
        <p className="card-subtitle">
          What programs or support groups do you participate in or would be comfortable with roommates attending?
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">
          Recovery Program Types <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select programs you currently attend, have attended, or would be comfortable with roommates participating in.
        </div>
        
        <div className={styles.checkboxColumns || 'grid-2'}>
          {programTypeOptions.map(program => (
            <label key={program} className={styles.checkboxLabel || 'checkbox-item'}>
              <input
                type="checkbox"
                checked={(formData.program_types || []).includes(program)}
                onChange={(e) => onArrayChange('program_types', program, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText || ''}>{program}</span>
            </label>
          ))}
        </div>
        
        {programTypesError && !errors.program_types && (
          <div className="text-red-500 mt-1 text-sm font-medium">{programTypesError}</div>
        )}
        {errors.program_types && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.program_types}</div>
        )}
        
        {(formData.program_types || []).length > 0 && (
          <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
            <div className="text-purple-800 text-sm">
              <strong>Selected programs:</strong> {formatArrayForDisplay(formData.program_types)}
            </div>
          </div>
        )}
        {(formData.program_types || []).length === 0 && (
          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
            <div className="text-red-800 text-sm">
              <strong>⚠️ Required:</strong> Please select at least one program type to continue
            </div>
          </div>
        )}
      </div>

      {/* Recovery Goals & Additional Information */}
      <div className="card-header">
        <h4 className="card-title">Recovery Goals & Support Details</h4>
        <p className="card-subtitle">
          Additional context about your recovery journey and support structure (optional)
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Primary Substance</label>
          <select
            className={`input ${errors.primary_substance ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.primary_substance || ''}
            onChange={(e) => onInputChange('primary_substance', e.target.value)}
            disabled={loading}
          >
            <option value="">Select primary substance (optional)</option>
            <option value="alcohol">Alcohol</option>
            <option value="cocaine">Cocaine/Crack</option>
            <option value="heroin">Heroin</option>
            <option value="prescription-opioids">Prescription opioids</option>
            <option value="fentanyl">Fentanyl</option>
            <option value="methamphetamine">Methamphetamine</option>
            <option value="marijuana">Marijuana</option>
            <option value="prescription-stimulants">Prescription stimulants</option>
            <option value="prescription-depressants">Prescription depressants (benzos)</option>
            <option value="multiple-substances">Multiple substances</option>
            <option value="behavioral-addiction">Behavioral addiction (gambling, etc.)</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          {errors.primary_substance && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.primary_substance}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Helps with understanding and targeted support
          </div>
        </div>

        <div className="form-group">
          <label className="label">Recovery Goal Timeframe</label>
          <select
            className={`input ${errors.recovery_goal_timeframe ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.recovery_goal_timeframe || ''}
            onChange={(e) => onInputChange('recovery_goal_timeframe', e.target.value)}
            disabled={loading}
          >
            <option value="">Select planning horizon (optional)</option>
            <option value="short-term">Short-term focus (1-6 months)</option>
            <option value="medium-term">Medium-term goals (6-18 months)</option>
            <option value="long-term">Long-term stability (18+ months)</option>
            <option value="maintenance">Maintenance phase</option>
            <option value="one-day-at-a-time">One day at a time</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          {errors.recovery_goal_timeframe && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.recovery_goal_timeframe}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Your general recovery planning approach
          </div>
        </div>
      </div>

      {/* Recovery Support Structure */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Sponsor/Mentor</label>
          <input
            className={`input ${errors.sponsor_mentor ? 'border-red-500 bg-red-50' : ''}`}
            type="text"
            value={formData.sponsor_mentor || ''}
            onChange={(e) => onInputChange('sponsor_mentor', e.target.value)}
            placeholder="First name or initials only (for privacy)"
            disabled={loading}
            maxLength="50"
          />
          {errors.sponsor_mentor && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.sponsor_mentor}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Optional - helps indicate support system strength
          </div>
        </div>

        <div className="form-group">
          <label className="label">Support Meeting Frequency</label>
          <select
            className={`input ${errors.support_meetings ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.support_meetings || ''}
            onChange={(e) => onInputChange('support_meetings', e.target.value)}
            disabled={loading}
          >
            <option value="">Select frequency (optional)</option>
            <option value="daily">Daily meetings</option>
            <option value="several-times-week">Several times per week</option>
            <option value="weekly">Weekly meetings</option>
            <option value="bi-weekly">Bi-weekly meetings</option>
            <option value="monthly">Monthly meetings</option>
            <option value="occasionally">Occasionally as needed</option>
            <option value="not-currently">Not currently attending</option>
            <option value="planning-to-start">Planning to start</option>
          </select>
          {errors.support_meetings && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.support_meetings}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            How often you attend recovery meetings or groups
          </div>
        </div>
      </div>

      {/* Recovery Support Preferences */}
      <div className="card-header">
        <h4 className="card-title">Recovery Support Preferences in Living Situation</h4>
        <p className="card-subtitle">
          How would you like recovery to factor into your living arrangement?
        </p>
      </div>

      <div className="form-group mb-4">
        <div className="grid-2">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.want_recovery_support || false}
              onChange={(e) => onInputChange('want_recovery_support', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I want roommates who actively support recovery
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.comfortable_discussing_recovery || false}
              onChange={(e) => onInputChange('comfortable_discussing_recovery', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I'm comfortable discussing recovery openly
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.attend_meetings_together || false}
              onChange={(e) => onInputChange('attend_meetings_together', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Open to attending meetings/activities together
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.substance_free_home_required || false}
              onChange={(e) => onInputChange('substance_free_home_required', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Require completely substance-free home
            </span>
          </label>
        </div>
      </div>

      {/* Recovery Context */}
      <div className="form-group mb-4">
        <label className="label">Additional Recovery Context</label>
        <textarea
          className={`input ${errors.recovery_context ? 'border-red-500 bg-red-50' : ''}`}
          value={formData.recovery_context || ''}
          onChange={(e) => onInputChange('recovery_context', e.target.value)}
          placeholder="Share any additional context about your recovery journey that would help in matching you with compatible roommates."
          rows="4"
          disabled={loading}
          maxLength="500"
        />
        {errors.recovery_context && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.recovery_context}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.recovery_context || '').length}/500 characters (optional but helpful for matching)
        </div>
      </div>

      {/* Section Validation Status */}
      {sectionId && isActive && (
        <div className="section-status mt-6">
          <div className="card-header">
            <h4 className="card-title">Section Validation Status</h4>
          </div>
          
          <div className="grid-2 mb-4">
            <div>
              <strong>Required Recovery Fields:</strong>
              <ul className="mt-2 text-sm">
                <li className={formData.recovery_stage ? 'text-green-600' : 'text-red-600'}>
                  {formData.recovery_stage ? '✓' : '✗'} Recovery Stage
                </li>
                <li className={formData.spiritual_affiliation ? 'text-green-600' : 'text-red-600'}>
                  {formData.spiritual_affiliation ? '✓' : '✗'} Spiritual Approach
                </li>
                <li className={(formData.primary_issues || []).length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {(formData.primary_issues || []).length > 0 ? '✓' : '✗'} Primary Issues
                </li>
              </ul>
            </div>
            
            <div>
              <strong>Required Program Fields:</strong>
              <ul className="mt-2 text-sm">
                <li className={(formData.recovery_methods || []).length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {(formData.recovery_methods || []).length > 0 ? '✓' : '✗'} Recovery Methods
                </li>
                <li className={(formData.program_types || []).length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {(formData.program_types || []).length > 0 ? '✓' : '✗'} Program Types
                </li>
              </ul>
            </div>
          </div>

          {validationMessage && (
            <div className="alert alert-warning">
              <strong>Validation Note:</strong> {validationMessage}
            </div>
          )}
        </div>
      )}
    </>
  );
};

RecoveryInfoSection.propTypes = {
  formData: PropTypes.shape({
    recovery_stage: PropTypes.string,
    spiritual_affiliation: PropTypes.string,
    primary_issues: PropTypes.arrayOf(PropTypes.string),
    recovery_methods: PropTypes.arrayOf(PropTypes.string),
    program_types: PropTypes.arrayOf(PropTypes.string),
    sobriety_date: PropTypes.string,
    primary_substance: PropTypes.string,
    recovery_goal_timeframe: PropTypes.string,
    sponsor_mentor: PropTypes.string,
    support_meetings: PropTypes.string,
    want_recovery_support: PropTypes.bool,
    comfortable_discussing_recovery: PropTypes.bool,
    attend_meetings_together: PropTypes.bool,
    substance_free_home_required: PropTypes.bool,
    recovery_context: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  profile: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string
  }),
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired,
  onRangeChange: PropTypes.func.isRequired,
  styles: PropTypes.object,
  fieldMapping: PropTypes.object,
  sectionId: PropTypes.string,
  isActive: PropTypes.bool,
  validationMessage: PropTypes.string
};

RecoveryInfoSection.defaultProps = {
  profile: null,
  styles: {},
  fieldMapping: {},
  sectionId: 'recovery',
  isActive: false,
  validationMessage: null
};

export default RecoveryInfoSection;