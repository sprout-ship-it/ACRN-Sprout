// src/components/features/matching/sections/RoommatePreferencesSection.js - FULLY ALIGNED WITH NEW SCHEMA
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  genderPreferenceOptions,
  smokingStatusOptions
} from '../constants/matchingFormConstants';

const RoommatePreferencesSection = ({
  formData,
  errors,
  loading,
  profile,
  onInputChange,
  onArrayChange,
  onRangeChange,
  styles = {},
  fieldMapping,   // Schema field mapping from parent
  sectionId,      // Section identifier
  isActive,       // Whether this section is currently active
  validationMessage // Current validation message
}) => {
  // Enhanced smoking preference options
  const smokingPreferenceOptions = useMemo(() => [
    { value: '', label: 'No preference' },
    { value: 'non_smokers_only', label: 'Non-smokers only' },
    { value: 'outdoor_smokers_ok', label: 'Outdoor smokers acceptable' },
    { value: 'designated_area_ok', label: 'Designated smoking area OK' },
    { value: 'any_smoking_ok', label: 'Any smoking status acceptable' }
  ], []);

  // Pet preference options
  const petPreferenceOptions = useMemo(() => [
    { value: '', label: 'No preference' },
    { value: 'no_pets', label: 'No pets preferred' },
    { value: 'ok_with_pets', label: 'OK with pets' },
    { value: 'prefer_pets', label: 'Prefer roommates with pets' },
    { value: 'cat_friendly', label: 'Cat-friendly only' },
    { value: 'dog_friendly', label: 'Dog-friendly only' },
    { value: 'small_pets_only', label: 'Small pets only (birds, fish, etc.)' }
  ], []);

  // Validate age range
  const validateAgeRange = useCallback(() => {
    const minAge = parseInt(formData.age_range_min) || 18;
    const maxAge = parseInt(formData.age_range_max) || 65;
    
    if (minAge > maxAge) {
      return 'Minimum age cannot be higher than maximum age';
    }
    if (minAge < 18) {
      return 'Minimum age must be at least 18';
    }
    if (maxAge > 100) {
      return 'Maximum age cannot exceed 100';
    }
    if (maxAge - minAge > 50) {
      return 'Age range span seems very wide - consider narrowing for better matches';
    }
    return null;
  }, [formData.age_range_min, formData.age_range_max]);

  // Count selected preferences for completion tracking
  const countSelectedPreferences = useCallback(() => {
    let count = 0;
    if (formData.preferred_roommate_gender) count++;
    if (formData.smoking_status) count++;
    if (formData.age_range_min && formData.age_range_max) count++;
    if (formData.pet_preference) count++;
    if (formData.smoking_preference) count++;
    return count;
  }, [formData]);

  const ageRangeError = validateAgeRange();
  const preferencesCount = countSelectedPreferences();

  return (
    <>
      {/* Roommate Preferences Header */}
      <div className="section-intro">
        <h3 className="card-title mb-4">Roommate Preferences</h3>
        <div className="alert alert-info mb-4">
          <h4 className="mb-2">
            <span style={{ marginRight: '8px' }}>👥</span>
            Smart Roommate Compatibility Matching
          </h4>
          <p className="mb-0">
            These preferences help our enhanced matching algorithm find compatible roommates who will support 
            your recovery journey and create a positive living environment. Be specific about your needs while 
            remaining open to great matches.
          </p>
        </div>
      </div>

      {/* Essential Demographics - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Essential Roommate Demographics</h4>
        <p className="card-subtitle">Core demographic preferences that affect safety, comfort, and compatibility</p>
      </div>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Roommate Gender Preference <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.preferred_roommate_gender ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.preferred_roommate_gender || ''}
            onChange={(e) => onInputChange('preferred_roommate_gender', e.target.value)}
            disabled={loading}
            required
          >
            {genderPreferenceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.preferred_roommate_gender && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.preferred_roommate_gender}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            This ensures comfort and safety for all roommates in shared living spaces
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">
            Your Smoking Status <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.smoking_status ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.smoking_status || ''}
            onChange={(e) => onInputChange('smoking_status', e.target.value)}
            disabled={loading}
            required
          >
            {smokingStatusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.smoking_status && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.smoking_status}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Important for house rules and health considerations
          </div>
        </div>
      </div>

      {/* Gender Inclusivity Option */}
      <div className="form-group mb-4">
        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.gender_inclusive || false}
            onChange={(e) => onInputChange('gender_inclusive', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            I'm open to gender-inclusive housing arrangements
          </span>
        </label>
        <div className="text-gray-500 mt-1 text-sm">
          Open to roommates of all gender identities and expressions, regardless of your primary preference
        </div>
      </div>

      {/* Age Range Preferences - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Age Range Preferences</h4>
        <p className="card-subtitle">What age range would work best for your living situation?</p>
      </div>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Minimum Age Preference</label>
          <select
            className={`input ${errors.age_range_min ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.age_range_min || 18}
            onChange={(e) => onInputChange('age_range_min', parseInt(e.target.value))}
            disabled={loading}
          >
            {Array.from({ length: 48 }, (_, i) => i + 18).map(age => (
              <option key={age} value={age}>{age} years old</option>
            ))}
          </select>
          {errors.age_range_min && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.age_range_min}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Youngest age you'd be comfortable living with
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Maximum Age Preference</label>
          <select
            className={`input ${errors.age_range_max ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.age_range_max || 65}
            onChange={(e) => onInputChange('age_range_max', parseInt(e.target.value))}
            disabled={loading}
          >
            {Array.from({ length: 48 }, (_, i) => i + 18).map(age => (
              <option key={age} value={age}>{age} years old</option>
            ))}
          </select>
          {errors.age_range_max && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.age_range_max}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Oldest age you'd be comfortable living with
          </div>
        </div>
      </div>

      {/* Age Range Validation and Display */}
      {ageRangeError && (
        <div className="alert alert-warning mb-4">
          <span className="alert-icon">⚠️</span>
          <strong>Age Range Issue:</strong> {ageRangeError}
        </div>
      )}

      {formData.age_range_min && formData.age_range_max && !ageRangeError && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="text-blue-800 font-medium">
            Preferred Age Range: {formData.age_range_min} - {formData.age_range_max} years old
          </div>
          <div className="text-blue-600 text-sm mt-1">
            Range span: {formData.age_range_max - formData.age_range_min} years - 
            {formData.age_range_max - formData.age_range_min <= 20 ? ' Good range for compatibility' : ' Consider narrowing for better matches'}
          </div>
        </div>
      )}

      <div className="form-group mb-4">
        <label className="label">Age Preference Flexibility</label>
        <select
          className={`input ${errors.age_flexibility ? 'border-red-500 bg-red-50' : ''}`}
          value={formData.age_flexibility || ''}
          onChange={(e) => onInputChange('age_flexibility', e.target.value)}
          disabled={loading}
        >
          <option value="">Select flexibility level</option>
          <option value="strict">Strict - only within my specified range</option>
          <option value="somewhat-flexible">Somewhat flexible - within 5 years of range</option>
          <option value="flexible">Flexible - age is not a major factor</option>
          <option value="no-preference">No preference - open to any adult age</option>
        </select>
        {errors.age_flexibility && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.age_flexibility}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          More flexibility increases your matching opportunities
        </div>
      </div>

      {/* Lifestyle Compatibility Preferences - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Lifestyle Compatibility</h4>
        <p className="card-subtitle">Preferences that affect daily living, house rules, and lifestyle alignment</p>
      </div>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Pet Preference for Roommates</label>
          <select
            className={`input ${errors.pet_preference ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.pet_preference || ''}
            onChange={(e) => onInputChange('pet_preference', e.target.value)}
            disabled={loading}
          >
            {petPreferenceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.pet_preference && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.pet_preference}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Your comfort level with roommates who have pets
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Smoking Preference for Roommates</label>
          <select
            className={`input ${errors.smoking_preference ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.smoking_preference || ''}
            onChange={(e) => onInputChange('smoking_preference', e.target.value)}
            disabled={loading}
          >
            {smokingPreferenceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.smoking_preference && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.smoking_preference}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Your preference for roommate smoking habits
          </div>
        </div>
      </div>

      {/* Recovery-Specific Compatibility - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Recovery Journey Compatibility</h4>
        <p className="card-subtitle">Preferences related to recovery support, understanding, and living environment</p>
      </div>

      <div className="form-group mb-4">
        <div className="grid-2">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.prefer_recovery_experience || false}
              onChange={(e) => onInputChange('prefer_recovery_experience', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Prefer roommates with recovery experience
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.supportive_of_recovery || false}
              onChange={(e) => onInputChange('supportive_of_recovery', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must be supportive of recovery lifestyle
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.substance_free_home_required || false}
              onChange={(e) => onInputChange('substance_free_home_required', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Require completely substance-free home
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.respect_privacy || false}
              onChange={(e) => onInputChange('respect_privacy', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must respect recovery privacy and boundaries
            </span>
          </label>
        </div>
      </div>

      {/* Social & Living Style Preferences - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Social & Communication Preferences</h4>
        <p className="card-subtitle">How you prefer to interact and communicate with roommates</p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Social Interaction Preference</label>
          <select
            className={`input ${errors.social_interaction_level ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.social_interaction_level || ''}
            onChange={(e) => onInputChange('social_interaction_level', e.target.value)}
            disabled={loading}
          >
            <option value="">Select interaction level</option>
            <option value="minimal">Minimal - Respectful but private lifestyle</option>
            <option value="friendly">Friendly - Occasional conversations and check-ins</option>
            <option value="social">Social - Regular interaction and some shared activities</option>
            <option value="close-friends">Close friends - Very involved, like family</option>
          </select>
          {errors.social_interaction_level && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.social_interaction_level}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            How much day-to-day interaction you want with roommates
          </div>
        </div>

        <div className="form-group">
          <label className="label">Conflict Resolution Preference</label>
          <select
            className={`input ${errors.conflict_resolution_style ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.conflict_resolution_style || ''}
            onChange={(e) => onInputChange('conflict_resolution_style', e.target.value)}
            disabled={loading}
          >
            <option value="">Select resolution style</option>
            <option value="direct-communication">Direct, honest communication</option>
            <option value="mediated-discussion">Prefer mediated discussions</option>
            <option value="written-communication">Written communication first</option>
            <option value="avoid-conflict">Prefer to avoid conflict when possible</option>
            <option value="collaborative-problem-solving">Collaborative problem-solving approach</option>
          </select>
          {errors.conflict_resolution_style && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.conflict_resolution_style}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Your preferred approach for handling disagreements
          </div>
        </div>
      </div>

      {/* Compatibility Factors - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Additional Compatibility Preferences</h4>
        <p className="card-subtitle">Other factors that contribute to a harmonious living arrangement</p>
      </div>

      <div className="form-group mb-4">
        <div className="grid-2">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.similar_schedules || false}
              onChange={(e) => onInputChange('similar_schedules', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Prefer similar daily schedules
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.shared_chores || false}
              onChange={(e) => onInputChange('shared_chores', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Willing to share household chores/cleaning
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.financially_stable || false}
              onChange={(e) => onInputChange('financially_stable', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must be financially stable and reliable
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.respectful_guests || false}
              onChange={(e) => onInputChange('respectful_guests', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must be respectful about guests and visitors
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.lgbtq_friendly || false}
              onChange={(e) => onInputChange('lgbtq_friendly', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must be LGBTQ+ friendly and inclusive
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.culturally_sensitive || false}
              onChange={(e) => onInputChange('culturally_sensitive', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must be culturally sensitive and respectful
            </span>
          </label>
        </div>
      </div>

      {/* Absolute Deal Breakers - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Absolute Deal Breakers</h4>
        <p className="card-subtitle">
          What behaviors or situations would be completely unacceptable for your living arrangement?
        </p>
      </div>

      <div className="form-group mb-4">
        <div className="text-gray-500 mb-3 text-sm">
          Select any behaviors that would be deal breakers for you. Being clear about boundaries helps ensure better long-term compatibility.
        </div>
        
        <div className="grid-2">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.deal_breaker_substance_use || false}
              onChange={(e) => onInputChange('deal_breaker_substance_use', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Any substance use in the home
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.deal_breaker_loudness || false}
              onChange={(e) => onInputChange('deal_breaker_loudness', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Excessive noise, parties, or disruptive behavior
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.deal_breaker_uncleanliness || false}
              onChange={(e) => onInputChange('deal_breaker_uncleanliness', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Poor hygiene or extreme messiness
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.deal_breaker_financial_issues || false}
              onChange={(e) => onInputChange('deal_breaker_financial_issues', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Unreliable with rent, bills, or financial commitments
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.deal_breaker_pets || false}
              onChange={(e) => onInputChange('deal_breaker_pets', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Any pets in the home (allergies, phobias, etc.)
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.deal_breaker_smoking || false}
              onChange={(e) => onInputChange('deal_breaker_smoking', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Any smoking (including outside/designated areas)
            </span>
          </label>
        </div>
      </div>

      {/* Section Validation Status */}
      {sectionId && isActive && (
        <div className="section-status mt-6">
          <div className="card-header">
            <h4 className="card-title">Section Validation Status</h4>
          </div>
          
          <div className="grid-2 mb-4">
            <div>
              <strong>Required Fields:</strong>
              <ul className="mt-2 text-sm">
                <li className={formData.preferred_roommate_gender ? 'text-green-600' : 'text-red-600'}>
                  {formData.preferred_roommate_gender ? '✓' : '✗'} Gender Preference
                </li>
                <li className={formData.smoking_status ? 'text-green-600' : 'text-red-600'}>
                  {formData.smoking_status ? '✓' : '✗'} Smoking Status
                </li>
              </ul>
            </div>
            
            <div>
              <strong>Preference Completeness:</strong>
              <div className="mt-2">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.round((preferencesCount / 5) * 100)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {preferencesCount}/5 key preferences specified
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

      {/* Smart Matching Information */}
      <div className="alert alert-info mt-6">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🎯</span>
          Smart Roommate Matching Strategy
        </h4>
        <p className="mb-2">
          <strong>Our enhanced matching algorithm balances:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li><strong>Essential Compatibility:</strong> Gender preferences, smoking status, recovery support needs</li>
          <li><strong>Lifestyle Alignment:</strong> Social interaction levels, communication styles, daily routines</li>
          <li><strong>Boundary Respect:</strong> Deal breakers and non-negotiable requirements</li>
          <li><strong>Growth Potential:</strong> Mutual support for recovery and personal development</li>
          <li><strong>Flexibility Balance:</strong> Matching specificity with opportunity expansion</li>
        </ul>
        <div className="mt-3">
          <a 
            href="/help/roommate-compatibility-matching" 
            target="_blank" 
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Learn more about our compatibility matching algorithm →
          </a>
        </div>
      </div>

      {/* Roommate Selection Tips */}
      <div className="alert alert-success mt-4">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>💡</span>
          Effective Roommate Preference Tips
        </h4>
        <p className="mb-2">
          <strong>Optimizing your roommate preferences:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li><strong>Prioritize Essentials:</strong> Focus on must-haves for safety, recovery support, and basic respect</li>
          <li><strong>Be Realistic:</strong> Too many requirements can limit good matches - focus on what truly matters</li>
          <li><strong>Recovery First:</strong> Prioritize roommates who understand and support your recovery journey</li>
          <li><strong>Communication Style:</strong> Matching communication preferences prevents most conflicts</li>
          <li><strong>Growth Mindset:</strong> Consider roommates who share your commitment to personal development</li>
          <li><strong>Flexibility Value:</strong> Some preferences can be compromised if the overall fit is strong</li>
        </ul>
        <p className="text-sm">
          The best roommate matches balance your essential needs with mutual respect, support, and the potential 
          for positive shared experiences that enhance both of your recovery journeys.
        </p>
      </div>
    </>
  );
};

RoommatePreferencesSection.propTypes = {
  formData: PropTypes.shape({
    // Essential demographics - schema standardized
    preferred_roommate_gender: PropTypes.string,          // Required - standardized
    smoking_status: PropTypes.string,                     // Required - standardized
    gender_inclusive: PropTypes.bool,                     // Optional - standardized
    
    // Age preferences - schema standardized
    age_range_min: PropTypes.number,                      // Optional - standardized
    age_range_max: PropTypes.number,                      // Optional - standardized
    age_flexibility: PropTypes.string,                    // Optional - standardized
    
    // Lifestyle compatibility - schema standardized
    pet_preference: PropTypes.string,                     // Optional - standardized
    smoking_preference: PropTypes.string,                 // Optional - standardized
    
    // Recovery compatibility - schema standardized
    prefer_recovery_experience: PropTypes.bool,           // Optional - standardized
    supportive_of_recovery: PropTypes.bool,               // Optional - standardized
    substance_free_home_required: PropTypes.bool,         // Optional - standardized
    respect_privacy: PropTypes.bool,                      // Optional - standardized
    
    // Social preferences - schema standardized
    social_interaction_level: PropTypes.string,           // Optional - standardized
    conflict_resolution_style: PropTypes.string,          // Optional - standardized
    
    // Additional compatibility - schema standardized
    similar_schedules: PropTypes.bool,                    // Optional - standardized
    shared_chores: PropTypes.bool,                        // Optional - standardized
    financially_stable: PropTypes.bool,                   // Optional - standardized
    respectful_guests: PropTypes.bool,                    // Optional - standardized
    lgbtq_friendly: PropTypes.bool,                       // Optional - standardized
    culturally_sensitive: PropTypes.bool,                 // Optional - standardized
    
    // Deal breakers - schema standardized
    deal_breaker_substance_use: PropTypes.bool,           // Optional - standardized
    deal_breaker_loudness: PropTypes.bool,                // Optional - standardized
    deal_breaker_uncleanliness: PropTypes.bool,           // Optional - standardized
    deal_breaker_financial_issues: PropTypes.bool,        // Optional - standardized
    deal_breaker_pets: PropTypes.bool,                    // Optional - standardized
    deal_breaker_smoking: PropTypes.bool                  // Optional - standardized
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
  styles: PropTypes.object,                           // CSS module styles
  fieldMapping: PropTypes.object,                     // Schema field mapping
  sectionId: PropTypes.string,                        // Section identifier
  isActive: PropTypes.bool,                           // Whether section is active
  validationMessage: PropTypes.string                 // Current validation message
};

RoommatePreferencesSection.defaultProps = {
  profile: null,
  styles: {},
  fieldMapping: {},
  sectionId: 'roommate',
  isActive: false,
  validationMessage: null
};

export default RoommatePreferencesSection;