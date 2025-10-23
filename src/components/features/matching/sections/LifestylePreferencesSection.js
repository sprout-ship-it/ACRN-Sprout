// src/components/features/matching/sections/LifestylePreferencesSection.js - PRODUCTION READY
import React, { useMemo, useCallback, useEffect, useRef } from 'react';
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
  profile,
  onInputChange,
  onArrayChange,
  onRangeChange,
  styles = {},
  fieldMapping,
  sectionId,
  isActive,
  validationMessage
}) => {
  // Ref for the work schedule field to enable auto-navigation
  const workScheduleRef = useRef(null);

  // Navigate to work schedule field on component mount
  useEffect(() => {
    if (workScheduleRef.current && isActive) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        workScheduleRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        workScheduleRef.current.focus();
      }, 300);
    }
  }, [isActive]);

  // Enhanced lifestyle level descriptions with recovery context
  const getLifestyleLevelDescription = useCallback((type, value) => {
    const descriptions = {
      social_level: {
        1: 'Very Private - Minimal interaction, need quiet space for recovery focus',
        2: 'Somewhat Quiet - Occasional friendly conversations, respect for personal time',
        3: 'Balanced - Regular interaction with healthy boundaries',
        4: 'Social - Enjoy frequent interaction and group activities',
        5: 'Very Social - Thrive with constant interaction and community activities'
      },
      cleanliness_level: {
        1: 'Relaxed - Basic cleanliness, lived-in feel is comfortable',
        2: 'Casual - Generally clean but not obsessive about organization',
        3: 'Moderate - Regular cleaning routine, organized common spaces',
        4: 'High Standards - Very clean and well-organized environment',
        5: 'Pristine - Everything spotless and perfectly organized always'
      },
      noise_tolerance: {
        1: 'Very Quiet - Need peaceful environment for recovery/healing',
        2: 'Low Noise - Some sounds OK but prefer quiet, calm atmosphere',
        3: 'Moderate - Normal household noise is fine',
        4: 'Tolerant - Can handle louder activities and varied noise levels',
        5: 'High Tolerance - Music, TV, gatherings, varied noise levels all OK'
      }
    };
    return descriptions[type]?.[value] || `Level ${value}`;
  }, []);

  // Validate lifestyle compatibility balance
  const validateLifestyleBalance = useCallback(() => {
    const social = formData.social_level || 3;
    const cleanliness = formData.cleanliness_level || 3;
    const noise = formData.noise_tolerance || 3;
    
    const warnings = [];
    
    if (social === 1 && noise === 5) {
      warnings.push('Very private social preference with high noise tolerance seems contradictory');
    }
    if (social === 5 && noise === 1) {
      warnings.push('Very social preference with very quiet noise needs may conflict');
    }
    if (cleanliness === 1 && social === 5) {
      warnings.push('Relaxed cleanliness with high social activity may cause roommate conflicts');
    }
    
    return warnings;
  }, [formData.social_level, formData.cleanliness_level, formData.noise_tolerance]);

  // Calculate lifestyle compatibility score
  const calculateLifestyleScore = useCallback(() => {
    let score = 0;
    let factors = 0;
    
    if (formData.work_schedule) { score += 20; factors++; }
    if (formData.social_level) { score += 20; factors++; }
    if (formData.cleanliness_level) { score += 20; factors++; }
    if (formData.noise_tolerance) { score += 20; factors++; }
    if (formData.guests_policy) { score += 20; factors++; }
    
    return factors > 0 ? Math.round(score / factors) : 0;
  }, [formData]);

  const lifestyleWarnings = validateLifestyleBalance();
  const lifestyleCompletionScore = calculateLifestyleScore();

  return (
    <>
      {/* Lifestyle Preferences Header */}
      <div className="section-intro">
        <h3 className="card-title mb-4">Lifestyle Compatibility</h3>
        <div className="alert alert-info mb-4">
          <h4 className="mb-2">
            <span style={{ marginRight: '8px' }}>⚖️</span>
            Advanced Lifestyle Compatibility Matching
          </h4>
          <p className="mb-0">
            Your daily lifestyle preferences are crucial for finding compatible roommates. Our matching 
            algorithm uses these factors to create harmonious living environments that support everyone's 
            recovery journey and personal well-being.
          </p>
        </div>
      </div>

      {/* Work & Schedule Information */}
      <div className="card-header">
        <h4 className="card-title">Work & Daily Schedule</h4>
        <p className="card-subtitle">Understanding your routine helps match you with roommates who have compatible schedules</p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Work Schedule <span className="text-red-500">*</span>
          </label>
          <select
            ref={workScheduleRef}
            className={`input ${errors.work_schedule ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.work_schedule || ''}
            onChange={(e) => onInputChange('work_schedule', e.target.value)}
            disabled={loading}
            required
          >
            {workScheduleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.work_schedule && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.work_schedule}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Your typical work schedule affects shared space usage and household routines
          </div>
        </div>

        <div className="form-group">
          <label className="label">Bedtime Preference</label>
          <select
            className={`input ${errors.bedtime_preference ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.bedtime_preference || ''}
            onChange={(e) => onInputChange('bedtime_preference', e.target.value)}
            disabled={loading}
          >
            {bedtimePreferenceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.bedtime_preference && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.bedtime_preference}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            When you typically sleep and wake affects household noise considerations
          </div>
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Work-from-Home Frequency</label>
        <select
          className={`input ${errors.work_from_home_frequency ? 'border-red-500 bg-red-50' : ''}`}
          value={formData.work_from_home_frequency || ''}
          onChange={(e) => onInputChange('work_from_home_frequency', e.target.value)}
          disabled={loading}
        >
          <option value="">Select frequency</option>
          <option value="never">Never work from home</option>
          <option value="occasionally">Occasionally (1-2 days/month)</option>
          <option value="sometimes">Sometimes (1-2 days/week)</option>
          <option value="frequently">Frequently (3-4 days/week)</option>
          <option value="always">Always work from home</option>
          <option value="not-working">Not currently working</option>
          <option value="disability">On disability/unable to work</option>
          <option value="in-treatment">In treatment program</option>
        </select>
        {errors.work_from_home_frequency && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.work_from_home_frequency}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          How often you'll be home during typical work hours
        </div>
      </div>

      {/* Core Lifestyle Compatibility Scales */}
      <div className="card-header">
        <h4 className="card-title">Core Lifestyle Compatibility Factors</h4>
        <p className="card-subtitle">
          Rate yourself on these critical compatibility factors (1-5 scale). These are weighted heavily in our matching algorithm.
        </p>
      </div>

      <div className="grid-3 mb-4">
        {/* Social Level */}
        <div className="form-group">
          <div className={styles.enhancedRangeContainer || 'enhanced-range-container'}>
            <div className={styles.rangeLabel || 'range-label'}>
              <span className="font-medium">Social Level</span>
              <span className="text-red-500">*</span>
            </div>
            <div className={styles.rangeSliderWrapper || 'range-slider-wrapper'}>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.social_level || 3}
                onChange={(e) => onRangeChange('social_level', parseInt(e.target.value))}
                className={`${styles.rangeSlider || 'range-slider'} ${errors.social_level ? 'border-red-500' : ''}`}
                disabled={loading}
                required
              />
              <div className={styles.rangeLabels || 'range-labels'} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span className="text-xs" style={{ flex: 1, textAlign: 'left' }}>Private (1)</span>
                <span className="text-xs" style={{ flex: 1, textAlign: 'center' }}>Balanced (3)</span>
                <span className="text-xs" style={{ flex: 1, textAlign: 'right' }}>Very Social (5)</span>
              </div>
            </div>
            <div className={styles.currentValueDisplay || 'current-value-display'}>
              <div className={`${styles.valueNumber || 'value-number'} text-lg font-bold`}>
                {formData.social_level || 3}
              </div>
              <div className={styles.valueDescription || 'value-description'}>
                {getLifestyleLevelDescription('social_level', formData.social_level || 3)}
              </div>
            </div>
            {errors.social_level && (
              <div className="text-red-500 mt-1 text-sm font-medium">{errors.social_level}</div>
            )}
          </div>
        </div>
        
        {/* Cleanliness Level */}
        <div className="form-group">
          <div className={styles.enhancedRangeContainer || 'enhanced-range-container'}>
            <div className={styles.rangeLabel || 'range-label'}>
              <span className="font-medium">Cleanliness Level</span>
              <span className="text-red-500">*</span>
            </div>
            <div className={styles.rangeSliderWrapper || 'range-slider-wrapper'}>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.cleanliness_level || 3}
                onChange={(e) => onRangeChange('cleanliness_level', parseInt(e.target.value))}
                className={`${styles.rangeSlider || 'range-slider'} ${errors.cleanliness_level ? 'border-red-500' : ''}`}
                disabled={loading}
                required
              />
              <div className={styles.rangeLabels || 'range-labels'} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span className="text-xs" style={{ flex: 1, textAlign: 'left' }}>Relaxed (1)</span>
                <span className="text-xs" style={{ flex: 1, textAlign: 'center' }}>Moderate (3)</span>
                <span className="text-xs" style={{ flex: 1, textAlign: 'right' }}>Very Clean (5)</span>
              </div>
            </div>
            <div className={styles.currentValueDisplay || 'current-value-display'}>
              <div className={`${styles.valueNumber || 'value-number'} text-lg font-bold`}>
                {formData.cleanliness_level || 3}
              </div>
              <div className={styles.valueDescription || 'value-description'}>
                {getLifestyleLevelDescription('cleanliness_level', formData.cleanliness_level || 3)}
              </div>
            </div>
            {errors.cleanliness_level && (
              <div className="text-red-500 mt-1 text-sm font-medium">{errors.cleanliness_level}</div>
            )}
          </div>
        </div>
        
        {/* Noise Tolerance */}
        <div className="form-group">
          <div className={styles.enhancedRangeContainer || 'enhanced-range-container'}>
            <div className={styles.rangeLabel || 'range-label'}>
              <span className="font-medium">Noise Tolerance</span>
              <span className="text-red-500">*</span>
            </div>
            <div className={styles.rangeSliderWrapper || 'range-slider-wrapper'}>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.noise_tolerance || 3}
                onChange={(e) => onRangeChange('noise_tolerance', parseInt(e.target.value))}
                className={`${styles.rangeSlider || 'range-slider'} ${errors.noise_tolerance ? 'border-red-500' : ''}`}
                disabled={loading}
                required
              />
              <div className={styles.rangeLabels || 'range-labels'} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span className="text-xs" style={{ flex: 1, textAlign: 'left' }}>Very Quiet (1)</span>
                <span className="text-xs" style={{ flex: 1, textAlign: 'center' }}>Moderate (3)</span>
                <span className="text-xs" style={{ flex: 1, textAlign: 'right' }}>Loud OK (5)</span>
              </div>
            </div>
            <div className={styles.currentValueDisplay || 'current-value-display'}>
              <div className={`${styles.valueNumber || 'value-number'} text-lg font-bold`}>
                {formData.noise_tolerance || 3}
              </div>
              <div className={styles.valueDescription || 'value-description'}>
                {getLifestyleLevelDescription('noise_tolerance', formData.noise_tolerance || 3)}
              </div>
            </div>
            {errors.noise_tolerance && (
              <div className="text-red-500 mt-1 text-sm font-medium">{errors.noise_tolerance}</div>
            )}
          </div>
        </div>
      </div>

      {/* Lifestyle Compatibility Warnings */}
      {lifestyleWarnings.length > 0 && (
        <div className="alert alert-warning mb-4">
          <h4 className="mb-2">Lifestyle Compatibility Notes:</h4>
          <ul className="ml-4">
            {lifestyleWarnings.map((warning, index) => (
              <li key={index} className="text-sm">{warning}</li>
            ))}
          </ul>
          <div className="text-sm mt-2">
            Consider adjusting these settings if they don't accurately reflect your preferences.
          </div>
        </div>
      )}

      {/* Social & Guest Preferences */}
      <div className="card-header">
        <h4 className="card-title">Social & Guest Management</h4>
        <p className="card-subtitle">How you prefer to handle guests, visitors, and social activities in your home</p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Guest Policy Preference</label>
          <select
            className={`input ${errors.guests_policy ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.guests_policy || ''}
            onChange={(e) => onInputChange('guests_policy', e.target.value)}
            disabled={loading}
          >
            {guestsPolicyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.guests_policy && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.guests_policy}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Your comfort level with guests and visitors in the home
          </div>
        </div>

        <div className="form-group">
          <label className="label">Social Activities at Home</label>
          <select
            className={`input ${errors.social_activities_at_home ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.social_activities_at_home || ''}
            onChange={(e) => onInputChange('social_activities_at_home', e.target.value)}
            disabled={loading}
          >
            <option value="">Select preference</option>
            <option value="never">Prefer no social activities at home</option>
            <option value="rare">Rare occasions only (holidays, special events)</option>
            <option value="occasional">Occasional small gatherings (monthly)</option>
            <option value="regular">Regular but reasonable (weekly)</option>
            <option value="frequent">Frequent social activities welcome</option>
            <option value="recovery-focused">Recovery/support group meetings only</option>
          </select>
          {errors.social_activities_at_home && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.social_activities_at_home}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            How often you're comfortable with social gatherings or activities
          </div>
        </div>
      </div>

      {/* Daily Living Habits & Preferences */}
      <div className="card-header">
        <h4 className="card-title">Daily Living Habits & Activities</h4>
        <p className="card-subtitle">Your typical daily activities and preferences for shared spaces</p>
      </div>

      <div className="form-group mb-4">
        <div className="grid-2">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.early_riser || false}
              onChange={(e) => onInputChange('early_riser', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I'm an early riser (up before 7 AM)
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.night_owl || false}
              onChange={(e) => onInputChange('night_owl', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I'm a night owl (up after 11 PM regularly)
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.cooking_enthusiast || false}
              onChange={(e) => onInputChange('cooking_enthusiast', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I love cooking and use kitchen frequently
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.exercise_at_home || false}
              onChange={(e) => onInputChange('exercise_at_home', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I exercise or work out at home
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.plays_instruments || false}
              onChange={(e) => onInputChange('plays_instruments', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I play musical instruments
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.tv_streaming_regular || false}
              onChange={(e) => onInputChange('tv_streaming_regular', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              I watch TV/streaming regularly in common areas
            </span>
          </label>
        </div>
      </div>

      {/* Additional Daily Living Details */}
      <div className="form-group mb-4">
        <label className="label">Cooking Frequency</label>
        <select
          className={`input ${errors.cooking_frequency ? 'border-red-500 bg-red-50' : ''}`}
          value={formData.cooking_frequency || ''}
          onChange={(e) => onInputChange('cooking_frequency', e.target.value)}
          disabled={loading}
        >
          <option value="">Select frequency</option>
          <option value="never">Never cook at home</option>
          <option value="rarely">Rarely (1-2 times/week)</option>
          <option value="sometimes">Sometimes (3-4 times/week)</option>
          <option value="frequently">Frequently (5-6 times/week)</option>
          <option value="daily">Daily cooking</option>
        </select>
        {errors.cooking_frequency && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.cooking_frequency}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          How often you use the kitchen for meal preparation
        </div>
      </div>

      {/* Household Management Style */}
      <div className="card-header">
        <h4 className="card-title">Household Management & Communication</h4>
        <p className="card-subtitle">How you prefer to handle shared responsibilities and communication with roommates</p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Chore Sharing Style</label>
          <select
            className={`input ${errors.chore_sharing_style ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.chore_sharing_style || ''}
            onChange={(e) => onInputChange('chore_sharing_style', e.target.value)}
            disabled={loading}
          >
            <option value="">Select approach</option>
            <option value="formal-schedule">Formal chore schedule with rotating assignments</option>
            <option value="informal-sharing">Informal sharing - pitch in as needed</option>
            <option value="individual-responsibility">Each person handles their own areas</option>
            <option value="hire-help">Prefer to hire cleaning help for common areas</option>
            <option value="flexible-discussion">Flexible - discuss and adjust as needed</option>
          </select>
          {errors.chore_sharing_style && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.chore_sharing_style}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            How you prefer to manage household cleaning and maintenance
          </div>
        </div>

        <div className="form-group">
          <label className="label">Communication Style</label>
          <select
            className={`input ${errors.communication_style ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.communication_style || ''}
            onChange={(e) => onInputChange('communication_style', e.target.value)}
            disabled={loading}
          >
            <option value="">Select style</option>
            <option value="direct-verbal">Direct, in-person conversations</option>
            <option value="written-notes">Written notes or messages</option>
            <option value="group-meetings">Regular house meetings for important topics</option>
            <option value="casual-check-ins">Casual check-ins as things come up</option>
            <option value="minimal-communication">Minimal communication - respect privacy</option>
            <option value="app-based">App/text-based communication</option>
          </select>
          {errors.communication_style && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.communication_style}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            How you prefer to communicate about household matters and issues
          </div>
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Conflict Resolution Style</label>
        <select
          className={`input ${errors.conflict_resolution_style ? 'border-red-500 bg-red-50' : ''}`}
          value={formData.conflict_resolution_style || ''}
          onChange={(e) => onInputChange('conflict_resolution_style', e.target.value)}
          disabled={loading}
        >
          <option value="">Select approach</option>
          <option value="direct-communication">Direct, honest communication - address issues promptly</option>
          <option value="mediated-discussion">Prefer neutral third party to mediate discussions</option>
          <option value="written-communication">Written communication first, then discuss</option>
          <option value="cooling-off-period">Take time to cool off, then discuss when calm</option>
          <option value="avoid-conflict">Prefer to avoid conflict when possible</option>
          <option value="collaborative-problem-solving">Collaborative problem-solving approach</option>
        </select>
        {errors.conflict_resolution_style && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.conflict_resolution_style}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          How you prefer to handle disagreements or conflicts with roommates
        </div>
      </div>

      {/* Recovery-Supportive Environment Preferences */}
      <div className="form-group mb-4">
        <label className="label">Preferred Support Structure</label>
        <select
          className={`input ${errors.preferred_support_structure ? 'border-red-500 bg-red-50' : ''}`}
          value={formData.preferred_support_structure || ''}
          onChange={(e) => onInputChange('preferred_support_structure', e.target.value)}
          disabled={loading}
        >
          <option value="">Select preference</option>
          <option value="independent">Independent living with mutual respect</option>
          <option value="mutual-support">Mutual support and encouragement</option>
          <option value="structured-support">Structured support system with check-ins</option>
          <option value="close-community">Close-knit community feel</option>
          <option value="accountability-partners">Accountability partnership approach</option>
          <option value="recovery-focused">Recovery-focused household environment</option>
        </select>
        {errors.preferred_support_structure && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.preferred_support_structure}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          What kind of support structure works best for your recovery and daily life
        </div>
      </div>

      {/* Section Validation Status */}
      {sectionId && isActive && (
        <div className="section-status mt-6">
          <div className="card-header">
            <h4 className="card-title">Lifestyle Compatibility Status</h4>
          </div>
          
          <div className="grid-2 mb-4">
            <div>
              <strong>Core Compatibility Factors:</strong>
              <ul className="mt-2 text-sm">
                <li className={formData.work_schedule ? 'text-green-600' : 'text-red-600'}>
                  {formData.work_schedule ? '✓' : '✗'} Work Schedule
                </li>
                <li className={formData.social_level ? 'text-green-600' : 'text-red-600'}>
                  {formData.social_level ? '✓' : '✗'} Social Level ({formData.social_level || 'not set'})
                </li>
                <li className={formData.cleanliness_level ? 'text-green-600' : 'text-red-600'}>
                  {formData.cleanliness_level ? '✓' : '✗'} Cleanliness Level ({formData.cleanliness_level || 'not set'})
                </li>
                <li className={formData.noise_tolerance ? 'text-green-600' : 'text-red-600'}>
                  {formData.noise_tolerance ? '✓' : '✗'} Noise Tolerance ({formData.noise_tolerance || 'not set'})
                </li>
              </ul>
            </div>
            
            <div>
              <strong>Lifestyle Completion Score:</strong>
              <div className="mt-2">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${lifestyleCompletionScore}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {lifestyleCompletionScore}% complete
                </span>
              </div>
            </div>
          </div>

          {validationMessage && (
            <div className="alert alert-warning">
              <strong>Validation Note:</strong> {validationMessage}
            </div>
            )}
        </div>
      )}
    </>
  );
};

LifestylePreferencesSection.propTypes = {
  formData: PropTypes.shape({
    work_schedule: PropTypes.string,
    work_from_home_frequency: PropTypes.string,
    bedtime_preference: PropTypes.string,
    social_level: PropTypes.number,
    cleanliness_level: PropTypes.number,
    noise_tolerance: PropTypes.number,
    guests_policy: PropTypes.string,
    social_activities_at_home: PropTypes.string,
    early_riser: PropTypes.bool,
    night_owl: PropTypes.bool,
    cooking_enthusiast: PropTypes.bool,
    cooking_frequency: PropTypes.string,
    exercise_at_home: PropTypes.bool,
    plays_instruments: PropTypes.bool,
    tv_streaming_regular: PropTypes.bool,
    chore_sharing_style: PropTypes.string,
    communication_style: PropTypes.string,
    conflict_resolution_style: PropTypes.string,
    preferred_support_structure: PropTypes.string
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
  styles: PropTypes.object,
  fieldMapping: PropTypes.object,
  sectionId: PropTypes.string,
  isActive: PropTypes.bool,
  validationMessage: PropTypes.string
};

LifestylePreferencesSection.defaultProps = {
  profile: null,
  styles: {},
  fieldMapping: {},
  sectionId: 'lifestyle',
  isActive: false,
  validationMessage: null
};

export default LifestylePreferencesSection;