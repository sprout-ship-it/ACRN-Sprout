// src/components/dashboard/PeerSupportFinder.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/global.css';

const PeerSupportFinder = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState(new Set()); // Track sent requests
  const [filters, setFilters] = useState({
    specialties: [],
    location: '', // Changed from serviceArea to location for better UX
    zipCode: '',
    minExperience: '',
    acceptingClients: true
  });

  // Available specialty options (expanded based on common peer support areas)
  const specialtyOptions = [
    'AA/NA Programs',
    'SMART Recovery',
    'Trauma-Informed Care',
    'Family Therapy',
    'Mindfulness',
    'Career Counseling',
    'Women in Recovery',
    'Men in Recovery',
    'LGBTQ+ Support',
    'Secular Programs',
    'Housing Support',
    'Mental Health',
    'Addiction Counseling',
    'Group Facilitation',
    'Crisis Intervention',
    'Relapse Prevention',
    'Life Skills Training',
    'Medication Assisted Treatment',
    'Dual Diagnosis Support',
    'Grief & Loss Counseling'
  ];

  // Load peer specialists on component mount
  useEffect(() => {
    loadSpecialists();
    loadConnectionRequests();
  }, []);

  // Reload when filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSpecialists();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  /**
   * Load existing connection requests to avoid duplicates
   */
  const loadConnectionRequests = async () => {
    if (!user?.id) return;

    try {
      const result = await db.matchRequests.getByUserId(user.id);
      if (result.success !== false && result.data) {
        const sentRequests = new Set(
          result.data
            .filter(req => req.requester_id === user.id && req.request_type === 'peer_support')
            .map(req => req.target_id)
        );
        setConnectionRequests(sentRequests);
      }
    } catch (err) {
      console.error('💥 Error loading connection requests:', err);
    }
  };

  /**
   * ✅ FIXED: Improved search for available peer support specialists
   */
  const loadSpecialists = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Loading peer support specialists with filters:', filters);
      
      // Build filter object for database query
      const dbFilters = {};
      
      if (filters.specialties.length > 0) {
        dbFilters.specialties = filters.specialties;
      }
      
      // Use location for both city/state and service area matching
      if (filters.location.trim()) {
        dbFilters.serviceArea = filters.location.trim();
      }

      // Get available specialists from database
      const result = await db.peerSupportProfiles.getAvailable(dbFilters);
      
      if (result.error && !result.data) {
        throw new Error(result.error.message || 'Failed to load peer specialists');
      }
      
      let availableSpecialists = result.data || [];
      console.log(`📊 Found ${availableSpecialists.length} specialists from database`);
      
      // ✅ FIXED: Apply client-side filters for more refined search
      if (filters.minExperience) {
        const minYears = parseInt(filters.minExperience);
        availableSpecialists = availableSpecialists.filter(specialist => 
          (specialist.years_experience || 0) >= minYears
        );
      }

      // Filter by accepting clients status
      if (filters.acceptingClients) {
        availableSpecialists = availableSpecialists.filter(specialist => 
          specialist.is_accepting_clients === true
        );
      }

      // ✅ NEW: Zip code proximity filtering (basic implementation)
      if (filters.zipCode && filters.zipCode.length >= 5) {
        const searchZip = filters.zipCode.substring(0, 5);
        availableSpecialists = availableSpecialists.filter(specialist => {
          if (!specialist.zip_code) return false;
          const specialistZip = specialist.zip_code.toString().substring(0, 5);
          
          // Simple proximity: same first 3 digits = roughly same area
          return specialistZip.substring(0, 3) === searchZip.substring(0, 3);
        });
      }

      // Exclude current user if they're also a peer specialist
      availableSpecialists = availableSpecialists.filter(specialist => 
        specialist.user_id !== user.id
      );

      // ✅ IMPROVED: Better sorting - accepting clients first, then by experience
      availableSpecialists.sort((a, b) => {
        // First priority: accepting clients
        if (a.is_accepting_clients && !b.is_accepting_clients) return -1;
        if (!a.is_accepting_clients && b.is_accepting_clients) return 1;
        
        // Second priority: experience
        return (b.years_experience || 0) - (a.years_experience || 0);
      });

      console.log(`✅ Filtered to ${availableSpecialists.length} specialists`);
      setSpecialists(availableSpecialists);
      
    } catch (err) {
      console.error('💥 Error loading specialists:', err);
      setError(err.message || 'Failed to load peer support specialists');
      setSpecialists([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ FIXED: Improved filter change handling
   */
  const handleSpecialtyChange = (specialty, isChecked) => {
    setFilters(prev => ({
      ...prev,
      specialties: isChecked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  /**
   * Handle other filter changes
   */
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  /**
   * ✅ NEW: Smart location search that includes common areas
   */
  const handleShowNearby = async () => {
    if (!profile?.city && !profile?.state) {
      // Try to use user's location from matching profile if available
      try {
        const { data: applicantProfile } = await db.applicantForms.getByUserId(user.id);
        if (applicantProfile?.preferred_location) {
          setFilters(prev => ({ 
            ...prev, 
            location: applicantProfile.preferred_location,
            specialties: [], // Clear other filters for broader search
            minExperience: ''
          }));
          return;
        }
      } catch (err) {
        console.error('Could not load user location preferences:', err);
      }
    }

    // Use profile location as fallback
    const userLocation = profile?.city && profile?.state 
      ? `${profile.city}, ${profile.state}`
      : profile?.state || '';
    
    if (userLocation) {
      setFilters(prev => ({ 
        ...prev, 
        location: userLocation,
        specialties: [], // Clear other filters for broader search
        minExperience: ''
      }));
    } else {
      alert('Please set your location in filters to find nearby specialists.');
    }
  };

  /**
   * Show specialist details in modal
   */
  const handleShowDetails = (specialist) => {
    setSelectedSpecialist(specialist);
    setShowDetails(true);
  };

  /**
   * ✅ FIXED: Improved connection request with proper error handling
   */
  const handleRequestConnection = async (specialist) => {
    // Check if already sent request
    if (connectionRequests.has(specialist.user_id)) {
      alert(`You've already sent a connection request to ${specialist.registrant_profiles?.first_name || 'this specialist'}.`);
      return;
    }

    try {
      console.log('🤝 Sending peer support request to:', specialist.registrant_profiles?.first_name);
      
      // ✅ FIXED: Improved request data structure
      const requestData = {
        requester_id: user.id,
        target_id: specialist.user_id,
        request_type: 'peer_support',
        message: `Hi ${specialist.registrant_profiles?.first_name || 'there'}! I'm interested in connecting with you for peer support services. Your experience with ${specialist.specialties?.slice(0, 2).join(' and ') || 'recovery support'} aligns well with what I'm looking for in my recovery journey.`,
        status: 'pending'
      };
      
      console.log('📤 Sending request data:', requestData);
      
      // ✅ FIXED: Proper error handling for database call
      const result = await db.matchRequests.create(requestData);
      
      console.log('📥 Database response:', result);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to send connection request');
      }
      
      if (!result.data) {
        throw new Error('No data returned from connection request');
      }
      
      console.log('✅ Peer support request sent successfully:', result.data);
      
      // Update local state to track sent request
      setConnectionRequests(prev => new Set([...prev, specialist.user_id]));
      
      alert(`Connection request sent to ${specialist.registrant_profiles?.first_name || 'the specialist'}! They will be notified and can respond through their dashboard.`);
      
    } catch (err) {
      console.error('💥 Error sending connection request:', err);
      alert(`Failed to send connection request: ${err.message}. Please try again.`);
    }
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({
      specialties: [],
      location: '',
      zipCode: '',
      minExperience: '',
      acceptingClients: true
    });
  };

  /**
   * Format display text for various fields
   */
  const formatExperienceText = (years) => {
    if (!years) return 'Experience not specified';
    return years === 1 ? '1 year experience' : `${years} years experience`;
  };

  const formatLocationText = (serviceArea) => {
    if (!serviceArea) return 'Location not specified';
    if (Array.isArray(serviceArea)) {
      return serviceArea.join(', ');
    }
    return serviceArea;
  };

  return (
    <>
      <div className="content">
        <div className="text-center mb-5">
          <h1 className="welcome-title">Find Peer Support Specialists</h1>
          <p className="welcome-text">
            Connect with experienced peer support specialists who understand your recovery journey and can provide ongoing guidance and support.
          </p>
        </div>

        {/* ✅ IMPROVED: Better search filters layout */}
        <div className="card mb-5">
          <h3 className="card-title">Search Filters</h3>
          
          <div className="grid-auto mb-4">
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
              <label className="label">Zip Code (optional)</label>
              <input
                className="input"
                type="text"
                placeholder="78701"
                value={filters.zipCode}
                onChange={(e) => handleFilterChange('zipCode', e.target.value)}
                maxLength="5"
              />
              <small className="text-gray-600">For local area matching</small>
            </div>
            
            <div className="form-group">
              <label className="label">Minimum Experience</label>
              <select
                className="input"
                value={filters.minExperience}
                onChange={(e) => handleFilterChange('minExperience', e.target.value)}
              >
                <option value="">Any experience level</option>
                <option value="1">1+ years</option>
                <option value="2">2+ years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
              </select>
            </div>
            
            <div className="form-group">
              <button
                className="btn btn-primary"
                onClick={loadSpecialists}
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
              🗺️ Find Nearby Specialists
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
                id="accepting-clients"
                checked={filters.acceptingClients}
                onChange={(e) => handleFilterChange('acceptingClients', e.target.checked)}
              />
              <label htmlFor="accepting-clients">
                Only show specialists accepting new clients
              </label>
            </div>
          </div>

          {/* Specialties Filter */}
          <div className="form-group">
            <label className="label">Specialties (select any that interest you)</label>
            <div className="grid-auto">
              {specialtyOptions.map(specialty => (
                <div key={specialty} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`specialty-${specialty}`}
                    checked={filters.specialties.includes(specialty)}
                    onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                  />
                  <label htmlFor={`specialty-${specialty}`}>
                    {specialty}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.specialties.length > 0 || filters.location || filters.zipCode || filters.minExperience) && (
            <div className="alert alert-info">
              <strong>Active Filters:</strong> 
              {filters.location && ` Location: ${filters.location} •`}
              {filters.zipCode && ` Zip: ${filters.zipCode} •`}
              {filters.minExperience && ` Min Experience: ${filters.minExperience}+ years •`}
              {filters.specialties.length > 0 && ` Specialties: ${filters.specialties.length} selected •`}
              {filters.acceptingClients && ` Accepting clients only`}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="card mb-5">
            <div className="alert alert-error">
              <h4>Error Loading Specialists</h4>
              <p>{error}</p>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setError(null);
                  loadSpecialists();
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
            <p>Finding peer support specialists...</p>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && specialists.length === 0 && (
          <div className="card text-center">
            <h3>No specialists found</h3>
            <p>Try adjusting your filters or expanding your search area.</p>
            <div className="mt-3">
              <button
                className="btn btn-primary"
                onClick={handleShowNearby}
              >
                Find Nearby Specialists
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

        {/* Specialists Grid */}
        {!loading && !error && specialists.length > 0 && (
          <>
            <div className="card mb-4">
              <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="card-title">
                  {specialists.length} Specialist{specialists.length !== 1 ? 's' : ''} Found
                </h3>
                <div className="text-gray-600">
                  {specialists.filter(s => s.is_accepting_clients).length} accepting new clients
                </div>
              </div>
            </div>

            <div className="grid-auto mb-5">
              {specialists.map((specialist) => {
                const alreadyRequested = connectionRequests.has(specialist.user_id);
                const isAcceptingClients = specialist.is_accepting_clients;
                
                return (
                  <div key={specialist.user_id} className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">
                          {specialist.registrant_profiles?.first_name || 'Anonymous'}
                        </div>
                        <div className="card-subtitle">
                          {specialist.professional_title || 'Peer Support Specialist'}
                        </div>
                      </div>
                      <div>
                        {specialist.is_licensed && (
                          <span className="badge badge-success mb-1">Licensed</span>
                        )}
                        {isAcceptingClients ? (
                          <span className="badge badge-success">Accepting Clients</span>
                        ) : (
                          <span className="badge badge-warning">Not Accepting</span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="grid-2 text-gray-600 mb-3">
                        <div>
                          <span className="text-gray-600">Experience:</span>
                          <span className="text-gray-800 ml-1">
                            {formatExperienceText(specialist.years_experience)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Service Area:</span>
                          <span className="text-gray-800 ml-1">
                            {formatLocationText(specialist.service_area)}
                          </span>
                        </div>
                      </div>

                      {/* Specialties */}
                      {specialist.specialties?.length > 0 && (
                        <div className="mb-3">
                          <div className="label mb-2">Specialties</div>
                          <div className="mb-2">
                            {specialist.specialties.slice(0, 4).map((specialty, i) => (
                              <span key={i} className="badge badge-info mr-1 mb-1">
                                {specialty}
                              </span>
                            ))}
                            {specialist.specialties.length > 4 && (
                              <span className="text-sm text-gray-600">
                                +{specialist.specialties.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Brief Bio */}
                      {specialist.bio && (
                        <div className="mb-3">
                          <p className="card-text">
                            {specialist.bio.length > 150 
                              ? `${specialist.bio.substring(0, 150)}...` 
                              : specialist.bio
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid-2">
                      <button
                        className="btn btn-outline"
                        onClick={() => handleShowDetails(specialist)}
                      >
                        View Details
                      </button>
                      
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleRequestConnection(specialist)}
                        disabled={!isAcceptingClients || alreadyRequested}
                      >
                        {alreadyRequested ? 'Request Sent' : 
                         !isAcceptingClients ? 'Not Accepting' : 
                         'Request Connection'}
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

      {/* Specialist Details Modal */}
      {showDetails && selectedSpecialist && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedSpecialist.registrant_profiles?.first_name || 'Anonymous'} - Peer Support Specialist
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>

            {/* Professional Information */}
            <div className="mb-4">
              <h4 className="card-title">Professional Background</h4>
              <div className="grid-2 text-sm mb-3">
                <div>
                  <strong>Title:</strong> {selectedSpecialist.professional_title || 'Peer Support Specialist'}
                </div>
                <div>
                  <strong>Experience:</strong> {formatExperienceText(selectedSpecialist.years_experience)}
                </div>
                <div>
                  <strong>Licensed:</strong> {selectedSpecialist.is_licensed ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Accepting Clients:</strong> {selectedSpecialist.is_accepting_clients ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedSpecialist.bio && (
              <div className="mb-4">
                <h4 className="card-title">About</h4>
                <p className="card-text">{selectedSpecialist.bio}</p>
              </div>
            )}

            {/* Service Areas */}
            {selectedSpecialist.service_area?.length > 0 && (
              <div className="mb-4">
                <h4 className="card-title">Service Areas</h4>
                <div className="mb-2">
                  {(Array.isArray(selectedSpecialist.service_area) 
                    ? selectedSpecialist.service_area 
                    : [selectedSpecialist.service_area]
                  ).map((area, i) => (
                    <span key={i} className="badge badge-success mr-1 mb-1">{area}</span>
                  ))}
                </div>
              </div>
            )}

            {/* All Specialties */}
            {selectedSpecialist.specialties?.length > 0 && (
              <div className="mb-4">
                <h4 className="card-title">Specialties</h4>
                <div className="mb-2">
                  {selectedSpecialist.specialties.map((specialty, i) => (
                    <span key={i} className="badge badge-info mr-1 mb-1">{specialty}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Recovery Methods Supported */}
            {selectedSpecialist.supported_recovery_methods?.length > 0 && (
              <div className="mb-4">
                <h4 className="card-title">Supported Recovery Methods</h4>
                <div className="mb-2">
                  {selectedSpecialist.supported_recovery_methods.map((method, i) => (
                    <span key={i} className="badge badge-warning mr-1 mb-1">{method}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            {selectedSpecialist.additional_info && (
              <div className="mb-4">
                <h4 className="card-title">Additional Information</h4>
                <p className="card-text">{selectedSpecialist.additional_info}</p>
              </div>
            )}

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
                  handleRequestConnection(selectedSpecialist);
                  setShowDetails(false);
                }}
                disabled={!selectedSpecialist.is_accepting_clients || connectionRequests.has(selectedSpecialist.user_id)}
              >
                {connectionRequests.has(selectedSpecialist.user_id) ? 'Request Sent' :
                 !selectedSpecialist.is_accepting_clients ? 'Not Accepting Clients' : 
                 'Request Connection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PeerSupportFinder;