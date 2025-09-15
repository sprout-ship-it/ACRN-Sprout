// src/components/property/sections/PropertyAmenitiesSection.js
import React from 'react';
import PropTypes from 'prop-types';
import { 
  propertyAmenities,
  accessibilityFeatures,
  neighborhoodFeatures
} from '../constants/propertyConstants';

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
      
      {/* Property Amenities */}
      <div className="form-group mb-4">
        <label className="label">
          Property Amenities
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select all amenities available at your property. This helps residents find what they're looking for.
        </div>
        <div className="checkbox-columns">
          {propertyAmenities.map(amenity => (
            <label key={amenity} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.amenities?.includes(amenity) || false}
                onChange={(e) => onArrayChange('amenities', amenity, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">{amenity}</span>
            </label>
          ))}
        </div>
        {errors.amenities && (
          <div className="text-red-500 mt-1">{errors.amenities}</div>
        )}
      </div>

      {/* Accessibility Features */}
      <div className="form-group mb-4">
        <label className="label">
          Accessibility Features
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Select accessibility features available at your property.
        </div>
        <div className="checkbox-columns-compact">
          {accessibilityFeatures.map(feature => (
            <label key={feature} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.accessibility_features?.includes(feature) || false}
                onChange={(e) => onArrayChange('accessibility_features', feature, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">{feature}</span>
            </label>
          ))}
        </div>
        {errors.accessibility_features && (
          <div className="text-red-500 mt-1">{errors.accessibility_features}</div>
        )}
      </div>

      {/* Neighborhood Features */}
      <div className="form-group mb-4">
        <label className="label">
          Neighborhood Characteristics
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          Describe the neighborhood and nearby amenities.
        </div>
        <div className="checkbox-columns-compact">
          {neighborhoodFeatures.map(feature => (
            <label key={feature} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.neighborhood_features?.includes(feature) || false}
                onChange={(e) => onArrayChange('neighborhood_features', feature, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">{feature}</span>
            </label>
          ))}
        </div>
        {errors.neighborhood_features && (
          <div className="text-red-500 mt-1">{errors.neighborhood_features}</div>
        )}
      </div>

      {/* Support Services */}
      <h4 className="card-subtitle mb-3">Support Services Available</h4>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="case_management"
              checked={formData.case_management || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Case Management Services</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            Professional case management available on-site
          </div>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="counseling_services"
              checked={formData.counseling_services || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Counseling Services</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            Individual or group counseling available
          </div>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="job_training"
              checked={formData.job_training || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Job Training/Placement</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            Employment assistance and job training programs
          </div>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="medical_services"
              checked={formData.medical_services || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Medical Services</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            On-site medical care or clinic access
          </div>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="transportation_services"
              checked={formData.transportation_services || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Transportation Services</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            Transportation assistance for appointments/work
          </div>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="life_skills_training"
              checked={formData.life_skills_training || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Life Skills Training</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
            Training in daily living and independent living skills
          </div>
        </div>
      </div>

      {/* Licensing & Certification */}
      <h4 className="card-subtitle mb-3">Licensing & Certification</h4>
      
      <div className="grid-2 mb-4">
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
          <div className="text-gray-500 mt-1 text-sm">
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
          <div className="text-gray-500 mt-1 text-sm">
            Professional certifications or accreditations
          </div>
        </div>
      </div>

      {/* Property Status */}
      <h4 className="card-subtitle mb-3">Property Status</h4>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="accepting_applications"
              checked={formData.accepting_applications !== false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Currently Accepting Applications</span>
          </label>
          <div className="text-gray-500 mt-1 text-sm">
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

      {/* Additional Notes */}
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
        <div className="text-gray-500 mt-1 text-sm">
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