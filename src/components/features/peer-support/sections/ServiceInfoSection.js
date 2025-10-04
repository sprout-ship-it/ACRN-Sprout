// src/components/forms/sections/peer-support/ServiceInfoSection.js - FIXED FIELD NAMES
import React from 'react';
import PropTypes from 'prop-types';
import { 
  specialtyOptions, 
  recoveryApproachOptions,
  HELP_TEXT 
} from '../constants/peerSupportConstants';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../../styles/main.css';
import styles from './ServiceInfoSection.module.css';

const ServiceInfoSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  return (
    <div className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>Services & Specialties</h3>
      
      {/* Specialties - Required */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Your Specialties <span className={styles.requiredAsterisk}>*</span>
        </label>
        <div className={styles.helpText}>
          {HELP_TEXT.specialties}
        </div>
        <div className={styles.specialtiesGrid}>
          {specialtyOptions.map(specialty => (
            <div
              key={specialty}
              className={`${styles.specialtyItem} ${formData.specialties?.includes(specialty) ? styles.selected : ''}`}
              onClick={() => onArrayChange('specialties', specialty, !formData.specialties?.includes(specialty))}
            >
              <input
                type="checkbox"
                className={styles.specialtyCheckbox}
                checked={formData.specialties?.includes(specialty) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.specialtyLabel}>{specialty}</span>
            </div>
          ))}
        </div>
        {errors.specialties && (
          <div className={styles.errorText}>{errors.specialties}</div>
        )}
      </div>

      {/* Recovery Approaches - Required */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Recovery Methods You Support <span className={styles.requiredAsterisk}>*</span>
        </label>
        <div className={styles.helpText}>
          {HELP_TEXT.recovery_approach}
        </div>
        <div className={styles.specialtiesGrid}>
          {recoveryApproachOptions.map(approach => (
            <div
              key={approach}
              className={`${styles.specialtyItem} ${formData.supported_recovery_methods?.includes(approach) ? styles.selected : ''}`}
              onClick={() => onArrayChange('supported_recovery_methods', approach, !formData.supported_recovery_methods?.includes(approach))}
            >
              <input
                type="checkbox"
                className={styles.specialtyCheckbox}
                checked={formData.supported_recovery_methods?.includes(approach) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.specialtyLabel}>{approach}</span>
            </div>
          ))}
        </div>
        {errors.supported_recovery_methods && (
          <div className={styles.errorText}>{errors.supported_recovery_methods}</div>
        )}
      </div>

      {/* Recovery Background */}
      <h4 className={styles.sectionSubtitle}>
        Your Recovery Background
      </h4>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Recovery Stage</label>
          <select
            className={`${styles.formSelect} ${errors.recovery_stage ? styles.formInputError : ''}`}
            value={formData.recovery_stage || ''}
            onChange={(e) => onInputChange('recovery_stage', e.target.value)}
            disabled={loading}
          >
            <option value="">Select your recovery stage</option>
            <option value="early_recovery">Early Recovery (0-1 years)</option>
            <option value="sustained_recovery">Sustained Recovery (1-5 years)</option>
            <option value="long_term_recovery">Long-term Recovery (5+ years)</option>
            <option value="stable_recovery">Stable Recovery (10+ years)</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {errors.recovery_stage && (
            <div className={styles.errorText}>{errors.recovery_stage}</div>
          )}
          <div className={styles.helpText}>
            Your current stage of recovery (this helps clients relate to your experience)
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Time in Recovery (Optional)</label>
          <input
            className={`${styles.formInput} ${errors.time_in_recovery ? styles.formInputError : ''}`}
            type="text"
            value={formData.time_in_recovery || ''}
            onChange={(e) => onInputChange('time_in_recovery', e.target.value)}
            placeholder="e.g., 3 years, 18 months"
            disabled={loading}
          />
          {errors.time_in_recovery && (
            <div className={styles.errorText}>{errors.time_in_recovery}</div>
          )}
          <div className={styles.helpText}>
            How long you've been in recovery (optional, share what you're comfortable with)
          </div>
        </div>
      </div>

      {/* Primary Issues */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Primary Issues You Have Experience With (Optional)</label>
        <div className={styles.helpText}>
          Select the primary issues you have personal or professional experience supporting (optional)
        </div>
        <div className={styles.checkboxColumns}>
          {[
            'Substance Use',
            'Alcohol Use',
            'Mental Health',
            'Dual Diagnosis',
            'Trauma Recovery',
            'Family Issues',
            'Housing Instability',
            'Employment Challenges',
            'Legal Issues',
            'Relationship Issues',
            'Financial Struggles',
            'Health Issues'
          ].map(issue => (
            <div key={issue} className={styles.checkboxItem}>
              <input
                type="checkbox"
                className={styles.checkboxItemInput}
                checked={formData.primary_issues?.includes(issue) || false}
                onChange={(e) => onArrayChange('primary_issues', issue, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxItemText}>{issue}</span>
            </div>
          ))}
        </div>
        {errors.primary_issues && (
          <div className={styles.errorText}>{errors.primary_issues}</div>
        )}
      </div>

      {/* Spiritual Affiliation */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Spiritual/Religious Affiliation (Optional)</label>
        <input
          className={`${styles.formInput} ${errors.spiritual_affiliation ? styles.formInputError : ''}`}
          type="text"
          value={formData.spiritual_affiliation || ''}
          onChange={(e) => onInputChange('spiritual_affiliation', e.target.value)}
          placeholder="e.g., Christian, Buddhist, Secular, Spiritual but not religious"
          disabled={loading}
        />
        {errors.spiritual_affiliation && (
          <div className={styles.errorText}>{errors.spiritual_affiliation}</div>
        )}
        <div className={styles.helpText}>
          Your spiritual or religious background, if relevant to your recovery approach (completely optional)
        </div>
      </div>

      {/* Information Notice */}
      <div className={styles.infoAlert}>
        <div className={styles.alertTitle}>About Your Service Information:</div>
        <ul className={styles.alertList}>
          <li className={styles.alertListItem}>Your specialties and recovery methods help clients find the right support</li>
          <li className={styles.alertListItem}>Recovery background information is optional but helps build trust</li>
          <li className={styles.alertListItem}>You can update this information at any time</li>
          <li className={styles.alertListItem}>All personal information shared is kept confidential</li>
        </ul>
      </div>
    </div>
  );
};

ServiceInfoSection.propTypes = {
  formData: PropTypes.shape({
    specialties: PropTypes.arrayOf(PropTypes.string),
    supported_recovery_methods: PropTypes.arrayOf(PropTypes.string),
    recovery_stage: PropTypes.string,
    time_in_recovery: PropTypes.string,
    primary_issues: PropTypes.arrayOf(PropTypes.string),
    spiritual_affiliation: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default ServiceInfoSection;