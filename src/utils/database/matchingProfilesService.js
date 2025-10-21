// src/utils/database/matchingProfilesService.js - Corrected for New Schema
/**
 * Enhanced database service for applicant_matching_profiles table
 * 
 * ID HIERARCHY FLOW:
 * auth.users.id → registrant_profiles.user_id → registrant_profiles.id → applicant_matching_profiles.user_id
 * 
 * This service manages applicant matching profiles with proper relationship handling
 */

const createMatchingProfilesService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for matching profiles service');
  }

  const tableName = 'applicant_matching_profiles';
  const viewName = 'applicant_profiles_with_conditional_contact';
  const registrantTableName = 'registrant_profiles';
  const cache = new Map();
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // ===== HELPER: GET REGISTRANT PROFILE ID =====
  
  /**
   * Get registrant_profiles.id from auth.users.id
   * @param {string} authUserId - Auth user ID (auth.users.id)
   * @returns {string} Registrant profile ID (registrant_profiles.id)
   */
  const getRegistrantProfileId = async (authUserId) => {
    try {
      console.log('🔍 Getting registrant_profile_id for auth user:', authUserId);

      const { data, error } = await supabaseClient
        .from(registrantTableName)
        .select('id')
        .eq('user_id', authUserId) // registrant_profiles.user_id = auth.users.id
        .single();

      if (error) {
        console.error('❌ Error getting registrant profile ID:', error);
        throw new Error(`Registrant profile not found: ${error.message}`);
      }

      if (!data) {
        throw new Error('Registrant profile not found');
      }

      console.log('✅ Found registrant_profile_id:', data.id);
      return data.id;
    } catch (err) {
      console.error('❌ Error in getRegistrantProfileId:', err);
      throw err;
    }
  };

  // ===== CORE CRUD OPERATIONS =====

  /**
   * Create a new matching profile
   * @param {Object} profileData - Complete profile data (user_id should be auth.users.id)
   * @returns {Object} Database response
   */
  const create = async (profileData) => {
    try {
      console.log('🏗️ Creating new matching profile for auth user:', profileData.user_id);
      
      // Get the registrant profile ID
      const registrantProfileId = await getRegistrantProfileId(profileData.user_id);
      
      // Required fields based on schema (NOT NULL constraints)
      const requiredFields = [
        'primary_phone', 'date_of_birth', 'preferred_roommate_gender',
        'primary_city', 'primary_state', 'budget_min', 'budget_max',
        'recovery_stage', 'recovery_methods', 'program_types', 'primary_issues',
        'spiritual_affiliation', 'social_level', 'cleanliness_level', 
        'noise_tolerance', 'work_schedule', 'move_in_date', 'about_me', 'looking_for'
      ];

      for (const field of requiredFields) {
        if (!profileData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate array fields
      const arrayFields = ['recovery_methods', 'program_types', 'primary_issues'];
      for (const field of arrayFields) {
        if (!Array.isArray(profileData[field]) || profileData[field].length === 0) {
          throw new Error(`${field} must be a non-empty array`);
        }
      }

      // Set default values and computed fields
      const profileWithDefaults = {
        ...profileData,
        user_id: registrantProfileId, // ✅ CRITICAL: Use registrant_profiles.id
        completion_percentage: calculateCompletionPercentage(profileData),
        profile_quality_score: calculateQualityScore(profileData),
        profile_completed: isProfileCompleted(profileData),
        is_active: profileData.is_active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Remove auto-generated fields if present
      delete profileWithDefaults.primary_location; // This is auto-generated

      const { data, error } = await supabaseClient
        .from(tableName)
        .insert(profileWithDefaults)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating matching profile:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Matching profile created successfully');
      invalidateCache(profileData.user_id); // Cache by auth user ID
      
      return { success: true, data };

    } catch (err) {
      console.error('💥 Error in create:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Get matching profile by auth user ID
   * @param {string} authUserId - Auth user ID (auth.users.id)
   * @param {boolean} useCache - Whether to use cache
   * @returns {Object} Database response
   */
  const getByUserId = async (authUserId, useCache = true) => {
    try {
      // Check cache first
      if (useCache) {
        const cached = getFromCache(authUserId);
        if (cached) {
          console.log('📦 Returning cached matching profile for auth user:', authUserId);
          return { success: true, data: cached };
        }
      }

      console.log('🔍 Fetching matching profile for auth user:', authUserId);

      // Get the registrant profile ID first
      const registrantProfileId = await getRegistrantProfileId(authUserId);

// Query using the registrant profile ID
const { data, error } = await supabaseClient
  .from(viewName)
  .select('*')
  .eq('user_id', registrantProfileId) // Use registrant_profiles.id
  .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No matching profile found for auth user:', authUserId);
          return { success: false, error: 'No matching profile found', code: 'NOT_FOUND' };
        }
        throw new Error(`Database error: ${error.message}`);
      }

      // Cache the result (using auth user ID as key)
      if (useCache && data) {
        setCache(authUserId, data);
      }

      console.log('✅ Matching profile retrieved successfully');
      return { success: true, data };

    } catch (err) {
      console.error('💥 Error in getByUserId:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Get matching profile by applicant_matching_profiles.id
   * @param {string} profileId - applicant_matching_profiles.id
   * @returns {Object} Database response
   */
  const getById = async (profileId) => {
    try {
      console.log('🔍 Fetching matching profile by profile ID:', profileId);

const { data, error } = await supabaseClient
  .from(viewName)
  .select('*')
  .eq('id', profileId)
  .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Profile not found', code: 'NOT_FOUND' };
        }
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Matching profile retrieved by ID successfully');
      return { success: true, data };

    } catch (err) {
      console.error('💥 Error in getById:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Update matching profile
   * @param {string} authUserId - Auth user ID (auth.users.id)
   * @param {Object} updates - Fields to update
   * @returns {Object} Database response
   */
  const update = async (authUserId, updates) => {
    try {
      console.log('🔄 Updating matching profile for auth user:', authUserId);

      // Get the registrant profile ID first
      const registrantProfileId = await getRegistrantProfileId(authUserId);

      // Prepare update data
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Remove auto-generated fields
      delete updatedData.primary_location;
      delete updatedData.id;
      delete updatedData.user_id;
      delete updatedData.created_at;

      // Recalculate computed fields if relevant data changed
      const fieldsAffectingCompletion = [
        'primary_phone', 'date_of_birth', 'preferred_roommate_gender',
        'primary_city', 'primary_state', 'budget_min', 'budget_max',
        'recovery_stage', 'recovery_methods', 'primary_issues',
        'about_me', 'looking_for', 'spiritual_affiliation',
        'social_level', 'cleanliness_level', 'noise_tolerance'
      ];

      const affectsCompletion = fieldsAffectingCompletion.some(field => 
        updates.hasOwnProperty(field)
      );

      if (affectsCompletion) {
        // Get current profile to merge with updates
        const currentResult = await getByUserId(authUserId, false);
        if (currentResult.success) {
          const mergedData = { ...currentResult.data, ...updates };
          updatedData.completion_percentage = calculateCompletionPercentage(mergedData);
          updatedData.profile_quality_score = calculateQualityScore(mergedData);
          updatedData.profile_completed = isProfileCompleted(mergedData);
        }
      }

      const { data, error } = await supabaseClient
        .from(tableName)
        .update(updatedData)
        .eq('user_id', registrantProfileId) // Use registrant_profiles.id
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating matching profile:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Matching profile updated successfully');
      invalidateCache(authUserId);
      
      return { success: true, data };

    } catch (err) {
      console.error('💥 Error in update:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Upsert matching profile (create or update)
   * @param {Object} profileData - Complete profile data (user_id should be auth.users.id)
   * @returns {Object} Database response
   */
  const upsert = async (profileData) => {
    try {
      console.log('🔄 Upserting matching profile for auth user:', profileData.user_id);

      // Check if profile exists
      const existingResult = await getByUserId(profileData.user_id, false);
      
      if (existingResult.success) {
        // Update existing profile
        const { user_id, ...updateData } = profileData;
        return await update(user_id, updateData);
      } else if (existingResult.code === 'NOT_FOUND') {
        // Create new profile
        return await create(profileData);
      } else {
        // Database error
        return existingResult;
      }

    } catch (err) {
      console.error('💥 Error in upsert:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Delete matching profile
   * @param {string} authUserId - Auth user ID (auth.users.id)
   * @returns {Object} Database response
   */
  const deleteProfile = async (authUserId) => {
    try {
      console.log('🗑️ Deleting matching profile for auth user:', authUserId);

      // Get the registrant profile ID first
      const registrantProfileId = await getRegistrantProfileId(authUserId);

      const { data, error } = await supabaseClient
        .from(tableName)
        .delete()
        .eq('user_id', registrantProfileId)
        .select();

      if (error) {
        console.error('❌ Error deleting matching profile:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Matching profile deleted successfully');
      invalidateCache(authUserId);
      
      return { success: true, data };

    } catch (err) {
      console.error('💥 Error in delete:', err);
      return { success: false, error: err.message };
    }
  };

  // ===== QUERY OPERATIONS =====

  /**
   * Get all active profiles for matching
   * @param {string} excludeAuthUserId - Auth user ID to exclude
   * @param {Object} filters - Additional filters
   * @returns {Object} Database response
   */
  const getActiveProfiles = async (excludeAuthUserId = null, filters = {}) => {
    try {
      console.log('🔍 Fetching active profiles, excluding auth user:', excludeAuthUserId);

let query = supabaseClient
  .from(viewName)
  .select('*')
  .eq('is_active', true)
  .eq('profile_completed', true);

      // Exclude current user if specified
      if (excludeAuthUserId) {
        try {
          const registrantProfileId = await getRegistrantProfileId(excludeAuthUserId);
          query = query.neq('user_id', registrantProfileId);
        } catch (err) {
          console.warn('⚠️ Could not get registrant profile ID for exclusion:', err);
          // Continue without exclusion if we can't get the ID
        }
      }

      // Apply filters
      if (filters.recovery_stage) {
        query = query.eq('recovery_stage', filters.recovery_stage);
      }

      if (filters.primary_state) {
        query = query.eq('primary_state', filters.primary_state);
      }

      if (filters.budget_min) {
        query = query.gte('budget_max', filters.budget_min);
      }

      if (filters.budget_max) {
        query = query.lte('budget_min', filters.budget_max);
      }

      const { data, error } = await query
        .order('updated_at', { ascending: false })
        .limit(filters.limit || 100);

      if (error) {
        console.error('❌ Error fetching active profiles:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`✅ Retrieved ${data?.length || 0} active profiles`);
      return { success: true, data: data || [] };

    } catch (err) {
      console.error('💥 Error in getActiveProfiles:', err);
      return { success: false, error: err.message, data: [] };
    }
  };

  /**
   * Search profiles with advanced filters
   * @param {Object} searchParams - Search parameters
   * @returns {Object} Database response
   */
  const searchProfiles = async (searchParams = {}) => {
    try {
      console.log('🔍 Searching profiles with params:', searchParams);

let query = supabaseClient
  .from(viewName)
  .select('*')
  .eq('is_active', true);

      // Apply search filters
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query
        .order('updated_at', { ascending: false })
        .limit(searchParams.limit || 50);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return { success: true, data: data || [] };

    } catch (err) {
      console.error('💥 Error in searchProfiles:', err);
      return { success: false, error: err.message, data: [] };
    }
  };

  /**
   * Get profiles by location
   * @param {string} city - City name
   * @param {string} state - State code
   * @returns {Object} Database response
   */
  const getByLocation = async (city, state) => {
    return await searchProfiles({ primary_city: city, primary_state: state });
  };

  /**
   * Get profiles by recovery stage
   * @param {string} stage - Recovery stage
   * @returns {Object} Database response
   */
  const getByRecoveryStage = async (stage) => {
    return await searchProfiles({ recovery_stage: stage });
  };

  /**
   * Get statistics for matching profiles
   * @returns {Object} Statistics data
   */
  const getStatistics = async () => {
    try {
      console.log('📊 Fetching matching profile statistics');

      const { data, error } = await supabaseClient
        .from(tableName)
        .select('recovery_stage, primary_state, is_active, profile_completed, created_at');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const stats = {
        total: data.length,
        active: data.filter(p => p.is_active).length,
        completed: data.filter(p => p.profile_completed).length,
        byState: {},
        byRecoveryStage: {},
        recentProfiles: data.filter(p => {
          const createdDate = new Date(p.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo;
        }).length
      };

      // Group by state and recovery stage
      data.forEach(profile => {
        if (profile.primary_state) {
          stats.byState[profile.primary_state] = (stats.byState[profile.primary_state] || 0) + 1;
        }
        if (profile.recovery_stage) {
          stats.byRecoveryStage[profile.recovery_stage] = (stats.byRecoveryStage[profile.recovery_stage] || 0) + 1;
        }
      });

      console.log('✅ Statistics calculated successfully');
      return { success: true, data: stats };

    } catch (err) {
      console.error('💥 Error in getStatistics:', err);
      return { success: false, error: err.message };
    }
  };

  // ===== UTILITY METHODS =====

  /**
   * Calculate completion percentage based on required and important fields
   * @param {Object} profileData - Profile data
   * @returns {number} Completion percentage (0-100)
   */
  const calculateCompletionPercentage = (profileData) => {
    const coreFields = [
      'primary_phone', 'date_of_birth', 'preferred_roommate_gender',
      'primary_city', 'primary_state', 'budget_min', 'budget_max',
      'recovery_stage', 'recovery_methods', 'primary_issues',
      'spiritual_affiliation', 'social_level', 'cleanliness_level',
      'noise_tolerance', 'work_schedule', 'move_in_date',
      'about_me', 'looking_for'
    ];

    const completedFields = coreFields.filter(field => {
      const value = profileData[field];
      return value !== null && value !== undefined && value !== '' && 
             (!Array.isArray(value) || value.length > 0);
    });

    return Math.round((completedFields.length / coreFields.length) * 100);
  };

  /**
   * Calculate profile quality score with bonus points
   * @param {Object} profileData - Profile data
   * @returns {number} Quality score (0-100)
   */
  const calculateQualityScore = (profileData) => {
    let score = calculateCompletionPercentage(profileData);

    // Bonus points for optional high-value fields
    const bonusFields = [
      'interests', 'important_qualities', 'housing_types_accepted',
      'emergency_contact_name', 'target_zip_codes', 'additional_info'
    ];

    bonusFields.forEach(field => {
      const value = profileData[field];
      if (value && (typeof value === 'string' ? value.length > 0 : Array.isArray(value) ? value.length > 0 : true)) {
        score += 2;
      }
    });

    // Bonus for detailed text fields
    if (profileData.about_me && profileData.about_me.length > 100) score += 5;
    if (profileData.looking_for && profileData.looking_for.length > 100) score += 5;

    return Math.min(100, score);
  };

  /**
   * Check if profile meets completion threshold
   * @param {Object} profileData - Profile data
   * @returns {boolean} Is profile completed
   */
  const isProfileCompleted = (profileData) => {
    return calculateCompletionPercentage(profileData) >= 80;
  };

  // ===== CACHE METHODS =====

  const getFromCache = (authUserId) => {
    const cached = cache.get(authUserId);
    if (cached && (Date.now() - cached.timestamp) < cacheTimeout) {
      return cached.data;
    }
    return null;
  };

  const setCache = (authUserId, data) => {
    cache.set(authUserId, {
      data,
      timestamp: Date.now()
    });
  };

  const invalidateCache = (authUserId) => {
    cache.delete(authUserId);
  };

  const clearCache = () => {
    cache.clear();
  };

  // ===== RETURN SERVICE OBJECT =====

  return {
    // Core CRUD
    create,
    getByUserId,
    getById,
    update,
    upsert,
    delete: deleteProfile,

    // Query operations
    getActiveProfiles,
    searchProfiles,
    getByLocation,
    getByRecoveryStage,
    getStatistics,

    // Utility methods
    calculateCompletionPercentage,
    calculateQualityScore,
    isProfileCompleted,

    // Cache methods
    clearCache,

    // Internal helper (exposed for debugging)
    getRegistrantProfileId
  };
  };

export const getMatchingProfile = async (registrantProfileId, supabaseClient) => {
  try {
    console.log('🔍 Fetching matching profile for registrant profile ID:', registrantProfileId);
    
    if (!supabaseClient) {
      throw new Error('Authenticated Supabase client is required');
    }

const { data, error } = await supabaseClient
  .from(viewName)
  .select('*')
  .eq('user_id', registrantProfileId)
  .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'No matching profile found', code: 'NOT_FOUND' };
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return { success: true, data };
  } catch (err) {
    console.error('💥 Error in getMatchingProfile:', err);
    return { success: false, error: err.message };
  }
};

export default createMatchingProfilesService;