// src/components/features/employer/sections/EmployerJobsSection.js
import React, { useState } from 'react';
import styles from './EmployerSections.module.css';

const EmployerJobsSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange,
  onObjectChange
}) => {
  const [newJobOpening, setNewJobOpening] = useState('');

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
    const trimmedOpening = newJobOpening.trim();
    if (trimmedOpening && !formData.current_openings?.includes(trimmedOpening)) {
      onArrayChange('current_openings', trimmedOpening, true);
      setNewJobOpening('');
    }
  };

  // Handle removing job opening
  const handleRemoveJobOpening = (opening) => {
    onArrayChange('current_openings', opening, false);
  };

  // Handle key press for job opening input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddJobOpening();
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Employment & Benefits Information</h3>
      
      <div className="form-group">
        <label className="label">Job Types Available</label>
        <div className={styles.checkboxGrid}>
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
        <div className={styles.helperText}>
          Select all employment types you offer
        </div>
      </div>

      <div className="form-group">
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

      <div className="form-group">
        <label className="label">Benefits Offered</label>
        <div className={styles.checkboxGrid}>
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
        <div className={styles.helperText}>
          Select all benefits you provide to employees
        </div>
      </div>

      {/* Current Job Openings Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Current Job Openings</h4>

        <div className="form-group">
          <label className="label">Current Open Positions</label>
          <div className="grid-2">
            <input
              className="input"
              type="text"
              value={newJobOpening}
              onChange={(e) => setNewJobOpening(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Job Title (e.g., Construction Worker, Administrative Assistant)"
              disabled={loading}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddJobOpening}
              disabled={loading || !newJobOpening.trim()}
            >
              Add Position
            </button>
          </div>
          
          {formData.current_openings?.length > 0 && (
            <div className={styles.dynamicList}>
              <div className="label">Listed Positions:</div>
              {formData.current_openings.map((opening, index) => (
                <div key={index} className={styles.listItem}>
                  <span className="badge badge-success">{opening}</span>
                  <button
                    type="button"
                    className={`btn btn-outline btn-sm ${styles.removeButton}`}
                    onClick={() => handleRemoveJobOpening(opening)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className={styles.helperText}>
            Add specific job titles you're currently hiring for
          </div>
        </div>

        <div className="form-group">
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
          <div className={styles.helperText}>
            Provide clear instructions on how to apply
          </div>
        </div>

        <div className="form-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="is_actively_hiring"
              name="is_actively_hiring"
              checked={formData.is_actively_hiring}
              onChange={onInputChange}
              disabled={loading}
            />
            <label htmlFor="is_actively_hiring">
              Currently actively hiring
            </label>
          </div>
          <div className={styles.helperText}>
            Check this if you're actively looking for new employees
          </div>
        </div>

        <div className="form-group">
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
          <div className={styles.helperText}>
            Share any other important information for potential applicants
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerJobsSection