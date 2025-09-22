// src/components/forms/sections/peer-support/ContactInfoSection.js - UPDATED WITH CSS MODULE
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
            className={`${styles.formInput} ${errors.phone ? styles.formInputError : ''}`}
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            disabled={loading}
            required
          />
          {errors.phone && (
            <div className={styles.errorText}>{errors.phone}</div>
          )}
          <div className={styles.helpText}>
            {HELP_TEXT.phone}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Professional Title</label>
          <input
            className={`${styles.formInput} ${errors.title ? styles.formInputError : ''}`}
            type="text"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            placeholder="e.g., Certified Peer Specialist"
            disabled={loading}
          />
          {errors.title && (
            <div className={styles.errorText}>{errors.title}</div>
          )}
          <div className={styles.helpText}>
            {HELP_TEXT.title}
          </div>
        </div>
      </div>

      {/* Office/Service Address */}
      <h4 className={styles.sectionSubtitle}>
        Service Location (Optional)
      </h4>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Street Address</label>
        <input
          className={styles.formInput}
          type="text"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          placeholder="123 Recovery Way"
          disabled={loading}
        />
        <div className={styles.helpText}>
          Office or primary service location (leave blank if services are primarily remote)
        </div>
      </div>

      <div className={styles.formGridThree}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>City</label>
          <input
            className={styles.formInput}
            type="text"
            value={formData.city}
            onChange={(e) => onInputChange('city', e.target.value)}
            placeholder="City"
            disabled={loading}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>State</label>
          <select
            className={styles.formSelect}
            value={formData.state}
            onChange={(e) => onInputChange('state', e.target.value)}
            disabled={loading}
          >
            <option value="">Select State</option>
            {stateOptions.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>ZIP Code</label>
          <input
            className={styles.formInput}
            type="text"
            value={formData.zip_code}
            onChange={(e) => onInputChange('zip_code', e.target.value)}
            placeholder="12345"
            disabled={loading}
            maxLength="10"
          />
        </div>
      </div>

      {/* Service Area Information */}
      <div className={styles.infoAlert}>
        <div className={styles.alertTitle}>Note about service location:</div>
        Your address information helps clients understand your service area and is used for location-based matching. If you provide remote services only, you can leave the address fields blank and specify your service coverage in the Service Settings section.
      </div>
    </div>
  );
};

ContactInfoSection.propTypes = {
  formData: PropTypes.shape({
    phone: PropTypes.string.isRequired,
    title: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zip_code: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default ContactInfoSection;