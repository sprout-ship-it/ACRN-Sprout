// src/components/features/peer-support/PeerSupportFinder.js - UPDATED WITH CSS MODULE
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../styles/main.css';
import styles from './PeerSupportFinder.module.css';

const PeerSupportFinder = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState(new Set()); // Track sent requests
  const [activeConnections, setActiveConnections] = useState(new Set()); // Track active connections
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
   * ✅ FIXED: Load existing peer support connections to prevent duplicates
   */
  const loadConnectionRequests = async () => {
    if (!user?.id) return;

    try {
      console.log('📊 Loading existing peer support connections...');
      const result = await db.matchRequests.getByUserId(user.id);
      
      if (result.success !== false && result.data) {
        const sentRequests = new Set();
        const activeConnections = new Set();
        
        result.data
          .filter(req => req.request_type === 'peer_support')
          .forEach(req => {
            // Track the other user's ID (peer specialist)
            const otherUserId = req.requester_id === user.id ? req.target_id : req.requester_id;
            
            if (req.status === 'pending' && req.requester_id === user.id) {
              sentRequests.add(otherUserId);
            } else if (req.status === 'matched') {
              activeConnections.add(otherUserId);
            }
          });
        
        setConnectionRequests(sentRequests);
        setActiveConnections(activeConnections);
        console.log('📊 Loaded peer support connections:', {
          pending: sentRequests.size,
          active: activeConnections.size
        });
      }
    } catch (err) {
      console.error('💥 Error loading peer support connections:', err);
    }
  };

  /**
   * ✅ IMPROVED: Enhanced search for available peer support specialists
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
   * ✅ IMPROVED: Smart location search that includes common areas
   */
  const handleShowNearby = async () => {
    if (!profile?.city && !profile?.state) {
      // Try to use user's location from matching profile if available
      try {
        const { data: applicantProfile } = await db.applicantForms.getByUserId(user.id);
        if (applicantProfile?.preferred_city || applicantProfile?.preferred_state) {
          // Combine city and state if both exist, otherwise use what's available
          const location = applicantProfile.preferred_city && applicantProfile.preferred_state 
            ? `${applicantProfile.preferred_city}, ${applicantProfile.preferred_state}`
            : applicantProfile.preferred_city || applicantProfile.preferred_state;
            
          setFilters(prev => ({
            ...prev,
            location: location,
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
   * ✅ FIXED: Peer support connection request with proper architecture
   * Note: Peer support connections DO create match groups (unlike employment)
   */
  const handleRequestConnection = async (specialist) => {
    // Check if already sent request or have active connection
    if (connectionRequests.has(specialist.user_id)) {
      alert(`You've already sent a peer support request to ${specialist.registrant_profiles?.first_name || 'this specialist'}.`);
      return;
    }

    if (activeConnections.has(specialist.user_id)) {
      alert(`You already have an active peer support connection with ${specialist.registrant_profiles?.first_name || 'this specialist'}.`);
      return;
    }

    // Check if specialist is accepting clients
    if (!specialist.is_accepting_clients) {
      if (!window.confirm(`${specialist.registrant_profiles?.first_name || 'This specialist'} is not currently accepting new clients. Send request anyway?`)) {
        return;
      }
    }

    try {
      console.log('🤝 Sending peer support request to:', specialist.registrant_profiles?.first_name);
      
      // ✅ FIXED: Peer support connections create match_requests first, then match_groups when approved
      const requestData = {
        requester_id: user.id,
        target_id: specialist.user_id,
        request_type: 'peer_support',
        message: `Hi ${specialist.registrant_profiles?.first_name || 'there'}! I'm interested in connecting with you for peer support services. Your experience with ${specialist.specialties?.slice(0, 2).join(' and ') || 'recovery support'} aligns well with what I'm looking for in my recovery journey.

I would appreciate the opportunity to discuss how your support could help me in my recovery process.`,
        status: 'pending'
      };
      
      console.log('📤 Sending peer support request:', requestData);
      
      // ✅ CORRECT: Create match_request first (match_group created on approval via MatchRequests component)
      const result = await db.matchRequests.create(requestData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to send peer support request');
      }
      
      if (!result.data) {
        throw new Error('No response received from peer support request');
      }
      
      console.log('✅ Peer support request sent successfully:', result.data);
      
      // Update local state to track sent request
      setConnectionRequests(prev => new Set([...prev, specialist.user_id]));
      
      alert(`Peer support request sent to ${specialist.registrant_profiles?.first_name || 'the specialist'}! They will be notified and can respond through their dashboard.`);
      
    } catch (err) {
      console.error('💥 Error sending peer support request:', err);
      alert(`Failed to send peer support request: ${err.message}. Please try again.`);
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
   * ✅ NEW: Get connection status for display
   */
  const getConnectionStatus = (specialist) => {
    const hasRequest = connectionRequests.has(specialist.user_id);
    const hasConnection = activeConnections.has(specialist.user_id);
    const isAcceptingClients = specialist.is_accepting_clients;
    
    if (hasConnection) {
      return { text: 'Active Connection', disabled: true, className: styles.statusConnected };
    } else if (hasRequest) {
      return { text: 'Request Sent', disabled: true, className: styles.statusRequestSent };
    } else if (!isAcceptingClients) {
      return { text: 'Request Connection', disabled: false, className: styles.statusNotAccepting };
    } else {
      return { text: 'Request Connection', disabled: false, className: styles.statusAvailable };
    }
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

        {/* ✅ UPDATED: Better search filters layout using CSS module */}
        <div className={styles.filterContainer}>
          <h3 className="card-title">Search Filters</h3>
          
          <div className={styles.filterGrid}>
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

          {/* ✅ UPDATED: Quick Action Buttons using CSS module */}
          <div className={styles.filterActions}>
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

          {/* ✅ UPDATED: Specialties Filter using CSS module */}
          <div className="form-group">
            <label className="label">Specialties (select any that interest you)</label>
            <div className={styles.specialtiesGrid}>
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

          {/* ✅ UPDATED: Active Filters Display using CSS module */}
          {(filters.specialties.length > 0 || filters.location || filters.zipCode || filters.minExperience) && (
            <div className={styles.activeFiltersDisplay}>
              <strong>Active Filters:</strong> 
              {filters.location && ` Location: ${filters.location} •`}
              {filters.zipCode && ` Zip: ${filters.zipCode} •`}
              {filters.minExperience && ` Min Experience: ${filters.minExperience}+ years •`}
              {filters.specialties.length > 0 && ` Specialties: ${filters.specialties.length} selected •`}
              {filters.acceptingClients && ` Accepting clients only`}
            </div>
          )}
        </div>

        {/* ✅ UPDATED: Error State using CSS module */}
        {error && (
          <div className={styles.errorState}>
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

        {/* ✅ UPDATED: Loading State using CSS module */}
        {loading && (
          <div className={styles.loadingContainer}>
            <LoadingSpinner />
            <div className={styles.loadingMessage}>Finding peer support specialists...</div>
          </div>
        )}

        {/* ✅ UPDATED: No Results State using CSS module */}
        {!loading && !error && specialists.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🔍</div>
            <h3 className={styles.emptyStateTitle}>No specialists found</h3>
            <p className={styles.emptyStateMessage}>Try adjusting your filters or expanding your search area.</p>
            <div className={styles.emptyStateActions}>
              <button
                className="btn btn-primary"
                onClick={handleShowNearby}
              >
                Find Nearby Specialists
              </button>
              <button
                className="btn btn-outline"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* ✅ UPDATED: Specialists Grid using CSS module */}
        {!loading && !error && specialists.length > 0 && (
          <div className={styles.specialistsContainer}>
            <div className={styles.specialistsHeader}>
              <h3 className="card-title">
                {specialists.length} Specialist{specialists.length !== 1 ? 's' : ''} Found
              </h3>
              <div className={styles.specialistsStats}>
                {specialists.filter(s => s.is_accepting_clients).length} accepting new clients •{' '}
                {activeConnections.size} active connections •{' '}
                {connectionRequests.size} pending requests
              </div>
            </div>

            <div className={styles.specialistsGrid}>
              {specialists.map((specialist) => {
                const connectionStatus = getConnectionStatus(specialist);
                
                return (
                  <div key={specialist.user_id} className={styles.specialistCard}>
                    <div className={styles.specialistCardHeader}>
                      <div>
                        <div className={styles.specialistName}>
                          {specialist.registrant_profiles?.first_name || 'Anonymous'}
                        </div>
                        <div className={styles.specialistTitle}>
                          {specialist.professional_title || 'Peer Support Specialist'}
                        </div>
                      </div>
                      <div className={styles.badgeGroup}>
                        {specialist.is_licensed && (
                          <span className="badge badge-success">Licensed</span>
                        )}
                        {specialist.is_accepting_clients ? (
                          <span className="badge badge-success">Accepting Clients</span>
                        ) : (
                          <span className="badge badge-warning">Not Accepting</span>
                        )}
                        {activeConnections.has(specialist.user_id) && (
                          <span className="badge badge-info">Connected</span>
                        )}
                        {connectionRequests.has(specialist.user_id) && !activeConnections.has(specialist.user_id) && (
                          <span className="badge badge-warning">Request Sent</span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className={styles.experienceInfo}>
                        <div>
                          <span className={styles.experienceLabel}>Experience:</span>
                          <span className={styles.experienceValue}>
                            {formatExperienceText(specialist.years_experience)}
                          </span>
                        </div>
                        <div>
                          <span className={styles.experienceLabel}>Service Area:</span>
                          <span className={styles.experienceValue}>
                            {formatLocationText(specialist.service_area)}
                          </span>
                        </div>
                      </div>

                      {/* ✅ UPDATED: Specialties using CSS module */}
                      {specialist.specialties?.length > 0 && (
                        <div className={styles.specialtiesSection}>
                          <div className="label mb-2">Specialties</div>
                          <div className={styles.specialtiesList}>
                            {specialist.specialties.slice(0, 4).map((specialty, i) => (
                              <span key={i} className={styles.specialtyBadge}>
                                {specialty}
                              </span>
                            ))}
                          </div>
                          {specialist.specialties.length > 4 && (
                            <div className={styles.moreSpecialties}>
                              +{specialist.specialties.length - 4} more
                            </div>
                          )}
                        </div>
                      )}

                      {/* ✅ UPDATED: Brief Bio using CSS module */}
                      {specialist.bio && (
                        <div className={styles.bioSection}>
                          <p className={styles.bioText}>
                            {specialist.bio.length > 150 
                              ? `${specialist.bio.substring(0, 150)}...` 
                              : specialist.bio
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleShowDetails(specialist)}
                      >
                        View Details
                      </button>
                      
                      <button
                        className={`btn ${connectionStatus.className}`}
                        onClick={() => handleRequestConnection(specialist)}
                        disabled={connectionStatus.disabled}
                      >
                        {connectionStatus.text}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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

      {/* ✅ UPDATED: Specialist Details Modal using CSS module */}
      {showDetails && selectedSpecialist && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {selectedSpecialist.registrant_profiles?.first_name || 'Anonymous'} - Peer Support Specialist
              </h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Connection Status */}
              {activeConnections.has(selectedSpecialist.user_id) && (
                <div className="alert alert-success mb-4">
                  <strong>✅ Active Connection:</strong> You have an active peer support connection with this specialist. 
                  Check your connections page to exchange contact information and coordinate support sessions.
                </div>
              )}
              
              {connectionRequests.has(selectedSpecialist.user_id) && !activeConnections.has(selectedSpecialist.user_id) && (
                <div className="alert alert-info mb-4">
                  <strong>📤 Request Sent:</strong> You've sent a peer support request to this specialist. 
                  They will review your request and respond through their dashboard.
                </div>
              )}

              {/* ✅ UPDATED: Professional Information using CSS module */}
              <div className={styles.professionalInfo}>
                <h4 className={styles.detailSectionTitle}>Professional Background</h4>
                <div className={styles.professionalGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Title:</span>
                    <span className={styles.infoValue}>{selectedSpecialist.professional_title || 'Peer Support Specialist'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Experience:</span>
                    <span className={styles.infoValue}>{formatExperienceText(selectedSpecialist.years_experience)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Licensed:</span>
                    <span className={styles.infoValue}>{selectedSpecialist.is_licensed ? 'Yes' : 'No'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Accepting Clients:</span>
                    <span className={styles.infoValue}>{selectedSpecialist.is_accepting_clients ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedSpecialist.bio && (
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}>About</h4>
                  <p className={styles.bioText}>{selectedSpecialist.bio}</p>
                </div>
              )}

              {/* ✅ UPDATED: Service Areas using CSS module */}
              {selectedSpecialist.service_area?.length > 0 && (
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}>Service Areas</h4>
                  <div className={styles.tagsList}>
                    {(Array.isArray(selectedSpecialist.service_area) 
                      ? selectedSpecialist.service_area 
                      : [selectedSpecialist.service_area]
                    ).map((area, i) => (
                      <span key={i} className={styles.detailBadge}>{area}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ UPDATED: All Specialties using CSS module */}
              {selectedSpecialist.specialties?.length > 0 && (
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}>Specialties</h4>
                  <div className={styles.tagsList}>
                    {selectedSpecialist.specialties.map((specialty, i) => (
                      <span key={i} className={styles.detailBadge}>{specialty}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recovery Methods Supported */}
              {selectedSpecialist.supported_recovery_methods?.length > 0 && (
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}>Supported Recovery Methods</h4>
                  <div className={styles.tagsList}>
                    {selectedSpecialist.supported_recovery_methods.map((method, i) => (
                      <span key={i} className={styles.detailBadge}>{method}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {selectedSpecialist.additional_info && (
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}>Additional Information</h4>
                  <p className={styles.bioText}>{selectedSpecialist.additional_info}</p>
                </div>
              )}

              {/* ✅ UPDATED: Connection Process Explanation using CSS module */}
              {!activeConnections.has(selectedSpecialist.user_id) && !connectionRequests.has(selectedSpecialist.user_id) && (
                <div className={styles.connectionProcess}>
                  <div className={styles.connectionProcessTitle}>🤝 Peer Support Connection Process:</div>
                  <ol className={styles.connectionProcessList}>
                    <li>Send connection request to express interest in peer support</li>
                    <li>Specialist reviews your request and your recovery goals</li>
                    <li>If approved, you can exchange contact information and coordinate</li>
                    <li>Work together to establish a support schedule and goals</li>
                  </ol>
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </button>
                
                {!activeConnections.has(selectedSpecialist.user_id) && !connectionRequests.has(selectedSpecialist.user_id) ? (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      handleRequestConnection(selectedSpecialist);
                      setShowDetails(false);
                    }}
                    disabled={!selectedSpecialist.is_accepting_clients}
                  >
                    {!selectedSpecialist.is_accepting_clients ? 'Not Accepting Clients' : 'Request Connection'}
                  </button>
                ) : (
                  <div className={styles.connectionStatusDisplay}>
                    {activeConnections.has(selectedSpecialist.user_id) ? '✅ Active Connection' : '📤 Request Sent'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PeerSupportFinder;