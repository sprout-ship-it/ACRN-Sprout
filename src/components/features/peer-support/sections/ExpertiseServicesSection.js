// src/components/features/peer-support/sections/ExpertiseServicesSection.js - CONSOLIDATED SERVICES & EXPERTISE
import React from 'react';
import PropTypes from 'prop-types';
import { 
  specialtyOptions, 
  recoveryMethodOptions,
  recoveryStageOptions,
  primaryIssuesOptions,
  spiritualAffiliationOptions,
  serviceAreaOptions,
  HELP_TEXT 
} from '../constants/peerSupportConstants';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../../styles/main.css';
import styles from './ExpertiseServicesSection.module.css';

const ExpertiseServicesSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  return (
    <div className={styles.sectionContainer}>
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
                name="specialties"
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

      {/* Recovery Methods - Required */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Recovery Methods You Support <span className={styles.requiredAsterisk}>*</span>
        </label>
        <div className={styles.helpText}>
          {HELP_TEXT.supported_recovery_methods}
        </div>
        <div className={styles.specialtiesGrid}>
          {recoveryMethodOptions.map(method => (
            <div
              key={method}
              className={`${styles.specialtyItem} ${formData.supported_recovery_methods?.includes(method) ? styles.selected : ''}`}
              onClick={() => onArrayChange('supported_recovery_methods', method, !formData.supported_recovery_methods?.includes(method))}
            >
              <input
                type="checkbox"
                className={styles.specialtyCheckbox}
                name="supported_recovery_methods"
                checked={formData.supported_recovery_methods?.includes(method) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.specialtyLabel}>{method}</span>
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
            name="recovery_stage"
            value={formData.recovery_stage || ''}
            onChange={(e) => onInputChange('recovery_stage', e.target.value)}
            disabled={loading}
          >
            <option value="">Select your recovery stage</option>
            {recoveryStageOptions.map(stage => (
              <option key={stage.value} value={stage.value}>{stage.label}</option>
            ))}
          </select>
          {errors.recovery_stage && (
            <div className={styles.errorText}>{errors.recovery_stage}</div>
          )}
          <div className={styles.helpText}>
            {HELP_TEXT.recovery_stage}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Time in Recovery (Optional)</label>
          <input
            className={`${styles.formInput} ${errors.time_in_recovery ? styles.formInputError : ''}`}
            type="text"
            name="time_in_recovery"
            value={formData.time_in_recovery || ''}
            onChange={(e) => onInputChange('time_in_recovery', e.target.value)}
            placeholder="e.g., 3 years, 18 months"
            disabled={loading}
          />
          {errors.time_in_recovery && (
            <div className={styles.errorText}>{errors.time_in_recovery}</div>
          )}
          <div className={styles.helpText}>
            {HELP_TEXT.time_in_recovery}
          </div>
        </div>
      </div>

      {/* Spiritual Affiliation - Updated to use enum options */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Spiritual/Religious Affiliation (Optional)</label>
        <select
          className={`${styles.formSelect} ${errors.spiritual_affiliation ? styles.formInputError : ''}`}
          name="spiritual_affiliation"
          value={formData.spiritual_affiliation || ''}
          onChange={(e) => onInputChange('spiritual_affiliation', e.target.value)}
          disabled={loading}
        >
          <option value="">Select your spiritual affiliation</option>
          {spiritualAffiliationOptions.map(affiliation => (
            <option key={affiliation.value} value={affiliation.value}>{affiliation.label}</option>
          ))}
        </select>
        {errors.spiritual_affiliation && (
          <div className={styles.errorText}>{errors.spiritual_affiliation}</div>
        )}
        <div className={styles.helpText}>
          {HELP_TEXT.spiritual_affiliation}
        </div>
      </div>

      {/* Primary Issues - Optional */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Primary Issues You Have Experience With (Optional)</label>
        <div className={styles.helpText}>
          {HELP_TEXT.primary_issues}
        </div>
        <div className={styles.checkboxColumns}>
          {primaryIssuesOptions.map(issue => (
            <div key={issue} className={styles.checkboxItem}>
              <input
                type="checkbox"
                className={styles.checkboxItemInput}
                name="primary_issues"
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

      {/* Service Areas */}
      <h4 className={styles.sectionSubtitle}>
        Service Areas
      </h4>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Geographic Areas You Serve</label>
        <div className={styles.helpText}>
          {HELP_TEXT.service_areas}
        </div>
        <div className={styles.serviceAreasGrid}>
          {serviceAreaOptions.map(area => (
            <div
              key={area}
              className={`${styles.serviceAreaItem} ${formData.service_areas?.includes(area) ? styles.selected : ''}`}
              onClick={() => onArrayChange('service_areas', area, !formData.service_areas?.includes(area))}
            >
              <input
                type="checkbox"
                className={styles.serviceAreaCheckbox}
                name="service_areas"
                checked={formData.service_areas?.includes(area) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.serviceAreaLabel}>{area}</span>
            </div>
          ))}
        </div>
        {errors.service_areas && (
          <div className={styles.errorText}>{errors.service_areas}</div>
        )}
      </div>

      {/* Information Notice */}
      <div className={styles.infoAlert}>
        <div className={styles.alertTitle}>About Your Expertise Information:</div>
        <ul className={styles.alertList}>
          <li className={styles.alertListItem}>Your specialties and recovery methods help clients find the right support match</li>
          <li className={styles.alertListItem}>Recovery background information helps build trust and relatability</li>
          <li className={styles.alertListItem}>Service areas help clients in your region find you more easily</li>
          <li className={styles.alertListItem}>All personal information shared is kept confidential and secure</li>
        </ul>
      </div>

      {/* Selection Summary */}
      <div className={styles.selectionSummary}>
        <div className={styles.summaryTitle}>Your Selections Summary:</div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Specialties:</div>
            <div className={styles.summaryValue}>
              {formData.specialties?.length || 0} selected
            </div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Recovery Methods:</div>
            <div className={styles.summaryValue}>
              {formData.supported_recovery_methods?.length || 0} selected
            </div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Service Areas:</div>
            <div className={styles.summaryValue}>
              {formData.service_areas?.length || 0} selected
            </div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Primary Issues:</div>
            <div className={styles.summaryValue}>
              {formData.primary_issues?.length || 0} selected
            </div>
          </div>
        </div>
      </div>

      {/* Required Fields Reminder */}
      {(!formData.specialties?.length || !formData.supported_recovery_methods?.length) && (
        <div className={styles.requirementNotice}>
          <div className={styles.noticeTitle}>Required Fields:</div>
          <p className={styles.noticeText}>
            Please select at least one specialty and one recovery method to help clients understand your expertise and approach.
          </p>
        </div>
      )}
    </div>
  );
};

ExpertiseServicesSection.propTypes = {
  formData: PropTypes.shape({
    specialties: PropTypes.arrayOf(PropTypes.string),
    supported_recovery_methods: PropTypes.arrayOf(PropTypes.string),
    recovery_stage: PropTypes.string,
    time_in_recovery: PropTypes.string,
    primary_issues: PropTypes.arrayOf(PropTypes.string),
    spiritual_affiliation: PropTypes.string,
    service_areas: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default ExpertiseServicesSection;