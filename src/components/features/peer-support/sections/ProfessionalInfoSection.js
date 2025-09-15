// src/components/forms/sections/peer-support/ProfessionalInfoSection.js
import React from 'react';
import PropTypes from 'prop-types';
import { certificationOptions, HELP_TEXT } from '../constants/peerSupportConstants';

const ProfessionalInfoSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  return (
    <>
      <h3 className="card-title mb-4">Professional Information</h3>
      
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Years of Experience</label>
          <input
            className={`input ${errors.years_experience ? 'border-red-500' : ''}`}
            type="number"
            min="0"
            max="50"
            value={formData.years_experience}
            onChange={(e) => onInputChange('years_experience', parseInt(e.target.value) || 0)}
            disabled={loading}
          />
          {errors.years_experience && (
            <div className="text-red-500 mt-1">{errors.years_experience}</div>
          )}
          <div className="text-gray-500 mt-1 text-sm">
            Years of experience in peer support or related recovery services
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">License/Certification Number</label>
          <input
            className="input"
            type="text"
            value={formData.license_number}
            onChange={(e) => onInputChange('license_number', e.target.value)}
            placeholder="Optional"
            disabled={loading}
          />
          <div className="text-gray-500 mt-1 text-sm">
            Your professional license or certification number (if applicable)
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="form-group mb-4">
        <label className="label">Certifications & Licenses</label>
        <div className="text-gray-500 mb-3 text-sm">
          {HELP_TEXT.certifications}
        </div>
        <div className="grid-auto mt-2">
          {certificationOptions.map(cert => (
            <div
              key={cert}
              className={`checkbox-item ${formData.certifications?.includes(cert) ? 'selected' : ''}`}
              onClick={() => onArrayChange('certifications', cert, !formData.certifications?.includes(cert))}
            >
              <input
                type="checkbox"
                checked={formData.certifications?.includes(cert) || false}
                onChange={() => {}}
                disabled={loading}
              />
              <span>{cert}</span>
            </div>
          ))}
        </div>
        {errors.certifications && (
          <div className="text-red-500 mt-1">{errors.certifications}</div>
        )}
      </div>

      {/* Additional Professional Information */}
      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Professional Background
      </h4>

      <div className="form-group mb-4">
        <label className="label">Educational Background (Optional)</label>
        <textarea
          className="input"
          value={formData.education || ''}
          onChange={(e) => onInputChange('education', e.target.value)}
          placeholder="Describe your relevant education, training programs, or professional development..."
          style={{ minHeight: '80px', resize: 'vertical' }}
          disabled={loading}
          maxLength="500"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.education?.length || 0)}/500 characters
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Professional Affiliations (Optional)</label>
        <textarea
          className="input"
          value={formData.affiliations || ''}
          onChange={(e) => onInputChange('affiliations', e.target.value)}
          placeholder="Professional organizations, associations, or groups you belong to..."
          style={{ minHeight: '60px', resize: 'vertical' }}
          disabled={loading}
          maxLength="300"
        />
        <div className="text-gray-500 mt-1 text-sm">
          {(formData.affiliations?.length || 0)}/300 characters
        </div>
      </div>

      {/* Verification Status */}
      <div className="alert alert-info">
        <div className="grid-2">
          <div>
            <strong>Profile Verification:</strong>
            <p className="mt-1 text-sm">
              Your professional credentials will be verified by our team to ensure quality and safety for all users.
            </p>
          </div>
          <div className="text-center">
            <span className={`badge ${formData.is_verified ? 'badge-success' : 'badge-warning'}`}>
              {formData.is_verified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

ProfessionalInfoSection.propTypes = {
  formData: PropTypes.shape({
    years_experience: PropTypes.number,
    license_number: PropTypes.string,
    certifications: PropTypes.arrayOf(PropTypes.string),
    education: PropTypes.string,
    affiliations: PropTypes.string,
    is_verified: PropTypes.bool
  }).isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default ProfessionalInfoSection;