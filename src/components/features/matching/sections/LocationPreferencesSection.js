// src/components/features/matching/sections/LocationPreferencesSection.js - FIXED WITH STANDARDIZED FIELD NAMES
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
          Enhanced Location Matching
        </h4>
        <p className="mb-0">
          We'll help you find housing and roommates in your preferred area using our improved location matching system. 
          You can specify multiple locations or be flexible with your preferences to increase your matching opportunities.
        </p>
      </div>

      {/* FIXED: Primary Location Preferences with standardized fields */}
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
            className={`input ${errors.primary_city ? 'border-red-500' : ''}`}
            type="text"
            value={formData.primary_city || ''}
            onChange={(e) => onInputChange('primary_city', e.target.value)}
            placeholder="e.g., Austin, Dallas, Phoenix"
            disabled={loading}
            required
          />
          {errors.primary_city && (
            <div className="text-red-500 mt-1 text-sm">{errors.primary_city}</div>
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
            className={`input ${errors.primary_state ? 'border-red-500' : ''}`}
            value={formData.primary_state || ''}
            onChange={(e) => onInputChange('primary_state', e.target.value)}
            disabled={loading}
            required
          >
            {stateOptions.map(state => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          {errors.primary_state && (
            <div className="text-red-500 mt-1 text-sm">{errors.primary_state}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Primary state for housing search
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Target ZIP Codes</label>
          <input
            className="input"
            type="text"
            value={formData.target_zip_codes || ''}
            onChange={(e) => onInputChange('target_zip_codes', e.target.value)}
            placeholder="29301, 29302, 29303"
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Specific ZIP codes (optional, comma-separated)
          </div>
        </div>
      </div>

      {/* FIXED: Budget & Financial Information with standardized fields */}
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
            className={`input ${errors.budget_min ? 'border-red-500' : ''}`}
            type="number"
            value={formData.budget_min || ''}
            onChange={(e) => onInputChange('budget_min', e.target.value)}
            placeholder="500"
            disabled={loading}
            min="0"
            max="4500"
            step="50"
            required
          />
          {errors.budget_min && (
            <div className="text-red-500 mt-1 text-sm">{errors.budget_min}</div>
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
            className={`input ${errors.budget_max ? 'border-red-500' : ''}`}
            type="number"
            value={formData.budget_max || ''}
            onChange={(e) => onInputChange('budget_max', e.target.value)}
            placeholder="1200"
            disabled={loading}
            min="200"
            max="5000"
            step="50"
            required
          />
          {errors.budget_max && (
            <div className="text-red-500 mt-1 text-sm">{errors.budget_max}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Maximum you can afford including utilities
          </div>
        </div>
      </div>

      {/* Housing Specifications - FIXED: Using standardized field names */}
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
            className={`input ${errors.max_commute_minutes ? 'border-red-500' : ''}`}
            value={formData.max_commute_minutes || ''}
            onChange={(e) => onInputChange('max_commute_minutes', e.target.value)}
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
          {errors.max_commute_minutes && (
            <div className="text-red-500 mt-1 text-sm">{errors.max_commute_minutes}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            To work, meetings, or services
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Preferred Bedrooms</label>
          <select
            className="input"
            value={formData.preferred_bedrooms || ''}
            onChange={(e) => onInputChange('preferred_bedrooms', e.target.value)}
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
            value={formData.lease_duration || ''}
            onChange={(e) => onInputChange('lease_duration', e.target.value)}
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
            className={`input ${errors.move_in_date ? 'border-red-500' : ''}`}
            type="date"
            value={formData.move_in_date || ''}
            onChange={(e) => onInputChange('move_in_date', e.target.value)}
            disabled={loading}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.move_in_date && (
            <div className="text-red-500 mt-1 text-sm">{errors.move_in_date}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            When you'd like to move in
          </div>
        </div>

        <div className="form-group">
          <label className="label">Move-in Flexibility</label>
          <select
            className="input"
            value={formData.move_in_flexibility || ''}
            onChange={(e) => onInputChange('move_in_flexibility', e.target.value)}
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

      {/* Housing Type Selection - FIXED: Using standardized field name */}
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
                checked={(formData.housing_types_accepted || []).includes(type)}
                onChange={(e) => onArrayChange('housing_types_accepted', type, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText || ''}>{type}</span>
            </label>
          ))}
        </div>
        {errors.housing_types_accepted && (
          <div className="text-red-500 mt-1 text-sm">{errors.housing_types_accepted}</div>
        )}
      </div>

      {/* Additional Housing Preferences - FIXED: Using standardized field names */}
      <div className="card-header">
        <h4 className="card-title">Additional Housing Preferences</h4>
        <p className="card-subtitle">Optional features and amenities</p>
      </div>
      
      <div className="grid-2 mb-4">
        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.furnished_preference || false}
            onChange={(e) => onInputChange('furnished_preference', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Prefer furnished housing
          </span>
        </label>
        
        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.pets_allowed || false}
            onChange={(e) => onInputChange('pets_allowed', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Need pet-friendly housing
          </span>
        </label>
        
        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.utilities_included_preference || false}
            onChange={(e) => onInputChange('utilities_included_preference', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Prefer utilities included in rent
          </span>
        </label>
        
        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.accessibility_needed || false}
            onChange={(e) => onInputChange('accessibility_needed', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Need accessibility features
          </span>
        </label>

        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.parking_required || false}
            onChange={(e) => onInputChange('parking_required', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Parking required
          </span>
        </label>

        <label className={styles.checkboxLabel || 'checkbox-item'}>
          <input
            type="checkbox"
            checked={formData.public_transit_access || false}
            onChange={(e) => onInputChange('public_transit_access', e.target.checked)}
            disabled={loading}
          />
          <span className={styles.checkboxText || ''}>
            Need public transit access
          </span>
        </label>
      </div>

      {/* Location Flexibility - FIXED: Using standardized field name */}
      <div className="card-header">
        <h4 className="card-title">Location Flexibility</h4>
        <p className="card-subtitle">How flexible are you with location preferences?</p>
      </div>

      <div className="form-group mb-4">
        <label className="label">Willingness to Consider Other Areas</label>
        <select
          className="input"
          value={formData.location_flexibility || ''}
          onChange={(e) => onInputChange('location_flexibility', e.target.value)}
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
          Enhanced Budget Planning
        </h4>
        <p className="mb-2">
          <strong>Our improved budget matching considers:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li>Rent (your share)</li>
          <li>Utilities (electricity, gas, water, internet)</li>
          <li>Renter's insurance</li>
          <li>Moving costs and deposits</li>
          <li>Transportation costs in the new location</li>
        </ul>
        <p className="text-sm">
          Our enhanced matching system uses standardized budget fields for more accurate compatibility scoring.
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
    primary_city: PropTypes.string,                    // FIXED: Standardized
    primary_state: PropTypes.string,                   // FIXED: Standardized  
    target_zip_codes: PropTypes.string,                // FIXED: Standardized
    budget_max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // FIXED: Standardized
    budget_min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // FIXED: Standardized
    max_commute_minutes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // FIXED: Standardized
    housing_types_accepted: PropTypes.arrayOf(PropTypes.string), // FIXED: Standardized
    move_in_date: PropTypes.string,                    // FIXED: Standardized
    move_in_flexibility: PropTypes.string,             // FIXED: Standardized
    lease_duration: PropTypes.string,
    preferred_bedrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    furnished_preference: PropTypes.bool,              // FIXED: Standardized
    pets_allowed: PropTypes.bool,
    utilities_included_preference: PropTypes.bool,     // FIXED: Standardized
    accessibility_needed: PropTypes.bool,              // FIXED: Standardized
    parking_required: PropTypes.bool,                  // FIXED: Standardized
    public_transit_access: PropTypes.bool,             // FIXED: Standardized
    location_flexibility: PropTypes.string             // FIXED: Standardized
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