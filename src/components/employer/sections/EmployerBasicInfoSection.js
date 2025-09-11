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

// src/components/employer/sections/EmployerDetailsSection.js
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

// src/components/employer/sections/EmployerPoliciesSection.js
const EmployerPoliciesSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  const recoveryFriendlyFeatures = [
    { value: 'second_chance_hiring', label: 'Second Chance Hiring' },
    { value: 'flexible_schedules', label: 'Flexible Work Schedules' },
    { value: 'emp_assistance_program', label: 'Employee Assistance Program' },
    { value: 'peer_support_program', label: 'Peer Support Program' },
    { value: 'substance_abuse_accommodations', label: 'Substance Abuse Accommodations' },
    { value: 'mental_health_support', label: 'Mental Health Support' },
    { value: 'continuing_education', label: 'Continuing Education Support' },
    { value: 'lived_experience_valued', label: 'Lived Experience Valued' },
    { value: 'stigma_free_workplace', label: 'Stigma-Free Workplace' },
    { value: 'treatment_time_off', label: 'Time Off for Treatment' },
    { value: 'transportation_assistance', label: 'Transportation Assistance' },
    { value: 'skills_training', label: 'Skills Training Programs' }
  ];

  const drugTestingOptions = [
    { value: 'none', label: 'No Drug Testing' },
    { value: 'pre_employment_only', label: 'Pre-Employment Only' },
    { value: 'random', label: 'Random Testing' },
    { value: 'reasonable_suspicion', label: 'Reasonable Suspicion Only' },
    { value: 'post_incident', label: 'Post-Incident Only' }
  ];

  const backgroundCheckOptions = [
    { value: 'none', label: 'No Background Checks' },
    { value: 'case_by_case', label: 'Case-by-Case Basis' },
    { value: 'standard', label: 'Standard Background Check' },
    { value: 'flexible', label: 'Flexible Background Check Policy' }
  ];

  return (
    <>
      <h3 className="card-title mb-4">Recovery-Friendly Policies & Culture</h3>
      
      <div className="form-group mb-4">
        <label className="label">Recovery-Friendly Features</label>
        <div className="grid-auto">
          {recoveryFriendlyFeatures.map(feature => (
            <div key={feature.value} className="checkbox-item">
              <input
                type="checkbox"
                id={`feature-${feature.value}`}
                checked={formData.recovery_friendly_features?.includes(feature.value)}
                onChange={(e) => onArrayChange('recovery_friendly_features', feature.value, e.target.checked)}
                disabled={loading}
              />
              <label htmlFor={`feature-${feature.value}`}>
                {feature.label}
              </label>
            </div>
          ))}
        </div>
        <div className="text-gray-500 mt-2 text-sm">
          Select all features that apply to your workplace
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Accommodation Policies</label>
        <textarea
          className="input"
          name="accommodation_policies"
          value={formData.accommodation_policies}
          onChange={onInputChange}
          placeholder="Describe your policies for accommodating employees in recovery (flexible schedules, treatment appointments, etc.)..."
          disabled={loading}
          rows="3"
        />
        <div className="text-gray-500 mt-1 text-sm">
          Explain how you accommodate employees' recovery needs
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Hiring Practices</label>
        <textarea
          className="input"
          name="hiring_practices"
          value={formData.hiring_practices}
          onChange={onInputChange}
          placeholder="Describe your approach to hiring individuals with criminal histories or in recovery..."
          disabled={loading}
          rows="3"
        />
        <div className="text-gray-500 mt-1 text-sm">
          Share your fair chance hiring practices
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="label">Drug Testing Policy</label>
          <select
            className="input"
            name="drug_testing_policy"
            value={formData.drug_testing_policy}
            onChange={onInputChange}
            disabled={loading}
          >
            <option value="">Select Policy</option>
            {drugTestingOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Be transparent about drug testing requirements
          </div>
        </div>
        
        <div className="form-group">
          <label className="label">Background Check Policy</label>
          <select
            className="input"
            name="background_check_policy"
            value={formData.background_check_policy}
            onChange={onInputChange}
            disabled={loading}
          >
            <option value="">Select Policy</option>
            {backgroundCheckOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="text-gray-500 mt-1 text-sm">
            Explain your background check approach
          </div>
        </div>
      </div>
    </>
  );
};

// src/components/employer/sections/EmployerJobsSection.js
const EmployerJobsSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange,
  onObjectChange
}) => {
  const jobTypeOptions = [
    { value: 'full_time', label: 'Full-Time' },
    { value: 'part_time', label: 'Part-Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' },
    { value: 'internship', label: 'Internship' },
    { value: 'apprenticeship', label: 'Apprenticeship' }
  ];

  const remoteWorkOptions = [
    { value: 'on_site', label: 'On-Site Only' },
    { value: 'fully_remote', label: 'Fully Remote' },
    { value: 'hybrid', label: 'Hybrid (Remote + On-Site)' },
    { value: 'flexible', label: 'Flexible Options Available' }
  ];

  const benefitsOptions = [
    { value: 'health_insurance', label: 'Health Insurance' },
    { value: 'dental_insurance', label: 'Dental Insurance' },
    { value: 'vision_insurance', label: 'Vision Insurance' },
    { value: 'retirement', label: 'Retirement/401k' },
    { value: 'paid_time_off', label: 'Paid Time Off' },
    { value: 'sick_leave', label: 'Sick Leave' },
    { value: 'mental_health_coverage', label: 'Mental Health Coverage' },
    { value: 'substance_abuse_coverage', label: 'Substance Abuse Treatment Coverage' },
    { value: 'skills_training', label: 'Skills Training' },
    { value: 'continuing_education', label: 'Continuing Education' },
    { value: 'transportation_assistance', label: 'Transportation Assistance' },
    { value: 'childcare_assistance', label: 'Childcare Assistance' }
  ];

  // Handle adding new job opening
  const handleAddJobOpening = () => {
    const newOpening = document.getElementById('new-job-opening').value.trim();
    if (newOpening && !formData.current_openings?.includes(newOpening)) {
      onArrayChange('current_openings', newOpening, true);
      document.getElementById('new-job-opening').value = '';
    }
  };

  // Handle removing job opening
  const handleRemoveJobOpening = (opening) => {
    onArrayChange('current_openings', opening, false);
  };

  return (
    <>
      <h3 className="card-title mb-4">Employment & Benefits Information</h3>
      
      <div className="form-group mb-4">
        <label className="label">Job Types Available</label>
        <div className="grid-auto">
          {jobTypeOptions.map(type => (
            <div key={type.value} className="checkbox-item">
              <input
                type="checkbox"
                id={`job-type-${type.value}`}
                checked={formData.job_types_available?.includes(type.value)}
                onChange={(e) => onArrayChange('job_types_available', type.value, e.target.checked)}
                disabled={loading}
              />
              <label htmlFor={`job-type-${type.value}`}>
                {type.label}
              </label>
            </div>
          ))}
        </div>
        <div className="text-gray-500 mt-2 text-sm">
          Select all employment types you offer
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Remote Work Options</label>
        <select
          className="input"
          name="remote_work_options"
          value={formData.remote_work_options}
          onChange={onInputChange}
          disabled={loading}
        >
          <option value="">Select Remote Work Policy</option>
          {remoteWorkOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group mb-4">
        <label className="label">Benefits Offered</label>
        <div className="grid-auto">
          {benefitsOptions.map(benefit => (
            <div key={benefit.value} className="checkbox-item">
              <input
                type="checkbox"
                id={`benefit-${benefit.value}`}
                checked={formData.benefits_offered?.includes(benefit.value)}
                onChange={(e) => onArrayChange('benefits_offered', benefit.value, e.target.checked)}
                disabled={loading}
              />
              <label htmlFor={`benefit-${benefit.value}`}>
                {benefit.label}
              </label>
            </div>
          ))}
        </div>
        <div className="text-gray-500 mt-2 text-sm">
          Select all benefits you provide to employees
        </div>
      </div>

      <h4 style={{ 
        color: 'var(--secondary-teal)', 
        marginBottom: 'var(--spacing-lg)', 
        paddingBottom: '10px', 
        borderBottom: '2px solid var(--border-beige)' 
      }}>
        Current Job Openings
      </h4>

      <div className="form-group mb-4">
        <label className="label">Current Open Positions</label>
        <div className="grid-2 mb-2">
          <input
            className="input"
            type="text"
            id="new-job-opening"
            placeholder="Job Title (e.g., Construction Worker, Administrative Assistant)"
            disabled={loading}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddJobOpening}
            disabled={loading}
          >
            Add Position
          </button>
        </div>
        
        {formData.current_openings?.length > 0 && (
          <div className="mb-3">
            <div className="label mb-2">Listed Positions:</div>
            {formData.current_openings.map((opening, index) => (
              <div key={index} className="flex" style={{ alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-success mr-2">{opening}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => handleRemoveJobOpening(opening)}
                  disabled={loading}
                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="text-gray-500 mt-1 text-sm">
          Add specific job titles you're currently hiring for
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Application Process</label>
        <textarea
          className="input"
          name="application_process"
          value={formData.application_process}
          onChange={onInputChange}
          placeholder="Describe how applicants should apply (email, website, in person, etc.)..."
          disabled={loading}
          rows="3"
        />
        <div className="text-gray-500 mt-1 text-sm">
          Provide clear instructions on how to apply
        </div>
      </div>

      <div className="form-group mb-4">
        <div className="flex" style={{ alignItems: 'center' }}>
          <input
            type="checkbox"
            id="is_actively_hiring"
            name="is_actively_hiring"
            checked={formData.is_actively_hiring}
            onChange={onInputChange}
            disabled={loading}
            style={{ marginRight: '8px' }}
          />
          <label htmlFor="is_actively_hiring" className="label" style={{ margin: 0 }}>
            Currently actively hiring
          </label>
        </div>
        <div className="text-gray-500 mt-1 text-sm">
          Check this if you're actively looking for new employees
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="label">Additional Notes</label>
        <textarea
          className="input"
          name="additional_notes"
          value={formData.additional_notes}
          onChange={onInputChange}
          placeholder="Any additional information about your company or opportunities..."
          disabled={loading}
          rows="3"
        />
        <div className="text-gray-500 mt-1 text-sm">
          Share any other important information for potential applicants
        </div>
      </div>
    </>
  );
};

export { EmployerBasicInfoSection, EmployerDetailsSection, EmployerPoliciesSection, EmployerJobsSection };