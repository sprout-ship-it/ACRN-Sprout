// src/components/features/property/sections/PropertyFinancialSection.js - UPDATED WITH CSS MODULE
import React from 'react';
import PropTypes from 'prop-types';
import { acceptedSubsidyPrograms } from '../constants/propertyConstants';

// ✅ UPDATED: Import CSS module
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
      <h3 className="card-title mb-4">Financial Information & Housing Details</h3>
      
      {/* ✅ UPDATED: Basic Housing Details */}
      <div className={styles.gridThree}>
        <div className={styles.formGroup}>
          <label className="label">Total Bedrooms *</label>
          <input
            className={`input ${errors.total_beds ? styles.inputError : ''}`}
            type="number"
            name="total_beds"
            value={formData.total_beds}
            onChange={onInputChange}
            min="0"
            max="20"
            disabled={loading}
            required
          />
          {errors.total_beds && (
            <div className={styles.errorMessage}>{errors.total_beds}</div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label className="label">Available Beds</label>
          <input
            className="input"
            type="number"
            name="available_beds"
            value={formData.available_beds}
            onChange={onInputChange}
            min="0"
            max={formData.total_beds || 20}
            disabled={loading}
          />
          <div className={styles.helpText}>
            Currently available for new residents
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
            disabled={loading}
          />
        </div>
      </div>

      {/* ✅ UPDATED: Pricing Information */}
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
            placeholder="800"
            min="0"
            max="5000"
            disabled={loading}
            required
          />
          {errors.rent_amount && (
            <div className={styles.errorMessage}>{errors.rent_amount}</div>
          )}
          <div className={styles.helpText}>
            Monthly rent per person/bed
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
            max="10000"
            disabled={loading}
          />
          <div className={styles.helpText}>
            One-time deposit (typically first month's rent)
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Additional Financial Information */}
      <div className={styles.gridTwo}>
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
        
        <div className={styles.formGroup}>
          <label className="label">Weekly Rate (if applicable)</label>
          <input
            className="input"
            type="number"
            name="weekly_rate"
            value={formData.weekly_rate || ''}
            onChange={onInputChange}
            placeholder="200"
            min="0"
            max="1000"
            disabled={loading}
          />
          <div className={styles.helpText}>
            For short-term or weekly rental options
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Housing Subsidy Acceptance */}
      <div className={styles.formGroup}>
        <label className="label">
          Accepted Housing Assistance Programs
        </label>
        <div className={styles.helpTextLarge}>
          Select all housing assistance programs that your property accepts. This helps match you with qualified residents.
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

      {/* ✅ UPDATED: Enhanced Utilities Section with Array Handling */}
      <div className={styles.utilitiesSection}>
        <h4 className={styles.utilitiesTitle}>Utilities & Included Services</h4>
        
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

      {/* ✅ UPDATED: Property Features */}
      <div className={styles.featuresGrid}>
        <div className={styles.featureGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="furnished"
              checked={formData.furnished || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Furnished Rooms</span>
          </label>
          <div className={styles.helpText}>
            Basic furniture provided in bedrooms
          </div>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="meals_included"
              checked={formData.meals_included || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Meals Included</span>
          </label>
          <div className={styles.helpText}>
            Some or all meals provided
          </div>
        </div>
        
        <div className={styles.featureGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="linens_provided"
              checked={formData.linens_provided || false}
              onChange={onInputChange}
              disabled={loading}
            />
            <span className={styles.checkboxText}>Linens Provided</span>
          </label>
          <div className={styles.helpText}>
            Bedding and towels provided
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