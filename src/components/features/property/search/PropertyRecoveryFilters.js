// src/components/features/property/search/PropertyRecoveryFilters.js
import React from 'react';
import PropTypes from 'prop-types';
import { requiredRecoveryPrograms } from '../constants/propertyConstants';

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
    <div className="card mb-4 recovery-filters-card">
      <div className="card-header">
        <h3 className="card-title">
          <span className="title-icon">🌱</span>
          Recovery Support Features
        </h3>
        <p className="card-subtitle">
          Find housing with specialized recovery support services and programs
        </p>
      </div>
      
      {/* ✅ Core Recovery Services */}
      <div className="filter-section">
        <h4 className="section-title">Support Services Available</h4>
        <div className="services-grid">
          <div 
            className={`service-item ${recoveryFilters.caseManagement ? 'selected' : ''}`}
            onClick={() => onRecoveryFilterChange('caseManagement', !recoveryFilters.caseManagement)}
          >
            <input
              type="checkbox"
              checked={recoveryFilters.caseManagement}
              onChange={() => {}} // Handled by onClick
              disabled={loading}
            />
            <div className="service-content">
              <span className="service-name">Case Management Available</span>
              <span className="service-description">Professional case management and support coordination</span>
            </div>
          </div>
          
          <div 
            className={`service-item ${recoveryFilters.counselingServices ? 'selected' : ''}`}
            onClick={() => onRecoveryFilterChange('counselingServices', !recoveryFilters.counselingServices)}
          >
            <input
              type="checkbox"
              checked={recoveryFilters.counselingServices}
              onChange={() => {}} // Handled by onClick
              disabled={loading}
            />
            <div className="service-content">
              <span className="service-name">Counseling Services</span>
              <span className="service-description">Individual or group counseling available on-site</span>
            </div>
          </div>

          <div 
            className={`service-item ${recoveryFilters.supportGroups ? 'selected' : ''}`}
            onClick={() => onRecoveryFilterChange('supportGroups', !recoveryFilters.supportGroups)}
          >
            <input
              type="checkbox"
              checked={recoveryFilters.supportGroups}
              onChange={() => {}} // Handled by onClick
              disabled={loading}
            />
            <div className="service-content">
              <span className="service-name">Support Groups</span>
              <span className="service-description">Peer support groups and recovery meetings</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Recovery Program Requirements */}
      <div className="filter-section">
        <h4 className="section-title">Program Requirements</h4>
        <div className="form-group">
          <label className="label">Required Recovery Programs</label>
          <div className="input-hint mb-3">
            Select specific programs that properties should require or support
          </div>
          <div className="programs-grid">
            {requiredRecoveryPrograms.map(program => (
              <div
                key={program.value}
                className={`program-item ${recoveryFilters.requiredPrograms?.includes(program.value) ? 'selected' : ''}`}
                onClick={() => onArrayFilterChange('recovery', 'requiredPrograms', program.value, !recoveryFilters.requiredPrograms?.includes(program.value))}
              >
                <input
                  type="checkbox"
                  checked={recoveryFilters.requiredPrograms?.includes(program.value) || false}
                  onChange={() => {}} // Handled by onClick
                  disabled={loading}
                />
                <span className="program-text">{program.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Recovery Stage & Sobriety Filters */}
      <div className="filter-section">
        <h4 className="section-title">Recovery Stage & Requirements</h4>
        <div className="stage-filters-grid">
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
            <div className="input-hint">
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
            <div className="input-hint">
              Filter by minimum sobriety time requirements
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Recovery Housing Type Toggle */}
      <div className="filter-section">
        <div className="housing-type-toggle">
          <div 
            className={`toggle-item ${recoveryFilters.recoveryHousingOnly ? 'selected' : ''}`}
            onClick={() => onRecoveryFilterChange('recoveryHousingOnly', !recoveryFilters.recoveryHousingOnly)}
          >
            <input
              type="checkbox"
              checked={recoveryFilters.recoveryHousingOnly}
              onChange={() => {}} // Handled by onClick
              disabled={loading}
            />
            <div className="toggle-content">
              <span className="toggle-title">Recovery Housing Only</span>
              <span className="toggle-description">
                Show only properties specifically designed for people in recovery
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Component Styles */}
      <style jsx>{`
        .recovery-filters-card {
          border-left: 4px solid var(--secondary-teal);
          background: linear-gradient(135deg, rgba(32, 178, 170, 0.02) 0%, rgba(255, 255, 255, 1) 100%);
        }

        .title-icon {
          margin-right: 0.5rem;
          font-size: 1.2rem;
        }

        .filter-section {
          padding: var(--spacing-lg) 0;
        }

        .filter-section:not(:last-child) {
          border-bottom: 1px solid var(--border-beige);
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: var(--spacing-md);
          display: flex;
          align-items: center;
        }

        .services-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-sm);
        }

        .service-item {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border: 2px solid var(--border-beige);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-normal);
          background: white;
        }

        .service-item:hover {
          border-color: var(--secondary-teal);
          background: rgba(32, 178, 170, 0.02);
        }

        .service-item.selected {
          border-color: var(--secondary-teal);
          background: rgba(32, 178, 170, 0.05);
        }

        .service-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .service-name {
          font-weight: 600;
          color: var(--gray-800);
          font-size: 0.9rem;
        }

        .service-description {
          font-size: 0.8rem;
          color: var(--gray-600);
          line-height: 1.3;
        }

        .programs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: var(--spacing-sm);
        }

        .program-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          border: 2px solid var(--border-beige);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-normal);
          background: white;
        }

        .program-item:hover {
          border-color: var(--secondary-teal);
          background: rgba(32, 178, 170, 0.02);
        }

        .program-item.selected {
          border-color: var(--secondary-teal);
          background: rgba(32, 178, 170, 0.05);
        }

        .program-text {
          font-size: 0.85rem;
          color: var(--gray-700);
          line-height: 1.3;
        }

        .stage-filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);
        }

        .housing-type-toggle {
          background: rgba(32, 178, 170, 0.05);
          border: 1px solid rgba(32, 178, 170, 0.2);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
        }

        .toggle-item {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          cursor: pointer;
        }

        .toggle-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .toggle-title {
          font-weight: 600;
          color: var(--gray-800);
          font-size: 0.95rem;
        }

        .toggle-description {
          font-size: 0.8rem;
          color: var(--gray-600);
          line-height: 1.3;
        }

        .input-hint {
          font-size: 0.8rem;
          color: var(--gray-500);
          margin-top: 0.25rem;
          line-height: 1.3;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .stage-filters-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }

          .programs-grid {
            grid-template-columns: 1fr;
          }

          .service-item,
          .program-item {
            padding: var(--spacing-sm);
          }

          .service-name,
          .toggle-title {
            font-size: 0.85rem;
          }

          .service-description,
          .toggle-description,
          .program-text {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .services-grid {
            gap: var(--spacing-xs);
          }

          .programs-grid {
            gap: var(--spacing-xs);
          }
        }
      `}</style>
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