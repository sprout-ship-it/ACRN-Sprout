// src/context/UserProgressContext.js - PHASE 3 CORRECTED VERSION
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth'; // ✅ FIXED: Correct import path
import { db } from '../utils/supabase';

const UserProgressContext = createContext({});

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
};

export const UserProgressProvider = ({ children }) => {
  const { user, profile, isAuthenticated, hasRole } = useAuth();
  
  const [progress, setProgress] = useState({
    basicProfile: false,
    matchingProfile: false,
    hasMatches: false,
    activeMatching: false,
    loading: true,
    lastUpdated: null
  });

  // Check user progress when user changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setProgress({
        basicProfile: false,
        matchingProfile: false,
        hasMatches: false,
        activeMatching: false,
        loading: false,
        lastUpdated: null
      });
      return;
    }

    checkUserProgress();
  }, [user, isAuthenticated]);

  // Check all aspects of user progress
  const checkUserProgress = async () => {
    try {
      setProgress(prev => ({ ...prev, loading: true }));

      const progressChecks = await Promise.allSettled([
        checkBasicProfile(),
        checkMatchingProfile(),
        checkMatches()
      ]);

      const [basicResult, matchingResult, matchesResult] = progressChecks;

      const newProgress = {
        basicProfile: basicResult.status === 'fulfilled' ? basicResult.value : false,
        matchingProfile: matchingResult.status === 'fulfilled' ? matchingResult.value : false,
        hasMatches: matchesResult.status === 'fulfilled' ? matchesResult.value.hasMatches : false,
        activeMatching: matchesResult.status === 'fulfilled' ? matchesResult.value.activeMatching : false,
        loading: false,
        lastUpdated: new Date().toISOString()
      };

      setProgress(newProgress);
      
    } catch (error) {
      console.error('Error checking user progress:', error);
      setProgress(prev => ({ 
        ...prev, 
        loading: false,
        lastUpdated: new Date().toISOString()
      }));
    }
  };

  // ✅ UPDATED: Check basic profile completion - simplified to use registrant_profiles
  const checkBasicProfile = async () => {
    if (!user || !profile) return false;

    try {
      console.log('🔍 Checking basic profile completion...');
      
      // ✅ FIXED: Check basic profile using registrant_profiles data (from AuthContext)
      // Basic profile = registrant_profiles with complete basic info
      const hasBasicInfo = !!(
        profile?.first_name &&
        profile?.last_name &&
        profile?.email &&
        profile?.roles?.length > 0
      );

      console.log('📋 Basic profile check:', {
        hasFirstName: !!profile?.first_name,
        hasLastName: !!profile?.last_name,
        hasEmail: !!profile?.email,
        hasRoles: !!(profile?.roles?.length > 0),
        isComplete: hasBasicInfo
      });

      return hasBasicInfo;

    } catch (error) {
      console.error('Error in checkBasicProfile:', error);
      return false;
    }
  };

  // ✅ UPDATED: Check if matching profile is complete using matchingProfiles service
  const checkMatchingProfile = async () => {
    if (!user || !hasRole('applicant')) return true; // Non-applicants don't need matching profiles

    try {
      console.log('🔍 Checking matching profile completion...');
      
      // ✅ FIXED: Use matchingProfiles service consistently
      const result = await db.matchingProfiles.getByUserId(user.id);
      
      if (!result.success) {
        if (result.code === 'NOT_FOUND') {
          console.log('📋 No matching profile found - matching profile incomplete');
          return false;
        }
        console.error('Error checking matching profile:', result.error);
        return false;
      }

      const data = result.data;

      // ✅ UPDATED: Check completion using correct schema fields and computed values
      const isComplete = !!(
        data?.profile_completed && 
        data?.about_me && 
        data?.looking_for &&
        data?.recovery_stage &&
        data?.budget_max &&
        data?.primary_city &&
        data?.primary_state
      );

      console.log('📋 Matching profile check:', {
        profileCompleted: !!data?.profile_completed,
        hasAboutMe: !!data?.about_me,
        hasLookingFor: !!data?.looking_for,
        hasRecoveryStage: !!data?.recovery_stage,
        hasBudgetMax: !!data?.budget_max,
        hasPrimaryCity: !!data?.primary_city,
        hasPrimaryState: !!data?.primary_state,
        completionPercentage: data?.completion_percentage || 0,
        isComplete
      });

      return isComplete;

    } catch (error) {
      console.error('Error in checkMatchingProfile:', error);
      return false;
    }
  };

  // ✅ UPDATED: Check match status using correct service methods
  const checkMatches = async () => {
    if (!user) return { hasMatches: false, activeMatching: false };

    try {
      console.log('🔍 Checking match status...');
      
      // ✅ FIXED: Use correct service method that returns proper format
      const result = await db.matchRequests.getByUserId(user.id);
      
      if (!result.success) {
        console.error('Error checking matches:', result.error);
        return { hasMatches: false, activeMatching: false };
      }

      const requests = result.data || [];

      const hasMatches = requests.some(request => request.status === 'approved') || false;
      const activeMatching = requests.some(request => 
        ['pending', 'approved'].includes(request.status)
      ) || false;

      console.log('🔍 Match status check:', {
        totalRequests: requests.length,
        hasMatches,
        activeMatching,
        requestStatuses: requests.map(r => r.status)
      });

      return { hasMatches, activeMatching };
    } catch (error) {
      console.error('Error in checkMatches:', error);
      return { hasMatches: false, activeMatching: false };
    }
  };

  // Get current step in onboarding flow
  const getCurrentStep = () => {
    if (!progress.basicProfile) return 1;
    if (!progress.matchingProfile && hasRole('applicant')) return 2;
    if (!progress.activeMatching && hasRole('applicant')) return 3;
    return 4;
  };

  // Check if onboarding is complete
  const isOnboardingComplete = () => {
    if (!progress.basicProfile) return false;
    if (hasRole('applicant') && !progress.matchingProfile) return false;
    return true;
  };

  // Check if user can access main app
  const canAccessMainApp = () => {
    return isAuthenticated && isOnboardingComplete();
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    if (!isAuthenticated) return 0;

    const steps = [
      progress.basicProfile,
      !hasRole('applicant') || progress.matchingProfile,
      !hasRole('applicant') || progress.activeMatching
    ];

    const completedSteps = steps.filter(Boolean).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  // ✅ NEW: Get role-specific progress requirements
  const getRoleRequirements = () => {
    const roles = profile?.roles || [];
    const requirements = {
      basicProfile: true, // All users need basic profile
      matchingProfile: roles.includes('applicant'),
      employerProfile: roles.includes('employer'),
      landlordProfile: roles.includes('landlord'),
      peerSupportProfile: roles.includes('peer-support')
    };

    return requirements;
  };

  // ✅ NEW: Check completion for specific user roles
  const getCompletionByRole = () => {
    const requirements = getRoleRequirements();
    const completion = {
      total: 0,
      completed: 0,
      missing: []
    };

    if (requirements.basicProfile) {
      completion.total++;
      if (progress.basicProfile) {
        completion.completed++;
      } else {
        completion.missing.push('basicProfile');
      }
    }

    if (requirements.matchingProfile) {
      completion.total++;
      if (progress.matchingProfile) {
        completion.completed++;
      } else {
        completion.missing.push('matchingProfile');
      }
    }

    // TODO: Add checks for other role-specific profiles when implemented
    // if (requirements.employerProfile) { ... }
    // if (requirements.landlordProfile) { ... }
    // if (requirements.peerSupportProfile) { ... }

    completion.percentage = completion.total > 0 ? 
      Math.round((completion.completed / completion.total) * 100) : 100;

    return completion;
  };

  // Manual progress updates
  const updateProgress = async (updates) => {
    setProgress(prev => ({ 
      ...prev, 
      ...updates,
      lastUpdated: new Date().toISOString()
    }));
  };

  // Refresh progress data
  const refreshProgress = async () => {
    await checkUserProgress();
  };

  // Mark basic profile as complete
  const markBasicProfileComplete = () => {
    updateProgress({ basicProfile: true });
  };

  // Mark matching profile as complete
  const markMatchingProfileComplete = () => {
    updateProgress({ matchingProfile: true });
  };

  // Mark as actively matching
  const markActiveMatching = () => {
    updateProgress({ activeMatching: true });
  };

  // Mark as having matches
  const markHasMatches = () => {
    updateProgress({ hasMatches: true });
  };

  // ✅ NEW: Get next step guidance
  const getNextStepGuidance = () => {
    if (!progress.basicProfile) {
      return {
        step: 'basicProfile',
        title: 'Complete Your Basic Profile',
        description: 'Add your basic information to get started',
        path: '/profile/basic'
      };
    }

    if (hasRole('applicant') && !progress.matchingProfile) {
      return {
        step: 'matchingProfile',
        title: 'Complete Your Matching Profile',
        description: 'Tell us about your housing needs and preferences',
        path: '/matching/profile'
      };
    }

    if (hasRole('applicant') && !progress.activeMatching) {
      return {
        step: 'startMatching',
        title: 'Start Finding Matches',
        description: 'Begin connecting with potential roommates and housing',
        path: '/matching/discover'
      };
    }

    return {
      step: 'complete',
      title: 'Profile Complete',
      description: 'Your profile is set up and ready!',
      path: '/dashboard'
    };
  };

  const value = {
    // Progress state
    progress,
    
    // Computed values
    currentStep: getCurrentStep(),
    isOnboardingComplete: isOnboardingComplete(),
    canAccessMainApp: canAccessMainApp(),
    progressPercentage: getProgressPercentage(),
    roleRequirements: getRoleRequirements(),
    completionByRole: getCompletionByRole(),
    nextStepGuidance: getNextStepGuidance(),
    
    // Methods
    refreshProgress,
    updateProgress,
    markBasicProfileComplete,
    markMatchingProfileComplete,
    markActiveMatching,
    markHasMatches,
    
    // Individual checkers (for manual use)
    checkBasicProfile,
    checkMatchingProfile,
    checkMatches
  };

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
};