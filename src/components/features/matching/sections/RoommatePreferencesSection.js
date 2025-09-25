// src/components/features/matching/sections/RoommatePreferencesSection.js - FIXED WITH STANDARDIZED FIELD NAMES
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
  styles = {}
}) => {
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

      {/* Basic Roommate Demographics - FIXED: Using standardized field names */}
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
            className={`input ${errors.preferred_roommate_gender ? 'border-red-500' : ''}`}
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
            <div className="text-red-500 mt-1 text-sm">{errors.preferred_roommate_gender}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            This helps ensure comfort and safety for all roommates
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">
            Your Smoking Status <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.smoking_status ? 'border-red-500' : ''}`}
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
            <div className="text-red-500 mt-1 text-sm">{errors.smoking_status}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Important for house rules and roommate compatibility
          </div>
        </div>
      </div>

      {/* Gender Inclusivity */}
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
          Open to roommates of all gender identities and expressions
        </div>
      </div>

      {/* Age Range Preferences - FIXED: Using standardized field names */}
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
            value={formData.age_range_min || 18}
            onChange={(e) => onInputChange('age_range_min', parseInt(e.target.value))}
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
            value={formData.age_range_max || 65}
            onChange={(e) => onInputChange('age_range_max', parseInt(e.target.value))}
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
          value={formData.age_flexibility || ''}
          onChange={(e) => onInputChange('age_flexibility', e.target.value)}
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

      {/* Lifestyle Compatibility - FIXED: Using standardized field names */}
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
            value={formData.pet_preference || ''}
            onChange={(e) => onInputChange('pet_preference', e.target.value)}
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
            value={formData.smoking_preference || ''}
            onChange={(e) => onInputChange('smoking_preference', e.target.value)}
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

      {/* Recovery-Specific Preferences - FIXED: Using standardized field names */}
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
              Must maintain substance-free home
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
              Must respect recovery privacy/boundaries
            </span>
          </label>
        </div>
      </div>

      {/* Social & Living Style Preferences - FIXED: Using standardized field names */}
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
            value={formData.social_interaction_level || ''}
            onChange={(e) => onInputChange('social_interaction_level', e.target.value)}
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
            value={formData.conflict_resolution_style || ''}
            onChange={(e) => onInputChange('conflict_resolution_style', e.target.value)}
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

      {/* Additional Compatibility Factors - FIXED: Using standardized field names */}
      <div className="form-group mb-4">
        <label className="label">Additional Compatibility Preferences</label>
        <div className="grid-2 mt-3">
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
              Willing to share household chores
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
              Must be financially stable/reliable
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
              Must be respectful about guests
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
              Must be LGBTQ+ friendly
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
              Must be culturally sensitive/respectful
            </span>
          </label>
        </div>
      </div>

      {/* Deal Breakers - FIXED: Using standardized field names */}
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
              Excessive noise/parties
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
              Poor hygiene/cleanliness
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
              Unreliable with rent/bills
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
              Any pets in the home
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
    preferred_roommate_gender: PropTypes.string,          // Already standardized
    smoking_status: PropTypes.string,                     // FIXED: Standardized
    gender_inclusive: PropTypes.bool,                     // FIXED: Standardized
    age_range_min: PropTypes.number,                      // FIXED: Standardized
    age_range_max: PropTypes.number,                      // FIXED: Standardized
    age_flexibility: PropTypes.string,                    // FIXED: Standardized
    pet_preference: PropTypes.string,                     // FIXED: Standardized
    smoking_preference: PropTypes.string,                 // FIXED: Standardized
    prefer_recovery_experience: PropTypes.bool,           // FIXED: Standardized
    supportive_of_recovery: PropTypes.bool,               // FIXED: Standardized
    substance_free_required: PropTypes.bool,              // FIXED: Standardized
    respect_privacy: PropTypes.bool,                      // FIXED: Standardized
    social_interaction_level: PropTypes.string,           // FIXED: Standardized
    conflict_resolution_style: PropTypes.string,          // FIXED: Standardized
    similar_schedules: PropTypes.bool,                    // FIXED: Standardized
    shared_chores: PropTypes.bool,                        // FIXED: Standardized
    financially_stable: PropTypes.bool,                   // FIXED: Standardized
    respectful_guests: PropTypes.bool,                    // FIXED: Standardized
    lgbtq_friendly: PropTypes.bool,                       // FIXED: Standardized
    culturally_sensitive: PropTypes.bool,                 // FIXED: Standardized
    deal_breaker_substance_use: PropTypes.bool,           // FIXED: Standardized
    deal_breaker_loudness: PropTypes.bool,                // FIXED: Standardized
    deal_breaker_uncleanliness: PropTypes.bool,           // FIXED: Standardized
    deal_breaker_financial_issues: PropTypes.bool,        // FIXED: Standardized
    deal_breaker_pets: PropTypes.bool,                    // FIXED: Standardized
    deal_breaker_smoking: PropTypes.bool                  // FIXED: Standardized
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

RoommatePreferencesSection.defaultProps = {
  profile: null,
  styles: {}
};

export default RoommatePreferencesSection;