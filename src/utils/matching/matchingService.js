// src/utils/matching/matchingService.js - ENHANCED WITH COMPLETE DATABASE INTEGRATION - SCHEMA ALIGNED

import { supabase } from '../supabase';
import { calculateDetailedCompatibility } from './algorithm';
import { transformProfileForAlgorithm } from './dataTransform';
import { generateDetailedFlags } from './compatibility';
import { 
  COMPATIBILITY_WEIGHTS,
  MATCHING_THRESHOLDS,
  DEFAULT_FILTERS,
  meetsMinimumThreshold 
} from './config';

/**
 * ✅ ENHANCED: Complete matching service with full database schema integration
 * Works with: applicant_matching_profiles table + enhanced algorithm + priority matrix
 * ✅ FIXED: All database calls now use direct Supabase queries aligned with new schema
 */
class EnhancedMatchingService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    this.tableName = 'applicant_matching_profiles';
  }

  /**
   * Get cache key for a user's matches
   */
  getCacheKey(userId, filters) {
    return `enhanced_matches_${userId}_${JSON.stringify(filters)}`;
  }

  /**
   * Check if cached results are still valid
   */
  isCacheValid(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
  }

  /**
   * ✅ ENHANCED: Generate comprehensive display info with priority breakdown
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
      // ✅ NEW: Enhanced match insights
      matchInsights: this.generateMatchInsights(userProfile, candidateProfile, compatibility),
      compatibilityLevel: this.getCompatibilityLevel(compatibility.compatibility_score),
      recommendationStrength: this.getRecommendationStrength(compatibility)
    };
  }

  /**
   * ✅ NEW: Generate match insights based on compatibility analysis
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
   * ✅ NEW: Get compatibility level description
   */
  getCompatibilityLevel(score) {
    if (score >= 85) return { level: 'excellent', description: 'Highly Compatible' };
    if (score >= 75) return { level: 'very_good', description: 'Very Good Match' };
    if (score >= 65) return { level: 'good', description: 'Good Compatibility' };
    if (score >= 55) return { level: 'moderate', description: 'Moderate Match' };
    return { level: 'low', description: 'Limited Compatibility' };
  }

  /**
   * ✅ NEW: Get recommendation strength based on priority factors
   */
  getRecommendationStrength(compatibility) {
    const { priority_breakdown } = compatibility;
    
    // Strong recommendation if core factors are high
    if (priority_breakdown.core_factors >= 80) {
      return { 
        strength: 'strong', 
        message: 'Highly recommended based on core compatibility factors',
        confidence: 'high'
      };
    }
    
    // Moderate recommendation
    if (priority_breakdown.core_factors >= 65) {
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
   * ✅ ENHANCED: Load user profile from standardized database table
   * ✅ FIXED: Direct Supabase query instead of db service layer
   */
  async loadUserProfile(userId) {
    try {
      console.log(`🔍 Loading user matching profile from ${this.tableName}...`);
      
      // ✅ FIXED: Direct Supabase query to the correct table
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('💥 Database error loading profile:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No matching profile found. Please complete your profile first.');
      }
      
      // Transform for algorithm compatibility
      const transformedProfile = this.transformDatabaseProfile(data);
      
      console.log('✅ User profile loaded and transformed:', {
        user_id: transformedProfile.user_id,
        completion: transformedProfile.completion_percentage,
        location: transformedProfile.primary_location,
        recovery_stage: transformedProfile.recovery_stage
      });
      
      return transformedProfile;
      
    } catch (err) {
      console.error('💥 Error loading user profile:', err);
      throw err;
    }
  }

  /**
   * ✅ NEW: Transform database profile to algorithm format
   */
  transformDatabaseProfile(dbProfile) {
    // Calculate age from date_of_birth if available
    const age = dbProfile.date_of_birth ? 
      Math.floor((new Date() - new Date(dbProfile.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
    
    return {
      // Core identifiers
      id: dbProfile.id,
      user_id: dbProfile.user_id,
      
      // Personal information
      first_name: dbProfile.first_name,
      last_name: dbProfile.last_name,
      email: dbProfile.email,
      age: age,
      primary_phone: dbProfile.primary_phone,
      date_of_birth: dbProfile.date_of_birth,
      
      // Gender & Identity (standardized)
      gender: dbProfile.gender_identity,
      gender_identity: dbProfile.gender_identity,
      biological_sex: dbProfile.biological_sex,
      preferred_roommate_gender: dbProfile.preferred_roommate_gender,
      gender_inclusive: dbProfile.gender_inclusive,
      
      // Location (standardized)
      primary_city: dbProfile.primary_city,
      primary_state: dbProfile.primary_state,
      primary_location: dbProfile.primary_location,
      current_address: dbProfile.current_address,
      current_city: dbProfile.current_city,
      current_state: dbProfile.current_state,
      current_zip_code: dbProfile.current_zip_code,
      target_zip_codes: dbProfile.target_zip_codes,
      search_radius_miles: dbProfile.search_radius_miles,
      location_flexibility: dbProfile.location_flexibility,
      max_commute_minutes: dbProfile.max_commute_minutes,
      transportation_method: dbProfile.transportation_method,
      
      // Budget (standardized)
      budget_min: dbProfile.budget_min,
      budget_max: dbProfile.budget_max,
      
      // Housing assistance (standardized)
      housing_assistance: dbProfile.housing_assistance,
      housing_subsidy: dbProfile.housing_assistance, // Legacy compatibility
      has_section8: dbProfile.has_section8,
      
      // Recovery (standardized)
      recovery_stage: dbProfile.recovery_stage,
      time_in_recovery: dbProfile.time_in_recovery,
      sobriety_date: dbProfile.sobriety_date,
      primary_substance: dbProfile.primary_substance,
      recovery_methods: dbProfile.recovery_methods,
      program_types: dbProfile.program_types,
      treatment_history: dbProfile.treatment_history,
      support_meetings: dbProfile.support_meetings,
      sponsor_mentor: dbProfile.sponsor_mentor,
      primary_issues: dbProfile.primary_issues,
      spiritual_affiliation: dbProfile.spiritual_affiliation,
      
      // Recovery environment (standardized)
      want_recovery_support: dbProfile.want_recovery_support,
      comfortable_discussing_recovery: dbProfile.comfortable_discussing_recovery,
      attend_meetings_together: dbProfile.attend_meetings_together,
      substance_free_home_required: dbProfile.substance_free_home_required, // ✅ FIXED: Correct field name
      recovery_goal_timeframe: dbProfile.recovery_goal_timeframe,
      recovery_context: dbProfile.recovery_context,
      
      // Lifestyle scales (standardized)
      social_level: dbProfile.social_level,
      cleanliness_level: dbProfile.cleanliness_level,
      noise_tolerance: dbProfile.noise_tolerance,
      
      // Schedule & work (standardized)
      work_schedule: dbProfile.work_schedule,
      work_from_home_frequency: dbProfile.work_from_home_frequency,
      bedtime_preference: dbProfile.bedtime_preference,
      early_riser: dbProfile.early_riser,
      night_owl: dbProfile.night_owl,
      
      // Social & guests (standardized)
      guests_policy: dbProfile.guests_policy,
      social_activities_at_home: dbProfile.social_activities_at_home,
      overnight_guests_ok: dbProfile.overnight_guests_ok,
      
      // Daily living
      cooking_enthusiast: dbProfile.cooking_enthusiast,
      cooking_frequency: dbProfile.cooking_frequency,
      exercise_at_home: dbProfile.exercise_at_home,
      plays_instruments: dbProfile.plays_instruments,
      tv_streaming_regular: dbProfile.tv_streaming_regular,
      
      // Communication (standardized)
      communication_style: dbProfile.communication_style,
      conflict_resolution_style: dbProfile.conflict_resolution_style,
      chore_sharing_style: dbProfile.chore_sharing_style,
      chore_sharing_preference: dbProfile.chore_sharing_preference,
      shared_groceries: dbProfile.shared_groceries,
      preferred_support_structure: dbProfile.preferred_support_structure,
      
      // Pets & smoking (standardized)
      pets_owned: dbProfile.pets_owned,
      pets_comfortable: dbProfile.pets_comfortable,
      pet_preference: dbProfile.pet_preference,
      smoking_status: dbProfile.smoking_status,
      smoking_preference: dbProfile.smoking_preference,
      
      // Housing specifications
      housing_types_accepted: dbProfile.housing_types_accepted,
      preferred_bedrooms: dbProfile.preferred_bedrooms,
      furnished_preference: dbProfile.furnished_preference,
      utilities_included_preference: dbProfile.utilities_included_preference,
      accessibility_needed: dbProfile.accessibility_needed,
      parking_required: dbProfile.parking_required,
      public_transit_access: dbProfile.public_transit_access,
      
      // Timing (standardized)
      move_in_date: dbProfile.move_in_date,
      move_in_flexibility: dbProfile.move_in_flexibility,
      lease_duration: dbProfile.lease_duration,
      relocation_timeline: dbProfile.relocation_timeline,
      
      // Goals & aspirations (standardized)
      short_term_goals: dbProfile.short_term_goals,
      long_term_vision: dbProfile.long_term_vision,
      interests: dbProfile.interests,
      additional_interests: dbProfile.additional_interests,
      shared_activities_interest: dbProfile.shared_activities_interest,
      important_qualities: dbProfile.important_qualities,
      deal_breakers: dbProfile.deal_breakers,
      
      // Profile content (standardized)
      about_me: dbProfile.about_me,
      looking_for: dbProfile.looking_for,
      additional_info: dbProfile.additional_info,
      special_needs: dbProfile.special_needs,
      
      // Profile status (standardized)
      is_active: dbProfile.is_active,
      profile_completed: dbProfile.profile_completed,
      profile_visibility: dbProfile.profile_visibility,
      completion_percentage: dbProfile.completion_percentage,
      profile_quality_score: dbProfile.profile_quality_score,
      
      // Emergency contact
      emergency_contact_name: dbProfile.emergency_contact_name,
      emergency_contact_phone: dbProfile.emergency_contact_phone,
      emergency_contact_relationship: dbProfile.emergency_contact_relationship,
      
      // Roommate preferences
      age_range_min: dbProfile.age_range_min,
      age_range_max: dbProfile.age_range_max,
      age_flexibility: dbProfile.age_flexibility,
      prefer_recovery_experience: dbProfile.prefer_recovery_experience,
      supportive_of_recovery: dbProfile.supportive_of_recovery,
      respect_privacy: dbProfile.respect_privacy,
      social_interaction_level: dbProfile.social_interaction_level,
      similar_schedules: dbProfile.similar_schedules,
      shared_chores: dbProfile.shared_chores,
      financially_stable: dbProfile.financially_stable,
      respectful_guests: dbProfile.respectful_guests,
      lgbtq_friendly: dbProfile.lgbtq_friendly,
      culturally_sensitive: dbProfile.culturally_sensitive,
      
      // Deal breakers (specific)
      deal_breaker_substance_use: dbProfile.deal_breaker_substance_use,
      deal_breaker_loudness: dbProfile.deal_breaker_loudness,
      deal_breaker_uncleanliness: dbProfile.deal_breaker_uncleanliness,
      deal_breaker_financial_issues: dbProfile.deal_breaker_financial_issues,
      deal_breaker_pets: dbProfile.deal_breaker_pets,
      deal_breaker_smoking: dbProfile.deal_breaker_smoking,
      
      // Compatibility preferences
      overnight_guests_preference: dbProfile.overnight_guests_preference,
      shared_transportation: dbProfile.shared_transportation,
      recovery_accountability: dbProfile.recovery_accountability,
      shared_recovery_activities: dbProfile.shared_recovery_activities,
      mentorship_interest: dbProfile.mentorship_interest,
      recovery_community: dbProfile.recovery_community,
      
      // Metadata
      created_at: dbProfile.created_at,
      updated_at: dbProfile.updated_at,
      compatibility_scores: dbProfile.compatibility_scores,
      search_preferences: dbProfile.search_preferences,
      matching_weights: dbProfile.matching_weights
    };
  }

  /**
   * ✅ ENHANCED: Load all active profiles with optimized query
   * ✅ FIXED: Direct Supabase query instead of db service layer
   */
  async loadActiveProfiles(excludeUserId = null) {
    try {
      console.log(`🔍 Loading active profiles from ${this.tableName}...`);
      
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .eq('profile_completed', true)
        .order('updated_at', { ascending: false });
      
      if (excludeUserId) {
        query = query.neq('user_id', excludeUserId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('💥 Database error loading profiles:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      const transformedProfiles = data.map(profile => this.transformDatabaseProfile(profile));
      
      console.log(`✅ Loaded ${transformedProfiles.length} active profiles`);
      return transformedProfiles;
      
    } catch (err) {
      console.error('💥 Error loading active profiles:', err);
      throw err;
    }
  }

  /**
   * ✅ ENHANCED: Load excluded users with better query optimization
   * ✅ FIXED: Direct Supabase queries instead of db service layer
   */
  async loadExcludedUsers(userId) {
    try {
      console.log('🚫 Loading excluded users...');
      
      const [requestsResult, groupsResult] = await Promise.all([
        this.loadMatchRequests(userId),
        this.loadMatchGroups(userId)
      ]);

      const excludedUserIds = new Set();

      // Exclude from match requests
      if (requestsResult && requestsResult.length > 0) {
        requestsResult.forEach(request => {
          if (request.request_type === 'roommate' || !request.request_type) {
            const otherUserId = request.requester_id === userId ? request.target_id : request.requester_id;
            
            if (['matched', 'approved'].includes(request.status)) {
              excludedUserIds.add(otherUserId);
              console.log(`🚫 Excluding user ${otherUserId} - active connection (${request.status})`);
            }
          }
        });
      }

      // Exclude from active match groups
      if (groupsResult && groupsResult.length > 0) {
        groupsResult.forEach(group => {
          if (['active', 'forming'].includes(group.status)) {
            [group.applicant_1_id, group.applicant_2_id, group.peer_support_id, group.landlord_id]
              .filter(id => id && id !== userId)
              .forEach(id => {
                excludedUserIds.add(id);
                console.log(`🚫 Excluding user ${id} - active match group member`);
              });
          }
        });
      }

      console.log(`🚫 Total excluded users: ${excludedUserIds.size}`);
      return excludedUserIds;

    } catch (err) {
      console.error('💥 Error loading excluded users:', err);
      return new Set();
    }
  }

  /**
   * ✅ FIXED: Load match requests with error handling - Direct Supabase query
   */
  async loadMatchRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('match_requests')
        .select('*')
        .or(`requester_id.eq.${userId},target_id.eq.${userId}`);
      
      if (error) {
        console.warn('⚠️ Error loading match requests:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.warn('⚠️ Error loading match requests:', err);
      return [];
    }
  }

  /**
   * ✅ FIXED: Load match groups with error handling - Direct Supabase query
   */
  async loadMatchGroups(userId) {
    try {
      // ✅ FIXED: Direct Supabase query to match_groups table
      const { data, error } = await supabase
        .from('match_groups')
        .select('*')
        .or(`applicant_1_id.eq.${userId},applicant_2_id.eq.${userId},peer_support_id.eq.${userId},landlord_id.eq.${userId}`);
      
      if (error) {
        console.warn('⚠️ Error loading match groups:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.warn('⚠️ Error loading match groups:', err);
      return [];
    }
  }

  /**
   * ✅ ENHANCED: Load sent requests for UI feedback
   * ✅ FIXED: Uses direct Supabase calls
   */
  async loadSentRequests(userId) {
    try {
      const requests = await this.loadMatchRequests(userId);
      
      const sentRequestIds = new Set(
        requests
          .filter(req => 
            req.requester_id === userId && 
            (req.request_type === 'roommate' || !req.request_type) &&
            req.status === 'pending'
          )
          .map(req => req.target_id)
      );
      
      console.log(`📤 Found ${sentRequestIds.size} pending roommate requests sent`);
      return sentRequestIds;
      
    } catch (err) {
      console.error('💥 Error loading sent requests:', err);
      return new Set();
    }
  }

  /**
   * ✅ ENHANCED: Find compatible matches with comprehensive filtering
   */
  async findMatches(userId, filters = {}) {
    try {
      const finalFilters = { 
        minScore: 60,
        maxResults: 20,
        hideAlreadyMatched: true,
        hideRequestsSent: true,
        ...filters 
      };
      
      const cacheKey = this.getCacheKey(userId, finalFilters);
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (this.isCacheValid(cached)) {
        console.log('📦 Returning cached enhanced matches');
        return cached.data;
      }

      console.log('🔍 Finding enhanced matches with priority-based algorithm...');

      // Load user profile and exclusions in parallel
      const [userProfile, excludedUsers, sentRequests] = await Promise.all([
        this.loadUserProfile(userId),
        this.loadExcludedUsers(userId),
        this.loadSentRequests(userId)
      ]);

      // Get active profiles
      let candidates = await this.loadActiveProfiles(userId);
      
      console.log(`📊 Found ${candidates.length} active candidate profiles`);

      if (candidates.length === 0) {
        return {
          matches: [],
          userProfile,
          excludedCount: excludedUsers.size,
          sentRequestsCount: sentRequests.size,
          algorithmVersion: '2.0_enhanced'
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
        console.log(`🚫 Excluded already matched: ${beforeExclusion} -> ${candidates.length}`);
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
        console.log(`📤 Excluded sent requests: ${beforeExclusion} -> ${candidates.length}`);
      }

      // Apply additional filters
      candidates = this.applyEnhancedFilters(candidates, finalFilters);

      // Apply deal breaker filters (hard exclusions)
      candidates = this.applyDealBreakerFilters(userProfile, candidates);

      // Calculate enhanced compatibility scores
      const matchesWithScores = candidates.map(candidate => {
        const displayInfo = this.generateDisplayInfo(userProfile, candidate);
        
        return {
          ...candidate,
          ...displayInfo,
          isAlreadyMatched: excludedUsers.has(candidate.user_id),
          isRequestSent: sentRequests.has(candidate.user_id)
        };
      });

      // Filter by minimum score and sort by enhanced score
      const qualifiedMatches = matchesWithScores
        .filter(match => match.matchScore >= finalFilters.minScore)
        .sort((a, b) => {
          // Primary sort by match score
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
          }
          // Secondary sort by core factors if scores are tied
          return b.priorityBreakdown.core_factors - a.priorityBreakdown.core_factors;
        })
        .slice(0, finalFilters.maxResults);

      console.log(`✅ Found ${qualifiedMatches.length} qualified enhanced matches`);

      const result_data = {
        matches: qualifiedMatches,
        userProfile,
        excludedCount: excludedUsers.size,
        sentRequestsCount: sentRequests.size,
        algorithmVersion: '2.0_enhanced',
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
      console.error('💥 Error finding enhanced matches:', err);
      throw err;
    }
  }

  /**
   * ✅ ENHANCED: Apply comprehensive filters using standardized fields
   */
  applyEnhancedFilters(candidates, filters) {
    let filtered = candidates;

    // Recovery stage filter
    if (filters.recoveryStage) {
      filtered = filtered.filter(c => c.recovery_stage === filters.recoveryStage);
    }

    // Age range filter
    if (filters.ageRange) {
      const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
      filtered = filtered.filter(c => 
        c.age && c.age >= minAge && (maxAge ? c.age <= maxAge : true)
      );
    }

    // Location filter (standardized)
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

    // Budget range filter (standardized)
    if (filters.budgetMin || filters.budgetMax) {
      filtered = filtered.filter(c => {
        const candidateBudget = c.budget_max;
        if (!candidateBudget) return true; // Include if no budget specified
        
        if (filters.budgetMin && candidateBudget < filters.budgetMin) return false;
        if (filters.budgetMax && candidateBudget > filters.budgetMax) return false;
        
        return true;
      });
    }

    // Recovery methods filter
    if (filters.recoveryMethods && filters.recoveryMethods.length > 0) {
      filtered = filtered.filter(c => 
        c.recovery_methods && 
        filters.recoveryMethods.some(method => c.recovery_methods.includes(method))
      );
    }

    // Spiritual affiliation filter
    if (filters.spiritualAffiliation) {
      filtered = filtered.filter(c => c.spiritual_affiliation === filters.spiritualAffiliation);
    }

    // Gender preference filter
    if (filters.genderPreference) {
      filtered = filtered.filter(c => c.preferred_roommate_gender === filters.genderPreference);
    }

    // Substance-free home filter ✅ FIXED: Using correct field name
    if (filters.substanceFreeHome !== undefined) {
      filtered = filtered.filter(c => c.substance_free_home_required === filters.substanceFreeHome);
    }

    console.log(`🔍 Applied filters: ${candidates.length} -> ${filtered.length} candidates`);
    return filtered;
  }

  /**
   * ✅ NEW: Apply deal breaker filters (hard exclusions) ✅ FIXED: Using correct field name
   */
  applyDealBreakerFilters(userProfile, candidates) {
    return candidates.filter(candidate => {
      // Check user's deal breakers against candidate
      if (userProfile.deal_breaker_substance_use && candidate.substance_free_home_required === false) {
        console.log(`🚫 Excluding ${candidate.first_name} - substance use deal breaker`);
        return false;
      }
      
      if (userProfile.deal_breaker_pets && candidate.pets_owned) {
        console.log(`🚫 Excluding ${candidate.first_name} - pets deal breaker`);
        return false;
      }
      
      if (userProfile.deal_breaker_smoking && 
          candidate.smoking_status && 
          candidate.smoking_status !== 'non_smoker') {
        console.log(`🚫 Excluding ${candidate.first_name} - smoking deal breaker`);
        return false;
      }
      
      // Check candidate's deal breakers against user ✅ FIXED: Using correct field name
      if (candidate.deal_breaker_substance_use && userProfile.substance_free_home_required === false) {
        console.log(`🚫 Excluding ${candidate.first_name} - their substance use deal breaker`);
        return false;
      }
      
      if (candidate.deal_breaker_pets && userProfile.pets_owned) {
        console.log(`🚫 Excluding ${candidate.first_name} - their pets deal breaker`);
        return false;
      }
      
      if (candidate.deal_breaker_smoking && 
          userProfile.smoking_status && 
          userProfile.smoking_status !== 'non_smoker') {
        console.log(`🚫 Excluding ${candidate.first_name} - their smoking deal breaker`);
        return false;
      }
      
      return true; // No deal breakers violated
    });
  }

  /**
   * ✅ ENHANCED: Send match request with enhanced data
   * ✅ FIXED: Direct Supabase query instead of db service layer
   */
  async sendMatchRequest(currentUserId, targetMatch) {
    try {
      console.log('🤝 Sending enhanced roommate match request to:', targetMatch.first_name);
      
      const requestData = {
        requester_id: currentUserId,
        target_id: targetMatch.user_id,
        request_type: 'roommate',
        match_score: targetMatch.matchScore,
        compatibility_breakdown: targetMatch.priorityBreakdown,
        algorithm_version: targetMatch.algorithmVersion || '2.0_enhanced',
        message: this.generateRequestMessage(targetMatch),
        status: 'pending',
        match_insights: targetMatch.matchInsights,
        recommendation_strength: targetMatch.recommendationStrength?.strength || 'moderate'
      };
      
      // ✅ FIXED: Direct Supabase query
      const { data, error } = await supabase
        .from('match_requests')
        .insert(requestData)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message || 'Failed to send match request');
      }
      
      console.log('✅ Enhanced roommate match request sent successfully:', data);
      
      // Invalidate cache since sent requests have changed
      this.invalidateUserCache(currentUserId);
      
      return { success: true, data };
      
    } catch (err) {
      console.error('💥 Error sending enhanced match request:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * ✅ NEW: Generate personalized request message
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
   * ✅ ENHANCED: Update user profile with new data
   * ✅ FIXED: Direct Supabase query instead of db service layer
   */
  async updateUserProfile(userId, profileData) {
    try {
      console.log(`🔄 Updating user profile in ${this.tableName}...`);
      
      const updateData = {
        ...profileData,
        updated_at: new Date().toISOString()
      };
      
      // ✅ FIXED: Direct Supabase query
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Update failed: ${error.message}`);
      }
      
      console.log('✅ User profile updated successfully');
      
      // Invalidate cache for this user
      this.invalidateUserCache(userId);
      
      return { success: true, data };
      
    } catch (err) {
      console.error('💥 Error updating user profile:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * ✅ ENHANCED: Get match statistics and insights
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
        algorithmVersion: '2.0_enhanced'
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
        
        // Count specific matches
        if (candidate.primary_location === userProfile.primary_location) {
          stats.locationMatches++;
        }
        
        if (candidate.recovery_stage === userProfile.recovery_stage) {
          stats.recoveryStageMatches++;
        }
      });
      
      return stats;
      
    } catch (err) {
      console.error('💥 Error calculating matching statistics:', err);
      throw err;
    }
  }

  /**
   * Invalidate cached results for a user
   */
  invalidateUserCache(userId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`enhanced_matches_${userId}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🗑️ Invalidated ${keysToDelete.length} enhanced cache entries for user ${userId}`);
  }

  /**
   * Clear all cached results
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cleared all enhanced matching cache');
  }

  /**
   * Get enhanced cache statistics
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
      algorithmVersion: '2.0_enhanced'
    };
  }
}

// Export enhanced singleton instance
export const enhancedMatchingService = new EnhancedMatchingService();

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
} = enhancedMatchingService;

// Default export
export default enhancedMatchingService;