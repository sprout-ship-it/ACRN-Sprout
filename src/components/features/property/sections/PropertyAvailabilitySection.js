// src/components/features/property/sections/PropertyAvailabilitySection.js - CLEANED FOR SHARED FIELDS ONLY
import React from 'react';
import PropTypes from 'prop-types';

// ✅ Import CSS module
import styles from './PropertyAvailabilitySection.module.css';

const PropertyAvailabilitySection = ({
  formData,
  errors,
  loading,
  onInputChange,
  isRecoveryHousing = false
}) => {
  
  const leaseDurationOptions = [
    { value: '', label: 'Select lease duration' },
    { value: 'month_to_month', label: 'Month-to-Month' },
    { value: '3_months', label: '3 Months' },
    { value: '6_months', label: '6 Months' },
    { value: '12_months', label: '1 Year' },
    { value: '24_months', label: '2 Years' },
    { value: 'flexible', label: 'Flexible Terms' }
  ];

  const propertyStatusOptions = isRecoveryHousing 
    ? [
        { value: 'available', label: 'Available' },
        { value: 'waitlist', label: 'Waitlist Only' },
        { value: 'full', label: 'Currently Full' },
        { value: 'temporarily_closed', label: 'Temporarily Closed' },
        { value: 'under_renovation', label: 'Under Renovation' }
      ]
    : [
        { value: 'available', label: 'Available' },
        { value: 'waitlist', label: 'Waitlist Only' },
        { value: 'full', label: 'Currently Full' },
        { value: 'temporarily_closed', label: 'Temporarily Closed' }
      ];

  return (
    <>
      <h3 className="card-title mb-4">Availability & Lease Terms</h3>
      
      {/* ✅ SHARED: Move-in Availability */}
      <div className={styles.gridTwo}>
        <div className={styles.formGroup}>
          <label className="label">
            Available Date <span className={styles.requiredAsterisk}>*</span>
          </label>
          <input
            className={`input ${errors.available_date ? styles.inputError : ''}`}
            type="date"
            name="available_date"
            value={formData.available_date || ''}
            onChange={onInputChange}
            disabled={loading}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.available_date && (
            <div className={styles.errorMessage}>{errors.available_date}</div>
          )}
          <div className={styles.helpText}>
            When can {isRecoveryHousing ? 'residents' : 'tenants'} move in?
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className="label">
            Lease Duration <span className={styles.requiredAsterisk}>*</span>
          </label>
          <select
            className={`input ${errors.lease_duration ? styles.inputError : ''}`}
            name="lease_duration"
            value={formData.lease_duration || ''}
            onChange={onInputChange}
            disabled={loading}
            required
          >
            {leaseDurationOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.lease_duration && (
            <div className={styles.errorMessage}>{errors.lease_duration}</div>
          )}
          <div className={styles.helpText}>
            {isRecoveryHousing ? 'Minimum program commitment' : 'Minimum lease commitment'}
          </div>
        </div>
      </div>

      {/* ✅ SHARED: Property Details - Conditional Fields */}
      <div className={styles.gridTwo}>
        {!isRecoveryHousing && (
          <div className={styles.formGroup}>
            <label className="label">Square Footage</label>
            <input
              className="input"
              type="number"
              name="square_footage"
              value={formData.square_footage || ''}
              onChange={onInputChange}
              placeholder="1200"
              min="0"
              max="10000"
              disabled={loading}
            />
            <div className={styles.helpText}>
              Total square footage (helps with search filtering)
            </div>
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label className="label">Property Status</label>
          <select
            className="input"
            name={isRecoveryHousing ? "property_status" : "status"}
            value={formData[isRecoveryHousing ? "property_status" : "status"] || 'available'}
            onChange={onInputChange}
            disabled={loading}
          >
            {propertyStatusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className={styles.helpText}>
            Current availability status
          </div>
        </div>
      </div>

      {/* ✅ SHARED: Application Status */}
      <div className={styles.applicationSection}>
        <h4 className={styles.sectionHeading}>Application Management</h4>
        
        <div className={styles.formGroup}>
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
            Uncheck to temporarily stop receiving new applications. Your listing will remain visible but marked as "Not Currently Accepting Applications."
          </div>
        </div>
      </div>

      {/* ✅ SHARED: General Rental Specific - Showing & Viewing */}
      {!isRecoveryHousing && (
        <div className={styles.showingSection}>
          <h4 className={styles.sectionHeading}>Property Showings</h4>
          
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label className="label">Showing Availability</label>
              <select
                className="input"
                name="showing_availability"
                value={formData.showing_availability || ''}
                onChange={onInputChange}
                disabled={loading}
              >
                <option value="">By appointment</option>
                <option value="flexible">Flexible scheduling</option>
                <option value="weekdays_only">Weekdays only</option>
                <option value="weekends_only">Weekends only</option>
                <option value="business_hours">Business hours only</option>
                <option value="virtual_available">Virtual tours available</option>
              </select>
              <div className={styles.helpText}>
                When are property showings available?
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className="label">Notice Required for Showings</label>
              <select
                className="input"
                name="showing_notice"
                value={formData.showing_notice || ''}
                onChange={onInputChange}
                disabled={loading}
              >
                <option value="">24 hours (standard)</option>
                <option value="same_day">Same day OK</option>
                <option value="24_hours">24 hours</option>
                <option value="48_hours">48 hours</option>
                <option value="1_week">1 week</option>
              </select>
              <div className={styles.helpText}>
                How much notice do you need for scheduling showings?
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SHARED: Additional Terms */}
      <div className={styles.additionalTermsSection}>
        <h4 className={styles.sectionHeading}>Additional Terms & Conditions</h4>
        
        <div className={styles.formGroup}>
          <label className="label">Special Terms or Conditions</label>
          <textarea
            className={`input ${styles.textareaLarge}`}
            name="special_terms"
            value={formData.special_terms || ''}
            onChange={onInputChange}
            placeholder={isRecoveryHousing 
              ? "Any special requirements, prerequisites, or house-specific policies..."
              : "Any special lease terms, move-in requirements, or property-specific policies..."
            }
            disabled={loading}
            maxLength="400"
          />
          <div className={styles.characterCounter}>
            {(formData.special_terms?.length || 0)}/400 characters
          </div>
        </div>
      </div>
    </>
  );
};

PropertyAvailabilitySection.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  isRecoveryHousing: PropTypes.bool
};

export default PropertyAvailabilitySection;