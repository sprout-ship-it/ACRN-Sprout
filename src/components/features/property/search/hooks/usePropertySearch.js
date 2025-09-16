// src/components/features/property/search/hooks/usePropertySearch.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../../../utils/supabase';

// ✅ IMPROVED: Custom hook for property search logic and state management
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

  // ✅ FIXED: Load user preferences from applicant profile
  const loadUserPreferences = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('👤 Loading user housing preferences...');
      const { data, error } = await supabase
        .from('applicant_forms')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not "no rows returned"
          console.error('Error loading user preferences:', error);
        }
        return;
      }

      if (data) {
        setUserPreferences(data);
        console.log('✅ User preferences loaded');
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
    }
  }, [user?.id]);

  // ✅ Load saved properties (placeholder for future feature)
  const loadSavedProperties = useCallback(async () => {
    // Future: Load from user_saved_properties table
    // const { data } = await supabase
    //   .from('user_saved_properties')
    //   .select('property_id')
    //   .eq('user_id', user.id);
    // setSavedProperties(new Set(data?.map(item => item.property_id) || []));
    
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
          query = query.eq('is_recovery_housing', true);
        }
        
        if (recoveryFilters.caseManagement) {
          query = query.eq('case_management', true);
        }
        
        if (recoveryFilters.counselingServices) {
          query = query.eq('counseling_services', true);
        }
        
        if (recoveryFilters.supportGroups) {
          query = query.eq('support_groups', true);
        }

        if (recoveryFilters.requiredPrograms.length > 0) {
          query = query.overlaps('required_programs', recoveryFilters.requiredPrograms);
        }
      }

      // ✅ Advanced filters application
      if (advancedFilters.acceptedSubsidies.length > 0) {
        query = query.overlaps('accepted_subsidies', advancedFilters.acceptedSubsidies);
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
        query = query.gte('min_lease_months', parseInt(advancedFilters.leaseLength));
      }

      // ✅ Pagination
      const pageSize = 12;
      const actualPage = resetPage ? 1 : currentPage;
      const from = (actualPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query.range(from, to);

      // ✅ Smart ordering based on search mode
      if (searchMode === 'recovery') {
        query = query.order('is_recovery_housing', { ascending: false })
                    .order('case_management', { ascending: false })
                    .order('monthly_rent', { ascending: true });
      } else {
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

  // ✅ Auto-populate filters from user preferences
  const applyUserPreferences = useCallback(() => {
    if (userPreferences) {
      const autoFilters = {
        location: userPreferences.preferred_city || '',
        state: userPreferences.preferred_state || '',
        maxRent: userPreferences.budget_max?.toString() || '',
        minBedrooms: userPreferences.preferred_bedrooms?.toString() || '',
        housingType: userPreferences.housing_type || [],
        furnished: userPreferences.furnished_preference || false,
        petsAllowed: userPreferences.pets_owned || false
      };
      
      setBasicFilters(prev => ({ ...prev, ...autoFilters }));
      debouncedSearch(true);
      return true; // Success
    }
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
    
    // Future: Save to database
    // await supabase
    //   .from('user_saved_properties')
    //   .insert({ user_id: user.id, property_id: property.id });
    
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