// src/components/features/property/search/PropertySharedFilters.js - Collapsible with Search at Bottom
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { acceptedSubsidyPrograms } from '../constants/propertyConstants';

// ✅ Import CSS module
import styles from './PropertySharedFilters.module.css';

const PropertySharedFilters = ({
  sharedFilters,
  onSharedFilterChange,
  onArrayFilterChange,
  onUseMyPreferences,
  onManualSearch,
  onClearAllFilters,
  userPreferences,
  loading,
  searchType
}) => {
  // ✅ Collapsible section state - only location open by default
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    financial: false,
    features: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ✅ Scroll to results function
  const handleSearchAndNavigate = () => {
    onManualSearch();
    // Scroll to results after a brief delay
    setTimeout(() => {
      const resultsElement = document.querySelector('[data-results-section]');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  // ✅ State options
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
    { value: '400', label: 'Up to $400' },
    { value: '600', label: 'Up to $600' },
    { value: '800', label: 'Up to $800' },
    { value: '1000', label: 'Up to $1,000' },
    { value: '1250', label: 'Up to $1,250' },
    { value: '1500', label: 'Up to $1,500' },
    { value: '2000', label: 'Up to $2,000' },
    { value: '2500', label: 'Up to $2,500' },
    { value: '3000', label: 'Up to $3,000' }
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

  // ✅ Utility options
  const utilityOptions = [
    { value: 'electricity', label: 'Electricity' },
    { value: 'water', label: 'Water' }, 
    { value: 'gas', label: 'Gas' },
    { value: 'internet', label: 'Internet/WiFi' },
    { value: 'heating', label: 'Heating' },
    { value: 'trash', label: 'Trash Collection' }
  ];

  return (
    <div className={styles.sharedFiltersContainer}>
      {/* ✅ SECTION 1: Location & Basic Search - Collapsible */}
      <div className="card mb-4">
        <div 
          className={`card-header ${styles.collapsibleHeader}`}
          onClick={() => toggleSection('location')}
        >
          <div className={styles.filterHeader}>
            <h3 className="card-title">
              <span className={styles.sectionIcon}>📍</span>
              Location & Basic Criteria
            </h3>
            <div className={styles.headerActions}>
              {userPreferences && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUseMyPreferences();
                  }}
                  disabled={loading}
                >
                  <span className={styles.btnIcon}>⚙️</span>
                  Use My Preferences
                </button>
              )}
              <span className={`${styles.expandIcon} ${expandedSections.location ? styles.expanded : ''}`}>
                ▼
              </span>
            </div>
          </div>
        </div>
        
        {expandedSections.location && (
          <div className={styles.filterSection}>
            <div className={styles.locationGrid}>
              <div className="form-group">
                <label className="label">City or Address</label>
                <input
                  className="input"
                  type="text"
                  placeholder="City or street address"
                  value={sharedFilters.location}
                  onChange={(e) => onSharedFilterChange('location', e.target.value)}
                  disabled={loading}
                />
                <div className={styles.inputHint}>
                  Search by city name or specific address
                </div>
              </div>

              <div className="form-group">
                <label className="label">State</label>
                <select
                  className="input"
                  value={sharedFilters.state}
                  onChange={(e) => onSharedFilterChange('state', e.target.value)}
                  disabled={loading}
                >
                  <option value="">Any State</option>
                  {stateOptions.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">ZIP Code</label>
                <input
                  className="input"
                  type="text"
                  placeholder="ZIP code"
                  value={sharedFilters.zipCode || ''}
                  onChange={(e) => onSharedFilterChange('zipCode', e.target.value)}
                  disabled={loading}
                  maxLength="10"
                />
                <div className={styles.inputHint}>
                  Search specific ZIP code area
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ SECTION 2: Financial & Housing Details - Collapsible */}
      <div className="card mb-4">
        <div 
          className={`card-header ${styles.collapsibleHeader}`}
          onClick={() => toggleSection('financial')}
        >
          <h3 className="card-title">
            <span className={styles.sectionIcon}>💰</span>
            Financial & Housing Details
            <span className={`${styles.expandIcon} ${expandedSections.financial ? styles.expanded : ''}`}>
              ▼
            </span>
          </h3>
        </div>
        
        {expandedSections.financial && (
          <div className={styles.filterSection}>
            <div className={styles.financialGrid}>
              <div className="form-group">
                <label className="label">Maximum Monthly Rent</label>
                <select
                  className="input"
                  value={sharedFilters.maxRent}
                  onChange={(e) => onSharedFilterChange('maxRent', e.target.value)}
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
                <label className="label">Minimum Bedrooms</label>
                <select
                  className="input"
                  value={sharedFilters.minBedrooms}
                  onChange={(e) => onSharedFilterChange('minBedrooms', e.target.value)}
                  disabled={loading}
                >
                  {bedroomOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Available Date</label>
                <input
                  className="input"
                  type="date"
                  value={sharedFilters.availableDate}
                  onChange={(e) => onSharedFilterChange('availableDate', e.target.value)}
                  disabled={loading}
                  min={new Date().toISOString().split('T')[0]}
                />
                <div className={styles.inputHint}>
                  When do you need to move in?
                </div>
              </div>
            </div>

            {/* Housing Assistance Programs */}
            <div className={styles.subsidiesSection}>
              <div className="form-group">
                <label className="label">Housing Assistance Programs</label>
                <div className={styles.inputHint}>
                  Select programs you qualify for (properties that accept these will be prioritized)
                </div>
                <div className={styles.subsidiesGrid}>
                  {acceptedSubsidyPrograms.slice(0, 6).map(subsidy => (
                    <div
                      key={subsidy.value}
                      className={`${styles.subsidyItem} ${sharedFilters.acceptedSubsidies?.includes(subsidy.value) ? styles.selected : ''}`}
                      onClick={() => onArrayFilterChange('shared', 'acceptedSubsidies', subsidy.value, !sharedFilters.acceptedSubsidies?.includes(subsidy.value))}
                    >
                      <input
                        type="checkbox"
                        checked={sharedFilters.acceptedSubsidies?.includes(subsidy.value) || false}
                        onChange={() => {}} // Handled by onClick
                        disabled={loading}
                      />
                      <span className={styles.subsidyText}>{subsidy.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ SECTION 3: Property Features & Amenities - Collapsible */}
      <div className="card mb-4">
        <div 
          className={`card-header ${styles.collapsibleHeader}`}
          onClick={() => toggleSection('features')}
        >
          <h3 className="card-title">
            <span className={styles.sectionIcon}>⭐</span>
            Property Features & Amenities
            <span className={`${styles.expandIcon} ${expandedSections.features ? styles.expanded : ''}`}>
              ▼
            </span>
          </h3>
        </div>
        
        {expandedSections.features && (
          <div className={styles.filterSection}>
            {/* Basic Property Features */}
            <div className={styles.basicFeaturesGrid}>
              <div 
                className={`checkbox-item ${sharedFilters.furnished ? 'selected' : ''}`}
                onClick={() => onSharedFilterChange('furnished', !sharedFilters.furnished)}
              >
                <input
                  type="checkbox"
                  checked={sharedFilters.furnished}
                  onChange={() => {}} // Handled by onClick
                  disabled={loading}
                />
                <span className="checkbox-text">Furnished</span>
              </div>
              
              <div 
                className={`checkbox-item ${sharedFilters.petsAllowed ? 'selected' : ''}`}
                onClick={() => onSharedFilterChange('petsAllowed', !sharedFilters.petsAllowed)}
              >
                <input
                  type="checkbox"
                  checked={sharedFilters.petsAllowed}
                  onChange={() => {}} // Handled by onClick
                  disabled={loading}
                />
                <span className="checkbox-text">Pet Friendly</span>
              </div>

              <div 
                className={`checkbox-item ${sharedFilters.smokingAllowed ? 'selected' : ''}`}
                onClick={() => onSharedFilterChange('smokingAllowed', !sharedFilters.smokingAllowed)}
              >
                <input
                  type="checkbox"
                  checked={sharedFilters.smokingAllowed}
                  onChange={() => {}} // Handled by onClick
                  disabled={loading}
                />
                <span className="checkbox-text">Smoking Allowed</span>
              </div>
            </div>

            {/* Utilities Included */}
            <div className={styles.utilitiesSection}>
              <div className="form-group">
                <label className="label">Utilities Included (Priority)</label>
                <div className={styles.inputHint}>
                  Select utilities you prefer to be included in rent
                </div>
                <div className={styles.utilitiesGrid}>
                  {utilityOptions.map(utility => (
                    <div
                      key={utility.value}
                      className={`${styles.utilityItem} ${sharedFilters.utilitiesIncluded?.includes(utility.value) ? styles.selected : ''}`}
                      onClick={() => onArrayFilterChange('shared', 'utilitiesIncluded', utility.value, !sharedFilters.utilitiesIncluded?.includes(utility.value))}
                    >
                      <input
                        type="checkbox"
                        checked={sharedFilters.utilitiesIncluded?.includes(utility.value) || false}
                        onChange={() => {}} // Handled by onClick
                        disabled={loading}
                      />
                      <span className={styles.utilityText}>{utility.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ SECTION 4: Search Actions - MOVED TO BOTTOM */}
      <div className="card mb-4">
        <div className={styles.searchActionsSection}>
          <div className={styles.searchSummary}>
            <div className={styles.summaryContent}>
              <span className={styles.summaryIcon}>🔍</span>
              <div className={styles.summaryText}>
                <strong>Searching:</strong> {
                  searchType === 'all_housing' ? 'All Housing Types' :
                  searchType === 'general_only' ? 'General Rentals Only' :
                  'Recovery Housing Only'
                }
              </div>
            </div>
            
            <div className={styles.actionButtons}>
              <button
                className="btn btn-primary"
                onClick={handleSearchAndNavigate}
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
                    Search Properties
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
    </div>
  );
};

PropertySharedFilters.propTypes = {
  sharedFilters: PropTypes.shape({
    location: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    zipCode: PropTypes.string,
    maxRent: PropTypes.string.isRequired,
    minBedrooms: PropTypes.string.isRequired,
    availableDate: PropTypes.string.isRequired,
    acceptedSubsidies: PropTypes.array.isRequired,
    furnished: PropTypes.bool.isRequired,
    petsAllowed: PropTypes.bool.isRequired,
    smokingAllowed: PropTypes.bool.isRequired,
    utilitiesIncluded: PropTypes.array.isRequired
  }).isRequired,
  onSharedFilterChange: PropTypes.func.isRequired,
  onArrayFilterChange: PropTypes.func.isRequired,
  onUseMyPreferences: PropTypes.func.isRequired,
  onManualSearch: PropTypes.func.isRequired,
  onClearAllFilters: PropTypes.func.isRequired,
  userPreferences: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  searchType: PropTypes.oneOf(['all_housing', 'general_only', 'recovery_only']).isRequired
};

export default PropertySharedFilters;