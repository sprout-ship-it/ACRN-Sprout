import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/supabase';
import { useMatchingProfile } from '../../hooks/useSupabase';
import { calculateDetailedCompatibility } from '../../utils/matching/algorithm';
import { generateDetailedFlags } from '../../utils/matching/compatibility';
import '../../styles/global.css';

// ==================== DATA TRANSFORMATION HELPERS ====================

/**
 * Transform database record to algorithm-compatible format
 */
const transformProfileForAlgorithm = (dbProfile) => {
  if (!dbProfile) return null;

  // Calculate age from date_of_birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Create the transformed profile
  const transformed = {
    // Basic info
    id: dbProfile.id,
    user_id: dbProfile.user_id,
    
    // Personal details
    age: calculateAge(dbProfile.date_of_birth),
    gender: dbProfile.gender,
    
    // Location - use preferred_location or city as fallback
    location: dbProfile.preferred_location || dbProfile.city || 'Not specified',
    
    // Budget
    budget_max: dbProfile.budget_max,
    price_range: {
      min: dbProfile.price_range_min || 0,
      max: dbProfile.price_range_max || dbProfile.budget_max || 5000
    },
    
    // Recovery info
    recovery_stage: dbProfile.recovery_stage,
    recovery_methods: dbProfile.recovery_methods || [],
    program_type: dbProfile.program_type || [],
    primary_issues: dbProfile.primary_issues || [],
    sobriety_date: dbProfile.sobriety_date,
    
    // Lifestyle
    cleanliness_level: dbProfile.cleanliness_level || 3,
    noise_level: dbProfile.noise_level || 3,
    social_level: dbProfile.social_level || 3,
    work_schedule: dbProfile.work_schedule,
    bedtime_preference: dbProfile.bedtime_preference,
    
    // Preferences
    preferred_roommate_gender: dbProfile.preferred_roommate_gender,
    gender_preference: dbProfile.gender_preference,
    smoking_status: dbProfile.smoking_status,
    smoking_preference: dbProfile.smoking_preference,
    
    // Housing
    housing_type: dbProfile.housing_type || [],
    housing_subsidy: dbProfile.housing_subsidy || [],
    
    // Social preferences
    pets_owned: dbProfile.pets_owned,
    pets_comfortable: dbProfile.pets_comfortable,
    overnight_guests_ok: dbProfile.overnight_guests_ok,
    shared_groceries: dbProfile.shared_groceries,
    guests_policy: dbProfile.guests_policy,
    
    // Personal
    interests: dbProfile.interests || [],
    spiritual_affiliation: dbProfile.spiritual_affiliation,
    about_me: dbProfile.about_me,
    looking_for: dbProfile.looking_for,
    
    // Profile metadata
    is_active: dbProfile.is_active,
    profile_completed: dbProfile.profile_completed,
    
    // Include registrant_profiles data if available
    first_name: dbProfile.registrant_profiles?.first_name || 'Anonymous',
    email: dbProfile.registrant_profiles?.email
  };

  return transformed;
};

/**
 * Generate display-friendly compatibility information
 */
const generateDisplayInfo = (userProfile, candidateProfile) => {
  const compatibility = calculateDetailedCompatibility(userProfile, candidateProfile);
  const flags = generateDetailedFlags(userProfile, candidateProfile, compatibility.score_breakdown);
  
  return {
    matchScore: compatibility.compatibility_score,
    breakdown: compatibility.score_breakdown,
    greenFlags: flags.green || [],
    redFlags: flags.red || [],
    compatibility
  };
};

// ==================== MATCH FINDER COMPONENT ====================

