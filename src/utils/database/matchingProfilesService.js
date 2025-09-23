// src/utils/database/matchingProfilesService.js - NEW: Standardized Database Integration
import { supabase } from '../supabase';

/**
 * Enhanced database service for applicant_matching_profiles table
 * Handles CRUD operations with the standardized database schema
 */
class MatchingProfilesService {
  constructor() {
    this.tableName = 'applicant_matching_profiles';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ===== CORE CRUD OPERATIONS =====

  /**
   * Create a new matching profile
   * @param {Object} profileData - Complete profile data
   * @returns {Object} Database response
   */
  async create(profileData) {
    try {
      console.log('📊 Creating new matching profile for user:', profileData.user_id);
      
      // Ensure required fields are present
      const requiredFields = ['user_id', 'primary_city', 'primary_state', 'budget_max', 'recovery_stage'];
      for (const field of requiredFields) {
        if (!profileData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Set default values for computed fields
      const profileWithDefaults = {
        ...profileData,
        primary_location: profileData.primary_location || 
                         `${profileData.primary_city}, ${profileData.primary_state}`,
        completion_percentage: this.calculateCompletionPercentage(profileData),
        profile_quality_score: this.calculateQualityScore(profileData),
        profile_completed: this.isProfileCompleted(profileData),
        is_active: profileData.is_active !== false, // Default to true
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(profileWithDefaults)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating matching profile:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Matching profile created successfully');
      this.invalidateCache(profileData.user_id);
      
      return { success: true, data };

    } catch (err) {
      console.error('💥 Error in create:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get matching profile by user ID
   * @param {string} userId - User ID
   * @param {boolean} useCache - Whether to use cache
   * @returns {Object} Database response
   */
  async getByUserId(userId, useCache = true) {
    try {
      // Check cache first
      if (useCache) {
        const cached = this.getFromCache(userId);
        if (cached) {
          console.log('📦 Returning cached matching profile for user:', userId);
          return { success: true, data: cached };
        }
      }

      console.log('🔍 Fetching matching profile for user:', userId);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          return { success: false, error: 'No matching profile found', code: 'NOT_FOUND' };
        }
        throw new Error(`Database error: ${error.message}`);
      }

      // Cache the result
      if (useCache && data) {
        this.setCache(userId, data);
      }

      console.log('✅ Matching profile retrieved successfully');
      return { success: true, data };

    } catch (err) {
      console.error('💥 Error in getByUserId:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Update matching profile
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Database response
   */
  async update(userId, updates) {
    try {
      console.log('🔄 Updating matching profile for user:', userId);

      // Compute updated values
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

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
        const currentResult = await this.getByUserId(userId, false);
        if (currentResult.success) {
          const mergedData = { ...currentResult.data, ...updates };
          updatedData.completion_percentage = this.calculateCompletionPercentage(mergedData);
          updatedData.profile_quality_score = this.calculateQualityScore(mergedData);
          updatedData.profile_completed = this.isProfileCompleted(mergedData);
        }
      }

      // Update primary_location if city or state changed
      if (updates.primary_city || updates.primary_state) {
        const currentResult = await this.getByUserId(userId, false);
        if (currentResult.success) {
          const city = updates.primary_city || currentResult.data.primary_city;
          const state = updates.primary_state || currentResult.data.primary_state;
          updatedData.primary_location = `${city}, ${state}`;
        }
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updatedData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating matching profile:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Matching profile updated successfully');
      this.invalidateCache(userId);
      
      return { success: true, data };

    } catch (err) {
      console.error('💥 Error in update:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Upsert matching profile (create or update)
   * @param {Object} profileData - Complete profile data
   * @returns {Object} Database response
   */
  async upsert(profileData) {
    try {
      console.log('🔄 Upserting matching profile for user:', profileData.user_id);

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
      console.error('💥 Error in upsert:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete matching profile
   * @param {string} userId - User ID
   * @returns {Object} Database response
   */
  async delete(userId) {
    try {
      console.log('🗑️ Deleting matching profile for user:', userId);

      const { data, error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('❌ Error deleting matching profile:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Matching profile deleted successfully');
      this.invalidateCache(userId);
      
      return { success: true, data };

    } catch (err) {
      console.error('💥 Error in delete:', err);
      return { success: false, error: err.message };
    }
  }

  // ===== QUERY OPERATIONS =====

  /**
   * Get all active profiles for matching
   * @param {string} excludeUserId - User ID to exclude
   * @param {Object} filters - Additional filters
   * @returns {Object} Database response
   */
  async getActiveProfiles(excludeUserId = null, filters = {}) {
    try {
      console.log('🔍 Fetching active profiles, excluding:', excludeUserId);

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .eq('profile_completed', true);

      if (excludeUserId) {
        query = query.neq('user_id', excludeUserId);
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
  }

  /**
   * Get profiles by location
   * @param {string} city - City name
   * @param {string} state - State code
   * @param {number} radius - Search radius (for future implementation)
   * @returns {Object} Database response
   */
  async getByLocation(city, state, radius = null) {
    try {
      console.log('🗺️ Fetching profiles by location:', { city, state, radius });

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .eq('primary_city', city)
        .eq('primary_state', state);

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching profiles by location:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`✅ Retrieved ${data?.length || 0} profiles for ${city}, ${state}`);
      return { success: true, data: data || [] };

    } catch (err) {
      console.error('💥 Error in getByLocation:', err);
      return { success: false, error: err.message, data: [] };
    }
  }

  /**
   * Get profiles by recovery stage
   * @param {string} recoveryStage - Recovery stage
   * @returns {Object} Database response
   */
  async getByRecoveryStage(recoveryStage) {
    try {
      console.log('🌱 Fetching profiles by recovery stage:', recoveryStage);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .eq('recovery_stage', recoveryStage)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching profiles by recovery stage:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`✅ Retrieved ${data?.length || 0} profiles for recovery stage: ${recoveryStage}`);
      return { success: true, data: data || [] };

    } catch (err) {
      console.error('💥 Error in getByRecoveryStage:', err);
      return { success: false, error: err.message, data: [] };
    }
  }

  /**
   * Search profiles with complex filters
   * @param {Object} searchCriteria - Search criteria
   * @returns {Object} Database response
   */
  async searchProfiles(searchCriteria) {
    try {
      console.log('🔍 Searching profiles with criteria:', searchCriteria);

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true);

      // Apply all search criteria
      Object.entries(searchCriteria).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            // Handle array fields
            query = query.overlaps(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      const { data, error } = await query
        .order('profile_quality_score', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error searching profiles:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`✅ Found ${data?.length || 0} profiles matching criteria`);
      return { success: true, data: data || [] };

    } catch (err) {
      console.error('💥 Error in searchProfiles:', err);
      return { success: false, error: err.message, data: [] };
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Calculate completion percentage
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
   * Calculate profile quality score
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

  // ===== CACHE METHODS =====

  /**
   * Get from cache
   */
  getFromCache(userId) {
    const cached = this.cache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache
   */
  setCache(userId, data) {
    this.cache.set(userId, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidate cache
   */
  invalidateCache(userId) {
    this.cache.delete(userId);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }

  // ===== STATISTICS =====

  /**
   * Get database statistics
   * @returns {Object} Database statistics
   */
  async getStatistics() {
    try {
      console.log('📊 Fetching database statistics...');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('is_active, profile_completed, recovery_stage, primary_state, completion_percentage');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const stats = {
        total: data.length,
        active: data.filter(p => p.is_active).length,
        completed: data.filter(p => p.profile_completed).length,
        averageCompletion: Math.round(
          data.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / data.length
        ),
        byRecoveryStage: this.groupBy(data, 'recovery_stage'),
        byState: this.groupBy(data, 'primary_state')
      };

      console.log('✅ Statistics retrieved');
      return { success: true, data: stats };

    } catch (err) {
      console.error('💥 Error in getStatistics:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Group array by field
   */
  groupBy(array, field) {
    return array.reduce((groups, item) => {
      const key = item[field] || 'Unknown';
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }
}

// Export singleton instance
export const matchingProfilesService = new MatchingProfilesService();
export default matchingProfilesService;