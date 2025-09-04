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
 * Hook for onboarding flow management
 */
export const useOnboarding = () => {
  const {
    progress,
    currentStep,
    isOnboardingComplete,
    markBasicProfileComplete,
    markMatchingProfileComplete,
    progressPercentage
  } = useUserProgress();
  
  const getStepInfo = (step) => {
    const steps = {
      1: {
        title: 'Basic Profile',
        description: 'Complete your personal information',
        completed: progress.basicProfile,
        required: true
      },
      2: {
        title: 'Matching Profile',
        description: 'Set up your roommate preferences',
        completed: progress.matchingProfile,
        required: true
      },
      3: {
        title: 'Find Matches',
        description: 'Start connecting with potential roommates',
        completed: progress.activeMatching,
        required: false
      },
      4: {
        title: 'Housing Search',
        description: 'Search for housing with your match',
        completed: progress.hasMatches,
        required: false
      }
    };
    
    return steps[step] || null;
  };
  
  const getNextStep = () => {
    if (!progress.basicProfile) return 1;
    if (!progress.matchingProfile) return 2;
    if (!progress.activeMatching) return 3;
    if (!progress.hasMatches) return 4;
    return null; // All steps complete
  };
  
  const getStepsRemaining = () => {
    const requiredSteps = [1, 2];
    const completedRequired = requiredSteps.filter(step => {
      const stepInfo = getStepInfo(step);
      return stepInfo?.completed;
    });
    
    return requiredSteps.length - completedRequired.length;
  };
  
  return {
    currentStep,
    nextStep: getNextStep(),
    isComplete: isOnboardingComplete,
    progressPercentage,
    stepsRemaining: getStepsRemaining(),
    getStepInfo,
    markBasicComplete: markBasicProfileComplete,
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
        description: 'Complete your basic profile to begin',
        action: 'Start Setup',
        color: 'gray'
      },
      'setup': {
        title: 'Complete Setup',
        description: 'Finish your matching profile to find roommates',
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
 * Hook for progress notifications and guidance
 */
export const useProgressGuidance = () => {
  const { progress, currentStep, isOnboardingComplete } = useUserProgress();
  
  const getNextAction = () => {
    if (!progress.basicProfile) {
      return {
        title: 'Complete Your Profile',
        description: 'Add your personal information to get started',
        action: 'edit-profile',
        priority: 'high'
      };
    }
    
    if (!progress.matchingProfile) {
      return {
        title: 'Set Up Matching Preferences',
        description: 'Tell us what you\'re looking for in a roommate',
        action: 'matching-profile',
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
    const completionPercentage = Math.round(
      Object.values(progress).filter(Boolean).length / 4 * 100
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
    
    if (!progress.basicProfile) {
      tips.push('A complete profile helps you find better matches');
    }
    
    if (!progress.matchingProfile) {
      tips.push('Be specific about your preferences for better compatibility');
    }
    
    if (progress.matchingProfile && !progress.activeMatching) {
      tips.push('Send match requests to people who seem compatible');
    }
    
    if (progress.activeMatching && !progress.hasMatches) {
      tips.push('Be patient - good matches take time to develop');
    }
    
    return tips;
  };
  
  return {
    nextAction: getNextAction(),
    progressMessage: getProgressMessage(),
    tips: getTips(),
    isOnboardingComplete,
    currentStep,
    shouldShowGuidance: !isOnboardingComplete
  };
};

/**
 * Hook for progress analytics and insights
 */
export const useProgressInsights = () => {
  const { progress } = useUserProgress();
  
  const getCompletionStats = () => {
    const total = 4; // Total number of progress items
    const completed = Object.values(progress).filter(Boolean).length;
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
      remaining: total - completed
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
    if (stats.percentage >= 25) return 'needs-attention';
    return 'critical';
  };
  
  return {
    stats: getCompletionStats(),
    estimatedTime: getEstimatedTimeToComplete(),
    health: getProgressHealth(),
    lastUpdated: progress.lastUpdated
  };
};

export default useUserProgress;