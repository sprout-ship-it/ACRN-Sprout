// src/components/features/property/sections/PropertyBasicInfoSection.js - UPDATED WITH CSS MODULE
import React from 'react';
import PropTypes from 'prop-types';
import { propertyTypes } from '../constants/propertyConstants';

// ✅ UPDATED: Import CSS module
import styles from './PropertyBasicInfoSection.module.css';

const PropertyBasicInfoSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  stateOptions
}) => {
  return (
    <>
      <h3 className="card-title mb-4">Basic Property Information</h3>
      
      <div className={styles.gridTwo}>
        <div className={styles.formGroup}>
          <label className="label">Property Name *</label>
          <input
            className={`input ${errors.property_name ? styles.inputError : ''}`}
            type="text"
            name="property_name"
            value={formData.property_name}
            onChange={onInputChange}
            placeholder="e.g., Serenity Sober Living Home"
            disabled={loading}
            required
          />
          {errors.property_name && (
            <div className={styles.errorMessage}>{errors.property_name}</div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label className="label">Property Type *</label>
          <select
            className={`input ${errors.property_type ? styles.inputError : ''}`}
            name="property_type"
            value={formData.property_type}
            onChange={onInputChange}
            disabled={loading}
            required
          >
            <option value="">Select Property Type</option>
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.property_type && (
            <div className={styles.errorMessage}>{errors.property_type}</div>
          )}
        </div>
      </div>
      
      {/* ✅ UPDATED: Address Information */}
      <div className={styles.formGroup}>
        <label className="label">Street Address *</label>
        <input
          className={`input ${errors.address ? styles.inputError : ''}`}
          type="text"
          name="address"
          value={formData.address}
          onChange={onInputChange}
          placeholder="123 Recovery Lane"
          disabled={loading}
          required
        />
        {errors.address && (
          <div className={styles.errorMessage}>{errors.address}</div>
        )}
      </div>
      
      <div className={styles.gridThree}>
        <div className={styles.formGroup}>
          <label className="label">City *</label>
          <input
            className={`input ${errors.city ? styles.inputError : ''}`}
            type="text"
            name="city"
            value={formData.city}
            onChange={onInputChange}
            disabled={loading}
            required
          />
          {errors.city && (
            <div className={styles.errorMessage}>{errors.city}</div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label className="label">State *</label>
          <select
            className={`input ${errors.state ? styles.inputError : ''}`}
            name="state"
            value={formData.state}
            onChange={onInputChange}
            disabled={loading}
            required
          >
            <option value="">Select State</option>
            {stateOptions.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && (
            <div className={styles.errorMessage}>{errors.state}</div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label className="label">ZIP Code *</label>
          <input
            className={`input ${errors.zip_code ? styles.inputError : ''}`}
            type="text"
            name="zip_code"
            value={formData.zip_code}
            onChange={onInputChange}
            placeholder="12345"
            disabled={loading}
            required
          />
          {errors.zip_code && (
            <div className={styles.errorMessage}>{errors.zip_code}</div>
          )}
        </div>
      </div>

      {/* ✅ UPDATED: Contact Information */}
      <h4 className={styles.sectionHeading}>Contact Information</h4>
      
      <div className={styles.gridTwo}>
        <div className={styles.formGroup}>
          <label className="label">Primary Contact Phone *</label>
          <input
            className={`input ${errors.phone ? styles.inputError : ''}`}
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            placeholder="(555) 123-4567"
            disabled={loading}
            required
          />
          {errors.phone && (
            <div className={styles.errorMessage}>{errors.phone}</div>
          )}
          <div className={styles.helpText}>
            Primary contact number for this property
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className="label">Contact Email</label>
          <input
            className="input"
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={onInputChange}
            placeholder="contact@property.com"
            disabled={loading}
          />
          <div className={styles.helpText}>
            Email for inquiries (optional)
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Property Description */}
      <div className={styles.formGroup}>
        <label className="label">Property Description</label>
        <textarea
          className={`input ${styles.textareaLarge}`}
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Describe your property, its recovery-focused features, neighborhood, and what makes it special..."
          disabled={loading}
          maxLength="1000"
        />
        <div className={styles.characterCounter}>
          {formData.description?.length || 0}/1000 characters
        </div>
      </div>
    </>
  );
};

PropertyBasicInfoSection.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  stateOptions: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default PropertyBasicInfoSection;