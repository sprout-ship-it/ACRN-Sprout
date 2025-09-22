// src/components/features/matching/sections/LifestylePreferencesSection.js - Refactored with enhanced CSS module usage
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
  // Helper function to get lifestyle level description
  const getLifestyleLevelDescription = (type, value) => {
    const descriptions = {
      socialLevel: {
        1: 'Very Private - Prefer minimal interaction',
        2: 'Somewhat Quiet - Occasional friendly conversations',
        3: 'Balanced - Regular interaction but respect boundaries',
        4: 'Social - Enjoy frequent interaction and activities',
        5: 'Very Social - Love being around people constantly'
      },
      cleanlinessLevel: {
        1: 'Relaxed - Basic cleanliness is fine',
        2: 'Casual - Clean but not obsessive',
        3: 'Moderate - Regular cleaning routine',
        4: 'High Standards - Very clean and organized',
        5: 'Pristine - Everything must be spotless'
      },
      noiseLevel: {
        1: 'Very Quiet - Need peaceful, quiet environment',
        2: 'Low Noise - Some noise OK but prefer quiet',
        3: 'Moderate - Normal household noise is fine',
        4: 'Tolerant - Can handle louder activities',
        5: 'High Tolerance - Music, TV, friends over OK'
      }
    };
    return descriptions[type]?.[value] || `Level ${value}`;
  };

  return (
    <>
      {/* Lifestyle Preferences Header */}
      <h3 className="card-title mb-4">Lifestyle Preferences</h3>
      
      <div className="alert alert-info mb-4">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>⚖️</span>
          Lifestyle Compatibility Matching
        </h4>
        <p className="mb-0">
          Your daily lifestyle preferences help us match you with roommates who have compatible schedules, 
          cleanliness standards, and social needs. This creates a harmonious living environment for everyone.
        </p>
      </div>

      {/* Work & Schedule Information */}
      <div className="card-header">
        <h4 className="card-title">Work & Schedule Information</h4>
        <p className="card-subtitle">
          Understanding your daily routine helps match you with compatible roommates
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Work Schedule <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.workSchedule ? 'border-red-500' : ''}`}
            value={formData.workSchedule || ''}
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
            <div className="text-red-500 mt-1 text-sm">{errors.workSchedule}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Your typical work schedule affects shared space usage
          </div>
        </div>

        <div className="form-group">
          <label className="label">Bedtime Preference</label>
          <select
            className="input"
            value={formData.bedtimePreference || ''}
            onChange={(e) => onInputChange('bedtimePreference', e.target.value)}
            disabled={loading}
          >
            {bedtimePreferenceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            When you typically go to bed and wake up
          </div>
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Work-from-Home Frequency</label>
        <select
          className="input"
          value={formData.workFromHome || ''}
          onChange={(e) => onInputChange('workFromHome', e.target.value)}
          disabled={loading}
        >
          <option value="">Select frequency</option>
          <option value="never">Never work from home</option>
          <option value="occasionally">Occasionally (1-2 days/month)</option>
          <option value="sometimes">Sometimes (1-2 days/week)</option>
          <option value="frequently">Frequently (3-4 days/week)</option>
          <option value="always">Always work from home</option>
          <option value="not-working">Not currently working</option>
        </select>
        <div className="text-gray-500 mt-1 text-sm">
          How often you'll be home during typical work hours
        </div>
      </div>

      {/* Living Style Compatibility Scales */}
      <div className="card-header">
        <h4 className="card-title">Living Style Compatibility</h4>
        <p className="card-subtitle">
          Rate yourself on these important lifestyle factors (1-5 scale)
        </p>
      </div>

      {/* Enhanced Range Sliders */}
      <div className="grid-3 mb-4">
        {/* Social Level */}
        <div className="form-group">
          <div className={styles.enhancedRangeContainer || 'enhanced-range-container'}>
            <div className={styles.rangeDescription || 'range-description'}>Social Level</div>
            <div className={styles.rangeSliderWrapper || 'range-slider-wrapper'}>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.socialLevel || 3}
                onChange={(e) => onRangeChange('socialLevel', parseInt(e.target.value))}
                className={styles.rangeSlider || 'range-slider'}
                disabled={loading}
              />
              <div className={styles.enhancedRangeLabels || 'enhanced-range-labels'}>
                <div className={styles.rangeEndpoint || 'range-endpoint'}>Private (1)</div>
                <div className={styles.rangeArrow || 'range-arrow'}>←→</div>
                <div className={styles.rangeEndpoint || 'range-endpoint'}>Very Social (5)</div>
              </div>
            </div>
            <div className={styles.currentValueDisplay || 'current-value-display'}>
              <span className={styles.currentValueNumber || 'current-value-number'}>{formData.socialLevel || 3}</span>
              <span className={styles.currentValueLabel || 'current-value-label'}>
                {getLifestyleLevelDescription('socialLevel', formData.socialLevel || 3)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Cleanliness Level */}
        <div className="form-group">
          <div className={styles.enhancedRangeContainer || 'enhanced-range-container'}>
            <div className={styles.rangeDescription || 'range-description'}>Cleanliness Level</div>
            <div className={styles.rangeSliderWrapper || 'range-slider-wrapper'}>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.cleanlinessLevel || 3}
                onChange={(e) => onRangeChange('cleanlinessLevel', parseInt(e.target.value))}
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
              <span className={styles.currentValueNumber || 'current-value-number'}>{formData.cleanlinessLevel || 3}</span>
              <span className={styles.currentValueLabel || 'current-value-label'}>
                {getLifestyleLevelDescription('cleanlinessLevel', formData.cleanlinessLevel || 3)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Noise Level */}
        <div className="form-group">
          <div className={styles.enhancedRangeContainer || 'enhanced-range-container'}>
            <div className={styles.rangeDescription || 'range-description'}>Noise Tolerance</div>
            <div className={styles.rangeSliderWrapper || 'range-slider-wrapper'}>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.noiseLevel || 3}
                onChange={(e) => onRangeChange('noiseLevel', parseInt(e.target.value))}
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
              <span className={styles.currentValueNumber || 'current-value-number'}>{formData.noiseLevel || 3}</span>
              <span className={styles.currentValueLabel || 'current-value-label'}>
                {getLifestyleLevelDescription('noiseLevel', formData.noiseLevel || 3)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Social & Guest Preferences */}
      <div className="card-header">
        <h4 className="card-title">Social & Guest Preferences</h4>
        <p className="card-subtitle">
          How you prefer to handle guests and social activities in your home
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Guest Policy Preference</label>
          <select
            className="input"
            value={formData.guestsPolicy || ''}
            onChange={(e) => onInputChange('guestsPolicy', e.target.value)}
            disabled={loading}
          >
            {guestsPolicyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Your comfort level with guests in the home
          </div>
        </div>

        <div className="form-group">
          <label className="label">Social Activities at Home</label>
          <select
            className="input"
            value={formData.socialActivitiesAtHome || ''}
            onChange={(e) => onInputChange('socialActivitiesAtHome', e.target.value)}
            disabled={loading}
          >
            <option value="">Select preference</option>
            <option value="never">Prefer no social activities at home</option>
            <option value="rare">Rare occasions only (holidays, special events)</option>
            <option value="occasional">Occasional small gatherings (monthly)</option>
            <option value="regular">Regular but reasonable (weekly)</option>
            <option value="frequent">Frequent social activities welcome</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            How often you're comfortable with social gatherings
          </div>
        </div>
      </div>

      {/* Daily Living Preferences */}
      <div className="card-header">
        <h4 className="card-title">Daily Living Preferences</h4>
        <p className="card-subtitle">
          Your preferences for shared spaces and daily routines
        </p>
      </div>

      <div className="form-group mb-4">
        <div className="grid-2">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.earlyRiser || false}
              onChange={(e) => onInputChange('earlyRiser', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I'm an early riser (up before 7 AM)
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.nightOwl || false}
              onChange={(e) => onInputChange('nightOwl', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I'm a night owl (up after 11 PM)
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.cookingEnthusiast || false}
              onChange={(e) => onInputChange('cookingEnthusiast', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I love cooking and use kitchen frequently
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.exerciseAtHome || false}
              onChange={(e) => onInputChange('exerciseAtHome', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I exercise/work out at home
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.musicInstruments || false}
              onChange={(e) => onInputChange('musicInstruments', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I play musical instruments
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.tvStreaming || false}
              onChange={(e) => onInputChange('tvStreaming', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I watch TV/streaming regularly
            </span>
          </label>
        </div>
      </div>

      {/* Household Management Style */}
      <div className="card-header">
        <h4 className="card-title">Household Management Style</h4>
        <p className="card-subtitle">
          How you prefer to handle shared responsibilities and house rules
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Chore Sharing Preference</label>
          <select
            className="input"
            value={formData.choreSharingStyle || ''}
            onChange={(e) => onInputChange('choreSharingStyle', e.target.value)}
            disabled={loading}
          >
            <option value="">Select style</option>
            <option value="formal-schedule">Formal chore schedule/rotation</option>
            <option value="informal-sharing">Informal sharing as needed</option>
            <option value="individual-responsibility">Each person handles their own</option>
            <option value="hire-help">Prefer to hire cleaning help</option>
            <option value="flexible">Very flexible approach</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            How you prefer to manage household chores
          </div>
        </div>

        <div className="form-group">
          <label className="label">Communication Style</label>
          <select
            className="input"
            value={formData.communicationStyle || ''}
            onChange={(e) => onInputChange('communicationStyle', e.target.value)}
            disabled={loading}
          >
            <option value="">Select style</option>
            <option value="direct-verbal">Direct verbal communication</option>
            <option value="written-notes">Written notes/messages</option>
            <option value="group-meetings">Regular house meetings</option>
            <option value="casual-check-ins">Casual check-ins as needed</option>
            <option value="minimal-communication">Minimal communication preferred</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            How you prefer to communicate about house matters
          </div>
        </div>
      </div>

      {/* Stress & Recovery Lifestyle */}
      <div className="card-header">
        <h4 className="card-title">Stress Management & Recovery Lifestyle</h4>
        <p className="card-subtitle">
          Lifestyle factors that support your recovery and well-being
        </p>
      </div>

      <div className="form-group mb-4">
        <div className="grid-2">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.needQuietSpace || false}
              onChange={(e) => onInputChange('needQuietSpace', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I need quiet space for meditation/reflection
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.routineImportant || false}
              onChange={(e) => onInputChange('routineImportant', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Consistent routines are important for my recovery
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.stressTriggersNoise || false}
              onChange={(e) => onInputChange('stressTriggersNoise', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Loud noises/chaos are stress triggers for me
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.supportiveEnvironment || false}
              onChange={(e) => onInputChange('supportiveEnvironment', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I thrive in supportive, encouraging environments
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.activeLifestyle || false}
              onChange={(e) => onInputChange('activeLifestyle', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I maintain an active, healthy lifestyle
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.mindfulLiving || false}
              onChange={(e) => onInputChange('mindfulLiving', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I practice mindful/conscious living
            </span>
          </label>
        </div>
      </div>

      {/* Lifestyle Compatibility Tips */}
      <div className="alert alert-success">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>💡</span>
          Lifestyle Compatibility Tips
        </h4>
        <p className="mb-2">
          <strong>Creating a harmonious living environment:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li><strong>Be honest:</strong> Accurate self-assessment leads to better matches</li>
          <li><strong>Consider flexibility:</strong> Small differences can often be worked out</li>
          <li><strong>Think recovery-first:</strong> Prioritize what supports your healing journey</li>
          <li><strong>Communication matters:</strong> Most lifestyle conflicts can be resolved with good communication</li>
        </ul>
        <p className="text-sm">
          Remember: The goal is finding someone whose lifestyle naturally complements yours, creating 
          a supportive environment for both of your recovery journeys.
        </p>
      </div>
    </>
  );
};

LifestylePreferencesSection.propTypes = {
  formData: PropTypes.shape({
    workSchedule: PropTypes.string,
    workFromHome: PropTypes.string,
    bedtimePreference: PropTypes.string,
    socialLevel: PropTypes.number,
    cleanlinessLevel: PropTypes.number,
    noiseLevel: PropTypes.number,
    guestsPolicy: PropTypes.string,
    socialActivitiesAtHome: PropTypes.string,
    earlyRiser: PropTypes.bool,
    nightOwl: PropTypes.bool,
    cookingEnthusiast: PropTypes.bool,
    exerciseAtHome: PropTypes.bool,
    musicInstruments: PropTypes.bool,
    tvStreaming: PropTypes.bool,
    choreSharingStyle: PropTypes.string,
    communicationStyle: PropTypes.string,
    needQuietSpace: PropTypes.bool,
    routineImportant: PropTypes.bool,
    stressTriggersNoise: PropTypes.bool,
    supportiveEnvironment: PropTypes.bool,
    activeLifestyle: PropTypes.bool,
    mindfulLiving: PropTypes.bool
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  profile: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string
  }),
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired,
  onRangeChange: PropTypes.func.isRequired,
  styles: PropTypes.object
};

LifestylePreferencesSection.defaultProps = {
  profile: null,
  styles: {}
};

export default LifestylePreferencesSection;