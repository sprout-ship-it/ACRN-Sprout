// src/contexts/UserProgressContext.js - UPDATED: Use matchingProfiles service
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';  
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

  // ✅ UPDATED: Check if basic profile is complete using matchingProfiles service
  const checkBasicProfile = async () => {
    if (!user) return false;

    try {
      console.log('🔍 Checking basic profile completion...');
      
      // ✅ FIXED: Use matchingProfiles service instead of applicantForms
      const result = await db.matchingProfiles.getByUserId(user.id);
      
      if (!result.success) {
        if (result.code === 'NOT_FOUND') {
          console.log('📋 No matching profile found - basic profile incomplete');
          return false;
        }
        console.error('Error checking basic profile:', result.error);
        return false;
      }

      const data = result.data;

      // ✅ UPDATED: Check required fields using correct field names from new schema
      const hasRequiredFields = !!(
        data?.date_of_birth && 
        data?.primary_phone &&
        data?.primary_city &&
        data?.primary_state
      );

      console.log('📋 Basic profile check:', {
        hasDateOfBirth: !!data?.date_of_birth,
        hasPrimaryPhone: !!data?.primary_phone,
        hasPrimaryCity: !!data?.primary_city,
        hasPrimaryState: !!data?.primary_state,
        isComplete: hasRequiredFields
      });

      return hasRequiredFields;

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

      // ✅ UPDATED: Check completion using new schema fields and computed values
      const isComplete = !!(
        data?.profile_completed && 
        data?.about_me && 
        data?.looking_for &&
        data?.recovery_stage &&
        data?.budget_max
      );

      console.log('📋 Matching profile check:', {
        profileCompleted: !!data?.profile_completed,
        hasAboutMe: !!data?.about_me,
        hasLookingFor: !!data?.looking_for,
        hasRecoveryStage: !!data?.recovery_stage,
        hasBudgetMax: !!data?.budget_max,
        completionPercentage: data?.completion_percentage || 0,
        isComplete
      });

      return isComplete;

    } catch (error) {
      console.error('Error in checkMatchingProfile:', error);
      return false;
    }
  };

  // Check match status (no changes needed - this doesn't use applicantForms)
  const checkMatches = async () => {
    if (!user) return { hasMatches: false, activeMatching: false };

    try {
      console.log('🔍 Checking match status...');
      
      const { data: requests, error } = await db.matchRequests.getByUserId(user.id);
      
      if (error) {
        console.error('Error checking matches:', error);
        return { hasMatches: false, activeMatching: false };
      }

      const hasMatches = requests?.some(request => request.status === 'matched') || false;
      const activeMatching = requests?.some(request => 
        ['pending', 'approved'].includes(request.status)
      ) || false;

      console.log('🔍 Match status check:', {
        totalRequests: requests?.length || 0,
        hasMatches,
        activeMatching
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
      !hasRole('applicant') || progress.activeMatching,
      !hasRole('applicant') || progress.hasMatches
    ];

    const completedSteps = steps.filter(Boolean).length;
    return Math.round((completedSteps / steps.length) * 100);
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

  const value = {
    // Progress state
    progress,
    
    // Computed values
    currentStep: getCurrentStep(),
    isOnboardingComplete: isOnboardingComplete(),
    canAccessMainApp: canAccessMainApp(),
    progressPercentage: getProgressPercentage(),
    
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