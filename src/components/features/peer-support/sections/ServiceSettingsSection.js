// src/components/forms/sections/peer-support/ServiceSettingsSection.js - UPDATED WITH CSS MODULE
import React from 'react';
import PropTypes from 'prop-types';
import { 
  contactMethodOptions, 
  responseTimeOptions, 
  serviceAreaOptions,
  HELP_TEXT,
  VALIDATION_RULES 
} from '../constants/peerSupportConstants';

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
  const additionalNotesLength = formData.additional_notes?.length || 0;
  const availableHoursLength = formData.available_hours?.length || 0;
  
  // Find the response time label for display
  const responseTimeLabel = responseTimeOptions.find(opt => opt.value === formData.response_time)?.label || 'Within 24 hours';

  return (
    <div className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>Service Settings</h3>
      
      {/* Contact & Communication Preferences */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Preferred Contact Method</label>
          <select
            className={styles.formSelect}
            value={formData.preferred_contact_method}
            onChange={(e) => onInputChange('preferred_contact_method', e.target.value)}
            disabled={loading}
          >
            {contactMethodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className={styles.helpText}>
            How you prefer clients to initially contact you
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Response Time</label>
          <select
            className={styles.formSelect}
            value={formData.response_time}
            onChange={(e) => onInputChange('response_time', e.target.value)}
            disabled={loading}
          >
            {responseTimeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className={styles.helpText}>
            How quickly you typically respond to new inquiries
          </div>
        </div>
      </div>

      {/* Capacity & Availability */}
      <h4 className={styles.sectionSubtitle}>
        Capacity & Availability
      </h4>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Maximum Clients</label>
          <input
            className={`${styles.formInput} ${errors.max_clients ? styles.formInputError : ''}`}
            type="number"
            min={VALIDATION_RULES.max_clients.min}
            max={VALIDATION_RULES.max_clients.max}
            value={formData.max_clients}
            onChange={(e) => onInputChange('max_clients', parseInt(e.target.value) || 10)}
            disabled={loading}
          />
          {errors.max_clients && (
            <div className={styles.errorText}>{errors.max_clients}</div>
          )}
          <div className={styles.helpText}>
            {HELP_TEXT.max_clients}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Service Radius (miles)</label>
          <input
            className={`${styles.formInput} ${errors.service_radius ? styles.formInputError : ''}`}
            type="number"
            min={VALIDATION_RULES.service_radius.min}
            max={VALIDATION_RULES.service_radius.max}
            value={formData.service_radius}
            onChange={(e) => onInputChange('service_radius', parseInt(e.target.value) || 25)}
            disabled={loading}
          />
          {errors.service_radius && (
            <div className={styles.errorText}>{errors.service_radius}</div>
          )}
          <div className={styles.helpText}>
            How far you're willing to travel for in-person services
          </div>
        </div>
      </div>

      {/* Available Hours */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Available Hours</label>
        <textarea
          className={styles.formTextarea}
          value={formData.available_hours}
          onChange={(e) => onInputChange('available_hours', e.target.value)}
          placeholder="e.g., Monday-Friday 9am-5pm, Saturday mornings, or 'Flexible scheduling available'"
          disabled={loading}
          maxLength="200"
        />
        <div className={styles.helpText}>
          {HELP_TEXT.available_hours}
        </div>
        <div className={styles.characterCount}>
          {availableHoursLength}/200 characters
        </div>
      </div>

      {/* Service Areas */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Service Areas</label>
        <div className={styles.helpText}>
          {HELP_TEXT.service_area}
        </div>
        <div className={styles.serviceAreasGrid}>
          {serviceAreaOptions.map(area => (
            <div
              key={area}
              className={`${styles.serviceAreaItem} ${formData.service_area?.includes(area) ? styles.selected : ''}`}
              onClick={() => onArrayChange('service_area', area, !formData.service_area?.includes(area))}
            >
              <input
                type="checkbox"
                className={styles.serviceAreaCheckbox}
                checked={formData.service_area?.includes(area) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.serviceAreaLabel}>{area}</span>
            </div>
          ))}
        </div>
        {errors.service_area && (
          <div className={styles.errorText}>{errors.service_area}</div>
        )}
      </div>

      {/* Availability Status */}
      <h4 className={styles.sectionSubtitle}>
        Current Status
      </h4>

      <div className={`${styles.checkboxControl} ${formData.is_accepting_clients ? styles.selected : ''}`}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={formData.is_accepting_clients}
          onChange={(e) => onInputChange('is_accepting_clients', e.target.checked)}
          disabled={loading}
        />
        <div className={styles.checkboxContent}>
          <div className={styles.checkboxTitle}>Currently accepting new clients</div>
          <div className={styles.checkboxDescription}>
            Check this if you're available to take on new clients. You can update this anytime.
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Additional Service Notes (Optional)</label>
        <textarea
          className={`${styles.formTextarea} ${styles.textareaLarge}`}
          value={formData.additional_notes || ''}
          onChange={(e) => onInputChange('additional_notes', e.target.value)}
          placeholder="Any additional information about your services, scheduling preferences, or special considerations..."
          disabled={loading}
          maxLength="500"
        />
        <div className={styles.characterCount}>
          {additionalNotesLength}/500 characters
        </div>
      </div>

      {/* Service Summary */}
      <div className={styles.serviceSummary}>
        <div className={styles.summaryTitle}>Service Summary:</div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Contact:</div>
            <div className={styles.summaryValue}>{formData.preferred_contact_method || 'Phone'}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Response:</div>
            <div className={styles.summaryValue}>{responseTimeLabel}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Capacity:</div>
            <div className={styles.summaryValue}>Up to {formData.max_clients || 10} clients</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Status:</div>
            <div className={styles.summaryValue}>
              <span className={formData.is_accepting_clients ? styles.statusBadgeAccepting : styles.statusBadgeNotAccepting}>
                {formData.is_accepting_clients ? 'Accepting Clients' : 'Not Accepting'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Notice */}
      <div className={styles.verificationNotice}>
        <div className={styles.noticeTitle}>Profile Review:</div>
        <p className={styles.noticeText}>
          Once you complete your profile, our team will review your information and credentials. This typically takes 1-3 business days. You'll receive an email notification when your profile is approved and visible to clients.
        </p>
      </div>
    </div>
  );
};

ServiceSettingsSection.propTypes = {
  formData: PropTypes.shape({
    preferred_contact_method: PropTypes.string.isRequired,
    response_time: PropTypes.string.isRequired,
    max_clients: PropTypes.number.isRequired,
    service_radius: PropTypes.number.isRequired,
    available_hours: PropTypes.string,
    service_area: PropTypes.arrayOf(PropTypes.string),
    is_accepting_clients: PropTypes.bool.isRequired,
    additional_notes: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default ServiceSettingsSection;