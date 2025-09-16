// src/components/features/employer/components/EmployerFilterPanel.js
import React, { useState } from 'react';
import { 
  industryOptions,
  businessTypeOptions, 
  recoveryFeatureOptions,
  jobTypeOptions,
  remoteWorkOptions,
  stateOptions,
  formatFeature,
  formatBusinessType,
  formatRemoteWork,
  getFilterSummary,
  hasActiveFilters
} from '../utils/employerUtils';

const EmployerFilterPanel = ({
  filters,
  loading = false,
  onFilterChange,
  onArrayFilterChange,
  onClearFilters,
  onFindNearby,
  onSearch
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle input changes for simple filters
  const handleFilterChange = (field, value) => {
    onFilterChange(field, value);
  };

  // Handle checkbox changes for array filters
  const handleArrayChange = (field, value, isChecked) => {
    onArrayFilterChange(field, value, isChecked);
  };

  // Toggle more filters visibility
  const toggleMoreFilters = () => {
    setShowMoreFilters(!showMoreFilters);
  };

  // Toggle panel collapse (mobile)
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Get count of active filters for display
  const activeFilterCount = () => {
    let count = 0;
    if (filters.industry) count++;
    if (filters.location) count++;
    if (filters.state) count++;
    if (filters.businessType) count++;
    if (filters.remoteWork) count++;
    if (filters.recoveryFeatures?.length > 0) count++;
    if (filters.jobTypes?.length > 0) count++;
    if (filters.hasOpenings) count++;
    if (!filters.isActivelyHiring) count++; // Only count if different from default
    return count;
  };

  const activeCount = activeFilterCount();

  return (
    <div className="filter-panel card">
      {/* Panel Header */}
      <div className="filter-panel-header" onClick={toggleCollapse}>
        <h3 className="card-title filter-title">
          🔍 Search Filters
          {activeCount > 0 && (
            <span className="active-filter-count">({activeCount})</span>
          )}
        </h3>
        <button className="collapse-toggle" type="button">
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`filter-content ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Basic Filters - Always Visible */}
        <div className="basic-filters">
          <div className="filter-row">
            <div className="form-group">
              <label className="label">Industry</label>
              <select
                className="input"
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                disabled={loading}
              >
                <option value="">All Industries</option>
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">Location (City, State)</label>
              <div className="location-input-group">
                <input
                  className="input location-input"
                  type="text"
                  placeholder="e.g. Austin, TX or Texas"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  disabled={loading}
                />
                <button
                  className="btn btn-outline location-nearby-btn"
                  onClick={onFindNearby}
                  disabled={loading}
                  title="Find employers near your location"
                >
                  📍
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="label">State</label>
              <select
                className="input"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                disabled={loading}
              >
                <option value="">All States</option>
                {stateOptions.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Toggle Filters */}
          <div className="quick-toggles">
            <div className="toggle-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="actively-hiring"
                  checked={filters.isActivelyHiring}
                  onChange={(e) => handleFilterChange('isActivelyHiring', e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="actively-hiring">
                  🟢 Only actively hiring employers
                </label>
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="has-openings"
                  checked={filters.hasOpenings}
                  onChange={(e) => handleFilterChange('hasOpenings', e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="has-openings">
                  💼 Must have specific job openings
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* More Filters Toggle */}
        <div className="more-filters-toggle">
          <button
            className="btn btn-outline toggle-btn"
            onClick={toggleMoreFilters}
            type="button"
          >
            {showMoreFilters ? '▲ Fewer Filters' : '▼ More Filters'}
            {!showMoreFilters && activeCount > 3 && (
              <span className="hidden-filter-hint">
                +{activeCount - 3} more active
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters - Collapsible */}
        <div className={`more-filters ${showMoreFilters ? 'expanded' : ''}`}>
          {/* Business Details */}
          <div className="filter-section">
            <h4 className="section-title">Company Details</h4>
            <div className="filter-row">
              <div className="form-group">
                <label className="label">Business Type</label>
                <select
                  className="input"
                  value={filters.businessType}
                  onChange={(e) => handleFilterChange('businessType', e.target.value)}
                  disabled={loading}
                >
                  <option value="">All Business Types</option>
                  {businessTypeOptions.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Remote Work Options</label>
                <select
                  className="input"
                  value={filters.remoteWork}
                  onChange={(e) => handleFilterChange('remoteWork', e.target.value)}
                  disabled={loading}
                >
                  <option value="">Any Work Arrangement</option>
                  {remoteWorkOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Recovery Features */}
          <div className="filter-section">
            <h4 className="section-title">Recovery-Friendly Features</h4>
            <p className="section-description">
              Select features that are important to you in a workplace
            </p>
            <div className="checkbox-grid">
              {recoveryFeatureOptions.map(feature => (
                <div key={feature} className="checkbox-item compact">
                  <input
                    type="checkbox"
                    id={`feature-${feature}`}
                    checked={filters.recoveryFeatures.includes(feature)}
                    onChange={(e) => handleArrayChange('recoveryFeatures', feature, e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor={`feature-${feature}`}>
                    {formatFeature(feature)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Job Types */}
          <div className="filter-section">
            <h4 className="section-title">Job Types</h4>
            <div className="checkbox-grid">
              {jobTypeOptions.map(jobType => (
                <div key={jobType} className="checkbox-item compact">
                  <input
                    type="checkbox"
                    id={`job-${jobType}`}
                    checked={filters.jobTypes.includes(jobType)}
                    onChange={(e) => handleArrayChange('jobTypes', jobType, e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor={`job-${jobType}`}>
                    {formatFeature(jobType)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="filter-actions">
          <div className="action-buttons">
            <button
              className="btn btn-primary search-btn"
              onClick={onSearch}
              disabled={loading}
            >
              {loading ? (
                <>⏳ Searching...</>
              ) : (
                <>🔍 Search Employers</>
              )}
            </button>

            <button
              className="btn btn-outline"
              onClick={onClearFilters}
              disabled={loading || activeCount === 0}
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters(filters) && (
          <div className="active-filters-summary">
            <div className="summary-label">Active Filters:</div>
            <div className="summary-text">{getFilterSummary(filters)}</div>
          </div>
        )}
      </div>

      <style jsx>{`
        .filter-panel {
          background: white;
          border: 2px solid var(--border-beige);
          border-radius: var(--radius-xl);
          margin-bottom: var(--spacing-xl);
          overflow: hidden;
        }

        .filter-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-beige);
          background: var(--bg-light-purple);
          cursor: pointer;
        }

        .filter-title {
          margin: 0;
          color: var(--primary-purple);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .active-filter-count {
          background: var(--primary-purple);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .collapse-toggle {
          background: none;
          border: none;
          font-size: 1.2rem;
          color: var(--primary-purple);
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .collapse-toggle:hover {
          background: rgba(160, 32, 240, 0.1);
        }

        .filter-content {
          padding: 1.5rem;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .filter-content.collapsed {
          max-height: 0;
          padding: 0 1.5rem;
          opacity: 0;
        }

        .basic-filters {
          margin-bottom: 1.5rem;
        }

        .filter-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .location-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .location-input {
          flex: 1;
        }

        .location-nearby-btn {
          padding: 12px;
          min-width: 48px;
          flex-shrink: 0;
        }

        .quick-toggles {
          background: var(--bg-light-cream);
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-top: 1rem;
        }

        .toggle-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .more-filters-toggle {
          text-align: center;
          margin: 1.5rem 0;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-beige);
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 auto;
        }

        .hidden-filter-hint {
          background: var(--warning-bg);
          color: var(--warning-text);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.7rem;
          margin-left: 0.5rem;
        }

        .more-filters {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.4s ease;
        }

        .more-filters.expanded {
          max-height: 2000px;
          opacity: 1;
        }

        .filter-section {
          margin-bottom: 2rem;
          padding: 1rem;
          background: var(--gray-50);
          border-radius: var(--radius-md);
          border-left: 4px solid var(--secondary-teal);
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-description {
          font-size: 0.9rem;
          color: var(--gray-600);
          margin-bottom: 1rem;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
        }

        .checkbox-item.compact {
          padding: 0.5rem;
          background: white;
        }

        .filter-actions {
          border-top: 1px solid var(--border-beige);
          padding-top: 1.5rem;
          margin-top: 2rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .search-btn {
          min-width: 180px;
        }

        .active-filters-summary {
          margin-top: 1.5rem;
          padding: 1rem;
          background: var(--info-bg);
          border: 1px solid var(--info-border);
          border-radius: var(--radius-md);
        }

        .summary-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--info-text);
          margin-bottom: 0.5rem;
        }

        .summary-text {
          font-size: 0.8rem;
          color: var(--info-text);
          line-height: 1.4;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .filter-panel-header {
            display: block;
          }

          .collapse-toggle {
            display: none;
          }

          .filter-content.collapsed {
            max-height: none;
            padding: 1.5rem;
            opacity: 1;
          }

          .filter-row {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .toggle-group {
            grid-template-columns: 1fr;
          }

          .location-input-group {
            flex-direction: column;
          }

          .location-nearby-btn {
            min-width: auto;
          }

          .checkbox-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }

          .search-btn {
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .filter-content {
            padding: 1rem;
          }

          .filter-panel-header {
            padding: 1rem;
          }

          .filter-section {
            padding: 0.75rem;
          }

          .btn {
            padding: 10px 16px;
            font-size: 0.9rem;
          }
        }

        /* Hide collapsed content on desktop but show on mobile */
        @media (min-width: 769px) {
          .filter-panel-header {
            cursor: default;
          }
          
          .filter-content.collapsed {
            max-height: none;
            padding: 1.5rem;
            opacity: 1;
          }
          
          .collapse-toggle {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployerFilterPanel;