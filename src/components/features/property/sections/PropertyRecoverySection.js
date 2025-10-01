// src/components/features/property/sections/PropertyRecoverySection.js - REORGANIZED WITH ALL RECOVERY FIELDS
import React from 'react';
import PropTypes from 'prop-types';
import { 
  requiredRecoveryPrograms,
  houseRulesOptions
} from '../constants/propertyConstants';

// ✅ Import CSS module
import styles from './PropertyRecoverySection.module.css';

const PropertyRecoverySection = ({
  formData,
  errors,
  loading,
  onInputChange,
  onArrayChange
}) => {
  return (
    <>
      <h3 className="card-title mb-4">Recovery Requirements & Specialized Features</h3>
      
      {/* ✅ GROUP 1: Recovery-Specific Housing Details */}
      <div className={styles.recoveryHousingSection}>
        <h4 className={styles.sectionHeading}>Recovery Housing Capacity & Rates</h4>
        
        <div className={styles.gridThree}>
          <div className={styles.formGroup}>
            <label className="label">Total Bed Capacity *</label>
            <input
              className={`input ${errors.total_beds ? styles.inputError : ''}`}
              type="number"
              name="total_beds"
              value={formData.total_beds}
              onChange={onInputChange}
              min="1"
              max="50"
              placeholder="12"
              disabled={loading}
              required
            />
            {errors.total_beds && (
              <div className={styles.errorMessage}>{errors.total_beds}</div>
            )}
            <div className={styles.helpText}>
              Total beds across all rooms
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className="label">Currently Available Beds</label>
            <input
              className={`input ${errors.available_beds ? styles.inputError : ''}`}
              type="number"
              name="available_beds"
              value={formData.available_beds}
              onChange={onInputChange}
              min="0"
              max={formData.total_beds || 50}
              placeholder="8"
              disabled={loading}
            />
            {errors.available_beds && (
              <div className={styles.errorMessage}>{errors.available_beds}</div>
            )}
            <div className={styles.helpText}>
              Number of beds currently vacant
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className="label">Weekly Rate (if applicable)</label>
            <input
              className="input"
              type="number"
              name="weekly_rate"
              value={formData.weekly_rate || ''}
              onChange={onInputChange}
              placeholder="200"
              min="0"
              max="1000"
              disabled={loading}
            />
            <div className={styles.helpText}>
              For short-term or weekly rental options
            </div>
          </div>
        </div>
        
        {/* Bed Capacity Calculator */}
        <div className={styles.bedCalculator}>
          <strong>Occupancy Status:</strong> 
          {formData.total_beds && formData.available_beds ? 
            ` ${formData.total_beds - formData.available_beds}/${formData.total_beds} beds occupied (${Math.round(((formData.total_beds - formData.available_beds) / formData.total_beds) * 100)}% full)` : 
            ' Enter bed counts above to see occupancy'
          }
        </div>
      </div>

      {/* ✅ GROUP 2: Recovery-Specific Services & Features */}
      <div className={styles.recoveryServicesSection}>
        <h4 className={styles.sectionHeading}>Recovery-Specific Services & Features</h4>
        
        <div className={styles.gridTwo}>
          <div className={styles.serviceGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="meals_included"
                checked={formData.meals_included || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Meals Included</span>
            </label>
            <div className={styles.helpText}>
              Some or all meals provided for residents
            </div>
            
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="linens_provided"
                checked={formData.linens_provided || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Linens Provided</span>
            </label>
            <div className={styles.helpText}>
              Bedding and towels provided
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className="label">Move-in Timeline</label>
            <select
              className="input"
              name="move_in_timeline"
              value={formData.move_in_timeline || ''}
              onChange={onInputChange}
              disabled={loading}
            >
              <option value="">Standard process</option>
              <option value="immediate">Same-day move-in available</option>
              <option value="24_hours">24-hour notice required</option>
              <option value="48_hours">48-hour notice required</option>
              <option value="1_week">1 week notice required</option>
              <option value="2_weeks">2+ weeks notice required</option>
            </select>
            <div className={styles.helpText}>
              How much advance notice do you typically need for move-ins?
            </div>
          </div>
        </div>
      </div>

      {/* ✅ GROUP 3: Recovery Program Requirements */}
      <div className={styles.recoveryProgramsSection}>
        <h4 className={styles.sectionHeading}>Recovery Program Requirements</h4>
        
        <div className={styles.formGroup}>
          <label className="label">
            Required Recovery Programs
          </label>
          <div className={styles.helpTextLarge}>
            Select all recovery programs that residents must participate in or maintain.
          </div>
          <div className={styles.checkboxColumns}>
            {requiredRecoveryPrograms.map(program => (
              <label key={program.value} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.required_programs?.includes(program.value) || false}
                  onChange={(e) => onArrayChange('required_programs', program.value, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.checkboxText}>{program.label}</span>
              </label>
            ))}
          </div>
          {errors.required_programs && (
            <div className={styles.errorMessage}>{errors.required_programs}</div>
          )}
        </div>

        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label className="label">Minimum Sobriety Time Required</label>
            <select
              className="input"
              name="min_sobriety_time"
              value={formData.min_sobriety_time || ''}
              onChange={onInputChange}
              disabled={loading}
            >
              <option value="">No minimum required</option>
              <option value="0_days">Accept residents at any stage</option>
              <option value="30_days">30 days sober</option>
              <option value="60_days">60 days sober</option>
              <option value="90_days">90 days sober</option>
              <option value="6_months">6 months sober</option>
              <option value="1_year">1 year sober</option>
              <option value="2_years">2+ years sober</option>
            </select>
            <div className={styles.helpText}>
              Minimum time of continuous sobriety required
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className="label">Treatment Program Completion</label>
            <select
              className="input"
              name="treatment_completion_required"
              value={formData.treatment_completion_required || ''}
              onChange={onInputChange}
              disabled={loading}
            >
              <option value="">No specific requirement</option>
              <option value="none_required">No treatment completion required</option>
              <option value="detox_completed">Detox completion required</option>
              <option value="inpatient_completed">Inpatient treatment completion required</option>
              <option value="outpatient_completed">Outpatient treatment completion required</option>
              <option value="currently_in_treatment">Must be currently in treatment</option>
              <option value="flexible">Flexible based on individual circumstances</option>
            </select>
            <div className={styles.helpText}>
              Treatment program requirements for admission
            </div>
          </div>
        </div>
      </div>

      {/* ✅ GROUP 4: House Rules & Requirements */}
      <div className={styles.houseRulesSection}>
        <h4 className={styles.sectionHeading}>House Rules & Requirements</h4>
        
        <div className={styles.formGroup}>
          <label className="label">
            House Rules & Requirements
          </label>
          <div className={styles.helpTextLarge}>
            Select all rules and requirements that apply to your property.
          </div>
          <div className={styles.checkboxColumns}>
            {houseRulesOptions.map(rule => (
              <label key={rule} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.house_rules?.includes(rule) || false}
                  onChange={(e) => onArrayChange('house_rules', rule, e.target.checked)}
                  disabled={loading}
                />
                <span className={styles.checkboxText}>{rule}</span>
              </label>
            ))}
          </div>
          {errors.house_rules && (
            <div className={styles.errorMessage}>{errors.house_rules}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className="label">Additional House Rules</label>
          <textarea
            className={`input ${styles.textareaLarge}`}
            name="additional_house_rules"
            value={formData.additional_house_rules || ''}
            onChange={onInputChange}
            placeholder="Describe any additional house rules, expectations, or requirements not covered above..."
            disabled={loading}
            maxLength="500"
          />
          <div className={styles.characterCounter}>
            {(formData.additional_house_rules?.length || 0)}/500 characters
          </div>
        </div>
      </div>

      {/* ✅ GROUP 5: Resident Restrictions & Demographics */}
      <div className={styles.demographicsSection}>
        <h4 className={styles.sectionHeading}>Resident Restrictions & Demographics</h4>
        
        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label className="label">Gender Restrictions</label>
            <select
              className="input"
              name="gender_restrictions"
              value={formData.gender_restrictions || 'any'}
              onChange={onInputChange}
              disabled={loading}
            >
              <option value="any">Any Gender Welcome</option>
              <option value="male_only">Male Only</option>
              <option value="female_only">Female Only</option>
              <option value="lgbtq_friendly">LGBTQ+ Friendly</option>
              <option value="non_binary_friendly">Non-Binary Friendly</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className="label">Age Restrictions</label>
            <input
              className="input"
              type="text"
              name="age_restrictions"
              value={formData.age_restrictions || ''}
              onChange={onInputChange}
              placeholder="e.g., '18+', '25-55', 'Adults Only'"
              disabled={loading}
            />
            <div className={styles.helpText}>
              Age range or requirements for residents
            </div>
          </div>
        </div>

        <div className={styles.restrictionsGrid}>
          <div className={styles.restrictionGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="criminal_background_ok"
                checked={formData.criminal_background_ok || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Accept Criminal Background</span>
            </label>
            <div className={styles.helpText}>
              Will consider applicants with criminal history
            </div>
          </div>
          
          <div className={styles.restrictionGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="sex_offender_restrictions"
                checked={formData.sex_offender_restrictions || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Sex Offender Restrictions Apply</span>
            </label>
            <div className={styles.helpText}>
              Cannot accept registered sex offenders
            </div>
          </div>
        </div>
      </div>

      {/* ✅ GROUP 6: Recovery Support Services */}
      <div className={styles.supportServicesSection}>
        <h4 className={styles.sectionHeading}>Recovery Support Services Available</h4>
        
        <div className={styles.servicesGrid}>
          <div className={styles.serviceGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="case_management"
                checked={formData.case_management || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Case Management Services</span>
            </label>
            <div className={styles.helpText}>
              Professional case management available on-site
            </div>
            
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="counseling_services"
                checked={formData.counseling_services || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Counseling Services</span>
            </label>
            <div className={styles.helpText}>
              Individual or group counseling available
            </div>
            
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="job_training"
                checked={formData.job_training || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Job Training/Placement</span>
            </label>
            <div className={styles.helpText}>
              Employment assistance and job training programs
            </div>
          </div>
          
          <div className={styles.serviceGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="medical_services"
                checked={formData.medical_services || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Medical Services</span>
            </label>
            <div className={styles.helpText}>
              On-site medical care or clinic access
            </div>
            
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="transportation_services"
                checked={formData.transportation_services || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Transportation Services</span>
            </label>
            <div className={styles.helpText}>
              Transportation assistance for appointments/work
            </div>
            
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="life_skills_training"
                checked={formData.life_skills_training || false}
                onChange={onInputChange}
                disabled={loading}
              />
              <span className={styles.checkboxText}>Life Skills Training</span>
            </label>
            <div className={styles.helpText}>
              Training in daily living and independent living skills
            </div>
          </div>
        </div>
      </div>

      {/* ✅ GROUP 7: Licensing & Certification */}
      <div className={styles.licensingSection}>
        <h4 className={styles.sectionHeading}>Licensing & Certification</h4>
        
        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label className="label">License Number</label>
            <input
              className="input"
              type="text"
              name="license_number"
              value={formData.license_number || ''}
              onChange={onInputChange}
              placeholder="State licensing number (if required)"
              disabled={loading}
            />
            <div className={styles.helpText}>
              Required in some states for recovery housing
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className="label">Accreditation</label>
            <input
              className="input"
              type="text"
              name="accreditation"
              value={formData.accreditation || ''}
              onChange={onInputChange}
              placeholder="e.g., NARR, CARF, State certification"
              disabled={loading}
            />
            <div className={styles.helpText}>
              Professional certifications or accreditations
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

PropertyRecoverySection.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onArrayChange: PropTypes.func.isRequired
};

export default PropertyRecoverySection;