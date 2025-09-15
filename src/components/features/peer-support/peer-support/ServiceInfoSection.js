// src/components/forms/sections/peer-support/ServiceInfoSection.js
import React from 'react';
import PropTypes from 'prop-types';
import { 
  specialtyOptions, 
  recoveryApproachOptions, 
  ageGroupOptions, 
  populationOptions,
  serviceDeliveryOptions,
  HELP_TEXT 
} from '../../constants/peerSupportConstants';

const ServiceInfoSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  return (
    <>
      <h3 className="card-title mb-4">Services & Specialties</h3>
      
      {/* Specialties - Required */}
      <div className="form-group mb-4">
        <label className="label">
          Your Specialties <span className="text-red-500">*</span>
        </label>
        <div className="text-gray-500 mb-3 text-sm">
          {HELP_TEXT.specialties}
        </div>
        <div className="grid-auto mt-2">
          {specialtyOptions.map(specialty => (
            <div
              key={specialty}
              className={`checkbox-item ${formData.specialties?.includes(specialty) ? 'selected' : ''}`}
              onClick={() => onArrayChange('specialties', specialty, !formData.specialties?.includes(specialty))}
            >
              <input
                type="checkbox"
                checked={formData.specialties?.includes(specialty) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span>{specialty}</span>
            </div>
          ))}
        </div>
        {errors.specialties && (
          <div className="text-red-500 mt-1">{errors.specialties}</div>
        )}
      </div>

      {/* Recovery Approaches */}
      <div className="form-group mb-4">
        <label className="label">Recovery Approaches You Support</label>
        <div className="text-gray-500 mb-3 text-sm">
          {HELP_TEXT.recovery_approach}
        </div>
        <div className="grid-auto mt-2">
          {recoveryApproachOptions.map(approach => (
            <div
              key={approach}
              className={`checkbox-item ${formData.recovery_approach?.includes(approach) ? 'selected' : ''}`}
              onClick={() => onArrayChange('recovery_approach', approach, !formData.recovery_approach?.includes(approach))}
            >
              <input
                type="checkbox"
                checked={formData.recovery_approach?.includes(approach) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span>{approach}</span>
            </div>
          ))}
        </div>
        {errors.recovery_approach && (
          <div className="text-red-500 mt-1">{errors.recovery_approach}</div>
        )}
      </div>

      {/* Age Groups and Populations */}
      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Who You Serve
      </h4>

      <div className="grid-2 mb-4">
        {/* Age Groups */}
        <div className="form-group">
          <label className="label">Age Groups You Serve</label>
          <div className="text-gray-500 mb-3 text-sm">
            Select the age ranges you're comfortable supporting
          </div>
          <div className="checkbox-columns">
            {ageGroupOptions.map(ageGroup => (
              <label key={ageGroup} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.age_groups_served?.includes(ageGroup) || false}
                  onChange={(e) => onArrayChange('age_groups_served', ageGroup, e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">{ageGroup}</span>
              </label>
            ))}
          </div>
          {errors.age_groups_served && (
            <div className="text-red-500 mt-1">{errors.age_groups_served}</div>
          )}
        </div>

        {/* Population Specializations */}
        <div className="form-group">
          <label className="label">Population Specializations</label>
          <div className="text-gray-500 mb-3 text-sm">
            Specific populations you have experience supporting
          </div>
          <div className="checkbox-columns">
            {populationOptions.map(population => (
              <label key={population} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.populations_served?.includes(population) || false}
                  onChange={(e) => onArrayChange('populations_served', population, e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">{population}</span>
              </label>
            ))}
          </div>
          {errors.populations_served && (
            <div className="text-red-500 mt-1">{errors.populations_served}</div>
          )}
        </div>
      </div>

      {/* Service Types */}
      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Types of Services You Provide
      </h4>

      <div className="form-group mb-4">
        <div className="grid-2 mt-2">
          {serviceDeliveryOptions.map(service => (
            <label key={service.key} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData[service.key] || false}
                onChange={(e) => onInputChange(service.key, e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">
                <strong>{service.label}</strong>
                <div className="text-gray-500 text-sm mt-1">
                  {service.description}
                </div>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Service Delivery Methods */}
      <div className="form-group mb-4">
        <label className="label">Service Delivery Methods</label>
        <div className="grid-2 mt-2">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.offers_telehealth || false}
              onChange={(e) => onInputChange('offers_telehealth', e.target.checked)}
              disabled={loading}
            />
            <span className="checkbox-text">
              <strong>Telehealth Services</strong>
              <div className="text-gray-500 text-sm mt-1">
                Remote support via phone, video, or messaging
              </div>
            </span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.offers_in_person || false}
              onChange={(e) => onInputChange('offers_in_person', e.target.checked)}
              disabled={loading}
            />
            <span className="checkbox-text">
              <strong>In-Person Services</strong>
              <div className="text-gray-500 text-sm mt-1">
                Face-to-face meetings at office or community locations
              </div>
            </span>
          </label>
        </div>
      </div>

      {/* Service Coverage Notice */}
      <div className="alert alert-info">
        <strong>Service Coverage:</strong> Make sure to select at least one service delivery method (telehealth or in-person) so clients know how they can access your support.
      </div>
    </>
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