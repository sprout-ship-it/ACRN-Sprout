// src/components/features/matching/sections/LifestylePreferencesSection.js - Updated with CSS module
import React from 'react';
import PropTypes from 'prop-types';
import {
  workScheduleOptions,
  bedtimePreferenceOptions,
  guestsPolicyOptions
} from '../constants/matchingFormConstants';

const LifestylePreferencesSection = ({
  formData,
  errors,
  loading,
  profile,      // Added for interface consistency
  onInputChange,
  onArrayChange, // Added for interface consistency
  onRangeChange,
  styles = {}   // CSS module styles passed from parent
}) => {
  return (
    <>
      {/* Lifestyle Preferences - Enhanced with New Range Sliders */}
      <h3 className="card-title mb-4">Lifestyle Preferences</h3>
      
      <div className="form-group mb-4">
        <label className="label">
          Work Schedule <span className="text-red-500">*</span>
        </label>
        <select
          className={`input ${errors.workSchedule ? 'border-red-500' : ''}`}
          value={formData.workSchedule}
          onChange={(e) => onInputChange('workSchedule', e.target.value)}
          disabled={loading}
          required
        >
          {workScheduleOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.workSchedule && (
          <div className="text-red-500 mt-1">{errors.workSchedule}</div>
        )}
      </div>

      {/* ✅ UPDATED: Enhanced 1-5 Scale Preferences using CSS module classes */}
      <div className="grid-3 mb-4">
        <div className="form-group">
          <div className={styles.enhancedRangeContainer || 'enhanced-range-container'}>
            <div className={styles.rangeDescription || 'range-description'}>Social Level</div>
            <div className={styles.rangeSliderWrapper || 'range-slider-wrapper'}>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.socialLevel}
                onChange={(e) => onRangeChange('socialLevel', e.target.value)}
                className={styles.rangeSlider || 'range-slider'}
                disabled={loading}
              />
              <div className={styles.enhancedRangeLabels || 'enhanced-range-labels'}>
                <div className={styles.rangeEndpoint || 'range-endpoint'}>Quiet (1)</div>
                <div className={styles.rangeArrow || 'range-arrow'}>←→</div>
                <div className={styles.rangeEndpoint || 'range-endpoint'}>Very Social (5)</div>
              </div>
            </div>
            <div className={styles.currentValueDisplay || 'current-value-display'}>
              <span className={styles.currentValueNumber || 'current-value-number'}>{formData.socialLevel}</span>
              <span className={styles.currentValueLabel || 'current-value-label'}>Current Level</span>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <div className={styles.enhancedRangeContainer || 'enhanced-range-container'}>
            <div className={styles.rangeDescription || 'range-description'}>Cleanliness Level</div>
            <div className={styles.rangeSliderWrapper || 'range-slider-wrapper'}>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.cleanlinessLevel}
                onChange={(e) => onRangeChange('cleanlinessLevel', e.target.value)}
                className={styles.rangeSlider || 'range-slider'}
                disabled={loading}
              />
              <div className={styles.enhancedRangeLabels || 'enhanced-range-labels'}>
                <div className={styles.rangeEndpoint || 'range-endpoint'}>Relaxed (1)</div>
                <div className={styles.rangeArrow || 'range-arrow'}>←→</div>
                <div className={styles.rangeEndpoint || 'range-endpoint'}>Very Clean (5)</div>
              </div>
            </div>
            <div className={styles.currentValueDisplay || 'current-value-display'}>
              <span className={styles.currentValueNumber || 'current-value-number'}>{formData.cleanlinessLevel}</span>
              <span className={styles.currentValueLabel || 'current-value-label'}>Current Level</span>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <div className={styles.enhancedRangeContainer || 'enhanced-range-container'}>
            <div className={styles.rangeDescription || 'range-description'}>Noise Level</div>
            <div className={styles.rangeSliderWrapper || 'range-slider-wrapper'}>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.noiseLevel}
                onChange={(e) => onRangeChange('noiseLevel', e.target.value)}
                className={styles.rangeSlider || 'range-slider'}
                disabled={loading}
              />
              <div className={styles.enhancedRangeLabels || 'enhanced-range-labels'}>
                <div className={styles.rangeEndpoint || 'range-endpoint'}>Very Quiet (1)</div>
                <div className={styles.rangeArrow || 'range-arrow'}>←→</div>
                <div className={styles.rangeEndpoint || 'range-endpoint'}>Loud OK (5)</div>
              </div>
            </div>
            <div className={styles.currentValueDisplay || 'current-value-display'}>
              <span className={styles.currentValueNumber || 'current-value-number'}>{formData.noiseLevel}</span>
              <span className={styles.currentValueLabel || 'current-value-label'}>Current Level</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Bedtime Preference</label>
          <select
            className="input"
            value={formData.bedtimePreference}
            onChange={(e) => onInputChange('bedtimePreference', e.target.value)}
            disabled={loading}
          >
            {bedtimePreferenceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="label">Guest Policy</label>
          <select
            className="input"
            value={formData.guestsPolicy}
            onChange={(e) => onInputChange('guestsPolicy', e.target.value)}
            disabled={loading}
          >
            {guestsPolicyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

LifestylePreferencesSection.propTypes = {
  formData: PropTypes.shape({
    workSchedule: PropTypes.string.isRequired,
    socialLevel: PropTypes.number.isRequired,
    cleanlinessLevel: PropTypes.number.isRequired,
    noiseLevel: PropTypes.number.isRequired,
    bedtimePreference: PropTypes.string.isRequired,
    guestsPolicy: PropTypes.string.isRequired
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  profile: PropTypes.shape({               // Added for interface consistency
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string
  }),
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired, // Added for interface consistency
  onRangeChange: PropTypes.func.isRequired,
  styles: PropTypes.object                  // ✅ NEW: CSS module styles
};

LifestylePreferencesSection.defaultProps = {
  profile: null,
  styles: {}                                // ✅ NEW: Default empty object for styles
};

export default LifestylePreferencesSection;