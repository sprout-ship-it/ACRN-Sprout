// src/hooks/useAuth.js
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
    isApplicant,
    isLandlord,
    isPeerSupport 
  } = useAuth();
  
  return {
    user,
    profile,
    loading,
    isAuthenticated,
    isApplicant,
    isLandlord,
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
    updateProfile,
    clearError
  } = useAuth();
  
  return {
    signIn,
    signUp,
    signOut,
    updateProfile,
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
    getPrimaryRole,
    profile
  } = useAuth();
  
  const userRoles = profile?.roles || [];
  
  return {
    roles: userRoles,
    hasRole,
    hasAnyRole,
    getPrimaryRole,
    isApplicant: hasRole('applicant'),
    isLandlord: hasRole('landlord'),
    isPeerSupport: hasRole('peer'),
    isMultiRole: userRoles.length > 1
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
  const { isAuthenticated, loading } = useAuth();
  
  return {
    isAuthenticated,
    isLoading: loading,
    canAccess: isAuthenticated && !loading,
    shouldRedirect: !isAuthenticated && !loading
  };
};

/**
 * Hook for user profile management
 */
export const useProfile = () => {
  const {
    profile,
    updateProfile,
    loadUserProfile,
    user
  } = useAuth();
  
  const updateUserProfile = async (updates) => {
    try {
      const result = await updateProfile(updates);
      if (result.success) {
        // Optionally reload profile to ensure consistency
        await loadUserProfile(user.id);
      }
      return result;
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: error.message };
    }
  };
  
  return {
    profile,
    updateProfile: updateUserProfile,
    refreshProfile: () => loadUserProfile(user?.id),
    isProfileLoaded: !!profile,
    profileName: profile ? `${profile.first_name} ${profile.last_name}` : '',
    profileInitials: profile ? 
      `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : ''
  };
};

export default useAuth;