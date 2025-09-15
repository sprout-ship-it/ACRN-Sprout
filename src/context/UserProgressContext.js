// src/contexts/UserProgressContext.js
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

  // ✅ FIXED: Check if basic profile is complete using applicant_forms table
  const checkBasicProfile = async () => {
    if (!user) return false;

    try {
      const { data, error } = await db.applicantForms.getByUserId(user.id);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking basic profile:', error);
        return false;
      }

      // Consider basic profile complete if it exists and has required fields
      return !!(data?.date_of_birth && data?.phone);
    } catch (error) {
      console.error('Error in checkBasicProfile:', error);
      return false;
    }
  };

  // Check if matching profile is complete (for applicants only)
  const checkMatchingProfile = async () => {
    if (!user || !hasRole('applicant')) return true; // Non-applicants don't need matching profiles

    try {
      const { data, error } = await db.matchingProfiles.getByUserId(user.id);
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking matching profile:', error);
        return false;
      }

      // Consider matching profile complete if it exists and is marked as completed
      return !!(data?.profile_completed && data?.about_me && data?.looking_for);
    } catch (error) {
      console.error('Error in checkMatchingProfile:', error);
      return false;
    }
  };

  // Check match status
  const checkMatches = async () => {
    if (!user) return { hasMatches: false, activeMatching: false };

    try {
      const { data: requests, error } = await db.matchRequests.getByUserId(user.id);
      
      if (error) {
        console.error('Error checking matches:', error);
        return { hasMatches: false, activeMatching: false };
      }

      const hasMatches = requests?.some(request => request.status === 'matched') || false;
      const activeMatching = requests?.some(request => 
        ['pending', 'approved'].includes(request.status)
      ) || false;

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