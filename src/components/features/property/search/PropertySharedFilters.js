// src/components/features/property/search/PropertySharedFilters.js - Reorganized Single Form
import React from 'react';
import PropTypes from 'prop-types';
import { acceptedSubsidyPrograms } from '../constants/propertyConstants';

// ✅ Import CSS module
import styles from './PropertySharedFilters.module.css';

const PropertySharedFilters = ({
  sharedFilters,
  onSharedFilterChange,
  onArrayFilterChange,
  onUseMyPreferences,
  userPreferences,
  loading
}) => {
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

  // ✅ NEW: Smoking policy options (from Advanced)
  const smokingPolicyOptions = [
    { value: '', label: 'Any Smoking Policy' },
    { value: 'not_allowed', label: 'Non-Smoking Only' },
    { value: 'allowed', label: 'Smoking Allowed OK' }
  ];

  // ✅ NEW: Lease length options (from Advanced)
  const leaseLengthOptions = [
    { value: '', label: 'Any Lease Length' },
    { value: '1', label: '1+ months' },
    { value: '3', label: '3+ months' },
    { value: '6', label: '6+ months' },
    { value: '12', label: '12+ months' }
  ];

  // ✅ NEW: Background check options (from Advanced)
  const backgroundCheckOptions = [
    { value: '', label: 'Any Background Policy' },
    { value: 'not_required', label: 'No Background Check Preferred' },
    { value: 'required', label: 'Background Check OK' },
    { value: 'flexible', label: 'Flexible Policy' }
  ];

  // ✅ Utility options (exactly 6 for even grid)
  const utilityOptions = [
    { value: 'electricity', label: 'Electricity' },
    { value: 'water', label: 'Water' }, 
    { value: 'gas', label: 'Gas' },
    { value: 'internet', label: 'Internet/WiFi' },
    { value: 'heating', label: 'Heating' },
    { value: 'trash', label: 'Trash Collection' }
  ];

  return (
    <div className={styles.basicFiltersForm}>
      {/* ✅ User Preferences Button */}
      {userPreferences && (
        <div className={styles.preferencesSection}>
          <button
            className="btn btn-outline"
            onClick={onUseMyPreferences}
            disabled={loading}
          >
            <span className={styles.btnIcon}>⚙️</span>
            Use My Preferences
          </button>
          <span className={styles.preferencesHint}>
            Auto-fill filters from your profile
          </span>
        </div>
      )}

      {/* ✅ SECTION 1: Location */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionHeader}>📍 Location</h4>
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
          </div>
        </div>
      </div>

      {/* ✅ SECTION 2: Financial & Housing Details */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionHeader}>💰 Financial & Housing Details</h4>
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
          </div>
        </div>
      </div>

      {/* ✅ SECTION 3: Property Requirements (NEW - from Advanced) */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionHeader}>📋 Property Requirements</h4>
        <div className={styles.requirementsGrid}>
          <div className="form-group">
            <label className="label">Smoking Policy</label>
            <select
              className="input"
              value={sharedFilters.smokingPolicy || ''}
              onChange={(e) => onSharedFilterChange('smokingPolicy', e.target.value)}
              disabled={loading}
            >
              {smokingPolicyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Minimum Lease Length</label>
            <select
              className="input"
              value={sharedFilters.leaseLength || ''}
              onChange={(e) => onSharedFilterChange('leaseLength', e.target.value)}
              disabled={loading}
            >
              {leaseLengthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Background Check Policy</label>
            <select
              className="input"
              value={sharedFilters.backgroundCheck || ''}
              onChange={(e) => onSharedFilterChange('backgroundCheck', e.target.value)}
              disabled={loading}
            >
              {backgroundCheckOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ✅ SECTION 4: Property Features */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionHeader}>⭐ Property Features</h4>
        <div className={styles.featuresGrid}>
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
      </div>

      {/* ✅ SECTION 5: Housing Assistance Programs */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionHeader}>🏛️ Housing Assistance Programs</h4>
        <p className={styles.sectionDescription}>
          Select programs you qualify for - properties accepting these will be prioritized
        </p>
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

      {/* ✅ SECTION 6: Utilities Included (3x2 even grid) */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionHeader}>💡 Utilities Included in Rent</h4>
        <p className={styles.sectionDescription}>
          Select utilities you prefer to be included in monthly rent
        </p>
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
    smokingPolicy: PropTypes.string,
    leaseLength: PropTypes.string,
    backgroundCheck: PropTypes.string,
    acceptedSubsidies: PropTypes.array.isRequired,
    furnished: PropTypes.bool.isRequired,
    petsAllowed: PropTypes.bool.isRequired,
    smokingAllowed: PropTypes.bool.isRequired,
    utilitiesIncluded: PropTypes.array.isRequired
  }).isRequired,
  onSharedFilterChange: PropTypes.func.isRequired,
  onArrayFilterChange: PropTypes.func.isRequired,
  onUseMyPreferences: PropTypes.func.isRequired,
  userPreferences: PropTypes.object,
  loading: PropTypes.bool.isRequired
};

export default PropertySharedFilters;