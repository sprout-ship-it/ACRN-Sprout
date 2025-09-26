// src/components/features/matching/sections/PersonalInfoSection.js - FULLY ALIGNED WITH NEW SCHEMA
import React from 'react';
import PropTypes from 'prop-types';
import { genderOptions, sexOptions, states } from '../constants/matchingFormConstants';

const PersonalInfoSection = ({
  formData,
  errors,
  loading,
  profile,
  onInputChange,
  onArrayChange, // For interface consistency
  onRangeChange,  // For interface consistency
  styles = {},    // CSS module styles passed from parent
  fieldMapping,   // Schema field mapping from parent
  sectionId,      // Section identifier
  isActive,       // Whether this section is currently active
  validationMessage // Current validation message
}) => {
  // Helper to get field name with schema mapping
  const getFieldName = (field) => {
    return fieldMapping?.personal?.[field] || field;
  };

  // Enhanced validation for phone numbers
  const validatePhoneNumber = (phone) => {
    if (!phone) return false;
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    // Check if it's a valid US phone number (10 or 11 digits)
    return digits.length === 10 || (digits.length === 11 && digits[0] === '1');
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    return phone; // Return as-is if not 10 digits
  };

  // Handle phone number input with auto-formatting
  const handlePhoneChange = (value) => {
    // Allow only digits, spaces, parentheses, and dashes
    const cleanValue = value.replace(/[^\d\s()-]/g, '');
    onInputChange('primary_phone', cleanValue);
  };

  // Validate date of birth
  const validateDateOfBirth = (date) => {
    if (!date) return false;
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;
    
    return adjustedAge >= 18 && adjustedAge <= 100;
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const currentAge = formData.date_of_birth ? calculateAge(formData.date_of_birth) : null;

  return (
    <>
      {/* Personal Information Section Header */}
      <div className="section-intro">
        <h3 className="card-title mb-4">Personal Information</h3>
        <div className="alert alert-info mb-4">
          <h4 className="mb-2">
            <span style={{ marginRight: '8px' }}>👤</span>
            Foundation Profile Information
          </h4>
          <p className="mb-0">
            This core information helps verify your identity and enables secure matching with compatible roommates. 
            All personal data is protected by our privacy policies and only shared with verified matches.
          </p>
        </div>
      </div>

      {/* Account Information (Read-only) */}
      <div className="card-header">
        <h4 className="card-title">Account Information</h4>
        <p className="card-subtitle">
          From your account registration - contact support to make changes
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">First Name</label>
          <input
            className="input input-readonly"
            type="text"
            value={profile?.first_name || ''}
            disabled
            style={{ 
              backgroundColor: 'var(--gray-50)', 
              color: 'var(--gray-700)',
              cursor: 'not-allowed'
            }}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Registered account name
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Last Name</label>
          <input
            className="input input-readonly"
            type="text"
            value={profile?.last_name || ''}
            disabled
            style={{ 
              backgroundColor: 'var(--gray-50)', 
              color: 'var(--gray-700)',
              cursor: 'not-allowed'
            }}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Registered account name
          </div>
        </div>
      </div>
      
      <div className="form-group mb-4">
        <label className="label">Email Address</label>
        <input
          className="input input-readonly"
          type="email"
          value={profile?.email || ''}
          disabled
          style={{ 
            backgroundColor: 'var(--gray-50)', 
            color: 'var(--gray-700)',
            cursor: 'not-allowed'
          }}
        />
        <div className="text-gray-500 mt-1 text-sm">
          Primary contact email - used for account verification and important notifications
        </div>
      </div>

      {/* Required Personal Details */}
      <div className="card-header">
        <h4 className="card-title">Personal Details</h4>
        <p className="card-subtitle">
          Essential information for identity verification and compatibility matching
        </p>
      </div>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.date_of_birth ? 'border-red-500 bg-red-50' : ''}`}
            type="date"
            value={formData.date_of_birth || ''}
            onChange={(e) => onInputChange('date_of_birth', e.target.value)}
            disabled={loading}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
            required
          />
          {currentAge && (
            <div className="text-blue-600 mt-1 text-sm font-medium">
              Age: {currentAge} years old
            </div>
          )}
          {errors.date_of_birth && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.date_of_birth}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Must be 18+ to use this service. Used for age-range matching.
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">
            Primary Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.primary_phone ? 'border-red-500 bg-red-50' : ''}`}
            type="tel"
            value={formData.primary_phone || ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(555) 123-4567"
            disabled={loading}
            maxLength="14"
            required
          />
          {formData.primary_phone && (
            <div className="text-blue-600 mt-1 text-sm">
              Formatted: {formatPhoneNumber(formData.primary_phone)}
            </div>
          )}
          {errors.primary_phone && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.primary_phone}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            For emergency contact and verification. Not shared publicly.
          </div>
        </div>
      </div>
      
      {/* Identity Information */}
      <div className="card-header">
        <h4 className="card-title">Identity Information</h4>
        <p className="card-subtitle">
          Optional identity details that help with roommate compatibility and housing safety
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Gender Identity</label>
          <select
            className={`input ${errors.gender_identity ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.gender_identity || ''}
            onChange={(e) => onInputChange('gender_identity', e.target.value)}
            disabled={loading}
          >
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.gender_identity && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.gender_identity}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            How you identify - helps with inclusive roommate matching
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Biological Sex</label>
          <select
            className={`input ${errors.biological_sex ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.biological_sex || ''}
            onChange={(e) => onInputChange('biological_sex', e.target.value)}
            disabled={loading}
          >
            {sexOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.biological_sex && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.biological_sex}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Used for housing compatibility and safety considerations
          </div>
        </div>
      </div>

      {/* Current Address Section */}
      <div className="card-header">
        <h4 className="card-title">
          Current Address <span className="text-gray-500 text-sm font-normal">(Optional)</span>
        </h4>
        <p className="card-subtitle">
          Your current location helps us suggest nearby housing opportunities and calculate distances
        </p>
      </div>

      <div className="form-group mb-4">
        <label className="label">Street Address</label>
        <input
          className={`input ${errors.current_address ? 'border-red-500 bg-red-50' : ''}`}
          type="text"
          value={formData.current_address || ''}
          onChange={(e) => onInputChange('current_address', e.target.value)}
          placeholder="123 Main Street, Apt 4B"
          disabled={loading}
          maxLength="255"
        />
        {errors.current_address && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.current_address}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          Include apartment or unit number if applicable
        </div>
      </div>

      <div className="grid-3 mb-4">
        <div className="form-group">
          <label className="label">City</label>
          <input
            className={`input ${errors.current_city ? 'border-red-500 bg-red-50' : ''}`}
            type="text"
            value={formData.current_city || ''}
            onChange={(e) => onInputChange('current_city', e.target.value)}
            placeholder="City name"
            disabled={loading}
            maxLength="100"
          />
          {errors.current_city && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.current_city}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">State</label>
          <select
            className={`input ${errors.current_state ? 'border-red-500 bg-red-50' : ''}`}
            value={formData.current_state || ''}
            onChange={(e) => onInputChange('current_state', e.target.value)}
            disabled={loading}
          >
            <option value="">Select State</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.current_state && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.current_state}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">ZIP Code</label>
          <input
            className={`input ${errors.current_zip_code ? 'border-red-500 bg-red-50' : ''}`}
            type="text"
            value={formData.current_zip_code || ''}
            onChange={(e) => onInputChange('current_zip_code', e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="12345"
            disabled={loading}
            pattern="[0-9]{5}"
            maxLength="5"
          />
          {errors.current_zip_code && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.current_zip_code}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            5-digit ZIP code
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="card-header">
        <h4 className="card-title">
          Emergency Contact <span className="text-gray-500 text-sm font-normal">(Recommended)</span>
        </h4>
        <p className="card-subtitle">
          Someone we can contact in case of emergency during your housing search or tenancy
        </p>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Emergency Contact Name</label>
          <input
            className={`input ${errors.emergency_contact_name ? 'border-red-500 bg-red-50' : ''}`}
            type="text"
            value={formData.emergency_contact_name || ''}
            onChange={(e) => onInputChange('emergency_contact_name', e.target.value)}
            placeholder="Full name"
            disabled={loading}
            maxLength="200"
          />
          {errors.emergency_contact_name && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.emergency_contact_name}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Family member, friend, or trusted support person
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Emergency Contact Phone</label>
          <input
            className={`input ${errors.emergency_contact_phone ? 'border-red-500 bg-red-50' : ''}`}
            type="tel"
            value={formData.emergency_contact_phone || ''}
            onChange={(e) => onInputChange('emergency_contact_phone', e.target.value.replace(/[^\d\s()-]/g, ''))}
            placeholder="(555) 123-4567"
            disabled={loading}
            maxLength="14"
          />
          {errors.emergency_contact_phone && (
            <div className="text-red-500 mt-1 text-sm font-medium">{errors.emergency_contact_phone}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Best number to reach them during emergencies
          </div>
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Relationship to Emergency Contact</label>
        <select
          className={`input ${errors.emergency_contact_relationship ? 'border-red-500 bg-red-50' : ''}`}
          value={formData.emergency_contact_relationship || ''}
          onChange={(e) => onInputChange('emergency_contact_relationship', e.target.value)}
          disabled={loading}
        >
          <option value="">Select relationship</option>
          <option value="parent">Parent</option>
          <option value="sibling">Sibling</option>
          <option value="spouse">Spouse/Partner</option>
          <option value="child">Adult Child</option>
          <option value="friend">Close Friend</option>
          <option value="counselor">Counselor/Therapist</option>
          <option value="sponsor">Recovery Sponsor</option>
          <option value="case-manager">Case Manager</option>
          <option value="other-family">Other Family Member</option>
          <option value="other">Other</option>
        </select>
        {errors.emergency_contact_relationship && (
          <div className="text-red-500 mt-1 text-sm font-medium">{errors.emergency_contact_relationship}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          How this person is related to you
        </div>
      </div>

      {/* Data Validation Status */}
      {sectionId && isActive && (
        <div className="section-status mt-6">
          <div className="card-header">
            <h4 className="card-title">Section Validation Status</h4>
          </div>
          
          <div className="grid-2 mb-4">
            <div>
              <strong>Required Fields:</strong>
              <ul className="mt-2 text-sm">
                <li className={formData.date_of_birth ? 'text-green-600' : 'text-red-600'}>
                  {formData.date_of_birth ? '✓' : '✗'} Date of Birth
                </li>
                <li className={formData.primary_phone ? 'text-green-600' : 'text-red-600'}>
                  {formData.primary_phone ? '✓' : '✗'} Primary Phone
                </li>
              </ul>
            </div>
            
            <div>
              <strong>Optional Fields:</strong>
              <ul className="mt-2 text-sm">
                <li className={formData.gender_identity ? 'text-green-600' : 'text-gray-500'}>
                  {formData.gender_identity ? '✓' : '○'} Gender Identity
                </li>
                <li className={formData.emergency_contact_name ? 'text-green-600' : 'text-gray-500'}>
                  {formData.emergency_contact_name ? '✓' : '○'} Emergency Contact
                </li>
              </ul>
            </div>
          </div>

          {validationMessage && (
            <div className="alert alert-warning">
              <strong>Validation Note:</strong> {validationMessage}
            </div>
          )}
        </div>
      )}

      {/* Privacy and Security Notice */}
      <div className="alert alert-info mt-6">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>🔒</span>
          Privacy Protection & Data Security
        </h4>
        <p className="mb-2">
          <strong>Your personal information is protected:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li><strong>Identity Verification:</strong> Used only to confirm you are who you say you are</li>
          <li><strong>Contact Information:</strong> Emergency contact used only in genuine emergencies</li>
          <li><strong>Location Data:</strong> Current address helps suggest nearby housing but isn't shared publicly</li>
          <li><strong>Matching Privacy:</strong> Only basic compatibility info shared with potential matches</li>
          <li><strong>Data Security:</strong> All information encrypted and stored securely</li>
        </ul>
        <div className="mt-3">
          <a 
            href="/privacy" 
            target="_blank" 
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Read our complete Privacy Policy →
          </a>
        </div>
      </div>

      {/* Section Completion Help */}
      <div className="alert alert-success mt-4">
        <h4 className="mb-2">
          <span style={{ marginRight: '8px' }}>💡</span>
          Personal Information Tips
        </h4>
        <p className="mb-2">
          <strong>Creating a trustworthy profile:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
          <li><strong>Accuracy:</strong> Ensure all information is current and correct</li>
          <li><strong>Completeness:</strong> Fill out optional fields to improve matching quality</li>
          <li><strong>Emergency Contact:</strong> Choose someone who can be reached reliably</li>
          <li><strong>Phone Number:</strong> Use your primary number - this may be used for verification</li>
        </ul>
        <p className="text-sm">
          Complete and accurate personal information helps build trust with potential roommates and 
          ensures you receive the best possible matching suggestions.
        </p>
      </div>
    </>
  );
};

PersonalInfoSection.propTypes = {
  formData: PropTypes.shape({
    // Schema-aligned field names
    date_of_birth: PropTypes.string,              // Required
    primary_phone: PropTypes.string,              // Required
    gender_identity: PropTypes.string,            // Optional
    biological_sex: PropTypes.string,             // Optional
    current_address: PropTypes.string,            // Optional
    current_city: PropTypes.string,               // Optional
    current_state: PropTypes.string,              // Optional
    current_zip_code: PropTypes.string,           // Optional
    emergency_contact_name: PropTypes.string,     // Recommended
    emergency_contact_phone: PropTypes.string,    // Recommended
    emergency_contact_relationship: PropTypes.string // Recommended
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  profile: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string
  }),
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired,  // For interface consistency
  onRangeChange: PropTypes.func.isRequired,  // For interface consistency
  styles: PropTypes.object,                   // CSS module styles
  fieldMapping: PropTypes.object,             // Schema field mapping
  sectionId: PropTypes.string,                // Section identifier
  isActive: PropTypes.bool,                   // Whether section is active
  validationMessage: PropTypes.string         // Current validation message
};

PersonalInfoSection.defaultProps = {
  profile: null,
  styles: {},
  fieldMapping: {},
  sectionId: 'personal',
  isActive: false,
  validationMessage: null
};

export default PersonalInfoSection;