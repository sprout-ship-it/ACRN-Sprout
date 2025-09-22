// src/components/features/employer/sections/EmployerPoliciesSection.js
import React from 'react';
import styles from './EmployerSections.module.css';

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
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Recovery-Friendly Policies & Culture</h3>
      
      <div className="form-group">
        <label className="label">Recovery-Friendly Features</label>
        <div className={styles.checkboxGrid}>
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
        <div className={styles.helperText}>
          Select all features that apply to your workplace
        </div>
      </div>

      <div className="form-group">
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
        <div className={styles.helperText}>
          Explain how you accommodate employees' recovery needs
        </div>
      </div>

      <div className="form-group">
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
        <div className={styles.helperText}>
          Share your fair chance hiring practices
        </div>
      </div>

      <div className="grid-2">
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
          <div className={styles.helperText}>
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
          <div className={styles.helperText}>
            Explain your background check approach
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerPoliciesSection;