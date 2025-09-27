// src/utils/matching/matchingService.js - SCHEMA COMPLIANT VERSION

import { supabase } from '../supabase.js';
import { calculateDetailedCompatibility } from './algorithm.js';
import { transformProfileForAlgorithm, calculateAge } from './dataTransform.js';
import { generateDetailedFlags } from './compatibility.js';

/**
 * SCHEMA COMPLIANT: Enhanced matching service with strict database schema compliance
 * Works with: applicant_matching_profiles table + registrant_profiles JOIN
 * All field references validated against schema.sql
 * All database operations use exact table/field names from schema
 */
class SchemaCompliantMatchingService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    this.matchingTableName = 'applicant_matching_profiles';
    this.profilesTableName = 'registrant_profiles';
    this.requestsTableName = 'match_requests';
    this.groupsTableName = 'match_groups';
  }

  // SCHEMA COMPLIANT: Internal constants (no external dependencies)
  get ENHANCED_THRESHOLDS() {
    return {
      minScore: 45,
      maxResults: 20,
      cacheTimeout: this.cacheTimeout
    };
  }

  get COMPATIBILITY_LEVELS() {
    return {
      excellent: { min: 85, label: 'Excellent Match' },
      very_good: { min: 75, label: 'Very Good Match' },
      good: { min: 65, label: 'Good Match' },
      moderate: { min: 55, label: 'Moderate Match' },
      fair: { min: 45, label: 'Fair Match' },
      poor: { min: 0, label: 'Limited Match' }
    };
  }

  /**
   * Get cache key for a user's matches
   */
  getCacheKey(userId, filters) {
    return `schema_compliant_matches_${userId}_${JSON.stringify(filters)}`;
  }

  /**
   * Check if cached results are still valid
   */
  isCacheValid(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
  }

  /**
   * SCHEMA COMPLIANT: Generate comprehensive display info with priority breakdown
   */
  generateDisplayInfo(userProfile, candidateProfile) {
    const compatibility = calculateDetailedCompatibility(userProfile, candidateProfile);
    const flags = generateDetailedFlags(userProfile, candidateProfile, compatibility.score_breakdown);
    
    return {
      matchScore: compatibility.compatibility_score,
      breakdown: compatibility.score_breakdown,
      priorityBreakdown: compatibility.priority_breakdown,
      greenFlags: flags.green || [],
      redFlags: flags.red || [],
      yellowFlags: flags.yellow || [],
      compatibility,
      algorithmVersion: compatibility.algorithm_version,
      matchInsights: this.generateMatchInsights(userProfile, candidateProfile, compatibility),
      compatibilityLevel: this.getCompatibilityLevel(compatibility.compatibility_score),
      recommendationStrength: this.getRecommendationStrength(compatibility)
    };
  }

  /**
   * Generate match insights based on compatibility analysis
   */
  generateMatchInsights(userProfile, candidateProfile, compatibility) {
    const insights = [];
    const scores = compatibility.score_breakdown;
    
    // High compatibility insights
    if (scores.location >= 90) {
      insights.push({
        type: 'location',
        level: 'high',
        message: `Perfect location match in ${userProfile.primary_location || 'same area'}`
      });
    }
    
    if (scores.recovery_core >= 85) {
      insights.push({
        type: 'recovery',
        level: 'high',
        message: 'Excellent recovery journey compatibility'
      });
    }
    
    if (scores.lifestyle_core >= 85) {
      insights.push({
        type: 'lifestyle',
        level: 'high',
        message: 'Great lifestyle and daily routine compatibility'
      });
    }
    
    // Moderate compatibility insights
    if (scores.budget >= 70 && scores.budget < 85) {
      insights.push({
        type: 'budget',
        level: 'moderate',
        message: 'Good budget alignment with some flexibility needed'
      });
    }
    
    // Potential concerns
    if (scores.gender_preferences <= 50) {
      insights.push({
        type: 'gender',
        level: 'concern',
        message: 'Gender preferences may not align - worth discussing'
      });
    }
    
    if (scores.communication_style <= 50) {
      insights.push({
        type: 'communication',
        level: 'concern',
        message: 'Different communication styles - may need compromise'
      });
    }
    
    return insights;
  }

  /**
   * Get compatibility level description
   */
  getCompatibilityLevel(score) {
    const levels = this.COMPATIBILITY_LEVELS;
    
    if (score >= levels.excellent.min) return { level: 'excellent', description: levels.excellent.label };
    if (score >= levels.very_good.min) return { level: 'very_good', description: levels.very_good.label };
    if (score >= levels.good.min) return { level: 'good', description: levels.good.label };
    if (score >= levels.moderate.min) return { level: 'moderate', description: levels.moderate.label };
    if (score >= levels.fair.min) return { level: 'fair', description: levels.fair.label };
    return { level: 'poor', description: levels.poor.label };
  }

  /**
   * Get recommendation strength based on priority factors
   */
  getRecommendationStrength(compatibility) {
    const { priority_breakdown } = compatibility;
    
    // Strong recommendation if core factors are high
    if (priority_breakdown?.core_factors >= 80) {
      return { 
        strength: 'strong', 
        message: 'Highly recommended based on core compatibility factors',
        confidence: 'high'
      };
    }
    
    // Moderate recommendation
    if (priority_breakdown?.core_factors >= 65) {
      return { 
        strength: 'moderate', 
        message: 'Good compatibility with room for growth',
        confidence: 'medium'
      };
    }
    
    // Cautious recommendation
    return { 
      strength: 'cautious', 
      message: 'Consider carefully - may require significant compromise',
      confidence: 'low'
    };
  }

  /**
   * SCHEMA COMPLIANT: Load user profile with JOIN to get registrant data
   * Uses exact schema table and field names
   */
  async loadUserProfile(userId) {
    try {
      console.log('Loading user matching profile with registrant data...');
      
      // SCHEMA COMPLIANT: JOIN applicant_matching_profiles with registrant_profiles
      const { data, error } = await supabase
        .from(this.matchingTableName)
        .select(`
          *,
          registrant_profiles!user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Database error loading profile:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No matching profile found. Please complete your profile first.');
      }
      
      // SCHEMA COMPLIANT: Transform using exact schema fields
      const transformedProfile = this.transformSchemaCompliantProfile(data);
      
      console.log('User profile loaded and transformed:', {
        user_id: transformedProfile.user_id,
        completion: transformedProfile.completion_percentage,
        location: transformedProfile.primary_location,
        recovery_stage: transformedProfile.recovery_stage
      });
      
      return transformedProfile;
      
    } catch (err) {
      console.error('Error loading user profile:', err);
      throw err;
    }
  }


transformSchemaCompliantProfile(dbProfile) {
  // DEBUGGING: Check the JOIN data
  console.log('🔍 DEBUG - Raw dbProfile:', {
    id: dbProfile.id,
    user_id: dbProfile.user_id,
    registrant_profiles: dbProfile.registrant_profiles,
    hasRegistrantData: !!dbProfile.registrant_profiles,
    registrantKeys: dbProfile.registrant_profiles ? Object.keys(dbProfile.registrant_profiles) : null
  });

  const registrantData = dbProfile.registrant_profiles;
  
  // DEBUGGING: Check registrant data extraction
  console.log('🔍 DEBUG - Registrant data:', {
    registrantData,
    first_name: registrantData?.first_name,
    last_name: registrantData?.last_name,
    email: registrantData?.email
  });
  
  const age = calculateAge(dbProfile.date_of_birth);
  
  const result = {
    // CORE IDENTIFIERS (from applicant_matching_profiles)
    id: dbProfile.id,
    user_id: dbProfile.user_id,
    
    // REGISTRANT DATA (from JOIN) - Add more debugging
    first_name: registrantData?.first_name || 'Unknown',
    last_name: registrantData?.last_name || 'User',
    email: registrantData?.email || '',
    
    // ... rest of your existing transformation
  };
  
  // DEBUGGING: Check final result
  console.log('🔍 DEBUG - Transformed profile:', {
    id: result.id,
    user_id: result.user_id,
    first_name: result.first_name,
    last_name: result.last_name,
    email: result.email
  });
  
  return result;
}

  /**
   * SCHEMA COMPLIANT: Load all active profiles with registrant data JOIN
   */

// FIXED: loadActiveProfiles method with correct JOIN syntax
async loadActiveProfiles(excludeUserId = null) {
  try {
    console.log('Loading active profiles with registrant data...');
    console.log('🔍 loadActiveProfiles called with excludeUserId:', excludeUserId);
    
    let query = supabase
      .from(this.matchingTableName)
      .select(`
        *,
        registrant_profiles (
          first_name,
          last_name,
          email
        )
      `)
      .eq('is_active', true)
      .eq('profile_completed', true)
      .order('updated_at', { ascending: false });
    
    if (excludeUserId) {
      console.log('🔍 Adding exclude filter for user_id:', excludeUserId);
      query = query.neq('user_id', excludeUserId);
    }
    
    const { data, error } = await query;
    
    console.log('🔍 Raw database results:', {
      error: error?.message,
      dataLength: data?.length || 0,
      firstProfile: data?.[0] ? {
        user_id: data[0].user_id,
        registrant_data: data[0].registrant_profiles,
        first_name_from_join: data[0].registrant_profiles?.first_name
      } : null
    });
    
    if (error) {
      console.error('Database error loading profiles:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.log('No active profiles found');
      return [];
    }
    
    const transformedProfiles = data.map(profile => this.transformSchemaCompliantProfile(profile));
    
    console.log(`✅ Transformed ${transformedProfiles.length} profiles:`, 
      transformedProfiles.slice(0, 3).map(p => ({ 
        user_id: p.user_id, 
        first_name: p.first_name,
        primary_city: p.primary_city,
        registrant_data_check: !!p.first_name && p.first_name !== 'Unknown'
      }))
    );
    
    return transformedProfiles;
    
  } catch (err) {
    console.error('Error loading active profiles:', err);
    throw err;
  }
}

// FIXED: loadUserProfile method with correct JOIN syntax  
async loadUserProfile(userId) {
  try {
    console.log('Loading user matching profile with registrant data...');
    
    const { data, error } = await supabase
      .from(this.matchingTableName)
      .select(`
        *,
        registrant_profiles (
          first_name,
          last_name,
          email
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Database error loading profile:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No matching profile found. Please complete your profile first.');
    }
    
    console.log('🔍 User profile raw data:', {
      user_id: data.user_id,
      registrant_data: data.registrant_profiles,
      first_name_from_join: data.registrant_profiles?.first_name
    });
    
    const transformedProfile = this.transformSchemaCompliantProfile(data);
    
    console.log('User profile loaded and transformed:', {
      user_id: transformedProfile.user_id,
      first_name: transformedProfile.first_name,
      completion: transformedProfile.completion_percentage,
      location: transformedProfile.primary_location,
      recovery_stage: transformedProfile.recovery_stage
    });
    
    return transformedProfile;
    
  } catch (err) {
    console.error('Error loading user profile:', err);
    throw err;
  }
}

  /**
   * SCHEMA COMPLIANT: Load excluded users using exact table names
   */
async loadExcludedUsers(userId) {
  try {
    console.log('Loading excluded users...');
    
    // Get the user's applicant profile ID since that's what's stored in match_requests
    const { data: userApplicant } = await supabase
      .from('applicant_matching_profiles')
      .select('id, user_id')
      .eq('user_id', userId) // userId should be registrant_profiles.id
      .single();
    
    if (!userApplicant) {
      console.warn('No applicant profile found for user:', userId);
      return new Set();
    }
    
    const userApplicantId = userApplicant.id;
    console.log('User applicant profile ID:', userApplicantId);
    
    const [requestsResult, groupsResult] = await Promise.all([
      this.loadMatchRequestsForApplicant(userApplicantId),
      this.loadMatchGroups(userId) // Groups still use registrant profile IDs
    ]);

    const excludedUserIds = new Set(); // Will contain registrant_profiles.id values for consistency

    // Exclude from match requests (convert back to registrant profile IDs)
    if (requestsResult && requestsResult.length > 0) {
      for (const request of requestsResult) {
        if (request.request_type === 'roommate' || request.request_type === 'housing') {
          // Get the other applicant's ID
          const otherApplicantId = request.requester_type === 'applicant' && request.requester_id === userApplicantId ? 
                                 request.recipient_id : request.requester_id;
          
          if (['accepted', 'matched'].includes(request.status)) {
            // Convert applicant profile ID back to registrant profile ID
            try {
              const { data: otherApplicant } = await supabase
                .from('applicant_matching_profiles')
                .select('user_id')
                .eq('id', otherApplicantId)
                .single();
              
              if (otherApplicant) {
                excludedUserIds.add(otherApplicant.user_id); // registrant_profiles.id
                console.log(`Excluding user ${otherApplicant.user_id} - active connection (${request.status})`);
              }
            } catch (err) {
              console.warn('Could not find applicant profile for ID:', otherApplicantId);
            }
          }
        }
      }
    }

    // Exclude from active match groups (these still use registrant profile IDs)
    if (groupsResult && groupsResult.length > 0) {
      groupsResult.forEach(group => {
        if (['active', 'forming', 'confirmed'].includes(group.status)) {
          [group.applicant_1_id, group.applicant_2_id, group.peer_support_id]
            .filter(id => id && id !== userId)
            .forEach(id => {
              excludedUserIds.add(id);
              console.log(`Excluding user ${id} - active match group member`);
            });
        }
      });
    }

    console.log(`Total excluded users: ${excludedUserIds.size}`);
    return excludedUserIds;

  } catch (err) {
    console.error('Error loading excluded users:', err);
    return new Set();
  }
}


  /**
   * SCHEMA COMPLIANT: Load match requests using exact table and field names
   */
/**
 * REPLACE: Your existing loadMatchRequests method with this corrected version
 */
async loadMatchRequests(userId) {
  try {
    console.log('Loading match requests for user:', userId);
    
    // Get the user's applicant profile ID since that's what's stored in match_requests
    const { data: userApplicant } = await supabase
      .from('applicant_matching_profiles')
      .select('id, user_id')
      .eq('user_id', userId) // userId should be registrant_profiles.id
      .single();
    
    if (!userApplicant) {
      console.warn('No applicant profile found for user:', userId);
      return [];
    }
    
    const userApplicantId = userApplicant.id;
    console.log('User applicant profile ID:', userApplicantId);
    
    // Use the helper method
    return await this.loadMatchRequestsForApplicant(userApplicantId);
    
  } catch (err) {
    console.warn('Error loading match requests:', err);
    return [];
  }
}

  /**
   * SCHEMA COMPLIANT: Load match groups using exact table and field names
   */
  async loadMatchGroups(userId) {
    try {
      // SCHEMA COMPLIANT: Query match_groups table with correct field names
      const { data, error } = await supabase
        .from(this.groupsTableName)
        .select('*')
        .or(`applicant_1_id.eq.${userId},applicant_2_id.eq.${userId},peer_support_id.eq.${userId}`);
      
      if (error) {
        console.warn('Error loading match groups:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.warn('Error loading match groups:', err);
      return [];
    }
  }

  /**
   * SCHEMA COMPLIANT: Load sent requests for UI feedback
   */
async loadSentRequests(userId) {
  try {
    // Get the user's applicant profile ID
    const { data: userApplicant } = await supabase
      .from('applicant_matching_profiles')
      .select('id, user_id')
      .eq('user_id', userId) // userId should be registrant_profiles.id
      .single();
    
    if (!userApplicant) {
      console.warn('No applicant profile found for user:', userId);
      return new Set();
    }
    
    const userApplicantId = userApplicant.id;
    const requests = await this.loadMatchRequestsForApplicant(userApplicantId);
    
    const sentRequestIds = new Set();
    
    for (const req of requests) {
      if (req.requester_type === 'applicant' &&
          req.requester_id === userApplicantId && 
          (req.request_type === 'housing' || req.request_type === 'roommate') &&
          req.status === 'pending') {
        
        // Convert recipient applicant profile ID back to registrant profile ID
        try {
          const { data: recipientApplicant } = await supabase
            .from('applicant_matching_profiles')
            .select('user_id')
            .eq('id', req.recipient_id)
            .single();
          
          if (recipientApplicant) {
            sentRequestIds.add(recipientApplicant.user_id); // registrant_profiles.id
          }
        } catch (err) {
          console.warn('Could not find recipient applicant profile for ID:', req.recipient_id);
        }
      }
    }
    
    console.log(`Found ${sentRequestIds.size} pending requests sent`);
    return sentRequestIds;
    
  } catch (err) {
    console.error('Error loading sent requests:', err);
    return new Set();
  }
}
async loadMatchRequestsForApplicant(applicantProfileId) {
  try {
    const { data, error } = await supabase
      .from(this.requestsTableName)
      .select('*')
      .or(`and(requester_type.eq.applicant,requester_id.eq.${applicantProfileId}),and(recipient_type.eq.applicant,recipient_id.eq.${applicantProfileId})`);
    
    if (error) {
      console.warn('Error loading match requests for applicant:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.warn('Error loading match requests for applicant:', err);
    return [];
  }
}

  /**
   * SCHEMA COMPLIANT: Find compatible matches with comprehensive filtering
   */
/**
 * ENHANCED: Find compatible matches with better error handling and debugging
 */
async findMatches(userId, filters = {}) {
  try {
    const finalFilters = { 
      minScore: this.ENHANCED_THRESHOLDS.minScore,
      maxResults: this.ENHANCED_THRESHOLDS.maxResults,
      hideAlreadyMatched: true,
      hideRequestsSent: true,
      ...filters 
    };
    
    console.log('🔍 Starting findMatches with filters:', finalFilters);
    
    const cacheKey = this.getCacheKey(userId, finalFilters);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (this.isCacheValid(cached)) {
      console.log('✅ Returning cached schema-compliant matches');
      return cached.data;
    }

    console.log('🔄 Finding schema-compliant matches...');

    // Load user profile and exclusions in parallel
    console.log('📊 Loading user profile and exclusions...');
    const [userProfile, excludedUsers, sentRequests] = await Promise.all([
      this.loadUserProfile(userId),
      this.loadExcludedUsers(userId),
      this.loadSentRequests(userId)
    ]);

    console.log('👤 User profile loaded:', {
      user_id: userProfile.user_id,
      name: userProfile.first_name,
      location: userProfile.primary_location,
      recovery_stage: userProfile.recovery_stage
    });

    // Get active profiles
    console.log('🔍 Loading active profiles...');
    let candidates = await this.loadActiveProfiles(userId);
    
    // CRITICAL DEBUG: Check if candidates is valid
    console.log('🚨 CANDIDATES DEBUG:', {
      candidates_type: typeof candidates,
      candidates_isArray: Array.isArray(candidates),
      candidates_length: candidates?.length,
      candidates_isUndefined: candidates === undefined,
      candidates_isNull: candidates === null
    });

    if (!candidates) {
      console.error('❌ CRITICAL ERROR: candidates is null/undefined');
      return {
        matches: [],
        userProfile,
        excludedCount: excludedUsers.size,
        sentRequestsCount: sentRequests.size,
        algorithmVersion: '2.0_schema_compliant',
        error: 'No candidates loaded - loadActiveProfiles returned null/undefined'
      };
    }

    if (!Array.isArray(candidates)) {
      console.error('❌ CRITICAL ERROR: candidates is not an array:', typeof candidates);
      return {
        matches: [],
        userProfile,
        excludedCount: excludedUsers.size,
        sentRequestsCount: sentRequests.size,
        algorithmVersion: '2.0_schema_compliant',
        error: `Candidates is not an array: ${typeof candidates}`
      };
    }

    console.log(`📋 Found ${candidates.length} active candidate profiles`);

    if (candidates.length === 0) {
      console.log('ℹ️ No active profiles found');
      return {
        matches: [],
        userProfile,
        excludedCount: excludedUsers.size,
        sentRequestsCount: sentRequests.size,
        algorithmVersion: '2.0_schema_compliant'
      };
    }

    // Apply exclusion filters
    if (finalFilters.hideAlreadyMatched) {
      const beforeExclusion = candidates.length;
      candidates = candidates.filter(candidate => {
        const isExcluded = excludedUsers.has(candidate.user_id);
        if (isExcluded) {
          console.log(`🚫 Hiding ${candidate.first_name} - already matched/connected`);
        }
        return !isExcluded;
      });
      console.log(`🔄 Excluded already matched: ${beforeExclusion} -> ${candidates.length}`);
    }

    if (finalFilters.hideRequestsSent) {
      const beforeExclusion = candidates.length;
      candidates = candidates.filter(candidate => {
        const isRequestSent = sentRequests.has(candidate.user_id);
        if (isRequestSent) {
          console.log(`📤 Hiding ${candidate.first_name} - request already sent`);
        }
        return !isRequestSent;
      });
      console.log(`🔄 Excluded sent requests: ${beforeExclusion} -> ${candidates.length}`);
    }

    // Apply filters and deal breakers
    console.log('🎯 Applying filters...');
    candidates = this.applySchemaCompliantFilters(candidates, finalFilters);
    console.log('🚫 Applying deal breaker filters...');
    candidates = this.applySchemaCompliantDealBreakerFilters(userProfile, candidates);

    console.log(`📊 Final candidate count after filters: ${candidates.length}`);

    if (candidates.length === 0) {
      console.log('ℹ️ No candidates remaining after filters');
      return {
        matches: [],
        userProfile,
        excludedCount: excludedUsers.size,
        sentRequestsCount: sentRequests.size,
        algorithmVersion: '2.0_schema_compliant',
        filterCriteria: finalFilters,
        totalCandidatesEvaluated: 0
      };
    }

    // Calculate compatibility scores
    console.log('🧮 Calculating compatibility scores...');
    const matchesWithScores = candidates.map((candidate, index) => {
      try {
        console.log(`🔄 Processing candidate ${index + 1}/${candidates.length}: ${candidate.first_name}`);
        const displayInfo = this.generateDisplayInfo(userProfile, candidate);
        
        return {
          ...candidate,
          ...displayInfo,
          isAlreadyMatched: excludedUsers.has(candidate.user_id),
          isRequestSent: sentRequests.has(candidate.user_id)
        };
      } catch (err) {
        console.error(`❌ Error processing candidate ${candidate.first_name}:`, err);
        return null; // Filter out failed candidates
      }
    }).filter(match => match !== null); // Remove failed matches

    console.log(`✅ Successfully processed ${matchesWithScores.length} matches`);

    // Filter by minimum score and sort
    const qualifiedMatches = matchesWithScores
      .filter(match => match.matchScore >= finalFilters.minScore)
      .sort((a, b) => {
        // Primary sort by match score
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        // Secondary sort by core factors if scores are tied
        return (b.priorityBreakdown?.core_factors || 0) - (a.priorityBreakdown?.core_factors || 0);
      })
      .slice(0, finalFilters.maxResults);

    console.log(`🎯 Found ${qualifiedMatches.length} qualified schema-compliant matches`);

    const result_data = {
      matches: qualifiedMatches,
      userProfile,
      excludedCount: excludedUsers.size,
      sentRequestsCount: sentRequests.size,
      algorithmVersion: '2.0_schema_compliant',
      filterCriteria: finalFilters,
      totalCandidatesEvaluated: candidates.length
    };

    // Cache the results
    this.cache.set(cacheKey, {
      data: result_data,
      timestamp: Date.now()
    });

    console.log('✅ Successfully completed findMatches');
    return result_data;

  } catch (err) {
    console.error('💥 Error finding schema-compliant matches:', err);
    console.error('Stack trace:', err.stack);
    throw err;
  }
}

  /**
   * SCHEMA COMPLIANT: Apply filters using exact schema field names
   */
/**
 * FIXED: Apply filters using exact schema field names
 * Now handles both camelCase and snake_case filter names for compatibility
 */
applySchemaCompliantFilters(candidates, filters) {
  let filtered = candidates;

  // Recovery stage filter (exact schema field) - FIXED: Handle both naming conventions
  const recoveryStage = filters.recovery_stage || filters.recoveryStage;
  if (recoveryStage) {
    filtered = filtered.filter(c => c.recovery_stage === recoveryStage);
    console.log(`Applied recovery stage filter: ${recoveryStage}, ${filtered.length} candidates remain`);
  }

  // Age range filter (calculated age) - FIXED: Handle both naming conventions
  const ageRange = filters.age_range || filters.ageRange;
  if (ageRange) {
    const [minAge, maxAge] = ageRange.split('-').map(Number);
    filtered = filtered.filter(c => 
      c.age && c.age >= minAge && (maxAge ? c.age <= maxAge : true)
    );
    console.log(`Applied age range filter: ${ageRange}, ${filtered.length} candidates remain`);
  }

  // Location filter (schema fields: primary_location, primary_city, primary_state)
  if (filters.location && filters.location.trim()) {
    const searchLocation = filters.location.trim().toLowerCase();
    filtered = filtered.filter(c => {
      const location = c.primary_location || 
                      (c.primary_city && c.primary_state ? `${c.primary_city}, ${c.primary_state}` : '') ||
                      c.primary_city || 
                      c.primary_state;
      
      return location && location.toLowerCase().includes(searchLocation);
    });
    console.log(`Applied location filter: ${searchLocation}, ${filtered.length} candidates remain`);
  }

  // Budget range filter (schema fields: budget_min, budget_max)
  if (filters.budgetMin || filters.budgetMax) {
    filtered = filtered.filter(c => {
      const candidateBudget = c.budget_max;
      if (!candidateBudget) return true;
      
      if (filters.budgetMin && candidateBudget < filters.budgetMin) return false;
      if (filters.budgetMax && candidateBudget > filters.budgetMax) return false;
      
      return true;
    });
    console.log(`Applied budget filter: ${filters.budgetMin}-${filters.budgetMax}, ${filtered.length} candidates remain`);
  }

  // Recovery methods filter (schema field: recovery_methods array)
  if (filters.recoveryMethods && filters.recoveryMethods.length > 0) {
    filtered = filtered.filter(c => 
      c.recovery_methods && 
      filters.recoveryMethods.some(method => c.recovery_methods.includes(method))
    );
    console.log(`Applied recovery methods filter, ${filtered.length} candidates remain`);
  }

  // Spiritual affiliation filter (schema field: spiritual_affiliation)
  if (filters.spiritualAffiliation) {
    filtered = filtered.filter(c => c.spiritual_affiliation === filters.spiritualAffiliation);
    console.log(`Applied spiritual affiliation filter: ${filters.spiritualAffiliation}, ${filtered.length} candidates remain`);
  }

  // Gender preference filter (schema field: preferred_roommate_gender)
  if (filters.genderPreference) {
    filtered = filtered.filter(c => c.preferred_roommate_gender === filters.genderPreference);
    console.log(`Applied gender preference filter: ${filters.genderPreference}, ${filtered.length} candidates remain`);
  }

  // Substance-free home filter (schema field: substance_free_home_required)
  if (filters.substanceFreeHome !== undefined) {
    filtered = filtered.filter(c => c.substance_free_home_required === filters.substanceFreeHome);
    console.log(`Applied substance-free home filter: ${filters.substanceFreeHome}, ${filtered.length} candidates remain`);
  }

  console.log(`Applied schema-compliant filters: ${candidates.length} -> ${filtered.length} candidates`);
  return filtered;
}

  /**
   * SCHEMA COMPLIANT: Apply deal breaker filters using exact schema field names
   */
  applySchemaCompliantDealBreakerFilters(userProfile, candidates) {
    return candidates.filter(candidate => {
      // User's deal breakers against candidate (schema field names)
      if (userProfile.deal_breaker_substance_use && candidate.substance_free_home_required === false) {
        console.log(`Excluding ${candidate.first_name} - substance use deal breaker`);
        return false;
      }
      
      if (userProfile.deal_breaker_pets && candidate.pets_owned) {
        console.log(`Excluding ${candidate.first_name} - pets deal breaker`);
        return false;
      }
      
      if (userProfile.deal_breaker_smoking && 
          candidate.smoking_status && 
          candidate.smoking_status !== 'non_smoker') {
        console.log(`Excluding ${candidate.first_name} - smoking deal breaker`);
        return false;
      }
      
      if (userProfile.deal_breaker_uncleanliness && 
          candidate.cleanliness_level && 
          candidate.cleanliness_level <= 2) {
        console.log(`Excluding ${candidate.first_name} - cleanliness deal breaker`);
        return false;
      }
      
      if (userProfile.deal_breaker_loudness && 
          candidate.noise_tolerance && 
          candidate.noise_tolerance >= 4) {
        console.log(`Excluding ${candidate.first_name} - loudness deal breaker`);
        return false;
      }
      
      if (userProfile.deal_breaker_financial_issues && 
          candidate.financially_stable === false) {
        console.log(`Excluding ${candidate.first_name} - financial stability deal breaker`);
        return false;
      }
      
      // Candidate's deal breakers against user
      if (candidate.deal_breaker_substance_use && userProfile.substance_free_home_required === false) {
        console.log(`Excluding ${candidate.first_name} - their substance use deal breaker`);
        return false;
      }
      
      if (candidate.deal_breaker_pets && userProfile.pets_owned) {
        console.log(`Excluding ${candidate.first_name} - their pets deal breaker`);
        return false;
      }
      
      if (candidate.deal_breaker_smoking && 
          userProfile.smoking_status && 
          userProfile.smoking_status !== 'non_smoker') {
        console.log(`Excluding ${candidate.first_name} - their smoking deal breaker`);
        return false;
      }
      
      return true; // No deal breakers violated
    });
  }

  /**
   * SCHEMA COMPLIANT: Send match request using exact table and field names
   */
/**
 * CORRECTED: Send match request using role-specific IDs as per schema design
 * Uses applicant_matching_profiles.id for applicant requests
 */
async sendMatchRequest(currentUserId, targetMatch) {
  try {
    console.log('Sending schema-compliant match request to:', targetMatch.first_name);
    
    // CRITICAL FIX: We need to get the applicant_matching_profiles.id for both sender and recipient
    // currentUserId might be auth.uid(), registrant_profiles.id, or applicant_matching_profiles.id
    
    let senderApplicantId;
    let targetApplicantId;
    
    // Get sender's applicant profile ID
    try {
      // First, try to find applicant profile by currentUserId directly
      let { data: senderApplicant } = await supabase
        .from('applicant_matching_profiles')
        .select('id, user_id')
        .eq('id', currentUserId)
        .single();
      
      if (senderApplicant) {
        // currentUserId was already an applicant profile ID
        senderApplicantId = senderApplicant.id;
        console.log('✅ currentUserId is applicant profile ID:', senderApplicantId);
      } else {
        // Try as registrant profile ID
        ({ data: senderApplicant } = await supabase
          .from('applicant_matching_profiles')
          .select('id, user_id')
          .eq('user_id', currentUserId)
          .single());
        
        if (senderApplicant) {
          senderApplicantId = senderApplicant.id;
          console.log('✅ Converted registrant profile ID to applicant profile ID:', senderApplicantId);
        } else {
          // Try as auth user ID - need to go through registrant_profiles
          const { data: registrant } = await supabase
            .from('registrant_profiles')
            .select('id')
            .eq('user_id', currentUserId)
            .single();
          
          if (registrant) {
            ({ data: senderApplicant } = await supabase
              .from('applicant_matching_profiles')
              .select('id, user_id')
              .eq('user_id', registrant.id)
              .single());
            
            if (senderApplicant) {
              senderApplicantId = senderApplicant.id;
              console.log('✅ Converted auth user ID to applicant profile ID:', senderApplicantId);
            }
          }
        }
      }
    } catch (err) {
      console.error('❌ Error finding sender applicant profile:', err);
      throw new Error('Could not find sender applicant profile');
    }
    
    if (!senderApplicantId) {
      throw new Error('Could not determine sender applicant profile ID');
    }
    
    // Get target's applicant profile ID
    // targetMatch.user_id should be registrant_profiles.id, we need applicant_matching_profiles.id
    try {
      const { data: targetApplicant } = await supabase
        .from('applicant_matching_profiles')
        .select('id, user_id')
        .eq('user_id', targetMatch.user_id) // targetMatch.user_id is registrant_profiles.id
        .single();
      
      if (!targetApplicant) {
        throw new Error(`No applicant profile found for target user ${targetMatch.user_id}`);
      }
      
      targetApplicantId = targetApplicant.id;
      console.log('✅ Found target applicant profile ID:', targetApplicantId);
      
    } catch (err) {
      console.error('❌ Error finding target applicant profile:', err);
      throw new Error('Could not find target applicant profile');
    }
    
    console.log('📋 Match request details (role-specific IDs):', {
      senderApplicantId,
      targetApplicantId,
      targetName: targetMatch.first_name
    });
    
    // SCHEMA COMPLIANT: Use role-specific IDs in match_requests
    const requestData = {
      requester_type: 'applicant',
      requester_id: senderApplicantId,        // applicant_matching_profiles.id
      recipient_type: 'applicant', 
      recipient_id: targetApplicantId,        // applicant_matching_profiles.id
      request_type: 'roommate',
      message: this.generateRequestMessage(targetMatch),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📤 Sending match request data (with role-specific IDs):', requestData);
    
    const { data, error } = await supabase
      .from(this.requestsTableName)
      .insert(requestData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(error.message || 'Failed to send match request');
    }
    
    console.log('✅ Schema-compliant match request sent successfully:', data);
    
    // Invalidate cache since sent requests have changed
    this.invalidateUserCache(currentUserId);
    
    return { success: true, data };
    
  } catch (err) {
    console.error('💥 Error sending schema-compliant match request:', err);
    return { success: false, error: err.message };
  }
}

  /**
   * Generate personalized request message
   */
  generateRequestMessage(targetMatch) {
    const compatibility = targetMatch.compatibilityLevel;
    const insights = targetMatch.matchInsights || [];
    
    let message = `Hi ${targetMatch.first_name}! `;
    
    if (compatibility.level === 'excellent') {
      message += `We have excellent compatibility (${targetMatch.matchScore}%) and I think we could be amazing roommates! `;
    } else if (compatibility.level === 'very_good') {
      message += `We have great compatibility (${targetMatch.matchScore}%) and I believe we'd work well together as roommates! `;
    } else {
      message += `I think we could be good roommates based on our ${targetMatch.matchScore}% compatibility. `;
    }
    
    // Add specific insights if available
    const locationInsight = insights.find(i => i.type === 'location' && i.level === 'high');
    const recoveryInsight = insights.find(i => i.type === 'recovery' && i.level === 'high');
    
    if (locationInsight) {
      message += `I noticed we're both looking in the same area. `;
    }
    
    if (recoveryInsight) {
      message += `Our recovery journeys seem very compatible. `;
    }
    
    message += `Would you like to connect and chat more about potentially living together?`;
    
    return message;
  }

  /**
   * SCHEMA COMPLIANT: Update user profile using exact table and field names
   */
  async updateUserProfile(userId, profileData) {
    try {
      console.log('Updating user profile in matching table...');
      
      const updateData = {
        ...profileData,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from(this.matchingTableName)
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Update failed: ${error.message}`);
      }
      
      console.log('User profile updated successfully');
      
      // Invalidate cache for this user
      this.invalidateUserCache(userId);
      
      return { success: true, data };
      
    } catch (err) {
      console.error('Error updating user profile:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * SCHEMA COMPLIANT: Get matching statistics and insights
   */
  async getMatchingStatistics(userId) {
    try {
      const userProfile = await this.loadUserProfile(userId);
      const allProfiles = await this.loadActiveProfiles(userId);
      
      const stats = {
        totalActiveProfiles: allProfiles.length,
        profileCompletion: userProfile.completion_percentage,
        profileQuality: userProfile.profile_quality_score,
        compatibilityDistribution: {
          excellent: 0,  // 85+
          veryGood: 0,   // 75-84
          good: 0,       // 65-74
          moderate: 0,   // 55-64
          low: 0         // <55
        },
        topCompatibilityFactors: {},
        locationMatches: 0,
        recoveryStageMatches: 0,
        algorithmVersion: '2.0_schema_compliant'
      };
      
      // Calculate compatibility with all profiles
      allProfiles.forEach(candidate => {
        const compatibility = calculateDetailedCompatibility(userProfile, candidate);
        const score = compatibility.compatibility_score;
        
        if (score >= 85) stats.compatibilityDistribution.excellent++;
        else if (score >= 75) stats.compatibilityDistribution.veryGood++;
        else if (score >= 65) stats.compatibilityDistribution.good++;
        else if (score >= 55) stats.compatibilityDistribution.moderate++;
        else stats.compatibilityDistribution.low++;
        
        // Count specific matches using schema fields
        if (candidate.primary_location === userProfile.primary_location) {
          stats.locationMatches++;
        }
        
        if (candidate.recovery_stage === userProfile.recovery_stage) {
          stats.recoveryStageMatches++;
        }
      });
      
      return stats;
      
    } catch (err) {
      console.error('Error calculating matching statistics:', err);
      throw err;
    }
  }

  /**
   * Invalidate cached results for a user
   */
  invalidateUserCache(userId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`schema_compliant_matches_${userId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`Invalidated ${keysToDelete.length} cache entries for user ${userId}`);
  }

  /**
   * Clear all cached results
   */
  clearCache() {
    this.cache.clear();
    console.log('Cleared all schema-compliant matching cache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const entry of this.cache.values()) {
      if (this.isCacheValid(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      cacheTimeoutMinutes: this.cacheTimeout / (60 * 1000),
      algorithmVersion: '2.0_schema_compliant'
    };
  }
}

// Export schema-compliant singleton instance
export const schemaCompliantMatchingService = new SchemaCompliantMatchingService();

// Export individual methods for easier testing
export const {
  findMatches,
  sendMatchRequest,
  loadUserProfile,
  loadExcludedUsers,
  loadSentRequests,
  updateUserProfile,
  getMatchingStatistics,
  clearCache,
  getCacheStats
} = schemaCompliantMatchingService;

// Default export
export default schemaCompliantMatchingService;