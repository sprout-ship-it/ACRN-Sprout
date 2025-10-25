// src/components/features/employer/components/EmployerFilterPanel.js - TABBED VERSION
import React, { useState } from 'react';
import { 
  industryOptions,
  businessTypeOptions,
  companySizeOptions,
  remoteWorkOptions,
  drugTestingPolicyOptions,
  backgroundCheckPolicyOptions,
  recoveryFeatureOptions,
  jobTypeOptions,
  benefitsOptions,
  stateOptions,
  formatFeature,
  formatBusinessType,
  formatCompanySize,
  formatRemoteWork,
  formatDrugTestingPolicy,
  formatBackgroundCheckPolicy,
  getFilterSummary,
  getActiveFilterCount
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
  const [activeTab, setActiveTab] = useState('basic');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle input changes for simple filters
  const handleFilterChange = (field, value) => {
    onFilterChange(field, value);
  };

  // Handle checkbox changes for array filters
  const handleArrayChange = (field, value, isChecked) => {
    onArrayFilterChange(field, value, isChecked);
  };

  // Toggle panel collapse (mobile)
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const activeCount = getActiveFilterCount(filters);

  // Tab configuration
  const tabs = [
    { id: 'basic', label: 'Basic Search', icon: '🔍' },
    { id: 'work', label: 'Work & Benefits', icon: '💼' },
    { id: 'policies', label: 'Policies & Culture', icon: '🤝' }
  ];

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
        
        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          
          {/* TAB 1: BASIC SEARCH */}
          {activeTab === 'basic' && (
            <div className={styles.tabPanel}>
              <div className={styles.filterSection}>
                <h4 className={styles.sectionTitle}>Location & Industry</h4>
                
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
              </div>

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
                    <label className="label">Company Size</label>
                    <select
                      className="input"
                      value={filters.companySize}
                      onChange={(e) => handleFilterChange('companySize', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Any Size</option>
                      {companySizeOptions.map(size => (
                        <option key={size.value} value={size.value}>{size.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hiring Status Toggle */}
                <div className={styles.toggleSection}>
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="actively-hiring"
                      checked={filters.isActivelyHiring}
                      onChange={(e) => handleFilterChange('isActivelyHiring', e.target.checked)}
                      disabled={loading}
                    />
                    <label htmlFor="actively-hiring">
                      🟢 Only show actively hiring employers
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORK & BENEFITS */}
          {activeTab === 'work' && (
            <div className={styles.tabPanel}>
              <div className={styles.filterSection}>
                <h4 className={styles.sectionTitle}>Work Arrangements</h4>
                
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

              <div className={styles.filterSection}>
                <h4 className={styles.sectionTitle}>Job Types</h4>
                <p className={styles.sectionDescription}>
                  Select the types of positions you're interested in
                </p>
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

              <div className={styles.filterSection}>
                <h4 className={styles.sectionTitle}>Benefits Offered</h4>
                <p className={styles.sectionDescription}>
                  Select benefits that are important to you
                </p>
                <div className={styles.checkboxGrid}>
                  {benefitsOptions.map(benefit => (
                    <div key={benefit} className={`checkbox-item ${styles.checkboxItemCompact}`}>
                      <input
                        type="checkbox"
                        id={`benefit-${benefit}`}
                        checked={filters.benefits.includes(benefit)}
                        onChange={(e) => handleArrayChange('benefits', benefit, e.target.checked)}
                        disabled={loading}
                      />
                      <label htmlFor={`benefit-${benefit}`}>
                        {benefit}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POLICIES & CULTURE */}
          {activeTab === 'policies' && (
            <div className={styles.tabPanel}>
              <div className={styles.filterSection}>
                <h4 className={styles.sectionTitle}>Employment Policies</h4>
                
                <div className={styles.filterRow}>
                  <div className="form-group">
                    <label className="label">Drug Testing Policy</label>
                    <select
                      className="input"
                      value={filters.drugTestingPolicy}
                      onChange={(e) => handleFilterChange('drugTestingPolicy', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Any Policy</option>
                      {drugTestingPolicyOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="label">Background Check Policy</label>
                    <select
                      className="input"
                      value={filters.backgroundCheckPolicy}
                      onChange={(e) => handleFilterChange('backgroundCheckPolicy', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Any Policy</option>
                      {backgroundCheckPolicyOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

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
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
        {activeCount > 0 && (
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