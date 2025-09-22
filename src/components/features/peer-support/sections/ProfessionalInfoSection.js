// src/components/forms/sections/peer-support/ProfessionalInfoSection.js - UPDATED WITH CSS MODULE
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
            value={formData.years_experience}
            onChange={(e) => onInputChange('years_experience', parseInt(e.target.value) || 0)}
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
          <label className={styles.formLabel}>License/Certification Number</label>
          <input
            className={styles.formInput}
            type="text"
            value={formData.license_number}
            onChange={(e) => onInputChange('license_number', e.target.value)}
            placeholder="Optional"
            disabled={loading}
          />
          <div className={styles.helpText}>
            Your professional license or certification number (if applicable)
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Certifications & Licenses</label>
        <div className={styles.helpText}>
          {HELP_TEXT.certifications}
        </div>
        <div className={styles.certificationsGrid}>
          {certificationOptions.map(cert => (
            <div
              key={cert}
              className={`${styles.certificationItem} ${formData.certifications?.includes(cert) ? styles.selected : ''}`}
              onClick={() => onArrayChange('certifications', cert, !formData.certifications?.includes(cert))}
            >
              <input
                type="checkbox"
                className={styles.certificationCheckbox}
                checked={formData.certifications?.includes(cert) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.certificationLabel}>{cert}</span>
            </div>
          ))}
        </div>
        {errors.certifications && (
          <div className={styles.errorText}>{errors.certifications}</div>
        )}
      </div>

      {/* Additional Professional Information */}
      <h4 className={styles.sectionSubtitle}>
        Professional Background
      </h4>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Educational Background (Optional)</label>
        <textarea
          className={styles.formTextarea}
          value={formData.education || ''}
          onChange={(e) => onInputChange('education', e.target.value)}
          placeholder="Describe your relevant education, training programs, or professional development..."
          disabled={loading}
          maxLength="500"
        />
        <div className={styles.characterCount}>
          {(formData.education?.length || 0)}/500 characters
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Professional Affiliations (Optional)</label>
        <textarea
          className={styles.formTextarea}
          value={formData.affiliations || ''}
          onChange={(e) => onInputChange('affiliations', e.target.value)}
          placeholder="Professional organizations, associations, or groups you belong to..."
          style={{ minHeight: '60px' }}
          disabled={loading}
          maxLength="300"
        />
        <div className={styles.characterCount}>
          {(formData.affiliations?.length || 0)}/300 characters
        </div>
      </div>

      {/* Verification Status */}
      <div className={styles.verificationAlert}>
        <div className={styles.verificationGrid}>
          <div className={styles.verificationContent}>
            <div className={styles.verificationTitle}>Profile Verification:</div>
            <p className={styles.verificationText}>
              Your professional credentials will be verified by our team to ensure quality and safety for all users.
            </p>
          </div>
          <div className={styles.verificationBadge}>
            <span className={formData.is_verified ? styles.badgeVerified : styles.badgePending}>
              {formData.is_verified ? 'Verified' : 'Pending Verification'}
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
    license_number: PropTypes.string,
    certifications: PropTypes.arrayOf(PropTypes.string),
    education: PropTypes.string,
    affiliations: PropTypes.string,
    is_verified: PropTypes.bool
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default ProfessionalInfoSection;