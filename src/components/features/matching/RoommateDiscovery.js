// src/components/features/matching/RoommateDiscovery.js - UPDATED: Group-aware requests
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import matchingService from '../../../utils/matching/matchingService';
import createMatchGroupsService from '../../../utils/database/matchGroupsService';
import { supabase } from '../../../utils/supabase';
import { DEFAULT_FILTERS } from '../../../utils/matching/config';

// Import new components
import MatchCard from './components/MatchCard';
import ProfileModal from '../connections/ProfileModal';
import LoadingSpinner from '../../ui/LoadingSpinner';

// Import CSS foundation and component module
import '../../../styles/main.css';
import styles from './RoommateDiscovery.module.css';

const RoommateDiscovery = ({ onRequestMatch, onBack }) => {
  const { user, profile, hasRole } = useAuth();

  // Initialize match groups service
  const matchGroupsService = createMatchGroupsService(supabase);

  // State management
  const [matches, setMatches] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [excludedCount, setExcludedCount] = useState(0);
  const [sentRequestsCount, setSentRequestsCount] = useState(0);

  const [filters, setFilters] = useState({
    minScore: DEFAULT_FILTERS.minScore,
    recovery_stage: '',
    age_range: '',
    location: '',
    hideAlreadyMatched: DEFAULT_FILTERS.hideAlreadyMatched,
    hideRequestsSent: DEFAULT_FILTERS.hideRequestsSent
  });

  useEffect(() => {
    if (user?.id && profile?.id) {
      findMatches();
    }
  }, [profile?.id, filters]);

  const getUserLocation = useCallback((profile) => {
    if (!profile) return null;
    
    if (profile.primary_city && profile.primary_state) {
      return `${profile.primary_city}, ${profile.primary_state}`;
    }
    
    return profile.primary_location || null;
  }, []);

  const findMatches = useCallback(async () => {
    if (!user?.id || !profile?.id) {
      setError('No authenticated user found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Finding roommate matches with schema-aligned filters...');
      
      const dbFilters = {
        minScore: filters.minScore,
        recovery_stage: filters.recovery_stage,
        age_range: filters.age_range,
        location: filters.location,
        hideAlreadyMatched: filters.hideAlreadyMatched,
        hideRequestsSent: filters.hideRequestsSent
      };
      
      const result = await matchingService.findMatches(profile.id, dbFilters);
      
      setMatches(result.matches);
      setUserProfile(result.userProfile);
      setExcludedCount(result.excludedCount);
      setSentRequestsCount(result.sentRequestsCount);
      
      console.log(`✅ Loaded ${result.matches.length} matches with schema-aligned data`);
      
    } catch (err) {
      console.error('💥 Error finding matches:', err);
      setError(err.message || 'Failed to find matches');
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Handle showing match details with ProfileModal format
   */
  const handleShowDetails = useCallback((match) => {
    // Transform match data to profile format expected by ProfileModal
    const profileData = {
      ...match,
      profile_type: 'applicant',
      name: `${match.first_name || ''} ${match.last_name || ''}`.trim()
    };
    
    setSelectedMatch(profileData);
    setShowDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedMatch(null);
  }, []);

  /**
   * ✅ UPDATED: Smart request handling - checks for existing groups
   */
  const handleRequestMatch = useCallback(async (match) => {
    try {
          console.log('🔍 DEBUG: user object:', user);
    console.log('🔍 DEBUG: user.id:', user.id);
    console.log('🔍 DEBUG: profile object:', profile);
    console.log('🔍 DEBUG: profile.id:', profile.id);
      console.log('🤝 Sending roommate match request to:', match.first_name);
      
      const matchUserId = match.user_id || match.id;
      
      // Get current user's applicant profile ID
      const { data: applicantProfile, error: profileError } = await supabase
        .from('applicant_matching_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !applicantProfile) {
        throw new Error('Could not find your applicant profile');
      }

      const currentUserId = applicantProfile.id;

      // ✅ NEW: Check if user is already in an active group
      console.log('🔍 Checking for existing active group...');
      const existingGroupResult = await matchGroupsService.findActiveGroupForUser(currentUserId);
      
      if (existingGroupResult.success && existingGroupResult.data) {
        // User is already in a group - invite this match to join
        const existingGroup = existingGroupResult.data;
        console.log('🏠 User is in an existing group:', existingGroup.id);
        console.log(`📊 Current group has ${existingGroup.roommate_ids?.length || 0} members`);
        
        // Get the target match's applicant profile ID
        const { data: targetProfile, error: targetError } = await supabase
          .from('applicant_matching_profiles')
          .select('id')
          .eq('user_id', matchUserId)
          .single();
        
        if (targetError || !targetProfile) {
          throw new Error('Could not find target user profile');
        }

        const targetUserId = targetProfile.id;
        
        // Invite the target user to join the existing group
        console.log('📤 Inviting to existing group...');
        const inviteResult = await matchGroupsService.inviteMemberToGroup(
          existingGroup.id,
          currentUserId,
          targetUserId
        );
        
        if (!inviteResult.success) {
          throw new Error(inviteResult.error?.message || 'Failed to invite to group');
        }
        
        console.log('✅ Successfully invited to existing group');
        alert(`${match.first_name} has been invited to join your roommate group! Your existing group members will also need to approve.`);
        
      } else {
        // No existing group - create new 2-person request
        console.log('ℹ️ No existing group found, creating new roommate request');
        
        const result = await matchingService.sendMatchRequest(profile.id, {
          ...match,
          user_id: matchUserId
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to send match request');
        }
        
        console.log('✅ New roommate request created successfully');
        alert(`Roommate request sent to ${match.first_name}!`);
      }
      
      // Update UI state
      setMatches(prev => prev.map(m => 
        (m.user_id === matchUserId || m.id === matchUserId)
          ? { ...m, isRequestSent: true }
          : m
      ));
      
      setSentRequestsCount(prev => prev + 1);
      
      if (onRequestMatch) {
        await onRequestMatch(match);
      }
      
      if (filters.hideRequestsSent) {
        setTimeout(() => findMatches(), 1000);
      }
      
    } catch (err) {
      console.error('💥 Error sending match request:', err);
      alert(`Failed to send match request: ${err.message}`);
    }
  }, [user?.id, profile?.id, onRequestMatch, filters.hideRequestsSent, findMatches, matchGroupsService]);

  const handleUseMyLocation = useCallback(() => {
    const userLocation = getUserLocation(userProfile);
    
    if (userLocation) {
      setFilters(prev => ({ 
        ...prev, 
        location: userLocation 
      }));
    } else {
      alert('No location found in your profile. Please update your matching profile with your preferred city and state.');
    }
  }, [userProfile, getUserLocation]);

  const handleRefreshMatches = useCallback(async () => {
    console.log('🔄 Force refreshing matches...');
    matchingService.clearCache();
    await findMatches();
  }, [findMatches]);

  const renderFilterControls = () => (
    <div className="card mb-5">
      <h3 className="card-title">Search Filters</h3>
      
      <div className={styles.filterRowPrimary}>
        <div className="form-group">
          <label className="label">Min Compatibility</label>
          <select
            className="input"
            value={filters.minScore}
            onChange={(e) => handleFilterChange({ minScore: Number(e.target.value) })}
          >
            {DEFAULT_FILTERS.MIN_SCORES.map(score => (
              <option key={score} value={score}>{score}% or higher</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="label">Recovery Stage</label>
          <select
            className="input"
            value={filters.recovery_stage}
            onChange={(e) => handleFilterChange({ recovery_stage: e.target.value })}
          >
            <option value="">Any stage</option>
            {DEFAULT_FILTERS.RECOVERY_STAGES.map(stage => (
              <option key={stage} value={stage}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)} recovery
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Age Range</label>
          <select
            className="input"
            value={filters.age_range}
            onChange={(e) => handleFilterChange({ age_range: e.target.value })}
          >
            <option value="">Any age</option>
            {DEFAULT_FILTERS.AGE_RANGES.map(range => (
              <option 
                key={range.label} 
                value={`${range.min}-${range.max}`}
              >
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Location</label>
          <input
            className="input"
            type="text"
            placeholder="City, State"
            value={filters.location}
            onChange={(e) => handleFilterChange({ location: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.filterActions}>
        <button
          className="btn btn-primary"
          onClick={findMatches}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Roommates'}
        </button>

        <button
          className="btn btn-outline"
          onClick={handleUseMyLocation}
          disabled={loading || !getUserLocation(userProfile)}
        >
          Use My Location
        </button>

        <button
          className="btn btn-outline"
          onClick={handleRefreshMatches}
          disabled={loading}
        >
          Refresh Results
        </button>
      </div>

      <div className={styles.filterOptions}>
        <div className="checkbox-item">
          <input
            type="checkbox"
            id="hide-matched"
            checked={filters.hideAlreadyMatched}
            onChange={(e) => handleFilterChange({ hideAlreadyMatched: e.target.checked })}
          />
          <label htmlFor="hide-matched">
            Hide users I'm already connected with
          </label>
        </div>

        <div className="checkbox-item">
          <input
            type="checkbox"
            id="hide-requests"
            checked={filters.hideRequestsSent}
            onChange={(e) => handleFilterChange({ hideRequestsSent: e.target.checked })}
          />
          <label htmlFor="hide-requests">
            Hide users I've already contacted
          </label>
        </div>
      </div>

      {(filters.minScore > DEFAULT_FILTERS.minScore || filters.recovery_stage || 
        filters.age_range || filters.location || !filters.hideAlreadyMatched || 
        !filters.hideRequestsSent) && (
        <div className={styles.activeFiltersDisplay}>
          <div className={styles.activeFiltersTitle}>Active Filters:</div>
          <div className={styles.activeFiltersList}>
            {filters.minScore > DEFAULT_FILTERS.minScore && ` Min Compatibility: ${filters.minScore}% •`}
            {filters.recovery_stage && ` Recovery: ${filters.recovery_stage} •`}
            {filters.age_range && ` Age: ${filters.age_range} •`}
            {filters.location && ` Location: ${filters.location} •`}
            {!filters.hideAlreadyMatched && ` Including connected users •`}
            {!filters.hideRequestsSent && ` Including contacted users`}
          </div>
        </div>
      )}
    </div>
  );

  const renderMatches = () => {
    if (loading) {
      return (
        <div className={styles.loadingMatchesContainer}>
          <LoadingSpinner message="Finding your perfect roommate matches..." />
          <div className={styles.loadingMatchesText}>
            Analyzing compatibility scores and preferences...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorCard}>
          <div className="alert alert-error">
            <h4 className={styles.errorTitle}>Error Loading Matches</h4>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              className="btn btn-outline"
              onClick={() => {
                setError(null);
                findMatches();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (matches.length === 0) {
      return (
        <div className={styles.noMatchesCard}>
          <h3 className={styles.noMatchesTitle}>No matches found</h3>
          <p className={styles.noMatchesMessage}>
            Try adjusting your filters or check back later for new applicants.
          </p>
          
          {(excludedCount > 0 || sentRequestsCount > 0) && (
            <div className={styles.exclusionStats}>
              <strong>Hidden from search:</strong>
              {excludedCount > 0 && ` ${excludedCount} already connected`}
              {excludedCount > 0 && sentRequestsCount > 0 && ` • `}
              {sentRequestsCount > 0 && ` ${sentRequestsCount} pending requests`}
            </div>
          )}
          
          <div className={styles.searchExpansionActions}>
            <button
              className="btn btn-primary"
              onClick={() => handleFilterChange({ 
                minScore: 30, 
                recovery_stage: '',
                age_range: '',
                location: ''
              })}
            >
              Expand Search Criteria
            </button>
            
            <button
              className={`btn btn-outline ${styles.ml2}`}
              onClick={() => handleFilterChange({ 
                hideAlreadyMatched: false,
                hideRequestsSent: false 
              })}
            >
              Show All Users
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="card mb-4">
          <div className={styles.matchResultsHeader}>
            <h3 className="card-title">
              {matches.length} Compatible Roommate{matches.length !== 1 ? 's' : ''} Found
            </h3>
            <div className={styles.matchResultsStats}>
              {excludedCount > 0 && `${excludedCount} connected users hidden`}
              {excludedCount > 0 && sentRequestsCount > 0 && ` • `}
              {sentRequestsCount > 0 && `${sentRequestsCount} pending requests hidden`}
            </div>
          </div>
        </div>

        <div className={styles.matchesGrid}>
          {matches.map((match) => (
            <MatchCard
              key={match.user_id || match.id}
              match={match}
              onShowDetails={handleShowDetails}
              onRequestMatch={handleRequestMatch}
              isRequestSent={match.isRequestSent}
              isAlreadyMatched={match.isAlreadyMatched}
            />
          ))}
        </div>
       </>
    );
  };

  if (!hasRole('applicant')) {
    return (
      <div className="content">
        <div className="card text-center">
          <h3>Access Denied</h3>
          <p>You must be registered as an applicant to discover roommates.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/app'}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile && !loading && !error) {
    return (
      <div className="content">
        <div className="card text-center">
          <h3>Profile Required</h3>
          <p>Please complete your matching profile before finding roommates.</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/app/profile/matching'}
          >
            Complete Matching Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="content">
        <div className={styles.discoveryHeader}>
          <h1 className={styles.discoveryTitle}>Find Your Perfect Roommate</h1>
          <p className={styles.discoverySubtitle}>
            Discover compatible roommates based on recovery goals, lifestyle preferences, and personal compatibility
          </p>
          
          {userProfile && getUserLocation(userProfile) && (
            <div className={styles.userLocationInfo}>
              <small>Your preferred location: <strong>{getUserLocation(userProfile)}</strong></small>
            </div>
          )}
        </div>
        
        {renderFilterControls()}
        
        {renderMatches()}
        
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
      
      {/* Use consolidated ProfileModal */}
      {showDetails && selectedMatch && (
        <ProfileModal
          isOpen={showDetails}
          profile={selectedMatch}
          connectionStatus={selectedMatch.isAlreadyMatched ? 'active' : selectedMatch.isRequestSent ? 'requested' : null}
          onClose={handleCloseDetails}
          onConnect={handleRequestMatch}
          showContactInfo={false}
          showActions={!selectedMatch.isAlreadyMatched && !selectedMatch.isRequestSent}
          isAwaitingApproval={false}
        />
      )}
    </>
  );
};

export default RoommateDiscovery;