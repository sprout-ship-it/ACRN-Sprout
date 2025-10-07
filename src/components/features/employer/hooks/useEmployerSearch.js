// src/components/features/employer/hooks/useEmployerSearch.js - FIXED ID HANDLING
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { db } from '../../../../utils/supabase';

const useEmployerSearch = () => {
  const { user, profile } = useAuth(); // user = auth user, profile = registrant profile
  
  // Core state
  const [employers, setEmployers] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [connections, setConnections] = useState(new Set());
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter state - consolidated into single object
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    state: '',
    businessType: '',
    recoveryFeatures: [],
    jobTypes: [],
    remoteWork: '',
    isActivelyHiring: true,
    hasOpenings: false
  });

  // Search debounce
  const [searchTimeout, setSearchTimeout] = useState(null);

  /**
   * ✅ FIXED: Load existing connections using correct applicant profile ID
   */
  const loadConnections = useCallback(async () => {
    if (!user?.id || !profile?.id) return;

    try {
      console.log('📊 Loading existing employer connections...');
      
      // ✅ CRITICAL FIX: Get the applicant profile ID first
      let applicantProfileId = null;
      try {
        const { data: applicantProfile } = await db.supabase
          .from('applicant_matching_profiles')
          .select('id, user_id')
          .eq('user_id', profile.id) // profile.id is registrant_profiles.id
          .single();
        
        if (applicantProfile) {
          applicantProfileId = applicantProfile.id;
          console.log('✅ Found applicant profile ID:', applicantProfileId);
        } else {
          console.warn('⚠️ No applicant profile found for registrant:', profile.id);
          setConnections(new Set());
          return;
        }
      } catch (err) {
        console.warn('⚠️ Could not load applicant profile:', err.message);
        setConnections(new Set());
        return;
      }
      
      // ✅ FIXED: Check if service exists and handle gracefully
      if (!db.matchRequests || typeof db.matchRequests.getByUserId !== 'function') {
        console.warn('⚠️ Match requests service not available, skipping connection status');
        setConnections(new Set());
        return;
      }
      
      // ✅ FIXED: Use applicant profile ID for match requests
      const result = await db.matchRequests.getByUserId('applicant', applicantProfileId);
      
      if (result.success !== false && result.data) {
        const existingConnections = new Set(
          result.data
            .filter(req => 
              req.requester_id === applicantProfileId && 
              req.request_type === 'employment' &&
              ['pending', 'matched'].includes(req.status)
            )
            .map(req => req.target_id) // This should be employer profile user_id
        );
        
        setConnections(existingConnections);
        console.log('📊 Loaded employer connections:', existingConnections.size);
      } else {
        console.log('📊 No existing connections found');
        setConnections(new Set());
      }
    } catch (err) {
      console.warn('⚠️ Could not load employer connections (non-critical):', err.message);
      setConnections(new Set()); // Don't fail completely - just disable connection status
    }
  }, [user?.id, profile?.id]);

  /**
   * ✅ FIXED: Load user's favorite employers using correct profile ID
   */
  const loadFavorites = useCallback(async () => {
    if (!user?.id || !profile?.id) return;
    
    setFavoritesLoading(true);
    try {
      console.log('⭐ Loading favorite employers...');
      
      // ✅ FIXED: Check multiple possible service paths
      if (!db.employerProfiles?.favorites) {
        console.warn('⚠️ Employer favorites service not available');
        setFavorites(new Set());
        return;
      }

      // ✅ FIXED: Use registrant profile ID for favorites (matches employer_favorites table)
      const result = await db.employerProfiles.favorites.getByUserId(profile.id);
      
      if (result.error && !result.data) {
        throw new Error(result.error.message || 'Failed to load favorites');
      }
      
      const favoriteEmployerIds = new Set(
        (result.data || []).map(fav => fav.employer_user_id)
      );
      
      setFavorites(favoriteEmployerIds);
      console.log('⭐ Loaded favorite employers:', favoriteEmployerIds.size);
    } catch (err) {
      console.warn('⚠️ Could not load favorite employers (non-critical):', err.message);
      setFavorites(new Set());
    } finally {
      setFavoritesLoading(false);
    }
  }, [user?.id, profile?.id]);

  /**
   * ✅ FIXED: Debounced employer search function with correct ID filtering
   */
  const loadEmployers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Loading employers with filters:', filters);
      
      // Build filter object for database query
      const dbFilters = {
        isActivelyHiring: filters.isActivelyHiring
      };
      
      if (filters.industry) {
        dbFilters.industry = filters.industry;
      }
      
      if (filters.location.trim()) {
        // Handle both city and state in location field
        const locationParts = filters.location.split(',').map(part => part.trim());
        if (locationParts.length === 2) {
          dbFilters.city = locationParts[0];
          dbFilters.state = locationParts[1].toUpperCase();
        } else {
          // Single location term - could be city or state
          const singleLocation = filters.location.trim();
          if (singleLocation.length === 2) {
            dbFilters.state = singleLocation.toUpperCase();
          } else {
            dbFilters.city = singleLocation;
          }
        }
      }

      if (filters.state) {
        dbFilters.state = filters.state;
      }

      if (filters.businessType) {
        dbFilters.businessType = filters.businessType;
      }

      if (filters.recoveryFeatures.length > 0) {
        dbFilters.recoveryFeatures = filters.recoveryFeatures;
      }

      if (filters.jobTypes.length > 0) {
        dbFilters.jobTypes = filters.jobTypes;
      }

      if (filters.remoteWork) {
        dbFilters.remoteWork = filters.remoteWork;
      }

      // Get available employers from database
      if (!db.employerProfiles) {
        throw new Error('Employer service not available');
      }
      
      const result = await db.employerProfiles.getAvailable(dbFilters);
      
      if (result.error && !result.data) {
        throw new Error(result.error.message || 'Failed to load employers');
      }
      
      let availableEmployers = result.data || [];
      console.log(`📊 Found ${availableEmployers.length} employers from database`);

      // Apply additional client-side filters
      if (filters.hasOpenings) {
        // ✅ FIXED: Use job_types_available instead of current_openings for new schema
        availableEmployers = availableEmployers.filter(employer => 
          employer.job_types_available && 
          Array.isArray(employer.job_types_available) && 
          employer.job_types_available.length > 0
        );
      }

      // ✅ CRITICAL FIX: Exclude current user properly using registrant profile ID comparison
      if (profile?.id) {
        const beforeFilter = availableEmployers.length;
        availableEmployers = availableEmployers.filter(employer => {
          const isCurrentUser = employer.user_id === profile.id; // Both are registrant_profiles.id
          if (isCurrentUser) {
            console.log(`🚫 Excluding current user's employer profile: ${employer.company_name}`);
          }
          return !isCurrentUser;
        });
        
        if (beforeFilter !== availableEmployers.length) {
          console.log(`🔄 Filtered out current user: ${beforeFilter} -> ${availableEmployers.length} employers`);
        }
      }

      // Enhanced sorting - actively hiring first, then by recent updates
      availableEmployers.sort((a, b) => {
        // First priority: actively hiring
        if (a.is_actively_hiring && !b.is_actively_hiring) return -1;
        if (!a.is_actively_hiring && b.is_actively_hiring) return 1;
        
        // Second priority: has job types available
        const aHasJobTypes = a.job_types_available?.length > 0;
        const bHasJobTypes = b.job_types_available?.length > 0;
        if (aHasJobTypes && !bHasJobTypes) return -1;
        if (!aHasJobTypes && bHasJobTypes) return 1;
        
        // Third priority: favorites first
        const aIsFavorite = favorites.has(a.user_id);
        const bIsFavorite = favorites.has(b.user_id);
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        
        // Fourth priority: most recently created/updated
        const aDate = new Date(a.updated_at || a.created_at || 0);
        const bDate = new Date(b.updated_at || b.created_at || 0);
        return bDate - aDate;
      });

      console.log(`✅ Filtered and sorted ${availableEmployers.length} employers`);
      console.log('📋 Sample employers:', availableEmployers.slice(0, 3).map(emp => ({
        id: emp.id,
        company_name: emp.company_name,
        user_id: emp.user_id,
        is_actively_hiring: emp.is_actively_hiring
      })));
      
      setEmployers(availableEmployers);
      
    } catch (err) {
      console.error('💥 Error loading employers:', err);
      setError(err.message || 'Failed to load employers');
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, profile?.id, favorites]);

  /**
   * ✅ FIXED: Smart location search using correct profile ID
   */
  const findNearbyEmployers = useCallback(async () => {
    try {
      // ✅ FIXED: Use profile.id (registrant_profiles.id) for applicant profile lookup
      if (profile?.id) {
        const { data: applicantProfile } = await db.supabase
          .from('applicant_matching_profiles')
          .select('preferred_city, preferred_state')
          .eq('user_id', profile.id)
          .single();
          
        if (applicantProfile?.preferred_city || applicantProfile?.preferred_state) {
          // Combine city and state if both exist, otherwise use what's available
          const location = applicantProfile.preferred_city && applicantProfile.preferred_state 
            ? `${applicantProfile.preferred_city}, ${applicantProfile.preferred_state}`
            : applicantProfile.preferred_city || applicantProfile.preferred_state;
            
          setFilters(prev => ({
            ...prev,
            location: location,
            industry: '', // Clear other filters for broader search
            businessType: '',
            recoveryFeatures: []
          }));
          return;
        }
      }
    } catch (err) {
      console.error('Could not load user location preferences:', err);
    }

    // Use profile location as fallback
    const userLocation = profile?.city && profile?.state 
      ? `${profile.city}, ${profile.state}`
      : profile?.state || '';
    
    if (userLocation) {
      setFilters(prev => ({ 
        ...prev, 
        location: userLocation,
        industry: '', // Clear other filters for broader search
        businessType: '',
        recoveryFeatures: []
      }));
    } else {
      setError('Please set your location in filters to find nearby employers.');
    }
  }, [profile?.id, profile]);

  /**
   * ✅ FIXED: Toggle favorite using correct profile ID
   */
  const toggleFavorite = useCallback(async (employerId) => {
    if (!user?.id || !profile?.id) return;

    try {
      // ✅ FIXED: Check for service availability
      if (!db.employerProfiles?.favorites) {
        setError('Favorites feature is not available at this time.');
        return;
      }

      const isFavorited = favorites.has(employerId);

      if (isFavorited) {
        // ✅ FIXED: Use registrant profile ID for favorites
        const result = await db.employerProfiles.favorites.remove(profile.id, employerId);
        
        if (result.error) {
          throw new Error(result.error.message || 'Failed to remove favorite');
        }
        
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(employerId);
          return newFavorites;
        });
        
        console.log('⭐ Removed employer from favorites:', employerId);
      } else {
        // ✅ FIXED: Use registrant profile ID for favorites
        const result = await db.employerProfiles.favorites.add(profile.id, employerId);
        
        if (result.error) {
          throw new Error(result.error.message || 'Failed to add favorite');
        }
        
        setFavorites(prev => new Set([...prev, employerId]));
        console.log('⭐ Added employer to favorites:', employerId);
      }
    } catch (err) {
      console.error('💥 Error toggling favorite:', err);
      setError('Failed to update favorites. Please try again.');
    }
  }, [user?.id, profile?.id, favorites]);

  /**
   * ✅ FIXED: Create connection with employer using correct applicant profile ID
   */
  const connectWithEmployer = useCallback(async (employer) => {
    if (!user?.id || !profile?.id) return false;

    try {
      console.log('💼 Connecting with employer:', employer.company_name);
      
      // ✅ CRITICAL FIX: Get the applicant profile ID first
      let applicantProfileId = null;
      try {
        const { data: applicantProfile } = await db.supabase
          .from('applicant_matching_profiles')
          .select('id, user_id')
          .eq('user_id', profile.id) // profile.id is registrant_profiles.id
          .single();
        
        if (applicantProfile) {
          applicantProfileId = applicantProfile.id;
          console.log('✅ Found applicant profile ID for connection:', applicantProfileId);
        } else {
          throw new Error('No applicant profile found. Please complete your applicant profile first.');
        }
      } catch (err) {
        console.error('❌ Could not load applicant profile:', err);
        setError('Please complete your applicant profile before connecting with employers.');
        return false;
      }
      
      // Check if already connected (only if service is available)
      if (connections.has(employer.user_id)) {
        setError(`You already have an active connection with ${employer.company_name}.`);
        return false;
      }

      // Check if employer is actively hiring
      if (!employer.is_actively_hiring) {
        const confirmed = window.confirm(
          `${employer.company_name} is not currently marked as actively hiring. Connect anyway?`
        );
        if (!confirmed) return false;
      }
      
      // ✅ FIXED: Check if service exists
      if (!db.matchRequests || typeof db.matchRequests.create !== 'function') {
        setError('Connection feature is not available at this time. Please contact the employer directly.');
        return false;
      }
      
      // ✅ FIXED: Use correct role-specific IDs for employment connection
      const connectionData = {
        requester_type: 'applicant',
        requester_id: applicantProfileId,        // applicant_matching_profiles.id
        recipient_type: 'employer',
        recipient_id: employer.user_id,          // employer_profiles.user_id (registrant_profiles.id)
        request_type: 'employment',
        message: `I'm interested in potential opportunities at ${employer.company_name}. I'd appreciate the chance to connect and learn more about how my skills and recovery journey could contribute to your team.`,
        status: 'pending'
      };
      
      console.log('📤 Creating employer connection with role-specific IDs:', connectionData);
      
      const result = await db.matchRequests.create(connectionData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to create connection');
      }
      
      if (!result.data) {
        throw new Error('No response received from connection request');
      }
      
      console.log('✅ Employer connection created successfully:', result.data);
      
      // Update local connections state
      setConnections(prev => new Set([...prev, employer.user_id]));
      
      return true;
      
    } catch (err) {
      console.error('💥 Error connecting with employer:', err);
      setError(`Failed to connect with employer: ${err.message}`);
      return false;
    }
  }, [user?.id, profile?.id, connections]);

  /**
   * ✅ FIXED: Get connection status using correct ID comparison
   */
  const getConnectionStatus = useCallback((employer) => {
    const isConnected = connections.has(employer.user_id); // employer.user_id is registrant_profiles.id
    const isFavorited = favorites.has(employer.user_id);
    const isHiring = employer.is_actively_hiring;
    
    if (isConnected) {
      return { 
        text: 'Connected', 
        disabled: true, 
        className: 'btn btn-success',
        type: 'connected'
      };
    } else if (!isHiring) {
      return { 
        text: 'Send Inquiry', 
        disabled: false, 
        className: 'btn btn-outline',
        type: 'connect-not-hiring'
      };
    } else {
      return { 
        text: 'Connect Now', 
        disabled: false, 
        className: 'btn btn-primary',
        type: 'connect'
      };
    }
  }, [connections, favorites]);

  // Load initial data
  useEffect(() => {
    if (user?.id && profile?.id) {
      loadConnections();
      loadFavorites();
    }
  }, [user?.id, profile?.id, loadConnections, loadFavorites]);

  // Trigger debounced search when filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadEmployers();
    }, 300);
    
    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeout);
    };
  }, [loadEmployers]);

  // ✅ FIXED: Handle remaining methods with correct ID handling
  const updateFilter = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateArrayFilter = useCallback((field, value, isChecked) => {
    setFilters(prev => ({
      ...prev,
      [field]: isChecked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      industry: '',
      location: '',
      state: '',
      businessType: '',
      recoveryFeatures: [],
      jobTypes: [],
      remoteWork: '',
      isActivelyHiring: true,
      hasOpenings: false
    });
  }, []);

  return {
    // Data
    employers,
    favorites,
    connections,
    filters,
    
    // Loading states
    loading,
    favoritesLoading,
    error,
    
    // Actions
    updateFilter,
    updateArrayFilter,
    clearFilters,
    findNearbyEmployers,
    toggleFavorite,
    connectWithEmployer,
    loadEmployers,
    
    // Helpers
    getConnectionStatus,
    
    // State setters for external error handling
    setError
  };
};

export default useEmployerSearch;