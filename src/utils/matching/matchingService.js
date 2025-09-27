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

  /**
   * SCHEMA COMPLIANT: Transform database profile using exact schema fields
   * Includes registrant_profiles data from JOIN
   */
  transformSchemaCompliantProfile(dbProfile) {
    // SCHEMA COMPLIANT: Extract registrant data from JOIN
    const registrantData = dbProfile.registrant_profiles;
    
    // SCHEMA COMPLIANT: Calculate age from date_of_birth
    const age = calculateAge(dbProfile.date_of_birth);
    
    return {
      // CORE IDENTIFIERS (from applicant_matching_profiles)
      id: dbProfile.id,
      user_id: dbProfile.user_id, // References registrant_profiles.id
      
      // REGISTRANT DATA (from JOIN)
      first_name: registrantData?.first_name || 'Unknown',
      last_name: registrantData?.last_name || 'User',
      email: registrantData?.email || '',
      
      // CALCULATED FIELDS
      age: age,
      
      // PERSONAL DETAILS (exact schema fields)
      primary_phone: dbProfile.primary_phone|| [],
      date_of_birth: dbProfile.date_of_birth|| [],
      
      // GENDER & IDENTITY (exact schema fields)
      gender_identity: dbProfile.gender_identity|| [],
      biological_sex: dbProfile.biological_sex|| [],
      preferred_roommate_gender: dbProfile.preferred_roommate_gender|| [],
      gender_inclusive: dbProfile.gender_inclusive|| [],
      
      // Legacy compatibility for algorithm
      gender: dbProfile.gender_identity|| [],
      
      // LOCATION (exact schema fields)
      primary_city: dbProfile.primary_city|| [],
      primary_state: dbProfile.primary_state|| [],
      primary_location: dbProfile.primary_location|| [], // Auto-generated by database
      current_address: dbProfile.current_address|| [],
      current_city: dbProfile.current_city|| [],
      current_state: dbProfile.current_state|| [],
      current_zip_code: dbProfile.current_zip_code|| [],
      target_zip_codes: dbProfile.target_zip_codes|| [],
      search_radius_miles: dbProfile.search_radius_miles|| [],
      location_flexibility: dbProfile.location_flexibility|| [],
      max_commute_minutes: dbProfile.max_commute_minutes|| [],
      transportation_method: dbProfile.transportation_method|| [],
      
      // BUDGET & FINANCIAL (exact schema fields)
      budget_min: dbProfile.budget_min|| [],
      budget_max: dbProfile.budget_max|| [],
      housing_assistance: dbProfile.housing_assistance|| [],
      has_section8: dbProfile.has_section8|| [],
      
      // RECOVERY & WELLNESS (exact schema fields)
      recovery_stage: dbProfile.recovery_stage|| [],
      time_in_recovery: dbProfile.time_in_recovery|| [],
      sobriety_date: dbProfile.sobriety_date|| [],
      primary_substance: dbProfile.primary_substance|| [],
      recovery_methods: dbProfile.recovery_methods|| [],
      program_types: dbProfile.program_types|| [],
      treatment_history: dbProfile.treatment_history|| [],
      support_meetings: dbProfile.support_meetings|| [],
      sponsor_mentor: dbProfile.sponsor_mentor|| [],
      primary_issues: dbProfile.primary_issues|| [],
      spiritual_affiliation: dbProfile.spiritual_affiliation|| [],
      want_recovery_support: dbProfile.want_recovery_support|| [],
      comfortable_discussing_recovery: dbProfile.comfortable_discussing_recovery|| [],
      attend_meetings_together: dbProfile.attend_meetings_together|| [],
      substance_free_home_required: dbProfile.substance_free_home_required|| [],
      recovery_goal_timeframe: dbProfile.recovery_goal_timeframe|| [],
      recovery_context: dbProfile.recovery_context|| [],
      
      // LIFESTYLE & LIVING PREFERENCES (exact schema fields with defaults)
      social_level: dbProfile.social_level || 3,
      cleanliness_level: dbProfile.cleanliness_level || 3,
      noise_tolerance: dbProfile.noise_tolerance || 3,
      work_schedule: dbProfile.work_schedule|| [],
      work_from_home_frequency: dbProfile.work_from_home_frequency|| [],
      bedtime_preference: dbProfile.bedtime_preference|| [],
      early_riser: dbProfile.early_riser|| [],
      night_owl: dbProfile.night_owl|| [],
      guests_policy: dbProfile.guests_policy|| [],
      social_activities_at_home: dbProfile.social_activities_at_home|| [],
      overnight_guests_ok: dbProfile.overnight_guests_ok|| [],
      cooking_enthusiast: dbProfile.cooking_enthusiast|| [],
      cooking_frequency: dbProfile.cooking_frequency|| [],
      exercise_at_home: dbProfile.exercise_at_home|| [],
      plays_instruments: dbProfile.plays_instruments|| [],
      tv_streaming_regular: dbProfile.tv_streaming_regular|| [],
      
      // HOUSEHOLD MANAGEMENT & COMMUNICATION (exact schema fields)
      chore_sharing_style: dbProfile.chore_sharing_style|| [],
      chore_sharing_preference: dbProfile.chore_sharing_preference|| [],
      shared_groceries: dbProfile.shared_groceries|| [],
      communication_style: dbProfile.communication_style|| [],
      conflict_resolution_style: dbProfile.conflict_resolution_style|| [],
      preferred_support_structure: dbProfile.preferred_support_structure|| [],
      
      // PETS & SMOKING (exact schema fields)
      pets_owned: dbProfile.pets_owned|| [],
      pets_comfortable: dbProfile.pets_comfortable|| [],
      pet_preference: dbProfile.pet_preference|| [],
      smoking_status: dbProfile.smoking_status|| [],
      smoking_preference: dbProfile.smoking_preference|| [],
      
      // HOUSING SPECIFICATIONS (exact schema fields)
      housing_types_accepted: dbProfile.housing_types_accepted|| [],
      preferred_bedrooms: dbProfile.preferred_bedrooms|| [],
      furnished_preference: dbProfile.furnished_preference|| [],
      utilities_included_preference: dbProfile.utilities_included_preference|| [],
      accessibility_needed: dbProfile.accessibility_needed|| [],
      parking_required: dbProfile.parking_required|| [],
      public_transit_access: dbProfile.public_transit_access|| [],
      
      // TIMING & AVAILABILITY (exact schema fields)
      move_in_date: dbProfile.move_in_date|| [],
      move_in_flexibility: dbProfile.move_in_flexibility|| [],
      lease_duration: dbProfile.lease_duration|| [],
      relocation_timeline: dbProfile.relocation_timeline|| [],
      
      // GOALS & ASPIRATIONS (exact schema fields)
      short_term_goals: dbProfile.short_term_goals|| [],
      long_term_vision: dbProfile.long_term_vision|| [],
      interests: dbProfile.interests|| [],
      additional_interests: dbProfile.additional_interests|| [],
      shared_activities_interest: dbProfile.shared_activities_interest|| [],
      important_qualities: dbProfile.important_qualities|| [],
      deal_breakers: dbProfile.deal_breakers|| [],
      
      // PROFILE CONTENT & STATUS (exact schema fields)
      about_me: dbProfile.about_me|| [],
      looking_for: dbProfile.looking_for|| [],
      additional_info: dbProfile.additional_info|| [],
      special_needs: dbProfile.special_needs|| [],
      is_active: dbProfile.is_active|| [],
      profile_completed: dbProfile.profile_completed|| [],
      profile_visibility: dbProfile.profile_visibility|| [],
      completion_percentage: dbProfile.completion_percentage|| [],
      profile_quality_score: dbProfile.profile_quality_score|| [],
      
      // EMERGENCY & CONTACT (exact schema fields)
      emergency_contact_name: dbProfile.emergency_contact_name|| [],
      emergency_contact_phone: dbProfile.emergency_contact_phone|| [],
      emergency_contact_relationship: dbProfile.emergency_contact_relationship|| [],
      
      // ROOMMATE PREFERENCES (exact schema fields with defaults)
      age_range_min: dbProfile.age_range_min || 18,
      age_range_max: dbProfile.age_range_max || 65,
      age_flexibility: dbProfile.age_flexibility|| [],
      prefer_recovery_experience: dbProfile.prefer_recovery_experience|| [],
      supportive_of_recovery: dbProfile.supportive_of_recovery|| [],
      respect_privacy: dbProfile.respect_privacy|| [],
      social_interaction_level: dbProfile.social_interaction_level|| [],
      similar_schedules: dbProfile.similar_schedules|| [],
      shared_chores: dbProfile.shared_chores|| [],
      financially_stable: dbProfile.financially_stable|| [],
      respectful_guests: dbProfile.respectful_guests|| [],
      lgbtq_friendly: dbProfile.lgbtq_friendly|| [],
      culturally_sensitive: dbProfile.culturally_sensitive|| [],
      
      // DEAL BREAKERS (exact schema fields)
      deal_breaker_substance_use: dbProfile.deal_breaker_substance_use|| [],
      deal_breaker_loudness: dbProfile.deal_breaker_loudness|| [],
      deal_breaker_uncleanliness: dbProfile.deal_breaker_uncleanliness|| [],
      deal_breaker_financial_issues: dbProfile.deal_breaker_financial_issues|| [],
      deal_breaker_pets: dbProfile.deal_breaker_pets|| [],
      deal_breaker_smoking: dbProfile.deal_breaker_smoking|| [],
      
      // COMPATIBILITY PREFERENCES (exact schema fields)
      overnight_guests_preference: dbProfile.overnight_guests_preference|| [],
      shared_transportation: dbProfile.shared_transportation|| [],
      recovery_accountability: dbProfile.recovery_accountability|| [],
      shared_recovery_activities: dbProfile.shared_recovery_activities|| [],
      mentorship_interest: dbProfile.mentorship_interest|| [],
      recovery_community: dbProfile.recovery_community|| [],
      
      // ALGORITHM METADATA (exact schema fields)
      compatibility_scores: dbProfile.compatibility_scores|| [],
      search_preferences: dbProfile.search_preferences|| [],
      matching_weights: dbProfile.matching_weights|| [],
      last_updated_section: dbProfile.last_updated_section|| [],
      
      // TIMESTAMPS (exact schema fields)
      created_at: dbProfile.created_at|| [],
      updated_at: dbProfile.updated_at|| []
    };
  }

  /**
   * SCHEMA COMPLIANT: Load all active profiles with registrant data JOIN
   */
  async loadActiveProfiles(excludeUserId = null) {
    try {
      console.log('Loading active profiles with registrant data...');
      console.log('🔍 loadActiveProfiles called with excludeUserId:', excludeUserId);
      let query = supabase
        .from(this.matchingTableName)
        .select(`
          *,
          registrant_profiles!user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('is_active', true)
        .eq('profile_completed', true)
        .order('updated_at', { ascending: false });
      
      if (excludeUserId) {
        query = query.neq('user_id', excludeUserId);
        if (excludeUserId) {
  console.log('🔍 Adding exclude filter for user_id:', excludeUserId);
  query = query.neq('user_id', excludeUserId);
}
      }
      
      const { data, error } = await query;
      console.log('🔍 Raw database results:', {
  error: error?.message,
  dataLength: data?.length || 0,
  data: data?.map(d => ({
    user_id: d.user_id,
    first_name: d.registrant_profiles?.first_name,
    primary_city: d.primary_city,
    recovery_stage: d.recovery_stage
  }))
});
      if (error) {
        console.error('Database error loading profiles:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      const transformedProfiles = data.map(profile => this.transformSchemaCompliantProfile(profile));
      
console.log(`✅ Transformed ${transformedProfiles.length} profiles:`, 
  transformedProfiles.map(p => ({ 
    user_id: p.user_id, 
    first_name: p.first_name,
    primary_city: p.primary_city 
  }))
);
      
    } catch (err) {
      console.error('Error loading active profiles:', err);
      throw err;
    }
  }

  /**
   * SCHEMA COMPLIANT: Load excluded users using exact table names
   */
  async loadExcludedUsers(userId) {
    try {
      console.log('Loading excluded users...');
      
      const [requestsResult, groupsResult] = await Promise.all([
        this.loadMatchRequests(userId),
        this.loadMatchGroups(userId)
      ]);

      const excludedUserIds = new Set();

      // Exclude from match requests
      if (requestsResult && requestsResult.length > 0) {
        requestsResult.forEach(request => {
          if (request.request_type === 'roommate' || request.request_type === 'housing') {
            // SCHEMA COMPLIANT: Use correct field names from match_requests table
            const otherUserId = request.requester_type === 'applicant' && request.requester_id === userId ? 
                              request.recipient_id : request.requester_id;
            
            if (['accepted', 'matched'].includes(request.status)) {
              excludedUserIds.add(otherUserId);
              console.log(`Excluding user ${otherUserId} - active connection (${request.status})`);
            }
          }
        });
      }

      // Exclude from active match groups
      if (groupsResult && groupsResult.length > 0) {
        groupsResult.forEach(group => {
          if (['active', 'forming', 'confirmed'].includes(group.status)) {
            // SCHEMA COMPLIANT: Use correct field names from match_groups table
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
  async loadMatchRequests(userId) {
    try {
      // SCHEMA COMPLIANT: Query match_requests table with correct field names
      const { data, error } = await supabase
        .from(this.requestsTableName)
        .select('*')
        .or(`and(requester_type.eq.applicant,requester_id.eq.${userId}),and(recipient_type.eq.applicant,recipient_id.eq.${userId})`);
      
      if (error) {
        console.warn('Error loading match requests:', error);
        return [];
      }
      
      return data || [];
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
      const requests = await this.loadMatchRequests(userId);
      
      const sentRequestIds = new Set(
        requests
          .filter(req => 
            req.requester_type === 'applicant' &&
            req.requester_id === userId && 
            (req.request_type === 'housing' || req.request_type === 'roommate') &&
            req.status === 'pending'
          )
          .map(req => req.recipient_id)
      );
      
      console.log(`Found ${sentRequestIds.size} pending requests sent`);
      return sentRequestIds;
      
    } catch (err) {
      console.error('Error loading sent requests:', err);
      return new Set();
    }
  }

  /**
   * SCHEMA COMPLIANT: Find compatible matches with comprehensive filtering
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
      
      const cacheKey = this.getCacheKey(userId, finalFilters);
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (this.isCacheValid(cached)) {
        console.log('Returning cached schema-compliant matches');
        return cached.data;
      }

      console.log('Finding schema-compliant matches...');

      // Load user profile and exclusions in parallel
      const [userProfile, excludedUsers, sentRequests] = await Promise.all([
        this.loadUserProfile(userId),
        this.loadExcludedUsers(userId),
        this.loadSentRequests(userId)
      ]);

      // Get active profiles
      let candidates = await this.loadActiveProfiles(userId);
      console.log('🔍 Debug candidates structure:', candidates.map(c => ({
  user_id: c.user_id,
  first_name: c.first_name,
  recovery_methods_type: typeof c.recovery_methods,
  recovery_methods_isArray: Array.isArray(c.recovery_methods),
  recovery_methods_value: c.recovery_methods,
  primary_issues_type: typeof c.primary_issues,
  primary_issues_isArray: Array.isArray(c.primary_issues),
  primary_issues_value: c.primary_issues
})));
      console.log(`Found ${candidates.length} active candidate profiles`);

      if (candidates.length === 0) {
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
            console.log(`Hiding ${candidate.first_name} - already matched/connected`);
          }
          return !isExcluded;
        });
        console.log(`Excluded already matched: ${beforeExclusion} -> ${candidates.length}`);
      }

      if (finalFilters.hideRequestsSent) {
        const beforeExclusion = candidates.length;
        candidates = candidates.filter(candidate => {
          const isRequestSent = sentRequests.has(candidate.user_id);
          if (isRequestSent) {
            console.log(`Hiding ${candidate.first_name} - request already sent`);
          }
          return !isRequestSent;
        });
        console.log(`Excluded sent requests: ${beforeExclusion} -> ${candidates.length}`);
      }

      // Apply filters and deal breakers
      candidates = this.applySchemaCompliantFilters(candidates, finalFilters);
      candidates = this.applySchemaCompliantDealBreakerFilters(userProfile, candidates);

      // Calculate compatibility scores
      const matchesWithScores = candidates.map(candidate => {
        const displayInfo = this.generateDisplayInfo(userProfile, candidate);
        
        return {
          ...candidate,
          ...displayInfo,
          isAlreadyMatched: excludedUsers.has(candidate.user_id),
          isRequestSent: sentRequests.has(candidate.user_id)
        };
      });

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

      console.log(`Found ${qualifiedMatches.length} qualified schema-compliant matches`);

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

      return result_data;

    } catch (err) {
      console.error('Error finding schema-compliant matches:', err);
      throw err;
    }
  }

  /**
   * SCHEMA COMPLIANT: Apply filters using exact schema field names
   */
  applySchemaCompliantFilters(candidates, filters) {
    let filtered = candidates;

    // Recovery stage filter (exact schema field)
    if (filters.recoveryStage) {
      filtered = filtered.filter(c => c.recovery_stage === filters.recoveryStage);
    }

    // Age range filter (calculated age)
    if (filters.ageRange) {
      const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
      filtered = filtered.filter(c => 
        c.age && c.age >= minAge && (maxAge ? c.age <= maxAge : true)
      );
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
    }

    // Recovery methods filter (schema field: recovery_methods array)
    if (filters.recoveryMethods && filters.recoveryMethods.length > 0) {
      filtered = filtered.filter(c => 
        c.recovery_methods && 
        filters.recoveryMethods.some(method => c.recovery_methods.includes(method))
      );
    }

    // Spiritual affiliation filter (schema field: spiritual_affiliation)
    if (filters.spiritualAffiliation) {
      filtered = filtered.filter(c => c.spiritual_affiliation === filters.spiritualAffiliation);
    }

    // Gender preference filter (schema field: preferred_roommate_gender)
    if (filters.genderPreference) {
      filtered = filtered.filter(c => c.preferred_roommate_gender === filters.genderPreference);
    }

    // Substance-free home filter (schema field: substance_free_home_required)
    if (filters.substanceFreeHome !== undefined) {
      filtered = filtered.filter(c => c.substance_free_home_required === filters.substanceFreeHome);
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
  async sendMatchRequest(currentUserId, targetMatch) {
    try {
      console.log('Sending schema-compliant match request to:', targetMatch.first_name);
      
      // SCHEMA COMPLIANT: Use exact match_requests table fields
      const requestData = {
        requester_type: 'applicant',
        requester_id: currentUserId,
        recipient_type: 'applicant', 
        recipient_id: targetMatch.user_id,
        request_type: 'housing',
        message: this.generateRequestMessage(targetMatch),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from(this.requestsTableName)
        .insert(requestData)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to send match request');
      }
      
      console.log('Schema-compliant match request sent successfully:', data);
      
      // Invalidate cache since sent requests have changed
      this.invalidateUserCache(currentUserId);
      
      return { success: true, data };
      
    } catch (err) {
      console.error('Error sending schema-compliant match request:', err);
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