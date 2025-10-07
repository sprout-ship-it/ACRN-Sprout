// src/components/features/employer/sections/EmployerDetailsSection.js - UPDATED FOR NEW SCHEMA
import React from 'react';
import styles from './EmployerSections.module.css';

const EmployerDetailsSection = ({
  formData,
  errors,
  loading,
  onInputChange
}) => {
  // ✅ UPDATED: Company size options matching schema constraints
  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ];

  // Get current year for founded year validation
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Company Details</h3>
      
      {/* Company Description Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Company Overview</h4>
        
        <div className="form-group">
          <label className="label">
            Company Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`input ${errors.description ? 'border-red-500' : ''}`}
            name="description"
            value={formData.description}
            onChange={onInputChange}
            placeholder="Describe your company, mission, values, and what makes it recovery-friendly. This is the main description that applicants will see when discovering your company."
            disabled={loading}
            rows="5"
            required
          />
          {errors.description && (
            <div className="text-red-500 text-sm mt-1">{errors.description}</div>
          )}
          <div className={styles.helperText}>
            This is the primary description that will help applicants understand your company's mission, values, and recovery-friendly approach. Be comprehensive but engaging.
          </div>
        </div>

        <div className="grid-2">
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
            <div className={styles.helperText}>
              Helps applicants understand the scale of your organization
            </div>
          </div>
          
          <div className="form-group">
            <label className="label">Founded Year</label>
            <input
              className={`input ${errors.founded_year ? 'border-red-500' : ''}`}
              type="number"
              name="founded_year"
              value={formData.founded_year}
              onChange={onInputChange}
              placeholder="2020"
              min="1800"
              max={currentYear}
              disabled={loading}
            />
            {errors.founded_year && (
              <div className="text-red-500 text-sm mt-1">{errors.founded_year}</div>
            )}
            <div className={styles.helperText}>
              When was your company established?
            </div>
          </div>
        </div>
      </div>

      {/* Company Culture & Values Subsection */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>Culture & Values</h4>
        
        <div className="form-group">
          <label className="label">Company Culture</label>
          <textarea
            className="input"
            name="company_culture"
            value={formData.company_culture}
            onChange={onInputChange}
            placeholder="Describe your workplace culture, values, and environment. What is it like to work at your company? What values guide your team?"
            disabled={loading}
            rows="4"
          />
          <div className={styles.helperText}>
            Help potential employees understand your workplace environment and what to expect
          </div>
        </div>

        <div className="form-group">
          <label className="label">Diversity & Recovery Commitment</label>
          <textarea
            className="input"
            name="diversity_commitment"
            value={formData.diversity_commitment}
            onChange={onInputChange}
            placeholder="Describe your commitment to diversity, inclusion, and supporting individuals in recovery. What specific steps does your company take to create an inclusive, recovery-friendly workplace?"
            disabled={loading}
            rows="4"
          />
          <div className={styles.helperText}>
            Share your specific commitment to creating an inclusive workplace that supports recovery and second chances
          </div>
        </div>
      </div>

      {/* Guidelines & Tips */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>📝 Writing Tips</h4>
        
        <div className={styles.helperText}>
          <strong>Make your company stand out:</strong>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li><strong>Company Description:</strong> Focus on your mission, what makes you unique, and why you're recovery-friendly</li>
            <li><strong>Company Culture:</strong> Describe the day-to-day experience and values that guide your team</li>
            <li><strong>Diversity Commitment:</strong> Be specific about policies, programs, or practices that support inclusion and recovery</li>
            <li><strong>Be Authentic:</strong> Genuine descriptions resonate better than generic corporate language</li>
            <li><strong>Think from Applicant's Perspective:</strong> What would someone in recovery want to know about your workplace?</li>
          </ul>
        </div>
      </div>

      {/* Character Count Helpers */}
      <div className={styles.subsection}>
        <h4 className={styles.subsectionTitle}>📊 Content Guidelines</h4>
        
        <div className="grid-2">
          <div className={styles.contentMetric}>
            <div className="label">Company Description</div>
            <div className={`text-sm ${formData.description?.length > 100 ? 'text-green-600' : 'text-gray-500'}`}>
              {formData.description?.length || 0} characters
              {formData.description?.length > 100 ? ' ✓ Good length' : ' (aim for 100+ characters)'}
            </div>
          </div>
          
          <div className={styles.contentMetric}>
            <div className="label">Culture Description</div>
            <div className={`text-sm ${formData.company_culture?.length > 50 ? 'text-green-600' : 'text-gray-500'}`}>
              {formData.company_culture?.length || 0} characters
              {formData.company_culture?.length > 50 ? ' ✓ Good detail' : ' (optional but recommended)'}
            </div>
          </div>
        </div>
        
        <div className={styles.helperText}>
          <strong>Quality over quantity:</strong> Detailed descriptions help applicants understand if your company is a good fit for their recovery journey and career goals.
        </div>
      </div>
    </div>
  );
};

export default EmployerDetailsSection;