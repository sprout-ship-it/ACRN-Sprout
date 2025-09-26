// src/hooks/useUserProgress.js - PHASE 3 CORRECTED VERSION
import { useContext } from 'react';
import { UserProgressContext } from '../context/UserProgressContext';

/**
 * Custom hook for accessing user progress state and methods
 * This provides a clean interface to the UserProgressContext
 */
export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  
  if (!context) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  
  return context;
};

/**
 * Hook for profile setup flow management
 * ✅ UPDATED: Aligned with actual UserProgressContext structure
 */
export const useProfileSetup = () => {
  const {
    progress,
    currentStep,
    isOnboardingComplete,
    progressPercentage,
    nextStepGuidance,
    roleRequirements,
    markBasicProfileComplete,
    markMatchingProfileComplete
  } = useUserProgress();
  
  const getStepInfo = (step) => {
    const steps = {
      1: {
        title: 'Basic Profile',
        description: 'Complete your basic account information',
        completed: progress.basicProfile,
        required: true
      },
      2: {
        title: 'Matching Profile', 
        description: 'Set up your detailed housing preferences',
        completed: progress.matchingProfile,
        required: roleRequirements?.matchingProfile || false
      },
      3: {
        title: 'Start Matching',
        description: 'Begin connecting with potential roommates',
        completed: progress.activeMatching,
        required: false
      },
      4: {
        title: 'Find Housing',
        description: 'Search for housing with your matches',
        completed: progress.hasMatches,
        required: false
      }
    };
    
    return steps[step] || null;
  };
  
  const getNextStep = () => {
    if (!progress.basicProfile) return 1;
    if (roleRequirements?.matchingProfile && !progress.matchingProfile) return 2;
    if (!progress.activeMatching) return 3;
    if (!progress.hasMatches) return 4;
    return null; // All steps complete
  };
  
  const getStepsRemaining = () => {
    const requiredSteps = [1]; // Basic profile always required
    if (roleRequirements?.matchingProfile) {
      requiredSteps.push(2); // Matching profile required for applicants
    }
    
    const completedRequired = requiredSteps.filter(step => {
      const stepInfo = getStepInfo(step);
      return stepInfo?.completed;
    });
    
    return requiredSteps.length - completedRequired.length;
  };
  
  // ✅ NEW: Get completion status by user roles
  const getRoleCompletionStatus = () => {
    return {
      basicProfile: {
        required: true,
        completed: progress.basicProfile,
        title: 'Basic Profile'
      },
      matchingProfile: {
        required: roleRequirements?.matchingProfile || false,
        completed: progress.matchingProfile,
        title: 'Housing Profile'
      },
      employerProfile: {
        required: roleRequirements?.employerProfile || false,
        completed: false, // TODO: Add when implemented
        title: 'Employer Profile'
      },
      landlordProfile: {
        required: roleRequirements?.landlordProfile || false,
        completed: false, // TODO: Add when implemented  
        title: 'Landlord Profile'
      },
      peerSupportProfile: {
        required: roleRequirements?.peerSupportProfile || false,
        completed: false, // TODO: Add when implemented
        title: 'Peer Support Profile'
      }
    };
  };
  
  return {
    currentStep,
    nextStep: getNextStep(),
    isComplete: isOnboardingComplete,
    progressPercentage,
    stepsRemaining: getStepsRemaining(),
    nextStepGuidance,
    roleCompletionStatus: getRoleCompletionStatus(),
    getStepInfo,
    markBasicComplete: markBasicProfileComplete,
    markMatchingComplete: markMatchingProfileComplete,
    progress
  };
};

/**
 * Hook for matching progress tracking
 * ✅ UPDATED: Aligned with corrected progress logic
 */
export const useMatchingProgress = () => {
  const {
    progress,
    markActiveMatching,
    markHasMatches,
    refreshProgress,
    roleRequirements
  } = useUserProgress();
  
  // Only relevant for applicants
  const isApplicant = roleRequirements?.matchingProfile || false;
  
  const matchingStatus = {
    notApplicant: !isApplicant,
    profileIncomplete: isApplicant && (!progress.basicProfile || !progress.matchingProfile),
    readyToMatch: isApplicant && progress.basicProfile && progress.matchingProfile && !progress.activeMatching,
    activelyMatching: isApplicant && progress.activeMatching && !progress.hasMatches,
    hasMatches: isApplicant && progress.hasMatches
  };
  
  const getMatchingStage = () => {
    if (matchingStatus.notApplicant) return 'not-applicable';
    if (matchingStatus.hasMatches) return 'matched';
    if (matchingStatus.activelyMatching) return 'searching';
    if (matchingStatus.readyToMatch) return 'ready';
    if (matchingStatus.profileIncomplete) return 'setup';
    return 'not-started';
  };
  
  const getMatchingStageInfo = () => {
    const stage = getMatchingStage();
    const stageInfo = {
      'not-applicable': {
        title: 'Not Applicable',
        description: 'Matching is for housing seekers only',
        action: null,
        color: 'gray'
      },
      'not-started': {
        title: 'Get Started',
        description: 'Complete your profiles to begin matching',
        action: 'Complete Profiles',
        color: 'gray'
      },
      'setup': {
        title: 'Complete Setup',
        description: 'Finish your profiles to start finding roommates',
        action: 'Complete Profile',
        color: 'orange'
      },
      'ready': {
        title: 'Ready to Match',
        description: 'Start searching for compatible roommates',
        action: 'Find Matches',
        color: 'blue'
      },
      'searching': {
        title: 'Actively Matching',
        description: 'Continue connecting with potential roommates',
        action: 'View Requests',
        color: 'purple'
      },
      'matched': {
        title: 'Matched!',
        description: 'You have active matches - start housing search',
        action: 'Search Housing', 
        color: 'green'
      }
    };
    
    return stageInfo[stage];
  };
  
  return {
    isApplicant,
    status: matchingStatus,
    stage: getMatchingStage(),
    stageInfo: getMatchingStageInfo(),
    markActiveMatching,
    markHasMatches,
    refreshProgress,
    isReadyToMatch: matchingStatus.readyToMatch,
    hasActiveMatches: matchingStatus.hasMatches
  };
};

/**
 * Hook for progress notifications and guidance
 * ✅ UPDATED: Uses actual nextStepGuidance from context
 */
export const useProgressGuidance = () => {
  const { 
    progress, 
    currentStep, 
    isOnboardingComplete,
    nextStepGuidance,
    completionByRole,
    roleRequirements
  } = useUserProgress();
  
  const getNextAction = () => {
    // Use the guidance from context if available
    if (nextStepGuidance) {
      return {
        title: nextStepGuidance.title,
        description: nextStepGuidance.description,
        action: nextStepGuidance.step,
        path: nextStepGuidance.path,
        priority: 'high'
      };
    }
    
    // Fallback logic
    if (!progress.basicProfile) {
      return {
        title: 'Complete Your Basic Profile',
        description: 'Add your basic information to get started',
        action: 'complete-basic-profile',
        priority: 'high'
      };
    }
    
    if (roleRequirements?.matchingProfile && !progress.matchingProfile) {
      return {
        title: 'Complete Your Housing Profile',
        description: 'Set up your housing preferences and needs',
        action: 'complete-matching-profile',
        priority: 'high'
      };
    }
    
    return {
      title: 'Explore the App',
      description: 'Your required profiles are complete!',
      action: 'explore',
      priority: 'low'
    };
  };
  
  const getProgressMessage = () => {
    const completion = completionByRole || { percentage: 0, completed: 0, total: 1 };
    
    if (completion.percentage === 0) {
      return 'Welcome! Let\'s get you set up.';
    }
    
    if (completion.percentage < 50) {
      return `You're ${completion.percentage}% complete. Keep going!`;
    }
    
    if (completion.percentage < 100) {
      return `Almost there! You're ${completion.percentage}% complete.`;
    }
    
    return 'Your profile setup is complete!';
  };
  
  const getTips = () => {
    const tips = [];
    
    if (!progress.basicProfile) {
      tips.push('Complete your basic profile to access all features');
    }
    
    if (roleRequirements?.matchingProfile && !progress.matchingProfile) {
      tips.push('A detailed housing profile helps you find better matches');
      tips.push('Be specific about your preferences for better compatibility');
    }
    
    if (progress.matchingProfile && !progress.activeMatching) {
      tips.push('Send match requests to compatible roommates');
      tips.push('Review profiles carefully before connecting');
    }
    
    if (progress.activeMatching && !progress.hasMatches) {
      tips.push('Be patient - good matches take time to develop');
      tips.push('Consider broadening your criteria if needed');
    }
    
    return tips;
  };
  
  return {
    nextAction: getNextAction(),
    progressMessage: getProgressMessage(),
    tips: getTips(),
    isSetupComplete: isOnboardingComplete,
    currentStep,
    shouldShowGuidance: !isOnboardingComplete,
    completionByRole
  };
};

