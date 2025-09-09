// src/components/forms/sections/RoommatePreferencesSection.js
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
  profile,      // Added for interface consistency
  onInputChange,
  onArrayChange, // Added for interface consistency
  onRangeChange  // Added for interface consistency
}) => {
  return (
    <>
      {/* Personal Preferences & Demographics */}
      <h3 className="card-title mb-4">Roommate Preferences</h3>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Roommate Gender Preference <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.preferredRoommateGender ? 'border-red-500' : ''}`}
            value={formData.preferredRoommateGender}
            onChange={(e) => onInputChange('preferredRoommateGender', e.target.value)}
            disabled={loading}
            required
          >
            {genderPreferenceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.preferredRoommateGender && (
            <div className="text-red-500 mt-1">{errors.preferredRoommateGender}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            This helps us match you with compatible roommates
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">
            Your Smoking Status <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.smokingStatus ? 'border-red-500' : ''}`}
            value={formData.smokingStatus}
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
            <div className="text-red-500 mt-1">{errors.smokingStatus}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Important for roommate compatibility and house rules
          </div>
        </div>
      </div>

      {/* Age Range Preferences */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Preferred Age Range - Minimum</label>
          <select
            className="input"
            value={formData.ageRangeMin}
            onChange={(e) => onInputChange('ageRangeMin', parseInt(e.target.value))}
            disabled={loading}
          >
            {Array.from({ length: 48 }, (_, i) => i + 18).map(age => (
              <option key={age} value={age}>{age} years old</option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Minimum age for potential roommates
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Preferred Age Range - Maximum</label>
          <select
            className="input"
            value={formData.ageRangeMax}
            onChange={(e) => onInputChange('ageRangeMax', parseInt(e.target.value))}
            disabled={loading}
          >
            {Array.from({ length: 48 }, (_, i) => i + 18).map(age => (
              <option key={age} value={age}>{age} years old</option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Maximum age for potential roommates
          </div>
        </div>
      </div>

      {/* Additional Preferences */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Pet Preference</label>
          <select
            className="input"
            value={formData.petPreference}
            onChange={(e) => onInputChange('petPreference', e.target.value)}
            disabled={loading}
          >
            <option value="">No preference</option>
            <option value="no_pets">No pets preferred</option>
            <option value="ok_with_pets">OK with pets</option>
            <option value="prefer_pets">Prefer roommates with pets</option>
            <option value="cat_friendly">Cat-friendly</option>
            <option value="dog_friendly">Dog-friendly</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Your preference for roommates with pets
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Smoking Preference for Roommates</label>
          <select
            className="input"
            value={formData.smokingPreference}
            onChange={(e) => onInputChange('smokingPreference', e.target.value)}
            disabled={loading}
          >
            <option value="">No preference</option>
            <option value="non_smokers_only">Non-smokers only</option>
            <option value="outdoor_smokers_ok">Outdoor smokers OK</option>
            <option value="any_smoking_ok">Any smoking status OK</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Your preference for roommate smoking habits
          </div>
        </div>
      </div>

      {/* Gender Preference Context */}
      <div className="form-group mb-4">
        <label className="label">General Gender Preference</label>
        <select
          className="input"
          value={formData.genderPreference}
          onChange={(e) => onInputChange('genderPreference', e.target.value)}
          disabled={loading}
        >
          <option value="">No preference</option>
          <option value="no_preference">No preference</option>
          <option value="same_gender">Same gender as me</option>
          <option value="different_gender">Different gender from me</option>
          <option value="women_only">Women only</option>
          <option value="men_only">Men only</option>
          <option value="non_binary_friendly">Non-binary friendly</option>
        </select>
        <div className="text-gray-500 mt-1 text-sm">
          Additional context for gender preferences beyond the main setting
        </div>
      </div>
    </>
  );
};

RoommatePreferencesSection.propTypes = {
  formData: PropTypes.shape({
    preferredRoommateGender: PropTypes.string.isRequired,
    smokingStatus: PropTypes.string.isRequired,
    ageRangeMin: PropTypes.number.isRequired,
    ageRangeMax: PropTypes.number.isRequired,
    petPreference: PropTypes.string,
    smokingPreference: PropTypes.string,
    genderPreference: PropTypes.string
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
  onRangeChange: PropTypes.func.isRequired  // Added for interface consistency
};

RoommatePreferencesSection.defaultProps = {
  profile: null
};

export default RoommatePreferencesSection;