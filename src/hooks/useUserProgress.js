// src/hooks/useUserProgress.js
import { useContext } from 'react';
import { UserProgressContext } from '../contexts/UserProgressContext';

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
 * Hook for profile setup flow management (UPDATED for simplified flow)
 * NOTE: Renamed from "onboarding" to "profile setup" to reflect new simplified flow
 */
export const useProfileSetup = () => {
  const {
    progress,
    currentStep,
    isOnboardingComplete: isSetupComplete, // Legacy compatibility
    markMatchingProfileComplete,
    progressPercentage
  } = useUserProgress();
  
  const getStepInfo = (step) => {
    // UPDATED: Simplified to match new flow (no basic profile step)
    const steps = {
      1: {
        title: 'Role-Specific Profile',
        description: 'Complete your comprehensive profile',
        completed: progress.matchingProfile,
        required: true
      },
      2: {
        title: 'Find Matches',
        description: 'Start connecting with potential roommates',
        completed: progress.activeMatching,
        required: false
      },
      3: {
        title: 'Housing Search',
        description: 'Search for housing with your matches',
        completed: progress.hasMatches,
        required: false
      }
    };
    
    return steps[step] || null;
  };
  
  const getNextStep = () => {
    // UPDATED: Simplified flow without basic profile
    if (!progress.matchingProfile) return 1;
    if (!progress.activeMatching) return 2;
    if (!progress.hasMatches) return 3;
    return null; // All steps complete
  };
  
  const getStepsRemaining = () => {
    // UPDATED: Only matching profile is required now
    const requiredSteps = [1]; // Only step 1 (role-specific profile) is required
    const completedRequired = requiredSteps.filter(step => {
      const stepInfo = getStepInfo(step);
      return stepInfo?.completed;
    });
    
    return requiredSteps.length - completedRequired.length;
  };
  
  return {
    currentStep,
    nextStep: getNextStep(),
    isComplete: isSetupComplete,
    progressPercentage,
    stepsRemaining: getStepsRemaining(),
    getStepInfo,
    // UPDATED: Removed markBasicComplete since we eliminated basic profile step
    markMatchingComplete: markMatchingProfileComplete,
    progress
  };
};

/**
 * Hook for matching progress tracking
 */
export const useMatchingProgress = () => {
  const {
    progress,
    markActiveMatching,
    markHasMatches,
    refreshProgress
  } = useUserProgress();
  
  const matchingStatus = {
    // UPDATED: Simplified status without basic profile dependency
    notStarted: !progress.matchingProfile && !progress.activeMatching && !progress.hasMatches,
    profileIncomplete: !progress.matchingProfile,
    readyToMatch: progress.matchingProfile && !progress.activeMatching,
    activelyMatching: progress.activeMatching && !progress.hasMatches,
    hasMatches: progress.hasMatches
  };
  
  const getMatchingStage = () => {
    if (matchingStatus.hasMatches) return 'matched';
    if (matchingStatus.activelyMatching) return 'searching';
    if (matchingStatus.readyToMatch) return 'ready';
    if (matchingStatus.profileIncomplete) return 'setup';
    return 'not-started';
  };
  
  const getMatchingStageInfo = () => {
    const stage = getMatchingStage();
    const stageInfo = {
      'not-started': {
        title: 'Get Started',
        description: 'Complete your profile to begin matching',
        action: 'Complete Profile',
        color: 'gray'
      },
      'setup': {
        title: 'Complete Profile',
        description: 'Finish your profile to start finding roommates',
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
 * Hook for progress notifications and guidance (UPDATED for simplified flow)
 */
export const useProgressGuidance = () => {
  const { progress, currentStep, isOnboardingComplete: isSetupComplete } = useUserProgress();
  
  const getNextAction = () => {
    // UPDATED: Simplified guidance without basic profile step
    if (!progress.matchingProfile) {
      return {
        title: 'Complete Your Profile',
        description: 'Set up your comprehensive profile to get started',
        action: 'complete-profile',
        priority: 'high'
      };
    }
    
    if (!progress.activeMatching) {
      return {
        title: 'Start Finding Matches',
        description: 'Browse and connect with potential roommates',
        action: 'find-matches',
        priority: 'medium'
      };
    }
    
    if (!progress.hasMatches) {
      return {
        title: 'Review Match Requests',
        description: 'Check your pending match requests',
        action: 'match-requests',
        priority: 'medium'
      };
    }
    
    return {
      title: 'Search for Housing',
      description: 'Find housing with your matched roommate',
      action: 'match-dashboard',
      priority: 'low'
    };
  };
  
  const getProgressMessage = () => {
    // UPDATED: Simplified progress calculation (3 main steps instead of 4)
    const steps = [progress.matchingProfile, progress.activeMatching, progress.hasMatches];
    const completionPercentage = Math.round(
      steps.filter(Boolean).length / steps.length * 100
    );
    
    if (completionPercentage === 0) {
      return 'Welcome! Let\'s get your profile set up.';
    }
    
    if (completionPercentage < 50) {
      return `You're ${completionPercentage}% complete. Keep going!`;
    }
    
    if (completionPercentage < 100) {
      return `Almost there! You're ${completionPercentage}% complete.`;
    }
    
    return 'Your profile is complete! Start connecting with roommates.';
  };
  
  const getTips = () => {
    const tips = [];
    
    if (!progress.matchingProfile) {
      tips.push('A complete profile helps you find better matches');
      tips.push('Be specific about your preferences for better compatibility');
    }
    
    if (progress.matchingProfile && !progress.activeMatching) {
      tips.push('Send match requests to people who seem compatible');
      tips.push('Review profiles carefully before sending requests');
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
    isSetupComplete, // Renamed from isOnboardingComplete
    currentStep,
    shouldShowGuidance: !isSetupComplete
  };
};

/**
 * Hook for progress analytics and insights (UPDATED for simplified flow)
 */
export const useProgressInsights = () => {
  const { progress } = useUserProgress();
  
  const getCompletionStats = () => {
    // UPDATED: 3 main progress items instead of 4 (removed basic profile)
    const progressItems = [
      progress.matchingProfile,
      progress.activeMatching, 
      progress.hasMatches
    ];
    const total = progressItems.length;
    const completed = progressItems.filter(Boolean).length;
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
      remaining: total - completed
    };
  };
  
  const getEstimatedTimeToComplete = () => {
    const stats = getCompletionStats();
    const averageTimePerStep = 15; // minutes (increased since steps are more comprehensive)
    
    return stats.remaining * averageTimePerStep;
  };
  
  const getProgressHealth = () => {
    const stats = getCompletionStats();
    
    if (stats.percentage === 100) return 'excellent';
    if (stats.percentage >= 67) return 'good';  // 2 of 3 steps
    if (stats.percentage >= 33) return 'fair';  // 1 of 3 steps
    return 'needs-attention'; // 0 of 3 steps
  };
  
  return {
    stats: getCompletionStats(),
    estimatedTime: getEstimatedTimeToComplete(),
    health: getProgressHealth(),
    lastUpdated: progress.lastUpdated
  };
};

/**
 * LEGACY COMPATIBILITY: Keep old onboarding hook name as alias
 * This ensures any existing code using useOnboarding still works
 */
export const useOnboarding = useProfileSetup;

export default useUserProgress;