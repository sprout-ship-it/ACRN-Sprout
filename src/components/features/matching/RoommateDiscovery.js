// src/components/features/matching/RoommateDiscovery.js - SCHEMA ALIGNED
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import matchingService from '../../../utils/matching/matchingService';
import { DEFAULT_FILTERS } from '../../../utils/matching/config';

// Import new components
import MatchCard from './components/MatchCard';
import MatchDetailsModal from './components/MatchDetailsModal';
import LoadingSpinner from '../../ui/LoadingSpinner';

// Import CSS foundation and component module
import '../../../styles/main.css';
import styles from './RoommateDiscovery.module.css';

const RoommateDiscovery = ({ onRequestMatch, onBack }) => {
  const { user, hasRole } = useAuth();

  // State management
  const [matches, setMatches] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [excludedCount, setExcludedCount] = useState(0);
  const [sentRequestsCount, setSentRequestsCount] = useState(0);

  // ✅ SCHEMA ALIGNED: Filter state using database field names
  const [filters, setFilters] = useState({
    minScore: DEFAULT_FILTERS.minScore,
    recovery_stage: '',  // ✅ FIXED: Use snake_case to match database
    age_range: '',       // ✅ FIXED: Use snake_case to match database  
    location: '',        // Will be handled specially for primary_city/primary_state
    hideAlreadyMatched: DEFAULT_FILTERS.hideAlreadyMatched,
    hideRequestsSent: DEFAULT_FILTERS.hideRequestsSent
  });

  // Load matches when component mounts or filters change
  useEffect(() => {
    if (user?.id) {
      findMatches();
    }
  }, [user?.id, filters]);

  /**
   * ✅ SCHEMA ALIGNED: Construct user location from primary_city and primary_state
   */
  const getUserLocation = useCallback((profile) => {
    if (!profile) return null;
    
    // Construct location from schema fields (primary_location is generated)
    if (profile.primary_city && profile.primary_state) {
      return `${profile.primary_city}, ${profile.primary_state}`;
    }
    
    // Fallback to generated primary_location if available
    return profile.primary_location || null;
  }, []);

  /**
   * Find roommate matches using the matching service
   */
  const findMatches = useCallback(async () => {
    if (!user?.id) {
      setError('No authenticated user found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Finding roommate matches with schema-aligned filters...');
      
      // ✅ SCHEMA ALIGNED: Convert filters to database field names
      const dbFilters = {
        minScore: filters.minScore,
        recovery_stage: filters.recovery_stage,  // Database field name
        age_range: filters.age_range,            // Database field name
        location: filters.location,
        hideAlreadyMatched: filters.hideAlreadyMatched,
        hideRequestsSent: filters.hideRequestsSent
      };
      
      const result = await matchingService.findMatches(user.id, dbFilters);
      
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

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Handle showing match details
   */
  const handleShowDetails = useCallback((match) => {
    setSelectedMatch(match);
    setShowDetails(true);
  }, []);

  /**
   * Handle closing match details
   */
  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedMatch(null);
  }, []);

  /**
   * ✅ SCHEMA ALIGNED: Handle sending a match request with proper user identification
   */
  const handleRequestMatch = useCallback(async (match) => {
    try {
      console.log('🤝 Sending roommate match request to:', match.first_name);
      
      // ✅ SCHEMA ALIGNED: Ensure we're using the correct user identification
      const matchUserId = match.user_id || match.id; // Handle different ID structures
      
      const result = await matchingService.sendMatchRequest(user.id, {
        ...match,
        user_id: matchUserId
      });
      
      if (result.success) {
        alert(`Roommate request sent to ${match.first_name}!`);
        
        // Update local state to reflect sent request
        setMatches(prev => prev.map(m => 
          (m.user_id === matchUserId || m.id === matchUserId)
            ? { ...m, isRequestSent: true }
            : m
        ));
        
        // Update sent requests count
        setSentRequestsCount(prev => prev + 1);
        
        // Call parent callback if provided
        if (onRequestMatch) {
          await onRequestMatch(match);
        }
        
        // Refresh matches if hiding sent requests
        if (filters.hideRequestsSent) {
          setTimeout(() => findMatches(), 1000);
        }
        
      } else {
        throw new Error(result.error || 'Failed to send match request');
      }
      
    } catch (err) {
      console.error('💥 Error sending match request:', err);
      alert('Failed to send match request. Please try again.');
    }
  }, [user?.id, onRequestMatch, filters.hideRequestsSent, findMatches]);

  /**
   * ✅ SCHEMA ALIGNED: Handle using user's location constructed from primary_city/primary_state
   */
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

  /**
   * Handle refreshing matches
   */
  const handleRefreshMatches = useCallback(async () => {
    console.log('🔄 Force refreshing matches...');
    matchingService.clearCache();
    await findMatches();
  }, [findMatches]);

  /**
   * ✅ SCHEMA ALIGNED: Render filter controls with database field names
   */
  const renderFilterControls = () => (
    <div className="card mb-5">
      <h3 className="card-title">Search Filters</h3>
      
      {/* Primary filters using CSS module */}
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
            value={filters.recovery_stage} // ✅ FIXED: Use database field name
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
            value={filters.age_range} // ✅ FIXED: Use database field name
            onChange={(e) => handleFilterChange({ age_range: e.target.value })}
          >
            <option value="">Any age</option>
            {DEFAULT_FILTERS.AGE_RANGES.map(range => (
              <option key={range} value={range}>{range}</option>
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

      {/* Action buttons using CSS module */}
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
          disabled={loading || !getUserLocation(userProfile)} // ✅ FIXED: Use constructed location
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

      {/* Exclusion options using CSS module */}
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

      {/* ✅ SCHEMA ALIGNED: Active filters display with database field names */}
      {(filters.minScore > DEFAULT_FILTERS.minScore || filters.recovery_stage || 
        filters.age_range || filters.location || !filters.hideAlreadyMatched || 
        !filters.hideRequestsSent) && (
        <div className={styles.activeFiltersDisplay}>
          <div className={styles.activeFiltersTitle}>Active Filters:</div>
          <div className={styles.activeFiltersList}>
            {filters.minScore > DEFAULT_FILTERS.minScore && ` Min Compatibility: ${filters.minScore}% •`}
            {filters.recovery_stage && ` Recovery: ${filters.recovery_stage} •`} {/* ✅ FIXED */}
            {filters.age_range && ` Age: ${filters.age_range} •`} {/* ✅ FIXED */}
            {filters.location && ` Location: ${filters.location} •`}
            {!filters.hideAlreadyMatched && ` Including connected users •`}
            {!filters.hideRequestsSent && ` Including contacted users`}
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Render matches results
   */
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
          
          {/* Show exclusion stats when no matches found */}
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
                recovery_stage: '',  // ✅ FIXED: Use database field name
                age_range: '',       // ✅ FIXED: Use database field name
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
        {/* Results header using CSS module */}
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

        {/* Match cards grid using CSS module */}
        <div className={styles.matchesGrid}>
          {matches.map((match) => (
            <MatchCard
              key={match.user_id || match.id} // ✅ FIXED: Handle different ID structures
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

  // Check authorization
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

  // ✅ SCHEMA ALIGNED: Show error if no user profile using constructed location
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
        {/* Header using CSS module */}
        <div className={styles.discoveryHeader}>
          <h1 className={styles.discoveryTitle}>Find Your Perfect Roommate</h1>
          <p className={styles.discoverySubtitle}>
            Discover compatible roommates based on recovery goals, lifestyle preferences, and personal compatibility
          </p>
          
          {/* ✅ SCHEMA ALIGNED: Show user location info if available */}
          {userProfile && getUserLocation(userProfile) && (
            <div className={styles.userLocationInfo}>
              <small>Your preferred location: <strong>{getUserLocation(userProfile)}</strong></small>
            </div>
          )}
        </div>
        
        {/* Filter Controls */}
        {renderFilterControls()}
        
        {/* Matches Results */}
        {renderMatches()}
        
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
      
      {/* Match Details Modal */}
      {showDetails && selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          onClose={handleCloseDetails}
          onRequestMatch={handleRequestMatch}
          isRequestSent={selectedMatch.isRequestSent}
          isAlreadyMatched={selectedMatch.isAlreadyMatched}
          usePortal={true}
          debugMode={true}
        />
      )}
    </>
  );
};

export default RoommateDiscovery;