// src/components/features/employer/sections/EmployerJobsSection.js - UPDATED FOR NEW SCHEMA
import React from 'react';
import styles from './EmployerSections.module.css';

const EmployerJobsSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  // ✅ UPDATED: Job type options matching schema and common employment types
  const jobTypeOptions = [
    { value: 'full_time', label: 'Full-Time', description: 'Standard 40-hour work week with benefits' },
    { value: 'part_time', label: 'Part-Time', description: 'Less than 40 hours per week' },
    { value: 'contract', label: 'Contract', description: 'Project-based or fixed-term contract work' },
    { value: 'temporary', label: 'Temporary', description: 'Short-term positions, often seasonal' },
    { value: 'internship', label: 'Internship', description: 'Learning-focused positions for students or career changers' },
    { value: 'apprenticeship', label: 'Apprenticeship', description: 'Paid training programs leading to skilled positions' }
  ];

  // ✅ UPDATED: Remote work options matching schema constraints
  const remoteWorkOptions = [
    { value: 'on_site', label: 'On-Site Only', description: 'All work performed at company location' },
    { value: 'fully_remote', label: 'Fully Remote', description: 'Work from home or any location' },
    { value: 'hybrid', label: 'Hybrid (Remote + On-Site)', description: 'Combination of remote and in-office work' },
    { value: 'flexible', label: 'Flexible Options Available', description: 'Various arrangements based on role and needs' }
  ];

  // ✅ UPDATED: Benefits focusing on recovery-supportive options
  const benefitsOptions = [
    { value: 'health_insurance', label: 'Health Insurance', description: 'Medical coverage for employees' },
    { value: 'dental_insurance', label: 'Dental Insurance', description: 'Dental care coverage' },
    { value: 'vision_insurance', label: 'Vision Insurance', description: 'Eye care and vision coverage' },
    { value: 'retirement', label: 'Retirement/401k', description: 'Retirement savings plans with potential matching' },
    { value: 'paid_time_off', label: 'Paid Time Off', description: 'Vacation days, sick leave, and personal time' },
    { value: 'sick_leave', label: 'Sick Leave', description: 'Dedicated time off for illness' },
    { value: 'mental_health_coverage', label: 'Mental Health Coverage', description: 'Counseling and mental health services' },
    { value: 'substance_abuse_coverage', label: 'Substance Abuse Treatment Coverage', description: 'Addiction treatment and recovery services' },
    { value: 'skills_training', label: 'Skills Training', description: 'Professional development and skill building' },
    { value: 'continuing_education', label: 'Continuing Education', description: 'Support for ongoing education and certifications' },
    { value: 'transportation_assistance', label: 'Transportation Assistance', description: 'Help with commuting costs or transportation' },
    { value: 'childcare_assistance', label: 'Childcare Assistance', description: 'Support with childcare costs or services' }
  ];

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Employment Information</h3>
      
      {/* Employment Types Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Employment Types & Work Arrangements</h4>
        
        <div className="form-group">
          <label className="label">Job Types Available</label>
          <div className={styles.checkboxGrid}>
            {jobTypeOptions.map(type => (
              <div key={type.value} className={`checkbox-item ${styles.featureItem}`}>
                <input
                  type="checkbox"
                  id={`job-type-${type.value}`}
                  checked={formData.job_types_available?.includes(type.value)}
                  onChange={(e) => onArrayChange('job_types_available', type.value, e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor={`job-type-${type.value}`} className={styles.featureLabel}>
                  <div className={styles.featureName}>{type.label}</div>
                  <div className={styles.featureDescription}>{type.description}</div>
                </label>
              </div>
            ))}
          </div>
          <div className={styles.helperText}>
            Select all employment types you offer. This helps applicants understand their options.
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
              <option key={option.value} value={option.value} title={option.description}>
                {option.label}
              </option>
            ))}
          </select>
          {formData.remote_work_options && (
            <div className={styles.policyNote}>
              <strong>Remote Work:</strong> {remoteWorkOptions.find(opt => opt.value === formData.remote_work_options)?.description}
            </div>
          )}
          <div className={styles.helperText}>
            Remote work options can be especially helpful for individuals in recovery
          </div>
        </div>
      </div>

      {/* Benefits & Support Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Benefits & Employee Support</h4>
        
        <div className="form-group">
          <label className="label">Benefits Offered</label>
          <div className={styles.checkboxGrid}>
            {benefitsOptions.map(benefit => (
              <div key={benefit.value} className={`checkbox-item ${styles.featureItem}`}>
                <input
                  type="checkbox"
                  id={`benefit-${benefit.value}`}
                  checked={formData.benefits_offered?.includes(benefit.value)}
                  onChange={(e) => onArrayChange('benefits_offered', benefit.value, e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor={`benefit-${benefit.value}`} className={styles.featureLabel}>
                  <div className={styles.featureName}>{benefit.label}</div>
                  <div className={styles.featureDescription}>{benefit.description}</div>
                </label>
              </div>
            ))}
          </div>
          <div className={styles.helperText}>
            Select all benefits you provide. Mental health and substance abuse coverage are particularly valuable for recovery communities.
          </div>
        </div>
      </div>

      {/* Application Process Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Application Process & Hiring Status</h4>

        <div className="form-group">
          <label className="label">Application Process</label>
          <textarea
            className="input"
            name="application_process"
            value={formData.application_process}
            onChange={onInputChange}
            placeholder="Describe how applicants should apply to your company. Include specific instructions, required documents, and preferred contact methods. Examples: 'Send resume to jobs@company.com', 'Apply online at www.company.com/careers', 'Call our hiring manager at (555) 123-4567', 'Stop by our office Monday-Friday 9am-4pm', etc."
            disabled={loading}
            rows="4"
          />
          <div className={styles.helperText}>
            Provide clear, specific instructions on how interested applicants should contact you and apply for positions
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
            <label htmlFor="is_actively_hiring" className={styles.hiringStatusLabel}>
              <div className={styles.featureName}>Currently Actively Hiring</div>
              <div className={styles.featureDescription}>Check this if you're actively looking for new employees right now</div>
            </label>
          </div>
          <div className={styles.helperText}>
            This affects how prominently your company appears in search results. You can update this anytime.
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {(formData.job_types_available?.length > 0 || formData.benefits_offered?.length > 0) && (
        <div className={styles.subsection}>
          <h4 className={styles.subsectionTitle}>📋 Employment Overview Summary</h4>
          
          {formData.job_types_available?.length > 0 && (
            <div className={styles.summarySection}>
              <div className="label mb-2">Job Types Offered:</div>
              <div className={styles.selectedFeatures}>
                {formData.job_types_available.map(typeValue => {
                  const type = jobTypeOptions.find(t => t.value === typeValue);
                  return type ? (
                    <span key={typeValue} className="badge badge-primary mr-1 mb-1">
                      {type.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          {formData.benefits_offered?.length > 0 && (
            <div className={styles.summarySection}>
              <div className="label mb-2">Benefits Offered:</div>
              <div className={styles.selectedFeatures}>
                {formData.benefits_offered.map(benefitValue => {
                  const benefit = benefitsOptions.find(b => b.value === benefitValue);
                  return benefit ? (
                    <span key={benefitValue} className="badge badge-success mr-1 mb-1">
                      {benefit.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          <div className={styles.helperText}>
            This information will help applicants quickly understand your employment opportunities and benefits
          </div>
        </div>
      )}

      {/* Application Tips */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>💼 Application Process Best Practices</h4>
        
        <div className={styles.guidanceContent}>
          <div className={styles.helperText}>
            <strong>Make it easy for applicants to connect with you:</strong>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li><strong>Be Specific:</strong> Include exact email addresses, phone numbers, or website URLs</li>
              <li><strong>Set Expectations:</strong> Mention response timeframes and next steps</li>
              <li><strong>Remove Barriers:</strong> Consider accepting applications via phone or in-person if online isn't accessible</li>
              <li><strong>Be Welcoming:</strong> Use inclusive language that encourages people in recovery to apply</li>
              <li><strong>Provide Options:</strong> Multiple contact methods accommodate different comfort levels</li>
            </ul>
          </div>

          <div className={styles.helperText} style={{ marginTop: '15px' }}>
            <strong>Example application instructions:</strong>
            <div style={{ marginTop: '5px', padding: '10px', background: '#f8f9fa', borderRadius: '5px', fontStyle: 'italic' }}>
              "We welcome applications from all qualified candidates, including those with lived experience in recovery. 
              Please send your resume to careers@company.com or call our hiring manager, Sarah, at (555) 123-4567. 
              We typically respond within 3-5 business days and are happy to discuss accommodations during the interview process."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerJobsSection;