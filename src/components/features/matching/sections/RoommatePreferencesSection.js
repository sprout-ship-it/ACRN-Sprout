// src/components/features/matching/sections/RoommatePreferencesSection.js - PRODUCTION READY
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
  fieldMapping,
  sectionId,
  isActive,
  validationMessage
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
            These preferences help our matching algorithm find compatible roommates who will support 
            your recovery journey and create a positive living environment.
          </p>
        </div>
      </div>

      {/* Essential Demographics */}
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

      {/* Age Range Preferences */}
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

      {/* Lifestyle Compatibility Preferences */}
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

      {/* Recovery-Specific Compatibility */}
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

      {/* Additional Compatibility Preferences */}
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

      {/* Absolute Deal Breakers */}
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
    </>
  );
};

RoommatePreferencesSection.propTypes = {
  formData: PropTypes.shape({
    preferred_roommate_gender: PropTypes.string,
    smoking_status: PropTypes.string,
    gender_inclusive: PropTypes.bool,
    age_range_min: PropTypes.number,
    age_range_max: PropTypes.number,
    age_flexibility: PropTypes.string,
    pet_preference: PropTypes.string,
    smoking_preference: PropTypes.string,
    prefer_recovery_experience: PropTypes.bool,
    supportive_of_recovery: PropTypes.bool,
    substance_free_home_required: PropTypes.bool,
    respect_privacy: PropTypes.bool,
    similar_schedules: PropTypes.bool,
    shared_chores: PropTypes.bool,
    financially_stable: PropTypes.bool,
    respectful_guests: PropTypes.bool,
    lgbtq_friendly: PropTypes.bool,
    culturally_sensitive: PropTypes.bool,
    deal_breaker_substance_use: PropTypes.bool,
    deal_breaker_loudness: PropTypes.bool,
    deal_breaker_uncleanliness: PropTypes.bool,
    deal_breaker_financial_issues: PropTypes.bool,
    deal_breaker_pets: PropTypes.bool,
    deal_breaker_smoking: PropTypes.bool
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

RoommatePreferencesSection.defaultProps = {
  profile: null,
  styles: {},
  fieldMapping: {},
  sectionId: 'roommate',
  isActive: false,
  validationMessage: null
};

export default RoommatePreferencesSection;