// src/components/forms/sections/peer-support/ContactInfoSection.js
import React from 'react';
import PropTypes from 'prop-types';
import { stateOptions, HELP_TEXT } from '../../constants/peerSupportConstants';

const ContactInfoSection = ({
  formData,
  errors,
  loading,
  onInputChange
}) => {
  return (
    <>
      <h3 className="card-title mb-4">Contact Information</h3>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.phone ? 'border-red-500' : ''}`}
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            disabled={loading}
            required
          />
          {errors.phone && (
            <div className="text-red-500 mt-1">{errors.phone}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            {HELP_TEXT.phone}
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Professional Title</label>
          <input
            className={`input ${errors.title ? 'border-red-500' : ''}`}
            type="text"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            placeholder="e.g., Certified Peer Specialist"
            disabled={loading}
          />
          {errors.title && (
            <div className="text-red-500 mt-1">{errors.title}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            {HELP_TEXT.title}
          </div>
        </div>
      </div>

      {/* Office/Service Address */}
      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Service Location (Optional)
      </h4>
      
      <div className="form-group mb-4">
        <label className="label">Street Address</label>
        <input
          className="input"
          type="text"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          placeholder="123 Recovery Way"
          disabled={loading}
        />
        <div className="text-gray-500 mt-1 text-sm">
          Office or primary service location (leave blank if services are primarily remote)
        </div>
      </div>

      <div className="grid-3 mb-4">
        <div className="form-group">
          <label className="label">City</label>
          <input
            className="input"
            type="text"
            value={formData.city}
            onChange={(e) => onInputChange('city', e.target.value)}
            placeholder="City"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="label">State</label>
          <select
            className="input"
            value={formData.state}
            onChange={(e) => onInputChange('state', e.target.value)}
            disabled={loading}
          >
            <option value="">Select State</option>
            {stateOptions.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="label">ZIP Code</label>
          <input
            className="input"
            type="text"
            value={formData.zip_code}
            onChange={(e) => onInputChange('zip_code', e.target.value)}
            placeholder="12345"
            disabled={loading}
            maxLength="10"
          />
        </div>
      </div>

      {/* Service Area Information */}
      <div className="alert alert-info">
        <strong>Note about service location:</strong> Your address information helps clients understand your service area and is used for location-based matching. If you provide remote services only, you can leave the address fields blank and specify your service coverage in the Service Settings section.
      </div>
    </>
  );
};

ContactInfoSection.propTypes = {
  formData: PropTypes.shape({
    phone: PropTypes.string.isRequired,
    title: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zip_code: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default ContactInfoSection;