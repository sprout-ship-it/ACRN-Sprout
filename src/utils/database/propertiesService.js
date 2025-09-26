// src/utils/database/propertiesService.js - Updated for refactored schema
/**
 * Properties service for properties table operations
 * Updated to work with new properties table schema
 */

const createPropertiesService = (supabaseClient) => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required for properties service');
  }

  const tableName = 'properties';

  const service = {
    /**
     * Create a new property
     */
    create: async (propertyData) => {
      try {
        console.log('Creating property for landlord:', propertyData.landlord_id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .insert({
            ...propertyData,
            status: propertyData.status || 'available',
            accepting_applications: propertyData.accepting_applications !== false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Properties: Create failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('Properties: Property created successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('Properties: Create exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get properties by landlord ID with enhanced data
     */
    getByLandlordId: async (landlordId) => {
      try {
        console.log('Fetching properties for landlord:', landlordId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select(`
            *,
            landlord_profile:landlord_profiles!inner(
              id,
              primary_phone,
              contact_email,
              registrant:registrant_profiles!inner(
                id,
                first_name,
                last_name,
                email
              )
            )
          `)
          .eq('landlord_id', landlordId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Properties: GetByLandlordId failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`Properties: Found ${data?.length || 0} properties for landlord`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('Properties: GetByLandlordId exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get available properties with comprehensive filters
     */
    getAvailable: async (filters = {}) => {
      try {
        console.log('Fetching available properties with filters:', filters);

        let query = supabaseClient
          .from(tableName)
          .select(`
            *,
            landlord_profile:landlord_profiles!inner(
              id,
              primary_phone,
              contact_email,
              primary_service_city,
              primary_service_state,
              registrant:registrant_profiles!inner(
                first_name,
                last_name
              )
            )
          `)
          .eq('status', 'available')
          .eq('accepting_applications', true);

        // Basic filters
        if (filters.maxPrice) {
          query = query.lte('monthly_rent', filters.maxPrice);
        }

        if (filters.minPrice) {
          query = query.gte('monthly_rent', filters.minPrice);
        }

        if (filters.bedrooms) {
          query = query.gte('bedrooms', filters.bedrooms);
        }

        if (filters.bathrooms) {
          query = query.gte('bathrooms', filters.bathrooms);
        }

        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`);
        }

        if (filters.state) {
          query = query.eq('state', filters.state);
        }

        if (filters.zipCode) {
          query = query.eq('zip_code', filters.zipCode);
        }

        // Property type filters
        if (filters.propertyType) {
          query = query.eq('property_type', filters.propertyType);
        }

        if (filters.isRecoveryHousing !== undefined) {
          query = query.eq('is_recovery_housing', filters.isRecoveryHousing);
        }

        // Feature filters
        if (filters.furnished !== undefined) {
          query = query.eq('furnished', filters.furnished);
        }

        if (filters.petsAllowed !== undefined) {
          query = query.eq('pets_allowed', filters.petsAllowed);
        }

        if (filters.smokingAllowed !== undefined) {
          query = query.eq('smoking_allowed', filters.smokingAllowed);
        }

        // Recovery housing specific filters
        if (filters.genderRestrictions) {
          query = query.eq('gender_restrictions', filters.genderRestrictions);
        }

        if (filters.minSobrietyTime) {
          query = query.eq('min_sobriety_time', filters.minSobrietyTime);
        }

        // Array filters
        if (filters.utilities && filters.utilities.length > 0) {
          query = query.overlaps('utilities_included', filters.utilities);
        }

        if (filters.amenities && filters.amenities.length > 0) {
          query = query.overlaps('amenities', filters.amenities);
        }

        if (filters.acceptedSubsidies && filters.acceptedSubsidies.length > 0) {
          query = query.overlaps('accepted_subsidies', filters.acceptedSubsidies);
        }

        if (filters.requiredPrograms && filters.requiredPrograms.length > 0) {
          query = query.overlaps('required_programs', filters.requiredPrograms);
        }

        const { data, error } = await query
          .order('is_recovery_housing', { ascending: false })
          .order('updated_at', { ascending: false })
          .limit(filters.limit || 50);

        if (error) {
          console.error('Properties: GetAvailable failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`Properties: Found ${data?.length || 0} available properties`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('Properties: GetAvailable exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get recovery housing properties with specialized filters
     */
    getRecoveryHousing: async (filters = {}) => {
      try {
        console.log('Fetching recovery housing with filters:', filters);

        let query = supabaseClient
          .from(tableName)
          .select(`
            *,
            landlord_profile:landlord_profiles!inner(
              id,
              primary_phone,
              contact_email,
              recovery_experience_level,
              supported_recovery_methods,
              registrant:registrant_profiles!inner(
                first_name,
                last_name
              )
            )
          `)
          .eq('is_recovery_housing', true)
          .eq('status', 'available')
          .eq('accepting_applications', true);

        // Apply recovery-specific filters
        if (filters.recoveryStage) {
          // This would need to be matched against supported stages in landlord profile
          // For now, we'll use the property's minimum sobriety requirement
          const stageToTimeMap = {
            'early_recovery': ['0_days', '30_days'],
            'sustained_recovery': ['90_days', '6_months'],
            'long_term_recovery': ['1_year', '2_years']
          };
          
          if (stageToTimeMap[filters.recoveryStage]) {
            query = query.in('min_sobriety_time', stageToTimeMap[filters.recoveryStage]);
          }
        }

        if (filters.requiredPrograms && filters.requiredPrograms.length > 0) {
          query = query.overlaps('required_programs', filters.requiredPrograms);
        }

        if (filters.supportServices && filters.supportServices.length > 0) {
          // Build dynamic filter for support services
          let serviceQuery = query;
          filters.supportServices.forEach(service => {
            serviceQuery = serviceQuery.eq(service, true);
          });
          query = serviceQuery;
        }

        // Standard filters
        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`);
        }

        if (filters.state) {
          query = query.eq('state', filters.state);
        }

        if (filters.maxRent) {
          query = query.lte('monthly_rent', filters.maxRent);
        }

        if (filters.genderRestrictions && filters.genderRestrictions !== 'any') {
          query = query.eq('gender_restrictions', filters.genderRestrictions);
        }

        const { data, error } = await query
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Properties: GetRecoveryHousing failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`Properties: Found ${data?.length || 0} recovery housing properties`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('Properties: GetRecoveryHousing exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get general rental properties
     */
    getGeneralRentals: async (filters = {}) => {
      try {
        console.log('Fetching general rentals with filters:', filters);

        const enhancedFilters = {
          ...filters,
          isRecoveryHousing: false
        };

        return await service.getAvailable(enhancedFilters);

      } catch (err) {
        console.error('Properties: GetGeneralRentals exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get property by ID with full details
     */
    getById: async (id) => {
      try {
        console.log('Fetching property by ID:', id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select(`
            *,
            landlord_profile:landlord_profiles!inner(
              id,
              primary_phone,
              contact_email,
              contact_person,
              business_name,
              recovery_friendly,
              recovery_experience_level,
              supported_recovery_methods,
              preferred_contact_method,
              response_time_expectation,
              registrant:registrant_profiles!inner(
                id,
                first_name,
                last_name,
                email
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Property not found' } };
          }
          console.error('Properties: GetById failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('Properties: Property retrieved successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('Properties: GetById exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update property
     */
    update: async (id, updates) => {
      try {
        console.log('Updating property:', id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Properties: Update failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('Properties: Property updated successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('Properties: Update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Delete property
     */
    delete: async (id) => {
      try {
        console.log('Deleting property:', id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .delete()
          .eq('id', id)
          .select();

        if (error) {
          console.error('Properties: Delete failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('Properties: Property deleted successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('Properties: Delete exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update property status
     */
    updateStatus: async (id, status) => {
      try {
        console.log('Updating status for property:', id, 'to:', status);

        const validStatuses = ['available', 'waitlist', 'full', 'temporarily_closed', 'under_renovation'];
        if (!validStatuses.includes(status)) {
          return { 
            success: false, 
            data: null, 
            error: { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }
          };
        }

        return await service.update(id, { status });

      } catch (err) {
        console.error('Properties: UpdateStatus exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update available beds (recovery housing only)
     */
    updateAvailableBeds: async (id, availableBeds) => {
      try {
        console.log('Updating available beds for property:', id, 'to:', availableBeds);

        // First check if this is recovery housing
        const { data: property, error: fetchError } = await supabaseClient
          .from(tableName)
          .select('is_recovery_housing, bedrooms')
          .eq('id', id)
          .single();

        if (fetchError) {
          return { success: false, data: null, error: fetchError };
        }

        if (!property.is_recovery_housing) {
          return {
            success: false,
            data: null,
            error: { message: 'Available beds can only be updated for recovery housing properties' }
          };
        }

        if (availableBeds > property.bedrooms) {
          return {
            success: false,
            data: null,
            error: { message: 'Available beds cannot exceed total bedrooms' }
          };
        }

        return await service.update(id, { available_beds: availableBeds });

      } catch (err) {
        console.error('Properties: UpdateAvailableBeds exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Search properties by location
     */
    searchByLocation: async (city, state, radius = null) => {
      try {
        console.log('Searching by location:', { city, state, radius });

        const filters = {
          city: city,
          state: state
        };

        return await service.getAvailable(filters);

      } catch (err) {
        console.error('Properties: SearchByLocation exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get properties with matching criteria for applicant
     */
    getMatchingProperties: async (applicantProfile) => {
      try {
        console.log('Finding matching properties for applicant');

        let query = supabaseClient
          .from(tableName)
          .select(`
            *,
            landlord_profile:landlord_profiles!inner(
              id,
              primary_phone,
              supported_recovery_methods,
              recovery_friendly,
              registrant:registrant_profiles!inner(
                first_name,
                last_name
              )
            )
          `)
          .eq('status', 'available')
          .eq('accepting_applications', true);

        // Location matching
        if (applicantProfile.primary_city) {
          query = query.eq('city', applicantProfile.primary_city);
        }

        if (applicantProfile.primary_state) {
          query = query.eq('state', applicantProfile.primary_state);
        }

        // Budget matching
        if (applicantProfile.budget_min && applicantProfile.budget_max) {
          query = query
            .gte('monthly_rent', applicantProfile.budget_min)
            .lte('monthly_rent', applicantProfile.budget_max);
        }

        // Recovery housing preference
        if (applicantProfile.substance_free_home_required) {
          query = query.eq('is_recovery_housing', true);
        }

        // Gender preferences
        if (applicantProfile.preferred_roommate_gender && applicantProfile.preferred_roommate_gender !== 'any') {
          query = query.in('gender_restrictions', ['any', applicantProfile.preferred_roommate_gender]);
        }

        const { data, error } = await query
          .order('is_recovery_housing', { ascending: false })
          .order('monthly_rent', { ascending: true });

        if (error) {
          console.error('Properties: GetMatchingProperties failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`Properties: Found ${data?.length || 0} matching properties`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('Properties: GetMatchingProperties exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get properties statistics
     */
    getStatistics: async (landlordId = null) => {
      try {
        console.log('Fetching statistics', landlordId ? `for landlord: ${landlordId}` : 'system-wide');

        let query = supabaseClient
          .from(tableName)
          .select('status, monthly_rent, bedrooms, is_recovery_housing, property_type, created_at');

        if (landlordId) {
          query = query.eq('landlord_id', landlordId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Properties: Statistics failed:', error.message);
          return { success: false, data: null, error };
        }

        const stats = {
          total: data.length,
          recoveryHousing: data.filter(p => p.is_recovery_housing).length,
          generalRentals: data.filter(p => !p.is_recovery_housing).length,
          byStatus: {
            available: data.filter(p => p.status === 'available').length,
            waitlist: data.filter(p => p.status === 'waitlist').length,
            full: data.filter(p => p.status === 'full').length,
            temporarily_closed: data.filter(p => p.status === 'temporarily_closed').length,
            under_renovation: data.filter(p => p.status === 'under_renovation').length
          },
          byPropertyType: {},
          averageRent: data.length > 0 ? Math.round(
            data.reduce((sum, p) => sum + (p.monthly_rent || 0), 0) / data.length
          ) : 0,
          byBedrooms: {},
          recentlyAdded: data.filter(p => {
            const createdDate = new Date(p.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate > weekAgo;
          }).length
        };

        // Group by property type
        data.forEach(property => {
          const type = property.property_type || 'unknown';
          stats.byPropertyType[type] = (stats.byPropertyType[type] || 0) + 1;
        });

        // Group by bedrooms
        data.forEach(property => {
          const bedrooms = property.bedrooms || 0;
          stats.byBedrooms[bedrooms] = (stats.byBedrooms[bedrooms] || 0) + 1;
        });

        console.log('Properties: Statistics calculated');
        return { success: true, data: stats, error: null };

      } catch (err) {
        console.error('Properties: Statistics exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Bulk update properties
     */
    bulkUpdate: async (updates) => {
      try {
        console.log('Bulk updating', updates.length, 'properties');

        const operations = updates.map(({ id, data }) =>
          service.update(id, data)
        );

        const results = await Promise.allSettled(operations);
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
        const failed = results.filter(r => r.status === 'rejected' || !r.value?.success);

        console.log(`Properties: Bulk update complete - ${successful.length} success, ${failed.length} failed`);
        
        return {
          success: true,
          data: {
            successful: successful.length,
            failed: failed.length,
            total: updates.length,
            results
          },
          error: null
        };

      } catch (err) {
        console.error('Properties: Bulk update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get properties by price range
     */
    getByPriceRange: async (minPrice, maxPrice) => {
      try {
        console.log('Fetching properties by price range:', { minPrice, maxPrice });

        const filters = {
          minPrice: minPrice,
          maxPrice: maxPrice
        };

        return await service.getAvailable(filters);

      } catch (err) {
        console.error('Properties: GetByPriceRange exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Toggle accepting applications status
     */
    toggleAcceptingApplications: async (id) => {
      try {
        console.log('Toggling accepting applications for property:', id);

        // First get current status
        const { data: currentProperty, error: fetchError } = await supabaseClient
          .from(tableName)
          .select('accepting_applications')
          .eq('id', id)
          .single();

        if (fetchError) {
          return { success: false, data: null, error: fetchError };
        }

        const newStatus = !currentProperty.accepting_applications;

        return await service.update(id, { accepting_applications: newStatus });

      } catch (err) {
        console.error('Properties: ToggleAcceptingApplications exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    }
  };

  return service;
};

export const getPropertyById = async (propertyId) => {
  try {
    console.log('🏠 Fetching property by ID:', propertyId);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        landlord_profile:landlord_profiles!inner(
          id,
          primary_phone,
          contact_email,
          registrant:registrant_profiles!inner(
            first_name,
            last_name
          )
        )
      `)
      .eq('id', propertyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Property not found', code: 'NOT_FOUND' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('💥 Error in getPropertyById:', err);
    return { success: false, error: err.message };
  }
};

export const getPropertiesByLandlordId = async (landlordId) => {
  try {
    console.log('🏠 Fetching properties for landlord ID:', landlordId);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('landlord_id', landlordId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching properties:', error);
      return { success: false, data: [], error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('💥 Error in getPropertiesByLandlordId:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export const getAvailableProperties = async (filters = {}) => {
  try {
    console.log('🏠 Fetching available properties with filters:', filters);
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('properties')
      .select(`
        *,
        landlord_profile:landlord_profiles!inner(
          id,
          primary_phone,
          registrant:registrant_profiles!inner(
            first_name,
            last_name
          )
        )
      `)
      .eq('status', 'available')
      .eq('accepting_applications', true);

    // Apply basic filters
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.state) {
      query = query.eq('state', filters.state);
    }
    if (filters.maxPrice) {
      query = query.lte('monthly_rent', filters.maxPrice);
    }

    const { data, error } = await query
      .order('updated_at', { ascending: false })
      .limit(filters.limit || 50);

    if (error) {
      console.error('❌ Error fetching available properties:', error);
      return { success: false, data: [], error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('💥 Error in getAvailableProperties:', err);
    return { success: false, error: err.message, data: [] };
  }
};

export default createPropertiesService;