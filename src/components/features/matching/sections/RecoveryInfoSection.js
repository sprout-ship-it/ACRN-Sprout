// src/components/features/matching/sections/RecoveryInfoSection.js - FIXED FIELD MAPPING
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
  profile,
  onInputChange,
  onArrayChange,
  onRangeChange,
  styles = {},
  fieldMapping = {} // ✅ FIXED: Now properly use field mapping
}) => {
  // ✅ FIXED: Use standardized field names from mapping
  const recoveryMethodsField = fieldMapping?.recovery?.methods || 'recovery_methods';
  
  return (
    <>
      {/* Recovery Information Header */}
      <h3 className="card-title mb-4">Recovery Information</h3>
      
      <div className="alert alert-info mb-4">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🌱</span>
          Recovery Journey Matching
        </h4>
        <p className="mb-0">
          This information helps us match you with roommates who understand and support your recovery journey. 
          All details are kept confidential and only shared with verified potential matches.
        </p>
      </div>

      {/* Current Recovery Status */}
      <div className="card-header">
        <h4 className="card-title">Current Recovery Status</h4>
        <p className="card-subtitle">
          Help us understand where you are in your recovery journey
        </p>
      </div>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Recovery Stage <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.recoveryStage ? 'border-red-500' : ''}`}
            value={formData.recoveryStage || ''}
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
            <div className="text-red-500 mt-1 text-sm">{errors.recoveryStage}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Your current stage helps match you with supportive roommates
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">
            Spiritual/Religious Approach <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.spiritualAffiliation ? 'border-red-500' : ''}`}
            value={formData.spiritualAffiliation || ''}
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
            <div className="text-red-500 mt-1 text-sm">{errors.spiritualAffiliation}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Helps match you with like-minded individuals
          </div>
        </div>
      </div>

      {/* Recovery Focus Areas */}
      <div className="card-header">
        <h4 className="card-title">Recovery Focus Areas</h4>
        <p className="card-subtitle">
          What are the primary areas you're addressing in your recovery?
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">
          Primary Issues <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all that apply to your recovery journey. This helps us match you with others who understand similar challenges.
        </div>
        
        <div className={styles.checkboxColumnsCompact || 'grid-2'}>
          {primaryIssuesOptions.map(issue => (
            <label key={issue} className={styles.checkboxLabel || 'checkbox-item'}>
              <input
                type="checkbox"
                checked={(formData.primaryIssues || []).includes(issue)}
                onChange={(e) => onArrayChange('primaryIssues', issue, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText || ''}>
                {issue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
        {errors.primaryIssues && (
          <div className="text-red-500 mt-1 text-sm">{errors.primaryIssues}</div>
        )}
      </div>

      {/* Recovery Methods & Approaches */}
      <div className="card-header">
        <h4 className="card-title">Recovery Methods & Tools</h4>
        <p className="card-subtitle">
          What methods and tools are you using in your recovery?
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">
          Recovery Methods <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all recovery methods you actively use or are interested in using. (stored as: {recoveryMethodsField})
        </div>
        
        <div className={styles.checkboxColumnsCompact || 'grid-2'}>
          {recoveryMethodsOptions.map(method => (
            <label key={method} className={styles.checkboxLabel || 'checkbox-item'}>
              <input
                type="checkbox"
                checked={(formData[recoveryMethodsField] || []).includes(method)}
                onChange={(e) => onArrayChange(recoveryMethodsField, method, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText || ''}>
                {method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
        {errors[recoveryMethodsField] && (
          <div className="text-red-500 mt-1 text-sm">{errors[recoveryMethodsField]}</div>
        )}
      </div>

      {/* Recovery Programs */}
      <div className="card-header">
        <h4 className="card-title">Recovery Programs & Support Groups</h4>
        <p className="card-subtitle">
          What programs or support groups do you participate in or support?
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">
          Recovery Program Types <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select programs you attend, have attended, or would be comfortable with roommates attending.
        </div>
        
        <div className={styles.checkboxColumns || 'grid-2'}>
          {programTypeOptions.map(program => (
            <label key={program} className={styles.checkboxLabel || 'checkbox-item'}>
              <input
                type="checkbox"
                checked={(formData.programType || []).includes(program)}
                onChange={(e) => onArrayChange('programType', program, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText || ''}>{program}</span>
            </label>
          ))}
        </div>
        {errors.programType && (
          <div className="text-red-500 mt-1 text-sm">{errors.programType}</div>
        )}
      </div>

      {/* Recovery Goals & Timeline */}
      <div className="card-header">
        <h4 className="card-title">Recovery Goals & Timeline</h4>
        <p className="card-subtitle">
          Additional context about your recovery journey (optional)
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Sobriety Date</label>
          <input
            className="input"
            type="date"
            value={formData.sobrietyDate || ''}
            onChange={(e) => onInputChange('sobrietyDate', e.target.value)}
            disabled={loading}
            max={new Date().toISOString().split('T')[0]}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Optional - helps with milestone matching
          </div>
        </div>

        <div className="form-group">
          <label className="label">Recovery Goal Timeframe</label>
          <select
            className="input"
            value={formData.recoveryGoalTimeframe || ''}
            onChange={(e) => onInputChange('recoveryGoalTimeframe', e.target.value)}
            disabled={loading}
          >
            <option value="">Select timeframe</option>
            <option value="short-term">Short-term focus (1-6 months)</option>
            <option value="medium-term">Medium-term goals (6-18 months)</option>
            <option value="long-term">Long-term stability (18+ months)</option>
            <option value="maintenance">Maintenance phase</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Your general recovery planning horizon
          </div>
        </div>
      </div>

      {/* Recovery Support Preferences */}
      <div className="form-group mb-4">
        <label className="label">Recovery Support Preferences</label>
        <div className="grid-2 mt-3">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.wantRecoverySupport || false}
              onChange={(e) => onInputChange('wantRecoverySupport', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I want a roommate who actively supports recovery
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.comfortableDiscussing || false}
              onChange={(e) => onInputChange('comfortableDiscussing', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I'm comfortable discussing recovery openly
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.attendMeetingsTogether || false}
              onChange={(e) => onInputChange('attendMeetingsTogether', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Open to attending meetings together
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.substanceFreeHome || false}
              onChange={(e) => onInputChange('substanceFreeHome', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Prefer a completely substance-free home
            </span>
          </label>
        </div>
      </div>

      {/* Recovery Context */}
      <div className="form-group mb-4">
        <label className="label">Additional Recovery Context</label>
        <textarea
          className="input"
          value={formData.recoveryContext || ''}
          onChange={(e) => onInputChange('recoveryContext', e.target.value)}
          placeholder="Share any additional context about your recovery journey that would help in matching you with a compatible roommate..."
          rows="3"
          disabled={loading}
          maxLength="300"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.recoveryContext || '').length}/300 characters (optional)
        </div>
      </div>

      {/* Privacy & Confidentiality Notice */}
      <div className="alert alert-info">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🔒</span>
          Privacy & Confidentiality
        </h4>
        <p className="mb-2">
          <strong>Your recovery information is protected:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li>Only shared with verified, compatible potential roommates</li>
          <li>Used exclusively for matching purposes</li>
          <li>Never shared with employers, landlords, or outside parties</li>
          <li>You control what level of detail to share during conversations</li>
        </ul>
        <p className="text-sm">
          Recovery information helps create supportive living environments. 
          <a href="/privacy/recovery-info" target="_blank" style={{ color: 'var(--primary-purple)', marginLeft: '5px' }}>
            Learn more about our recovery privacy policies →
          </a>
        </p>
      </div>

      {/* Recovery Resources */}
      <div className="alert alert-success">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🤝</span>
          Recovery Resources & Support
        </h4>
        <p className="mb-2">
          Need help finding recovery resources in your area?
        </p>
        <div className="grid-2 mt-3">
          <button 
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => window.open('/resources/meetings', '_blank')}
            disabled={loading}
          >
            Find Local Meetings
          </button>
          <button 
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => window.open('/resources/counseling', '_blank')}
            disabled={loading}
          >
            Find Counseling Services
          </button>
        </div>
      </div>
    </>
  );
};

RecoveryInfoSection.propTypes = {
  formData: PropTypes.shape({
    recoveryStage: PropTypes.string,
    spiritualAffiliation: PropTypes.string,
    primaryIssues: PropTypes.arrayOf(PropTypes.string),
    recovery_methods: PropTypes.arrayOf(PropTypes.string), // ✅ FIXED: Now matches database
    programType: PropTypes.arrayOf(PropTypes.string),
    sobrietyDate: PropTypes.string,
    recoveryGoalTimeframe: PropTypes.string,
    wantRecoverySupport: PropTypes.bool,
    comfortableDiscussing: PropTypes.bool,
    attendMeetingsTogether: PropTypes.bool,
    substanceFreeHome: PropTypes.bool,
    recoveryContext: PropTypes.string
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
  fieldMapping: PropTypes.object // ✅ FIXED: Now properly documented
};

RecoveryInfoSection.defaultProps = {
  profile: null,
  styles: {},
  fieldMapping: {} // ✅ FIXED: Default empty object
};

export default RecoveryInfoSection;