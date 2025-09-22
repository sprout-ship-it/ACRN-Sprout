// src/components/forms/sections/peer-support/AboutSection.js - UPDATED WITH CSS MODULE
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
  const recoveryStoryLength = formData.recovery_story?.length || 0;
  const philosophyLength = formData.philosophy?.length || 0;
  const qualitiesLength = formData.unique_qualities?.length || 0;
  
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
          value={formData.bio}
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

      {/* Recovery Story - Optional */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Your Recovery Story (Optional)</label>
        <div className={styles.helpText}>
          {HELP_TEXT.recovery_story}
        </div>
        <textarea
          className={`${styles.formTextarea} ${styles.textareaStory}`}
          value={formData.recovery_story}
          onChange={(e) => onInputChange('recovery_story', e.target.value)}
          placeholder="Share what you're comfortable sharing about your recovery journey, challenges you've overcome, and what drives your passion for peer support..."
          disabled={loading}
          maxLength="1000"
        />
        <div className={styles.characterCount}>
          {recoveryStoryLength}/1000 characters
        </div>
      </div>

      {/* Personal Approach */}
      <h4 className={styles.sectionSubtitle}>
        Your Approach to Peer Support
      </h4>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Philosophy & Methods (Optional)</label>
        <textarea
          className={`${styles.formTextarea} ${styles.textareaPhilosophy}`}
          value={formData.philosophy || ''}
          onChange={(e) => onInputChange('philosophy', e.target.value)}
          placeholder="Describe your philosophy about recovery, your methods for supporting others, or any specific techniques you use..."
          disabled={loading}
          maxLength="500"
        />
        <div className={styles.characterCount}>
          {philosophyLength}/500 characters
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>What Makes You Unique (Optional)</label>
        <textarea
          className={`${styles.formTextarea} ${styles.textareaQualities}`}
          value={formData.unique_qualities || ''}
          onChange={(e) => onInputChange('unique_qualities', e.target.value)}
          placeholder="What sets you apart as a peer support specialist? Special skills, experiences, or perspectives you bring..."
          disabled={loading}
          maxLength="400"
        />
        <div className={styles.characterCount}>
          {qualitiesLength}/400 characters
        </div>
      </div>

      {/* Privacy and Sharing Notice */}
      <div className={styles.alertContainer}>
        <div className={styles.infoAlert}>
          <span className={styles.alertTitle}>Privacy & Sharing:</span>
          <ul className={styles.alertList}>
            <li className={styles.alertListItem}>Your bio will be visible to potential clients browsing peer support specialists</li>
            <li className={styles.alertListItem}>Your recovery story is optional and only shared if you choose to include it</li>
            <li className={styles.alertListItem}>You can edit or update this information at any time</li>
            <li className={styles.alertListItem}>All information is kept confidential and only shared with verified users</li>
          </ul>
        </div>
      </div>

      {/* Writing Tips */}
      <div className={styles.alertContainer}>
        <div className={styles.successAlert}>
          <span className={styles.alertTitle}>Tips for writing your bio:</span>
          <ul className={styles.alertList}>
            <li className={styles.alertListItem}>Focus on your experience and approach rather than personal details</li>
            <li className={styles.alertListItem}>Mention specific areas where you excel or have special experience</li>
            <li className={styles.alertListItem}>Use warm, welcoming language that makes people feel comfortable</li>
            <li className={styles.alertListItem}>Include what someone can expect when working with you</li>
            <li className={styles.alertListItem}>Keep it professional but personal - let your personality show through</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

AboutSection.propTypes = {
  formData: PropTypes.shape({
    bio: PropTypes.string.isRequired,
    recovery_story: PropTypes.string,
    philosophy: PropTypes.string,
    unique_qualities: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default AboutSection;