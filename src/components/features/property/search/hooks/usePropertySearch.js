// src/components/features/property/search/hooks/usePropertySearch.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../../../utils/supabase';

// ✅ UPDATED: Custom hook for property search logic and state management - ALIGNED WITH NEW SCHEMA
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
    smokingPolicy: '',
    guestPolicy: '',
    backgroundCheck: '',
    leaseLength: '',
    moveInCost: ''
  });

  // ✅ Debouncing ref for search optimization
  const searchTimeoutRef = useRef(null);

  // ✅ FIXED: Load user preferences from applicant_matching_profiles (NEW TABLE NAME)
  const loadUserPreferences = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('👤 Loading user housing preferences from applicant_matching_profiles...');
      
      // ✅ UPDATED: Query the correct table with correct field mappings
      const { data, error } = await supabase
        .from('applicant_matching_profiles') // ✅ FIXED: Updated table name
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
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not "no rows returned"
          console.error('Error loading user preferences:', error);
        } else {
          console.log('ℹ️ No applicant matching profile found for user');
        }
        return;
      }

      if (data) {
        setUserPreferences(data);
        console.log('✅ User preferences loaded from applicant_matching_profiles');
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
    }
  }, [user?.id]);

  // ✅ Load saved properties (placeholder for future feature)
  const loadSavedProperties = useCallback(async () => {
    // Future: Load from user_saved_properties table or favorites
    // const { data } = await supabase
    //   .from('favorites')
    //   .select('favorited_user_id')
    //   .eq('user_id', user.id)
    //   .eq('favorite_type', 'housing');
    // setSavedProperties(new Set(data?.map(item => item.favorited_user_id) || []));
    
    setSavedProperties(new Set());
  }, [user?.id]);

  // ✅ ENHANCED: Robust property search with better error handling
  const performSearch = useCallback(async (resetPage = true) => {
    if (resetPage) {
      setCurrentPage(1);
    }
    
    setLoading(true);
    try {
      console.log('🔍 Searching properties with mode:', searchMode, 'Page:', currentPage);
      
      // ✅ Build robust query based on search mode
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'available');

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

      // ✅ Housing type filtering
      if (basicFilters.housingType.length > 0) {
        const typeConditions = basicFilters.housingType.map(type => `property_type.eq.${type}`).join(',');
        query = query.or(typeConditions);
      }

      // ✅ Property feature filters
      if (basicFilters.furnished) {
        query = query.eq('furnished', true);
      }

      if (basicFilters.petsAllowed) {
        query = query.eq('pets_allowed', true);
      }

      // ✅ Recovery housing mode filtering
      if (searchMode === 'recovery') {
        if (recoveryFilters.recoveryHousingOnly) {
          query = query.eq('is_recovery_friendly', true);
        }
        
        if (recoveryFilters.caseManagement) {
          query = query.contains('recovery_features', ['case_management']);
        }
        
        if (recoveryFilters.counselingServices) {
          query = query.contains('recovery_features', ['counseling_services']);
        }
        
        if (recoveryFilters.supportGroups) {
          query = query.contains('recovery_features', ['support_groups']);
        }

        if (recoveryFilters.requiredPrograms.length > 0) {
          query = query.overlaps('recovery_features', recoveryFilters.requiredPrograms);
        }
      }

      // ✅ Advanced filters application
      if (advancedFilters.acceptedSubsidies.length > 0) {
        // Note: This field might need to be added to properties table if not exists
        // query = query.overlaps('accepted_subsidies', advancedFilters.acceptedSubsidies);
      }

      if (advancedFilters.amenities.length > 0) {
        query = query.overlaps('amenities', advancedFilters.amenities);
      }

      if (advancedFilters.utilitiesIncluded.length > 0) {
        query = query.overlaps('utilities_included', advancedFilters.utilitiesIncluded);
      }

      if (advancedFilters.smokingPolicy) {
        query = query.eq('smoking_allowed', advancedFilters.smokingPolicy === 'allowed');
      }

      if (advancedFilters.leaseLength) {
        // Assuming lease_length field exists or using lease_length from schema.sql
        query = query.ilike('lease_length', `%${advancedFilters.leaseLength}%`);
      }

      // ✅ Pagination
      const pageSize = 12;
      const actualPage = resetPage ? 1 : currentPage;
      const from = (actualPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query.range(from, to);

      // ✅ Smart ordering based on search mode
      if (searchMode === 'recovery') {
        query = query.order('is_recovery_friendly', { ascending: false })
                    .order('monthly_rent', { ascending: true });
      } else {
        query = query.order('is_recovery_friendly', { ascending: false })
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

  // ✅ UPDATED: Auto-populate filters from user preferences (ALIGNED WITH NEW SCHEMA)
  const applyUserPreferences = useCallback(() => {
    if (userPreferences) {
      console.log('🔄 Applying user preferences from applicant_matching_profiles...');
      
      // ✅ UPDATED: Map new schema fields to filter fields
      const autoFilters = {
        location: userPreferences.primary_city ? 
          `${userPreferences.primary_city}, ${userPreferences.primary_state}` : '',
        state: userPreferences.primary_state || '',
        maxRent: userPreferences.budget_max?.toString() || '',
        minBedrooms: userPreferences.preferred_bedrooms?.toString() || '',
        housingType: userPreferences.housing_types_accepted || [],
        furnished: userPreferences.furnished_preference || false,
        petsAllowed: userPreferences.pets_owned || userPreferences.pets_comfortable || false
      };
      
      setBasicFilters(prev => ({ ...prev, ...autoFilters }));
      
      // ✅ NEW: Apply recovery-specific preferences if available
      if (userPreferences.recovery_stage || userPreferences.substance_free_home_required) {
        setRecoveryFilters(prev => ({
          ...prev,
          recoveryStage: userPreferences.recovery_stage || '',
          recoveryHousingOnly: userPreferences.substance_free_home_required || true
        }));
      }
      
      // ✅ NEW: Apply advanced preferences
      const advancedPrefs = {};
      if (userPreferences.accessibility_needed) {
        advancedPrefs.amenities = ['wheelchair_accessible'];
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
      smokingPolicy: '',
      guestProperty: '',
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

  // ✅ Save property (placeholder for future feature)
  const handleSaveProperty = useCallback((property) => {
    setSavedProperties(prev => new Set([...prev, property.id]));
    
    // Future: Save to database via favorites system
    // await supabase
    //   .from('favorites')
    //   .insert({ 
    //     user_id: user.id, 
    //     favorited_user_id: property.landlord_id,
    //     favorite_type: 'housing'
    //   });
    
    return true; // Success indicator
  }, []);

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