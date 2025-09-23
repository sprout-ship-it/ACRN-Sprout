// src/utils/database/propertiesService.js - Properties service module
/**
 * Properties service for properties table operations
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
        console.log('🏠 Properties: Creating property for landlord:', propertyData.landlord_id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .insert({
            ...propertyData,
            status: propertyData.status || 'available',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Properties: Create failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Properties: Property created successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Properties: Create exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get properties by landlord ID
     */
    getByLandlordId: async (landlordId) => {
      try {
        console.log('🏠 Properties: Fetching properties for landlord:', landlordId);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .eq('landlord_id', landlordId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Properties: GetByLandlordId failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Properties: Found ${data?.length || 0} properties for landlord`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Properties: GetByLandlordId exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get available properties with filters
     */
    getAvailable: async (filters = {}) => {
      try {
        console.log('🏠 Properties: Fetching available properties with filters:', filters);

        let query = supabaseClient
          .from(tableName)
          .select('*')
          .eq('status', 'available');

        // Apply filters
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

        if (filters.recoveryFriendly) {
          query = query.eq('is_recovery_friendly', true);
        }

        if (filters.furnished !== undefined) {
          query = query.eq('furnished', filters.furnished);
        }

        if (filters.petsAllowed !== undefined) {
          query = query.eq('pets_allowed', filters.petsAllowed);
        }

        if (filters.smokingAllowed !== undefined) {
          query = query.eq('smoking_allowed', filters.smokingAllowed);
        }

        // Array filters
        if (filters.utilities && filters.utilities.length > 0) {
          query = query.overlaps('utilities_included', filters.utilities);
        }

        if (filters.amenities && filters.amenities.length > 0) {
          query = query.overlaps('amenities', filters.amenities);
        }

        const { data, error } = await query
          .order('is_recovery_friendly', { ascending: false })
          .order('updated_at', { ascending: false })
          .limit(filters.limit || 50);

        if (error) {
          console.error('❌ Properties: GetAvailable failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Properties: Found ${data?.length || 0} available properties`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Properties: GetAvailable exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get property by ID
     */
    getById: async (id) => {
      try {
        console.log('🏠 Properties: Fetching property by ID:', id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .select(`
            *,
            landlord:registrant_profiles!landlord_id(id, first_name, last_name, email)
          `)
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Property not found' } };
          }
          console.error('❌ Properties: GetById failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Properties: Property retrieved successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Properties: GetById exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update property
     */
    update: async (id, updates) => {
      try {
        console.log('🏠 Properties: Updating property:', id);

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
          console.error('❌ Properties: Update failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Properties: Property updated successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Properties: Update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Delete property
     */
    delete: async (id) => {
      try {
        console.log('🏠 Properties: Deleting property:', id);

        const { data, error } = await supabaseClient
          .from(tableName)
          .delete()
          .eq('id', id)
          .select();

        if (error) {
          console.error('❌ Properties: Delete failed:', error.message);
          return { success: false, data: null, error };
        }

        console.log('✅ Properties: Property deleted successfully');
        return { success: true, data, error: null };

      } catch (err) {
        console.error('💥 Properties: Delete exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Update property status
     */
    updateStatus: async (id, status) => {
      try {
        console.log('🏠 Properties: Updating status for property:', id, 'to:', status);

        const validStatuses = ['available', 'occupied', 'maintenance', 'withdrawn'];
        if (!validStatuses.includes(status)) {
          return { 
            success: false, 
            data: null, 
            error: { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }
          };
        }

        return await service.update(id, { status });

      } catch (err) {
        console.error('💥 Properties: UpdateStatus exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Search properties by location
     */
    searchByLocation: async (city, state, radius = null) => {
      try {
        console.log('🏠 Properties: Searching by location:', { city, state, radius });

        let query = supabaseClient
          .from(tableName)
          .select('*')
          .eq('status', 'available');

        if (city) {
          query = query.ilike('city', `%${city}%`);
        }

        if (state) {
          query = query.eq('state', state);
        }

        const { data, error } = await query
          .order('is_recovery_friendly', { ascending: false })
          .order('monthly_rent', { ascending: true });

        if (error) {
          console.error('❌ Properties: SearchByLocation failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Properties: Found ${data?.length || 0} properties in location`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Properties: SearchByLocation exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    },

    /**
     * Get properties statistics
     */
    getStatistics: async (landlordId = null) => {
      try {
        console.log('🏠 Properties: Fetching statistics', landlordId ? `for landlord: ${landlordId}` : 'system-wide');

        let query = supabaseClient
          .from(tableName)
          .select('status, monthly_rent, bedrooms, is_recovery_friendly, created_at');

        if (landlordId) {
          query = query.eq('landlord_id', landlordId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Properties: Statistics failed:', error.message);
          return { success: false, data: null, error };
        }

        const stats = {
          total: data.length,
          byStatus: {
            available: data.filter(p => p.status === 'available').length,
            occupied: data.filter(p => p.status === 'occupied').length,
            maintenance: data.filter(p => p.status === 'maintenance').length,
            withdrawn: data.filter(p => p.status === 'withdrawn').length
          },
          recoveryFriendly: data.filter(p => p.is_recovery_friendly).length,
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

        // Group by bedrooms
        data.forEach(property => {
          const bedrooms = property.bedrooms || 0;
          stats.byBedrooms[bedrooms] = (stats.byBedrooms[bedrooms] || 0) + 1;
        });

        console.log('✅ Properties: Statistics calculated');
        return { success: true, data: stats, error: null };

      } catch (err) {
        console.error('💥 Properties: Statistics exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Bulk update properties
     */
    bulkUpdate: async (updates) => {
      try {
        console.log('🏠 Properties: Bulk updating', updates.length, 'properties');

        const operations = updates.map(({ id, data }) =>
          service.update(id, data)
        );

        const results = await Promise.allSettled(operations);
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
        const failed = results.filter(r => r.status === 'rejected' || !r.value?.success);

        console.log(`✅ Properties: Bulk update complete - ${successful.length} success, ${failed.length} failed`);
        
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
        console.error('💥 Properties: Bulk update exception:', err);
        return { success: false, data: null, error: { message: err.message } };
      }
    },

    /**
     * Get properties by price range
     */
    getByPriceRange: async (minPrice, maxPrice) => {
      try {
        console.log('🏠 Properties: Fetching properties by price range:', { minPrice, maxPrice });

        let query = supabaseClient
          .from(tableName)
          .select('*')
          .eq('status', 'available');

        if (minPrice) {
          query = query.gte('monthly_rent', minPrice);
        }

        if (maxPrice) {
          query = query.lte('monthly_rent', maxPrice);
        }

        const { data, error } = await query
          .order('monthly_rent', { ascending: true });

        if (error) {
          console.error('❌ Properties: GetByPriceRange failed:', error.message);
          return { success: false, data: [], error };
        }

        console.log(`✅ Properties: Found ${data?.length || 0} properties in price range`);
        return { success: true, data: data || [], error: null };

      } catch (err) {
        console.error('💥 Properties: GetByPriceRange exception:', err);
        return { success: false, data: [], error: { message: err.message } };
      }
    }
  };

  return service;
};

export default createPropertiesService;