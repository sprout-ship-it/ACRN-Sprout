// src/components/features/matching/sections/LocationPreferencesSection.js - FULLY FIXED VERSION
import React, { useMemo, useCallback } from 'react';
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
  styles = {},
  fieldMapping,
  sectionId,
  isActive,
  validationMessage
}) => {
  // Enhanced state options with full state names and abbreviations
  const stateOptions = useMemo(() => [
    { value: '', label: 'Select State', disabled: true },
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
  ], []);

  // Helper to format currency for display
  const formatCurrency = useCallback((value) => {
    if (!value) return '';
    const numValue = parseInt(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  }, []);

  // Validate budget range
  const validateBudgetRange = useCallback(() => {
    const min = parseInt(formData.budget_min) || 0;
    const max = parseInt(formData.budget_max) || 0;
    
    if (min && max && min > max) {
      return 'Minimum budget cannot be higher than maximum budget';
    }
    if (min && min < 200) {
      return 'Minimum budget should be at least $200/month';
    }
    if (max && max > 5000) {
      return 'Maximum budget seems unusually high - please verify';
    }
    return null;
  }, [formData.budget_min, formData.budget_max]);

  // Handle budget input with validation
  const handleBudgetChange = useCallback((field, value) => {
    // Allow only numbers
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 4) { // Max 4 digits ($9999)
      onInputChange(field, cleanValue);
    }
  }, [onInputChange]);

  // ✅ FIXED: Handle ZIP code input with improved validation - allows partial entry
  const handleZipCodeChange = useCallback((value) => {
    // Clean input - allow only numbers, commas, and spaces
    const cleanValue = value.replace(/[^\d,\s]/g, '');
    
    // Allow immediate input (don't block partial ZIP codes while typing)
    onInputChange('target_zip_codes', cleanValue);
  }, [onInputChange]);

  // ✅ FIXED: Add function to validate ZIP codes for display purposes only
  const validateZipCodes = useCallback((zipString) => {
    if (!zipString || zipString.trim() === '') return { isValid: true, message: '' };
    
    const zipCodes = zipString.split(/[,\s]+/).filter(zip => zip.length > 0);
    const invalidZips = zipCodes.filter(zip => !/^\d{5}$/.test(zip));
    
    if (invalidZips.length > 0) {
      return {
        isValid: false,
        message: `Invalid ZIP codes: ${invalidZips.join(', ')}. ZIP codes must be exactly 5 digits.`
      };
    }
    
    return { isValid: true, message: '' };
  }, []);

  // ✅ NEW: Get computed location display (read-only)
  const getComputedLocation = useCallback(() => {
    if (formData.primary_city && formData.primary_state) {
      return `${formData.primary_city}, ${formData.primary_state}`;
    }
    return '';
  }, [formData.primary_city, formData.primary_state]);

  // Calculate minimum date for move-in (today + 1 day)
  const minMoveInDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  // Validate move-in date
  const validateMoveInDate = useCallback((date) => {
    if (!date) return null;
    const selectedDate = new Date(date);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1); // Max 1 year from now
    
    if (selectedDate < today) {
      return 'Move-in date cannot be in the past';
    }
    if (selectedDate > maxDate) {
      return 'Move-in date cannot be more than 1 year from today';
    }
    return null;
  }, []);

  const budgetValidationError = validateBudgetRange();
  const moveInDateError = validateMoveInDate(formData.move_in_date);

  return (
    <>
      {/* Location & Housing Preferences Header */}
      <div className="section-intro">
        <h3 className="card-title mb-4">Location & Housing Preferences</h3>
        <div className="alert alert-info mb-4">
          <h4 className="mb-2">
            <span style={{ marginRight: '8px' }}>🏠</span>
            Enhanced Location Matching System
          </h4>
          <p className="mb-0">
            Our improved location matching uses standardized city/state fields and enhanced budget compatibility 
            to find housing and roommates in your preferred area with accurate financial alignment.
          </p>
        </div>
      </div>

      {/* Primary Location Preferences - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Preferred Housing Location</h4>
        <p className="card-subtitle">Where would you like to live? This is the primary location for housing search.</p>
      </div>
      
      <div className="grid-3 mb-4">
        <div className="form-group">
          <label className="label">
            Preferred City <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.primary_city ? 'border-red-500 bg-red-50' : ''}`}
            type="text"
            value={formData.primary_city || ''}
            onChange={(e) => onInputChange('primary_city', e.target.value)}
            placeholder="e.g., Austin, Dallas, Phoenix"
            disabled={loading}
            maxLength="100"
            required
          />
          {errors.primary_city && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.primary_city}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Primary city for housing search and roommate matching
          </div>
        </div>

        <div className="form-group">
          <label className="label">
            Preferred State <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.primary_state ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.primary_state || ''}
            onChange={(e) => onInputChange('primary_state', e.target.value)}
            disabled={loading}
            required
          >
            {stateOptions.map(state => (
              <option key={state.value} value={state.value} disabled={state.disabled}>
                {state.label}
              </option>
            ))}
          </select>
          {errors.primary_state && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.primary_state}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            State for primary housing search area
          </div>
        </div>
        
        {/* ✅ FIXED: ZIP Code input with proper validation */}
        <div className="form-group">
          <label className="label">Specific ZIP Codes (Optional)</label>
          <input
            className={`input ${errors.target_zip_codes ? 'border-red-500 bg-red-50' : ''}`}
            type="text"
            value={formData.target_zip_codes || ''}
            onChange={(e) => handleZipCodeChange(e.target.value)}
            placeholder="29301, 29302, 29303"
            disabled={loading}
            maxLength="100"
          />
          
          {/* Show validation only when user stops typing */}
          {formData.target_zip_codes && !validateZipCodes(formData.target_zip_codes).isValid && (
            <div className="text-orange-600 mt-1 text-sm">
              {validateZipCodes(formData.target_zip_codes).message}
            </div>
          )}
          
          {errors.target_zip_codes && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.target_zip_codes}</div>
          )}
          
          <div className="text-gray-500 mt-1 text-sm">
            Optional: Specific ZIP codes you'd prefer, separated by commas
          </div>
          
          {/* Show parsed ZIP codes if valid */}
          {formData.target_zip_codes && validateZipCodes(formData.target_zip_codes).isValid && (
            <div className="text-green-600 mt-1 text-sm">
              ZIP codes: {formData.target_zip_codes.split(/[,\s]+/).filter(zip => zip.length === 5).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* ✅ NEW: Display computed location if both city and state are provided */}
      {getComputedLocation() && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="text-blue-800 font-medium">
            🏠 Primary Search Location: {getComputedLocation()}
          </div>
          <div className="text-blue-600 text-sm mt-1">
            ✅ This computed location will be automatically saved and used for matching
          </div>
        </div>
      )}

      {/* Budget Information - Schema Standardized Fields */}
      <div className="card-header">
        <h4 className="card-title">Monthly Housing Budget</h4>
        <p className="card-subtitle">
          Include all income sources: employment, benefits, housing assistance, family support
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Minimum Monthly Budget <span className="text-red-500">*</span>
          </label>
          <div className="input-group">
            <span className="input-prefix">$</span>
            <input
              className={`input input-with-prefix ${errors.budget_min ? 'border-red-500 bg-red-50' : ''}`}
              type="text"
              value={formData.budget_min || ''}
              onChange={(e) => handleBudgetChange('budget_min', e.target.value)}
              placeholder="500"
              disabled={loading}
              required
            />
          </div>
          {formData.budget_min && (
            <div className="text-blue-600 mt-1 text-sm">
              Formatted: {formatCurrency(formData.budget_min)}/month
            </div>
          )}
          {errors.budget_min && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.budget_min}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Lowest amount you can reliably afford monthly
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">
            Maximum Monthly Budget <span className="text-red-500">*</span>
          </label>
          <div className="input-group">
            <span className="input-prefix">$</span>
            <input
              className={`input input-with-prefix ${errors.budget_max ? 'border-red-500 bg-red-50' : ''}`}
              type="text"
              value={formData.budget_max || ''}
              onChange={(e) => handleBudgetChange('budget_max', e.target.value)}
              placeholder="1200"
              disabled={loading}
              required
            />
          </div>
          {formData.budget_max && (
            <div className="text-blue-600 mt-1 text-sm">
              Formatted: {formatCurrency(formData.budget_max)}/month
            </div>
          )}
          {errors.budget_max && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.budget_max}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Maximum you can afford including utilities
          </div>
        </div>
      </div>

      {/* Budget Range Validation */}
      {budgetValidationError && (
        <div className="alert alert-warning mb-4">
          <span className="alert-icon">⚠️</span>
          <strong>Budget Validation:</strong> {budgetValidationError}
        </div>
      )}

      {/* Budget Range Display */}
      {formData.budget_min && formData.budget_max && !budgetValidationError && (
        <div className="mb-4 p-3 bg-green-50 rounded-md border border-green-200">
          <div className="text-green-800 font-medium">
            Budget Range: {formatCurrency(formData.budget_min)} - {formatCurrency(formData.budget_max)} per month
          </div>
          <div className="text-green-600 text-sm mt-1">
            This standardized budget range improves financial compatibility matching with roommates and available housing.
          </div>
        </div>
      )}

      {/* Housing Requirements */}
      <div className="card-header">
        <h4 className="card-title">Housing Requirements & Preferences</h4>
        <p className="card-subtitle">Your essential needs and preferences for the housing unit</p>
      </div>

      <div className="grid-3 mb-4">
        <div className="form-group">
          <label className="label">
            Maximum Commute Time <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.max_commute_minutes ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.max_commute_minutes || ''}
            onChange={(e) => onInputChange('max_commute_minutes', e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select commute limit</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
            <option value="unlimited">No limit</option>
          </select>
          {errors.max_commute_minutes && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.max_commute_minutes}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            To work, treatment, meetings, or services
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Preferred Bedrooms</label>
          <select
            className={`input ${errors.preferred_bedrooms ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.preferred_bedrooms || ''}
            onChange={(e) => onInputChange('preferred_bedrooms', e.target.value)}
            disabled={loading}
          >
            <option value="">No preference</option>
            <option value="1">1 bedroom (studio/efficiency)</option>
            <option value="2">2 bedrooms</option>
            <option value="3">3 bedrooms</option>
            <option value="4">4+ bedrooms</option>
          </select>
          {errors.preferred_bedrooms && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.preferred_bedrooms}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Total bedrooms in the housing unit
          </div>
        </div>

        <div className="form-group">
          <label className="label">Transportation Method</label>
          <select
            className={`input ${errors.transportation_method ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.transportation_method || ''}
            onChange={(e) => onInputChange('transportation_method', e.target.value)}
            disabled={loading}
          >
            <option value="">Select primary method</option>
            <option value="personal-vehicle">Personal vehicle</option>
            <option value="public-transit">Public transportation</option>
            <option value="bike">Bicycle</option>
            <option value="walk">Walking</option>
            <option value="rideshare">Rideshare/Uber/Lyft</option>
            <option value="combination">Combination of methods</option>
            <option value="other">Other</option>
          </select>
          {errors.transportation_method && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.transportation_method}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            How you typically get around
          </div>
        </div>
      </div>

      {/* Move-in Timeline */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Preferred Move-in Date <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.move_in_date || moveInDateError ? 'border-red-500 bg-red-50' : ''}`}
            type="date"
            value={formData.move_in_date || ''}
            onChange={(e) => onInputChange('move_in_date', e.target.value)}
            disabled={loading}
            required
            min={minMoveInDate}
          />
          {moveInDateError && (
            <div className="text-red-500 mt-1 text-sm font-medium">{moveInDateError}</div>
          )}
          {errors.move_in_date && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.move_in_date}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            When you'd like to move in (earliest: tomorrow)
          </div>
        </div>

        <div className="form-group">
          <label className="label">Move-in Flexibility</label>
          <select
            className={`input ${errors.move_in_flexibility ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.move_in_flexibility || ''}
            onChange={(e) => onInputChange('move_in_flexibility', e.target.value)}
            disabled={loading}
          >
            <option value="">Select flexibility level</option>
            <option value="exact-date">Must be exact date</option>
            <option value="within-week">Within 1 week of date</option>
            <option value="within-two-weeks">Within 2 weeks of date</option>
            <option value="within-month">Within 1 month of date</option>
            <option value="very-flexible">Very flexible with timing</option>
          </select>
          {errors.move_in_flexibility && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.move_in_flexibility}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            How flexible are your move-in dates?
          </div>
        </div>
      </div>

      {/* Housing Type Selection - Schema Standardized Field */}
      <div className="form-group mb-4">
        <label className="label">
          Acceptable Housing Types <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all types of housing you'd consider living in. More options increase matching opportunities.
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
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.housing_types_accepted}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          Selecting multiple types improves your matching opportunities
        </div>
      </div>

      {/* Additional Housing Preferences */}
      <div className="card-header">
        <h4 className="card-title">Additional Housing Features</h4>
        <p className="card-subtitle">Optional features and amenities that would enhance your living experience</p>
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
      </div>

      {/* Lease Preferences */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Preferred Lease Duration</label>
          <select
            className={`input ${errors.lease_duration ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.lease_duration || ''}
            onChange={(e) => onInputChange('lease_duration', e.target.value)}
            disabled={loading}
          >
            <option value="">No preference</option>
            <option value="month-to-month">Month-to-month</option>
            <option value="6-months">6 months</option>
            <option value="12-months">12 months</option>
            <option value="18-months">18 months</option>
            <option value="24-months">24 months</option>
          </select>
          {errors.lease_duration && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.lease_duration}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            How long you'd like to commit to the lease
          </div>
        </div>

        <div className="form-group">
          <label className="label">Location Flexibility</label>
          <select
            className={`input ${errors.location_flexibility ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.location_flexibility || ''}
            onChange={(e) => onInputChange('location_flexibility', e.target.value)}
            disabled={loading}
          >
            <option value="">Select flexibility level</option>
            <option value="very-specific">Only my specified city/state</option>
            <option value="nearby-cities">Nearby cities within 30 minutes</option>
            <option value="metro-area">Same metropolitan area</option>
            <option value="same-state">Anywhere in the same state</option>
            <option value="regional">Regional flexibility (neighboring states)</option>
            <option value="very-flexible">Open to any location</option>
          </select>
          {errors.location_flexibility && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.location_flexibility}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            More flexibility increases your matching opportunities
          </div>
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
              <strong>Required Location Fields:</strong>
              <ul className="mt-2 text-sm">
                <li className={formData.primary_city ? 'text-green-600' : 'text-red-600'}>
                  {formData.primary_city ? '✓' : '✗'} Primary City
                </li>
                <li className={formData.primary_state ? 'text-green-600' : 'text-red-600'}>
                  {formData.primary_state ? '✓' : '✗'} Primary State
                </li>
                <li className={formData.move_in_date ? 'text-green-600' : 'text-red-600'}>
                  {formData.move_in_date ? '✓' : '✗'} Move-in Date
                </li>
              </ul>
            </div>
            
            <div>
              <strong>Required Budget Fields:</strong>
              <ul className="mt-2 text-sm">
                <li className={formData.budget_min ? 'text-green-600' : 'text-red-600'}>
                  {formData.budget_min ? '✓' : '✗'} Minimum Budget
                </li>
                <li className={formData.budget_max ? 'text-green-600' : 'text-red-600'}>
                  {formData.budget_max ? '✓' : '✗'} Maximum Budget
                </li>
                <li className={(formData.housing_types_accepted || []).length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {(formData.housing_types_accepted || []).length > 0 ? '✓' : '✗'} Housing Types
                </li>
              </ul>
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

LocationPreferencesSection.propTypes = {
  formData: PropTypes.shape({
    primary_city: PropTypes.string,
    primary_state: PropTypes.string,
    target_zip_codes: PropTypes.string,
    budget_min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    budget_max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    max_commute_minutes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    housing_types_accepted: PropTypes.arrayOf(PropTypes.string),
    move_in_date: PropTypes.string,
    move_in_flexibility: PropTypes.string,
    preferred_bedrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    transportation_method: PropTypes.string,
    lease_duration: PropTypes.string,
    location_flexibility: PropTypes.string,
    furnished_preference: PropTypes.bool,
    utilities_included_preference: PropTypes.bool,
    accessibility_needed: PropTypes.bool,
    parking_required: PropTypes.bool,
    public_transit_access: PropTypes.bool,
    pets_allowed: PropTypes.bool
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

LocationPreferencesSection.defaultProps = {
  profile: null,
  styles: {},
  fieldMapping: {},
  sectionId: 'location',
  isActive: false,
  validationMessage: null
};

export default LocationPreferencesSection;