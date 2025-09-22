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
import styles from './EmployerFilterPanel.module.css';

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
    <div className={`filter-panel card ${styles.filterPanel}`}>
      {/* Panel Header */}
      <div className={styles.filterPanelHeader} onClick={toggleCollapse}>
        <h3 className={`card-title ${styles.filterTitle}`}>
          🔍 Search Filters
          {activeCount > 0 && (
            <span className={styles.activeFilterCount}>({activeCount})</span>
          )}
        </h3>
        <button className={styles.collapseToggle} type="button">
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${styles.filterContent} ${isCollapsed ? styles.collapsed : ''}`}>
        {/* Basic Filters - Always Visible */}
        <div className={styles.basicFilters}>
          <div className={styles.filterRow}>
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
              <div className={styles.locationInputGroup}>
                <input
                  className={`input ${styles.locationInput}`}
                  type="text"
                  placeholder="e.g. Austin, TX or Texas"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  disabled={loading}
                />
                <button
                  className={`btn btn-outline ${styles.locationNearbyBtn}`}
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
          <div className={styles.quickToggles}>
            <div className={styles.toggleGroup}>
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
        <div className={styles.moreFiltersToggle}>
          <button
            className={`btn btn-outline ${styles.toggleBtn}`}
            onClick={toggleMoreFilters}
            type="button"
          >
            {showMoreFilters ? '▲ Fewer Filters' : '▼ More Filters'}
            {!showMoreFilters && activeCount > 3 && (
              <span className={styles.hiddenFilterHint}>
                +{activeCount - 3} more active
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters - Collapsible */}
        <div className={`${styles.moreFilters} ${showMoreFilters ? styles.expanded : ''}`}>
          {/* Business Details */}
          <div className={styles.filterSection}>
            <h4 className={styles.sectionTitle}>Company Details</h4>
            <div className={styles.filterRow}>
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
          <div className={styles.filterSection}>
            <h4 className={styles.sectionTitle}>Recovery-Friendly Features</h4>
            <p className={styles.sectionDescription}>
              Select features that are important to you in a workplace
            </p>
            <div className={styles.checkboxGrid}>
              {recoveryFeatureOptions.map(feature => (
                <div key={feature} className={`checkbox-item ${styles.checkboxItemCompact}`}>
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
          <div className={styles.filterSection}>
            <h4 className={styles.sectionTitle}>Job Types</h4>
            <div className={styles.checkboxGrid}>
              {jobTypeOptions.map(jobType => (
                <div key={jobType} className={`checkbox-item ${styles.checkboxItemCompact}`}>
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
        <div className={styles.filterActions}>
          <div className={styles.actionButtons}>
            <button
              className={`btn btn-primary ${styles.searchBtn}`}
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
          <div className={styles.activeFiltersSummary}>
            <div className={styles.summaryLabel}>Active Filters:</div>
            <div className={styles.summaryText}>{getFilterSummary(filters)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerFilterPanel;