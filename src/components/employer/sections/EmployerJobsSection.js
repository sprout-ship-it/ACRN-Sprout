// src/components/employer/sections/EmployerJobsSection.js
import React from 'react';

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

export default EmployerJobsSection;