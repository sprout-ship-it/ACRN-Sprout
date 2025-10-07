// src/components/features/employer/hooks/useEmployerSearch.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { db } from '../../../../utils/supabase';

const useEmployerSearch = () => {
  const { user, profile } = useAuth();
  
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
   * Load existing connections to track connection status
   */
const loadConnections = useCallback(async () => {
  if (!user?.id || !profile?.id) return;

  try {
    console.log('📊 Loading existing employer connections...');
    
    // ✅ FIXED: Check if service exists and handle gracefully
    if (!db.matchRequests || typeof db.matchRequests.getByUserId !== 'function') {
      console.warn('⚠️ Match requests service not available, skipping connection status');
      setConnections(new Set());
      return;
    }
    
    const result = await db.matchRequests.getByUserId('applicant', profile.id);
    
    if (result.success !== false && result.data) {
      const existingConnections = new Set(
        result.data
          .filter(req => 
            req.requester_id === profile.id && 
            req.request_type === 'employment' &&
            ['pending', 'matched'].includes(req.status)
          )
          .map(req => req.target_id)
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
   * Load user's favorite employers
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
   * Debounced employer search function
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

      // Exclude current user if they're also an employer
      if (user) {
        availableEmployers = availableEmployers.filter(employer => 
          employer.user_id !== user.id
        );
      }

      // Enhanced sorting - actively hiring first, then by recent updates
      availableEmployers.sort((a, b) => {
        // First priority: actively hiring
        if (a.is_actively_hiring && !b.is_actively_hiring) return -1;
        if (!a.is_actively_hiring && b.is_actively_hiring) return 1;
        
        // Second priority: has current openings
        const aHasOpenings = a.current_openings?.length > 0;
        const bHasOpenings = b.current_openings?.length > 0;
        if (aHasOpenings && !bHasOpenings) return -1;
        if (!aHasOpenings && bHasOpenings) return 1;
        
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
      setEmployers(availableEmployers);
      
    } catch (err) {
      console.error('💥 Error loading employers:', err);
      setError(err.message || 'Failed to load employers');
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, user, favorites]);

  /**
   * Debounced search with 300ms delay
   */
  const debouncedSearch = useCallback(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      loadEmployers();
    }, 300);

    setSearchTimeout(timeout);
  }, [loadEmployers, searchTimeout]);

  /**
   * Handle filter changes
   */
  const updateFilter = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Handle array filter changes (checkboxes)
   */
  const updateArrayFilter = useCallback((field, value, isChecked) => {
    setFilters(prev => ({
      ...prev,
      [field]: isChecked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  }, []);

  /**
   * Clear all filters
   */
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

  /**
   * Smart location search using user's preferences
   */
const findNearbyEmployers = useCallback(async () => {
  try {
    // ✅ FIXED: Use profile.id instead of user.id
    const { data: applicantProfile } = await db.matchingProfiles.getByUserId(profile.id);
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
   * Toggle favorite status for an employer
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
      const result = await favoritesService.remove(profile.id, employerId);
      
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
      const result = await favoritesService.add(profile.id, employerId);
      
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
   * Create connection with employer
   */
const connectWithEmployer = useCallback(async (employer) => {
  if (!user?.id || !profile?.id) return false;

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

  try {
    console.log('💼 Connecting with employer:', employer.company_name);
    
    // ✅ FIXED: Check if service exists
    if (!db.matchRequests || typeof db.matchRequests.create !== 'function') {
      setError('Connection feature is not available at this time. Please contact the employer directly.');
      return false;
    }
    
    const connectionData = {
      requester_id: profile.id,
      target_id: employer.user_id,
      request_type: 'employment',
      message: `I'm interested in potential opportunities at ${employer.company_name}. I'd appreciate the chance to connect and learn more about how my skills and recovery journey could contribute to your team.`,
      status: 'pending'
    };
    
    console.log('📤 Creating employer connection:', connectionData);
    
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
   * Get connection status for an employer
   */
const getConnectionStatus = useCallback((employer) => {
  const isConnected = connections.has(employer.user_id);
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
    if (user?.id) {
      loadConnections();
      loadFavorites();
    }
  }, [user?.id, loadConnections, loadFavorites]);

  // Trigger debounced search when filters change
  useEffect(() => {
    debouncedSearch();
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [debouncedSearch]);

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
    loadEmployers: debouncedSearch,
    
    // Helpers
    getConnectionStatus,
    
    // State setters for external error handling
    setError
  };
};

export default useEmployerSearch;