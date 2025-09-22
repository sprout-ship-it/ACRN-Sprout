// src/components/forms/sections/peer-support/ServiceInfoSection.js - UPDATED WITH CSS MODULE
import React from 'react';
import PropTypes from 'prop-types';
import { 
  specialtyOptions, 
  recoveryApproachOptions, 
  ageGroupOptions, 
  populationOptions,
  serviceDeliveryOptions,
  HELP_TEXT 
} from '../constants/peerSupportConstants';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../../styles/main.css';
import styles from './ServiceInfoSection.module.css';

const ServiceInfoSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  return (
    <div className={styles.sectionContainer}>
      <h3 className={styles.sectionTitle}>Services & Specialties</h3>
      
      {/* Specialties - Required */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Your Specialties <span className={styles.requiredAsterisk}>*</span>
        </label>
        <div className={styles.helpText}>
          {HELP_TEXT.specialties}
        </div>
        <div className={styles.specialtiesGrid}>
          {specialtyOptions.map(specialty => (
            <div
              key={specialty}
              className={`${styles.specialtyItem} ${formData.specialties?.includes(specialty) ? styles.selected : ''}`}
              onClick={() => onArrayChange('specialties', specialty, !formData.specialties?.includes(specialty))}
            >
              <input
                type="checkbox"
                className={styles.specialtyCheckbox}
                checked={formData.specialties?.includes(specialty) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.specialtyLabel}>{specialty}</span>
            </div>
          ))}
        </div>
        {errors.specialties && (
          <div className={styles.errorText}>{errors.specialties}</div>
        )}
      </div>

      {/* Recovery Approaches */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Recovery Approaches You Support</label>
        <div className={styles.helpText}>
          {HELP_TEXT.recovery_approach}
        </div>
        <div className={styles.specialtiesGrid}>
          {recoveryApproachOptions.map(approach => (
            <div
              key={approach}
              className={`${styles.specialtyItem} ${formData.recovery_approach?.includes(approach) ? styles.selected : ''}`}
              onClick={() => onArrayChange('recovery_approach', approach, !formData.recovery_approach?.includes(approach))}
            >
              <input
                type="checkbox"
                className={styles.specialtyCheckbox}
                checked={formData.recovery_approach?.includes(approach) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.specialtyLabel}>{approach}</span>
            </div>
          ))}
        </div>
        {errors.recovery_approach && (
          <div className={styles.errorText}>{errors.recovery_approach}</div>
        )}
      </div>

      {/* Age Groups and Populations */}
      <h4 className={styles.sectionSubtitle}>
        Who You Serve
      </h4>

      <div className={styles.formGrid}>
        {/* Age Groups */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Age Groups You Serve</label>
          <div className={styles.helpText}>
            Select the age ranges you're comfortable supporting
          </div>
          <div className={styles.checkboxColumns}>
            {ageGroupOptions.map(ageGroup => (
              <div key={ageGroup} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  className={styles.checkboxItemInput}
                  checked={formData.age_groups_served?.includes(ageGroup) || false}
                  onChange={(e) => onArrayChange('age_groups_served', ageGroup, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.checkboxItemText}>{ageGroup}</span>
              </div>
            ))}
          </div>
          {errors.age_groups_served && (
            <div className={styles.errorText}>{errors.age_groups_served}</div>
          )}
        </div>

        {/* Population Specializations */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Population Specializations</label>
          <div className={styles.helpText}>
            Specific populations you have experience supporting
          </div>
          <div className={styles.checkboxColumns}>
            {populationOptions.map(population => (
              <div key={population} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  className={styles.checkboxItemInput}
                  checked={formData.populations_served?.includes(population) || false}
                  onChange={(e) => onArrayChange('populations_served', population, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.checkboxItemText}>{population}</span>
              </div>
            ))}
          </div>
          {errors.populations_served && (
            <div className={styles.errorText}>{errors.populations_served}</div>
          )}
        </div>
      </div>

      {/* Service Types */}
      <h4 className={styles.sectionSubtitle}>
        Types of Services You Provide
      </h4>

      <div className={styles.formGroup}>
        <div className={styles.serviceDeliveryGrid}>
          {serviceDeliveryOptions.map(service => (
            <div key={service.key} className={styles.checkboxItem}>
              <input
                type="checkbox"
                className={styles.checkboxItemInput}
                checked={formData[service.key] || false}
                onChange={(e) => onInputChange(service.key, e.target.checked)}
                disabled={loading}
              />
              <div className={styles.checkboxItemText}>
                <div className={styles.serviceOptionTitle}>{service.label}</div>
                <div className={styles.checkboxItemDescription}>
                  {service.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Delivery Methods */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Service Delivery Methods</label>
        <div className={styles.serviceDeliveryGrid}>
          <div className={styles.serviceOption}>
            <input
              type="checkbox"
              className={styles.serviceOptionInput}
              checked={formData.offers_telehealth || false}
              onChange={(e) => onInputChange('offers_telehealth', e.target.checked)}
              disabled={loading}
            />
            <div className={styles.serviceOptionContent}>
              <div className={styles.serviceOptionTitle}>Telehealth Services</div>
              <div className={styles.serviceOptionDescription}>
                Remote support via phone, video, or messaging
              </div>
            </div>
          </div>
          
          <div className={styles.serviceOption}>
            <input
              type="checkbox"
              className={styles.serviceOptionInput}
              checked={formData.offers_in_person || false}
              onChange={(e) => onInputChange('offers_in_person', e.target.checked)}
              disabled={loading}
            />
            <div className={styles.serviceOptionContent}>
              <div className={styles.serviceOptionTitle}>In-Person Services</div>
              <div className={styles.serviceOptionDescription}>
                Face-to-face meetings at office or community locations
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Coverage Notice */}
      <div className={styles.infoAlert}>
        <div className={styles.alertTitle}>Service Coverage:</div>
        Make sure to select at least one service delivery method (telehealth or in-person) so clients know how they can access your support.
      </div>
    </div>
  );
};

ServiceInfoSection.propTypes = {
  formData: PropTypes.shape({
    specialties: PropTypes.arrayOf(PropTypes.string),
    recovery_approach: PropTypes.arrayOf(PropTypes.string),
    age_groups_served: PropTypes.arrayOf(PropTypes.string),
    populations_served: PropTypes.arrayOf(PropTypes.string),
    individual_sessions: PropTypes.bool,
    group_sessions: PropTypes.bool,
    crisis_support: PropTypes.bool,
    housing_assistance: PropTypes.bool,
    employment_support: PropTypes.bool,
    offers_telehealth: PropTypes.bool,
    offers_in_person: PropTypes.bool
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default ServiceInfoSection;