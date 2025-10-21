// src/utils/matching/matchingService.js - SCHEMA COMPLIANT VERSION

import { supabase } from '../supabase';
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
  const version = 'v2'; // Increment this whenever schema changes
  return `schema_compliant_matches_${version}_${userId}_${JSON.stringify(filters)}`;
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
 * Calculate time in recovery from sobriety date
 */
calculateRecoveryTime(sobrietyDate) {
  if (!sobrietyDate) return null;
  
  const daysDiff = Math.floor((new Date() - new Date(sobrietyDate)) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 30) return `${daysDiff} days`;
  if (daysDiff < 365) return `${Math.floor(daysDiff / 30)} months`;
  return `${Math.floor(daysDiff / 365)} years`;
}
/**
 * Calculate recovery stage from sobriety date
 * @param {string|Date} sobrietyDate - ISO date string or Date object
 * @returns {string} Recovery stage identifier
 */
calculateRecoveryStage(sobrietyDate) {
  if (!sobrietyDate) return null;
  
  const daysSober = Math.floor(
    (new Date() - new Date(sobrietyDate)) / (1000 * 60 * 60 * 24)
  );
  
  // Standard recovery stage thresholds
  if (daysSober < 90) return 'early';                    // 0-3 months
  if (daysSober < 365) return 'stabilizing';             // 3-12 months
  if (daysSober < 1095) return 'stable';                 // 1-3 years
  if (daysSober < 1825) return 'long-term';              // 3-5 years
  return 'maintenance';                                   // 5+ years
}

