// src/components/features/property/search/PropertyAdvancedFilters.js - UPDATED (Removed Duplicates)
import React from 'react';
import PropTypes from 'prop-types';
import { 
  propertyAmenities,
  accessibilityFeatures 
} from '../constants/propertyConstants';

// ✅ UPDATED: Import CSS module
import styles from './PropertyAdvancedFilters.module.css';

const PropertyAdvancedFilters = ({
  advancedFilters,
  onAdvancedFilterChange,
  onArrayFilterChange,
  loading
}) => {
  // ✅ Smoking policy options
  const smokingPolicyOptions = [
    { value: '', label: 'Any Smoking Policy' },
    { value: 'not_allowed', label: 'Non-Smoking Properties Only' },
    { value: 'allowed', label: 'Smoking Allowed Properties OK' }
  ];

  // ✅ Lease length options
  const leaseLengthOptions = [
    { value: '', label: 'Any Lease Length' },
    { value: '1', label: '1+ months minimum' },
    { value: '3', label: '3+ months minimum' },
    { value: '6', label: '6+ months minimum' },
    { value: '12', label: '12+ months minimum' },
    { value: '24', label: '24+ months minimum' }
  ];

  // ✅ Background check options
  const backgroundCheckOptions = [
    { value: '', label: 'Any Background Policy' },
    { value: 'required', label: 'Background Check Required OK' },
    { value: 'not_required', label: 'No Background Check Preferred' },
    { value: 'flexible', label: 'Flexible Background Policy' }
  ];

  return (
    <div className={styles.advancedFiltersContainer}>
      
      {/* ✅ UPDATED: Required Amenities */}
      <div className={styles.filterSection}>
        <h4 className={styles.sectionTitle}>Required Amenities</h4>
        <div className="form-group">
          <label className="label">Must-Have Amenities</label>
          <div className={styles.inputHint}>
            Select amenities that properties must have
          </div>
          <div className={styles.amenitiesGrid}>
            {propertyAmenities.map(amenity => (
              <div
                key={amenity}
                className={`${styles.amenityItem} ${advancedFilters.amenities?.includes(amenity) ? styles.selected : ''}`}
                onClick={() => onArrayFilterChange('advanced', 'amenities', amenity, !advancedFilters.amenities?.includes(amenity))}
              >
                <input
                  type="checkbox"
                  checked={advancedFilters.amenities?.includes(amenity) || false}
                  onChange={() => {}} // Handled by onClick
                  disabled={loading}
                />
                <span className={styles.amenityText}>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Accessibility Features */}
      <div className={styles.filterSection}>
        <h4 className={styles.sectionTitle}>Accessibility Features</h4>
        <div className="form-group">
          <label className="label">Required Accessibility Features</label>
          <div className={styles.inputHint}>
            Select accessibility features that properties must have
          </div>
          <div className={styles.accessibilityGrid}>
            {accessibilityFeatures.map(feature => (
              <div
                key={feature}
                className={`${styles.accessibilityItem} ${advancedFilters.accessibilityFeatures?.includes(feature) ? styles.selected : ''}`}
                onClick={() => onArrayFilterChange('advanced', 'accessibilityFeatures', feature, !advancedFilters.accessibilityFeatures?.includes(feature))}
              >
                <input
                  type="checkbox"
                  checked={advancedFilters.accessibilityFeatures?.includes(feature) || false}
                  onChange={() => {}} // Handled by onClick
                  disabled={loading}
                />
                <span className={styles.accessibilityText}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Property Policies & Requirements */}
      <div className={styles.filterSection}>
        <h4 className={styles.sectionTitle}>Property Policies & Requirements</h4>
        <div className={styles.policiesGrid}>
          <div className="form-group">
            <label className="label">Smoking Policy</label>
            <select
              className="input"
              value={advancedFilters.smokingPolicy}
              onChange={(e) => onAdvancedFilterChange('smokingPolicy', e.target.value)}
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
              value={advancedFilters.leaseLength}
              onChange={(e) => onAdvancedFilterChange('leaseLength', e.target.value)}
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
              value={advancedFilters.backgroundCheck}
              onChange={(e) => onAdvancedFilterChange('backgroundCheck', e.target.value)}
              disabled={loading}
            >
              {backgroundCheckOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Guest Policy</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., 'Overnight guests allowed', 'No guests'"
              value={advancedFilters.guestPolicy}
              onChange={(e) => onAdvancedFilterChange('guestPolicy', e.target.value)}
              disabled={loading}
            />
            <div className={styles.inputHint}>
              Describe your guest policy preferences
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Move-in Costs */}
      <div className={styles.filterSection}>
        <h4 className={styles.sectionTitle}>Move-in Costs</h4>
        <div className="form-group">
          <label className="label">Maximum Move-in Cost</label>
          <input
            className="input"
            type="number"
            placeholder="e.g., 2000"
            value={advancedFilters.moveInCost}
            onChange={(e) => onAdvancedFilterChange('moveInCost', e.target.value)}
            disabled={loading}
            min="0"
            step="100"
          />
          <div className={styles.inputHint}>
            Total upfront costs including deposits, fees, and first month's rent
          </div>
        </div>
      </div>
    </div>
  );
};

PropertyAdvancedFilters.propTypes = {
  advancedFilters: PropTypes.shape({
    acceptedSubsidies: PropTypes.array.isRequired,
    amenities: PropTypes.array.isRequired,
    utilitiesIncluded: PropTypes.array.isRequired,
    accessibilityFeatures: PropTypes.array,
    smokingPolicy: PropTypes.string.isRequired,
    guestPolicy: PropTypes.string.isRequired,
    backgroundCheck: PropTypes.string.isRequired,
    leaseLength: PropTypes.string.isRequired,
    moveInCost: PropTypes.string.isRequired
  }).isRequired,
  onAdvancedFilterChange: PropTypes.func.isRequired,
  onArrayFilterChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default PropertyAdvancedFilters;