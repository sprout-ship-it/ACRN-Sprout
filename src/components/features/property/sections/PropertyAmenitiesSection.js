// src/components/features/property/sections/PropertyAmenitiesSection.js - UPDATED WITH CSS MODULE
import React from 'react';
import PropTypes from 'prop-types';
import { 
  propertyAmenities,
  accessibilityFeatures,
  neighborhoodFeatures
} from '../constants/propertyConstants';

// ✅ UPDATED: Import CSS module
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
      <h3 className="card-title mb-4">Amenities & Services</h3>
      
      {/* ✅ UPDATED: Property Amenities with CSS module */}
      <div className="form-group mb-4">
        <label className="label">
          Property Amenities
        </label>
        <div className={styles.helpTextLarge}>
          Select all amenities available at your property. This helps residents find what they're looking for.
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

      {/* ✅ UPDATED: Accessibility Features with CSS module */}
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

      {/* ✅ UPDATED: Neighborhood Features with CSS module */}
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

      {/* ✅ UPDATED: Support Services with CSS module */}
      <h4 className={styles.cardSubtitle}>Support Services Available</h4>
      
      <div className={styles.servicesGrid}>
        <div className={styles.serviceGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="case_management"
              checked={formData.case_management || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Case Management Services</span>
          </label>
          <div className={styles.helpText}>
            Professional case management available on-site
          </div>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="counseling_services"
              checked={formData.counseling_services || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Counseling Services</span>
          </label>
          <div className={styles.helpText}>
            Individual or group counseling available
          </div>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="job_training"
              checked={formData.job_training || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Job Training/Placement</span>
          </label>
          <div className={styles.helpText}>
            Employment assistance and job training programs
          </div>
        </div>
        
        <div className={styles.serviceGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="medical_services"
              checked={formData.medical_services || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Medical Services</span>
          </label>
          <div className={styles.helpText}>
            On-site medical care or clinic access
          </div>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="transportation_services"
              checked={formData.transportation_services || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Transportation Services</span>
          </label>
          <div className={styles.helpText}>
            Transportation assistance for appointments/work
          </div>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="life_skills_training"
              checked={formData.life_skills_training || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Life Skills Training</span>
          </label>
          <div className={styles.helpText}>
            Training in daily living and independent living skills
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Licensing & Certification with CSS module */}
      <h4 className={styles.cardSubtitle}>Licensing & Certification</h4>
      
      <div className={styles.licensingGrid}>
        <div className="form-group">
          <label className="label">License Number</label>
          <input
            className="input"
            type="text"
            name="license_number"
            value={formData.license_number || ''}
            onChange={onInputChange}
            placeholder="State licensing number (if required)"
            disabled={loading}
          />
          <div className={styles.helpText}>
            Required in some states for recovery housing
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Accreditation</label>
          <input
            className="input"
            type="text"
            name="accreditation"
            value={formData.accreditation || ''}
            onChange={onInputChange}
            placeholder="e.g., NARR, CARF, State certification"
            disabled={loading}
          />
          <div className={styles.helpText}>
            Professional certifications or accreditations
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Property Status with CSS module */}
      <h4 className={styles.cardSubtitle}>Property Status</h4>
      
      <div className={styles.statusGrid}>
        <div className="form-group">
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="accepting_applications"
              checked={formData.accepting_applications !== false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Currently Accepting Applications</span>
          </label>
          <div className={styles.helpText}>
            Uncheck to temporarily stop receiving new applications
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Property Status</label>
          <select
            className="input"
            name="property_status"
            value={formData.property_status || 'available'}
            onChange={onInputChange}
            disabled={loading}
          >
            <option value="available">Available</option>
            <option value="waitlist">Waitlist Only</option>
            <option value="full">Currently Full</option>
            <option value="temporarily_closed">Temporarily Closed</option>
            <option value="under_renovation">Under Renovation</option>
          </select>
        </div>
      </div>

      {/* ✅ UPDATED: Additional Notes with CSS module */}
      <div className="form-group mb-4">
        <label className="label">Additional Information</label>
        <textarea
          className="input"
          name="additional_notes"
          value={formData.additional_notes || ''}
          onChange={onInputChange}
          placeholder="Any additional information about your property, special programs, or unique features..."
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