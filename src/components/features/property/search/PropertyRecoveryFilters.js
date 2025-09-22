// src/components/features/property/search/PropertyRecoveryFilters.js - UPDATED WITH CSS MODULE
import React from 'react';
import PropTypes from 'prop-types';
import { requiredRecoveryPrograms } from '../constants/propertyConstants';

// ✅ UPDATED: Import CSS module
import styles from './PropertyRecoveryFilters.module.css';

const PropertyRecoveryFilters = ({
  recoveryFilters,
  onRecoveryFilterChange,
  onArrayFilterChange,
  searchMode,
  loading
}) => {
  // ✅ Don't render if not in recovery mode
  if (searchMode !== 'recovery') {
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

  return (
    <div className={`card mb-4 ${styles.recoveryFiltersCard}`}>
      <div className="card-header">
        <h3 className="card-title">
          <span className={styles.titleIcon}>🌱</span>
          Recovery Support Features
        </h3>
        <p className="card-subtitle">
          Find housing with specialized recovery support services and programs
        </p>
      </div>
      
      {/* ✅ UPDATED: Core Recovery Services */}
      <div className={styles.filterSection}>
        <h4 className={styles.sectionTitle}>Support Services Available</h4>
        <div className={styles.servicesGrid}>
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
              <span className={styles.serviceName}>Case Management Available</span>
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
              <span className={styles.serviceDescription}>Individual or group counseling available on-site</span>
            </div>
          </div>

          <div 
            className={`${styles.serviceItem} ${recoveryFilters.supportGroups ? styles.selected : ''}`}
            onClick={() => onRecoveryFilterChange('supportGroups', !recoveryFilters.supportGroups)}
          >
            <input
              type="checkbox"
              checked={recoveryFilters.supportGroups}
              onChange={() => {}} // Handled by onClick
              disabled={loading}
            />
            <div className={styles.serviceContent}>
              <span className={styles.serviceName}>Support Groups</span>
              <span className={styles.serviceDescription}>Peer support groups and recovery meetings</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Recovery Program Requirements */}
      <div className={styles.filterSection}>
        <h4 className={styles.sectionTitle}>Program Requirements</h4>
        <div className="form-group">
          <label className="label">Required Recovery Programs</label>
          <div className={styles.inputHint}>
            Select specific programs that properties should require or support
          </div>
          <div className={styles.programsGrid}>
            {requiredRecoveryPrograms.map(program => (
              <div
                key={program.value}
                className={`${styles.programItem} ${recoveryFilters.requiredPrograms?.includes(program.value) ? styles.selected : ''}`}
                onClick={() => onArrayFilterChange('recovery', 'requiredPrograms', program.value, !recoveryFilters.requiredPrograms?.includes(program.value))}
              >
                <input
                  type="checkbox"
                  checked={recoveryFilters.requiredPrograms?.includes(program.value) || false}
                  onChange={() => {}} // Handled by onClick
                  disabled={loading}
                />
                <span className={styles.programText}>{program.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Recovery Stage & Sobriety Filters */}
      <div className={styles.filterSection}>
        <h4 className={styles.sectionTitle}>Recovery Stage & Requirements</h4>
        <div className={styles.stageFiltersGrid}>
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
            <label className="label">Sobriety Requirements</label>
            <select
              className="input"
              value={recoveryFilters.soberness}
              onChange={(e) => onRecoveryFilterChange('soberness', e.target.value)}
              disabled={loading}
            >
              {sobrietyTimeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className={styles.inputHint}>
              Filter by minimum sobriety time requirements
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Recovery Housing Type Toggle */}
      <div className={styles.filterSection}>
        <div className={styles.housingTypeToggle}>
          <div 
            className={styles.toggleItem}
            onClick={() => onRecoveryFilterChange('recoveryHousingOnly', !recoveryFilters.recoveryHousingOnly)}
          >
            <input
              type="checkbox"
              checked={recoveryFilters.recoveryHousingOnly}
              onChange={() => {}} // Handled by onClick
              disabled={loading}
            />
            <div className={styles.toggleContent}>
              <span className={styles.toggleTitle}>Recovery Housing Only</span>
              <span className={styles.toggleDescription}>
                Show only properties specifically designed for people in recovery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PropertyRecoveryFilters.propTypes = {
  recoveryFilters: PropTypes.shape({
    recoveryHousingOnly: PropTypes.bool.isRequired,
    soberness: PropTypes.string.isRequired,
    caseManagement: PropTypes.bool.isRequired,
    counselingServices: PropTypes.bool.isRequired,
    supportGroups: PropTypes.bool.isRequired,
    requiredPrograms: PropTypes.array.isRequired,
    recoveryStage: PropTypes.string.isRequired
  }).isRequired,
  onRecoveryFilterChange: PropTypes.func.isRequired,
  onArrayFilterChange: PropTypes.func.isRequired,
  searchMode: PropTypes.oneOf(['basic', 'recovery']).isRequired,
  loading: PropTypes.bool.isRequired
};

export default PropertyRecoveryFilters;