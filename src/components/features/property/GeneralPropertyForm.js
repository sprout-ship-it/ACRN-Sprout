// src/components/features/property/GeneralPropertyForm.js - REORGANIZED WITH GROUPED SECTIONS
import React from 'react';
import PropTypes from 'prop-types';

// ✅ Import the cleaned section components
import PropertyBasicInfoSection from './sections/PropertyBasicInfoSection';
import PropertyFinancialSection from './sections/PropertyFinancialSection';
import PropertyAmenitiesSection from './sections/PropertyAmenitiesSection';
import PropertyAvailabilitySection from './sections/PropertyAvailabilitySection';

// ✅ Import CSS foundation and component module
import '../../../styles/main.css';
import styles from './GeneralPropertyForm.module.css';

const GeneralPropertyForm = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange,
  stateOptions
}) => {
  return (
    <div className={styles.formContainer}>
      {/* ✅ SECTION 1: Basic Property Information */}
      <div className={styles.sectionCard}>
        <PropertyBasicInfoSection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={onInputChange}
          stateOptions={stateOptions}
        />
      </div>

      {/* ✅ SECTION 2: Financial Information & Basic Housing Details */}
      <div className={styles.sectionCard}>
        <PropertyFinancialSection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={onInputChange}
          onArrayChange={onArrayChange}
        />
      </div>

      {/* ✅ SECTION 3: Availability & Lease Terms */}
      <div className={styles.sectionCard}>
        <PropertyAvailabilitySection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={onInputChange}
          isRecoveryHousing={false}
        />
      </div>

      {/* ✅ SECTION 4: Property Features & Amenities */}
      <div className={styles.sectionCard}>
        <PropertyAmenitiesSection
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={onInputChange}
          onArrayChange={onArrayChange}
        />
      </div>

      {/* ✅ SECTION 5: REORGANIZED Communication & Contact Preferences */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Communication & Tenant Preferences</h3>
        
        {/* Contact Method Subsection */}
        <div className={styles.mainSection}>
          <h4 className={styles.mainSectionTitle}>📞 Contact Preferences</h4>
          <p className={styles.mainSectionDescription}>
            Let potential tenants know how you prefer to be contacted and your typical response time.
          </p>

          <div className={styles.subSection}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Preferred Contact Method</label>
                <select
                  className={styles.formSelect}
                  name="preferred_contact_method"
                  value={formData.preferred_contact_method || 'phone'}
                  onChange={onInputChange}
                  disabled={loading}
                >
                  <option value="phone">📱 Phone Call</option>
                  <option value="text">💬 Text Message</option>
                  <option value="email">📧 Email</option>
                  <option value="any">✅ Any Method</option>
                </select>
                <div className={styles.helperText}>
                  How would you prefer prospective tenants to contact you?
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Response Time Expectation</label>
                <select
                  className={styles.formSelect}
                  name="response_time_expectation"
                  value={formData.response_time_expectation || '24_hours'}
                  onChange={onInputChange}
                  disabled={loading}
                >
                  <option value="same_day">⚡ Same Day</option>
                  <option value="24_hours">📅 Within 24 Hours</option>
                  <option value="48_hours">📆 Within 48 Hours</option>
                  <option value="business_days">🗓️ 1-2 Business Days</option>
                  <option value="weekly">📋 Within a Week</option>
                </select>
                <div className={styles.helperText}>
                  How quickly do you typically respond to inquiries?
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Requirements Subsection */}
        <div className={styles.mainSection}>
          <h4 className={styles.mainSectionTitle}>📋 Tenant Requirements</h4>
          <p className={styles.mainSectionDescription}>
            Specify any requirements or preferences for potential tenants to help them understand if they're a good fit.
          </p>

          <div className={styles.subSection}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Requirements or Preferences</label>
              <textarea
                className={styles.formTextarea}
                name="tenant_requirements"
                value={formData.tenant_requirements || ''}
                onChange={onInputChange}
                placeholder="Examples:
• Income must be 3x monthly rent
• Employment verification required
• Good credit score preferred (600+)
• References from previous landlords
• No evictions in past 5 years
• Background check required"
                disabled={loading}
                maxLength="500"
                rows="6"
              />
              <div className={styles.characterCounter}>
                {(formData.tenant_requirements?.length || 0)}/500 characters
              </div>
              <div className={styles.formHint}>
                Be clear about your requirements to set proper expectations. Use bullet points for easy reading.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Hidden fields for search compatibility and property classification */}
      <input type="hidden" name="is_recovery_housing" value="false" />
      <input type="hidden" name="property_category" value="general_rental" />
    </div>
  );
};

GeneralPropertyForm.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired,
  stateOptions: PropTypes.array.isRequired
};

export default GeneralPropertyForm;