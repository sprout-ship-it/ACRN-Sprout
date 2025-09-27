// src/components/features/property/search/hooks/usePropertySearch.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../../../utils/supabase';

// ✅ UPDATED: Custom hook for property search logic - FULLY ALIGNED WITH SCHEMA.SQL
const usePropertySearch = (user) => {
  // ✅ Search state management
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchMode, setSearchMode] = useState('basic'); // 'basic' or 'recovery'
  const [userPreferences, setUserPreferences] = useState(null);
  const [savedProperties, setSavedProperties] = useState(new Set());

  // ✅ Filter state management - consolidated and organized
  const [basicFilters, setBasicFilters] = useState({
    location: '',
    state: '',
    maxRent: '',
    minBedrooms: '',
    housingType: [],
    furnished: false,
    petsAllowed: false,
    utilityBudget: ''
  });

  const [recoveryFilters, setRecoveryFilters] = useState({
    recoveryHousingOnly: true,
    soberness: '',
    caseManagement: false,
    counselingServices: false,
    supportGroups: false,
    requiredPrograms: [],
    recoveryStage: ''
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    acceptedSubsidies: [],
    amenities: [],
    utilitiesIncluded: [],
    accessibilityFeatures: [],
    smokingPolicy: '',
    guestPolicy: '',
    backgroundCheck: '',
    leaseLength: '',
    moveInCost: ''
  });

  // ✅ Debouncing ref for search optimization
  const searchTimeoutRef = useRef(null);

  // ✅ CORRECTED: Load user preferences from applicant_matching_profiles (EXACT SCHEMA ALIGNMENT)
