// src/components/features/matching/RoommateDiscovery.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { matchingService } from '../../../utils/matching/matchingService';
import { DEFAULT_FILTERS } from '../../../utils/matching/config';

// Import new components
import MatchCard from './components/MatchCard';
import MatchDetailsModal from './components/MatchDetailsModal';
import LoadingSpinner from '../../ui/LoadingSpinner';
import StackingDebug from '../../debug/StackingDebug';

import '../../../styles/global.css';

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

  // Filter state
  const [filters, setFilters] = useState({
    minScore: DEFAULT_FILTERS.minScore,
    recoveryStage: '',
    ageRange: '',
    location: '',
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
      console.log('🔍 Finding roommate matches...');
      
      const result = await matchingService.findMatches(user.id, filters);
      
      setMatches(result.matches);
      setUserProfile(result.userProfile);
      setExcludedCount(result.excludedCount);
      setSentRequestsCount(result.sentRequestsCount);
      
      console.log(`✅ Loaded ${result.matches.length} matches`);
      
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
   * Handle sending a match request
   */
  const handleRequestMatch = useCallback(async (match) => {
    try {
      console.log('🤝 Sending roommate match request to:', match.first_name);
      
      const result = await matchingService.sendMatchRequest(user.id, match);
      
      if (result.success) {
        alert(`Roommate request sent to ${match.first_name}!`);
        
        // Update local state to reflect sent request
        setMatches(prev => prev.map(m => 
          m.user_id === match.user_id 
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
   * Handle using user's location for search
   */
  const handleUseMyLocation = useCallback(() => {
    if (userProfile?.location) {
      setFilters(prev => ({ 
        ...prev, 
        location: userProfile.location 
      }));
    } else {
      alert('No location found in your profile. Please update your matching profile with your preferred location.');
    }
  }, [userProfile?.location]);

  /**
   * Handle refreshing matches
   */
  const handleRefreshMatches = useCallback(async () => {
    console.log('🔄 Force refreshing matches...');
    matchingService.clearCache();
    await findMatches();
  }, [findMatches]);

  /**
   * Render filter controls
   */
  const renderFilterControls = () => (
    <div className="card mb-5">
      <h3 className="card-title">Search Filters</h3>
      
      {/* Primary filters */}
      <div className="filter-row-primary mb-4">
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
            value={filters.recoveryStage}
            onChange={(e) => handleFilterChange({ recoveryStage: e.target.value })}
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
            value={filters.ageRange}
            onChange={(e) => handleFilterChange({ ageRange: e.target.value })}
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

      {/* Action buttons */}
      <div className="filter-actions mb-4">
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
          disabled={loading || !userProfile?.location}
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

      {/* Exclusion options */}
      <div className="filter-options">
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

      {/* Active filters display */}
      {(filters.minScore > DEFAULT_FILTERS.minScore || filters.recoveryStage || 
        filters.ageRange || filters.location || !filters.hideAlreadyMatched || 
        !filters.hideRequestsSent) && (
        <div className="alert alert-info mt-3">
          <strong>Active Filters:</strong> 
          {filters.minScore > DEFAULT_FILTERS.minScore && ` Min Compatibility: ${filters.minScore}% •`}
          {filters.recoveryStage && ` Recovery: ${filters.recoveryStage} •`}
          {filters.ageRange && ` Age: ${filters.ageRange} •`}
          {filters.location && ` Location: ${filters.location} •`}
          {!filters.hideAlreadyMatched && ` Including connected users •`}
          {!filters.hideRequestsSent && ` Including contacted users`}
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
        <div className="empty-state">
          <LoadingSpinner message="Finding your perfect roommate matches..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className="card mb-5">
          <div className="alert alert-error">
            <h4>Error Loading Matches</h4>
            <p>{error}</p>
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
        <div className="card text-center">
          <h3>No matches found</h3>
          <p>Try adjusting your filters or check back later for new applicants.</p>
          
          {/* Show exclusion stats when no matches found */}
          {(excludedCount > 0 || sentRequestsCount > 0) && (
            <div className="alert alert-info mt-3 mb-3">
              <strong>Hidden from search:</strong>
              {excludedCount > 0 && ` ${excludedCount} already connected`}
              {excludedCount > 0 && sentRequestsCount > 0 && ` • `}
              {sentRequestsCount > 0 && ` ${sentRequestsCount} pending requests`}
            </div>
          )}
          
          <div className="mt-3">
            <button
              className="btn btn-primary"
              onClick={() => handleFilterChange({ 
                minScore: 30, 
                recoveryStage: '', 
                ageRange: '', 
                location: ''
              })}
            >
              Expand Search Criteria
            </button>
            
            <button
              className="btn btn-outline ml-2"
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
        {/* Results header */}
        <div className="card mb-4">
          <div className="match-results-header">
            <h3 className="card-title">
              {matches.length} Compatible Roommate{matches.length !== 1 ? 's' : ''} Found
            </h3>
            <div className="text-gray-600 text-sm">
              {excludedCount > 0 && `${excludedCount} connected users hidden`}
              {excludedCount > 0 && sentRequestsCount > 0 && ` • `}
              {sentRequestsCount > 0 && `${sentRequestsCount} pending requests hidden`}
            </div>
          </div>
        </div>

        {/* Match cards grid */}
        <div className="matches-grid mb-5">
          {matches.map((match) => (
            <MatchCard
              key={match.user_id}
              match={match}
              onShowDetails={handleShowDetails}
              onRequestMatch={handleRequestMatch}
              isRequestSent={match.isRequestSent}
              isAlreadyMatched={match.isAlreadyMatched}
            />
          ))}
        </div>
        <StackingDebug enabled={true} />
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

  // Show error if no user profile
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
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="welcome-title">Find Your Perfect Roommate</h1>
          <p className="welcome-text">
            Discover compatible roommates based on recovery goals, lifestyle preferences, and personal compatibility
          </p>
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