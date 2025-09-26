// src/utils/database/matchingProfilesService.js - FIXED: Correct schema relationships
/**
 * Enhanced database service for applicant_matching_profiles table
 * Handles CRUD operations with the correct relationship chain:
 * auth.users.id → registrant_profiles.user_id → registrant_profiles.id → applicant_matching_profiles.user_id
 */
class MatchingProfilesService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.tableName = 'applicant_matching_profiles';
    this.registrantTableName = 'registrant_profiles';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ===== HELPER: GET REGISTRANT PROFILE ID =====
  
  /**
   * Get registrant_profiles.id from auth.users.id
   * @param {string} authUserId - Auth user ID
   * @returns {string} Registrant profile ID
   */
  async getRegistrantProfileId(authUserId) {
    try {
      console.log('🔍 Getting registrant_profile_id for auth user:', authUserId);

      const { data, error } = await this.supabase
        .from(this.registrantTableName)
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
  }

  // ===== CORE CRUD OPERATIONS =====

  /**
   * Create a new matching profile
   * @param {Object} profileData - Complete profile data (expects user_id to be auth.users.id)
   * @returns {Object} Database response
   */
  async create(profileData) {
    try {
      console.log('Creating new matching profile for auth user:', profileData.user_id);
      
      // Get the registrant profile ID
      const registrantProfileId = await this.getRegistrantProfileId(profileData.user_id);
      
      // ✅ UPDATED: Required fields aligned with new schema
      const requiredFields = ['primary_city', 'primary_state', 'budget_max', 'recovery_stage'];
      for (const field of requiredFields) {
        if (!profileData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Set default values for computed fields
      const profileWithDefaults = {
        ...profileData,
        user_id: registrantProfileId, // ✅ CRITICAL: Use registrant_profiles.id, not auth.users.id
        completion_percentage: this.calculateCompletionPercentage(profileData),
        profile_quality_score: this.calculateQualityScore(profileData),
        profile_completed: this.isProfileCompleted(profileData),
        is_active: profileData.is_active !== false, // Default to true
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // ✅ CRITICAL: Remove primary_location if present (it's auto-generated)
      if ('primary_location' in profileWithDefaults) {
        delete profileWithDefaults.primary_location;
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(profileWithDefaults)
        .select()
        .single();

      if (error) {
        console.error('Error creating matching profile:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Matching profile created successfully');
      this.invalidateCache(profileData.user_id); // Cache by auth user ID
      
      return { success: true, data };

    } catch (err) {
      console.error('Error in create:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get matching profile by auth user ID
   * @param {string} authUserId - Auth user ID (auth.users.id)
   * @param {boolean} useCache - Whether to use cache
   * @returns {Object} Database response
   */
  async getByUserId(authUserId, useCache = true) {
    try {
      // Check cache first
      if (useCache) {
        const cached = this.getFromCache(authUserId);
        if (cached) {
          console.log('Returning cached matching profile for auth user:', authUserId);
          return { success: true, data: cached };
        }
      }

      console.log('Fetching matching profile for auth user:', authUserId);

      // Get the registrant profile ID first
      const registrantProfileId = await this.getRegistrantProfileId(authUserId);

      // Query using the registrant profile ID
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', registrantProfileId) // Use registrant_profiles.id
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          return { success: false, error: 'No matching profile found', code: 'NOT_FOUND' };
        }
        throw new Error(`Database error: ${error.message}`);
      }

      // Cache the result (using auth user ID as key)
      if (useCache && data) {
        this.setCache(authUserId, data);
      }

      console.log('Matching profile retrieved successfully');
      return { success: true, data };

    } catch (err) {
      console.error('Error in getByUserId:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Update matching profile
   * @param {string} authUserId - Auth user ID (auth.users.id)
   * @param {Object} updates - Fields to update
   * @returns {Object} Database response
   */
  async update(authUserId, updates) {
    try {
      console.log('Updating matching profile for auth user:', authUserId);

      // Get the registrant profile ID first
      const registrantProfileId = await this.getRegistrantProfileId(authUserId);

      // Compute updated values
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // ✅ CRITICAL: Remove primary_location if present (it's auto-generated)
      if ('primary_location' in updatedData) {
        delete updatedData.primary_location;
      }

      // Recalculate computed fields if relevant data changed
      const fieldsAffectingCompletion = [
        'primary_city', 'primary_state', 'budget_min', 'budget_max',
        'recovery_stage', 'recovery_methods', 'primary_issues',
        'about_me', 'looking_for'
      ];

      const affectsCompletion = fieldsAffectingCompletion.some(field => 
        updates.hasOwnProperty(field)
      );

      if (affectsCompletion) {
        // Get current profile to merge with updates
        const currentResult = await this.getByUserId(authUserId, false);
        if (currentResult.success) {
          const mergedData = { ...currentResult.data, ...updates };
          updatedData.completion_percentage = this.calculateCompletionPercentage(mergedData);
          updatedData.profile_quality_score = this.calculateQualityScore(mergedData);
          updatedData.profile_completed = this.isProfileCompleted(mergedData);
        }
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(updatedData)
        .eq('user_id', registrantProfileId) // Use registrant_profiles.id
        .select()
        .single();

      if (error) {
        console.error('Error updating matching profile:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Matching profile updated successfully');
      this.invalidateCache(authUserId); // Cache by auth user ID
      
      return { success: true, data };

    } catch (err) {
      console.error('Error in update:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Upsert matching profile (create or update)
   * @param {Object} profileData - Complete profile data (expects user_id to be auth.users.id)
   * @returns {Object} Database response
   */
  async upsert(profileData) {
    try {
      console.log('Upserting matching profile for auth user:', profileData.user_id);

      // Check if profile exists
      const existingResult = await this.getByUserId(profileData.user_id, false);
      
      if (existingResult.success) {
        // Update existing profile
        const { user_id, ...updateData } = profileData;
        return await this.update(user_id, updateData);
      } else if (existingResult.code === 'NOT_FOUND') {
        // Create new profile
        return await this.create(profileData);
      } else {
        // Database error
        return existingResult;
      }

    } catch (err) {
      console.error('Error in upsert:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete matching profile
   * @param {string} authUserId - Auth user ID (auth.users.id)
   * @returns {Object} Database response
   */
  async delete(authUserId) {
    try {
      console.log('Deleting matching profile for auth user:', authUserId);

      // Get the registrant profile ID first
      const registrantProfileId = await this.getRegistrantProfileId(authUserId);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', registrantProfileId) // Use registrant_profiles.id
        .select();

      if (error) {
        console.error('Error deleting matching profile:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Matching profile deleted successfully');
      this.invalidateCache(authUserId); // Cache by auth user ID
      
      return { success: true, data };

    } catch (err) {
      console.error('Error in delete:', err);
      return { success: false, error: err.message };
    }
  }

  // ===== QUERY OPERATIONS =====

  /**
   * Get all active profiles for matching (excludes by auth user ID)
   * @param {string} excludeAuthUserId - Auth user ID to exclude
   * @param {Object} filters - Additional filters
   * @returns {Object} Database response
   */
  async getActiveProfiles(excludeAuthUserId = null, filters = {}) {
    try {
      console.log('Fetching active profiles, excluding auth user:', excludeAuthUserId);

      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .eq('profile_completed', true);

      // Exclude current user if specified
      if (excludeAuthUserId) {
        try {
          const registrantProfileId = await this.getRegistrantProfileId(excludeAuthUserId);
          query = query.neq('user_id', registrantProfileId);
        } catch (err) {
          console.warn('Could not get registrant profile ID for exclusion:', err);
          // Continue without exclusion if we can't get the ID
        }
      }

      // Apply filters using correct field names
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
        console.error('Error fetching active profiles:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`Retrieved ${data?.length || 0} active profiles`);
      return { success: true, data: data || [] };

    } catch (err) {
      console.error('Error in getActiveProfiles:', err);
      return { success: false, error: err.message, data: [] };
    }
  }

  // ===== EXISTING HELPER METHODS (UNCHANGED) =====

  /**
   * ✅ UPDATED: Calculate completion percentage using correct field names
   * @param {Object} profileData - Profile data
   * @returns {number} Completion percentage
   */
  calculateCompletionPercentage(profileData) {
    const coreFields = [
      'primary_city', 'primary_state', 'budget_min', 'budget_max',
      'preferred_roommate_gender', 'recovery_stage', 'recovery_methods',
      'primary_issues', 'spiritual_affiliation', 'social_level',
      'cleanliness_level', 'noise_tolerance', 'work_schedule',
      'move_in_date', 'about_me', 'looking_for'
    ];

    const completedFields = coreFields.filter(field => {
      const value = profileData[field];
      return value !== null && value !== undefined && value !== '' && 
             (!Array.isArray(value) || value.length > 0);
    });

    return Math.round((completedFields.length / coreFields.length) * 100);
  }

  /**
   * ✅ UPDATED: Calculate profile quality score with bonus points
   * @param {Object} profileData - Profile data
   * @returns {number} Quality score
   */
  calculateQualityScore(profileData) {
    let score = this.calculateCompletionPercentage(profileData);

    // Bonus points for optional high-value fields
    const bonusFields = [
      'interests', 'important_qualities', 'housing_types_accepted',
      'emergency_contact_name', 'target_zip_codes'
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
  }

  /**
   * Check if profile is completed
   * @param {Object} profileData - Profile data
   * @returns {boolean} Is completed
   */
  isProfileCompleted(profileData) {
    return this.calculateCompletionPercentage(profileData) >= 80;
  }

  // ===== CACHE METHODS (using auth user ID as key) =====

  /**
   * Get from cache
   */
  getFromCache(authUserId) {
    const cached = this.cache.get(authUserId);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache
   */
  setCache(authUserId, data) {
    this.cache.set(authUserId, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidate cache
   */
  invalidateCache(authUserId) {
    this.cache.delete(authUserId);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }

  // ... (rest of the methods remain the same)
}

// Export the class, not an instance
export default MatchingProfilesService;