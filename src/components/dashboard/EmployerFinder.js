// src/components/dashboard/EmployerFinder.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const EmployerFinder = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    city: '',
    state: '',
    businessType: '',
    recoveryFeatures: [],
    jobTypes: [],
    remoteWork: '',
    isActivelyHiring: true
  });

  // Filter options
  const industryOptions = [
    'Construction', 'Healthcare', 'Retail', 'Food Service', 'Manufacturing',
    'Transportation', 'Technology', 'Education', 'Nonprofit', 'Professional Services',
    'Hospitality', 'Agriculture', 'Finance', 'Real Estate', 'Arts & Entertainment',
    'Government', 'Utilities', 'Other'
  ];

  const businessTypeOptions = [
    { value: 'small_business', label: 'Small Business' },
    { value: 'medium_business', label: 'Medium Business' },
    { value: 'large_corporation', label: 'Large Corporation' },
    { value: 'nonprofit', label: 'Nonprofit' },
    { value: 'startup', label: 'Startup' },
    { value: 'social_enterprise', label: 'Social Enterprise' },
    { value: 'government', label: 'Government' },
    { value: 'cooperative', label: 'Cooperative' }
  ];

  const recoveryFeatureOptions = [
    'second_chance_hiring',
    'flexible_schedules',
    'emp_assistance_program',
    'peer_support_program',
    'substance_abuse_accommodations',
    'mental_health_support',
    'continuing_education',
    'lived_experience_valued',
    'stigma_free_workplace',
    'treatment_time_off',
    'transportation_assistance',
    'skills_training'
  ];

  const jobTypeOptions = [
    'full_time',
    'part_time',
    'contract',
    'temporary',
    'internship',
    'apprenticeship'
  ];

  const remoteWorkOptions = [
    { value: 'on_site', label: 'On-Site Only' },
    { value: 'fully_remote', label: 'Fully Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'flexible', label: 'Flexible Options' }
  ];

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // Load employers on component mount
  useEffect(() => {
    findEmployers();
  }, []);

  // Reload when filters change
  useEffect(() => {
    findEmployers();
  }, [filters]);

  /**
   * Search for available employers
   */
  const findEmployers = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Finding employers with filters:', filters);
      
      // Build filter object for database query
      const dbFilters = {
        isActivelyHiring: filters.isActivelyHiring
      };
      
      if (filters.industry) {
        dbFilters.industry = filters.industry;
      }
      
      if (filters.city) {
        dbFilters.city = filters.city;
      }

      if (filters.state) {
        dbFilters.state = filters.state;
      }

      if (filters.businessType) {
        dbFilters.businessType = filters.businessType;
      }

      if (filters.recoveryFeatures.length > 0) {
        dbFilters.recoveryFeatures = filters.recoveryFeatures;
      }

      if (filters.jobTypes.length > 0) {
        dbFilters.jobTypes = filters.jobTypes;
      }

      if (filters.remoteWork) {
        dbFilters.remoteWork = filters.remoteWork;
      }

      // Get available employers from database
      const result = await db.employerProfiles.getAvailable(dbFilters);
      
      if (!result.success && result.error) {
        throw new Error(result.error.message || 'Failed to load employers');
      }
      
      let availableEmployers = result.data || [];
      console.log(`📊 Found ${availableEmployers.length} available employers`);

      // Exclude current user if they're also an employer
      if (user) {
        availableEmployers = availableEmployers.filter(employer => 
          employer.user_id !== user.id
        );
      }

      console.log(`✅ Filtered to ${availableEmployers.length} employers`);
      setEmployers(availableEmployers);
      
    } catch (err) {
      console.error('💥 Error finding employers:', err);
      setError(err.message || 'Failed to find employers');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handle array filter changes (checkboxes)
   */
  const handleArrayFilterChange = (field, value, isChecked) => {
    setFilters(prev => ({
      ...prev,
      [field]: isChecked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  /**
   * Show employer details in modal
   */
  const handleShowDetails = (employer) => {
    setSelectedEmployer(employer);
    setShowDetails(true);
  };

  /**
   * Send connection request to employer
   */
  const handleRequestConnection = async (employer) => {
    try {
      console.log('💼 Sending job inquiry to:', employer.company_name);
      
      const requestData = {
        requester_id: user.id,
        target_id: employer.user_id,
        request_type: 'employment',
        message: `Hi! I'm interested in potential job opportunities at ${employer.company_name}. Your commitment to recovery-friendly employment and ${employer.recovery_friendly_features?.slice(0, 2).join(' and ')} align well with what I'm looking for in my career journey.`,
        status: 'pending'
      };
      
      const result = await db.matchRequests.create(requestData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to send job inquiry');
      }
      
      console.log('✅ Job inquiry sent successfully:', result.data);
      alert(`Job inquiry sent to ${employer.company_name}!`);
      
    } catch (err) {
      console.error('💥 Error sending job inquiry:', err);
      alert('Failed to send job inquiry. Please try again.');
    }
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({
      industry: '',
      city: '',
      state: '',
      businessType: '',
      recoveryFeatures: [],
      jobTypes: [],
      remoteWork: '',
      isActivelyHiring: true
    });
  };

  /**
   * Format recovery features for display
   */
  const formatFeature = (feature) => {
    return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <div className="content">
        <div className="text-center mb-5">
          <h1 className="welcome-title">Find Recovery-Friendly Employers</h1>
          <p className="welcome-text">
            Discover employers committed to supporting individuals in recovery with second-chance hiring, 
            flexible policies, and inclusive workplace cultures.
          </p>
        </div>

        {/* Search Filters */}
        <div className="card mb-5">
          <h3 className="card-title">Search Filters</h3>
          
          <div className="grid-auto mb-4">
            <div className="form-group">
              <label className="label">Industry</label>
              <select
                className="input"
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
              >
                <option value="">All Industries</option>
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">City</label>
              <input
                className="input"
                type="text"
                placeholder="Enter city name"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">State</label>
              <select
                className="input"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
              >
                <option value="">All States</option>
                {stateOptions.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">Business Type</label>
              <select
                className="input"
                value={filters.businessType}
                onChange={(e) => handleFilterChange('businessType', e.target.value)}
              >
                <option value="">All Business Types</option>
                {businessTypeOptions.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Remote Work</label>
              <select
                className="input"
                value={filters.remoteWork}
                onChange={(e) => handleFilterChange('remoteWork', e.target.value)}
              >
                <option value="">Any Work Arrangement</option>
                {remoteWorkOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <button
                className="btn btn-primary"
                onClick={findEmployers}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Recovery Features Filter */}
          <div className="form-group mb-4">
            <label className="label">Recovery-Friendly Features (select any that interest you)</label>
            <div className="grid-auto">
              {recoveryFeatureOptions.map(feature => (
                <div key={feature} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`feature-${feature}`}
                    checked={filters.recoveryFeatures.includes(feature)}
                    onChange={(e) => handleArrayFilterChange('recoveryFeatures', feature, e.target.checked)}
                  />
                  <label htmlFor={`feature-${feature}`}>
                    {formatFeature(feature)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Job Types Filter */}
          <div className="form-group mb-4">
            <label className="label">Job Types</label>
            <div className="grid-auto">
              {jobTypeOptions.map(jobType => (
                <div key={jobType} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`job-${jobType}`}
                    checked={filters.jobTypes.includes(jobType)}
                    onChange={(e) => handleArrayFilterChange('jobTypes', jobType, e.target.checked)}
                  />
                  <label htmlFor={`job-${jobType}`}>
                    {formatFeature(jobType)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Currently Hiring Filter */}
          <div className="form-group mb-4">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="actively-hiring"
                checked={filters.isActivelyHiring}
                onChange={(e) => handleFilterChange('isActivelyHiring', e.target.checked)}
              />
              <label htmlFor="actively-hiring">
                Only show employers currently hiring
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.industry || filters.city || filters.state || filters.businessType || 
            filters.recoveryFeatures.length > 0 || filters.jobTypes.length > 0 || filters.remoteWork) && (
            <div className="text-center">
              <button
                className="btn btn-outline"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="card mb-5">
            <div className="alert alert-error">
              <h4>Error Loading Employers</h4>
              <p>{error}</p>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setError(null);
                  findEmployers();
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="empty-state">
            <LoadingSpinner />
            <p>Finding recovery-friendly employers...</p>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && employers.length === 0 && (
          <div className="card text-center">
            <h3>No employers found</h3>
            <p>Try adjusting your filters or check back later for new employer profiles.</p>
          </div>
        )}

        {/* Employers Grid */}
        {!loading && !error && employers.length > 0 && (
          <div className="grid-auto mb-5">
            {employers.map((employer) => (
              <div key={employer.id} className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">{employer.company_name}</div>
                    <div className="card-subtitle">
                      {employer.industry} • {employer.city}, {employer.state}
                    </div>
                  </div>
                  <div>
                    {employer.is_actively_hiring && (
                      <span className="badge badge-success mb-1">Hiring</span>
                    )}
                    <span className="badge badge-info">
                      {formatFeature(employer.business_type)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="grid-2 text-gray-600 mb-3">
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="text-gray-800 ml-1">
                        {employer.company_size || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Remote:</span>
                      <span className="text-gray-800 ml-1">
                        {employer.remote_work_options ? formatFeature(employer.remote_work_options) : 'Not specified'}
                      </span>
                    </div>
                  </div>

                  {/* Current Openings */}
                  {employer.current_openings?.length > 0 && (
                    <div className="mb-3">
                      <div className="label mb-2">Current Openings</div>
                      <div className="mb-2">
                        {employer.current_openings.slice(0, 3).map((opening, i) => (
                          <span key={i} className="badge badge-success mr-1 mb-1">
                            {opening}
                          </span>
                        ))}
                        {employer.current_openings.length > 3 && (
                          <span className="text-sm text-gray-600">
                            +{employer.current_openings.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recovery Features */}
                  {employer.recovery_friendly_features?.length > 0 && (
                    <div className="mb-3">
                      <div className="label mb-2">Recovery-Friendly Features</div>
                      <div className="mb-2">
                        {employer.recovery_friendly_features.slice(0, 3).map((feature, i) => (
                          <span key={i} className="badge badge-info mr-1 mb-1">
                            {formatFeature(feature)}
                          </span>
                        ))}
                        {employer.recovery_friendly_features.length > 3 && (
                          <span className="text-sm text-gray-600">
                            +{employer.recovery_friendly_features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Company Description Preview */}
                  {employer.description && (
                    <div className="mb-3">
                      <p className="card-text">
                        {employer.description.length > 150 
                          ? `${employer.description.substring(0, 150)}...` 
                          : employer.description
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid-2">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleShowDetails(employer)}
                  >
                    View Details
                  </button>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleRequestConnection(employer)}
                    disabled={!employer.is_actively_hiring}
                    style={{ 
                      background: employer.is_actively_hiring ? '' : 'var(--gray-400)',
                      opacity: employer.is_actively_hiring ? 1 : 0.6
                    }}
                  >
                    {employer.is_actively_hiring ? 'Send Job Inquiry' : 'Not Hiring'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        {onBack && (
          <div className="text-center">
            <button
              className="btn btn-outline"
              onClick={onBack}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Employer Details Modal */}
      {showDetails && selectedEmployer && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedEmployer.company_name}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>

            {/* Company Info */}
            <div className="mb-4">
              <h4 className="card-title">Company Information</h4>
              <div className="grid-2 text-sm mb-3">
                <div><strong>Industry:</strong> {selectedEmployer.industry}</div>
                <div><strong>Type:</strong> {formatFeature(selectedEmployer.business_type)}</div>
                <div><strong>Size:</strong> {selectedEmployer.company_size || 'Not specified'}</div>
                <div><strong>Founded:</strong> {selectedEmployer.founded_year || 'Not specified'}</div>
              </div>
              <div className="grid-2 text-sm mb-3">
                <div><strong>Location:</strong> {selectedEmployer.city}, {selectedEmployer.state}</div>
                <div><strong>Remote Work:</strong> {selectedEmployer.remote_work_options ? formatFeature(selectedEmployer.remote_work_options) : 'Not specified'}</div>
              </div>
            </div>

            {/* Description */}
            {selectedEmployer.description && (
              <div className="mb-4">
                <h4 className="card-title">About the Company</h4>
                <p className="card-text">{selectedEmployer.description}</p>
              </div>
            )}

            {/* Current Openings */}
            {selectedEmployer.current_openings?.length > 0 && (
              <div className="mb-4">
                <h4 className="card-title">Current Job Openings</h4>
                <div className="mb-2">
                  {selectedEmployer.current_openings.map((opening, i) => (
                    <span key={i} className="badge badge-success mr-1 mb-1">{opening}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Recovery Features */}
            {selectedEmployer.recovery_friendly_features?.length > 0 && (
              <div className="mb-4">
                <h4 className="card-title">Recovery-Friendly Features</h4>
                <div className="mb-2">
                  {selectedEmployer.recovery_friendly_features.map((feature, i) => (
                    <span key={i} className="badge badge-info mr-1 mb-1">
                      {formatFeature(feature)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {selectedEmployer.benefits_offered?.length > 0 && (
              <div className="mb-4">
                <h4 className="card-title">Benefits Offered</h4>
                <div className="mb-2">
                  {selectedEmployer.benefits_offered.map((benefit, i) => (
                    <span key={i} className="badge badge-warning mr-1 mb-1">
                      {formatFeature(benefit)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Application Process */}
            {selectedEmployer.application_process && (
              <div className="mb-4">
                <h4 className="card-title">How to Apply</h4>
                <p className="card-text">{selectedEmployer.application_process}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="mb-4">
              <h4 className="card-title">Contact Information</h4>
              <div className="text-sm">
                {selectedEmployer.phone && <div><strong>Phone:</strong> {selectedEmployer.phone}</div>}
                {selectedEmployer.contact_email && <div><strong>Email:</strong> {selectedEmployer.contact_email}</div>}
                {selectedEmployer.website && (
                  <div>
                    <strong>Website:</strong>{' '}
                    <a href={selectedEmployer.website} target="_blank" rel="noopener noreferrer" 
                       style={{ color: 'var(--primary-purple)' }}>
                      {selectedEmployer.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="grid-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={() => {
                  handleRequestConnection(selectedEmployer);
                  setShowDetails(false);
                }}
                disabled={!selectedEmployer.is_actively_hiring}
              >
                {selectedEmployer.is_actively_hiring ? 'Send Job Inquiry' : 'Not Currently Hiring'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployerFinder;