// src/components/features/employer/sections/EmployerPoliciesSection.js - UPDATED FOR NEW SCHEMA
import React from 'react';
import styles from './EmployerSections.module.css';

const EmployerPoliciesSection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  // ✅ UPDATED: Recovery-friendly features with clear, practical options
  const recoveryFriendlyFeatures = [
    { value: 'second_chance_hiring', label: 'Second Chance Hiring', description: 'Willing to hire individuals with criminal history' },
    { value: 'flexible_schedules', label: 'Flexible Work Schedules', description: 'Accommodating treatment appointments and recovery meetings' },
    { value: 'emp_assistance_program', label: 'Employee Assistance Program', description: 'Confidential counseling and support services' },
    { value: 'peer_support_program', label: 'Peer Support Program', description: 'Workplace peer support for employees in recovery' },
    { value: 'substance_abuse_accommodations', label: 'Substance Abuse Accommodations', description: 'Reasonable accommodations for addiction recovery' },
    { value: 'mental_health_support', label: 'Mental Health Support', description: 'Mental health resources and understanding' },
    { value: 'continuing_education', label: 'Continuing Education Support', description: 'Educational opportunities and career development' },
    { value: 'lived_experience_valued', label: 'Lived Experience Valued', description: 'Values recovery experience as a professional asset' },
    { value: 'stigma_free_workplace', label: 'Stigma-Free Workplace', description: 'Commitment to reducing addiction stigma' },
    { value: 'treatment_time_off', label: 'Time Off for Treatment', description: 'Paid or unpaid time for treatment and recovery' },
    { value: 'transportation_assistance', label: 'Transportation Assistance', description: 'Help with transportation to work or treatment' },
    { value: 'skills_training', label: 'Skills Training Programs', description: 'Job skills development and career advancement' }
  ];

  // ✅ UPDATED: Drug testing options matching schema constraints
  const drugTestingOptions = [
    { value: 'none', label: 'No Drug Testing', description: 'Company does not conduct drug testing' },
    { value: 'pre_employment_only', label: 'Pre-Employment Only', description: 'Testing only before hiring, not ongoing' },
    { value: 'random', label: 'Random Testing', description: 'Periodic random drug testing' },
    { value: 'reasonable_suspicion', label: 'Reasonable Suspicion Only', description: 'Testing only when there is reasonable suspicion' },
    { value: 'post_incident', label: 'Post-Incident Only', description: 'Testing only after workplace incidents' }
  ];

  // ✅ UPDATED: Background check options matching schema constraints
  const backgroundCheckOptions = [
    { value: 'none', label: 'No Background Checks', description: 'Company does not conduct background checks' },
    { value: 'case_by_case', label: 'Case-by-Case Basis', description: 'Individual evaluation considering circumstances' },
    { value: 'standard', label: 'Standard Background Check', description: 'Standard process but may consider rehabilitation' },
    { value: 'flexible', label: 'Flexible Background Check Policy', description: 'Flexible policy considering time passed and rehabilitation' }
  ];

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Recovery-Friendly Policies & Features</h3>
      
      {/* Recovery-Friendly Features Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Recovery-Supportive Workplace Features</h4>
        
        <div className="form-group">
          <label className="label">Recovery-Friendly Features</label>
          <div className={styles.checkboxGrid}>
            {recoveryFriendlyFeatures.map(feature => (
              <div key={feature.value} className={`checkbox-item ${styles.featureItem}`}>
                <input
                  type="checkbox"
                  id={`feature-${feature.value}`}
                  checked={formData.recovery_friendly_features?.includes(feature.value)}
                  onChange={(e) => onArrayChange('recovery_friendly_features', feature.value, e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor={`feature-${feature.value}`} className={styles.featureLabel}>
                  <div className={styles.featureName}>{feature.label}</div>
                  <div className={styles.featureDescription}>{feature.description}</div>
                </label>
              </div>
            ))}
          </div>
          <div className={styles.helperText}>
            Select all features that apply to your workplace. These help applicants understand your recovery-supportive environment.
          </div>
        </div>
      </div>

      {/* Accommodation Policies Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Accommodation & Support Policies</h4>
        
        <div className="form-group">
          <label className="label">Accommodation Policies</label>
          <textarea
            className="input"
            name="accommodation_policies"
            value={formData.accommodation_policies}
            onChange={onInputChange}
            placeholder="Describe your policies for accommodating employees in recovery. Examples: flexible schedules for treatment appointments, time off for recovery meetings, modified duties during early recovery, etc."
            disabled={loading}
            rows="4"
          />
          <div className={styles.helperText}>
            Explain how you accommodate employees' recovery needs and treatment requirements
          </div>
        </div>

        <div className="form-group">
          <label className="label">Hiring Practices</label>
          <textarea
            className="input"
            name="hiring_practices"
            value={formData.hiring_practices}
            onChange={onInputChange}
            placeholder="Describe your approach to hiring individuals with criminal histories or in recovery. Examples: fair chance hiring policies, individual assessment process, focus on rehabilitation and current fitness for the job, etc."
            disabled={loading}
            rows="4"
          />
          <div className={styles.helperText}>
            Share your fair chance hiring practices and approach to second chances
          </div>
        </div>
      </div>

      {/* Screening Policies Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Screening Policies</h4>
        
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
                <option key={option.value} value={option.value} title={option.description}>
                  {option.label}
                </option>
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
                <option key={option.value} value={option.value} title={option.description}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className={styles.helperText}>
              Explain your background check approach
            </div>
          </div>
        </div>

        {/* Policy Explanations */}
        <div className={styles.policyExplanations}>
          {formData.drug_testing_policy && (
            <div className={styles.policyNote}>
              <strong>Drug Testing:</strong> {drugTestingOptions.find(opt => opt.value === formData.drug_testing_policy)?.description}
            </div>
          )}
          {formData.background_check_policy && (
            <div className={styles.policyNote}>
              <strong>Background Checks:</strong> {backgroundCheckOptions.find(opt => opt.value === formData.background_check_policy)?.description}
            </div>
          )}
        </div>
      </div>

      {/* Recovery-Friendly Guidance */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>💡 Building a Recovery-Friendly Workplace</h4>
        
        <div className={styles.guidanceContent}>
          <div className={styles.helperText}>
            <strong>What makes a workplace recovery-friendly?</strong>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li><strong>Second Chances:</strong> Focus on current fitness for the job rather than past mistakes</li>
              <li><strong>Flexibility:</strong> Accommodate treatment schedules and recovery meetings</li>
              <li><strong>Support:</strong> Provide resources and understanding for ongoing recovery</li>
              <li><strong>Respect:</strong> Maintain confidentiality and reduce stigma in the workplace</li>
              <li><strong>Growth:</strong> Offer opportunities for skill development and career advancement</li>
            </ul>
          </div>

          <div className={styles.helperText} style={{ marginTop: '15px' }}>
            <strong>Benefits of recovery-friendly hiring:</strong>
            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
              <li>Access to motivated, grateful employees</li>
              <li>Higher retention rates</li>
              <li>Positive community impact</li>
              <li>Diverse perspectives and problem-solving approaches</li>
              <li>Potential tax incentives and positive publicity</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Feature Summary */}
      {formData.recovery_friendly_features?.length > 0 && (
        <div className={styles.subsection}>
          <h4 className={styles.subsectionTitle}>📋 Selected Features Summary</h4>
          
          <div className={styles.selectedFeatures}>
            {formData.recovery_friendly_features.map(featureValue => {
              const feature = recoveryFriendlyFeatures.find(f => f.value === featureValue);
              return feature ? (
                <div key={featureValue} className={styles.selectedFeature}>
                  <span className="badge badge-success">{feature.label}</span>
                </div>
              ) : null;
            })}
          </div>
          
          <div className={styles.helperText}>
            These features will be prominently displayed to help applicants understand your recovery-supportive workplace
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerPoliciesSection;