// src/components/features/property/search/PropertyAdvancedFilters.js - Reorganized with Grouped Amenities & Accessibility
import React from 'react';
import PropTypes from 'prop-types';

import styles from './PropertyAdvancedFilters.module.css';

const PropertyAdvancedFilters = ({
  advancedFilters,
  onArrayFilterChange,
  loading
}) => {
  // ✅ Amenities organized by category
  const amenityGroups = {
    livingSpace: [
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
    ],
    propertyFeatures: [
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
    ],
    neighborhood: [
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
  };

  // ✅ Accessibility features organized by category
  const accessibilityGroups = {
    mobility: [
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
    ],
    usability: [
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
  };

  return (
    <div className={styles.advancedFiltersContainer}>
      
      {/* ✅ SECTION 1: AMENITIES */}
      <div className={styles.mainSection}>
        <h3 className={styles.mainSectionTitle}>🏠 Amenities</h3>
        <p className={styles.mainSectionDescription}>
          Select amenities that properties must have
        </p>

        {/* Living Space Subsection */}
        <div className={styles.subSection}>
          <h4 className={styles.subSectionTitle}>Living Space</h4>
          <p className={styles.subSectionHint}>In-unit features and fixtures</p>
          <div className={styles.amenitiesGrid}>
            {amenityGroups.livingSpace.map(amenity => (
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

        {/* Property Features Subsection */}
        <div className={styles.subSection}>
          <h4 className={styles.subSectionTitle}>Property Features</h4>
          <p className={styles.subSectionHint}>Building-wide amenities and services</p>
          <div className={styles.amenitiesGrid}>
            {amenityGroups.propertyFeatures.map(amenity => (
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

        {/* Neighborhood Subsection */}
        <div className={styles.subSection}>
          <h4 className={styles.subSectionTitle}>Neighborhood</h4>
          <p className={styles.subSectionHint}>Location and area features</p>
          <div className={styles.amenitiesGrid}>
            {amenityGroups.neighborhood.map(amenity => (
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

      {/* ✅ SECTION 2: ACCESSIBILITY */}
      <div className={styles.mainSection}>
        <h3 className={styles.mainSectionTitle}>♿ Accessibility Features</h3>
        <p className={styles.mainSectionDescription}>
          Select accessibility features that properties must have
        </p>

        {/* Mobility Subsection */}
        <div className={styles.subSection}>
          <h4 className={styles.subSectionTitle}>Mobility</h4>
          <p className={styles.subSectionHint}>Features for wheelchair users and mobility support</p>
          <div className={styles.accessibilityGrid}>
            {accessibilityGroups.mobility.map(feature => (
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

        {/* Usability Subsection */}
        <div className={styles.subSection}>
          <h4 className={styles.subSectionTitle}>Usability</h4>
          <p className={styles.subSectionHint}>Features for visual, auditory, and general accessibility needs</p>
          <div className={styles.accessibilityGrid}>
            {accessibilityGroups.usability.map(feature => (
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
    </div>
  );
};

PropertyAdvancedFilters.propTypes = {
  advancedFilters: PropTypes.shape({
    amenities: PropTypes.array.isRequired,
    accessibilityFeatures: PropTypes.array
  }).isRequired,
  onArrayFilterChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default PropertyAdvancedFilters;