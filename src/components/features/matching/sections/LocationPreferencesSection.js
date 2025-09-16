// src/components/features/matching/sections/LocationPreferencesSection.js
import React from 'react';
import PropTypes from 'prop-types';
import { housingTypeOptions } from '../constants/matchingFormConstants';

const LocationPreferencesSection = ({
  formData,
  errors,
  loading,
  profile,
  onInputChange,
  onArrayChange,
  onRangeChange
}) => {
  // State options for dropdown
  const stateOptions = [
    { value: '', label: 'Select State' },
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];

  return (
    <>
      {/* Location & Housing Preferences */}
      <h3 className="card-title mb-4">Location & Housing Preferences</h3>
      
      {/* ✅ UPDATED: Separate City and State fields */}
      <div className="grid-3 mb-4">
        <div className="form-group">
          <label className="label">
            Preferred City <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.preferredCity ? 'border-red-500' : ''}`}
            type="text"
            value={formData.preferredCity || ''}
            onChange={(e) => onInputChange('preferredCity', e.target.value)}
            placeholder="City name"
            disabled={loading}
            required
          />
          {errors.preferredCity && (
            <div className="text-red-500 mt-1">{errors.preferredCity}</div>
          )}
        </div>

        <div className="form-group">
          <label className="label">
            Preferred State <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.preferredState ? 'border-red-500' : ''}`}
            value={formData.preferredState || ''}
            onChange={(e) => onInputChange('preferredState', e.target.value)}
            disabled={loading}
            required
          >
            {stateOptions.map(state => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          {errors.preferredState && (
            <div className="text-red-500 mt-1">{errors.preferredState}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">Target ZIP Codes</label>
          <input
            className="input"
            type="text"
            value={formData.targetZipCodes || ''}
            onChange={(e) => onInputChange('targetZipCodes', e.target.value)}
            placeholder="29301, 29302"
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Specific ZIP codes (optional)
          </div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          {/* ✅ UPDATED: Changed label to Total Combined Budget Maximum */}
          <label className="label">
            Total Combined Budget Maximum <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.budgetMax ? 'border-red-500' : ''}`}
            type="number"
            value={formData.budgetMax || ''}
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
          {/* ✅ UPDATED: Added helper text about including all income sources */}
          <div className="text-gray-500 mt-1 text-sm">
            Include all sources of income and housing support
          </div>
        </div>
        
        {/* ✅ NEW: Added minimum budget field */}
        <div className="form-group">
          <label className="label">
            Minimum Budget <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.budgetMin ? 'border-red-500' : ''}`}
            type="number"
            value={formData.budgetMin || ''}
            onChange={(e) => onInputChange('budgetMin', e.target.value)}
            placeholder="Your minimum monthly budget"
            disabled={loading}
            min="0"
            max="4500"
            required
          />
          {errors.budgetMin && (
            <div className="text-red-500 mt-1">{errors.budgetMin}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Lowest acceptable housing cost
          </div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Maximum Commute Time <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.maxCommute ? 'border-red-500' : ''}`}
            value={formData.maxCommute || ''}
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
        
        {/* ✅ NEW: Preferred number of bedrooms */}
        <div className="form-group">
          <label className="label">
            Preferred Bedrooms
          </label>
          <select
            className="input"
            value={formData.preferredBedrooms || ''}
            onChange={(e) => onInputChange('preferredBedrooms', e.target.value)}
            disabled={loading}
          >
            <option value="">No preference</option>
            <option value="1">1 bedroom</option>
            <option value="2">2 bedrooms</option>
            <option value="3">3 bedrooms</option>
            <option value="4">4+ bedrooms</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Preferred number of bedrooms in housing
          </div>
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
                checked={(formData.housingType || []).includes(type)}
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
            value={formData.moveInDate || ''}
            onChange={(e) => onInputChange('moveInDate', e.target.value)}
            disabled={loading}
            required
            min={new Date().toISOString().split('T')[0]} // ✅ NEW: Can't select past dates
          />
          {errors.moveInDate && (
            <div className="text-red-500 mt-1">{errors.moveInDate}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">Preferred Lease Duration</label>
          <select
            className="input"
            value={formData.leaseDuration || ''}
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

      {/* ✅ NEW: Additional preferences section */}
      <div className="form-group mb-4">
        <h4 className="subtitle">Additional Preferences</h4>
        <div className="grid-2 mt-3">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="furnished-preference"
              checked={formData.furnishedPreference || false}
              onChange={(e) => onInputChange('furnishedPreference', e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="furnished-preference">
              Prefer furnished housing
            </label>
          </div>
          
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="pets-allowed"
              checked={formData.petsAllowed || false}
              onChange={(e) => onInputChange('petsAllowed', e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="pets-allowed">
              Need pet-friendly housing
            </label>
          </div>
          
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="utilities-included"
              checked={formData.utilitiesIncluded || false}
              onChange={(e) => onInputChange('utilitiesIncluded', e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="utilities-included">
              Prefer utilities included
            </label>
          </div>
          
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="accessibility-needed"
              checked={formData.accessibilityNeeded || false}
              onChange={(e) => onInputChange('accessibilityNeeded', e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="accessibility-needed">
              Need accessibility features
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

LocationPreferencesSection.propTypes = {
  formData: PropTypes.shape({
    preferredCity: PropTypes.string,
    preferredState: PropTypes.string,
    targetZipCodes: PropTypes.string,
    budgetMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    budgetMin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxCommute: PropTypes.string,
    housingType: PropTypes.arrayOf(PropTypes.string),
    moveInDate: PropTypes.string,
    leaseDuration: PropTypes.string,
    preferredBedrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    furnishedPreference: PropTypes.bool,
    petsAllowed: PropTypes.bool,
    utilitiesIncluded: PropTypes.bool,
    accessibilityNeeded: PropTypes.bool
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
  onRangeChange: PropTypes.func.isRequired
};

LocationPreferencesSection.defaultProps = {
  profile: null
};

export default LocationPreferencesSection;