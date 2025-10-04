// src/components/features/peer-support/sections/AboutSettingsSection.js - CONSOLIDATED ABOUT & SETTINGS
import React from 'react';
import PropTypes from 'prop-types';
import { HELP_TEXT, VALIDATION_RULES } from '../constants/peerSupportConstants';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../../styles/main.css';
import styles from './AboutSettingsSection.module.css';

const AboutSettingsSection = ({
  formData,
  errors,
  loading,
  onInputChange
}) => {
  const bioLength = formData.bio?.length || 0;
  const additionalInfoLength = formData.additional_info?.length || 0;
  
  const bioMaxLength = VALIDATION_RULES.bio.maxLength;
  const bioMinLength = VALIDATION_RULES.bio.minLength;

  return (
    <div className={styles.sectionContainer}>
      {/* About You Content */}
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
          name="bio"
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

      {/* Additional Information - Optional */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Additional Information (Optional)</label>
        <div className={styles.helpText}>
          {HELP_TEXT.additional_info}
        </div>
        <textarea
          className={`${styles.formTextarea} ${styles.textareaAdditional}`}
          name="additional_info"
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

      {/* Service Settings */}
      <h4 className={styles.sectionSubtitle}>
        Service Settings
      </h4>
      
      {/* Current Availability Status */}
      <div className={styles.formGroup}>
        <div className={`${styles.checkboxControl} ${formData.accepting_clients ? styles.selected : ''}`}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            name="accepting_clients"
            checked={formData.accepting_clients !== false}
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
            name="is_active"
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
            <div className={styles.summaryLabel}>Specialties:</div>
            <div className={styles.summaryValue}>
              {formData.specialties?.length || 0} selected
            </div>
          </div>
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

      {/* Privacy and Sharing Notice */}
      <div className={styles.alertContainer}>
        <div className={styles.infoAlert}>
          <span className={styles.alertTitle}>Privacy & Sharing:</span>
          <ul className={styles.alertList}>
            <li className={styles.alertListItem}>Your bio will be visible to potential clients seeking peer support</li>
            <li className={styles.alertListItem}>Additional information is optional and only shared if you choose to include it</li>
            <li className={styles.alertListItem}>You can edit or update this information at any time</li>
            <li className={styles.alertListItem}>All information is kept confidential and only shared with verified users</li>
            <li className={styles.alertListItem}>Your profile visibility is controlled by your active status setting</li>
          </ul>
        </div>
      </div>

      {/* Bio Requirement Notice */}
      {bioLength < bioMinLength && (
        <div className={styles.completionNotice}>
          <div className={styles.noticeTitle}>Complete Your Bio:</div>
          <p className={styles.noticeText}>
            A complete bio helps potential clients understand your approach and builds trust. Please write at least {bioMinLength} characters about your peer support experience and approach.
          </p>
        </div>
      )}

      {/* Service Settings Help */}
      {!formData.accepting_clients && (
        <div className={styles.helpNotice}>
          <div className={styles.noticeTitle}>Not Accepting Clients:</div>
          <p className={styles.noticeText}>
            Your profile will still be visible to users, but they'll see that you're not currently accepting new clients. You can change this setting anytime.
          </p>
        </div>
      )}

      {/* Final Completion Status */}
      <div className={styles.completionStatus}>
        <div className={styles.completionGrid}>
          <div className={styles.completionContent}>
            <div className={styles.completionTitle}>Ready to Help Others:</div>
            <p className={styles.completionText}>
              Once you complete your profile, you'll be able to connect with individuals seeking peer support in their recovery journey.
            </p>
          </div>
          <div className={styles.completionBadge}>
            <span className={bioLength >= bioMinLength ? styles.badgeReady : styles.badgeIncomplete}>
              {bioLength >= bioMinLength ? 'Ready' : 'Needs Bio'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

AboutSettingsSection.propTypes = {
  formData: PropTypes.shape({
    bio: PropTypes.string,
    additional_info: PropTypes.string,
    accepting_clients: PropTypes.bool,
    is_active: PropTypes.bool,
    service_areas: PropTypes.arrayOf(PropTypes.string),
    specialties: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default AboutSettingsSection;