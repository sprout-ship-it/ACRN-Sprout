// src/components/employer/sections/EmployerDetailsSection.js
import React from 'react';

const EmployerDetailsSection = ({
  formData,
  errors,
  loading,
  onInputChange
}) => {
  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ];

  return (
    <>
      <h3 className="card-title mb-4">Company Details</h3>
      
      <div className="form-group mb-4">
        <label className="label">
          Company Description <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`input ${errors.description ? 'border-red-500' : ''}`}
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Describe your company, mission, and what makes it recovery-friendly..."
          disabled={loading}
          rows="4"
          required
        />
        {errors.description && (
          <div className="text-red-500 mt-1">{errors.description}</div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          This will help applicants understand your company's mission and values
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Company Size</label>
          <select
            className="input"
            name="company_size"
            value={formData.company_size}
            onChange={onInputChange}
            disabled={loading}
          >
            <option value="">Select Company Size</option>
            {companySizeOptions.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="label">Founded Year</label>
          <input
            className="input"
            type="number"
            name="founded_year"
            value={formData.founded_year}
            onChange={onInputChange}
            placeholder="2020"
            min="1800"
            max={new Date().getFullYear()}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Company Culture</label>
        <textarea
          className="input"
          name="company_culture"
          value={formData.company_culture}
          onChange={onInputChange}
          placeholder="Describe your company culture, values, and work environment..."
          disabled={loading}
          rows="3"
        />
        <div className="text-gray-500 mt-1 text-sm">
          Help applicants understand what it's like to work at your company
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Diversity & Inclusion Commitment</label>
        <textarea
          className="input"
          name="diversity_commitment"
          value={formData.diversity_commitment}
          onChange={onInputChange}
          placeholder="Describe your commitment to diversity, inclusion, and supporting individuals in recovery..."
          disabled={loading}
          rows="3"
        />
        <div className="text-gray-500 mt-1 text-sm">
          Share your commitment to creating an inclusive workplace
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Community Involvement</label>
        <textarea
          className="input"
          name="community_involvement"
          value={formData.community_involvement}
          onChange={onInputChange}
          placeholder="Describe how your company is involved in the recovery community or local initiatives..."
          disabled={loading}
          rows="3"
        />
        <div className="text-gray-500 mt-1 text-sm">
          Show how your company supports the recovery community
        </div>
      </div>
    </>
  );
};

export default EmployerDetailsSection;