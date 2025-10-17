// src/components/features/peer-support/PeerSupportFinder.js - UPDATED FOR PROFILEMODAL
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';
import { db } from '../../../utils/supabase';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ProfileModal from '../../connections/ProfileModal'; // ✅ UPDATED: Use consolidated ProfileModal
import styles from './PeerSupportFinder.module.css';

import { 
  specialtyOptions, 
  recoveryMethodOptions,
  spiritualAffiliationOptions,
  serviceAreaOptions 
} from './constants/peerSupportConstants';

const PeerSupportFinder = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState(new Set());
  const [activeConnections, setActiveConnections] = useState(new Set());
  
  const [expandedFilters, setExpandedFilters] = useState({
    specialties: false,
    recoveryMethods: false,
    serviceAreas: false
  });
  
  const [filters, setFilters] = useState({
    specialties: [],
    location: '',
    zipCode: '',
    minExperience: '',
    acceptingClients: true,
    recoveryMethods: [],
    spiritualAffiliation: '',
    serviceAreas: []
  });

  useEffect(() => {
    if (profile?.id) {
      loadSpecialists();
      loadConnectionRequests();
    }
  }, [profile?.id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (profile?.id) {
        loadSpecialists();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, profile?.id]);

  const toggleFilterExpansion = (filterType) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const loadConnectionRequests = async () => {
    if (!profile?.id) return;

    try {
      console.log('📊 Loading existing peer support connections from peer_support_matches...');
      
      const { data: applicantProfile, error: applicantError } = await supabase
        .from('applicant_matching_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (applicantError || !applicantProfile) {
        console.warn('⚠️ No applicant profile found, skipping connection loading');
        return;
      }

      const applicantId = applicantProfile.id;
      console.log('✅ Found applicant profile ID:', applicantId);

      const { data: matches, error: matchesError } = await supabase
        .from('peer_support_matches')
        .select('*')
        .eq('applicant_id', applicantId);

      if (matchesError) {
        console.error('❌ Error loading peer support matches:', matchesError);
        return;
      }

      if (!matches || matches.length === 0) {
        console.log('ℹ️ No peer support matches found');
        return;
      }

      const sentRequests = new Set();
      const activeConnections = new Set();

      matches.forEach(match => {
        if (match.status === 'requested') {
          sentRequests.add(match.peer_support_id);
        } else if (match.status === 'active') {
          activeConnections.add(match.peer_support_id);
        }
      });

      setConnectionRequests(sentRequests);
      setActiveConnections(activeConnections);
      
      console.log('📊 Loaded peer support connections:', {
        pending: sentRequests.size,
        active: activeConnections.size
      });

    } catch (err) {
      console.error('💥 Error loading peer support connections:', err);
    }
  };

  const loadSpecialists = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Loading peer support specialists with filters:', filters);
      
      const dbFilters = {};
      
      if (filters.specialties.length > 0) {
        dbFilters.specialties = filters.specialties;
      }
      
      if (filters.recoveryMethods.length > 0) {
        dbFilters.supported_recovery_methods = filters.recoveryMethods;
      }
      
      if (filters.spiritualAffiliation) {
        dbFilters.spiritual_affiliation = filters.spiritualAffiliation;
      }
      
      if (filters.serviceAreas.length > 0) {
        dbFilters.service_areas = filters.serviceAreas;
      }
      
      if (filters.location.trim()) {
        dbFilters.serviceArea = filters.location.trim();
      }

      let availableSpecialists = [];
      
      try {
        if (db.peerSupportProfiles && typeof db.peerSupportProfiles.getAvailable === 'function') {
          console.log('🔍 Using main peer support service...');
          const result = await db.peerSupportProfiles.getAvailable(dbFilters);
          if (result.data && !result.error) {
            availableSpecialists = result.data;
          } else if (result.error) {
            throw new Error(result.error.message || 'Service returned error');
          }
        } else {
          console.log('🔄 Using fallback method to load peer support profiles...');
          
          if (db.peerSupportProfiles && typeof db.peerSupportProfiles.getAvailable === 'function') {
            const result = await db.peerSupportProfiles.getAvailable({});
            if (result.data && !result.error) {
              availableSpecialists = result.data.filter(specialist => 
                specialist.is_active !== false
              );
            } else {
              throw new Error(result.error?.message || 'Fallback service failed');
            }
          } else {
            throw new Error('Peer support service is not available. Please refresh the page and try again.');
          }
        }
      } catch (serviceError) {
        console.warn('Error with peer support service:', serviceError);
        
        if (serviceError.message?.includes('not available') || serviceError.message?.includes('undefined')) {
          throw new Error('Peer support service is temporarily unavailable. Please refresh the page and try again.');
        } else {
          throw new Error(serviceError.message || 'Failed to load peer support specialists. Please try again.');
        }
      }
      
      console.log(`📊 Found ${availableSpecialists.length} specialists from database`);
      
      if (filters.minExperience) {
        const minYears = parseInt(filters.minExperience);
        availableSpecialists = availableSpecialists.filter(specialist => 
          (specialist.years_experience || 0) >= minYears
        );
      }

      if (filters.acceptingClients) {
        availableSpecialists = availableSpecialists.filter(specialist => 
          specialist.accepting_clients === true
        );
      }

      if (filters.zipCode && filters.zipCode.length >= 5) {
        const searchZip = filters.zipCode.substring(0, 5);
        availableSpecialists = availableSpecialists.filter(specialist => {
          if (!specialist.zip_code) return false;
          const specialistZip = specialist.zip_code.toString().substring(0, 5);
          return specialistZip.substring(0, 3) === searchZip.substring(0, 3);
        });
      }

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

      if (filters.specialties.length > 0) {
        availableSpecialists = availableSpecialists.filter(specialist => {
          const specialistSpecialties = specialist.specialties || [];
          return filters.specialties.some(filterSpecialty =>
            specialistSpecialties.includes(filterSpecialty)
          );
        });
      }

      if (filters.recoveryMethods.length > 0) {
        availableSpecialists = availableSpecialists.filter(specialist => {
          const specialistMethods = specialist.supported_recovery_methods || [];
          return filters.recoveryMethods.some(filterMethod =>
            specialistMethods.includes(filterMethod)
          );
        });
      }

      if (filters.spiritualAffiliation) {
        availableSpecialists = availableSpecialists.filter(specialist => 
          specialist.spiritual_affiliation === filters.spiritualAffiliation
        );
      }

      if (filters.serviceAreas.length > 0) {
        availableSpecialists = availableSpecialists.filter(specialist => {
          const specialistAreas = specialist.service_areas || [];
          return filters.serviceAreas.some(filterArea =>
            specialistAreas.includes(filterArea)
          );
        });
      }

      availableSpecialists = availableSpecialists.filter(specialist => 
        specialist.user_id !== profile.id
      );

      availableSpecialists.sort((a, b) => {
        if (a.accepting_clients && !b.accepting_clients) return -1;
        if (!a.accepting_clients && b.accepting_clients) return 1;
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

  const handleSpecialtyChange = (specialty, isChecked) => {
    setFilters(prev => ({
      ...prev,
      specialties: isChecked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleRecoveryMethodChange = (method, isChecked) => {
    setFilters(prev => ({
      ...prev,
      recoveryMethods: isChecked
        ? [...prev.recoveryMethods, method]
        : prev.recoveryMethods.filter(m => m !== method)
    }));
  };

  const handleServiceAreaChange = (area, isChecked) => {
    setFilters(prev => ({
      ...prev,
      serviceAreas: isChecked
        ? [...prev.serviceAreas, area]
        : prev.serviceAreas.filter(a => a !== area)
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleShowNearby = async () => {
    if (!profile?.primary_city && !profile?.primary_state) {
      try {
        const { data: matchingProfile } = await db.matchingProfiles.getByUserId(profile.id);
        if (matchingProfile?.primary_city || matchingProfile?.primary_state) {
          const location = matchingProfile.primary_city && matchingProfile.primary_state 
            ? `${matchingProfile.primary_city}, ${matchingProfile.primary_state}`
            : matchingProfile.primary_city || matchingProfile.primary_state;
            
          setFilters(prev => ({
            ...prev,
            location: location,
            specialties: [],
            recoveryMethods: [],
            serviceAreas: [],
            spiritualAffiliation: '',
            minExperience: ''
          }));
          return;
        }
      } catch (err) {
        console.error('Could not load user location preferences:', err);
      }
    }

    const userLocation = profile?.primary_city && profile?.primary_state 
      ? `${profile.primary_city}, ${profile.primary_state}`
      : profile?.primary_state || '';
    
    if (userLocation) {
      setFilters(prev => ({ 
        ...prev, 
        location: userLocation,
        specialties: [],
        recoveryMethods: [],
        serviceAreas: [],
        spiritualAffiliation: '',
        minExperience: ''
      }));
    } else {
      alert('Please set your location in filters to find nearby specialists.');
    }
  };

  /**
   * ✅ UPDATED: Handle showing specialist details with ProfileModal format
   */
  const handleShowDetails = (specialist) => {
    // Transform specialist data to profile format expected by ProfileModal
    const profileData = {
      ...specialist,
      profile_type: 'peer_support',
      name: specialist.professional_title || `${specialist.first_name || ''} ${specialist.last_name || ''}`.trim()
    };
    
    setSelectedSpecialist(profileData);
    setShowDetails(true);
  };

  const handleRequestConnection = async (specialist) => {
    if (!profile?.id) return;

    // Use the original specialist ID (peer_support_profiles.id)
    const specialistPeerProfileId = specialist.id;
    
    if (connectionRequests.has(specialistPeerProfileId)) {
      alert(`You've already sent a peer support request to ${specialist.first_name || 'this specialist'}.`);
      return;
    }

    if (activeConnections.has(specialistPeerProfileId)) {
      alert(`You already have an active peer support connection with ${specialist.first_name || 'this specialist'}.`);
      return;
    }

    if (!specialist.accepting_clients) {
      if (!window.confirm(`${specialist.first_name || 'This specialist'} is not currently accepting new clients. Send request anyway?`)) {
        return;
      }
    }

    try {
      console.log('🤝 Sending peer support request to:', specialist.first_name);
      
      const { data: applicantProfile, error: applicantError } = await supabase
        .from('applicant_matching_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (applicantError || !applicantProfile) {
        throw new Error('Could not find your applicant profile. Please complete your applicant profile first.');
      }

      const requesterApplicantId = applicantProfile.id;
      console.log('✅ Found requester applicant profile ID:', requesterApplicantId);

      const recipientPeerSupportId = specialist.id;
      console.log('✅ Using specialist peer support profile ID:', recipientPeerSupportId);

      const { data: existingMatch } = await supabase
        .from('peer_support_matches')
        .select('id, status')
        .eq('applicant_id', requesterApplicantId)
        .eq('peer_support_id', recipientPeerSupportId)
        .single();

      if (existingMatch) {
        if (existingMatch.status === 'requested') {
          throw new Error('You have already sent a request to this specialist.');
        } else if (existingMatch.status === 'active') {
          throw new Error('You already have an active connection with this specialist.');
        }
      }

      const matchData = {
        applicant_id: requesterApplicantId,
        peer_support_id: recipientPeerSupportId,
        status: 'requested',
        message: `Hi ${specialist.first_name || 'there'}! I'm interested in connecting with you for peer support services. Your experience with ${specialist.specialties?.slice(0, 2).join(' and ') || 'recovery support'} aligns well with what I'm looking for in my recovery journey.

I would appreciate the opportunity to discuss how your support could help me in my recovery process.`,
        requested_by_id: requesterApplicantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📤 Creating peer_support_matches entry:', matchData);
      
      const { data: newMatch, error: matchError } = await supabase
        .from('peer_support_matches')
        .insert(matchData)
        .select()
        .single();
      
      if (matchError) {
        console.error('❌ Error creating peer support match:', matchError);
        throw new Error(matchError.message || 'Failed to send peer support request');
      }
      
      console.log('✅ Peer support match created successfully:', newMatch);
      
      setConnectionRequests(prev => new Set([...prev, specialistPeerProfileId]));
      
      alert(`Peer support request sent to ${specialist.first_name || 'the specialist'}! They will be notified and can respond through their dashboard.`);
      
      // Close modal if open
      setShowDetails(false);
      setSelectedSpecialist(null);
      
    } catch (err) {
      console.error('💥 Error sending peer support request:', err);
      alert(`Failed to send peer support request: ${err.message}. Please try again.`);
    }
  };

  const clearFilters = () => {
    setFilters({
      specialties: [],
      location: '',
      zipCode: '',
      minExperience: '',
      acceptingClients: true,
      recoveryMethods: [],
      spiritualAffiliation: '',
      serviceAreas: []
    });
  };

  const getConnectionStatus = (specialist) => {
    const specialistPeerProfileId = specialist.id;
    const hasRequest = connectionRequests.has(specialistPeerProfileId);
    const hasConnection = activeConnections.has(specialistPeerProfileId);
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

  const formatSpiritualAffiliation = (affiliation) => {
    if (!affiliation) return 'Not specified';
    const option = spiritualAffiliationOptions.find(opt => opt.value === affiliation);
    return option ? option.label : affiliation;
  };

  const getFilterCount = (filterType) => {
    switch (filterType) {
      case 'specialties':
        return filters.specialties.length;
      case 'recoveryMethods':
        return filters.recoveryMethods.length;
      case 'serviceAreas':
        return filters.serviceAreas.length;
      default:
        return 0;
    }
  };

  return (
    <>
      <div className="content">
        <div className={styles.headerSection}>
          <h1 className={styles.headerTitle}>Find Peer Support Specialists</h1>
          <p className={styles.headerSubtitle}>
            Connect with experienced peer support specialists who understand your recovery journey and can provide ongoing guidance and support.
          </p>
        </div>

        {/* Basic Filters - keeping all existing filter code */}
        <div className={styles.filtersSection}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                🔍 Search Filters
              </h3>
              <p className={styles.cardSubtitle}>
                Use these filters to find peer support specialists that match your needs
              </p>
            </div>
            
            <div className={styles.cardContent}>
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
                  <label className="label">Spiritual Affiliation (optional)</label>
                  <select
                    className="input"
                    value={filters.spiritualAffiliation}
                    onChange={(e) => handleFilterChange('spiritualAffiliation', e.target.value)}
                  >
                    <option value="">Any affiliation</option>
                    {spiritualAffiliationOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.quickActions}>
                <button
                  className="btn btn-outline"
                  onClick={handleShowNearby}
                  disabled={loading}
                >
                  🗺️ Find Nearby Specialists
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
            </div>
          </div>
        </div>

        {/* Expandable Filters - keeping all existing code */}
        <div className={styles.filtersSection}>
          <div className={styles.card}>
            <div 
              className={styles.cardHeader}
              onClick={() => toggleFilterExpansion('specialties')}
              style={{ cursor: 'pointer' }}
            >
              <h3 className={styles.cardTitle}>
                🎯 Specialties
                {getFilterCount('specialties') > 0 && (
                  <span className={styles.filterCount}>
                    {getFilterCount('specialties')} selected
                  </span>
                )}
              </h3>
              <div className={styles.expandIcon}>
                {expandedFilters.specialties ? '−' : '+'}
              </div>
            </div>
            
            {expandedFilters.specialties && (
              <div className={styles.cardContent}>
                <p className={styles.cardSubtitle}>
                  Select specialties that are important to you in your recovery journey
                </p>
                <div className={styles.gridAuto}>
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
            )}
          </div>
        </div>

        <div className={styles.filtersSection}>
          <div className={styles.card}>
            <div 
              className={styles.cardHeader}
              onClick={() => toggleFilterExpansion('recoveryMethods')}
              style={{ cursor: 'pointer' }}
            >
              <h3 className={styles.cardTitle}>
                🛠️ Recovery Methods
                {getFilterCount('recoveryMethods') > 0 && (
                  <span className={styles.filterCount}>
                    {getFilterCount('recoveryMethods')} selected
                  </span>
                )}
              </h3>
              <div className={styles.expandIcon}>
                {expandedFilters.recoveryMethods ? '−' : '+'}
              </div>
            </div>
            
            {expandedFilters.recoveryMethods && (
              <div className={styles.cardContent}>
                <p className={styles.cardSubtitle}>
                  Choose recovery methods you're interested in or currently using
                </p>
                <div className={styles.gridAuto}>
                  {recoveryMethodOptions.map(method => (
                    <div key={method} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`method-${method}`}
                        checked={filters.recoveryMethods.includes(method)}
                        onChange={(e) => handleRecoveryMethodChange(method, e.target.checked)}
                      />
                      <label htmlFor={`method-${method}`}>
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.filtersSection}>
          <div className={styles.card}>
            <div 
              className={styles.cardHeader}
              onClick={() => toggleFilterExpansion('serviceAreas')}
              style={{ cursor: 'pointer' }}
            >
              <h3 className={styles.cardTitle}>
                📍 Service Areas
                {getFilterCount('serviceAreas') > 0 && (
                  <span className={styles.filterCount}>
                    {getFilterCount('serviceAreas')} selected
                  </span>
                )}
              </h3>
              <div className={styles.expandIcon}>
                {expandedFilters.serviceAreas ? '−' : '+'}
              </div>
            </div>
            
            {expandedFilters.serviceAreas && (
              <div className={styles.cardContent}>
                <p className={styles.cardSubtitle}>
                  Select the types of service areas you prefer
                </p>
                <div className={styles.gridAuto}>
                  {serviceAreaOptions.map(area => (
                    <div key={area} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`area-${area}`}
                        checked={filters.serviceAreas.includes(area)}
                        onChange={(e) => handleServiceAreaChange(area, e.target.checked)}
                      />
                      <label htmlFor={`area-${area}`}>
                        {area}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Actions and Results - keeping all existing code */}
        <div className={styles.searchActionsSection}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.searchActions}>
                <button
                  className="btn btn-primary"
                  onClick={loadSpecialists}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.loadingSpinner}></span>
                      Searching...
                    </>
                  ) : (
                    '🔍 Search Specialists'
                  )}
                </button>
                
                <button
                  className="btn btn-outline"
                  onClick={clearFilters}
                  disabled={loading}
                >
                  Clear All Filters
                </button>
              </div>

              {(filters.specialties.length > 0 || filters.location || filters.zipCode || filters.minExperience || 
                filters.recoveryMethods.length > 0 || filters.spiritualAffiliation || filters.serviceAreas.length > 0) && (
                <div className={styles.activeFiltersDisplay}>
                  <div className={styles.activeFiltersTitle}>Active Filters:</div>
                  <div className={styles.activeFiltersList}>
                    {filters.location && <span className={styles.activeFilter}>📍 {filters.location}</span>}
                    {filters.zipCode && <span className={styles.activeFilter}>📮 {filters.zipCode}</span>}
                    {filters.minExperience && <span className={styles.activeFilter}>⭐ {filters.minExperience}+ years</span>}
                    {filters.specialties.length > 0 && <span className={styles.activeFilter}>🎯 {filters.specialties.length} specialties</span>}
                    {filters.recoveryMethods.length > 0 && <span className={styles.activeFilter}>🛠️ {filters.recoveryMethods.length} methods</span>}
                    {filters.spiritualAffiliation && <span className={styles.activeFilter}>🙏 {formatSpiritualAffiliation(filters.spiritualAffiliation)}</span>}
                    {filters.serviceAreas.length > 0 && <span className={styles.activeFilter}>📍 {filters.serviceAreas.length} areas</span>}
                    {filters.acceptingClients && <span className={styles.activeFilter}>✅ Accepting clients</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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

        {loading && (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size="large" text="Finding peer support specialists..." />
          </div>
        )}

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
                        {activeConnections.has(specialist.id) && (
                          <span className="badge badge-info">Connected</span>
                        )}
                        {connectionRequests.has(specialist.id) && !activeConnections.has(specialist.id) && (
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

                      {specialist.spiritual_affiliation && (
                        <div className={styles.experienceInfo}>
                          <div>
                            <span className={styles.experienceLabel}>Spiritual Background:</span>
                            <span className={styles.experienceValue}>
                              {formatSpiritualAffiliation(specialist.spiritual_affiliation)}
                            </span>
                          </div>
                        </div>
                      )}

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

                      {specialist.supported_recovery_methods?.length > 0 && (
                        <div className={styles.specialtiesSection}>
                          <div className="label mb-2">Recovery Methods</div>
                          <div className={styles.specialtiesList}>
                            {specialist.supported_recovery_methods.slice(0, 3).map((method, i) => (
                              <span key={i} className={styles.recoveryMethodBadge}>
                                {method}
                              </span>
                            ))}
                          </div>
                          {specialist.supported_recovery_methods.length > 3 && (
                            <div className={styles.moreSpecialities}>
                              +{specialist.supported_recovery_methods.length - 3} more
                            </div>
                          )}
                        </div>
                      )}

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

      {/* ✅ UPDATED: Use consolidated ProfileModal */}
      {showDetails && selectedSpecialist && (
        <ProfileModal
          isOpen={showDetails}
          profile={selectedSpecialist}
          connectionStatus={activeConnections.has(selectedSpecialist.id) ? 'active' : connectionRequests.has(selectedSpecialist.id) ? 'requested' : null}
          onClose={() => {
            setShowDetails(false);
            setSelectedSpecialist(null);
          }}
          onConnect={handleRequestConnection}
          showContactInfo={activeConnections.has(selectedSpecialist.id)}
          showActions={!activeConnections.has(selectedSpecialist.id) && !connectionRequests.has(selectedSpecialist.id)}
          isAwaitingApproval={false}
        />
      )}
    </>
  );
};

export default PeerSupportFinder;