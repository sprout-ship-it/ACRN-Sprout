// src/components/features/property/sections/PropertyAmenitiesSection.js - CLEANED FOR GENERAL AMENITIES ONLY
import React from 'react';
import PropTypes from 'prop-types';
import { 
  propertyAmenities,
  accessibilityFeatures,
  neighborhoodFeatures
} from '../constants/propertyConstants';

// ✅ Import CSS module
import styles from './PropertyAmenitiesSection.module.css';

const PropertyAmenitiesSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  return (
    <>
      <h3 className="card-title mb-4">Property Amenities & Features</h3>
      
      {/* ✅ SHARED: Property Amenities */}
      <div className="form-group mb-4">
        <label className="label">
          Property Amenities
        </label>
        <div className={styles.helpTextLarge}>
          Select all amenities available at your property. This helps potential residents find what they're looking for.
        </div>
        <div className={styles.checkboxColumns}>
          {propertyAmenities.map(amenity => (
            <label key={amenity} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.amenities?.includes(amenity) || false}
                onChange={(e) => onArrayChange('amenities', amenity, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText}>{amenity}</span>
            </label>
          ))}
        </div>
        {errors.amenities && (
          <div className="text-red-500 mt-1">{errors.amenities}</div>
        )}
      </div>

      {/* ✅ SHARED: Accessibility Features */}
      <div className="form-group mb-4">
        <label className="label">
          Accessibility Features
        </label>
        <div className={styles.helpTextLarge}>
          Select accessibility features available at your property.
        </div>
        <div className={styles.checkboxColumnsCompact}>
          {accessibilityFeatures.map(feature => (
            <label key={feature} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.accessibility_features?.includes(feature) || false}
                onChange={(e) => onArrayChange('accessibility_features', feature, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText}>{feature}</span>
            </label>
          ))}
        </div>
        {errors.accessibility_features && (
          <div className="text-red-500 mt-1">{errors.accessibility_features}</div>
        )}
      </div>

      {/* ✅ SHARED: Neighborhood Features */}
      <div className="form-group mb-4">
        <label className="label">
          Neighborhood Characteristics
        </label>
        <div className={styles.helpTextLarge}>
          Describe the neighborhood and nearby amenities.
        </div>
        <div className={styles.checkboxColumnsCompact}>
          {neighborhoodFeatures.map(feature => (
            <label key={feature} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.neighborhood_features?.includes(feature) || false}
                onChange={(e) => onArrayChange('neighborhood_features', feature, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText}>{feature}</span>
            </label>
          ))}
        </div>
        {errors.neighborhood_features && (
          <div className="text-red-500 mt-1">{errors.neighborhood_features}</div>
        )}
      </div>

      {/* ✅ SHARED: General Property Policies (moved from Recovery section) */}
      <h4 className={styles.cardSubtitle}>Property Policies</h4>
      
      <div className={styles.policiesGrid}>
        <div className={styles.policyGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="pets_allowed"
              checked={formData.pets_allowed || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Pets Allowed</span>
          </label>
          <div className={styles.helpText}>
            Residents can have pets (specify restrictions in additional notes if needed)
          </div>
        </div>
        
        <div className={styles.policyGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="smoking_allowed"
              checked={formData.smoking_allowed || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Smoking Allowed (Designated Areas)</span>
          </label>
          <div className={styles.helpText}>
            Smoking permitted in designated outdoor areas only
          </div>
        </div>
      </div>

      {/* ✅ SHARED: Additional Information */}
      <div className="form-group mb-4">
        <label className="label">Additional Information</label>
        <textarea
          className="input"
          name="additional_notes"
          value={formData.additional_notes || ''}
          onChange={onInputChange}
          placeholder="Any additional information about your property, special features, or unique amenities..."
          style={{ minHeight: '80px', resize: 'vertical' }}
          disabled={loading}
          maxLength="750"
        />
        <div className={styles.characterCounter}>
          {(formData.additional_notes?.length || 0)}/750 characters
        </div>
      </div>
    </>
  );
};

PropertyAmenitiesSection.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default PropertyAmenitiesSection;