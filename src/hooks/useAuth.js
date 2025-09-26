// src/hooks/useAuth.js - PHASE 3 CORRECTED VERSION
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook for accessing authentication state and methods
 * This provides a clean interface to the AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Hook for checking specific authentication states
 */
export const useAuthState = () => {
  const { 
    user, 
    profile, 
    loading, 
    isAuthenticated,
    isNewUser,
    hasRole
  } = useAuth();
  
  // Derive role states from hasRole helper
  const isApplicant = hasRole('applicant');
  const isLandlord = hasRole('landlord');
  const isEmployer = hasRole('employer');
  const isPeerSupport = hasRole('peer-support'); // Correct role name from schema
  
  return {
    user,
    profile,
    loading,
    isAuthenticated,
    isNewUser,
    isApplicant,
    isLandlord,
    isEmployer,
    isPeerSupport,
    isLoading: loading
  };
};

/**
 * Hook for authentication actions
 */
export const useAuthActions = () => {
  const {
    signIn,
    signUp,
    signOut,
    refreshProfile,
    clearError
  } = useAuth();
  
  return {
    signIn,
    signUp,
    signOut,
    refreshProfile, // Use refreshProfile instead of updateProfile
    clearError
  };
};

/**
 * Hook for role-based access control
 */
export const useRoles = () => {
  const {
    hasRole,
    hasAnyRole,
    profile
  } = useAuth();
  
  const userRoles = profile?.roles || [];
  
  // Helper to get primary role (first role in array)
  const getPrimaryRole = () => {
    return userRoles.length > 0 ? userRoles[0] : null;
  };
  
  return {
    roles: userRoles,
    hasRole,
    hasAnyRole,
    getPrimaryRole,
    isApplicant: hasRole('applicant'),
    isLandlord: hasRole('landlord'),
    isEmployer: hasRole('employer'),
    isPeerSupport: hasRole('peer-support'), // Correct role name
    isMultiRole: userRoles.length > 1,
    primaryRole: getPrimaryRole()
  };
};

/**
 * Hook for authentication error handling
 */
export const useAuthError = () => {
  const { error, clearError } = useAuth();
  
  const handleError = (callback) => {
    return async (...args) => {
      clearError();
      try {
        return await callback(...args);
      } catch (err) {
        console.error('Auth operation failed:', err);
        throw err;
      }
    };
  };
  
  return {
    error,
    clearError,
    handleError
  };
};

/**
 * Hook for protected route logic
 */
export const useProtectedRoute = () => {
  const { isAuthenticated, loading, isNewUser } = useAuth();
  
  return {
    isAuthenticated,
    isNewUser,
    isLoading: loading,
    canAccess: isAuthenticated && !loading,
    shouldRedirect: !isAuthenticated && !loading,
    needsProfileSetup: isNewUser && !loading
  };
};

/**
 * Hook for user profile management
 */
export const useProfile = () => {
  const {
    profile,
    refreshProfile,
    user,
    loading
  } = useAuth();
  
  // Helper to get display name
  const getDisplayName = () => {
    if (!profile) return '';
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName} ${lastName}`.trim() || profile.email || 'User';
  };
  
  // Helper to get initials
  const getInitials = () => {
    if (!profile) return '';
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}` || profile.email?.charAt(0).toUpperCase() || 'U';
  };
  
  return {
    profile,
    refreshProfile,
    isProfileLoaded: !!profile,
    isProfileLoading: loading,
    displayName: getDisplayName(),
    initials: getInitials(),
    email: profile?.email || user?.email || '',
    roles: profile?.roles || [],
    isActive: profile?.is_active || false
  };
};

/**
 * Hook for role-specific navigation and access
 */
export const useRoleNavigation = () => {
  const { hasRole, profile } = useAuth();
  const roles = profile?.roles || [];
  
  // Get available navigation items based on roles
  const getAvailableRoles = () => {
    return roles.map(role => ({
      role,
      label: getRoleLabel(role),
      path: getRolePath(role)
    }));
  };
  
  const getRoleLabel = (role) => {
    const labels = {
      'applicant': 'Housing Seeker',
      'landlord': 'Property Owner',
      'employer': 'Employer',
      'peer-support': 'Peer Support'
    };
    return labels[role] || role;
  };
  
  const getRolePath = (role) => {
    const paths = {
      'applicant': '/matching',
      'landlord': '/properties',
      'employer': '/employer',
      'peer-support': '/peer-support'
    };
    return paths[role] || '/dashboard';
  };
  
  return {
    availableRoles: getAvailableRoles(),
    hasRole,
    canAccessRole: (role) => hasRole(role),
    getRoleLabel,
    getRolePath,
    isMultiRole: roles.length > 1
  };
};

/**
 * Hook for authentication status with detailed states
 */
export const useAuthStatus = () => {
  const { 
    user, 
    profile, 
    loading, 
    isAuthenticated, 
    isNewUser, 
    error 
  } = useAuth();
  
  // Determine the current auth status
  const getAuthStatus = () => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (!user) return 'unauthenticated';
    if (user && !profile) return 'profile-missing';
    if (user && profile) return 'authenticated';
    return 'unknown';
  };
  
  const status = getAuthStatus();
  
  return {
    status,
    isLoading: loading,
    isAuthenticated,
    isNewUser,
    hasError: !!error,
    error,
    user,
    profile,
    // Helper booleans for common status checks
    isReady: status === 'authenticated',
    needsAuth: status === 'unauthenticated',
    needsProfile: status === 'profile-missing',
    hasIssue: status === 'error'
  };
};

// Default export
export default useAuth;