const loadUserPreferences = useCallback(async () => {
  if (!user?.id) {
    console.log('⚠️ usePropertySearch: No user ID provided');
    return;
  }

  try {
    console.log('👤 usePropertySearch: Loading user preferences for auth user:', user.id);
    
    // ✅ Get registrant_profiles.id first since applicant_matching_profiles.user_id references that
    const { data: registrantData, error: registrantError } = await supabase
      .from('registrant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    console.log('📋 usePropertySearch: Registrant query result:', {
      registrantData,
      registrantError,
      authUserId: user.id
    });

    if (registrantError || !registrantData) {
      console.log('ℹ️ usePropertySearch: No registrant profile found for user - this is likely the problem!');
      return;
    }

    console.log('🔍 usePropertySearch: About to query applicant_matching_profiles with registrant_id:', registrantData.id);

    // ✅ UPDATED: Query with exact schema field names
    const { data, error } = await supabase
      .from('applicant_matching_profiles')
      .select(`
        user_id,
        primary_city,
        primary_state,
        budget_min,
        budget_max,
        housing_types_accepted,
        preferred_bedrooms,
        furnished_preference,
        pets_owned,
        pets_comfortable,
        recovery_stage,
        substance_free_home_required,
        move_in_date,
        accessibility_needed,
        parking_required,
        public_transit_access,
        utilities_included_preference
      `)
      .eq('user_id', registrantData.id)
      .single();

    console.log('📊 usePropertySearch: Applicant profile query result:', {
      data,
      error,
      queryUserId: registrantData.id
    });

    if (error) {
      if (error.code !== 'PGRST116') { // Not "no rows returned"
        console.error('❌ usePropertySearch: Error loading user preferences:', error);
      } else {
        console.log('ℹ️ usePropertySearch: No applicant matching profile found for user');
      }
      return;
    }

    if (data) {
      setUserPreferences(data);
      console.log('✅ usePropertySearch: User preferences loaded from applicant_matching_profiles');
    }
  } catch (err) {
    console.error('💥 usePropertySearch: Exception loading user preferences:', err);
  }
}, [user?.id]);
  // ✅ Load saved properties from favorites table (SCHEMA ALIGNED)
  const loadSavedProperties = useCallback(async () => {
    if (!user?.id) return;

    try {
      // ✅ CORRECTED: Use proper favorites table structure from schema
      const { data: registrantData } = await supabase
        .from('registrant_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (registrantData) {
        const { data } = await supabase
          .from('favorites')
          .select('favorited_property_id')
          .eq('favoriting_user_id', registrantData.id)
          .eq('favorite_type', 'property');
        
        setSavedProperties(new Set(data?.map(item => item.favorited_property_id) || []));
      }
    } catch (err) {
      console.error('Error loading saved properties:', err);
      setSavedProperties(new Set());
    }
  }, [user?.id]);

  // ✅ CORRECTED: Property search with exact schema field names
  const performSearch = useCallback(async (resetPage = true) => {
    if (resetPage) {
      setCurrentPage(1);
    }
    
    setLoading(true);
    try {
      console.log('🔍 Searching properties with mode:', searchMode, 'Page:', currentPage);
      
      // ✅ CORRECTED: Build query with exact schema field names
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'available')
        .eq('accepting_applications', true);

      // ✅ Enhanced location filtering
      if (basicFilters.location.trim()) {
        const searchLocation = basicFilters.location.trim();
        const locationParts = searchLocation.split(',').map(part => part.trim());
        
        if (locationParts.length === 2) {
          // Handle "City, State" format
          const [city, state] = locationParts;
          query = query.or(`city.ilike.%${city}%,state.ilike.%${state}%,address.ilike.%${searchLocation}%`);
        } else {
          // Single location term - search across multiple fields
          query = query.or(`city.ilike.%${searchLocation}%,state.ilike.%${searchLocation}%,address.ilike.%${searchLocation}%`);
        }
      }

      // ✅ Basic filter applications
      if (basicFilters.state) {
        query = query.eq('state', basicFilters.state);
      }

      if (basicFilters.maxRent) {
        query = query.lte('monthly_rent', parseInt(basicFilters.maxRent));
      }

      if (basicFilters.minBedrooms) {
        query = query.gte('bedrooms', parseInt(basicFilters.minBedrooms));
      }

      // ✅ CORRECTED: Housing type filtering with exact schema property_type values
      if (basicFilters.housingType.length > 0) {
        const typeConditions = basicFilters.housingType.map(type => `property_type.eq.${type}`).join(',');
        query = query.or(typeConditions);
      }

      // ✅ CORRECTED: Property feature filters with exact schema field names
      if (basicFilters.furnished) {
        query = query.eq('furnished', true);
      }

      if (basicFilters.petsAllowed) {
        query = query.eq('pets_allowed', true);
      }

      // ✅ CORRECTED: Recovery housing mode filtering with exact schema fields
      if (searchMode === 'recovery') {
        if (recoveryFilters.recoveryHousingOnly) {
          query = query.eq('is_recovery_housing', true); // ✅ FIXED: Correct field name
        }
        
        // ✅ CORRECTED: Use individual boolean fields instead of non-existent recovery_features array
        if (recoveryFilters.caseManagement) {
          query = query.eq('case_management', true);
        }
        
        if (recoveryFilters.counselingServices) {
          query = query.eq('counseling_services', true);
        }
        
        if (recoveryFilters.supportGroups) {
          // Note: This would need to be mapped to job_training, medical_services, etc. 
          // or we need to add a support_groups field to the schema
          // For now, we'll look for properties with any support services
          query = query.or('counseling_services.eq.true,case_management.eq.true,job_training.eq.true');
        }

        // ✅ CORRECTED: Use exact schema field for required programs
        if (recoveryFilters.requiredPrograms.length > 0) {
          query = query.overlaps('required_programs', recoveryFilters.requiredPrograms);
        }

        // ✅ NEW: Add sobriety time filtering if provided
        if (recoveryFilters.soberness) {
          query = query.eq('min_sobriety_time', recoveryFilters.soberness);
        }
      }

      // ✅ CORRECTED: Advanced filters with exact schema field names
      if (advancedFilters.acceptedSubsidies.length > 0) {
        query = query.overlaps('accepted_subsidies', advancedFilters.acceptedSubsidies);
      }

      if (advancedFilters.amenities.length > 0) {
        query = query.overlaps('amenities', advancedFilters.amenities);
      }

      if (advancedFilters.utilitiesIncluded.length > 0) {
        query = query.overlaps('utilities_included', advancedFilters.utilitiesIncluded);
      }

      if (advancedFilters.accessibilityFeatures.length > 0) {
        query = query.overlaps('accessibility_features', advancedFilters.accessibilityFeatures);
      }

      if (advancedFilters.smokingPolicy) {
        query = query.eq('smoking_allowed', advancedFilters.smokingPolicy === 'allowed');
      }

      if (advancedFilters.leaseLength) {
        // ✅ CORRECTED: Use lease_duration from schema
        query = query.ilike('lease_duration', `%${advancedFilters.leaseLength}%`);
      }

      if (advancedFilters.moveInCost) {
        // Calculate total move-in cost (rent + deposit + fees)
        const maxMoveInCost = parseInt(advancedFilters.moveInCost);
        // This is a complex calculation, so we'll filter on monthly_rent as a proxy
        query = query.lte('monthly_rent', Math.floor(maxMoveInCost / 2));
      }

      // ✅ Pagination
      const pageSize = 12;
      const actualPage = resetPage ? 1 : currentPage;
      const from = (actualPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query.range(from, to);

      // ✅ CORRECTED: Smart ordering with exact schema field names
      if (searchMode === 'recovery') {
        query = query.order('is_recovery_housing', { ascending: false })
                    .order('monthly_rent', { ascending: true });
      } else {
        // Prioritize recovery housing in general search too
        query = query.order('is_recovery_housing', { ascending: false })
                    .order('monthly_rent', { ascending: true });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Search error:', error);
        throw new Error(error.message || 'Failed to search properties');
      }

      const results = data || [];
      setProperties(results);
      setTotalResults(count || 0);
      
      if (resetPage) {
        setCurrentPage(1);
      }
      
      console.log(`✅ Found ${results.length} properties (${count} total)`);
      
    } catch (error) {
      console.error('Error searching properties:', error);
      setProperties([]);
      setTotalResults(0);
      throw error; // Re-throw to allow component to handle user notification
    } finally {
      setLoading(false);
    }
  }, [basicFilters, recoveryFilters, advancedFilters, searchMode, currentPage]);

  // ✅ OPTIMIZED: Debounced search function
  const debouncedSearch = useCallback((resetPage = true) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(resetPage);
    }, 300); // 300ms debounce delay
  }, [performSearch]);

  // ✅ Filter change handlers with automatic search triggering
  const handleBasicFilterChange = useCallback((field, value) => {
    setBasicFilters(prev => ({
      ...prev,
      [field]: value
    }));
    debouncedSearch(true); // Reset to page 1 on filter changes
  }, [debouncedSearch]);

  const handleRecoveryFilterChange = useCallback((field, value) => {
    setRecoveryFilters(prev => ({
      ...prev,
      [field]: value
    }));
    debouncedSearch(true);
  }, [debouncedSearch]);

  const handleAdvancedFilterChange = useCallback((field, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [field]: value
    }));
    debouncedSearch(true);
  }, [debouncedSearch]);

  // ✅ Array filter changes (checkboxes, multi-select)
  const handleArrayFilterChange = useCallback((filterGroup, field, value, isChecked) => {
    const setFilter = filterGroup === 'basic' ? setBasicFilters : 
                     filterGroup === 'recovery' ? setRecoveryFilters : 
                     setAdvancedFilters;
    
    setFilter(prev => ({
      ...prev,
      [field]: isChecked
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter(item => item !== value)
    }));
    
    debouncedSearch(true);
  }, [debouncedSearch]);

  // ✅ Search mode change handler
  const handleSearchModeChange = useCallback((mode) => {
    setSearchMode(mode);
    
    // Update recovery filters based on mode
    if (mode === 'recovery') {
      setRecoveryFilters(prev => ({
        ...prev,
        recoveryHousingOnly: true
      }));
    }
    
    debouncedSearch(true);
  }, [debouncedSearch]);

  // ✅ CORRECTED: Auto-populate filters from user preferences (EXACT SCHEMA ALIGNMENT)
  const applyUserPreferences = useCallback(() => {
    if (userPreferences) {
      console.log('🔄 Applying user preferences from applicant_matching_profiles...');
      
      // ✅ CORRECTED: Map exact schema fields to filter fields
      const autoFilters = {
        location: userPreferences.primary_city ? 
          `${userPreferences.primary_city}, ${userPreferences.primary_state}` : '',
        state: userPreferences.primary_state || '',
        maxRent: userPreferences.budget_max?.toString() || '',
        minBedrooms: userPreferences.preferred_bedrooms || '',
        housingType: userPreferences.housing_types_accepted || [],
        furnished: userPreferences.furnished_preference || false,
        petsAllowed: userPreferences.pets_owned || userPreferences.pets_comfortable || false
      };
      
      setBasicFilters(prev => ({ ...prev, ...autoFilters }));
      
      // ✅ CORRECTED: Apply recovery-specific preferences with exact schema fields
      if (userPreferences.recovery_stage || userPreferences.substance_free_home_required) {
        setRecoveryFilters(prev => ({
          ...prev,
          recoveryStage: userPreferences.recovery_stage || '',
          recoveryHousingOnly: userPreferences.substance_free_home_required || true
        }));
      }
      
      // ✅ CORRECTED: Apply advanced preferences with exact schema fields
      const advancedPrefs = {};
      if (userPreferences.accessibility_needed) {
        advancedPrefs.accessibilityFeatures = ['wheelchair_accessible'];
      }
      
      if (Object.keys(advancedPrefs).length > 0) {
        setAdvancedFilters(prev => ({ ...prev, ...advancedPrefs }));
      }
      
      debouncedSearch(true);
      console.log('✅ User preferences applied successfully');
      return true; // Success
    }
    console.log('ℹ️ No user preferences found to apply');
    return false; // No preferences found
  }, [userPreferences, debouncedSearch]);

  // ✅ Clear all filters
  const clearAllFilters = useCallback(() => {
    setBasicFilters({
      location: '',
      state: '',
      maxRent: '',
      minBedrooms: '',
      housingType: [],
      furnished: false,
      petsAllowed: false,
      utilityBudget: ''
    });
    
    setRecoveryFilters({
      recoveryHousingOnly: searchMode === 'recovery',
      soberness: '',
      caseManagement: false,
      counselingServices: false,
      supportGroups: false,
      requiredPrograms: [],
      recoveryStage: ''
    });
    
    setAdvancedFilters({
      acceptedSubsidies: [],
      amenities: [],
      utilitiesIncluded: [],
      accessibilityFeatures: [],
      smokingPolicy: '',
      guestPolicy: '',
      backgroundCheck: '',
      leaseLength: '',
      moveInCost: ''
    });

    debouncedSearch(true);
  }, [searchMode, debouncedSearch]);

  // ✅ Page navigation
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    performSearch(false); // Don't reset page, just search with new page
  }, [performSearch]);

  // ✅ CORRECTED: Save property using exact schema favorites structure
  const handleSaveProperty = useCallback(async (property) => {
    if (!user?.id) return false;

    try {
      // Get registrant profile id
      const { data: registrantData } = await supabase
        .from('registrant_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (registrantData) {
        // ✅ CORRECTED: Use exact schema favorites structure
        await supabase
          .from('favorites')
          .insert({ 
            favoriting_user_id: registrantData.id,
            favorited_property_id: property.id,
            favorite_type: 'property'
          });

        setSavedProperties(prev => new Set([...prev, property.id]));
        return true;
      }
    } catch (error) {
      console.error('Error saving property:', error);
    }
    
    return false;
  }, [user?.id]);

  // ✅ Initialize data loading
  useEffect(() => {
    loadUserPreferences();
    loadSavedProperties();
  }, [loadUserPreferences, loadSavedProperties]);

  // ✅ Perform initial search when component mounts
  useEffect(() => {
    performSearch(true);
  }, []); // Only run once on mount

  // ✅ Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ✅ Calculate pagination info
  const totalPages = Math.ceil(totalResults / 12);
  const showPagination = totalPages > 1;

  // ✅ Return all state and handlers for the component
  return {
    // Search state
    loading,
    properties,
    totalResults,
    totalPages,
    currentPage,
    showPagination,
    searchMode,
    userPreferences,
    savedProperties,

    // Filter states
    basicFilters,
    recoveryFilters,
    advancedFilters,

    // Action handlers
    handleBasicFilterChange,
    handleRecoveryFilterChange,
    handleAdvancedFilterChange,
    handleArrayFilterChange,
    handleSearchModeChange,
    handlePageChange,
    handleSaveProperty,
    
    // Utility functions
    applyUserPreferences,
    clearAllFilters,
    performSearch: () => performSearch(true) // Manual search trigger
  };
};

export default usePropertySearch;