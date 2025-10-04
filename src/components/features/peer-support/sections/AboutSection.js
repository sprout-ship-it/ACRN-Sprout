// src/components/forms/sections/peer-support/AboutSection.js - FIXED FIELD NAMES
import React from 'react';
import PropTypes from 'prop-types';
import { HELP_TEXT, VALIDATION_RULES } from '../constants/peerSupportConstants';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../../styles/main.css';
import styles from './AboutSection.module.css';

const AboutSection = ({
  formData,
  errors,
  loading,
  onInputChange
}) => {
  const bioLength = formData.bio?.length || 0;
  const aboutMeLength = formData.about_me?.length || 0;
  const additionalInfoLength = formData.additional_info?.length || 0;
  
  const bioMaxLength = VALIDATION_RULES.bio.maxLength;
  const bioMinLength = VALIDATION_RULES.bio.minLength;

  return (
    <div className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>About You</h3>
      
      {/* Bio - Required */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Your Bio <span className={styles.requiredAsterisk}>*</span>
        </label>
        <div className={styles.helpText}>
          {HELP_TEXT.bio}
        </div>
        <textarea
          className={`${styles.formTextarea} ${styles.textareaBio} ${errors.bio ? styles.formTextareaError : ''}`}
          value={formData.bio || ''}
          onChange={(e) => onInputChange('bio', e.target.value)}
          placeholder="Tell people about your approach to peer support, what makes you unique, and how you help others in their recovery journey..."
          disabled={loading}
          required
          maxLength={bioMaxLength}
        />
        <div className={styles.characterCountContainer}>
          {errors.bio && (
            <div className={styles.errorText}>{errors.bio}</div>
          )}
          <div className={`${styles.characterCount} ${bioLength < bioMinLength ? styles.characterCountWarning : ''}`}>
            {bioLength}/{bioMaxLength} characters {bioLength < bioMinLength && `(minimum ${bioMinLength})`}
          </div>
        </div>
        {bioLength < bioMinLength && !errors.bio && (
          <div className={styles.minimumLengthWarning}>
            Please write at least {bioMinLength} characters to give clients a good sense of your approach.
          </div>
        )}
      </div>

      {/* About Me - Required */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          About Your Professional Background <span className={styles.requiredAsterisk}>*</span>
        </label>
        <div className={styles.helpText}>
          Describe your professional background, training, experience, and what qualifies you as a peer support specialist
        </div>
        <textarea
          className={`${styles.formTextarea} ${styles.textareaStory} ${errors.about_me ? styles.formTextareaError : ''}`}
          value={formData.about_me || ''}
          onChange={(e) => onInputChange('about_me', e.target.value)}
          placeholder="Share your professional background, relevant training, certifications, work experience, or educational background that qualifies you to provide peer support..."
          disabled={loading}
          required
          maxLength="1000"
        />
        <div className={styles.characterCountContainer}>
          {errors.about_me && (
            <div className={styles.errorText}>{errors.about_me}</div>
          )}
          <div className={styles.characterCount}>
            {aboutMeLength}/1000 characters
          </div>
        </div>
      </div>

      {/* Additional Information - Optional */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Additional Information (Optional)</label>
        <div className={styles.helpText}>
          Any other information you'd like to share about yourself, your approach, or your services
        </div>
        <textarea
          className={`${styles.formTextarea} ${styles.textareaPhilosophy}`}
          value={formData.additional_info || ''}
          onChange={(e) => onInputChange('additional_info', e.target.value)}
          placeholder="Share any additional information about your approach, philosophy, special areas of focus, or anything else you'd like potential clients to know..."
          disabled={loading}
          maxLength="1000"
        />
        <div className={styles.characterCount}>
          {additionalInfoLength}/1000 characters
        </div>
      </div>

      {/* Privacy and Sharing Notice */}
      <div className={styles.alertContainer}>
        <div className={styles.infoAlert}>
          <span className={styles.alertTitle}>Privacy & Sharing:</span>
          <ul className={styles.alertList}>
            <li className={styles.alertListItem}>Your bio and professional background will be visible to potential clients</li>
            <li className={styles.alertListItem}>Additional information is optional and only shared if you choose to include it</li>
            <li className={styles.alertListItem}>You can edit or update this information at any time</li>
            <li className={styles.alertListItem}>All information is kept confidential and only shared with verified users</li>
          </ul>
        </div>
      </div>

      {/* Writing Tips */}
      <div className={styles.alertContainer}>
        <div className={styles.successAlert}>
          <span className={styles.alertTitle}>Tips for writing your profile:</span>
          <ul className={styles.alertList}>
            <li className={styles.alertListItem}>Focus on your professional experience and approach to peer support</li>
            <li className={styles.alertListItem}>Mention specific areas where you excel or have special experience</li>
            <li className={styles.alertListItem}>Use warm, welcoming language that makes people feel comfortable</li>
            <li className={styles.alertListItem}>Include what someone can expect when working with you</li>
            <li className={styles.alertListItem}>Keep it professional but personal - let your personality show through</li>
            <li className={styles.alertListItem}>Highlight your qualifications and what makes you effective as a peer specialist</li>
          </ul>
        </div>
      </div>

      {/* Profile Completion Status */}
      <div className={styles.alertContainer}>
        <div className={formData.profile_completed ? styles.successAlert : styles.infoAlert}>
          <span className={styles.alertTitle}>
            Profile Status: {formData.profile_completed ? 'Complete' : 'In Progress'}
          </span>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', lineHeight: '1.4' }}>
            {formData.profile_completed 
              ? 'Your profile is complete and ready for client matching!'
              : 'Complete all required fields to activate your profile for client searches.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

AboutSection.propTypes = {
  formData: PropTypes.shape({
    bio: PropTypes.string,
    about_me: PropTypes.string,
    additional_info: PropTypes.string,
    profile_completed: PropTypes.bool
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default AboutSection;