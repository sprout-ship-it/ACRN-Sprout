// src/components/forms/sections/peer-support/ServiceSettingsSection.js
import React from 'react';
import PropTypes from 'prop-types';
import { 
  contactMethodOptions, 
  responseTimeOptions, 
  serviceAreaOptions,
  HELP_TEXT,
  VALIDATION_RULES 
} from '../../constants/peerSupportConstants';

const ServiceSettingsSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  return (
    <>
      <h3 className="card-title mb-4">Service Settings</h3>
      
      {/* Contact & Communication Preferences */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Preferred Contact Method</label>
          <select
            className="input"
            value={formData.preferred_contact_method}
            onChange={(e) => onInputChange('preferred_contact_method', e.target.value)}
            disabled={loading}
          >
            {contactMethodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            How you prefer clients to initially contact you
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Response Time</label>
          <select
            className="input"
            value={formData.response_time}
            onChange={(e) => onInputChange('response_time', e.target.value)}
            disabled={loading}
          >
            {responseTimeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            How quickly you typically respond to new inquiries
          </div>
        </div>
      </div>

      {/* Capacity & Availability */}
      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Capacity & Availability
      </h4>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Maximum Clients</label>
          <input
            className={`input ${errors.max_clients ? 'border-red-500' : ''}`}
            type="number"
            min={VALIDATION_RULES.max_clients.min}
            max={VALIDATION_RULES.max_clients.max}
            value={formData.max_clients}
            onChange={(e) => onInputChange('max_clients', parseInt(e.target.value) || 10)}
            disabled={loading}
          />
          {errors.max_clients && (
            <div className="text-red-500 mt-1">{errors.max_clients}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            {HELP_TEXT.max_clients}
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Service Radius (miles)</label>
          <input
            className={`input ${errors.service_radius ? 'border-red-500' : ''}`}
            type="number"
            min={VALIDATION_RULES.service_radius.min}
            max={VALIDATION_RULES.service_radius.max}
            value={formData.service_radius}
            onChange={(e) => onInputChange('service_radius', parseInt(e.target.value) || 25)}
            disabled={loading}
          />
          {errors.service_radius && (
            <div className="text-red-500 mt-1">{errors.service_radius}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            How far you're willing to travel for in-person services
          </div>
        </div>
      </div>

      {/* Available Hours */}
      <div className="form-group mb-4">
        <label className="label">Available Hours</label>
        <textarea
          className="input"
          value={formData.available_hours}
          onChange={(e) => onInputChange('available_hours', e.target.value)}
          placeholder="e.g., Monday-Friday 9am-5pm, Saturday mornings, or 'Flexible scheduling available'"
          style={{ minHeight: '60px', resize: 'vertical' }}
          disabled={loading}
          maxLength="200"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {HELP_TEXT.available_hours} ({(formData.available_hours?.length || 0)}/200 characters)
        </div>
      </div>

      {/* Service Areas */}
      <div className="form-group mb-4">
        <label className="label">Service Areas</label>
        <div className="text-gray-500 mb-3 text-sm">
          {HELP_TEXT.service_area}
        </div>
        <div className="grid-auto mt-2">
          {serviceAreaOptions.map(area => (
            <div
              key={area}
              className={`checkbox-item ${formData.service_area?.includes(area) ? 'selected' : ''}`}
              onClick={() => onArrayChange('service_area', area, !formData.service_area?.includes(area))}
            >
              <input
                type="checkbox"
                checked={formData.service_area?.includes(area) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span>{area}</span>
            </div>
          ))}
        </div>
        {errors.service_area && (
          <div className="text-red-500 mt-1">{errors.service_area}</div>
        )}
      </div>

      {/* Availability Status */}
      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Current Status
      </h4>

      <div className="form-group mb-4">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.is_accepting_clients}
            onChange={(e) => onInputChange('is_accepting_clients', e.target.checked)}
            disabled={loading}
          />
          <span className="checkbox-text">
            <strong>Currently accepting new clients</strong>
            <div className="text-gray-500 text-sm mt-1">
              Check this if you're available to take on new clients. You can update this anytime.
            </div>
          </span>
        </label>
      </div>

      {/* Additional Notes */}
      <div className="form-group mb-4">
        <label className="label">Additional Service Notes (Optional)</label>
        <textarea
          className="input"
          value={formData.additional_notes || ''}
          onChange={(e) => onInputChange('additional_notes', e.target.value)}
          placeholder="Any additional information about your services, scheduling preferences, or special considerations..."
          style={{ minHeight: '80px', resize: 'vertical' }}
          disabled={loading}
          maxLength="500"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.additional_notes?.length || 0)}/500 characters
        </div>
      </div>

      {/* Service Summary */}
      <div className="alert alert-info">
        <div className="mb-2">
          <strong>Service Summary:</strong>
        </div>
        <div className="grid-2 text-sm">
          <div>
            <strong>Contact:</strong> {formData.preferred_contact_method || 'Phone'}
          </div>
          <div>
            <strong>Response:</strong> {responseTimeOptions.find(opt => opt.value === formData.response_time)?.label || 'Within 24 hours'}
          </div>
          <div>
            <strong>Capacity:</strong> Up to {formData.max_clients || 10} clients
          </div>
          <div>
            <strong>Status:</strong> 
            <span className={`badge ml-2 ${formData.is_accepting_clients ? 'badge-success' : 'badge-warning'}`}>
              {formData.is_accepting_clients ? 'Accepting Clients' : 'Not Accepting'}
            </span>
          </div>
        </div>
      </div>

      {/* Verification Notice */}
      <div className="alert alert-warning">
        <strong>Profile Review:</strong> Once you complete your profile, our team will review your information and credentials. This typically takes 1-3 business days. You'll receive an email notification when your profile is approved and visible to clients.
      </div>
    </>
  );
};

ServiceSettingsSection.propTypes = {
  formData: PropTypes.shape({
    preferred_contact_method: PropTypes.string.isRequired,
    response_time: PropTypes.string.isRequired,
    max_clients: PropTypes.number.isRequired,
    service_radius: PropTypes.number.isRequired,
    available_hours: PropTypes.string,
    service_area: PropTypes.arrayOf(PropTypes.string),
    is_accepting_clients: PropTypes.bool.isRequired,
    additional_notes: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default ServiceSettingsSection;