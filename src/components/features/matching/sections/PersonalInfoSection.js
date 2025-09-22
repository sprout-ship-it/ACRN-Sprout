// src/components/features/matching/sections/PersonalInfoSection.js - Refactored with enhanced CSS module usage
import React from 'react';
import PropTypes from 'prop-types';
import { genderOptions, sexOptions, states } from '../constants/matchingFormConstants';

const PersonalInfoSection = ({
  formData,
  errors,
  loading,
  profile,
  onInputChange,
  onArrayChange, // Added for interface consistency
  onRangeChange,  // Added for interface consistency
  styles = {}     // CSS module styles passed from parent
}) => {
  return (
    <>
      {/* Personal Information Section */}
      <h3 className="card-title mb-4">Personal Information</h3>
      
      {/* Name Fields - Using existing profile data */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">First Name</label>
          <input
            className="input"
            type="text"
            value={profile?.first_name || ''}
            disabled
            style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}
          />
          <div className="text-gray-500 mt-1 text-sm">
            From your account registration
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Last Name</label>
          <input
            className="input"
            type="text"
            value={profile?.last_name || ''}
            disabled
            style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}
          />
          <div className="text-gray-500 mt-1 text-sm">
            From your account registration
          </div>
        </div>
      </div>
      
      {/* Email Field */}
      <div className="form-group mb-4">
        <label className="label">Email Address</label>
        <input
          className="input"
          type="email"
          value={profile?.email || ''}
          disabled
          style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}
        />
        <div className="text-gray-500 mt-1 text-sm">
          Your registered email address - contact support to change
        </div>
      </div>
      
      {/* Required Personal Details */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
            disabled={loading}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            required
          />
          {errors.dateOfBirth && (
            <div className="text-red-500 mt-1 text-sm">{errors.dateOfBirth}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Must be 18 or older to use this service
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.phone ? 'border-red-500' : ''}`}
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            disabled={loading}
            required
          />
          {errors.phone && (
            <div className="text-red-500 mt-1 text-sm">{errors.phone}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            For emergency contact and verification
          </div>
        </div>
      </div>
      
      {/* Identity Information */}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Gender Identity</label>
          <select
            className="input"
            value={formData.gender || ''}
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
            Helps us provide better roommate matches
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Biological Sex</label>
          <select
            className="input"
            value={formData.sex || ''}
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
            Used for housing compatibility and safety
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="card-header">
        <h4 className="card-title">
          Current Address <span className="text-gray-500 text-sm font-normal">(Optional)</span>
        </h4>
        <p className="card-subtitle">
          Your current address helps us suggest nearby housing options and services
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">Street Address</label>
        <input
          className="input"
          type="text"
          value={formData.address || ''}
          onChange={(e) => onInputChange('address', e.target.value)}
          placeholder="123 Main Street, Apt 4B"
          disabled={loading}
        />
        <div className="text-gray-500 mt-1 text-sm">
          Include apartment/unit number if applicable
        </div>
      </div>

      <div className="grid-3 mb-4">
        <div className="form-group">
          <label className="label">City</label>
          <input
            className="input"
            type="text"
            value={formData.city || ''}
            onChange={(e) => onInputChange('city', e.target.value)}
            placeholder="City name"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="label">State</label>
          <select
            className="input"
            value={formData.state || ''}
            onChange={(e) => onInputChange('state', e.target.value)}
            disabled={loading}
          >
            <option value="">Select State</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="label">ZIP Code</label>
          <input
            className={`input ${errors.zipCode ? 'border-red-500' : ''}`}
            type="text"
            value={formData.zipCode || ''}
            onChange={(e) => onInputChange('zipCode', e.target.value)}
            placeholder="12345 or 12345-6789"
            disabled={loading}
            pattern="[0-9]{5}(-[0-9]{4})?"
            maxLength="10"
          />
          {errors.zipCode && (
            <div className="text-red-500 mt-1 text-sm">{errors.zipCode}</div>
          )}
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="card-header">
        <h4 className="card-title">
          Emergency Contact <span className="text-gray-500 text-sm font-normal">(Recommended)</span>
        </h4>
        <p className="card-subtitle">
          Someone we can contact in case of emergency during your housing search
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Emergency Contact Name</label>
          <input
            className="input"
            type="text"
            value={formData.emergencyContactName || ''}
            onChange={(e) => onInputChange('emergencyContactName', e.target.value)}
            placeholder="Full name"
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Family member, friend, or support person
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Emergency Contact Phone</label>
          <input
            className="input"
            type="tel"
            value={formData.emergencyContactPhone || ''}
            onChange={(e) => onInputChange('emergencyContactPhone', e.target.value)}
            placeholder="(555) 123-4567"
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Best number to reach them
          </div>
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Relationship to Emergency Contact</label>
        <select
          className="input"
          value={formData.emergencyContactRelationship || ''}
          onChange={(e) => onInputChange('emergencyContactRelationship', e.target.value)}
          disabled={loading}
        >
          <option value="">Select relationship</option>
          <option value="parent">Parent</option>
          <option value="sibling">Sibling</option>
          <option value="spouse">Spouse/Partner</option>
          <option value="child">Adult Child</option>
          <option value="friend">Friend</option>
          <option value="counselor">Counselor/Therapist</option>
          <option value="sponsor">Sponsor</option>
          <option value="other">Other</option>
        </select>
        <div className="text-gray-500 mt-1 text-sm">
          Their relationship to you
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="alert alert-info">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🔒</span>
          Privacy & Security
        </h4>
        <p className="mb-2">
          <strong>Your personal information is protected:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li>Only shared with verified, matched roommates</li>
          <li>Emergency contact used only in case of safety concerns</li>
          <li>Address helps suggest nearby housing but isn't shared publicly</li>
          <li>You control what information potential matches can see</li>
        </ul>
        <p className="text-sm">
          Read our <a href="/privacy" target="_blank" style={{ color: 'var(--primary-purple)', textDecoration: 'underline' }}>Privacy Policy</a> for complete details.
        </p>
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
    emergencyContactPhone: PropTypes.string,
    emergencyContactRelationship: PropTypes.string
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  profile: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string
  }),
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired,  // Added for interface consistency
  onRangeChange: PropTypes.func.isRequired,  // Added for interface consistency
  styles: PropTypes.object                   // CSS module styles
};

PersonalInfoSection.defaultProps = {
  profile: null,
  styles: {}
};

export default PersonalInfoSection;