// src/components/features/matching/sections/RoommatePreferencesSection.js - FIXED FIELD MAPPING
import React from 'react';
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
  fieldMapping = {} // ✅ FIXED: Now properly use field mapping
}) => {
  // ✅ FIXED: Use standardized field names from mapping
  const genderPrefField = fieldMapping?.gender?.preference || 'preferred_roommate_gender';
  
  return (
    <>
      {/* Roommate Preferences Header */}
      <h3 className="card-title mb-4">Roommate Preferences</h3>
      
      <div className="alert alert-info mb-4">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>👥</span>
          Finding Your Ideal Roommate
        </h4>
        <p className="mb-0">
          These preferences help us match you with compatible roommates who will support your recovery journey 
          and create a positive living environment. Be as specific as you'd like - better matches lead to better outcomes.
        </p>
      </div>

      {/* Basic Roommate Demographics */}
      <div className="card-header">
        <h4 className="card-title">Basic Roommate Demographics</h4>
        <p className="card-subtitle">
          Core demographic preferences for your ideal roommate
        </p>
      </div>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Roommate Gender Preference <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors[genderPrefField] ? 'border-red-500' : ''}`}
            value={formData[genderPrefField] || ''}
            onChange={(e) => onInputChange(genderPrefField, e.target.value)}
            disabled={loading}
            required
          >
            {genderPreferenceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors[genderPrefField] && (
            <div className="text-red-500 mt-1 text-sm">{errors[genderPrefField]}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            This helps ensure comfort and safety for all roommates (stored as: {genderPrefField})
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">
            Your Smoking Status <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.smokingStatus ? 'border-red-500' : ''}`}
            value={formData.smokingStatus || ''}
            onChange={(e) => onInputChange('smokingStatus', e.target.value)}
            disabled={loading}
            required
          >
            {smokingStatusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.smokingStatus && (
            <div className="text-red-500 mt-1 text-sm">{errors.smokingStatus}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Important for house rules and roommate compatibility
          </div>
        </div>
      </div>

      {/* Age Range Preferences */}
      <div className="card-header">
        <h4 className="card-title">Age Range Preferences</h4>
        <p className="card-subtitle">
          What age range would you prefer for your roommate?
        </p>
      </div>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Minimum Age Preference</label>
          <select
            className="input"
            value={formData.ageRangeMin || 18}
            onChange={(e) => onInputChange('ageRangeMin', parseInt(e.target.value))}
            disabled={loading}
          >
            {Array.from({ length: 48 }, (_, i) => i + 18).map(age => (
              <option key={age} value={age}>{age} years old</option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Youngest age you'd be comfortable with
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Maximum Age Preference</label>
          <select
            className="input"
            value={formData.ageRangeMax || 65}
            onChange={(e) => onInputChange('ageRangeMax', parseInt(e.target.value))}
            disabled={loading}
          >
            {Array.from({ length: 48 }, (_, i) => i + 18).map(age => (
              <option key={age} value={age}>{age} years old</option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Oldest age you'd be comfortable with
          </div>
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Age Preference Flexibility</label>
        <select
          className="input"
          value={formData.ageFlexibility || ''}
          onChange={(e) => onInputChange('ageFlexibility', e.target.value)}
          disabled={loading}
        >
          <option value="">Select flexibility level</option>
          <option value="strict">Strict - only within my specified range</option>
          <option value="somewhat-flexible">Somewhat flexible - within 5 years of range</option>
          <option value="flexible">Flexible - age is not a major factor</option>
          <option value="no-preference">No preference - open to any age</option>
        </select>
        <div className="text-gray-500 mt-1 text-sm">
          More flexibility can increase your matching opportunities
        </div>
      </div>

      {/* Lifestyle Compatibility */}
      <div className="card-header">
        <h4 className="card-title">Lifestyle Compatibility</h4>
        <p className="card-subtitle">
          Preferences that affect daily living and house rules
        </p>
      </div>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Pet Preference for Roommates</label>
          <select
            className="input"
            value={formData.petPreference || ''}
            onChange={(e) => onInputChange('petPreference', e.target.value)}
            disabled={loading}
          >
            <option value="">No preference</option>
            <option value="no_pets">No pets preferred</option>
            <option value="ok_with_pets">OK with pets</option>
            <option value="prefer_pets">Prefer roommates with pets</option>
            <option value="cat_friendly">Cat-friendly only</option>
            <option value="dog_friendly">Dog-friendly only</option>
            <option value="small_pets_only">Small pets only (birds, fish, etc.)</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Your comfort level with roommates who have pets
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Smoking Preference for Roommates</label>
          <select
            className="input"
            value={formData.smokingPreference || ''}
            onChange={(e) => onInputChange('smokingPreference', e.target.value)}
            disabled={loading}
          >
            <option value="">No preference</option>
            <option value="non_smokers_only">Non-smokers only</option>
            <option value="outdoor_smokers_ok">Outdoor smokers OK</option>
            <option value="designated_area_ok">Designated smoking area OK</option>
            <option value="any_smoking_ok">Any smoking status OK</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Your preference for roommate smoking habits
          </div>
        </div>
      </div>

      {/* Recovery-Specific Preferences */}
      <div className="card-header">
        <h4 className="card-title">Recovery Journey Compatibility</h4>
        <p className="card-subtitle">
          Preferences related to recovery support and understanding
        </p>
      </div>

      <div className="form-group mb-4">
        <div className="grid-2">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.preferRecoveryExperience || false}
              onChange={(e) => onInputChange('preferRecoveryExperience', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Prefer roommates with recovery experience
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.supportiveOfRecovery || false}
              onChange={(e) => onInputChange('supportiveOfRecovery', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must be supportive of recovery lifestyle
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.substanceFreeRequired || false}
              onChange={(e) => onInputChange('substanceFreeRequired', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must maintain substance-free home
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.respectPrivacy || false}
              onChange={(e) => onInputChange('respectPrivacy', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must respect recovery privacy/boundaries
            </span>
          </label>
        </div>
      </div>

      {/* Social & Living Style Preferences */}
      <div className="card-header">
        <h4 className="card-title">Social & Living Style Preferences</h4>
        <p className="card-subtitle">
          How you prefer to interact and live with roommates
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Social Interaction Preference</label>
          <select
            className="input"
            value={formData.socialInteractionLevel || ''}
            onChange={(e) => onInputChange('socialInteractionLevel', e.target.value)}
            disabled={loading}
          >
            <option value="">No preference</option>
            <option value="minimal">Minimal interaction - respectful but private</option>
            <option value="friendly">Friendly - occasional conversations and check-ins</option>
            <option value="social">Social - regular interaction and shared activities</option>
            <option value="close-friends">Close friends - like family, very involved</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            How much interaction you want with roommates
          </div>
        </div>

        <div className="form-group">
          <label className="label">Conflict Resolution Style</label>
          <select
            className="input"
            value={formData.conflictResolutionStyle || ''}
            onChange={(e) => onInputChange('conflictResolutionStyle', e.target.value)}
            disabled={loading}
          >
            <option value="">No preference</option>
            <option value="direct-communication">Direct, honest communication</option>
            <option value="mediated-discussion">Prefer mediated discussions</option>
            <option value="written-communication">Written communication first</option>
            <option value="avoid-conflict">Prefer to avoid conflict</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            How you prefer to handle disagreements
          </div>
        </div>
      </div>

      {/* Additional Compatibility Factors */}
      <div className="form-group mb-4">
        <label className="label">Additional Compatibility Preferences</label>
        <div className="grid-2 mt-3">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.similarSchedules || false}
              onChange={(e) => onInputChange('similarSchedules', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Prefer similar daily schedules
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.sharedChores || false}
              onChange={(e) => onInputChange('sharedChores', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Willing to share household chores
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.financiallyStable || false}
              onChange={(e) => onInputChange('financiallyStable', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must be financially stable/reliable
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.respectfulGuests || false}
              onChange={(e) => onInputChange('respectfulGuests', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must be respectful about guests
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.lgbtqFriendly || false}
              onChange={(e) => onInputChange('lgbtqFriendly', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must be LGBTQ+ friendly
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.culturallySensitive || false}
              onChange={(e) => onInputChange('culturallySensitive', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Must be culturally sensitive/respectful
            </span>
          </label>
        </div>
      </div>

      {/* Deal Breakers */}
      <div className="card-header">
        <h4 className="card-title">Absolute Deal Breakers</h4>
        <p className="card-subtitle">
          What behaviors or situations would be completely unacceptable?
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">Deal Breakers</label>
        <div className="grid-2 mt-3">
          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.dealBreakerSubstanceUse || false}
              onChange={(e) => onInputChange('dealBreakerSubstanceUse', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Any substance use in the home
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.dealBreakerLoudness || false}
              onChange={(e) => onInputChange('dealBreakerLoudness', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Excessive noise/parties
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.dealBreakerUncleanliness || false}
              onChange={(e) => onInputChange('dealBreakerUncleanliness', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Poor hygiene/cleanliness
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.dealBreakerFinancialIssues || false}
              onChange={(e) => onInputChange('dealBreakerFinancialIssues', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Unreliable with rent/bills
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.dealBreakerPets || false}
              onChange={(e) => onInputChange('dealBreakerPets', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Any pets in the home
            </span>
          </label>

          <label className={styles.checkboxLabel || 'checkbox-item'}>
            <input
              type="checkbox"
              checked={formData.dealBreakerSmoking || false}
              onChange={(e) => onInputChange('dealBreakerSmoking', e.target.checked)}
              disabled={loading}
            />
            <span className={styles.checkboxText || ''}>
              Any smoking (including outside)
            </span>
          </label>
        </div>
      </div>

      {/* Matching Strategy Notice */}
      <div className="alert alert-success">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🎯</span>
          Smart Matching Strategy
        </h4>
        <p className="mb-2">
          <strong>Pro tip:</strong> Being specific about your preferences helps us find better matches, but too many 
          requirements can limit your options.
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li><strong>Must-haves:</strong> Recovery support, safety, basic respect</li>
          <li><strong>Preferences:</strong> Age, lifestyle, social interaction level</li>
          <li><strong>Nice-to-haves:</strong> Shared interests, similar schedules</li>
        </ul>
        <p className="text-sm">
          Our matching algorithm balances your preferences with compatibility factors to suggest the best possible roommates.
        </p>
      </div>
    </>
  );
};

RoommatePreferencesSection.propTypes = {
  formData: PropTypes.shape({
    preferred_roommate_gender: PropTypes.string, // ✅ FIXED: Now matches database
    smokingStatus: PropTypes.string,
    ageRangeMin: PropTypes.number,
    ageRangeMax: PropTypes.number,
    ageFlexibility: PropTypes.string,
    petPreference: PropTypes.string,
    smokingPreference: PropTypes.string,
    preferRecoveryExperience: PropTypes.bool,
    supportiveOfRecovery: PropTypes.bool,
    substanceFreeRequired: PropTypes.bool,
    respectPrivacy: PropTypes.bool,
    socialInteractionLevel: PropTypes.string,
    conflictResolutionStyle: PropTypes.string,
    similarSchedules: PropTypes.bool,
    sharedChores: PropTypes.bool,
    financiallyStable: PropTypes.bool,
    respectfulGuests: PropTypes.bool,
    lgbtqFriendly: PropTypes.bool,
    culturallySensitive: PropTypes.bool,
    dealBreakerSubstanceUse: PropTypes.bool,
    dealBreakerLoudness: PropTypes.bool,
    dealBreakerUncleanliness: PropTypes.bool,
    dealBreakerFinancialIssues: PropTypes.bool,
    dealBreakerPets: PropTypes.bool,
    dealBreakerSmoking: PropTypes.bool
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
  fieldMapping: PropTypes.object // ✅ FIXED: Now properly documented
};

RoommatePreferencesSection.defaultProps = {
  profile: null,
  styles: {},
  fieldMapping: {} // ✅ FIXED: Default empty object
};

export default RoommatePreferencesSection;