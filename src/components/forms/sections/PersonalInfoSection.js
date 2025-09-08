// src/components/forms/sections/PersonalInfoSection.js
import React from 'react';
import PropTypes from 'prop-types';
import { genderOptions, sexOptions, states } from '../constants/matchingFormConstants';

const PersonalInfoSection = ({
  formData,
  errors,
  loading,
  profile,
  onInputChange
}) => {
  return (
    <>
      {/* Personal Information Section */}
      <h3 className="card-title mb-4">Personal Information</h3>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">First Name</label>
          <input
            className="input"
            type="text"
            value={profile?.first_name || ''}
            disabled
          />
        </div>
        
        <div className="form-group">
          <label className="label">Last Name</label>
          <input
            className="input"
            type="text"
            value={profile?.last_name || ''}
            disabled
          />
        </div>
      </div>
      
      <div className="form-group mb-4">
        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          value={profile?.email || ''}
          disabled
        />
      </div>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
            disabled={loading}
            required
          />
          {errors.dateOfBirth && (
            <div className="text-red-500 mt-1">{errors.dateOfBirth}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">
            Phone Number <span className="text-red-500">*</span>
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
        </div>
      </div>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Gender Identity</label>
          <select
            className="input"
            value={formData.gender}
            onChange={(e) => onInputChange('gender', e.target.value)}
            disabled={loading}
          >
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            This information helps us provide better matches
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Biological Sex</label>
          <select
            className="input"
            value={formData.sex}
            onChange={(e) => onInputChange('sex', e.target.value)}
            disabled={loading}
          >
            {sexOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Used for housing compatibility purposes
          </div>
        </div>
      </div>

      {/* Address Information (Optional) */}
      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Address Information (Optional)
      </h4>

      <div className="form-group mb-4">
        <label className="label">Street Address</label>
        <input
          className="input"
          type="text"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          placeholder="123 Main St, Apt 4B"
          disabled={loading}
        />
      </div>

      <div className="grid-2 mb-4">
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
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">ZIP Code</label>
        <input
          className={`input ${errors.zipCode ? 'border-red-500' : ''}`}
          type="text"
          value={formData.zipCode}
          onChange={(e) => onInputChange('zipCode', e.target.value)}
          placeholder="12345 or 12345-6789"
          disabled={loading}
          style={{ maxWidth: '200px' }}
        />
        {errors.zipCode && (
          <div className="text-red-500 mt-1">{errors.zipCode}</div>
        )}
      </div>

      {/* Emergency Contact (Optional) */}
      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Emergency Contact (Optional)
      </h4>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Emergency Contact Name</label>
          <input
            className="input"
            type="text"
            value={formData.emergencyContactName}
            onChange={(e) => onInputChange('emergencyContactName', e.target.value)}
            placeholder="Full name"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="label">Emergency Contact Phone</label>
          <input
            className="input"
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={(e) => onInputChange('emergencyContactPhone', e.target.value)}
            placeholder="(555) 123-4567"
            disabled={loading}
          />
        </div>
      </div>
    </>
  );
};

PersonalInfoSection.propTypes = {
  formData: PropTypes.shape({
    dateOfBirth: PropTypes.string,
    phone: PropTypes.string,
    gender: PropTypes.string,
    sex: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zipCode: PropTypes.string,
    emergencyContactName: PropTypes.string,
    emergencyContactPhone: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  profile: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string
  }),
  onInputChange: PropTypes.func.isRequired
};

PersonalInfoSection.defaultProps = {
  profile: null
};

export default PersonalInfoSection;