// src/components/features/matching/sections/RecoveryInfoSection.js - FIXED WITH STANDARDIZED FIELD NAMES
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
  styles = {}
}) => {
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
            className={`input ${errors.recovery_stage ? 'border-red-500' : ''}`}
            value={formData.recovery_stage || ''}
            onChange={(e) => onInputChange('recovery_stage', e.target.value)}
            disabled={loading}
            required
          >
            {recoveryStageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.recovery_stage && (
            <div className="text-red-500 mt-1 text-sm">{errors.recovery_stage}</div>
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
            className={`input ${errors.spiritual_affiliation ? 'border-red-500' : ''}`}
            value={formData.spiritual_affiliation || ''}
            onChange={(e) => onInputChange('spiritual_affiliation', e.target.value)}
            disabled={loading}
            required
          >
            {spiritualAffiliationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.spiritual_affiliation && (
            <div className="text-red-500 mt-1 text-sm">{errors.spiritual_affiliation}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Helps match you with like-minded individuals
          </div>
        </div>
      </div>

      {/* Recovery Focus Areas - FIXED: Using standardized field names */}
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
        {errors.primary_issues && (
          <div className="text-red-500 mt-1 text-sm">{errors.primary_issues}</div>
        )}
      </div>

      {/* Recovery Methods & Approaches - FIXED: Using standardized field name */}
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
          Select all recovery methods you actively use or are interested in using.
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
        {errors.recovery_methods && (
          <div className="text-red-500 mt-1 text-sm">{errors.recovery_methods}</div>
        )}
      </div>

      {/* Recovery Programs - FIXED: Using standardized field name */}
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
                checked={(formData.program_types || []).includes(program)}
                onChange={(e) => onArrayChange('program_types', program, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText || ''}>{program}</span>
            </label>
          ))}
        </div>
        {errors.program_types && (
          <div className="text-red-500 mt-1 text-sm">{errors.program_types}</div>
        )}
      </div>

      {/* Recovery Goals & Timeline - FIXED: Using standardized field names */}
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
            value={formData.sobriety_date || ''}
            onChange={(e) => onInputChange('sobriety_date', e.target.value)}
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
            value={formData.recovery_goal_timeframe || ''}
            onChange={(e) => onInputChange('recovery_goal_timeframe', e.target.value)}
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

      {/* Additional Recovery Information - FIXED: Using standardized field names */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Time in Recovery</label>
          <select
            className="input"
            value={formData.time_in_recovery || ''}
            onChange={(e) => onInputChange('time_in_recovery', e.target.value)}
            disabled={loading}
          >
            <option value="">Select duration</option>
            <option value="less-than-30-days">Less than 30 days</option>
            <option value="30-90-days">30-90 days</option>
            <option value="3-6-months">3-6 months</option>
            <option value="6-12-months">6-12 months</option>
            <option value="1-2-years">1-2 years</option>
            <option value="2-5-years">2-5 years</option>
            <option value="5-plus-years">5+ years</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Helps with experience-level matching
          </div>
        </div>

        <div className="form-group">
          <label className="label">Primary Substance</label>
          <select
            className="input"
            value={formData.primary_substance || ''}
            onChange={(e) => onInputChange('primary_substance', e.target.value)}
            disabled={loading}
          >
            <option value="">Select primary substance</option>
            <option value="alcohol">Alcohol</option>
            <option value="cocaine">Cocaine</option>
            <option value="heroin">Heroin</option>
            <option value="prescription-opioids">Prescription opioids</option>
            <option value="methamphetamine">Methamphetamine</option>
            <option value="marijuana">Marijuana</option>
            <option value="prescription-stimulants">Prescription stimulants</option>
            <option value="prescription-depressants">Prescription depressants</option>
            <option value="multiple-substances">Multiple substances</option>
            <option value="behavioral-addiction">Behavioral addiction</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Optional - helps with understanding and support
          </div>
        </div>
      </div>

      {/* Recovery Support Preferences - FIXED: Using standardized field names */}
      <div className="form-group mb-4">
        <label className="label">Recovery Support Preferences</label>
        <div className="grid-2 mt-3">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.want_recovery_support || false}
              onChange={(e) => onInputChange('want_recovery_support', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I want a roommate who actively supports recovery
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
              Open to attending meetings together
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
              Prefer a completely substance-free home
            </span>
          </label>
        </div>
      </div>

      {/* Additional Recovery Support Fields */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Sponsor/Mentor</label>
          <input
            className="input"
            type="text"
            value={formData.sponsor_mentor || ''}
            onChange={(e) => onInputChange('sponsor_mentor', e.target.value)}
            placeholder="First name or initials only"
            disabled={loading}
            maxLength="50"
          />
          <div className="text-gray-500 mt-1 text-sm">
            Optional - helps with support system understanding
          </div>
        </div>

        <div className="form-group">
          <label className="label">Support Meetings</label>
          <select
            className="input"
            value={formData.support_meetings || ''}
            onChange={(e) => onInputChange('support_meetings', e.target.value)}
            disabled={loading}
          >
            <option value="">Select frequency</option>
            <option value="daily">Daily</option>
            <option value="several-times-week">Several times per week</option>
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="occasionally">Occasionally</option>
            <option value="not-currently">Not currently attending</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            How often you attend recovery meetings
          </div>
        </div>
      </div>

      {/* Recovery Context - FIXED: Using standardized field name */}
      <div className="form-group mb-4">
        <label className="label">Additional Recovery Context</label>
        <textarea
          className="input"
          value={formData.recovery_context || ''}
          onChange={(e) => onInputChange('recovery_context', e.target.value)}
          placeholder="Share any additional context about your recovery journey that would help in matching you with a compatible roommate..."
          rows="3"
          disabled={loading}
          maxLength="300"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.recovery_context || '').length}/300 characters (optional)
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
    recovery_stage: PropTypes.string,                    // FIXED: Standardized
    spiritual_affiliation: PropTypes.string,            // FIXED: Standardized
    primary_issues: PropTypes.arrayOf(PropTypes.string), // FIXED: Standardized
    recovery_methods: PropTypes.arrayOf(PropTypes.string), // FIXED: Standardized
    program_types: PropTypes.arrayOf(PropTypes.string),  // FIXED: Standardized
    sobriety_date: PropTypes.string,                     // FIXED: Standardized
    recovery_goal_timeframe: PropTypes.string,           // FIXED: Standardized
    time_in_recovery: PropTypes.string,                  // FIXED: Standardized
    primary_substance: PropTypes.string,                 // FIXED: Standardized
    want_recovery_support: PropTypes.bool,               // FIXED: Standardized
    comfortable_discussing_recovery: PropTypes.bool,     // FIXED: Standardized
    attend_meetings_together: PropTypes.bool,            // FIXED: Standardized
    substance_free_home_required: PropTypes.bool,        // FIXED: Standardized
    sponsor_mentor: PropTypes.string,                    // FIXED: Standardized
    support_meetings: PropTypes.string,                  // FIXED: Standardized
    recovery_context: PropTypes.string                   // FIXED: Standardized
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
  styles: PropTypes.object
};

RecoveryInfoSection.defaultProps = {
  profile: null,
  styles: {}
};

export default RecoveryInfoSection;