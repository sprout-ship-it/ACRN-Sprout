// src/components/features/property/search/PropertyRecoverySearchFilters.js - Reorganized (2 Sections)
import React from 'react';
import PropTypes from 'prop-types';
import { requiredRecoveryPrograms } from '../constants/propertyConstants';

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

  // ✅ Recovery stage options
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
    { value: '1_year', label: '1+ year sober' }
  ];

  // ✅ Gender options
  const genderOptions = [
    { value: '', label: 'Any Gender' },
    { value: 'any', label: 'Any Gender Welcome' },
    { value: 'male_only', label: 'Male Only' },
    { value: 'female_only', label: 'Female Only' },
    { value: 'lgbtq_friendly', label: 'LGBTQ+ Friendly' }
  ];

  // ✅ Treatment completion options
  const treatmentCompletionOptions = [
    { value: '', label: 'Any Treatment Background' },
    { value: 'none_required', label: 'No Treatment Required' },
    { value: 'detox_completed', label: 'Detox Completed' },
    { value: 'inpatient_completed', label: 'Inpatient Treatment Completed' },
    { value: 'currently_in_treatment', label: 'Currently in Treatment' },
    { value: 'flexible', label: 'Flexible Requirements' }
  ];

  return (
    <div className={styles.recoveryFiltersForm}>
      
      {/* ✅ SECTION 1: Housing Basics & Requirements */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionHeader}>🏠 Housing Basics & Requirements</h4>
        <p className={styles.sectionDescription}>
          Basic housing details, entry requirements, and community preferences
        </p>

        {/* Housing Details Grid */}
        <div className={styles.housingDetailsGrid}>
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
          </div>

          <div className="form-group">
            <label className="label">Maximum Move-in Cost</label>
            <input
              className="input"
              type="number"
              placeholder="e.g., 500"
              value={recoveryFilters.moveInCost}
              onChange={(e) => onRecoveryFilterChange('moveInCost', e.target.value)}
              disabled={loading}
              min="0"
              step="50"
            />
          </div>

          <div className="form-group">
            <label className="label">Guest Policy Preference</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., 'Visitors allowed', 'No guests'"
              value={recoveryFilters.guestPolicy}
              onChange={(e) => onRecoveryFilterChange('guestPolicy', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Quick Checkboxes */}
        <div className={styles.quickCheckboxesGrid}>
          <div 
            className={`checkbox-item ${recoveryFilters.hasOpenBed ? 'selected' : ''}`}
            onClick={() => onRecoveryFilterChange('hasOpenBed', !recoveryFilters.hasOpenBed)}
          >
            <input
              type="checkbox"
              checked={recoveryFilters.hasOpenBed}
              onChange={() => {}}
              disabled={loading}
            />
            <span className="checkbox-text">Has Open Bed Available</span>
          </div>

          <div 
            className={`checkbox-item ${recoveryFilters.mealsIncluded ? 'selected' : ''}`}
            onClick={() => onRecoveryFilterChange('mealsIncluded', !recoveryFilters.mealsIncluded)}
          >
            <input
              type="checkbox"
              checked={recoveryFilters.mealsIncluded}
              onChange={() => {}}
              disabled={loading}
            />
            <span className="checkbox-text">Meals Included</span>
          </div>

          <div 
            className={`checkbox-item ${recoveryFilters.linensProvided ? 'selected' : ''}`}
            onClick={() => onRecoveryFilterChange('linensProvided', !recoveryFilters.linensProvided)}
          >
            <input
              type="checkbox"
              checked={recoveryFilters.linensProvided}
              onChange={() => {}}
              disabled={loading}
            />
            <span className="checkbox-text">Linens Provided</span>
          </div>

          <div 
            className={`checkbox-item ${recoveryFilters.immediateMovein ? 'selected' : ''}`}
            onClick={() => onRecoveryFilterChange('immediateMovein', !recoveryFilters.immediateMovein)}
          >
            <input
              type="checkbox"
              checked={recoveryFilters.immediateMovein}
              onChange={() => {}}
              disabled={loading}
            />
            <span className="checkbox-text">Immediate Move-in Available</span>
          </div>

          <div 
            className={`checkbox-item ${recoveryFilters.acceptsCriminalBackground ? 'selected' : ''}`}
            onClick={() => onRecoveryFilterChange('acceptsCriminalBackground', !recoveryFilters.acceptsCriminalBackground)}
          >
            <input
              type="checkbox"
              checked={recoveryFilters.acceptsCriminalBackground}
              onChange={() => {}}
              disabled={loading}
            />
            <span className="checkbox-text">Accepts Criminal Background</span>
          </div>
        </div>

        {/* Entry Requirements */}
        <div className={styles.entryRequirementsGrid}>
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
          </div>

          <div className="form-group">
            <label className="label">Sobriety Time You Can Meet</label>
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
          </div>

          <div className="form-group">
            <label className="label">Treatment Status</label>
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
          </div>
        </div>

        {/* Demographics */}
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
          </div>
        </div>
      </div>

      {/* ✅ SECTION 2: Programs & Support Services */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionHeader}>🤝 Programs & Support Services</h4>
        <p className={styles.sectionDescription}>
          Recovery programs, support services, and professional credentials
        </p>

        {/* Recovery Programs */}
        <div className="form-group">
          <label className="label">Programs You're Willing to Participate In</label>
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
                  onChange={() => {}}
                  disabled={loading}
                />
                <span className={styles.programText}>{program.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Support Services */}
        <div className="form-group">
          <label className="label">Desired Support Services</label>
          <div className={styles.supportServicesGrid}>
            <div 
              className={`${styles.serviceItem} ${recoveryFilters.caseManagement ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('caseManagement', !recoveryFilters.caseManagement)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.caseManagement}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.serviceText}>Case Management</span>
            </div>

            <div 
              className={`${styles.serviceItem} ${recoveryFilters.counselingServices ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('counselingServices', !recoveryFilters.counselingServices)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.counselingServices}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.serviceText}>Counseling Services</span>
            </div>

            <div 
              className={`${styles.serviceItem} ${recoveryFilters.jobTraining ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('jobTraining', !recoveryFilters.jobTraining)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.jobTraining}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.serviceText}>Job Training</span>
            </div>

            <div 
              className={`${styles.serviceItem} ${recoveryFilters.medicalServices ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('medicalServices', !recoveryFilters.medicalServices)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.medicalServices}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.serviceText}>Medical Services</span>
            </div>

            <div 
              className={`${styles.serviceItem} ${recoveryFilters.transportationServices ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('transportationServices', !recoveryFilters.transportationServices)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.transportationServices}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.serviceText}>Transportation</span>
            </div>

            <div 
              className={`${styles.serviceItem} ${recoveryFilters.lifeSkillsTraining ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('lifeSkillsTraining', !recoveryFilters.lifeSkillsTraining)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.lifeSkillsTraining}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.serviceText}>Life Skills Training</span>
            </div>
          </div>
        </div>

        {/* Licensing & Accreditation */}
        <div className="form-group">
          <label className="label">Professional Credentials</label>
          <div className={styles.credentialsGrid}>
            <div 
              className={`${styles.credentialItem} ${recoveryFilters.requiresLicensing ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('requiresLicensing', !recoveryFilters.requiresLicensing)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.requiresLicensing}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.credentialText}>State Licensed Only</span>
            </div>

            <div 
              className={`${styles.credentialItem} ${recoveryFilters.requiresAccreditation ? styles.selected : ''}`}
              onClick={() => onRecoveryFilterChange('requiresAccreditation', !recoveryFilters.requiresAccreditation)}
            >
              <input
                type="checkbox"
                checked={recoveryFilters.requiresAccreditation}
                onChange={() => {}}
                disabled={loading}
              />
              <span className={styles.credentialText}>Accredited Preferred</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PropertyRecoverySearchFilters.propTypes = {
  recoveryFilters: PropTypes.shape({
    hasOpenBed: PropTypes.bool.isRequired,
    maxWeeklyRate: PropTypes.string.isRequired,
    guestPolicy: PropTypes.string.isRequired,
    moveInCost: PropTypes.string.isRequired,
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