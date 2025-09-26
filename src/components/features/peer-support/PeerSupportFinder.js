// src/components/features/peer-support/PeerSupportFinder.js - UPDATED FOR PHASE 6
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
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
    if (profile?.id) {
      loadSpecialists();
      loadConnectionRequests();
    }
  }, [profile?.id]);

  // Reload when filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (profile?.id) {
        loadSpecialists();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, profile?.id]);

  /**
   * Load existing peer support connections to prevent duplicates
   */
  const loadConnectionRequests = async () => {
    if (!profile?.id) return;

    try {
      console.log('📊 Loading existing peer support connections...');
      const result = await db.matchRequests.getByUserId(profile.id);
      
      if (result.data && !result.error) {
        const sentRequests = new Set();
        const activeConnections = new Set();
        
        result.data
          .filter(req => req.request_type === 'peer-support')
          .forEach(req => {
            // Track the other user's profile ID (peer specialist)
            const otherProfileId = req.requester_id === profile.id ? req.recipient_id : req.requester_id;
            
            if (req.status === 'pending' && req.requester_id === profile.id) {
              sentRequests.add(otherProfileId);
            } else if (req.status === 'accepted') {
              activeConnections.add(otherProfileId);
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
   * Enhanced search for available peer support specialists
   */
  const loadSpecialists = async () => {
    if (!profile?.id) return;
    
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

      // Try to get available specialists from database
      let availableSpecialists = [];
      
      try {
        // Check if the peerSupportService method exists
        if (db.peerSupportService && typeof db.peerSupportService.getAvailable === 'function') {
          const result = await db.peerSupportService.getAvailable(dbFilters);
          if (result.data && !result.error) {
            availableSpecialists = result.data;
          }
        } else {
          // Fallback: get all peer support profiles and filter client-side
          console.log('🔄 Using fallback method to load peer support profiles...');
          const result = await db.peerSupportService.getAll();
          if (result.data && !result.error) {
            availableSpecialists = result.data.filter(specialist => 
              specialist.is_active !== false
            );
          }
        }
      } catch (serviceError) {
        console.warn('Error with peerSupportService, trying alternate approach:', serviceError);
        
        // Ultimate fallback - this will need to be implemented based on your actual service structure
        throw new Error('Peer support service is not yet available. Please check back later.');
      }
      
      console.log(`📊 Found ${availableSpecialists.length} specialists from database`);
      
      // Apply client-side filters for more refined search
      if (filters.minExperience) {
        const minYears = parseInt(filters.minExperience);
        availableSpecialists = availableSpecialists.filter(specialist => 
          (specialist.years_experience || 0) >= minYears
        );
      }

      // Filter by accepting clients status
      if (filters.acceptingClients) {
        availableSpecialists = availableSpecialists.filter(specialist => 
          specialist.accepting_clients === true
        );
      }

      // Zip code proximity filtering (basic implementation)
      if (filters.zipCode && filters.zipCode.length >= 5) {
        const searchZip = filters.zipCode.substring(0, 5);
        availableSpecialists = availableSpecialists.filter(specialist => {
          if (!specialist.zip_code) return false;
          const specialistZip = specialist.zip_code.toString().substring(0, 5);
          
          // Simple proximity: same first 3 digits = roughly same area
          return specialistZip.substring(0, 3) === searchZip.substring(0, 3);
        });
      }

      // Location filtering
      if (filters.location.trim()) {
        const searchLocation = filters.location.toLowerCase().trim();
        availableSpecialists = availableSpecialists.filter(specialist => {
          const serviceCity = (specialist.service_city || '').toLowerCase();
          const serviceState = (specialist.service_state || '').toLowerCase();
          const serviceAreas = specialist.service_areas || [];
          
          return serviceCity.includes(searchLocation) ||
                 serviceState.includes(searchLocation) ||
                 serviceAreas.some(area => area.toLowerCase().includes(searchLocation));
        });
      }

      // Specialty filtering
      if (filters.specialties.length > 0) {
        availableSpecialists = availableSpecialists.filter(specialist => {
          const specialistSpecialties = specialist.specialties || [];
          return filters.specialties.some(filterSpecialty =>
            specialistSpecialties.includes(filterSpecialty)
          );
        });
      }

      // Exclude current user if they're also a peer specialist
      availableSpecialists = availableSpecialists.filter(specialist => 
        specialist.user_id !== profile.id
      );

      // Better sorting - accepting clients first, then by experience
      availableSpecialists.sort((a, b) => {
        // First priority: accepting clients
        if (a.accepting_clients && !b.accepting_clients) return -1;
        if (!a.accepting_clients && b.accepting_clients) return 1;
        
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
   * Improved filter change handling
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
   * Smart location search that includes common areas
   */
  const handleShowNearby = async () => {
    if (!profile?.primary_city && !profile?.primary_state) {
      // Try to use user's location from matching profile if available
      try {
        const { data: matchingProfile } = await db.matchingProfiles.getByUserId(profile.id);
        if (matchingProfile?.primary_city || matchingProfile?.primary_state) {
          // Combine city and state if both exist, otherwise use what's available
          const location = matchingProfile.primary_city && matchingProfile.primary_state 
            ? `${matchingProfile.primary_city}, ${matchingProfile.primary_state}`
            : matchingProfile.primary_city || matchingProfile.primary_state;
            
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
    const userLocation = profile?.primary_city && profile?.primary_state 
      ? `${profile.primary_city}, ${profile.primary_state}`
      : profile?.primary_state || '';
    
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
   * Peer support connection request with proper architecture
   */
  const handleRequestConnection = async (specialist) => {
    if (!profile?.id) return;

    // Check if already sent request or have active connection
    if (connectionRequests.has(specialist.user_id)) {
      alert(`You've already sent a peer support request to ${specialist.first_name || 'this specialist'}.`);
      return;
    }

    if (activeConnections.has(specialist.user_id)) {
      alert(`You already have an active peer support connection with ${specialist.first_name || 'this specialist'}.`);
      return;
    }

    // Check if specialist is accepting clients
    if (!specialist.accepting_clients) {
      if (!window.confirm(`${specialist.first_name || 'This specialist'} is not currently accepting new clients. Send request anyway?`)) {
        return;
      }
    }

    try {
      console.log('🤝 Sending peer support request to:', specialist.first_name);
      
      // Create match_request using proper architecture
      const requestData = {
        requester_type: 'applicant',
        requester_id: profile.id,
        recipient_type: 'peer-support', 
        recipient_id: specialist.user_id,
        request_type: 'peer-support',
        message: `Hi ${specialist.first_name || 'there'}! I'm interested in connecting with you for peer support services. Your experience with ${specialist.specialties?.slice(0, 2).join(' and ') || 'recovery support'} aligns well with what I'm looking for in my recovery journey.

I would appreciate the opportunity to discuss how your support could help me in my recovery process.`,
        status: 'pending'
      };
      
      console.log('📤 Sending peer support request:', requestData);
      
      // Create match_request first (match_group created on approval via MatchRequests component)
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
      
      alert(`Peer support request sent to ${specialist.first_name || 'the specialist'}! They will be notified and can respond through their dashboard.`);
      
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
   * Get connection status for display
   */
  const getConnectionStatus = (specialist) => {
    const hasRequest = connectionRequests.has(specialist.user_id);
    const hasConnection = activeConnections.has(specialist.user_id);
    const isAcceptingClients = specialist.accepting_clients;
    
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

  const formatLocationText = (specialist) => {
    if (specialist.service_city && specialist.service_state) {
      return `${specialist.service_city}, ${specialist.service_state}`;
    } else if (specialist.service_areas?.length > 0) {
      return specialist.service_areas.join(', ');
    }
    return 'Location not specified';
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

        {/* Search filters layout */}
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

          {/* Quick Action Buttons */}
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

          {/* Specialties Filter */}
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

          {/* Active Filters Display */}
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

        {/* Error State */}
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

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size="large" text="Finding peer support specialists..." />
          </div>
        )}

        {/* No Results State */}
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

        {/* Specialists Grid */}
        {!loading && !error && specialists.length > 0 && (
          <div className={styles.specialistsContainer}>
            <div className={styles.specialistsHeader}>
              <h3 className="card-title">
                {specialists.length} Specialist{specialists.length !== 1 ? 's' : ''} Found
              </h3>
              <div className={styles.specialistsStats}>
                {specialists.filter(s => s.accepting_clients).length} accepting new clients •{' '}
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
                          {specialist.first_name || 'Anonymous'}
                        </div>
                        <div className={styles.specialistTitle}>
                          {specialist.professional_title || 'Peer Support Specialist'}
                        </div>
                      </div>
                      <div className={styles.badgeGroup}>
                        {specialist.is_licensed && (
                          <span className="badge badge-success">Licensed</span>
                        )}
                        {specialist.accepting_clients ? (
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
                            {formatLocationText(specialist)}
                          </span>
                        </div>
                      </div>

                      {/* Specialties */}
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

                      {/* Brief Bio */}
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
                        className={`btn ${connectionStatus.className || 'btn-primary'}`}
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

      {/* Specialist Details Modal */}
      {showDetails && selectedSpecialist && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {selectedSpecialist.first_name || 'Anonymous'} - Peer Support Specialist
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

              {/* Professional Information */}
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
                    <span className={styles.infoValue}>{selectedSpecialist.accepting_clients ? 'Yes' : 'No'}</span>
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

              {/* Service Areas */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Service Areas</h4>
                <div className={styles.tagsList}>
                  <span className={styles.detailBadge}>{formatLocationText(selectedSpecialist)}</span>
                </div>
              </div>

              {/* All Specialties */}
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

              {/* Connection Process Explanation */}
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
                    disabled={!selectedSpecialist.accepting_clients}
                  >
                    {!selectedSpecialist.accepting_clients ? 'Not Accepting Clients' : 'Request Connection'}
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