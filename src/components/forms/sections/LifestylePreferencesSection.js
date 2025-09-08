// src/components/forms/sections/LifestylePreferencesSection.js
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
  onInputChange,
  onRangeChange
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

      {/* Enhanced 1-5 Scale Preferences */}
      <div className="grid-3 mb-4">
        <div className="form-group">
          <div className="enhanced-range-container">
            <div className="range-description">Social Level</div>
            <div className="range-slider-wrapper">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.socialLevel}
                onChange={(e) => onRangeChange('socialLevel', e.target.value)}
                className="range-slider"
                disabled={loading}
              />
              <div className="enhanced-range-labels">
                <div className="range-endpoint">Quiet (1)</div>
                <div className="range-arrow">←→</div>
                <div className="range-endpoint">Very Social (5)</div>
              </div>
            </div>
            <div className="current-value-display">
              <span className="current-value-number">{formData.socialLevel}</span>
              <span className="current-value-label">Current Level</span>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <div className="enhanced-range-container">
            <div className="range-description">Cleanliness Level</div>
            <div className="range-slider-wrapper">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.cleanlinessLevel}
                onChange={(e) => onRangeChange('cleanlinessLevel', e.target.value)}
                className="range-slider"
                disabled={loading}
              />
              <div className="enhanced-range-labels">
                <div className="range-endpoint">Relaxed (1)</div>
                <div className="range-arrow">←→</div>
                <div className="range-endpoint">Very Clean (5)</div>
              </div>
            </div>
            <div className="current-value-display">
              <span className="current-value-number">{formData.cleanlinessLevel}</span>
              <span className="current-value-label">Current Level</span>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <div className="enhanced-range-container">
            <div className="range-description">Noise Level</div>
            <div className="range-slider-wrapper">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.noiseLevel}
                onChange={(e) => onRangeChange('noiseLevel', e.target.value)}
                className="range-slider"
                disabled={loading}
              />
              <div className="enhanced-range-labels">
                <div className="range-endpoint">Very Quiet (1)</div>
                <div className="range-arrow">←→</div>
                <div className="range-endpoint">Loud OK (5)</div>
              </div>
            </div>
            <div className="current-value-display">
              <span className="current-value-number">{formData.noiseLevel}</span>
              <span className="current-value-label">Current Level</span>
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
  onInputChange: PropTypes.func.isRequired,
  onRangeChange: PropTypes.func.isRequired
};

export default LifestylePreferencesSection;