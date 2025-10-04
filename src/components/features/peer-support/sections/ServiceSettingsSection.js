// src/components/forms/sections/peer-support/ServiceSettingsSection.js - FIXED FIELD NAMES
import React from 'react';
import PropTypes from 'prop-types';
import { HELP_TEXT } from '../constants/peerSupportConstants';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../../styles/main.css';
import styles from './ServiceSettingsSection.module.css';

const ServiceSettingsSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  const additionalInfoLength = formData.additional_info?.length || 0;

  // Service area options that make sense for peer support
  const serviceAreaOptions = [
    'Local Community',
    'City-wide',
    'County-wide',
    'Multi-County',
    'Statewide',
    'Remote/Telehealth Only',
    'Rural Areas',
    'Urban Areas',
    'Suburban Areas'
  ];

  return (
    <div className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>Service Settings</h3>
      
      {/* Current Availability Status */}
      <div className={styles.formGroup}>
        <h4 className={styles.sectionSubtitle}>Current Availability</h4>
        
        <div className={`${styles.checkboxControl} ${formData.accepting_clients ? styles.selected : ''}`}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={formData.accepting_clients || false}
            onChange={(e) => onInputChange('accepting_clients', e.target.checked)}
            disabled={loading}
          />
          <div className={styles.checkboxContent}>
            <div className={styles.checkboxTitle}>Currently accepting new clients</div>
            <div className={styles.checkboxDescription}>
              Check this if you're available to take on new clients. You can update this anytime.
            </div>
          </div>
        </div>
        {errors.accepting_clients && (
          <div className={styles.errorText}>{errors.accepting_clients}</div>
        )}
      </div>

      {/* Profile Active Status */}
      <div className={styles.formGroup}>
        <div className={`${styles.checkboxControl} ${formData.is_active ? styles.selected : ''}`}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={formData.is_active !== false}
            onChange={(e) => onInputChange('is_active', e.target.checked)}
            disabled={loading}
          />
          <div className={styles.checkboxContent}>
            <div className={styles.checkboxTitle}>Profile is active</div>
            <div className={styles.checkboxDescription}>
              Uncheck this to temporarily hide your profile from client searches
            </div>
          </div>
        </div>
        {errors.is_active && (
          <div className={styles.errorText}>{errors.is_active}</div>
        )}
      </div>

      {/* Service Areas */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Service Areas</label>
        <div className={styles.helpText}>
          Select the geographic areas where you provide peer support services
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

      {/* Additional Information */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Additional Service Information (Optional)</label>
        <textarea
          className={`${styles.formTextarea} ${styles.textareaLarge}`}
          value={formData.additional_info || ''}
          onChange={(e) => onInputChange('additional_info', e.target.value)}
          placeholder="Any additional information about your services, availability, scheduling preferences, or special considerations you'd like clients to know..."
          disabled={loading}
          maxLength="1000"
        />
        <div className={styles.characterCount}>
          {additionalInfoLength}/1000 characters
        </div>
        <div className={styles.helpText}>
          Optional space for any other service-related information, scheduling notes, or special considerations
        </div>
      </div>

      {/* Service Summary */}
      <div className={styles.serviceSummary}>
        <div className={styles.summaryTitle}>Current Service Status:</div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Profile Status:</div>
            <div className={styles.summaryValue}>
              <span className={formData.is_active ? styles.statusBadgeActive : styles.statusBadgeInactive}>
                {formData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Accepting Clients:</div>
            <div className={styles.summaryValue}>
              <span className={formData.accepting_clients ? styles.statusBadgeAccepting : styles.statusBadgeNotAccepting}>
                {formData.accepting_clients ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Service Areas:</div>
            <div className={styles.summaryValue}>
              {formData.service_areas?.length || 0} selected
            </div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Profile Completed:</div>
            <div className={styles.summaryValue}>
              <span className={formData.profile_completed ? styles.statusBadgeCompleted : styles.statusBadgeIncomplete}>
                {formData.profile_completed ? 'Complete' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Notice */}
      {!formData.profile_completed && (
        <div className={styles.completionNotice}>
          <div className={styles.noticeTitle}>Complete Your Profile:</div>
          <p className={styles.noticeText}>
            To activate your profile for client matching, make sure all required fields are completed. Your profile will be marked as complete once all essential information is provided.
          </p>
        </div>
      )}

      {/* Service Areas Help */}
      {(!formData.service_areas || formData.service_areas.length === 0) && (
        <div className={styles.helpNotice}>
          <div className={styles.noticeTitle}>Select Service Areas:</div>
          <p className={styles.noticeText}>
            Choose at least one service area to help clients in your region find you. If you provide remote services, select "Remote/Telehealth Only".
          </p>
        </div>
      )}
    </div>
  );
};

ServiceSettingsSection.propTypes = {
  formData: PropTypes.shape({
    accepting_clients: PropTypes.bool,
    is_active: PropTypes.bool,
    service_areas: PropTypes.arrayOf(PropTypes.string),
    additional_info: PropTypes.string,
    profile_completed: PropTypes.bool
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default ServiceSettingsSection;