transformSchemaCompliantProfile(dbProfile) {
  try {
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
    
    // Calculate age safely
    const age = dbProfile.date_of_birth ? calculateAge(dbProfile.date_of_birth) : null;
    
    const result = {
      // CORE IDENTIFIERS (from applicant_matching_profiles)
      id: dbProfile.id,
      user_id: dbProfile.user_id,
      
      // REGISTRANT DATA (from JOIN) - with fallbacks
      first_name: registrantData?.first_name || 'Unknown',
      last_name: registrantData?.last_name || 'User',
      email: registrantData?.email || '',
      
      // CALCULATED FIELDS
      age: age,
      
      // PERSONAL IDENTITY & DEMOGRAPHICS
      primary_phone: dbProfile.primary_phone,
      date_of_birth: dbProfile.date_of_birth,
      gender_identity: dbProfile.gender_identity,
      biological_sex: dbProfile.biological_sex,
      preferred_roommate_gender: dbProfile.preferred_roommate_gender,
      gender_inclusive: dbProfile.gender_inclusive,
      
      // LOCATION & GEOGRAPHY
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
      
      // BUDGET & FINANCIAL
      budget_min: dbProfile.budget_min,
      budget_max: dbProfile.budget_max,
      housing_assistance: dbProfile.housing_assistance,
      has_section8: dbProfile.has_section8,
      
      // RECOVERY & WELLNESS
      recovery_stage: dbProfile.recovery_stage,
      sobriety_date: dbProfile.sobriety_date,
      calculated_time_in_recovery: this.calculateRecoveryTime(dbProfile.sobriety_date),
      calculated_recovery_stage: this.calculateRecoveryStage(dbProfile.sobriety_date),
      primary_substance: dbProfile.primary_substance,
      recovery_methods: dbProfile.recovery_methods || [],
      program_types: dbProfile.program_types || [],
      treatment_history: dbProfile.treatment_history,
      support_meetings: dbProfile.support_meetings,
      sponsor_mentor: dbProfile.sponsor_mentor,
      primary_issues: dbProfile.primary_issues || [],
      spiritual_affiliation: dbProfile.spiritual_affiliation,
      want_recovery_support: dbProfile.want_recovery_support,
      comfortable_discussing_recovery: dbProfile.comfortable_discussing_recovery,
      attend_meetings_together: dbProfile.attend_meetings_together,
      substance_free_home_required: dbProfile.substance_free_home_required,
      recovery_goal_timeframe: dbProfile.recovery_goal_timeframe,
      recovery_context: dbProfile.recovery_context,
      
      // LIFESTYLE & LIVING PREFERENCES
      social_level: dbProfile.social_level,
      cleanliness_level: dbProfile.cleanliness_level,
      noise_tolerance: dbProfile.noise_tolerance,
      work_schedule: dbProfile.work_schedule,
      work_from_home_frequency: dbProfile.work_from_home_frequency,
      bedtime_preference: dbProfile.bedtime_preference,
      early_riser: dbProfile.early_riser,
      night_owl: dbProfile.night_owl,
      guests_policy: dbProfile.guests_policy,
      social_activities_at_home: dbProfile.social_activities_at_home,
      overnight_guests_ok: dbProfile.overnight_guests_ok,
      cooking_enthusiast: dbProfile.cooking_enthusiast,
      cooking_frequency: dbProfile.cooking_frequency,
      exercise_at_home: dbProfile.exercise_at_home,
      plays_instruments: dbProfile.plays_instruments,
      tv_streaming_regular: dbProfile.tv_streaming_regular,
      
      // HOUSEHOLD MANAGEMENT & COMMUNICATION
      chore_sharing_style: dbProfile.chore_sharing_style,
      chore_sharing_preference: dbProfile.chore_sharing_preference,
      shared_groceries: dbProfile.shared_groceries,
      communication_style: dbProfile.communication_style,
      conflict_resolution_style: dbProfile.conflict_resolution_style,
      preferred_support_structure: dbProfile.preferred_support_structure,
      
      // PETS & SMOKING
      pets_owned: dbProfile.pets_owned,
      pets_comfortable: dbProfile.pets_comfortable,
      pet_preference: dbProfile.pet_preference,
      smoking_status: dbProfile.smoking_status,
      smoking_preference: dbProfile.smoking_preference,
      
      // HOUSING SPECIFICATIONS
      housing_types_accepted: dbProfile.housing_types_accepted || [],
      preferred_bedrooms: dbProfile.preferred_bedrooms,
      furnished_preference: dbProfile.furnished_preference,
      utilities_included_preference: dbProfile.utilities_included_preference,
      accessibility_needed: dbProfile.accessibility_needed,
      parking_required: dbProfile.parking_required,
      public_transit_access: dbProfile.public_transit_access,
      
      // TIMING & AVAILABILITY
      move_in_date: dbProfile.move_in_date,
      move_in_flexibility: dbProfile.move_in_flexibility,
      lease_duration: dbProfile.lease_duration,
      relocation_timeline: dbProfile.relocation_timeline,
      
      // GOALS & ASPIRATIONS
      short_term_goals: dbProfile.short_term_goals,
      long_term_vision: dbProfile.long_term_vision,
      interests: dbProfile.interests || [],
      additional_interests: dbProfile.additional_interests,
      shared_activities_interest: dbProfile.shared_activities_interest,
      important_qualities: dbProfile.important_qualities || [],
      deal_breakers: dbProfile.deal_breakers || [],
      
      // PROFILE CONTENT & STATUS
      about_me: dbProfile.about_me,
      looking_for: dbProfile.looking_for,
      additional_info: dbProfile.additional_info,
      special_needs: dbProfile.special_needs,
      is_active: dbProfile.is_active,
      profile_completed: dbProfile.profile_completed,
      profile_visibility: dbProfile.profile_visibility,
      
      // EMERGENCY CONTACT
      emergency_contact_name: dbProfile.emergency_contact_name,
      emergency_contact_phone: dbProfile.emergency_contact_phone,
      emergency_contact_relationship: dbProfile.emergency_contact_relationship,
      
      // ROOMMATE PREFERENCES
      age_range_min: dbProfile.age_range_min,
      age_range_max: dbProfile.age_range_max,
      age_flexibility: dbProfile.age_flexibility,
      prefer_recovery_experience: dbProfile.prefer_recovery_experience,
      supportive_of_recovery: dbProfile.supportive_of_recovery,
      respect_privacy: dbProfile.respect_privacy,
      similar_schedules: dbProfile.similar_schedules,
      shared_chores: dbProfile.shared_chores,
      financially_stable: dbProfile.financially_stable,
      respectful_guests: dbProfile.respectful_guests,
      lgbtq_friendly: dbProfile.lgbtq_friendly,
      culturally_sensitive: dbProfile.culturally_sensitive,
      
      // DEAL BREAKERS
      deal_breaker_substance_use: dbProfile.deal_breaker_substance_use,
      deal_breaker_loudness: dbProfile.deal_breaker_loudness,
      deal_breaker_uncleanliness: dbProfile.deal_breaker_uncleanliness,
      deal_breaker_financial_issues: dbProfile.deal_breaker_financial_issues,
      deal_breaker_pets: dbProfile.deal_breaker_pets,
      deal_breaker_smoking: dbProfile.deal_breaker_smoking,
      
      // COMPATIBILITY PREFERENCES
      overnight_guests_preference: dbProfile.overnight_guests_preference,
      shared_transportation: dbProfile.shared_transportation,
      recovery_accountability: dbProfile.recovery_accountability,
      shared_recovery_activities: dbProfile.shared_recovery_activities,
      mentorship_interest: dbProfile.mentorship_interest,
      recovery_community: dbProfile.recovery_community,
      
      // ALGORITHM METADATA & SCORING
      completion_percentage: dbProfile.completion_percentage,
      profile_quality_score: dbProfile.profile_quality_score,
      last_updated_section: dbProfile.last_updated_section,
      compatibility_scores: dbProfile.compatibility_scores,
      search_preferences: dbProfile.search_preferences,
      matching_weights: dbProfile.matching_weights,
      
      // TIMESTAMPS
      created_at: dbProfile.created_at,
      updated_at: dbProfile.updated_at
    };
    
    // DEBUGGING: Check final result
    console.log('🔍 DEBUG - Transformed profile:', {
      id: result.id,
      user_id: result.user_id,
      first_name: result.first_name,
      last_name: result.last_name,
      email: result.email,
      age: result.age,
      primary_location: result.primary_location,
      recovery_stage: result.recovery_stage
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Error transforming profile:', error);
    console.error('Raw dbProfile that caused error:', dbProfile);
    
    // Return minimal profile to prevent complete failure
    return {
      id: dbProfile.id,
      user_id: dbProfile.user_id,
      first_name: 'Unknown',
      last_name: 'User',
      email: '',
      age: null,
      primary_location: dbProfile.primary_location || 'Unknown',
      recovery_stage: dbProfile.recovery_stage || 'Unknown',
      // Include essential fields with safe defaults
      budget_min: dbProfile.budget_min || 0,
      budget_max: dbProfile.budget_max || 0,
      recovery_methods: dbProfile.recovery_methods || [],
      primary_issues: dbProfile.primary_issues || [],
      interests: dbProfile.interests || [],
      about_me: dbProfile.about_me || '',
      looking_for: dbProfile.looking_for || '',
      is_active: dbProfile.is_active || false,
      profile_completed: dbProfile.profile_completed || false
    };
  }
}


async testJoinRelationship() {
  try {
    console.log('=== TESTING JOIN RELATIONSHIP ===');
    
    // Test: Get one applicant profile with JOIN
    const { data, error } = await supabase
      .from('applicant_matching_profiles')
      .select(`
        id,
        user_id,
        primary_city,
        registrant_profiles!user_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('is_active', true)
      .eq('profile_completed', true)
      .limit(1)
      .single();
    
    console.log('Test result:', {
      error: error?.message,
      hasData: !!data,
      registrant_profiles: data?.registrant_profiles,
      first_name: data?.registrant_profiles?.first_name
    });
    
    return data;
  } catch (error) {
    console.error('Test failed:', error);
  }
}
// FIXED: loadActiveProfiles method with correct JOIN syntax
async loadActiveProfiles(excludeUserId = null) {
  try {
    console.log('🔍 Loading active profiles with registrant data...');
    console.log('🔍 excludeUserId:', excludeUserId);
    
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
      console.error('❌ Database error loading active profiles:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.log('ℹ️ No active profiles found');
      return [];
    }
    
    console.log(`📋 Processing ${data.length} raw profiles...`);
    
    const transformedProfiles = [];
    
    for (let i = 0; i < data.length; i++) {
      const profile = data[i];
      try {
        console.log(`🔄 Transforming profile ${i + 1}/${data.length}: user_id ${profile.user_id}`);
        const transformed = this.transformSchemaCompliantProfile(profile);
        transformedProfiles.push(transformed);
        console.log(`✅ Successfully transformed: ${transformed.first_name} ${transformed.last_name}`);
      } catch (transformError) {
        console.error(`❌ Failed to transform profile ${profile.user_id}:`, transformError);
        // Continue processing other profiles instead of failing completely
      }
    }
    
    console.log(`✅ Successfully transformed ${transformedProfiles.length}/${data.length} profiles`);
    
    // Log sample of transformed profiles for verification
    if (transformedProfiles.length > 0) {
      console.log('📊 Sample transformed profiles:', 
        transformedProfiles.slice(0, 3).map(p => ({ 
          user_id: p.user_id, 
          first_name: p.first_name,
          last_name: p.last_name,
          primary_location: p.primary_location,
          recovery_stage: p.recovery_stage,
          registrant_data_valid: !!(p.first_name && p.first_name !== 'Unknown')
        }))
      );
    }
    
    return transformedProfiles;
    
  } catch (err) {
    console.error('💥 Error in loadActiveProfiles:', err);
    throw err;
  }
}

// FIXED: loadUserProfile method with correct JOIN syntax  
async loadUserProfile(userId) {
  try {
    console.log('🔍 Loading user matching profile with registrant data for userId:', userId);
    
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
      console.error('❌ Database error loading user profile:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data) {
      console.error('❌ No matching profile found for userId:', userId);
      throw new Error('No matching profile found. Please complete your profile first.');
    }
    
    console.log('✅ Raw user profile loaded:', {
      id: data.id,
      user_id: data.user_id,
      registrant_data: data.registrant_profiles,
      first_name_from_join: data.registrant_profiles?.first_name
    });
    
    const transformedProfile = this.transformSchemaCompliantProfile(data);
    
    console.log('✅ User profile transformed successfully:', {
      user_id: transformedProfile.user_id,
      first_name: transformedProfile.first_name,
      completion: transformedProfile.completion_percentage,
      location: transformedProfile.primary_location,
      recovery_stage: transformedProfile.recovery_stage
    });
    
    return transformedProfile;
    
  } catch (err) {
    console.error('💥 Error in loadUserProfile:', err);
    throw err;
  }
}

/**
 * Load excluded users from match_groups, peer_support_matches, and employment_matches
 * Includes BIDIRECTIONAL exclusion: both confirmed connections AND pending requests
 * @param {string} userId - Registrant profile ID
 * @returns {Set} Set of excluded user IDs (registrant profile IDs)
 */
async loadExcludedUsers(userId) {
  try {
    console.log('Loading excluded users for:', userId);
    
    // Get the user's applicant profile ID
    const { data: userApplicant } = await supabase
      .from('applicant_matching_profiles')
      .select('id, user_id')
      .eq('user_id', userId)
      .single();
    
    if (!userApplicant) {
      console.warn('No applicant profile found for user:', userId);
      return new Set();
    }
    
    const userApplicantId = userApplicant.id;
    console.log('User applicant profile ID:', userApplicantId);
    
    const excludedUserIds = new Set();

    // ===== MATCH GROUPS (Roommate Connections) =====
    
    // 1A. Exclude confirmed group members (in roommate_ids)
    const { data: confirmedGroups } = await supabase
      .from('match_groups')
      .select('roommate_ids, status')
      .contains('roommate_ids', JSON.stringify([userApplicantId]));
    
    if (confirmedGroups && confirmedGroups.length > 0) {
      for (const group of confirmedGroups) {
        if (['requested', 'forming', 'confirmed', 'active'].includes(group.status)) {
          const roommateIds = group.roommate_ids || [];
          
          for (const roommateId of roommateIds) {
            if (roommateId !== userApplicantId) {
              try {
                const { data: roommate } = await supabase
                  .from('applicant_matching_profiles')
                  .select('user_id')
                  .eq('id', roommateId)
                  .single();
                
                if (roommate) {
                  excludedUserIds.add(roommate.user_id);
                  console.log(`Excluding user ${roommate.user_id} - confirmed group member ${group.status}`);
                }
              } catch (err) {
                console.warn('Could not find applicant profile for ID:', roommateId);
              }
            }
          }
        }
      }
    }

    // 1B. Exclude pending invitations WHERE USER IS INVITEE (in pending_member_ids)
    const { data: pendingInviteeGroups } = await supabase
      .from('match_groups')
      .select('roommate_ids, pending_member_ids, status')
      .contains('pending_member_ids', JSON.stringify([userApplicantId]));
    
    if (pendingInviteeGroups && pendingInviteeGroups.length > 0) {
      for (const group of pendingInviteeGroups) {
        if (['requested', 'forming', 'active'].includes(group.status)) {
          const roommateIds = group.roommate_ids || [];
          
          // Exclude all confirmed members from this group I'm invited to
          for (const roommateId of roommateIds) {
            try {
              const { data: roommate } = await supabase
                .from('applicant_matching_profiles')
                .select('user_id')
                .eq('id', roommateId)
                .single();
              
              if (roommate) {
                excludedUserIds.add(roommate.user_id);
                console.log(`Excluding user ${roommate.user_id} - pending invitation from them`);
              }
            } catch (err) {
              console.warn('Could not find applicant profile for ID:', roommateId);
            }
          }
        }
      }
    }

    // 1C. Exclude pending invitations WHERE USER IS INVITER (requested_by_id)
    const { data: pendingInviterGroups } = await supabase
      .from('match_groups')
      .select('roommate_ids, pending_member_ids, status')
      .eq('requested_by_id', userApplicantId);
    
    if (pendingInviterGroups && pendingInviterGroups.length > 0) {
      for (const group of pendingInviterGroups) {
        if (['requested', 'forming', 'active'].includes(group.status)) {
          const pendingIds = group.pending_member_ids || [];
          
          // Exclude all pending invitees
          for (const pendingId of pendingIds) {
            try {
              const { data: pendingMember } = await supabase
                .from('applicant_matching_profiles')
                .select('user_id')
                .eq('id', pendingId)
                .single();
              
              if (pendingMember) {
                excludedUserIds.add(pendingMember.user_id);
                console.log(`Excluding user ${pendingMember.user_id} - pending invitation to them`);
              }
            } catch (err) {
              console.warn('Could not find applicant profile for ID:', pendingId);
            }
          }
        }
      }
    }

    // ===== PEER SUPPORT MATCHES =====
    const { data: peerMatches } = await supabase
      .from('peer_support_matches')
      .select('applicant_id, peer_support_id, status')
      .or(`applicant_id.eq.${userApplicantId},peer_support_id.eq.${userApplicantId}`);
    
    if (peerMatches && peerMatches.length > 0) {
      for (const match of peerMatches) {
        if (['requested', 'active'].includes(match.status)) {
          const otherProfileId = match.applicant_id === userApplicantId ? 
            match.peer_support_id : match.applicant_id;
          
          excludedUserIds.add(otherProfileId);
          console.log(`Excluding user ${otherProfileId} - peer support ${match.status}`);
        }
      }
    }

    // ===== EMPLOYMENT MATCHES =====
    const { data: employmentMatches } = await supabase
      .from('employment_matches')
      .select('applicant_id, employer_id, status')
      .or(`applicant_id.eq.${userApplicantId}`);
    
    if (employmentMatches && employmentMatches.length > 0) {
      for (const match of employmentMatches) {
        if (['requested', 'active'].includes(match.status)) {
          excludedUserIds.add(match.employer_id);
          console.log(`Excluding employer ${match.employer_id} - employment ${match.status}`);
        }
      }
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
 * Load match groups (still used for exclusion logic)
 */
async loadMatchGroups(userId) {
  try {
    // Get the user's applicant profile ID
    const { data: userApplicant } = await supabase
      .from('applicant_matching_profiles')
      .select('id, user_id')
      .eq('user_id', userId)
      .single();
    
    if (!userApplicant) {
      console.warn('No applicant profile found for user:', userId);
      return [];
    }
    
    const userApplicantId = userApplicant.id;
    
    // Query match_groups where user is in roommate_ids
    const { data, error } = await supabase
      .from('match_groups')
      .select('*')
      .contains('roommate_ids', JSON.stringify([userApplicantId]));
    
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
 * Load sent requests from match_groups for UI feedback
 * Includes both initial requests AND group expansion invitations
 * @param {string} userId - Registrant profile ID
 * @returns {Set} Set of user IDs with pending requests
 */
async loadSentRequests(userId) {
  try {
    // Get the user's applicant profile ID
    const { data: userApplicant } = await supabase
      .from('applicant_matching_profiles')
      .select('id, user_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!userApplicant) {
      console.warn('No applicant profile found for user:', userId);
      return new Set();
    }
    
    const userApplicantId = userApplicant.id;
    const sentRequestIds = new Set();
    
    // ✅ CASE 1: Initial 2-person requests (status = 'requested')
    const { data: requestedGroups } = await supabase
      .from('match_groups')
      .select('roommate_ids, pending_member_ids, requested_by_id, status')
      .eq('requested_by_id', userApplicantId)
      .eq('status', 'requested');
    
    if (requestedGroups && requestedGroups.length > 0) {
      for (const group of requestedGroups) {
        const pendingIds = group.pending_member_ids || [];
        
        for (const pendingId of pendingIds) {
          try {
            const { data: pendingMember } = await supabase
              .from('applicant_matching_profiles')
              .select('user_id')
              .eq('id', pendingId)
              .maybeSingle();
            
            if (pendingMember) {
              sentRequestIds.add(pendingMember.user_id);
              console.log(`📤 Found initial pending request to: ${pendingMember.user_id}`);
            }
          } catch (err) {
            console.warn('Could not find pending member:', pendingId);
          }
        }
      }
    }
    
    // ✅ CASE 2: Group expansion invitations (status = 'active', check member_confirmations)
    const { data: activeGroups } = await supabase
      .from('match_groups')
      .select('roommate_ids, pending_member_ids, member_confirmations, status')
      .contains('roommate_ids', JSON.stringify([userApplicantId]))
      .eq('status', 'active');
    
    if (activeGroups && activeGroups.length > 0) {
      for (const group of activeGroups) {
        const pendingIds = group.pending_member_ids || [];
        const confirmations = group.member_confirmations || {};
        
        // Check if current user invited any pending members
        for (const pendingId of pendingIds) {
          const confirmation = confirmations[pendingId];
          
          if (confirmation && confirmation.invited_by === userApplicantId) {
            try {
              const { data: pendingMember } = await supabase
                .from('applicant_matching_profiles')
                .select('user_id')
                .eq('id', pendingId)
                .maybeSingle();
              
              if (pendingMember) {
                sentRequestIds.add(pendingMember.user_id);
                console.log(`📤 Found group expansion invite to: ${pendingMember.user_id}`);
              }
            } catch (err) {
              console.warn('Could not find pending member:', pendingId);
            }
          }
        }
      }
    }
    
    console.log(`Found ${sentRequestIds.size} pending requests sent (initial + group expansions)`);
    return sentRequestIds;
    
  } catch (err) {
    console.error('Error loading sent requests:', err);
    return new Set();
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
 * ✅ FIX #1: Send match request - try user_id FIRST, then id as fallback
 * Send match request by creating a match_groups entry
 * @param {string} currentUserId - Current user's registrant profile ID
 * @param {Object} targetMatch - Target match profile
 * @returns {Object} Success response
 */
async sendMatchRequest(currentUserId, targetMatch) {
  try {
    console.log('🤝 Sending roommate match request to:', targetMatch.first_name);
    
    // ✅ FIXED: Try user_id FIRST (registrant profile ID), then id as fallback
    let senderApplicantId;
    try {
      // FIRST: Try as registrant profile ID (most common case)
      let { data: senderApplicant } = await supabase
        .from('applicant_matching_profiles')
        .select('id, user_id')
        .eq('user_id', currentUserId)
        .maybeSingle();  // ✅ Use maybeSingle for safer lookups
      
      if (senderApplicant) {
        senderApplicantId = senderApplicant.id;
        console.log('✅ currentUserId is registrant profile ID, found applicant ID:', senderApplicantId);
      } else {
        // FALLBACK: Try as applicant profile ID
        ({ data: senderApplicant } = await supabase
          .from('applicant_matching_profiles')
          .select('id, user_id')
          .eq('id', currentUserId)
          .maybeSingle());
        
        if (senderApplicant) {
          senderApplicantId = senderApplicant.id;
          console.log('✅ currentUserId is applicant profile ID:', senderApplicantId);
        } else {
          throw new Error('Could not find sender applicant profile');
        }
      }
    } catch (err) {
      console.error('❌ Error finding sender applicant profile:', err);
      throw new Error('Could not find your applicant profile');
    }
    
    if (!senderApplicantId) {
      throw new Error('Could not determine sender applicant profile ID');
    }
    
    // Get target's applicant profile ID
    let targetApplicantId;
    try {
      // targetMatch.id should be the applicant profile ID
      // but targetMatch.user_id is the registrant profile ID
      // We need the applicant profile ID
      
      if (targetMatch.id) {
        // If we have the applicant profile ID directly, use it
        targetApplicantId = targetMatch.id;
        console.log('✅ Using target applicant profile ID from match:', targetApplicantId);
      } else if (targetMatch.user_id) {
        // Otherwise, look it up from registrant profile ID
        const { data: targetApplicant } = await supabase
          .from('applicant_matching_profiles')
          .select('id, user_id')
          .eq('user_id', targetMatch.user_id)
          .maybeSingle();  // ✅ Use maybeSingle
        
        if (!targetApplicant) {
          throw new Error(`No applicant profile found for target user ${targetMatch.user_id}`);
        }
        
        targetApplicantId = targetApplicant.id;
        console.log('✅ Found target applicant profile ID:', targetApplicantId);
      } else {
        throw new Error('Target match missing both id and user_id');
      }
      
    } catch (err) {
      console.error('❌ Error finding target applicant profile:', err);
      throw new Error('Could not find target applicant profile');
    }
    
    console.log('📋 Match request details:', {
      senderApplicantId,
      targetApplicantId,
      targetName: targetMatch.first_name
    });
    
    // Check for existing match group between these users
    const { data: existingGroups } = await supabase
      .from('match_groups')
      .select('id, status')
      .contains('roommate_ids', JSON.stringify([senderApplicantId]))
      .contains('roommate_ids', JSON.stringify([targetApplicantId]));
    
    if (existingGroups && existingGroups.length > 0) {
      const activeGroup = existingGroups.find(g => 
        ['requested', 'forming', 'confirmed', 'active'].includes(g.status)
      );
      
      if (activeGroup) {
        console.log('⚠️ Active match group already exists:', activeGroup.id);
        return { 
          success: false, 
          error: 'A connection request already exists with this user'
        };
      }
    }
    
    // Create match_groups entry with JSONB roommate_ids
    const groupData = {
      roommate_ids: [senderApplicantId],
      requested_by_id: senderApplicantId,
      pending_member_ids: [targetApplicantId],
      status: 'requested',
      message: this.generateRequestMessage(targetMatch),
      member_confirmations: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📤 Creating match group:', groupData);

    const { data, error } = await supabase
      .from('match_groups')
      .insert(groupData) 
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error creating match group:', error);
      throw new Error(error.message || 'Failed to send match request');
    }
    
    console.log('✅ Match group created successfully:', data.id);
    
    // Invalidate cache since sent requests have changed
    this.invalidateUserCache(currentUserId);
    
    return { success: true, data };
    
  } catch (err) {
    console.error('💥 Error sending match request:', err);
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
   * ✅ FIX #2: Invalidate cached results with correct version prefix
   * Invalidate cached results for a user
   */
  invalidateUserCache(userId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      // ✅ FIXED: Added v2_ to match the cache key format
      if (key.includes(`schema_compliant_matches_v2_${userId}_`)) {
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