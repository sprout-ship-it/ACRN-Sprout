// src/components/forms/sections/peer-support/ProfessionalInfoSection.js - FIXED FIELD NAMES
import React from 'react';
import PropTypes from 'prop-types';
import { certificationOptions, HELP_TEXT } from '../constants/peerSupportConstants';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../../styles/main.css';
import styles from './ProfessionalInfoSection.module.css';

const ProfessionalInfoSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  return (
    <div className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>Professional Information</h3>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Years of Experience</label>
          <input
            className={`${styles.formInput} ${errors.years_experience ? styles.formInputError : ''}`}
            type="number"
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

      {/* Professional Background Information */}
      <h4 className={styles.sectionSubtitle}>
        Professional Background
      </h4>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>About Your Professional Background (Optional)</label>
        <textarea
          className={styles.formTextarea}
          value={formData.about_me || ''}
          onChange={(e) => onInputChange('about_me', e.target.value)}
          placeholder="Describe your professional background, training, certifications, education, or other relevant experience that qualifies you as a peer support specialist..."
          disabled={loading}
          maxLength="1000"
        />
        <div className={styles.characterCount}>
          {(formData.about_me?.length || 0)}/1000 characters
        </div>
        <div className={styles.helpText}>
          Use this space to describe your qualifications, training, certifications, education, or professional affiliations
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Additional Information (Optional)</label>
        <textarea
          className={styles.formTextarea}
          value={formData.additional_info || ''}
          onChange={(e) => onInputChange('additional_info', e.target.value)}
          placeholder="Any additional professional information, special training, or credentials you'd like to share..."
          style={{ minHeight: '60px' }}
          disabled={loading}
          maxLength="500"
        />
        <div className={styles.characterCount}>
          {(formData.additional_info?.length || 0)}/500 characters
        </div>
        <div className={styles.helpText}>
          Optional space for any other relevant professional information
        </div>
      </div>

      {/* Information Notice */}
      <div className={styles.infoAlert}>
        <div className={styles.alertTitle}>Professional Information:</div>
        <ul className={styles.alertList}>
          <li className={styles.alertListItem}>Your professional background helps clients understand your qualifications</li>
          <li className={styles.alertListItem}>All information provided will be reviewed for accuracy</li>
          <li className={styles.alertListItem}>You can update this information at any time</li>
          <li className={styles.alertListItem}>Specific certifications and licenses may require verification</li>
        </ul>
      </div>

      {/* Profile Status */}
      <div className={styles.verificationAlert}>
        <div className={styles.verificationGrid}>
          <div className={styles.verificationContent}>
            <div className={styles.verificationTitle}>Profile Status:</div>
            <p className={styles.verificationText}>
              Your profile completion status is tracked to help ensure you provide comprehensive information to potential clients.
            </p>
          </div>
          <div className={styles.verificationBadge}>
            <span className={formData.profile_completed ? styles.badgeVerified : styles.badgePending}>
              {formData.profile_completed ? 'Complete' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

ProfessionalInfoSection.propTypes = {
  formData: PropTypes.shape({
    years_experience: PropTypes.number,
    is_licensed: PropTypes.bool,
    about_me: PropTypes.string,
    additional_info: PropTypes.string,
    profile_completed: PropTypes.bool
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default ProfessionalInfoSection;