// src/components/employer/sections/EmployerBasicInfoSection.js
import React from 'react';

const EmployerBasicInfoSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  stateOptions
}) => {
  const industryOptions = [
    'Construction', 'Healthcare', 'Retail', 'Food Service', 'Manufacturing',
    'Transportation', 'Technology', 'Education', 'Nonprofit', 'Professional Services',
    'Hospitality', 'Agriculture', 'Finance', 'Real Estate', 'Arts & Entertainment',
    'Government', 'Utilities', 'Other'
  ];

  const businessTypeOptions = [
    { value: 'small_business', label: 'Small Business (1-50 employees)' },
    { value: 'medium_business', label: 'Medium Business (51-250 employees)' },
    { value: 'large_corporation', label: 'Large Corporation (250+ employees)' },
    { value: 'nonprofit', label: 'Nonprofit Organization' },
    { value: 'startup', label: 'Startup' },
    { value: 'social_enterprise', label: 'Social Enterprise' },
    { value: 'government', label: 'Government Agency' },
    { value: 'cooperative', label: 'Cooperative' }
  ];

  return (
    <>
      <h3 className="card-title mb-4">Basic Company Information</h3>
      
      <div className="form-group mb-4">
        <label className="label">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          className={`input ${errors.company_name ? 'border-red-500' : ''}`}
          type="text"
          name="company_name"
          value={formData.company_name}
          onChange={onInputChange}
          placeholder="Your Company Name"
          disabled={loading}
          required
        />
        {errors.company_name && (
          <div className="text-red-500 mt-1">{errors.company_name}</div>
        )}
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Industry <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.industry ? 'border-red-500' : ''}`}
            name="industry"
            value={formData.industry}
            onChange={onInputChange}
            disabled={loading}
            required
          >
            <option value="">Select Industry</option>
            {industryOptions.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          {errors.industry && (
            <div className="text-red-500 mt-1">{errors.industry}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">
            Business Type <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.business_type ? 'border-red-500' : ''}`}
            name="business_type"
            value={formData.business_type}
            onChange={onInputChange}
            disabled={loading}
            required
          >
            <option value="">Select Business Type</option>
            {businessTypeOptions.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {errors.business_type && (
            <div className="text-red-500 mt-1">{errors.business_type}</div>
          )}
        </div>
      </div>

      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Location Information
      </h4>

      <div className="form-group mb-4">
        <label className="label">Street Address</label>
        <input
          className="input"
          type="text"
          name="address"
          value={formData.address}
          onChange={onInputChange}
          placeholder="123 Business Street, Suite 100"
          disabled={loading}
        />
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            City <span className="text-red-500">*</span>
          </label>
          <input
            className={`input ${errors.city ? 'border-red-500' : ''}`}
            type="text"
            name="city"
            value={formData.city}
            onChange={onInputChange}
            placeholder="City"
            disabled={loading}
            required
          />
          {errors.city && (
            <div className="text-red-500 mt-1">{errors.city}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">
            State <span className="text-red-500">*</span>
          </label>
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
      </div>

      <div className="form-group mb-4">
        <label className="label">
          ZIP Code <span className="text-red-500">*</span>
        </label>
        <input
          className={`input ${errors.zip_code ? 'border-red-500' : ''}`}
          type="text"
          name="zip_code"
          value={formData.zip_code}
          onChange={onInputChange}
          placeholder="12345"
          disabled={loading}
          style={{ maxWidth: '200px' }}
          required
        />
        {errors.zip_code && (
          <div className="text-red-500 mt-1">{errors.zip_code}</div>
        )}
      </div>

      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Contact Information
      </h4>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">
            Phone Number <span className="text-red-500">*</span>
          </label>
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
        </div>
        
        <div className="form-group">
          <label className="label">Contact Email</label>
          <input
            className={`input ${errors.contact_email ? 'border-red-500' : ''}`}
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={onInputChange}
            placeholder="jobs@company.com"
            disabled={loading}
          />
          {errors.contact_email && (
            <div className="text-red-500 mt-1">{errors.contact_email}</div>
          )}
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Company Website</label>
          <input
            className={`input ${errors.website ? 'border-red-500' : ''}`}
            type="url"
            name="website"
            value={formData.website}
            onChange={onInputChange}
            placeholder="https://www.company.com"
            disabled={loading}
          />
          {errors.website && (
            <div className="text-red-500 mt-1">{errors.website}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="label">Contact Person</label>
          <input
            className="input"
            type="text"
            name="contact_person"
            value={formData.contact_person}
            onChange={onInputChange}
            placeholder="Hiring Manager Name"
            disabled={loading}
          />
        </div>
      </div>
    </>
  );
};

export default EmployerBasicInfoSection;