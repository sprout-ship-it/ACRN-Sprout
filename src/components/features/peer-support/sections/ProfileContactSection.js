// src/components/features/peer-support/sections/ProfileContactSection.js - CONSOLIDATED CONTACT & PROFESSIONAL INFO
import React from 'react';
import PropTypes from 'prop-types';
import { stateOptions, HELP_TEXT } from '../constants/peerSupportConstants';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../../styles/main.css';
import styles from './ProfileContactSection.module.css';

const ProfileContactSection = ({
  formData,
  errors,
  loading,
  onInputChange
}) => {
  return (
    <div className={styles.sectionContainer}>
      {/* Contact Information */}
      <h3 className={styles.sectionTitle}>Contact Information</h3>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Phone <span className={styles.requiredAsterisk}>*</span>
          </label>
          <input
            className={`${styles.formInput} ${errors.primary_phone ? styles.formInputError : ''}`}
            type="tel"
            name="primary_phone"
            value={formData.primary_phone || ''}
            onChange={(e) => onInputChange('primary_phone', e.target.value)}
            placeholder="(555) 123-4567"
            disabled={loading}
            required
          />
          {errors.primary_phone && (
            <div className={styles.errorText}>{errors.primary_phone}</div>
          )}
          <div className={styles.helpText}>
            {HELP_TEXT.primary_phone}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Professional Title</label>
          <input
            className={`${styles.formInput} ${errors.professional_title ? styles.formInputError : ''}`}
            type="text"
            name="professional_title"
            value={formData.professional_title || ''}
            onChange={(e) => onInputChange('professional_title', e.target.value)}
            placeholder="e.g., Certified Peer Specialist"
            disabled={loading}
          />
          {errors.professional_title && (
            <div className={styles.errorText}>{errors.professional_title}</div>
          )}
          <div className={styles.helpText}>
            {HELP_TEXT.professional_title}
          </div>
        </div>
      </div>

      {/* Contact Email */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Contact Email (Optional)</label>
        <input
          className={`${styles.formInput} ${errors.contact_email ? styles.formInputError : ''}`}
          type="email"
          name="contact_email"
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
          <label className={styles.formLabel}>
            Service City <span className={styles.requiredAsterisk}>*</span>
          </label>
          <input
            className={`${styles.formInput} ${errors.service_city ? styles.formInputError : ''}`}
            type="text"
            name="service_city"
            value={formData.service_city || ''}
            onChange={(e) => onInputChange('service_city', e.target.value)}
            placeholder="City where you provide services"
            disabled={loading}
            required
          />
          {errors.service_city && (
            <div className={styles.errorText}>{errors.service_city}</div>
          )}
          <div className={styles.helpText}>
            Primary city where you provide peer support services
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Service State <span className={styles.requiredAsterisk}>*</span>
          </label>
          <select
            className={`${styles.formSelect} ${errors.service_state ? styles.formInputError : ''}`}
            name="service_state"
            value={formData.service_state || ''}
            onChange={(e) => onInputChange('service_state', e.target.value)}
            disabled={loading}
            required
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

      {/* Professional Background */}
      <h4 className={styles.sectionSubtitle}>
        Professional Background
      </h4>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Years of Experience</label>
          <input
            className={`${styles.formInput} ${errors.years_experience ? styles.formInputError : ''}`}
            type="number"
            name="years_experience"
            min="0"
            max="50"
            value={formData.years_experience || ''}
            onChange={(e) => onInputChange('years_experience', parseInt(e.target.value) || null)}
            disabled={loading}
          />
          {errors.years_experience && (
            <div className={styles.errorText}>{errors.years_experience}</div>
          )}
          <div className={styles.helpText}>
            Years of experience in peer support or related recovery services
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Licensed Professional</label>
          <div className={styles.checkboxControl}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              name="is_licensed"
              checked={formData.is_licensed || false}
              onChange={(e) => onInputChange('is_licensed', e.target.checked)}
              disabled={loading}
            />
            <div className={styles.checkboxContent}>
              <div className={styles.checkboxTitle}>I am a licensed professional</div>
              <div className={styles.checkboxDescription}>
                Check this if you hold any professional licenses or certifications
              </div>
            </div>
          </div>
          {errors.is_licensed && (
            <div className={styles.errorText}>{errors.is_licensed}</div>
          )}
        </div>
      </div>

      {/* Service Area Information */}
      <div className={styles.infoAlert}>
        <div className={styles.alertTitle}>About Your Service Information:</div>
        <ul className={styles.alertList}>
          <li className={styles.alertListItem}>Your service location helps clients understand your primary service area</li>
          <li className={styles.alertListItem}>If you provide remote services across multiple areas, you can specify additional service regions in the next section</li>
          <li className={styles.alertListItem}>All information provided will be reviewed for accuracy</li>
          <li className={styles.alertListItem}>You can update this information at any time</li>
        </ul>
      </div>

      {/* Professional Verification Notice */}
      <div className={styles.verificationAlert}>
        <div className={styles.verificationGrid}>
          <div className={styles.verificationContent}>
            <div className={styles.verificationTitle}>Professional Verification:</div>
            <p className={styles.verificationText}>
              Professional licenses and certifications may require verification to enhance client trust and platform credibility.
            </p>
          </div>
          <div className={styles.verificationBadge}>
            <span className={formData.is_licensed ? styles.badgeVerified : styles.badgePending}>
              {formData.is_licensed ? 'Licensed' : 'Unlicensed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

ProfileContactSection.propTypes = {
  formData: PropTypes.shape({
    primary_phone: PropTypes.string,
    professional_title: PropTypes.string,
    contact_email: PropTypes.string,
    service_city: PropTypes.string,
    service_state: PropTypes.string,
    years_experience: PropTypes.number,
    is_licensed: PropTypes.bool
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default ProfileContactSection;