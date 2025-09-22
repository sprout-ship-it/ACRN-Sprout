// src/components/features/matching/sections/LocationPreferencesSection.js - Refactored with enhanced CSS module usage
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
  onRangeChange,
  styles = {}   // CSS module styles passed from parent
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
      {/* Location & Housing Preferences Header */}
      <h3 className="card-title mb-4">Location & Housing Preferences</h3>
      
      <div className="alert alert-info mb-4">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>📍</span>
          Location Matching
        </h4>
        <p className="mb-0">
          We'll help you find housing and roommates in your preferred area. You can specify multiple locations 
          or be flexible with your preferences to increase your matching opportunities.
        </p>
      </div>

      {/* Primary Location Preferences */}
      <div className="card-header">
        <h4 className="card-title">Preferred Location</h4>
        <p className="card-subtitle">Where would you like to live?</p>
      </div>
      
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
            placeholder="e.g., Austin, Dallas, Phoenix"
            disabled={loading}
            required
          />
          {errors.preferredCity && (
            <div className="text-red-500 mt-1 text-sm">{errors.preferredCity}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Primary city you'd like to live in
          </div>
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
            <div className="text-red-500 mt-1 text-sm">{errors.preferredState}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">Target ZIP Codes</label>
          <input
            className="input"
            type="text"
            value={formData.targetZipCodes || ''}
            onChange={(e) => onInputChange('targetZipCodes', e.target.value)}
            placeholder="29301, 29302, 29303"
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Specific ZIP codes (optional, comma-separated)
          </div>
        </div>
      </div>

      {/* Budget & Financial Information */}
      <div className="card-header">
        <h4 className="card-title">Budget Information</h4>
        <p className="card-subtitle">
          Include all income sources: employment, benefits, housing assistance, family support
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Minimum Monthly Budget <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.budgetMin ? 'border-red-500' : ''}`}
            type="number"
            value={formData.budgetMin || ''}
            onChange={(e) => onInputChange('budgetMin', e.target.value)}
            placeholder="500"
            disabled={loading}
            min="0"
            max="4500"
            step="50"
            required
          />
          {errors.budgetMin && (
            <div className="text-red-500 mt-1 text-sm">{errors.budgetMin}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Lowest monthly amount you can afford
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">
            Maximum Monthly Budget <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.budgetMax ? 'border-red-500' : ''}`}
            type="number"
            value={formData.budgetMax || ''}
            onChange={(e) => onInputChange('budgetMax', e.target.value)}
            placeholder="1200"
            disabled={loading}
            min="200"
            max="5000"
            step="50"
            required
          />
          {errors.budgetMax && (
            <div className="text-red-500 mt-1 text-sm">{errors.budgetMax}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Maximum you can afford (including utilities)
          </div>
        </div>
      </div>

      {/* Housing Specifications */}
      <div className="card-header">
        <h4 className="card-title">Housing Requirements</h4>
        <p className="card-subtitle">Your preferences for the physical housing unit</p>
      </div>

      <div className="grid-3 mb-4">
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
            <div className="text-red-500 mt-1 text-sm">{errors.maxCommute}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            To work, meetings, or services
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Preferred Bedrooms</label>
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
            Total bedrooms in the housing unit
          </div>
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
          <div className="text-gray-500 mt-1 text-sm">
            How long you'd like to commit
          </div>
        </div>
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
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.moveInDate && (
            <div className="text-red-500 mt-1 text-sm">{errors.moveInDate}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            When you'd like to move in
          </div>
        </div>

        <div className="form-group">
          <label className="label">Move-in Flexibility</label>
          <select
            className="input"
            value={formData.moveInFlexibility || ''}
            onChange={(e) => onInputChange('moveInFlexibility', e.target.value)}
            disabled={loading}
          >
            <option value="">Select flexibility</option>
            <option value="exact-date">Must be exact date</option>
            <option value="within-week">Within 1 week</option>
            <option value="within-month">Within 1 month</option>
            <option value="very-flexible">Very flexible</option>
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            How flexible are your move-in dates?
          </div>
        </div>
      </div>

      {/* Housing Type Selection */}
      <div className="form-group mb-4">
        <label className="label">
          Housing Type Preferences <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all types of housing you'd consider living in
        </div>
        
        <div className={styles.checkboxColumns || 'grid-2'}>
          {housingTypeOptions.map(type => (
            <label key={type} className={styles.checkboxLabel || 'checkbox-item'}>
              <input
                type="checkbox"
                checked={(formData.housingType || []).includes(type)}
                onChange={(e) => onArrayChange('housingType', type, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText || ''}>{type}</span>
            </label>
          ))}
        </div>
        {errors.housingType && (
          <div className="text-red-500 mt-1 text-sm">{errors.housingType}</div>
        )}
      </div>

      {/* Additional Housing Preferences */}
      <div className="card-header">
        <h4 className="card-title">Additional Housing Preferences</h4>
        <p className="card-subtitle">Optional features and amenities</p>
      </div>
      
      <div className="grid-2 mb-4">
        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.furnishedPreference || false}
            onChange={(e) => onInputChange('furnishedPreference', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Prefer furnished housing
          </span>
        </label>
        
        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.petsAllowed || false}
            onChange={(e) => onInputChange('petsAllowed', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Need pet-friendly housing
          </span>
        </label>
        
        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.utilitiesIncluded || false}
            onChange={(e) => onInputChange('utilitiesIncluded', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Prefer utilities included in rent
          </span>
        </label>
        
        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.accessibilityNeeded || false}
            onChange={(e) => onInputChange('accessibilityNeeded', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Need accessibility features
          </span>
        </label>

        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.parkingRequired || false}
            onChange={(e) => onInputChange('parkingRequired', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Parking required
          </span>
        </label>

        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.publicTransitAccess || false}
            onChange={(e) => onInputChange('publicTransitAccess', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Need public transit access
          </span>
        </label>
      </div>

      {/* Location Flexibility */}
      <div className="card-header">
        <h4 className="card-title">Location Flexibility</h4>
        <p className="card-subtitle">How flexible are you with location preferences?</p>
      </div>

      <div className="form-group mb-4">
        <label className="label">Willingness to Consider Other Areas</label>
        <select
          className="input"
          value={formData.locationFlexibility || ''}
          onChange={(e) => onInputChange('locationFlexibility', e.target.value)}
          disabled={loading}
        >
          <option value="">Select flexibility level</option>
          <option value="very-specific">Only my specified preferences</option>
          <option value="nearby-areas">Nearby areas within 30 minutes</option>
          <option value="same-metro">Same metropolitan area</option>
          <option value="same-state">Anywhere in the same state</option>
          <option value="very-flexible">Open to any location</option>
        </select>
        <div className="text-gray-500 mt-1 text-sm">
          More flexibility increases your chances of finding a good match
        </div>
      </div>

      {/* Budget Help Notice */}
      <div className="alert alert-info">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>💡</span>
          Budget Planning Tips
        </h4>
        <p className="mb-2">
          <strong>When setting your budget, consider:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li>Rent (your share)</li>
          <li>Utilities (electricity, gas, water, internet)</li>
          <li>Renter's insurance</li>
          <li>Moving costs and deposits</li>
          <li>Transportation costs in the new location</li>
        </ul>
        <p className="text-sm">
          Our housing specialists can help you create a realistic budget. 
          <a href="/help/budget-planning" target="_blank" style={{ color: 'var(--primary-purple)', marginLeft: '5px' }}>
            Learn more about budget planning →
          </a>
        </p>
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
    moveInFlexibility: PropTypes.string,
    leaseDuration: PropTypes.string,
    preferredBedrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    furnishedPreference: PropTypes.bool,
    petsAllowed: PropTypes.bool,
    utilitiesIncluded: PropTypes.bool,
    accessibilityNeeded: PropTypes.bool,
    parkingRequired: PropTypes.bool,
    publicTransitAccess: PropTypes.bool,
    locationFlexibility: PropTypes.string
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

LocationPreferencesSection.defaultProps = {
  profile: null,
  styles: {}
};

export default LocationPreferencesSection;