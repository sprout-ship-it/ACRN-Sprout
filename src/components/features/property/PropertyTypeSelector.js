// src/components/property/PropertyTypeSelector.js - UPDATED WITH CSS MODULE
import React from 'react';
import PropTypes from 'prop-types';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../styles/main.css';
import styles from './PropertyTypeSelector.module.css';

const PropertyTypeSelector = ({ onSelection }) => {
  return (
    <div className={styles.propertyTypeSelector}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>What type of property are you adding?</h2>
        <p className={styles.selectionSubtitle}>
          Choose the option that best describes your rental property to get the appropriate form.
        </p>
      </div>

      <div className={styles.propertyTypeOptions}>
        {/* General Rental Option */}
        <div 
          className={styles.propertyTypeCard}
          onClick={() => onSelection('general_rental')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelection('general_rental');
            }
          }}
        >
          <div className={styles.typeIcon}>🏠</div>
          <h3 className={styles.typeTitle}>General Rental Property</h3>
          <p className={styles.typeDescription}>
            Standard rental property for the general market. Perfect for landlords renting 
            apartments, houses, or condos to any tenants.
          </p>
          <ul className={styles.typeFeatures}>
            <li>Simple, streamlined form</li>
            <li>Basic property details</li>
            <li>Standard amenities</li>
            <li>General rental terms</li>
          </ul>
          <div className={styles.typeAction}>
            <span className={styles.btnText}>Choose General Rental</span>
          </div>
        </div>

        {/* Recovery Housing Option */}
        <div 
          className={styles.propertyTypeCard}
          onClick={() => onSelection('recovery_housing')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelection('recovery_housing');
            }
          }}
        >
          <div className={styles.typeIcon}>🌱</div>
          <h3 className={styles.typeTitle}>Recovery Housing</h3>
          <p className={styles.typeDescription}>
            Sober living homes, recovery residences, and specialized housing for people 
            in recovery from addiction.
          </p>
          <ul className={styles.typeFeatures}>
            <li>Recovery-specific requirements</li>
            <li>Support services details</li>
            <li>House rules & restrictions</li>
            <li>Subsidy program acceptance</li>
          </ul>
          <div className={styles.typeAction}>
            <span className={styles.btnText}>Choose Recovery Housing</span>
          </div>
        </div>
      </div>

      <div className={styles.selectorFooter}>
        <p className={styles.footerText}>
          Don't worry - you can always edit your property details after creating it.
        </p>
      </div>
    </div>
  );
};

PropertyTypeSelector.propTypes = {
  onSelection: PropTypes.func.isRequired
};

export default PropertyTypeSelector;