/**
 * Hook for progress analytics and insights
 * ✅ UPDATED: Uses actual completion data from context
 */
export const useProgressInsights = () => {
  const { progress, completionByRole } = useUserProgress();
  
  const getCompletionStats = () => {
    // Use the role-based completion if available
    if (completionByRole) {
      return {
        completed: completionByRole.completed,
        total: completionByRole.total,
        percentage: completionByRole.percentage,
        remaining: completionByRole.total - completionByRole.completed,
        missing: completionByRole.missing || []
      };
    }
    
    // Fallback to basic calculation
    const progressItems = [
      progress.basicProfile,
      progress.matchingProfile
    ];
    const total = progressItems.length;
    const completed = progressItems.filter(Boolean).length;
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
      remaining: total - completed,
      missing: []
    };
  };
  
  const getEstimatedTimeToComplete = () => {
    const stats = getCompletionStats();
    const averageTimePerStep = 10; // minutes
    
    return stats.remaining * averageTimePerStep;
  };
  
  const getProgressHealth = () => {
    const stats = getCompletionStats();
    
    if (stats.percentage === 100) return 'excellent';
    if (stats.percentage >= 75) return 'good';
    if (stats.percentage >= 50) return 'fair';
    return 'needs-attention';
  };
  
  const getProgressTrend = () => {
    // Simple trend based on completion percentage
    const stats = getCompletionStats();
    if (stats.percentage === 100) return 'complete';
    if (stats.percentage > 0) return 'improving';
    return 'just-started';
  };
  
  return {
    stats: getCompletionStats(),
    estimatedTime: getEstimatedTimeToComplete(),
    health: getProgressHealth(),
    trend: getProgressTrend(),
    lastUpdated: progress.lastUpdated
  };
};

/**
 * ✅ NEW: Hook for role-specific progress management
 */
export const useRoleProgress = () => {
  const { 
    roleRequirements,
    progress,
    completionByRole
  } = useUserProgress();
  
  const getRequiredProfiles = () => {
    const required = [];
    
    if (roleRequirements?.basicProfile) {
      required.push({
        type: 'basicProfile',
        title: 'Basic Profile',
        completed: progress.basicProfile,
        path: '/profile/basic'
      });
    }
    
    if (roleRequirements?.matchingProfile) {
      required.push({
        type: 'matchingProfile', 
        title: 'Housing Profile',
        completed: progress.matchingProfile,
        path: '/matching/profile'
      });
    }
    
    if (roleRequirements?.employerProfile) {
      required.push({
        type: 'employerProfile',
        title: 'Employer Profile',
        completed: false, // TODO: Implement when ready
        path: '/employer/profile'
      });
    }
    
    if (roleRequirements?.landlordProfile) {
      required.push({
        type: 'landlordProfile',
        title: 'Landlord Profile', 
        completed: false, // TODO: Implement when ready
        path: '/landlord/profile'
      });
    }
    
    if (roleRequirements?.peerSupportProfile) {
      required.push({
        type: 'peerSupportProfile',
        title: 'Peer Support Profile',
        completed: false, // TODO: Implement when ready
        path: '/peer-support/profile'
      });
    }
    
    return required;
  };
  
  const getIncompleteProfiles = () => {
    return getRequiredProfiles().filter(profile => !profile.completed);
  };
  
  const getNextRequiredProfile = () => {
    const incomplete = getIncompleteProfiles();
    return incomplete.length > 0 ? incomplete[0] : null;
  };
  
  return {
    requiredProfiles: getRequiredProfiles(),
    incompleteProfiles: getIncompleteProfiles(),
    nextRequiredProfile: getNextRequiredProfile(),
    allRequiredComplete: getIncompleteProfiles().length === 0,
    roleRequirements,
    completionByRole
  };
};

/**
 * LEGACY COMPATIBILITY: Keep old onboarding hook name as alias
 */
export const useOnboarding = useProfileSetup;

export default useUserProgress;