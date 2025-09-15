// src/components/features/property/sections/PropertyBasicInfoSection.js
import React from 'react';
import PropTypes from 'prop-types';
import { propertyTypes } from '../constants/propertyConstants';

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
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Property Name *</label>
          <input
            className={`input ${errors.property_name ? 'border-red-500' : ''}`}
            type="text"
            name="property_name"
            value={formData.property_name}
            onChange={onInputChange}
            placeholder="e.g., Serenity Sober Living Home"
            disabled={loading}
            required
          />
          {errors.property_name && (
            <div className="text-red-500 mt-1">{errors.property_name}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">Property Type *</label>
          <select
            className={`input ${errors.property_type ? 'border-red-500' : ''}`}
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
            <div className="text-red-500 mt-1">{errors.property_type}</div>
          )}
        </div>
      </div>
      
      {/* Address Information */}
      <div className="form-group mb-4">
        <label className="label">Street Address *</label>
        <input
          className={`input ${errors.address ? 'border-red-500' : ''}`}
          type="text"
          name="address"
          value={formData.address}
          onChange={onInputChange}
          placeholder="123 Recovery Lane"
          disabled={loading}
          required
        />
        {errors.address && (
          <div className="text-red-500 mt-1">{errors.address}</div>
        )}
      </div>
      
      <div className="grid-3 mb-4">
        <div className="form-group">
          <label className="label">City *</label>
          <input
            className={`input ${errors.city ? 'border-red-500' : ''}`}
            type="text"
            name="city"
            value={formData.city}
            onChange={onInputChange}
            disabled={loading}
            required
          />
          {errors.city && (
            <div className="text-red-500 mt-1">{errors.city}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">State *</label>
          <select
            className={`input ${errors.state ? 'border-red-500' : ''}`}
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
            <div className="text-red-500 mt-1">{errors.state}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">ZIP Code *</label>
          <input
            className={`input ${errors.zip_code ? 'border-red-500' : ''}`}
            type="text"
            name="zip_code"
            value={formData.zip_code}
            onChange={onInputChange}
            placeholder="12345"
            disabled={loading}
            required
          />
          {errors.zip_code && (
            <div className="text-red-500 mt-1">{errors.zip_code}</div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <h4 className="card-subtitle mb-3">Contact Information</h4>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Primary Contact Phone *</label>
          <input
            className={`input ${errors.phone ? 'border-red-500' : ''}`}
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            placeholder="(555) 123-4567"
            disabled={loading}
            required
          />
          {errors.phone && (
            <div className="text-red-500 mt-1">{errors.phone}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Primary contact number for this property
          </div>
        </div>
        
        <div className="form-group">
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
          <div className="text-gray-500 mt-1 text-sm">
            Email for inquiries (optional)
          </div>
        </div>
      </div>

      {/* Property Description */}
      <div className="form-group mb-4">
        <label className="label">Property Description</label>
        <textarea
          className="input"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Describe your property, its recovery-focused features, neighborhood, and what makes it special..."
          style={{ minHeight: '100px', resize: 'vertical' }}
          disabled={loading}
          maxLength="1000"
        />
        <div className="text-gray-500 mt-1 text-sm">
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