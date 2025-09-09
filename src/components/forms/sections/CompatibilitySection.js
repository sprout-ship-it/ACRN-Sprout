// src/components/forms/sections/CompatibilitySection.js
import React from 'react';
import PropTypes from 'prop-types';
import {
  housingSubsidyOptions,
  interestOptions
} from '../constants/matchingFormConstants';

const CompatibilitySection = ({
  formData,
  errors,
  loading,
  profile,      // Added for interface consistency
  onInputChange,
  onArrayChange,
  onRangeChange // Added for interface consistency
}) => {
  return (
    <>
      {/* Living Situation Preferences - Enhanced with Columns */}
      <h3 className="card-title mb-4">Living Situation Preferences</h3>
      
      <div className="checkbox-columns-compact mb-4">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.petsOwned}
            onChange={(e) => onInputChange('petsOwned', e.target.checked)}
            disabled={loading}
          />
          <span className="checkbox-text">I own pets</span>
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.petsComfortable}
            onChange={(e) => onInputChange('petsComfortable', e.target.checked)}
            disabled={loading}
          />
          <span className="checkbox-text">I'm comfortable with roommate's pets</span>
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.overnightGuestsOk}
            onChange={(e) => onInputChange('overnightGuestsOk', e.target.checked)}
            disabled={loading}
          />
          <span className="checkbox-text">Overnight guests are OK</span>
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.sharedGroceries}
            onChange={(e) => onInputChange('sharedGroceries', e.target.checked)}
            disabled={loading}
          />
          <span className="checkbox-text">I'm open to sharing groceries</span>
        </label>
      </div>

      {/* Housing Assistance - Enhanced with Subtitle and Columns */}
      <h3 className="card-title mb-4">Housing Assistance</h3>
      <div className="housing-assistance-subtitle">
        Housing assistance programs that will provide some or all of your monthly rent.
      </div>
      
      <div className="form-group mb-4">
        <div className="checkbox-columns-compact">
          {housingSubsidyOptions.map(subsidy => (
            <label key={subsidy.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.housingSubsidy.includes(subsidy.value)}
                onChange={(e) => onArrayChange('housingSubsidy', subsidy.value, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">{subsidy.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Compatibility Factors - Enhanced with Columns */}
      <h3 className="card-title mb-4">Compatibility Factors</h3>
      
      <div className="form-group mb-4">
        <label className="label">
          Interests & Hobbies <span className="text-red-500">*</span>
        </label>
        <div className="checkbox-columns">
          {interestOptions.map(interest => (
            <label key={interest} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.interests.includes(interest)}
                onChange={(e) => onArrayChange('interests', interest, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">{interest}</span>
            </label>
          ))}
        </div>
        {errors.interests && (
          <div className="text-red-500 mt-1">{errors.interests}</div>
        )}
      </div>

      {/* Open-ended Responses */}
      <h3 className="card-title mb-4">About You</h3>
      
      <div className="form-group mb-4">
        <label className="label">
          About Me <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`input ${errors.aboutMe ? 'border-red-500' : ''}`}
          value={formData.aboutMe}
          onChange={(e) => onInputChange('aboutMe', e.target.value)}
          placeholder="Tell potential roommates about yourself, your recovery journey, and what makes you a good roommate..."
          rows="4"
          disabled={loading}
          maxLength="500"
          required
        />
        <div className="text-gray-500 mt-1 text-sm">
          {formData.aboutMe.length}/500 characters
        </div>
        {errors.aboutMe && (
          <div className="text-red-500 mt-1">{errors.aboutMe}</div>
        )}
      </div>

      <div className="form-group mb-4">
        <label className="label">
          What I'm Looking For <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`input ${errors.lookingFor ? 'border-red-500' : ''}`}
          value={formData.lookingFor}
          onChange={(e) => onInputChange('lookingFor', e.target.value)}
          placeholder="Describe what you're looking for in a roommate and living situation..."
          rows="4"
          disabled={loading}
          maxLength="500"
          required
        />
        <div className="text-gray-500 mt-1 text-sm">
          {formData.lookingFor.length}/500 characters
        </div>
        {errors.lookingFor && (
          <div className="text-red-500 mt-1">{errors.lookingFor}</div>
        )}
      </div>

      {/* Profile Status */}
      <div className="form-group mb-4">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => onInputChange('isActive', e.target.checked)}
            disabled={loading}
          />
          <span className="checkbox-text">Keep my profile active for matching</span>
        </label>
        <div className="text-gray-500 mt-1 text-sm">
          You can deactivate your profile at any time to stop receiving new matches
        </div>
      </div>
    </>
  );
};

CompatibilitySection.propTypes = {
  formData: PropTypes.shape({
    petsOwned: PropTypes.bool.isRequired,
    petsComfortable: PropTypes.bool.isRequired,
    overnightGuestsOk: PropTypes.bool.isRequired,
    sharedGroceries: PropTypes.bool.isRequired,
    housingSubsidy: PropTypes.arrayOf(PropTypes.string).isRequired,
    interests: PropTypes.arrayOf(PropTypes.string).isRequired,
    aboutMe: PropTypes.string.isRequired,
    lookingFor: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  profile: PropTypes.shape({               // Added for interface consistency
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string
  }),
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired,
  onRangeChange: PropTypes.func.isRequired  // Added for interface consistency
};

CompatibilitySection.defaultProps = {
  profile: null
};

export default CompatibilitySection;