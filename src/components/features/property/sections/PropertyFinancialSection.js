// src/components/features/property/sections/PropertyFinancialSection.js - CLEANED FOR SHARED FIELDS ONLY
import React from 'react';
import PropTypes from 'prop-types';
import { acceptedSubsidyPrograms } from '../constants/propertyConstants';

// ✅ Import CSS module
import styles from './PropertyFinancialSection.module.css';

const PropertyFinancialSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  // ✅ Enhanced utilities options for granular control
  const utilityOptions = [
    { value: 'electricity', label: 'Electricity' },
    { value: 'water', label: 'Water' }, 
    { value: 'gas', label: 'Gas' },
    { value: 'trash', label: 'Trash Collection' },
    { value: 'internet', label: 'Internet/WiFi' },
    { value: 'cable_tv', label: 'Cable TV' },
    { value: 'heating', label: 'Heating' },
    { value: 'air_conditioning', label: 'Air Conditioning' }
  ];

  return (
    <>
      <h3 className="card-title mb-4">Financial Information & Basic Housing Details</h3>
      
      {/* ✅ SHARED: Basic Room and Housing Information */}
      <div className={styles.gridTwo}>
        <div className={styles.formGroup}>
          <label className="label">Number of Bedrooms *</label>
          <input
            className={`input ${errors.bedrooms ? styles.inputError : ''}`}
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={onInputChange}
            min="0"
            max="15"
            placeholder="2"
            disabled={loading}
            required
          />
          {errors.bedrooms && (
            <div className={styles.errorMessage}>{errors.bedrooms}</div>
          )}
          <div className={styles.helpText}>
            Number of separate bedrooms (use 0 for studio)
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className="label">Bathrooms</label>
          <input
            className="input"
            type="number"
            name="bathrooms"
            value={formData.bathrooms || ''}
            onChange={onInputChange}
            min="0.5"
            step="0.5"
            max="10"
            placeholder="1"
            disabled={loading}
          />
          <div className={styles.helpText}>
            Number of bathrooms (use 0.5 for half-baths)
          </div>
        </div>
      </div>

      {/* ✅ SHARED: Pricing Information */}
      <h4 className={styles.sectionHeading}>Pricing & Financial Terms</h4>
      
      <div className={styles.gridTwo}>
        <div className={styles.formGroup}>
          <label className="label">Monthly Rent *</label>
          <input
            className={`input ${errors.rent_amount ? styles.inputError : ''}`}
            type="number"
            name="rent_amount"
            value={formData.rent_amount}
            onChange={onInputChange}
            placeholder="1200"
            min="0"
            max="10000"
            disabled={loading}
            required
          />
          {errors.rent_amount && (
            <div className={styles.errorMessage}>{errors.rent_amount}</div>
          )}
          <div className={styles.helpText}>
            Monthly rent amount
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className="label">Security Deposit</label>
          <input
            className="input"
            type="number"
            name="security_deposit"
            value={formData.security_deposit}
            onChange={onInputChange}
            placeholder="Usually equal to monthly rent"
            min="0"
            max="20000"
            disabled={loading}
          />
          <div className={styles.helpText}>
            One-time deposit (typically first month's rent)
          </div>
        </div>
      </div>

      {/* ✅ SHARED: Additional Financial Information */}
      <div className={styles.formGroup}>
        <label className="label">Application Fee</label>
        <input
          className="input"
          type="number"
          name="application_fee"
          value={formData.application_fee || ''}
          onChange={onInputChange}
          placeholder="50"
          min="0"
          max="500"
          disabled={loading}
        />
        <div className={styles.helpText}>
          One-time application processing fee
        </div>
      </div>

      {/* ✅ SHARED: Housing Subsidy Acceptance */}
      <div className={styles.formGroup}>
        <label className="label">
          Accepted Housing Assistance Programs
        </label>
        <div className={styles.helpTextLarge}>
          Select all housing assistance programs that your property accepts. This helps match you with qualified applicants.
        </div>
        <div className={styles.checkboxColumns}>
          {acceptedSubsidyPrograms.map(subsidy => (
            <label key={subsidy.value} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.accepted_subsidies?.includes(subsidy.value) || false}
                onChange={(e) => onArrayChange('accepted_subsidies', subsidy.value, e.target.checked)}
                disabled={loading}
              />
              <span className={styles.checkboxText}>{subsidy.label}</span>
            </label>
          ))}
        </div>
        {errors.accepted_subsidies && (
          <div className={styles.errorMessage}>{errors.accepted_subsidies}</div>
        )}
      </div>

      {/* ✅ SHARED: Utilities Section with Array Handling */}
      <div className={styles.utilitiesSection}>
        <h4 className={styles.sectionHeading}>Utilities & Included Services</h4>
        
        <div className={styles.formGroup}>
          <label className="label">Utilities Included</label>
          <div className={styles.helpTextLarge}>
            Select which utilities are included in the rent payment.
          </div>
          <div className={styles.checkboxColumnsCompact}>
            {utilityOptions.map(utility => (
              <label key={utility.value} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.utilities_included?.includes(utility.value) || false}
                  onChange={(e) => onArrayChange('utilities_included', utility.value, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.checkboxText}>{utility.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ SHARED: Basic Property Features */}
      <div className={styles.basicFeaturesSection}>
        <h4 className={styles.sectionHeading}>Basic Property Features</h4>
        
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="furnished"
              checked={formData.furnished || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Furnished</span>
          </label>
          <div className={styles.helpText}>
            Property comes with basic furniture
          </div>
        </div>
      </div>
    </>
  );
};

PropertyFinancialSection.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default PropertyFinancialSection;