// src/components/features/property/search/PropertySearchFilters.js - UPDATED WITH CSS MODULE
import React from 'react';
import PropTypes from 'prop-types';
import { propertyTypes } from '../constants/propertyConstants';

// ✅ UPDATED: Import CSS module
import styles from './PropertySearchFilters.module.css';

const PropertySearchFilters = ({
  basicFilters,
  onBasicFilterChange,
  onArrayFilterChange,
  onUseMyPreferences,
  onManualSearch,
  onClearAllFilters,
  userPreferences,
  loading
}) => {
  // ✅ State options - could be moved to constants file later
  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // ✅ Rent range options
  const rentRangeOptions = [
    { value: '', label: 'Any price' },
    { value: '500', label: 'Up to $500' },
    { value: '750', label: 'Up to $750' },
    { value: '1000', label: 'Up to $1,000' },
    { value: '1500', label: 'Up to $1,500' },
    { value: '2000', label: 'Up to $2,000' },
    { value: '2500', label: 'Up to $2,500' },
    { value: '3000', label: 'Up to $3,000' },
    { value: '4000', label: 'Up to $4,000' },
    { value: '5000', label: 'Up to $5,000' }
  ];

  // ✅ Bedroom options
  const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: '0', label: 'Studio' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' }
  ];

  // ✅ Filter housing types for basic search (general + recovery types)
  const basicHousingTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'studio', label: 'Studio' },
    { value: 'shared_room', label: 'Shared Room' },
    ...propertyTypes // Include all recovery housing types
  ];

  return (
    <div className="card mb-4">
      <div className="card-header">
        <div className={styles.filterHeader}>
          <h3 className="card-title">Basic Housing Criteria</h3>
          {userPreferences && (
            <button
              className="btn btn-outline btn-sm"
              onClick={onUseMyPreferences}
              disabled={loading}
            >
              <span className={styles.btnIcon}>⚙️</span>
              Use My Preferences
            </button>
          )}
        </div>
      </div>
      
      {/* ✅ UPDATED: Primary Filter Controls */}
      <div className={styles.filterSection}>
        <div className={styles.filterGrid}>
          <div className="form-group">
            <label className="label">Location</label>
            <input
              className="input"
              type="text"
              placeholder="City, State, or Address"
              value={basicFilters.location}
              onChange={(e) => onBasicFilterChange('location', e.target.value)}
              disabled={loading}
            />
            <div className={styles.inputHint}>
              Search by city, state, or specific address
            </div>
          </div>

          <div className="form-group">
            <label className="label">State</label>
            <select
              className="input"
              value={basicFilters.state}
              onChange={(e) => onBasicFilterChange('state', e.target.value)}
              disabled={loading}
            >
              <option value="">Any State</option>
              {stateOptions.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Max Monthly Rent</label>
            <select
              className="input"
              value={basicFilters.maxRent}
              onChange={(e) => onBasicFilterChange('maxRent', e.target.value)}
              disabled={loading}
            >
              {rentRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Min Bedrooms</label>
            <select
              className="input"
              value={basicFilters.minBedrooms}
              onChange={(e) => onBasicFilterChange('minBedrooms', e.target.value)}
              disabled={loading}
            >
              {bedroomOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Housing Types Selection */}
      <div className={styles.filterSection}>
        <div className="form-group">
          <label className="label">Housing Types</label>
          <div className={styles.inputHint}>
            Select all housing types that work for you
          </div>
          <div className={styles.housingTypeGrid}>
            {basicHousingTypes.map(type => (
              <div
                key={type.value}
                className={`checkbox-item ${basicFilters.housingType.includes(type.value) ? 'selected' : ''}`}
                onClick={() => onArrayFilterChange('basic', 'housingType', type.value, !basicFilters.housingType.includes(type.value))}
              >
                <input
                  type="checkbox"
                  checked={basicFilters.housingType.includes(type.value)}
                  onChange={() => {}} // Handled by onClick
                  disabled={loading}
                />
                <span className="checkbox-text">{type.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Quick Filters & Actions */}
      <div className={styles.filterSection}>
        <div className={styles.quickFiltersGrid}>
          <div className={styles.quickFilters}>
            <div 
              className={`checkbox-item ${basicFilters.furnished ? 'selected' : ''}`}
              onClick={() => onBasicFilterChange('furnished', !basicFilters.furnished)}
            >
              <input
                type="checkbox"
                checked={basicFilters.furnished}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <span className="checkbox-text">Furnished</span>
            </div>
            
            <div 
              className={`checkbox-item ${basicFilters.petsAllowed ? 'selected' : ''}`}
              onClick={() => onBasicFilterChange('petsAllowed', !basicFilters.petsAllowed)}
            >
              <input
                type="checkbox"
                checked={basicFilters.petsAllowed}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <span className="checkbox-text">Pet Friendly</span>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button
              className="btn btn-primary"
              onClick={onManualSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={`${styles.loadingSpinner} ${styles.small}`}></span>
                  Searching...
                </>
              ) : (
                <>
                  <span className={styles.btnIcon}>🔍</span>
                  Search Housing
                </>
              )}
            </button>

            <button
              className="btn btn-outline"
              onClick={onClearAllFilters}
              disabled={loading}
            >
              <span className={styles.btnIcon}>🗑️</span>
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

PropertySearchFilters.propTypes = {
  basicFilters: PropTypes.shape({
    location: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    maxRent: PropTypes.string.isRequired,
    minBedrooms: PropTypes.string.isRequired,
    housingType: PropTypes.array.isRequired,
    furnished: PropTypes.bool.isRequired,
    petsAllowed: PropTypes.bool.isRequired,
    utilityBudget: PropTypes.string
  }).isRequired,
  onBasicFilterChange: PropTypes.func.isRequired,
  onArrayFilterChange: PropTypes.func.isRequired,
  onUseMyPreferences: PropTypes.func.isRequired,
  onManualSearch: PropTypes.func.isRequired,
  onClearAllFilters: PropTypes.func.isRequired,
  userPreferences: PropTypes.object,
  loading: PropTypes.bool.isRequired
};

export default PropertySearchFilters;