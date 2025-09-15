// src/components/dashboard/EmployerFinder.js - FIXED FOR SIMPLIFIED EMPLOYMENT CONNECTIONS
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import '../../../styles/global.css';

const EmployerFinder = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [jobInquiries, setJobInquiries] = useState(new Set()); // Track sent inquiries
  const [filters, setFilters] = useState({
    industry: '',
    location: '', // Combined city/state search
    state: '',
    businessType: '',
    recoveryFeatures: [],
    jobTypes: [],
    remoteWork: '',
    isActivelyHiring: true,
    hasOpenings: false
  });

  // Filter options
  const industryOptions = [
    'Construction', 'Healthcare', 'Retail', 'Food Service', 'Manufacturing',
    'Transportation', 'Technology', 'Education', 'Nonprofit', 'Professional Services',
    'Hospitality', 'Agriculture', 'Finance', 'Real Estate', 'Arts & Entertainment',
    'Government', 'Utilities', 'Energy', 'Media & Communications', 'Other'
  ];

  const businessTypeOptions = [
    { value: 'small_business', label: 'Small Business (1-50 employees)' },
    { value: 'medium_business', label: 'Medium Business (51-500 employees)' },
    { value: 'large_corporation', label: 'Large Corporation (500+ employees)' },
    { value: 'nonprofit', label: 'Nonprofit Organization' },
    { value: 'startup', label: 'Startup' },
    { value: 'social_enterprise', label: 'Social Enterprise' },
    { value: 'government', label: 'Government Agency' },
    { value: 'cooperative', label: 'Cooperative/Employee-Owned' }
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
    'skills_training',
    'mentorship_programs',
    'career_advancement',
    'background_check_flexibility'
  ];

  const jobTypeOptions = [
    'full_time',
    'part_time',
    'contract',
    'temporary',
    'internship',
    'apprenticeship',
    'seasonal',
    'remote'
  ];

  const remoteWorkOptions = [
    { value: 'on_site', label: 'On-Site Only' },
    { value: 'fully_remote', label: 'Fully Remote' },
    { value: 'hybrid', label: 'Hybrid (Remote + On-Site)' },
    { value: 'flexible', label: 'Flexible Options Available' }
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
    loadEmployers();
    loadJobInquiries();
  }, []);

  // Reload when filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEmployers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  /**
   * ✅ FIXED: Load existing employment inquiries to prevent duplicates
   */
  const loadJobInquiries = async () => {
    if (!user?.id) return;

    try {
      console.log('📊 Loading existing employment inquiries...');
      const result = await db.matchRequests.getByUserId(user.id);
      
      if (result.success !== false && result.data) {
        const sentInquiries = new Set(
          result.data
            .filter(req => 
              req.requester_id === user.id && 
              req.request_type === 'employment' &&
              ['pending', 'matched'].includes(req.status) // Include both pending and active employment connections
            )
            .map(req => req.target_id)
        );
        
        setJobInquiries(sentInquiries);
        console.log('📊 Loaded existing employment inquiries:', sentInquiries.size);
      }
    } catch (err) {
      console.error('💥 Error loading job inquiries:', err);
    }
  };

  /**
   * ✅ IMPROVED: Enhanced employer search with better filtering
   */
  const loadEmployers = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Loading employers with filters:', filters);
      
      // Build filter object for database query
      const dbFilters = {
        isActivelyHiring: filters.isActivelyHiring
      };
      
      if (filters.industry) {
        dbFilters.industry = filters.industry;
      }
      
      if (filters.location.trim()) {
        // Handle both city and state in location field
        const locationParts = filters.location.split(',').map(part => part.trim());
        if (locationParts.length === 2) {
          dbFilters.city = locationParts[0];
          dbFilters.state = locationParts[1].toUpperCase();
        } else {
          // Single location term - could be city or state
          const singleLocation = filters.location.trim();
          if (singleLocation.length === 2) {
            dbFilters.state = singleLocation.toUpperCase();
          } else {
            dbFilters.city = singleLocation;
          }
        }
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
      
      if (result.error && !result.data) {
        throw new Error(result.error.message || 'Failed to load employers');
      }
      
      let availableEmployers = result.data || [];
      console.log(`📊 Found ${availableEmployers.length} employers from database`);

      // ✅ FIXED: Apply additional client-side filters
      if (filters.hasOpenings) {
        availableEmployers = availableEmployers.filter(employer => 
          employer.current_openings && 
          Array.isArray(employer.current_openings) && 
          employer.current_openings.length > 0
        );
      }

      // Exclude current user if they're also an employer
      if (user) {
        availableEmployers = availableEmployers.filter(employer => 
          employer.user_id !== user.id
        );
      }

      // ✅ IMPROVED: Better sorting - actively hiring first, then by recent updates
      availableEmployers.sort((a, b) => {
        // First priority: actively hiring
        if (a.is_actively_hiring && !b.is_actively_hiring) return -1;
        if (!a.is_actively_hiring && b.is_actively_hiring) return 1;
        
        // Second priority: has current openings
        const aHasOpenings = a.current_openings?.length > 0;
        const bHasOpenings = b.current_openings?.length > 0;
        if (aHasOpenings && !bHasOpenings) return -1;
        if (!aHasOpenings && bHasOpenings) return 1;
        
        // Third priority: most recently created/updated
        const aDate = new Date(a.updated_at || a.created_at || 0);
        const bDate = new Date(b.updated_at || b.created_at || 0);
        return bDate - aDate;
      });

      console.log(`✅ Filtered and sorted ${availableEmployers.length} employers`);
      setEmployers(availableEmployers);
      
    } catch (err) {
      console.error('💥 Error loading employers:', err);
      setError(err.message || 'Failed to load employers');
      setEmployers([]);
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
   * ✅ IMPROVED: Smart location search using user's preferences
   */
  const handleShowNearby = async () => {
    try {
      // Try to get user's location from their matching profile
      const { data: applicantProfile } = await db.applicantForms.getByUserId(user.id);
      if (applicantProfile?.preferred_city || applicantProfile?.preferred_state) {
        // Combine city and state if both exist, otherwise use what's available
        const location = applicantProfile.preferred_city && applicantProfile.preferred_state 
          ? `${applicantProfile.preferred_city}, ${applicantProfile.preferred_state}`
          : applicantProfile.preferred_city || applicantProfile.preferred_state;
          
        setFilters(prev => ({
          ...prev,
          location: location,
          industry: '', // Clear other filters for broader search
          businessType: '',
          recoveryFeatures: []
        }));
        return;
      }
    } catch (err) {
      console.error('Could not load user location preferences:', err);
    }

    // Use profile location as fallback
    const userLocation = profile?.city && profile?.state 
      ? `${profile.city}, ${profile.state}`
      : profile?.state || '';
    
    if (userLocation) {
      setFilters(prev => ({ 
        ...prev, 
        location: userLocation,
        industry: '', // Clear other filters for broader search
        businessType: '',
        recoveryFeatures: []
      }));
    } else {
      alert('Please set your location in filters to find nearby employers.');
    }
  };

  /**
   * Show employer details in modal
   */
  const handleShowDetails = (employer) => {
    setSelectedEmployer(employer);
    setShowDetails(true);
  };

  /**
   * ✅ FIXED: Simplified employment inquiry - contact exchange only (no match groups)
   */
  const handleSendJobInquiry = async (employer) => {
    // Check if already sent inquiry or have active connection
    if (jobInquiries.has(employer.user_id)) {
      alert(`You already have an active employment connection with ${employer.company_name}.`);
      return;
    }

    // Check if employer is actively hiring
    if (!employer.is_actively_hiring) {
      if (!window.confirm(`${employer.company_name} is not currently marked as actively hiring. Send inquiry anyway?`)) {
        return;
      }
    }

    try {
      console.log('💼 Sending employment inquiry to:', employer.company_name);
      
      // ✅ SIMPLIFIED: Employment connections are just contact exchange - no match groups needed
      const requestData = {
        requester_id: user.id,
        target_id: employer.user_id,
        request_type: 'employment',
        message: `Hi! I'm interested in potential job opportunities at ${employer.company_name}. Your commitment to recovery-friendly employment${employer.recovery_friendly_features?.length > 0 ? ` and ${employer.recovery_friendly_features.slice(0, 2).join(' and ')}` : ''} aligns well with what I'm looking for in my career journey.${employer.current_openings?.length > 0 ? ` I'm particularly interested in your openings for ${employer.current_openings.slice(0, 2).join(' and ')}.` : ''}

I'd appreciate the opportunity to discuss how my skills and recovery experience could contribute to your team.`,
        status: 'pending'
      };
      
      console.log('📤 Sending employment inquiry:', requestData);
      
      // ✅ FIXED: Simple match request creation for employment (no match groups)
      const result = await db.matchRequests.create(requestData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to send employment inquiry');
      }
      
      if (!result.data) {
        throw new Error('No response received from employment inquiry request');
      }
      
      console.log('✅ Employment inquiry sent successfully:', result.data);
      
      // Update local state to track sent inquiry
      setJobInquiries(prev => new Set([...prev, employer.user_id]));
      
      alert(`Employment inquiry sent to ${employer.company_name}! They will receive your message and can respond with their contact information if interested.`);
      
    } catch (err) {
      console.error('💥 Error sending employment inquiry:', err);
      alert(`Failed to send employment inquiry: ${err.message}. Please try again.`);
    }
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({
      industry: '',
      location: '',
      state: '',
      businessType: '',
      recoveryFeatures: [],
      jobTypes: [],
      remoteWork: '',
      isActivelyHiring: true,
      hasOpenings: false
    });
  };

  /**
   * Format recovery features for display
   */
  const formatFeature = (feature) => {
    return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  /**
   * Format business type for display
   */
  const formatBusinessType = (type) => {
    const option = businessTypeOptions.find(opt => opt.value === type);
    return option ? option.label : formatFeature(type);
  };

  /**
   * Format remote work options for display
   */
  const formatRemoteWork = (option) => {
    const remoteOption = remoteWorkOptions.find(opt => opt.value === option);
    return remoteOption ? remoteOption.label : formatFeature(option);
  };

  /**
   * ✅ NEW: Get connection status for display
   */
  const getConnectionStatus = (employer) => {
    const hasInquiry = jobInquiries.has(employer.user_id);
    const isHiring = employer.is_actively_hiring;
    
    if (hasInquiry) {
      return { text: 'Connected', disabled: true, className: 'btn-success' };
    } else if (!isHiring) {
      return { text: 'Send Inquiry', disabled: false, className: 'btn-outline' };
    } else {
      return { text: 'Send Job Inquiry', disabled: false, className: 'btn-secondary' };
    }
  };

  return (
    <>
      <div className="content">
        <div className="text-center mb-5">
          <h1 className="welcome-title">Find Recovery-Friendly Employers</h1>
          <p className="welcome-text">
            Connect with employers committed to supporting individuals in recovery with second-chance hiring, 
            flexible policies, and inclusive workplace cultures.
          </p>
        </div>

        {/* ✅ IMPROVED: Better search filters layout */}
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
              <label className="label">Location (City, State)</label>
              <input
                className="input"
                type="text"
                placeholder="Austin, TX or Texas"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
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
              <button
                className="btn btn-primary"
                onClick={loadEmployers}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid-auto mb-4">
            <button
              className="btn btn-outline"
              onClick={handleShowNearby}
              disabled={loading}
            >
              🗺️ Find Nearby Employers
            </button>

            <button
              className="btn btn-outline"
              onClick={clearFilters}
              disabled={loading}
            >
              Clear Filters
            </button>

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

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="has-openings"
                checked={filters.hasOpenings}
                onChange={(e) => handleFilterChange('hasOpenings', e.target.checked)}
              />
              <label htmlFor="has-openings">
                Must have specific job openings listed
              </label>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid-2 mb-4">
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
              <label className="label">Remote Work Options</label>
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

          {/* Active Filters Display */}
          {(filters.industry || filters.location || filters.state || filters.businessType || 
            filters.recoveryFeatures.length > 0 || filters.jobTypes.length > 0 || filters.remoteWork) && (
            <div className="alert alert-info">
              <strong>Active Filters:</strong> 
              {filters.industry && ` Industry: ${filters.industry} •`}
              {filters.location && ` Location: ${filters.location} •`}
              {filters.state && ` State: ${filters.state} •`}
              {filters.businessType && ` Type: ${formatBusinessType(filters.businessType)} •`}
              {filters.remoteWork && ` Remote: ${formatRemoteWork(filters.remoteWork)} •`}
              {filters.recoveryFeatures.length > 0 && ` Recovery Features: ${filters.recoveryFeatures.length} selected •`}
              {filters.jobTypes.length > 0 && ` Job Types: ${filters.jobTypes.length} selected •`}
              {filters.isActivelyHiring && ` Actively hiring only •`}
              {filters.hasOpenings && ` Has specific openings`}
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
                  loadEmployers();
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
            <p>Try adjusting your filters or expanding your search area.</p>
            <div className="mt-3">
              <button
                className="btn btn-primary"
                onClick={handleShowNearby}
              >
                Find Nearby Employers
              </button>
              <button
                className="btn btn-outline ml-2"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Employers Grid */}
        {!loading && !error && employers.length > 0 && (
          <>
            <div className="card mb-4">
              <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="card-title">
                  {employers.length} Employer{employers.length !== 1 ? 's' : ''} Found
                </h3>
                <div className="text-gray-600">
                  {employers.filter(e => e.is_actively_hiring).length} actively hiring •{' '}
                  {jobInquiries.size} connected
                </div>
              </div>
            </div>

            <div className="grid-auto mb-5">
              {employers.map((employer) => {
                const connectionStatus = getConnectionStatus(employer);
                
                return (
                  <div key={employer.id} className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{employer.company_name}</div>
                        <div className="card-subtitle">
                          {employer.industry} • {employer.city}, {employer.state}
                        </div>
                      </div>
                      <div>
                        {employer.is_actively_hiring ? (
                          <span className="badge badge-success mb-1">Hiring</span>
                        ) : (
                          <span className="badge badge-warning mb-1">Not Hiring</span>
                        )}
                        {jobInquiries.has(employer.user_id) && (
                          <span className="badge badge-info">Connected</span>
                        )}
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
                            {employer.remote_work_options ? formatRemoteWork(employer.remote_work_options) : 'Not specified'}
                          </span>
                        </div>
                      </div>

                      {/* Current Openings */}
                      {employer.current_openings?.length > 0 && (
                        <div className="mb-3">
                          <div className="label mb-2">Current Job Openings</div>
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
                        className={`btn ${connectionStatus.className}`}
                        onClick={() => handleSendJobInquiry(employer)}
                        disabled={connectionStatus.disabled}
                      >
                        {connectionStatus.text}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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

            {/* Employment Connection Status */}
            {jobInquiries.has(selectedEmployer.user_id) && (
              <div className="alert alert-success mb-4">
                <strong>✅ Connected:</strong> You have an active employment connection with this employer. 
                Check your connections page to exchange contact information.
              </div>
            )}

            {/* Company Info */}
            <div className="mb-4">
              <h4 className="card-title">Company Information</h4>
              <div className="grid-2 text-sm mb-3">
                <div><strong>Industry:</strong> {selectedEmployer.industry}</div>
                <div><strong>Type:</strong> {formatBusinessType(selectedEmployer.business_type)}</div>
                <div><strong>Size:</strong> {selectedEmployer.company_size || 'Not specified'}</div>
                <div><strong>Founded:</strong> {selectedEmployer.founded_year || 'Not specified'}</div>
              </div>
              <div className="grid-2 text-sm mb-3">
                <div><strong>Location:</strong> {selectedEmployer.city}, {selectedEmployer.state}</div>
                <div><strong>Remote Work:</strong> {selectedEmployer.remote_work_options ? formatRemoteWork(selectedEmployer.remote_work_options) : 'Not specified'}</div>
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

            {/* Contact Info Preview */}
            {!jobInquiries.has(selectedEmployer.user_id) && (
              <div className="mb-4">
                <h4 className="card-title">Next Steps</h4>
                <div className="alert alert-info">
                  <strong>💼 Employment Connection Process:</strong>
                  <ol style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                    <li>Send employment inquiry to express interest</li>
                    <li>Employer reviews your request and decides whether to connect</li>
                    <li>If approved, you can exchange contact information directly</li>
                    <li>Proceed with their application process or schedule interviews</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="grid-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
              
              {!jobInquiries.has(selectedEmployer.user_id) ? (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    handleSendJobInquiry(selectedEmployer);
                    setShowDetails(false);
                  }}
                >
                  Send Employment Inquiry
                </button>
              ) : (
                <div className="text-center" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '10px',
                  background: 'var(--bg-light-cream)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--primary-purple)',
                  fontWeight: '600'
                }}>
                  ✅ Already Connected
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployerFinder;