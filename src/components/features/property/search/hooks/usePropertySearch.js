// src/components/features/property/search/hooks/usePropertySearch.js - UPDATED FOR NEW FIELDS
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../../../utils/supabase';

const usePropertySearch = (user) => {
  // ✅ Search state management
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState('all_housing'); // 'all_housing', 'general_only', 'recovery_only'
  const [userPreferences, setUserPreferences] = useState(null);
  const [savedProperties, setSavedProperties] = useState(new Set());

  // ✅ UPDATED: Shared filter state with new zipCode field
  const [sharedFilters, setSharedFilters] = useState({
    location: '',
    state: '',
    zipCode: '', // NEW: Added zipCode field
    maxRent: '',
    minBedrooms: '',
    availableDate: '',
    acceptedSubsidies: [],
    furnished: false,
    petsAllowed: false,
    smokingAllowed: false,
    utilitiesIncluded: []
  });

  // ✅ UPDATED: Recovery filters with hasOpenBed instead of minAvailableBeds
  const [recoveryFilters, setRecoveryFilters] = useState({
    // Recovery Housing Details
    hasOpenBed: false, // UPDATED: Changed from minAvailableBeds to hasOpenBed
    maxWeeklyRate: '',
    
    // Recovery Services & Features
    mealsIncluded: false,
    linensProvided: false,
    immediateMovein: false,
    
    // Recovery Program Requirements
    recoveryStage: '',
    sobrietyTime: '',
    treatmentCompletion: '',
    acceptablePrograms: [],
    
    // Demographics & Community
    genderPreference: '',
    agePreference: '',
    acceptsCriminalBackground: false,
    
    // Recovery Support Services
    caseManagement: false,
    counselingServices: false,
    jobTraining: false,
    medicalServices: false,
    transportationServices: false,
    lifeSkillsTraining: false,
    
    // Licensing & Accreditation
    requiresLicensing: false,
    requiresAccreditation: false
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    amenities: [],
    accessibilityFeatures: [],
    neighborhoodFeatures: [],
    backgroundCheck: '',
    leaseLength: '',
    moveInCost: ''
  });

  // ✅ Debouncing ref for search optimization
  const searchTimeoutRef = useRef(null);

  // ✅ Load user preferences from applicant_matching_profiles
  const loadUserPreferences = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ usePropertySearch: No user ID provided');
      return;
    }

    try {
      console.log('👤 usePropertySearch: Loading user preferences for auth user:', user.id);
      
      const { data: registrantData, error: registrantError } = await supabase
        .from('registrant_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (registrantError || !registrantData) {
        console.log('ℹ️ usePropertySearch: No registrant profile found for user');
        return;
      }

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

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('❌ usePropertySearch: Error loading user preferences:', error);
        }
        return;
      }

      if (data) {
        setUserPreferences(data);
        console.log('✅ usePropertySearch: User preferences loaded');
      }
    } catch (err) {
      console.error('💥 usePropertySearch: Exception loading user preferences:', err);
    }
  }, [user?.id]);

  // ✅ Load saved properties from favorites table
  const loadSavedProperties = useCallback(async () => {
    if (!user?.id) return;

    try {
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

  // ✅ UPDATED: Property search with new fields and fixed syntax
  const performSearch = useCallback(async (resetPage = true) => {
    if (resetPage) {
      setCurrentPage(1);
    }
    
    setLoading(true);
    try {
      console.log('🔍 Searching properties with type:', searchType, 'Page:', currentPage);
       useEffect(() => {
    loadUserPreferences();
    loadSavedProperties();
  }, [loadUserPreferences, loadSavedProperties]);

  // ✅ Perform initial search when component mounts
  useEffect(() => {
    performSearch(true);
  }, []); // Only run once on mount 
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'available')
        .eq('accepting_applications', true);

      // ✅ Apply search type filtering
      if (searchType === 'general_only') {
        query = query.eq('is_recovery_housing', false);
      } else if (searchType === 'recovery_only') {
        query = query.eq('is_recovery_housing', true);
      }

      // ✅ SHARED FILTERS: Apply to all search types
      
      // ✅ FIXED: Location filtering with proper Supabase syntax
      if (sharedFilters.location.trim()) {
        const searchLocation = sharedFilters.location.trim();
        const locationParts = searchLocation.split(',').map(part => part.trim());
        
        if (locationParts.length === 2) {
          const [city, state] = locationParts;
          query = query.or(`city.ilike.*${city}*,state.ilike.*${state}*,address.ilike.*${searchLocation}*`);
        } else {
          query = query.or(`city.ilike.*${searchLocation}*,state.ilike.*${searchLocation}*,address.ilike.*${searchLocation}*`);
        }
      }

      // Basic shared filters
      if (sharedFilters.state) {
        query = query.eq('state', sharedFilters.state);
      }

      // ✅ NEW: ZIP code filtering
      if (sharedFilters.zipCode) {
        query = query.eq('zip_code', sharedFilters.zipCode);
      }

      if (sharedFilters.maxRent) {
        query = query.lte('monthly_rent', parseInt(sharedFilters.maxRent));
      }

      if (sharedFilters.minBedrooms) {
        query = query.gte('bedrooms', parseInt(sharedFilters.minBedrooms));
      }

      if (sharedFilters.availableDate) {
        query = query.lte('available_date', sharedFilters.availableDate);
      }

      // Shared property features
      if (sharedFilters.furnished) {
        query = query.eq('furnished', true);
      }

      if (sharedFilters.petsAllowed) {
        query = query.eq('pets_allowed', true);
      }

      if (sharedFilters.smokingAllowed) {
        query = query.eq('smoking_allowed', true);
      }

      // Housing assistance programs
      if (sharedFilters.acceptedSubsidies.length > 0) {
        query = query.overlaps('accepted_subsidies', sharedFilters.acceptedSubsidies);
      }

      // Utilities included
      if (sharedFilters.utilitiesIncluded.length > 0) {
        query = query.overlaps('utilities_included', sharedFilters.utilitiesIncluded);
      }

      // ✅ RECOVERY FILTERS: Only apply if searching recovery housing
      if (searchType === 'all_housing' || searchType === 'recovery_only') {
        
        // ✅ UPDATED: Has open bed filtering (simplified from minAvailableBeds)
        if (recoveryFilters.hasOpenBed) {
          query = query.gt('available_beds', 0);
        }

        if (recoveryFilters.maxWeeklyRate) {
          query = query.lte('weekly_rate', parseInt(recoveryFilters.maxWeeklyRate));
        }

        // Recovery services & features
        if (recoveryFilters.mealsIncluded) {
          query = query.eq('meals_included', true);
        }

        if (recoveryFilters.linensProvided) {
          query = query.eq('linens_provided', true);
        }

        if (recoveryFilters.immediateMovein) {
          query = query.in('move_in_timeline', ['immediate', '24_hours']);
        }

        // Recovery program requirements
        if (recoveryFilters.sobrietyTime) {
          query = query.eq('min_sobriety_time', recoveryFilters.sobrietyTime);
        }

        if (recoveryFilters.treatmentCompletion) {
          query = query.eq('treatment_completion_required', recoveryFilters.treatmentCompletion);
        }

        if (recoveryFilters.acceptablePrograms.length > 0) {
          query = query.overlaps('required_programs', recoveryFilters.acceptablePrograms);
        }

        // Demographics & community
        if (recoveryFilters.genderPreference && recoveryFilters.genderPreference !== 'any') {
          query = query.or(`gender_restrictions.eq.any,gender_restrictions.eq.${recoveryFilters.genderPreference}`);
        }

        if (recoveryFilters.acceptsCriminalBackground) {
          query = query.eq('criminal_background_ok', true);
        }

        // Recovery support services
        if (recoveryFilters.caseManagement) {
          query = query.eq('case_management', true);
        }

        if (recoveryFilters.counselingServices) {
          query = query.eq('counseling_services', true);
        }

        if (recoveryFilters.jobTraining) {
          query = query.eq('job_training', true);
        }

        if (recoveryFilters.medicalServices) {
          query = query.eq('medical_services', true);
        }

        if (recoveryFilters.transportationServices) {
          query = query.eq('transportation_services', true);
        }

        if (recoveryFilters.lifeSkillsTraining) {
          query = query.eq('life_skills_training', true);
        }

        // Licensing & accreditation
        if (recoveryFilters.requiresLicensing) {
          query = query.not('license_number', 'is', null);
        }

        if (recoveryFilters.requiresAccreditation) {
          query = query.not('accreditation', 'is', null);
        }
      }

      // ✅ ADVANCED FILTERS: Apply to all search types
      if (advancedFilters.amenities.length > 0) {
        query = query.overlaps('amenities', advancedFilters.amenities);
      }

      if (advancedFilters.accessibilityFeatures.length > 0) {
        query = query.overlaps('accessibility_features', advancedFilters.accessibilityFeatures);
      }

      if (advancedFilters.neighborhoodFeatures.length > 0) {
        query = query.overlaps('neighborhood_features', advancedFilters.neighborhoodFeatures);
      }

      if (advancedFilters.leaseLength) {
        query = query.ilike('lease_duration', `%${advancedFilters.leaseLength}%`);
      }

      if (advancedFilters.moveInCost) {
        const maxMoveInCost = parseInt(advancedFilters.moveInCost);
        query = query.lte('monthly_rent', Math.floor(maxMoveInCost / 2));
      }

      // ✅ Pagination
      const pageSize = 12;
      const actualPage = resetPage ? 1 : currentPage;
      const from = (actualPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query.range(from, to);

      // ✅ Smart ordering based on search type
      if (searchType === 'recovery_only') {
        query = query.order('available_beds', { ascending: false })
                    .order('case_management', { ascending: false })
                    .order('monthly_rent', { ascending: true });
      } else if (searchType === 'general_only') {
        query = query.order('monthly_rent', { ascending: true })
                    .order('bedrooms', { ascending: true });
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
      
      console.log(`✅ Found ${results.length} properties (${count} total) for search type: ${searchType}`);
      
    } catch (error) {
      console.error('Error searching properties:', error);
      setProperties([]);
      setTotalResults(0);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sharedFilters, recoveryFilters, advancedFilters, searchType, currentPage]);

  // ✅ Debounced search function
  const debouncedSearch = useCallback((resetPage = true) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(resetPage);
    }, 300);
  }, [performSearch]);

  // ✅ Filter change handlers
  const handleSharedFilterChange = useCallback((field, value) => {
    setSharedFilters(prev => ({
      ...prev,
      [field]: value
    }));
    debouncedSearch(true);
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

  // ✅ Array filter changes
  const handleArrayFilterChange = useCallback((filterGroup, field, value, isChecked) => {
    const setFilter = filterGroup === 'shared' ? setSharedFilters : 
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

  // ✅ Search type change handler
  const handleSearchTypeChange = useCallback((type) => {
    setSearchType(type);
    debouncedSearch(true);
  }, [debouncedSearch]);

  // ✅ Apply user preferences to filters
  const applyUserPreferences = useCallback(() => {
    if (userPreferences) {
      console.log('🔄 Applying user preferences...');
      
      const autoFilters = {
        location: userPreferences.primary_city ? 
          `${userPreferences.primary_city}, ${userPreferences.primary_state}` : '',
        state: userPreferences.primary_state || '',
        maxRent: userPreferences.budget_max?.toString() || '',
        minBedrooms: userPreferences.preferred_bedrooms || '',
        furnished: userPreferences.furnished_preference || false,
        petsAllowed: userPreferences.pets_owned || userPreferences.pets_comfortable || false
      };
      
      setSharedFilters(prev => ({ ...prev, ...autoFilters }));
      
      if (userPreferences.recovery_stage || userPreferences.substance_free_home_required) {
        setRecoveryFilters(prev => ({
          ...prev,
          recoveryStage: userPreferences.recovery_stage || ''
        }));
        
        if (userPreferences.substance_free_home_required) {
          setSearchType('recovery_only');
        }
      }
      
      debouncedSearch(true);
      console.log('✅ User preferences applied successfully');
      return true;
    }
    return false;
  }, [userPreferences, debouncedSearch]);

  // ✅ UPDATED: Clear all filters with new fields
  const clearAllFilters = useCallback(() => {
    setSharedFilters({
      location: '',
      state: '',
      zipCode: '', // NEW: Clear zipCode
      maxRent: '',
      minBedrooms: '',
      availableDate: '',
      acceptedSubsidies: [],
      furnished: false,
      petsAllowed: false,
      smokingAllowed: false,
      utilitiesIncluded: []
    });
    
    setRecoveryFilters({
      hasOpenBed: false, // UPDATED: Reset hasOpenBed instead of minAvailableBeds
      maxWeeklyRate: '',
      mealsIncluded: false,
      linensProvided: false,
      immediateMovein: false,
      recoveryStage: '',
      sobrietyTime: '',
      treatmentCompletion: '',
      acceptablePrograms: [],
      genderPreference: '',
      agePreference: '',
      acceptsCriminalBackground: false,
      caseManagement: false,
      counselingServices: false,
      jobTraining: false,
      medicalServices: false,
      transportationServices: false,
      lifeSkillsTraining: false,
      requiresLicensing: false,
      requiresAccreditation: false
    });
    
    setAdvancedFilters({
      amenities: [],
      accessibilityFeatures: [],
      neighborhoodFeatures: [],
      backgroundCheck: '',
      leaseLength: '',
      moveInCost: ''
    });

    debouncedSearch(true);
  }, [debouncedSearch]);

  // ✅ Page navigation
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    performSearch(false);
  }, [performSearch]);

  // ✅ Save property functionality
  const handleSaveProperty = useCallback(async (property) => {
    if (!user?.id) return false;

    try {
      const { data: registrantData } = await supabase
        .from('registrant_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (registrantData) {
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

  // ✅ Return updated state and handlers
  return {
    // Search state
    loading,
    properties,
    totalResults,
    totalPages,
    currentPage,
    showPagination,
    searchType,
    userPreferences,
    savedProperties,

    // Updated filter states
    sharedFilters,
    recoveryFilters,
    advancedFilters,

    // Action handlers
    handleSharedFilterChange,
    handleRecoveryFilterChange,
    handleAdvancedFilterChange,
    handleArrayFilterChange,
    handleSearchTypeChange,
    handlePageChange,
    handleSaveProperty,
    
    // Utility functions
    applyUserPreferences,
    clearAllFilters,
    performSearch: () => performSearch(true)
  };
};

export default usePropertySearch;