// src/components/features/property/sections/PropertyAmenitiesSection.js - REORGANIZED WITH GROUPED AMENITIES
import React from 'react';
import PropTypes from 'prop-types';

// ✅ Import CSS module
import styles from './PropertyAmenitiesSection.module.css';

const PropertyAmenitiesSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  
  // ✅ REORGANIZED: Amenities grouped by category (matching search filters)
  const amenityGroups = {
    livingSpace: {
      title: 'Living Space',
      description: 'In-unit features and fixtures',
      amenities: [
        'In-Unit WiFi',
        'In-Unit Washer/Dryer',
        'Full Kitchen',
        'Air Conditioning',
        'Heating',
        'Dishwasher',
        'Microwave',
        'Refrigerator',
        'Private Bathroom',
        'Walk-in Closet',
        'Balcony/Patio',
        'Hardwood Floors',
        'Carpet',
        'Ceiling Fans'
      ]
    },
    propertyFeatures: {
      title: 'Property Features',
      description: 'Building-wide amenities and services',
      amenities: [
        'Parking (Covered)',
        'Parking (Garage)',
        'Parking (Street)',
        'Fitness Center',
        'Swimming Pool',
        'On-Site Laundry',
        'Package Receiving',
        'Bike Storage',
        'Storage Units',
        'Community Room',
        'BBQ/Picnic Area',
        'Playground',
        'Pet Amenities',
        'EV Charging'
      ]
    },
    neighborhood: {
      title: 'Neighborhood',
      description: 'Location and area features',
      amenities: [
        'Near Public Transit',
        'Near Shopping',
        'Near Parks',
        'Near Schools',
        'Near Healthcare',
        'Quiet Area',
        'Well-Lit Streets',
        'Sidewalks',
        'Bike Lanes',
        'Walkable Area'
      ]
    }
  };

  // ✅ REORGANIZED: Accessibility features grouped by category
  const accessibilityGroups = {
    mobility: {
      title: 'Mobility',
      description: 'Features for wheelchair users and mobility support',
      features: [
        'Wheelchair Accessible Entrance',
        'Wheelchair Accessible Bathroom',
        'Wheelchair Accessible Kitchen',
        'Ramps',
        'Elevator',
        'Wide Doorways (36")',
        'Wide Hallways',
        'Accessible Parking',
        'No Steps Entry',
        'Roll-in Shower'
      ]
    },
    usability: {
      title: 'Usability',
      description: 'Features for visual, auditory, and general accessibility needs',
      features: [
        'Grab Bars (Bathroom)',
        'Grab Bars (Shower)',
        'Lever Door Handles',
        'Adjustable Countertops',
        'Lower Light Switches',
        'Lower Thermostat',
        'Visual Alerts (Fire/Doorbell)',
        'Audio Alerts',
        'Braille Signage',
        'Service Animal Friendly'
      ]
    }
  };

  return (
    <>
      <h3 className={styles.sectionTitle}>Property Amenities & Features</h3>
      
      {/* ✅ AMENITIES SECTION */}
      <div className={styles.mainSection}>
        <h4 className={styles.mainSectionTitle}>🏠 Amenities</h4>
        <p className={styles.mainSectionDescription}>
          Select all amenities available at your property to help potential residents find what they're looking for.
        </p>

        {/* Living Space Subsection */}
        <div className={styles.subSection}>
          <h5 className={styles.subSectionTitle}>{amenityGroups.livingSpace.title}</h5>
          <p className={styles.subSectionHint}>{amenityGroups.livingSpace.description}</p>
          <div className={styles.checkboxGrid}>
            {amenityGroups.livingSpace.amenities.map(amenity => (
              <label key={amenity} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={formData.amenities?.includes(amenity) || false}
                  onChange={(e) => onArrayChange('amenities', amenity, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.checkboxText}>{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Property Features Subsection */}
        <div className={styles.subSection}>
          <h5 className={styles.subSectionTitle}>{amenityGroups.propertyFeatures.title}</h5>
          <p className={styles.subSectionHint}>{amenityGroups.propertyFeatures.description}</p>
          <div className={styles.checkboxGrid}>
            {amenityGroups.propertyFeatures.amenities.map(amenity => (
              <label key={amenity} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={formData.amenities?.includes(amenity) || false}
                  onChange={(e) => onArrayChange('amenities', amenity, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.checkboxText}>{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Neighborhood Subsection */}
        <div className={styles.subSection}>
          <h5 className={styles.subSectionTitle}>{amenityGroups.neighborhood.title}</h5>
          <p className={styles.subSectionHint}>{amenityGroups.neighborhood.description}</p>
          <div className={styles.checkboxGrid}>
            {amenityGroups.neighborhood.amenities.map(amenity => (
              <label key={amenity} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={formData.amenities?.includes(amenity) || false}
                  onChange={(e) => onArrayChange('amenities', amenity, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.checkboxText}>{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {errors.amenities && (
          <div className={styles.errorMessage}>{errors.amenities}</div>
        )}
      </div>

      {/* ✅ ACCESSIBILITY SECTION */}
      <div className={styles.mainSection}>
        <h4 className={styles.mainSectionTitle}>♿ Accessibility Features</h4>
        <p className={styles.mainSectionDescription}>
          Select accessibility features available at your property.
        </p>

        {/* Mobility Subsection */}
        <div className={styles.subSection}>
          <h5 className={styles.subSectionTitle}>{accessibilityGroups.mobility.title}</h5>
          <p className={styles.subSectionHint}>{accessibilityGroups.mobility.description}</p>
          <div className={styles.checkboxGrid}>
            {accessibilityGroups.mobility.features.map(feature => (
              <label key={feature} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={formData.accessibility_features?.includes(feature) || false}
                  onChange={(e) => onArrayChange('accessibility_features', feature, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.checkboxText}>{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Usability Subsection */}
        <div className={styles.subSection}>
          <h5 className={styles.subSectionTitle}>{accessibilityGroups.usability.title}</h5>
          <p className={styles.subSectionHint}>{accessibilityGroups.usability.description}</p>
          <div className={styles.checkboxGrid}>
            {accessibilityGroups.usability.features.map(feature => (
              <label key={feature} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={formData.accessibility_features?.includes(feature) || false}
                  onChange={(e) => onArrayChange('accessibility_features', feature, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.checkboxText}>{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {errors.accessibility_features && (
          <div className={styles.errorMessage}>{errors.accessibility_features}</div>
        )}
      </div>

      {/* ✅ PROPERTY POLICIES SECTION */}
      <div className={styles.mainSection}>
        <h4 className={styles.mainSectionTitle}>📋 Property Policies</h4>
        <p className={styles.mainSectionDescription}>
          Set clear policies for your property.
        </p>
        
        <div className={styles.policiesGrid}>
          <div className={styles.policyItem}>
            <label className={styles.policyLabel}>
              <input
                type="checkbox"
                className={styles.policyCheckbox}
                name="pets_allowed"
                checked={formData.pets_allowed || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.policyText}>Pets Allowed</span>
            </label>
            <div className={styles.policyHint}>
              Residents can have pets (specify restrictions in additional notes if needed)
            </div>
          </div>
          
          <div className={styles.policyItem}>
            <label className={styles.policyLabel}>
              <input
                type="checkbox"
                className={styles.policyCheckbox}
                name="smoking_allowed"
                checked={formData.smoking_allowed || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.policyText}>Smoking Allowed (Designated Areas)</span>
            </label>
            <div className={styles.policyHint}>
              Smoking permitted in designated outdoor areas only
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ADDITIONAL INFORMATION SECTION */}
      <div className={styles.mainSection}>
        <h4 className={styles.mainSectionTitle}>📝 Additional Information</h4>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Additional Notes</label>
          <textarea
            className={styles.formTextarea}
            name="additional_notes"
            value={formData.additional_notes || ''}
            onChange={onInputChange}
            placeholder="Any additional information about your property, special features, unique amenities, or important details potential residents should know..."
            disabled={loading}
            maxLength="750"
          />
          <div className={styles.characterCounter}>
            {(formData.additional_notes?.length || 0)}/750 characters
          </div>
          <div className={styles.formHint}>
            Use this space to highlight what makes your property special or to clarify any policies.
          </div>
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