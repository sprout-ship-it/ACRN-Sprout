// src/components/features/property/search/PropertyRecoverySearchFilters.js - Recovery-Specific Search Filters
import React from 'react';
import PropTypes from 'prop-types';
import { 
  requiredRecoveryPrograms,
  houseRulesOptions
} from '../constants/propertyConstants';

// ✅ Import CSS module
import styles from './PropertyRecoverySearchFilters.module.css';

const PropertyRecoverySearchFilters = ({
  recoveryFilters,
  onRecoveryFilterChange,
  onArrayFilterChange,
  searchType,
  loading
}) => {
  // ✅ Don't render if user selected general rentals only
  if (searchType === 'general_only') {
    return null;
  }

  // ✅ Recovery stage options for filtering
  const recoveryStageOptions = [
    { value: '', label: 'Any Recovery Stage' },
    { value: '0_30_days', label: 'Early Recovery (0-30 days)' },
    { value: '30_90_days', label: 'Getting Established (30-90 days)' },
    { value: '3_6_months', label: 'Building Foundation (3-6 months)' },
    { value: '6_12_months', label: 'Strengthening Recovery (6-12 months)' },
    { value: '1_2_years', label: 'Long-term Recovery (1-2 years)' },
    { value: '2_plus_years', label: 'Sustained Recovery (2+ years)' }
  ];

  // ✅ Sobriety time options
  const sobrietyTimeOptions = [
    { value: '', label: 'Any Sobriety Requirement' },
    { value: '0_days', label: 'No Minimum Required' },
    { value: '30_days', label: '30+ days sober' },
    { value: '60_days', label: '60+ days sober' },
    { value: '90_days', label: '90+ days sober' },
    { value: '6_months', label: '6+ months sober' },
    { value: '1_year', label: '1+ year sober' },
    { value: '2_years', label: '2+ years sober' }
  ];

  // ✅ Gender restriction options
  const genderOptions = [
    { value: '', label: 'Any Gender' },
    { value: 'any', label: 'Any Gender Welcome' },
    { value: 'male_only', label: 'Male Only' },
    { value: 'female_only', label: 'Female Only' },
    { value: 'lgbtq_friendly', label: 'LGBTQ+ Friendly' },
    { value: 'non_binary_friendly', label: 'Non-Binary Friendly' }
  ];

  // ✅ Treatment completion options
  const treatmentCompletionOptions = [
    { value: '', label: 'Any Treatment Background' },
    { value: 'none_required', label: 'No Treatment Required' },
    { value: 'detox_completed', label: 'Detox Completed' },
    { value: 'inpatient_completed', label: 'Inpatient Treatment Completed' },
    { value: 'outpatient_completed', label: 'Outpatient Treatment Completed' },
    { value: 'currently_in_treatment', label: 'Currently in Treatment' },
    { value: 'flexible', label: 'Flexible Requirements' }
  ];

  return (
    <div className={styles.recoveryFiltersContainer}>
      {/* ✅ SECTION 1: Recovery Housing Capacity & Rates */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <span className={styles.sectionIcon}>🏠</span>
            Recovery Housing Details
          </h3>
          <p className="card-subtitle">
            Specific to recovery housing bed capacity and specialized rates
          </p>
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.housingDetailsGrid}>
            <div className="form-group">
              <label className="label">Minimum Available Beds</label>
              <input
                className="input"
                type="number"
                placeholder="e.g., 2"
                value={recoveryFilters.minAvailableBeds}
                onChange={(e) => onRecoveryFilterChange('minAvailableBeds', e.target.value)}
                disabled={loading}
                min="1"
                max="20"
              />
              <div className={styles.inputHint}>
                Minimum number of beds that should be available
              </div>
            </div>

            <div className="form-group">
              <label className="label">Weekly Rate Budget</label>
              <input
                className="input"
                type="number"
                placeholder="e.g., 250"
                value={recoveryFilters.maxWeeklyRate}
                onChange={(e) => onRecoveryFilterChange('maxWeeklyRate', e.target.value)}
                disabled={loading}
                min="0"
                step="25"
              />
              <div className={styles.inputHint}>
                Maximum weekly rate you can afford
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ SECTION 2: Recovery Services & Features */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <span className={styles.sectionIcon}>🍽️</span>
            Recovery Services & Features
          </h3>
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.servicesGrid}>
            <div 
              className={`${styles.serviceItem} ${recoveryFilters.mealsIncluded ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('mealsIncluded', !recoveryFilters.mealsIncluded)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.mealsIncluded}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.serviceContent}>
                <span className={styles.serviceName}>Meals Included</span>
                <span className={styles.serviceDescription}>Some or all meals provided</span>
              </div>
            </div>
            
            <div 
              className={`${styles.serviceItem} ${recoveryFilters.linensProvided ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('linensProvided', !recoveryFilters.linensProvided)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.linensProvided}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.serviceContent}>
                <span className={styles.serviceName}>Linens Provided</span>
                <span className={styles.serviceDescription}>Bedding and towels included</span>
              </div>
            </div>

            <div 
              className={`${styles.serviceItem} ${recoveryFilters.immediateMovein ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('immediateMovein', !recoveryFilters.immediateMovein)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.immediateMovein}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.serviceContent}>
                <span className={styles.serviceName}>Immediate Move-in Available</span>
                <span className={styles.serviceDescription}>Same-day or 24-hour move-in possible</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ SECTION 3: Recovery Program Requirements */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <span className={styles.sectionIcon}>🌱</span>
            Recovery Program Requirements
          </h3>
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.programRequirementsGrid}>
            <div className="form-group">
              <label className="label">Your Recovery Stage</label>
              <select
                className="input"
                value={recoveryFilters.recoveryStage}
                onChange={(e) => onRecoveryFilterChange('recoveryStage', e.target.value)}
                disabled={loading}
              >
                {recoveryStageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className={styles.inputHint}>
                Find housing appropriate for your stage of recovery
              </div>
            </div>
            
            <div className="form-group">
              <label className="label">Sobriety Requirements You Can Meet</label>
              <select
                className="input"
                value={recoveryFilters.sobrietyTime}
                onChange={(e) => onRecoveryFilterChange('sobrietyTime', e.target.value)}
                disabled={loading}
              >
                {sobrietyTimeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className={styles.inputHint}>
                Show properties with sobriety requirements you meet
              </div>
            </div>

            <div className="form-group">
              <label className="label">Treatment Completion Status</label>
              <select
                className="input"
                value={recoveryFilters.treatmentCompletion}
                onChange={(e) => onRecoveryFilterChange('treatmentCompletion', e.target.value)}
                disabled={loading}
              >
                {treatmentCompletionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className={styles.inputHint}>
                Match with properties based on your treatment background
              </div>
            </div>
          </div>

          {/* Required Programs */}
          <div className="form-group">
            <label className="label">Programs You're Willing to Participate In</label>
            <div className={styles.inputHint}>
              Select recovery programs you're open to participating in
            </div>
            <div className={styles.programsGrid}>
              {requiredRecoveryPrograms.map(program => (
                <div
                  key={program.value}
                  className={`${styles.programItem} ${recoveryFilters.acceptablePrograms?.includes(program.value) ? styles.selected : ''}`}
                  onClick={() => onArrayFilterChange('recovery', 'acceptablePrograms', program.value, !recoveryFilters.acceptablePrograms?.includes(program.value))}
                >
                  <input
                    type="checkbox"
                    checked={recoveryFilters.acceptablePrograms?.includes(program.value) || false}
                    onChange={() => {}} // Handled by onClick
                    disabled={loading}
                  />
                  <span className={styles.programText}>{program.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ SECTION 4: Resident Demographics & Restrictions */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <span className={styles.sectionIcon}>👥</span>
            Demographics & Community Preferences
          </h3>
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.demographicsGrid}>
            <div className="form-group">
              <label className="label">Gender Community Preference</label>
              <select
                className="input"
                value={recoveryFilters.genderPreference}
                onChange={(e) => onRecoveryFilterChange('genderPreference', e.target.value)}
                disabled={loading}
              >
                {genderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Age Range Preference</label>
              <input
                className="input"
                type="text"
                placeholder="e.g., '25-45', '18+', 'Young Adults'"
                value={recoveryFilters.agePreference}
                onChange={(e) => onRecoveryFilterChange('agePreference', e.target.value)}
                disabled={loading}
              />
              <div className={styles.inputHint}>
                Describe your preferred age community
              </div>
            </div>
          </div>

          <div className={styles.backgroundGrid}>
            <div 
              className={`${styles.backgroundItem} ${recoveryFilters.acceptsCriminalBackground ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('acceptsCriminalBackground', !recoveryFilters.acceptsCriminalBackground)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.acceptsCriminalBackground}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.backgroundContent}>
                <span className={styles.backgroundName}>Accepts Criminal Background</span>
                <span className={styles.backgroundDescription}>Properties that consider applicants with criminal history</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ SECTION 5: Recovery Support Services */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <span className={styles.sectionIcon}>🤝</span>
            Recovery Support Services
          </h3>
          <p className="card-subtitle">
            Professional support services available on-site or through partnerships
          </p>
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.supportServicesGrid}>
            <div 
              className={`${styles.serviceItem} ${recoveryFilters.caseManagement ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('caseManagement', !recoveryFilters.caseManagement)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.caseManagement}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.serviceContent}>
                <span className={styles.serviceName}>Case Management</span>
                <span className={styles.serviceDescription}>Professional case management and support coordination</span>
              </div>
            </div>
            
            <div 
              className={`${styles.serviceItem} ${recoveryFilters.counselingServices ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('counselingServices', !recoveryFilters.counselingServices)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.counselingServices}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.serviceContent}>
                <span className={styles.serviceName}>Counseling Services</span>
                <span className={styles.serviceDescription}>Individual or group counseling available</span>
              </div>
            </div>

            <div 
              className={`${styles.serviceItem} ${recoveryFilters.jobTraining ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('jobTraining', !recoveryFilters.jobTraining)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.jobTraining}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.serviceContent}>
                <span className={styles.serviceName}>Job Training & Placement</span>
                <span className={styles.serviceDescription}>Employment assistance and job training programs</span>
              </div>
            </div>

            <div 
              className={`${styles.serviceItem} ${recoveryFilters.medicalServices ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('medicalServices', !recoveryFilters.medicalServices)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.medicalServices}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.serviceContent}>
                <span className={styles.serviceName}>Medical Services</span>
                <span className={styles.serviceDescription}>On-site medical care or clinic access</span>
              </div>
            </div>

            <div 
              className={`${styles.serviceItem} ${recoveryFilters.transportationServices ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('transportationServices', !recoveryFilters.transportationServices)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.transportationServices}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.serviceContent}>
                <span className={styles.serviceName}>Transportation Services</span>
                <span className={styles.serviceDescription}>Transportation assistance for appointments and work</span>
              </div>
            </div>

            <div 
              className={`${styles.serviceItem} ${recoveryFilters.lifeSkillsTraining ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('lifeSkillsTraining', !recoveryFilters.lifeSkillsTraining)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.lifeSkillsTraining}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.serviceContent}>
                <span className={styles.serviceName}>Life Skills Training</span>
                <span className={styles.serviceDescription}>Training in daily living and independent living skills</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ SECTION 6: Licensing & Accreditation */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <span className={styles.sectionIcon}>📋</span>
            Licensing & Accreditation Preferences
          </h3>
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.licensingGrid}>
            <div 
              className={`${styles.licensingItem} ${recoveryFilters.requiresLicensing ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('requiresLicensing', !recoveryFilters.requiresLicensing)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.requiresLicensing}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.licensingContent}>
                <span className={styles.licensingName}>State Licensed Properties Only</span>
                <span className={styles.licensingDescription}>Properties with proper state licensing and oversight</span>
              </div>
            </div>

            <div 
              className={`${styles.licensingItem} ${recoveryFilters.requiresAccreditation ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('requiresAccreditation', !recoveryFilters.requiresAccreditation)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.requiresAccreditation}
                onChange={() => {}} // Handled by onClick
                disabled={loading}
              />
              <div className={styles.licensingContent}>
                <span className={styles.licensingName}>Accredited Properties Preferred</span>
                <span className={styles.licensingDescription}>Properties with NARR, CARF, or other professional accreditation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PropertyRecoverySearchFilters.propTypes = {
  recoveryFilters: PropTypes.shape({
    minAvailableBeds: PropTypes.string.isRequired,
    maxWeeklyRate: PropTypes.string.isRequired,
    mealsIncluded: PropTypes.bool.isRequired,
    linensProvided: PropTypes.bool.isRequired,
    immediateMovein: PropTypes.bool.isRequired,
    recoveryStage: PropTypes.string.isRequired,
    sobrietyTime: PropTypes.string.isRequired,
    treatmentCompletion: PropTypes.string.isRequired,
    acceptablePrograms: PropTypes.array.isRequired,
    genderPreference: PropTypes.string.isRequired,
    agePreference: PropTypes.string.isRequired,
    acceptsCriminalBackground: PropTypes.bool.isRequired,
    caseManagement: PropTypes.bool.isRequired,
    counselingServices: PropTypes.bool.isRequired,
    jobTraining: PropTypes.bool.isRequired,
    medicalServices: PropTypes.bool.isRequired,
    transportationServices: PropTypes.bool.isRequired,
    lifeSkillsTraining: PropTypes.bool.isRequired,
    requiresLicensing: PropTypes.bool.isRequired,
    requiresAccreditation: PropTypes.bool.isRequired
  }).isRequired,
  onRecoveryFilterChange: PropTypes.func.isRequired,
  onArrayFilterChange: PropTypes.func.isRequired,
  searchType: PropTypes.oneOf(['all_housing', 'general_only', 'recovery_only']).isRequired,
  loading: PropTypes.bool.isRequired
};

export default PropertyRecoverySearchFilters;