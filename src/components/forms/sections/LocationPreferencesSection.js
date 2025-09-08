// src/components/forms/sections/LocationPreferencesSection.js
import React from 'react';
import PropTypes from 'prop-types';
import { housingTypeOptions } from '../constants/matchingFormConstants';

const LocationPreferencesSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  return (
    <>
      {/* Location & Housing Preferences */}
      <h3 className="card-title mb-4">Location & Housing Preferences</h3>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Preferred Location <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.preferredLocation ? 'border-red-500' : ''}`}
            type="text"
            value={formData.preferredLocation}
            onChange={(e) => onInputChange('preferredLocation', e.target.value)}
            placeholder="City, State or general area"
            disabled={loading}
            required
          />
          {errors.preferredLocation && (
            <div className="text-red-500 mt-1">{errors.preferredLocation}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">Target ZIP Codes</label>
          <input
            className="input"
            type="text"
            value={formData.targetZipCodes}
            onChange={(e) => onInputChange('targetZipCodes', e.target.value)}
            placeholder="29301, 29302, 29303 (comma separated)"
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Specific ZIP codes you prefer (optional but helps with location matching)
          </div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Personal Budget Maximum <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.budgetMax ? 'border-red-500' : ''}`}
            type="number"
            value={formData.budgetMax}
            onChange={(e) => onInputChange('budgetMax', e.target.value)}
            placeholder="Your maximum monthly budget"
            disabled={loading}
            min="200"
            max="5000"
            required
          />
          {errors.budgetMax && (
            <div className="text-red-500 mt-1">{errors.budgetMax}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Your personal budget for housing costs
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">
            Maximum Commute Time <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.maxCommute ? 'border-red-500' : ''}`}
            value={formData.maxCommute}
            onChange={(e) => onInputChange('maxCommute', e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select commute time</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="unlimited">No preference</option>
          </select>
          {errors.maxCommute && (
            <div className="text-red-500 mt-1">{errors.maxCommute}</div>
          )}
        </div>
      </div>

      {/* Housing Type Selection - Enhanced with Columns */}
      <div className="form-group mb-4">
        <label className="label">
          Housing Type Preferences <span className="text-red-500">*</span>
        </label>
        <div className="checkbox-columns">
          {housingTypeOptions.map(type => (
            <label key={type} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.housingType.includes(type)}
                onChange={(e) => onArrayChange('housingType', type, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">{type}</span>
            </label>
          ))}
        </div>
        {errors.housingType && (
          <div className="text-red-500 mt-1">{errors.housingType}</div>
        )}
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Move-in Date <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.moveInDate ? 'border-red-500' : ''}`}
            type="date"
            value={formData.moveInDate}
            onChange={(e) => onInputChange('moveInDate', e.target.value)}
            disabled={loading}
            required
          />
          {errors.moveInDate && (
            <div className="text-red-500 mt-1">{errors.moveInDate}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">Preferred Lease Duration</label>
          <select
            className="input"
            value={formData.leaseDuration}
            onChange={(e) => onInputChange('leaseDuration', e.target.value)}
            disabled={loading}
          >
            <option value="">Select duration</option>
            <option value="month-to-month">Month-to-month</option>
            <option value="6-months">6 months</option>
            <option value="12-months">12 months</option>
            <option value="18-months">18 months</option>
            <option value="24-months">24 months</option>
          </select>
        </div>
      </div>
    </>
  );
};

LocationPreferencesSection.propTypes = {
  formData: PropTypes.shape({
    preferredLocation: PropTypes.string,
    targetZipCodes: PropTypes.string,
    budgetMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxCommute: PropTypes.string,
    housingType: PropTypes.arrayOf(PropTypes.string),
    moveInDate: PropTypes.string,
    leaseDuration: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default LocationPreferencesSection;