const MatchFinder = ({ onRequestMatch, onBack }) => {
  const { user, profile } = useAuth();
  const { getActiveProfiles, getMatchingProfile } = useMatchingProfile();
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [userMatchingProfile, setUserMatchingProfile] = useState(null);
  const [excludedUsers, setExcludedUsers] = useState(new Set()); // ✅ NEW: Track excluded users
  const [sentRequests, setSentRequests] = useState(new Set()); // ✅ NEW: Track sent requests
  const [filters, setFilters] = useState({
    recoveryStage: '',
    ageRange: '',
    minScore: 40,
    location: '',
    hideAlreadyMatched: true, // ✅ NEW: Option to hide already matched users
    hideRequestsSent: true    // ✅ NEW: Option to hide users already contacted
  });
  
  // Load user's own matching profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);
  
  // Load exclusions and matches when user profile is available
  useEffect(() => {
    if (userMatchingProfile) {
      loadExcludedUsers();
      loadSentRequests();
      findMatches();
    }
  }, [userMatchingProfile, filters]);
  
  /**
   * Load current user's matching profile
   */
  const loadUserProfile = async () => {
    if (!user?.id) {
      setError('No authenticated user found');
      return;
    }
    
    try {
      console.log('🔍 Loading user matching profile...');
      const result = await getMatchingProfile(user.id);
      
      if (result.success && result.data) {
        const transformedProfile = transformProfileForAlgorithm(result.data);
        setUserMatchingProfile(transformedProfile);
        console.log('✅ User profile loaded:', transformedProfile);
      } else {
        setError('Please complete your matching profile first');
        console.warn('❌ No matching profile found for user');
      }
    } catch (err) {
      console.error('💥 Error loading user profile:', err);
      setError('Failed to load your profile');
    }
  };

  /**
   * ✅ NEW: Load users that should be excluded from matching
   */
  const loadExcludedUsers = async () => {
    if (!user?.id) return;

    try {
      console.log('🚫 Loading excluded users...');
      
      // Get all match requests and active match groups for current user
      const [requestsResult, groupsResult] = await Promise.all([
        db.matchRequests.getByUserId(user.id),
        db.matchGroups ? db.matchGroups.getByUserId(user.id) : { data: [] }
      ]);

      const excludedUserIds = new Set();

      // Exclude users from match requests
      if (requestsResult.success !== false && requestsResult.data) {
        requestsResult.data.forEach(request => {
          // Exclude users with accepted roommate matches
          if (request.request_type === 'roommate' && request.status === 'accepted') {
            const otherUserId = request.requester_id === user.id ? request.target_id : request.requester_id;
            excludedUserIds.add(otherUserId);
          }
        });
      }

      // Exclude users from active match groups
      if (groupsResult.data) {
        groupsResult.data.forEach(group => {
          if (group.status === 'active' || group.status === 'forming') {
            // Add both applicants from the group
            if (group.applicant_1_id && group.applicant_1_id !== user.id) {
              excludedUserIds.add(group.applicant_1_id);
            }
            if (group.applicant_2_id && group.applicant_2_id !== user.id) {
              excludedUserIds.add(group.applicant_2_id);
            }
          }
        });
      }

      console.log(`🚫 Found ${excludedUserIds.size} users to exclude from matching`);
      setExcludedUsers(excludedUserIds);

    } catch (err) {
      console.error('💥 Error loading excluded users:', err);
      // Don't fail the whole component, just log the error
    }
  };

  /**
   * ✅ NEW: Load sent match requests to show status
   */
  const loadSentRequests = async () => {
    if (!user?.id) return;

    try {
      const result = await db.matchRequests.getByUserId(user.id);
      
      if (result.success !== false && result.data) {
        const sentRequestIds = new Set(
          result.data
            .filter(req => req.requester_id === user.id && req.request_type === 'roommate')
            .map(req => req.target_id)
        );
        setSentRequests(sentRequestIds);
        console.log(`📤 Found ${sentRequestIds.size} sent match requests`);
      }
    } catch (err) {
      console.error('💥 Error loading sent requests:', err);
    }
  };
  
  /**
   * ✅ IMPROVED: Find compatible matches with exclusion logic
   */
  const findMatches = async () => {
    if (!userMatchingProfile) {
      console.warn('⚠️ No user profile available for matching');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Finding matches with exclusions...');
      
      // Get active profiles from Supabase (excluding current user)
      const result = await getActiveProfiles();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load profiles');
      }
      
      const rawCandidates = result.data || [];
      console.log(`📊 Found ${rawCandidates.length} active profiles`);
      
      if (rawCandidates.length === 0) {
        setMatches([]);
        return;
      }
      
      // Transform all candidates to algorithm format
      let transformedCandidates = rawCandidates
        .map(transformProfileForAlgorithm)
        .filter(candidate => candidate && candidate.profile_completed);
      
      console.log(`🔄 Transformed ${transformedCandidates.length} completed profiles`);

      // ✅ NEW: Apply exclusion filters
      if (filters.hideAlreadyMatched) {
        const beforeExclusion = transformedCandidates.length;
        transformedCandidates = transformedCandidates.filter(candidate => 
          !excludedUsers.has(candidate.user_id)
        );
        console.log(`🚫 Excluded already matched: ${beforeExclusion} -> ${transformedCandidates.length}`);
      }

      if (filters.hideRequestsSent) {
        const beforeExclusion = transformedCandidates.length;
        transformedCandidates = transformedCandidates.filter(candidate => 
          !sentRequests.has(candidate.user_id)
        );
        console.log(`📤 Excluded sent requests: ${beforeExclusion} -> ${transformedCandidates.length}`);
      }
      
      // Apply additional filters
      let filteredCandidates = transformedCandidates;
      
      if (filters.recoveryStage) {
        filteredCandidates = filteredCandidates.filter(c => 
          c.recovery_stage === filters.recoveryStage
        );
      }
      
      if (filters.ageRange) {
        const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
        filteredCandidates = filteredCandidates.filter(c => 
          c.age && c.age >= minAge && (maxAge ? c.age <= maxAge : true)
        );
      }

      // ✅ NEW: Location filter
      if (filters.location.trim()) {
        const searchLocation = filters.location.trim().toLowerCase();
        filteredCandidates = filteredCandidates.filter(c => 
          c.location && c.location.toLowerCase().includes(searchLocation)
        );
      }
      
      console.log(`🔍 ${filteredCandidates.length} profiles after filtering`);
      
      // Calculate compatibility scores
      const matchesWithScores = filteredCandidates.map(candidate => {
        const displayInfo = generateDisplayInfo(userMatchingProfile, candidate);
        
        return {
          ...candidate,
          ...displayInfo,
          isAlreadyMatched: excludedUsers.has(candidate.user_id),
          isRequestSent: sentRequests.has(candidate.user_id)
        };
      });
      
      // Filter by minimum score and sort by compatibility
      const qualifiedMatches = matchesWithScores
        .filter(match => match.matchScore >= filters.minScore)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20); // Limit to top 20 matches
      
      console.log(`✅ Found ${qualifiedMatches.length} qualified matches`);
      setMatches(qualifiedMatches);
      
    } catch (err) {
      console.error('💥 Error finding matches:', err);
      setError(err.message || 'Failed to find matches');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle showing match details
   */
  const handleShowDetails = (match) => {
    setSelectedMatch(match);
    setShowDetails(true);
  };
  
  /**
   * ✅ IMPROVED: Handle match request with exclusion updates
   */
  const handleRequestMatch = async (match) => {
    try {
      console.log('🤝 Sending match request to:', match.first_name);
      
      const requestData = {
        requester_id: user.id,
        target_id: match.user_id,
        request_type: 'roommate', // ✅ FIXED: Use 'roommate' instead of generic type
        match_score: match.matchScore,
        message: `Hi ${match.first_name}! I think we could be great roommates based on our ${match.matchScore}% compatibility. Would you like to connect?`,
        status: 'pending'
      };
      
      // Call database function to create the match request
      const result = await db.matchRequests.create(requestData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to send match request');
      }
      
      console.log('✅ Match request sent successfully:', result.data);
      
      // ✅ NEW: Update local state to reflect sent request
      setSentRequests(prev => new Set([...prev, match.user_id]));
      
      // Optionally call the parent's onRequestMatch if it exists
      if (onRequestMatch) {
        await onRequestMatch(match);
      }
      
      alert(`Match request sent to ${match.first_name}!`);
      
      // ✅ NEW: Refresh matches to update display
      if (filters.hideRequestsSent) {
        findMatches();
      }
      
    } catch (err) {
      console.error('💥 Error sending match request:', err);
      alert('Failed to send match request. Please try again.');
    }
  };
  
  /**
   * ✅ IMPROVED: Update filters and refresh matches
   */
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * ✅ NEW: Refresh matches and exclusions
   */
  const handleRefreshMatches = async () => {
    await loadExcludedUsers();
    await loadSentRequests();
    await findMatches();
  };

  /**
   * ✅ NEW: Clear location filter and use user's preferred location
   */
  const handleUseMyLocation = () => {
    if (userMatchingProfile?.location) {
      setFilters(prev => ({ 
        ...prev, 
        location: userMatchingProfile.location 
      }));
    } else {
      alert('No location found in your profile. Please update your matching profile with your preferred location.');
    }
  };
  
  // Show error if no user profile
  if (!userMatchingProfile && !loading) {
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
        <div className="text-center mb-5">
          <h1 className="welcome-title">Find Your Perfect Roommate Match</h1>
          <p className="welcome-text">
            Discover compatible roommates based on recovery goals, lifestyle preferences, and personal compatibility
          </p>
        </div>
        
        {/* ✅ IMPROVED: Enhanced search controls with exclusion options */}
        <div className="card mb-5">
          <h3 className="card-title">Search Filters</h3>
          
          <div className="grid-auto mb-4">
            <div className="form-group">
              <label className="label">Recovery Stage</label>
              <select
                className="input"
                value={filters.recoveryStage}
                onChange={(e) => handleFilterChange({ recoveryStage: e.target.value })}
              >
                <option value="">Any stage</option>
                <option value="early">Early recovery</option>
                <option value="stabilizing">Stabilizing recovery</option>
                <option value="stable">Stable recovery</option>
                <option value="long-term">Long-term recovery</option>
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
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-65">46+</option>
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
            
            <div className="form-group">
              <label className="label">Min Compatibility</label>
              <select
                className="input"
                value={filters.minScore}
                onChange={(e) => handleFilterChange({ minScore: Number(e.target.value) })}
              >
                <option value="30">30% or higher</option>
                <option value="40">40% or higher</option>
                <option value="50">50% or higher</option>
                <option value="60">60% or higher</option>
                <option value="70">70% or higher</option>
              </select>
            </div>
          </div>

          {/* ✅ NEW: Exclusion and action controls */}
          <div className="grid-auto mb-4">
            <button
              className="btn btn-primary"
              onClick={findMatches}
              disabled={loading || !userMatchingProfile}
            >
              {loading ? 'Searching...' : 'Search Matches'}
            </button>

            <button
              className="btn btn-outline"
              onClick={handleUseMyLocation}
              disabled={loading || !userMatchingProfile?.location}
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

          {/* ✅ NEW: Exclusion options */}
          <div className="grid-2 mb-4">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="hide-matched"
                checked={filters.hideAlreadyMatched}
                onChange={(e) => handleFilterChange({ hideAlreadyMatched: e.target.checked })}
              />
              <label htmlFor="hide-matched">
                Hide already matched users
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
          {(filters.recoveryStage || filters.ageRange || filters.location || filters.minScore > 40) && (
            <div className="alert alert-info">
              <strong>Active Filters:</strong> 
              {filters.recoveryStage && ` Recovery: ${filters.recoveryStage} •`}
              {filters.ageRange && ` Age: ${filters.ageRange} •`}
              {filters.location && ` Location: ${filters.location} •`}
              {filters.minScore > 40 && ` Min Compatibility: ${filters.minScore}% •`}
              {!filters.hideAlreadyMatched && ` Including matched users •`}
              {!filters.hideRequestsSent && ` Including contacted users`}
            </div>
          )}
        </div>
        
        {/* Error State */}
        {error && (
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
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="empty-state">
            <div className="loading-spinner large"></div>
            <p>Finding your perfect matches...</p>
          </div>
        )}
        
        {/* No Matches State */}
        {!loading && !error && matches.length === 0 && userMatchingProfile && (
          <div className="card text-center">
            <h3>No matches found</h3>
            <p>Try adjusting your filters or check back later for new applicants.</p>
            <div className="mt-3">
              <button
                className="btn btn-primary"
                onClick={() => handleFilterChange({ 
                  minScore: 30, 
                  recoveryStage: '', 
                  ageRange: '', 
                  location: '',
                  hideAlreadyMatched: false,
                  hideRequestsSent: false 
                })}
              >
                Expand Search Criteria
              </button>
            </div>
          </div>
        )}
        
        {/* ✅ IMPROVED: Matches Grid with status indicators */}
        {!loading && !error && matches.length > 0 && (
          <>
            <div className="card mb-4">
              <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="card-title">
                  {matches.length} Compatible Match{matches.length !== 1 ? 'es' : ''} Found
                </h3>
                <div className="text-gray-600">
                  {excludedUsers.size} users excluded • {sentRequests.size} requests sent
                </div>
              </div>
            </div>

            <div className="grid-auto mb-5">
              {matches.map((match) => {
                const isRequestSent = match.isRequestSent;
                const isAlreadyMatched = match.isAlreadyMatched;
                
                return (
                  <div key={match.user_id} className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{match.first_name}</div>
                        <div className="card-subtitle">{match.matchScore}% Match</div>
                      </div>
                      <div>
                        {isAlreadyMatched && (
                          <span className="badge badge-warning mb-1">Already Matched</span>
                        )}
                        {isRequestSent && (
                          <span className="badge badge-info mb-1">Request Sent</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <div className="grid-2 text-gray-600">
                          <div><span className="text-gray-600">Age:</span> <span className="text-gray-800">{match.age || 'Not specified'}</span></div>
                          <div><span className="text-gray-600">Location:</span> <span className="text-gray-800">{match.location}</span></div>
                          <div><span className="text-gray-600">Recovery Stage:</span> <span className="text-gray-800">{match.recovery_stage?.charAt(0).toUpperCase() + match.recovery_stage?.slice(1) || 'Not specified'}</span></div>
                          <div><span className="text-gray-600">Budget:</span> <span className="text-gray-800">${match.price_range?.min || 0} - ${match.price_range?.max || match.budget_max}</span></div>
                        </div>
                      </div>
                      
                      {/* Green Flags */}
                      {match.greenFlags?.length > 0 && (
                        <div className="mb-4">
                          <div className="label mb-2">✓ Compatibility Highlights</div>
                          <div className="mb-2">
                            {match.greenFlags.slice(0, 3).map((flag, i) => (
                              <span key={i} className="badge badge-success mr-1 mb-1">
                                {flag}
                              </span>
                            ))}
                            {match.greenFlags.length > 3 && (
                              <span className="text-sm text-gray-600">
                                +{match.greenFlags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Red Flags */}
                      {match.redFlags?.length > 0 && (
                        <div className="mb-4">
                          <div className="label mb-2">⚠ Potential Concerns</div>
                          <div className="mb-2">
                            {match.redFlags.slice(0, 2).map((flag, i) => (
                              <span key={i} className="badge badge-warning mr-1 mb-1">
                                {flag}
                              </span>
                            ))}
                            {match.redFlags.length > 2 && (
                              <span className="text-sm text-gray-600">
                                +{match.redFlags.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid-2">
                        <button
                          className="btn btn-outline"
                          onClick={() => handleShowDetails(match)}
                        >
                          Show Details
                        </button>
                        
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleRequestMatch(match)}
                          disabled={isRequestSent || isAlreadyMatched}
                        >
                          {isRequestSent ? 'Request Sent' :
                           isAlreadyMatched ? 'Already Matched' :
                           'Request Match'}
                        </button>
                      </div>
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
      
      {/* Match Details Modal */}
      {showDetails && selectedMatch && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedMatch.first_name} - {selectedMatch.matchScore}% Match
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            
            {/* ✅ NEW: Match status in modal */}
            {(selectedMatch.isRequestSent || selectedMatch.isAlreadyMatched) && (
              <div className="mb-4">
                {selectedMatch.isAlreadyMatched && (
                  <div className="alert alert-warning">
                    <strong>Already Matched:</strong> This user is currently matched with someone else.
                  </div>
                )}
                {selectedMatch.isRequestSent && (
                  <div className="alert alert-info">
                    <strong>Request Sent:</strong> You've already sent a match request to this user.
                  </div>
                )}
              </div>
            )}
            
            {selectedMatch.about_me && (
              <div className="mb-4">
                <h4 className="card-title">About {selectedMatch.first_name}</h4>
                <p className="card-text">{selectedMatch.about_me}</p>
              </div>
            )}
            
            {selectedMatch.looking_for && (
              <div className="mb-4">
                <h4 className="card-title">What they're looking for</h4>
                <p className="card-text">{selectedMatch.looking_for}</p>
              </div>
            )}
            
            {selectedMatch.recovery_methods?.length > 0 && (
              <div className="mb-4">
                <h4 className="card-title">Recovery Methods</h4>
                <div className="mb-2">
                  {selectedMatch.recovery_methods.map((method, i) => (
                    <span key={i} className="badge badge-success mr-1 mb-1">{method}</span>
                  ))}
                </div>
              </div>
            )}
            
            {selectedMatch.interests?.length > 0 && (
              <div className="mb-4">
                <h4 className="card-title">Interests</h4>
                <div className="mb-2">
                  {selectedMatch.interests.map((interest, i) => (
                    <span key={i} className="badge badge-info mr-1 mb-1">{interest}</span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Detailed Compatibility Breakdown */}
            {selectedMatch.breakdown && (
              <div className="mb-4">
                <h4 className="card-title">Compatibility Breakdown</h4>
                <div className="grid-2 text-sm">
                  <div><strong>Recovery:</strong> {selectedMatch.breakdown.recovery || 0}%</div>
                  <div><strong>Lifestyle:</strong> {selectedMatch.breakdown.lifestyle || 0}%</div>
                  <div><strong>Budget:</strong> {selectedMatch.breakdown.budget || 0}%</div>
                  <div><strong>Location:</strong> {selectedMatch.breakdown.location || 0}%</div>
                  <div><strong>Age:</strong> {selectedMatch.breakdown.age || 0}%</div>
                  <div><strong>Gender Pref:</strong> {selectedMatch.breakdown.gender || 0}%</div>
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
              
              <button
                className="btn btn-secondary"
                onClick={() => {
                  handleRequestMatch(selectedMatch);
                  setShowDetails(false);
                }}
                disabled={selectedMatch.isRequestSent || selectedMatch.isAlreadyMatched}
              >
                {selectedMatch.isRequestSent ? 'Request Sent' :
                 selectedMatch.isAlreadyMatched ? 'Already Matched' :
                 'Send Match Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MatchFinder;