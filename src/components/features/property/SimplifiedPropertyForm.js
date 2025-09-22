// src/components/features/property/SimplifiedPropertyForm.js - UPDATED WITH CSS MODULE
import React from 'react';
import PropTypes from 'prop-types';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../styles/main.css';
import styles from './SimplifiedPropertyForm.module.css';

const SimplifiedPropertyForm = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange,
  stateOptions
}) => {
  const basicAmenities = [
    { value: 'washer_dryer', label: 'Washer/Dryer' },
    { value: 'dishwasher', label: 'Dishwasher' },
    { value: 'air_conditioning', label: 'Air Conditioning' },
    { value: 'heating', label: 'Heating' },
    { value: 'parking', label: 'Parking Available' },
    { value: 'yard', label: 'Yard/Outdoor Space' },
    { value: 'pool', label: 'Pool' },
    { value: 'gym', label: 'Gym/Fitness Center' },
    { value: 'internet', label: 'Internet Included' },
    { value: 'cable', label: 'Cable TV Included' }
  ];

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.sectionTitle}>Rental Property Details</h3>
      
      {/* Basic Property Information */}
      <div className={styles.sectionCard}>
        <h4 className={styles.sectionCardTitle}>Property Information</h4>
        
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Property Name/Title <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              className={`${styles.formInput} ${errors.property_name ? styles.formInputError : ''}`}
              type="text"
              name="property_name"
              value={formData.property_name}
              onChange={onInputChange}
              placeholder="e.g., Cozy 2BR Near Downtown"
              disabled={loading}
              required
            />
            {errors.property_name && (
              <div className={styles.errorText}>{errors.property_name}</div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Property Type</label>
            <select
              className={styles.formSelect}
              name="property_type"
              value={formData.property_type}
              onChange={onInputChange}
              disabled={loading}
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="townhouse">Townhouse</option>
              <option value="condo">Condo</option>
              <option value="duplex">Duplex</option>
              <option value="studio">Studio</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className={styles.formGridFour}>
          <div className={`${styles.formGroup} ${styles.formGroupLarge}`} style={{ gridColumn: '1 / 3' }}>
            <label className={styles.formLabel}>
              Street Address <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              className={`${styles.formInput} ${errors.address ? styles.formInputError : ''}`}
              type="text"
              name="address"
              value={formData.address}
              onChange={onInputChange}
              disabled={loading}
              required
            />
            {errors.address && (
              <div className={styles.errorText}>{errors.address}</div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              City <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              className={`${styles.formInput} ${errors.city ? styles.formInputError : ''}`}
              type="text"
              name="city"
              value={formData.city}
              onChange={onInputChange}
              disabled={loading}
              required
            />
            {errors.city && (
              <div className={styles.errorText}>{errors.city}</div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              State <span className={styles.requiredAsterisk}>*</span>
            </label>
            <select
              className={`${styles.formSelect} ${errors.state ? styles.formInputError : ''}`}
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
              <div className={styles.errorText}>{errors.state}</div>
            )}
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              ZIP Code <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              className={`${styles.formInput} ${errors.zip_code ? styles.formInputError : ''}`}
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={onInputChange}
              disabled={loading}
              required
            />
            {errors.zip_code && (
              <div className={styles.errorText}>{errors.zip_code}</div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Contact Phone <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              className={`${styles.formInput} ${errors.phone ? styles.formInputError : ''}`}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              placeholder="(555) 123-4567"
              disabled={loading}
              required
            />
            {errors.phone && (
              <div className={styles.errorText}>{errors.phone}</div>
            )}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className={styles.sectionCard}>
        <h4 className={styles.sectionCardTitle}>Property Details</h4>
        
        <div className={styles.formGridThree}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Bedrooms <span className={styles.requiredAsterisk}>*</span>
            </label>
            <select
              className={`${styles.formSelect} ${errors.total_beds ? styles.formInputError : ''}`}
              name="total_beds"
              value={formData.total_beds}
              onChange={onInputChange}
              disabled={loading}
              required
            >
              <option value="">Select</option>
              <option value="0">Studio</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
            {errors.total_beds && (
              <div className={styles.errorText}>{errors.total_beds}</div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Bathrooms</label>
            <select
              className={styles.formSelect}
              name="bathrooms"
              value={formData.bathrooms}
              onChange={onInputChange}
              disabled={loading}
            >
              <option value="1">1 Bathroom</option>
              <option value="1.5">1.5 Bathrooms</option>
              <option value="2">2 Bathrooms</option>
              <option value="2.5">2.5 Bathrooms</option>
              <option value="3">3 Bathrooms</option>
              <option value="3.5">3.5 Bathrooms</option>
              <option value="4">4+ Bathrooms</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Monthly Rent <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              className={`${styles.formInput} ${errors.rent_amount ? styles.formInputError : ''}`}
              type="number"
              name="rent_amount"
              value={formData.rent_amount}
              onChange={onInputChange}
              placeholder="1200"
              min="0"
              disabled={loading}
              required
            />
            {errors.rent_amount && (
              <div className={styles.errorText}>{errors.rent_amount}</div>
            )}
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Security Deposit</label>
            <input
              className={styles.formInput}
              type="number"
              name="security_deposit"
              value={formData.security_deposit}
              onChange={onInputChange}
              placeholder="Usually equal to monthly rent"
              min="0"
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Application Fee</label>
            <input
              className={styles.formInput}
              type="number"
              name="application_fee"
              value={formData.application_fee}
              onChange={onInputChange}
              placeholder="50"
              min="0"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Property Features */}
      <div className={styles.sectionCard}>
        <h4 className={styles.sectionCardTitle}>Property Features</h4>
        
        <div className={styles.checkboxGrid}>
          <div className={styles.checkboxGroup}>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                name="furnished"
                checked={formData.furnished || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Furnished</span>
            </div>
            
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                name="pets_allowed"
                checked={formData.pets_allowed || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Pets Allowed</span>
            </div>
          </div>
          
          <div className={styles.checkboxGroup}>
            <div className={styles.checkboxItem}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                name="smoking_allowed"
                checked={formData.smoking_allowed || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Smoking Allowed</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Amenities</label>
          <div className={styles.amenitiesGrid}>
            {basicAmenities.map(amenity => (
              <div key={amenity.value} className={styles.amenityItem}>
                <input
                  type="checkbox"
                  className={styles.amenityInput}
                  checked={formData.amenities?.includes(amenity.value) || false}
                  onChange={(e) => onArrayChange('amenities', amenity.value, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.amenityText}>{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className={styles.sectionCard}>
        <h4 className={styles.sectionCardTitle}>Additional Information</h4>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Contact Email</label>
          <input
            className={styles.formInput}
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={onInputChange}
            placeholder="landlord@example.com"
            disabled={loading}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Property Description</label>
          <textarea
            className={styles.formTextarea}
            name="description"
            value={formData.description}
            onChange={onInputChange}
            placeholder="Describe your property, neighborhood, and any special features..."
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

SimplifiedPropertyForm.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired,
  stateOptions: PropTypes.array.isRequired
};

export default SimplifiedPropertyForm;