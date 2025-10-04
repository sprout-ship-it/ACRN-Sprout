// src/components/forms/sections/peer-support/ContactInfoSection.js - FIXED FIELD NAMES
import React from 'react';
import PropTypes from 'prop-types';
import { stateOptions, HELP_TEXT } from '../constants/peerSupportConstants';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../../styles/main.css';
import styles from './ContactInfoSection.module.css';

const ContactInfoSection = ({
  formData,
  errors,
  loading,
  onInputChange
}) => {
  return (
    <div className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>Contact Information</h3>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Phone <span className={styles.requiredAsterisk}>*</span>
          </label>
          <input
            className={`${styles.formInput} ${errors.primary_phone ? styles.formInputError : ''}`}
            type="tel"
            value={formData.primary_phone}
            onChange={(e) => onInputChange('primary_phone', e.target.value)}
            placeholder="(555) 123-4567"
            disabled={loading}
            required
          />
          {errors.primary_phone && (
            <div className={styles.errorText}>{errors.primary_phone}</div>
          )}
          <div className={styles.helpText}>
            {HELP_TEXT.phone}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Professional Title</label>
          <input
            className={`${styles.formInput} ${errors.professional_title ? styles.formInputError : ''}`}
            type="text"
            value={formData.professional_title}
            onChange={(e) => onInputChange('professional_title', e.target.value)}
            placeholder="e.g., Certified Peer Specialist"
            disabled={loading}
          />
          {errors.professional_title && (
            <div className={styles.errorText}>{errors.professional_title}</div>
          )}
          <div className={styles.helpText}>
            {HELP_TEXT.title}
          </div>
        </div>
      </div>

      {/* Contact Email */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Contact Email (Optional)</label>
        <input
          className={`${styles.formInput} ${errors.contact_email ? styles.formInputError : ''}`}
          type="email"
          value={formData.contact_email || ''}
          onChange={(e) => onInputChange('contact_email', e.target.value)}
          placeholder="your.email@example.com"
          disabled={loading}
        />
        {errors.contact_email && (
          <div className={styles.errorText}>{errors.contact_email}</div>
        )}
        <div className={styles.helpText}>
          Alternative contact email for professional communications (optional)
        </div>
      </div>

      {/* Service Location */}
      <h4 className={styles.sectionSubtitle}>
        Primary Service Location
      </h4>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Service City</label>
          <input
            className={`${styles.formInput} ${errors.service_city ? styles.formInputError : ''}`}
            type="text"
            value={formData.service_city}
            onChange={(e) => onInputChange('service_city', e.target.value)}
            placeholder="City where you provide services"
            disabled={loading}
          />
          {errors.service_city && (
            <div className={styles.errorText}>{errors.service_city}</div>
          )}
          <div className={styles.helpText}>
            Primary city where you provide peer support services
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Service State</label>
          <select
            className={`${styles.formSelect} ${errors.service_state ? styles.formInputError : ''}`}
            value={formData.service_state}
            onChange={(e) => onInputChange('service_state', e.target.value)}
            disabled={loading}
          >
            <option value="">Select State</option>
            {stateOptions.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.service_state && (
            <div className={styles.errorText}>{errors.service_state}</div>
          )}
          <div className={styles.helpText}>
            State where you are licensed/authorized to provide services
          </div>
        </div>
      </div>

      {/* Service Area Information */}
      <div className={styles.infoAlert}>
        <div className={styles.alertTitle}>About Service Location:</div>
        Your service location helps clients understand your primary service area. If you provide remote services across multiple areas, you can specify additional service regions in the Service Settings section.
      </div>
    </div>
  );
};

ContactInfoSection.propTypes = {
  formData: PropTypes.shape({
    primary_phone: PropTypes.string.isRequired,
    professional_title: PropTypes.string.isRequired,
    contact_email: PropTypes.string,
    service_city: PropTypes.string.isRequired,
    service_state: PropTypes.string.isRequired
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default ContactInfoSection;