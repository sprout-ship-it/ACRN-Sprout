// src/components/features/matching/EnhancedMatchingProfileForm.js - PRODUCTION READY
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useMatchingProfileForm } from './hooks/useMatchingProfileForm';

// Import form components
import FormActions from '../../forms/components/FormActions';
import { shouldBlockNavigation } from '../../../utils/matching/sectionValidation';

// Import all section components
import PersonalInfoSection from './sections/PersonalInfoSection';
import LocationPreferencesSection from './sections/LocationPreferencesSection';
import RecoveryInfoSection from './sections/RecoveryInfoSection';
import RoommatePreferencesSection from './sections/RoommatePreferencesSection';
import LifestylePreferencesSection from './sections/LifestylePreferencesSection';
import CompatibilitySection from './sections/CompatibilitySection';

// Import CSS module
import styles from './EnhancedMatchingProfileForm.module.css';

const FORM_SECTIONS = [
  {
    id: 'personal',
    title: 'Personal Info',
    component: PersonalInfoSection,
    icon: '👤',
    description: 'Basic personal and contact information',
    requiredFields: ['primary_phone', 'date_of_birth']
  },
  {
    id: 'location',
    title: 'Location & Housing',
    component: LocationPreferencesSection,
    icon: '🏠',
    description: 'Housing preferences and location requirements',
    requiredFields: ['primary_city', 'primary_state', 'budget_min', 'budget_max', 'move_in_date', 'max_commute_minutes']
  },
  {
    id: 'recovery',
    title: 'Recovery Journey',
    component: RecoveryInfoSection,
    icon: '🌱',
    description: 'Recovery stage and support preferences',
    requiredFields: ['recovery_stage', 'spiritual_affiliation', 'primary_issues', 'recovery_methods', 'program_types']
  },
  {
    id: 'roommate',
    title: 'Roommate Preferences',
    component: RoommatePreferencesSection,
    icon: '👥',
    description: 'Ideal roommate characteristics and requirements',
    requiredFields: ['preferred_roommate_gender', 'smoking_status']
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Compatibility',
    component: LifestylePreferencesSection,
    icon: '⚖️',
    description: 'Daily routines and living preferences',
    requiredFields: ['work_schedule', 'social_level', 'cleanliness_level', 'noise_tolerance']
  },
  {
    id: 'compatibility',
    title: 'Personal Story',
    component: CompatibilitySection,
    icon: '💫',
    description: 'Your story and what you\'re looking for',
    requiredFields: ['about_me', 'looking_for', 'interests']
  }
];

const EnhancedMatchingProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  const navigate = useNavigate();
  const { profile, hasRole } = useAuth();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  
  const {
    formData,
    errors,
    loading,
    initialLoading,
    successMessage,
    completionPercentage,
    canSubmit,
    handleInputChange,
    handleArrayChange,
    handleRangeChange,
    submitForm,
    validateForm,
    setSuccessMessage
  } = useMatchingProfileForm();

  useEffect(() => {
    return () => {
      setIsSubmitting(false);
      setSuccessMessage('');
      setValidationMessage('');
    };
  }, []);

  const scrollToFirstFormField = useCallback(() => {
    setTimeout(() => {
      const activeSection = document.querySelector('.matching-profile-form .card');
      if (!activeSection) return;

      const selectors = [
        'input[required]:not([disabled]):not([readonly])',
        'select[required]:not([disabled])',
        'textarea[required]:not([disabled]):not([readonly])',
        'input:not([disabled]):not([readonly]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled]):not([readonly])',
        'input[type="checkbox"]:not([disabled])',
        'input[type="radio"]:not([disabled])',
        '.form-group'
      ];
      
      let targetElement = null;
      
      for (const selector of selectors) {
        const element = activeSection.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            targetElement = element;
            break;
          }
        }
      }
      
      if (!targetElement) {
        targetElement = activeSection.querySelector('h2, h3, .card-header');
      }

      if (targetElement) {
        const elementRect = targetElement.getBoundingClientRect();
        const absoluteTop = elementRect.top + window.pageYOffset;
        const headerOffset = 120; 
        const extraPadding = 20;
        const scrollTop = Math.max(0, absoluteTop - headerOffset - extraPadding);
        
        window.scrollTo({ 
          top: scrollTop, 
          behavior: 'smooth' 
        });
        
        if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'SELECT' || targetElement.tagName === 'TEXTAREA') {
          setTimeout(() => {
            try {
              targetElement.focus();
            } catch (error) {
              // Silent fail
            }
          }, 500);
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 200);
  }, []);

  const validateCurrentSection = useCallback(() => {
    const currentSectionId = FORM_SECTIONS[currentSectionIndex].id;
    const section = FORM_SECTIONS[currentSectionIndex];
    
    const missingFields = [];
    section.requiredFields?.forEach(fieldName => {
      const value = formData[fieldName];
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(fieldName);
      }
    });
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        message: `Please complete these required fields: ${missingFields.map(field => field.replace(/_/g, ' ')).join(', ')}`,
        missingFields
      };
    }
    
    const navigationCheck = shouldBlockNavigation(currentSectionId, formData);
    return {
      isValid: !navigationCheck.shouldBlock,
      message: navigationCheck.message,
      reason: navigationCheck.reason
    };
  }, [currentSectionIndex, formData]);

const cleanFormDataForSubmission = useCallback((formData) => {
  const cleaned = { ...formData };
  
  // ✅ Remove auto-generated columns
  delete cleaned.primary_location;
  delete cleaned.id;
  delete cleaned.created_at;
  delete cleaned.updated_at;
  
  // ✅ REMOVE DELETED SCHEMA COLUMNS
  delete cleaned.time_in_recovery;
  delete cleaned.social_interaction_level;
  
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined || cleaned[key] === null) {
      delete cleaned[key];
    }
  });
  
  const arrayFields = [
    'recovery_methods', 'program_types', 'primary_issues', 
    'housing_types_accepted', 'interests', 'housing_assistance',
    'important_qualities', 'deal_breakers'
  ];
  
  arrayFields.forEach(field => {
    if (cleaned[field] && !Array.isArray(cleaned[field])) {
      cleaned[field] = [];
    }
  });
  
  return cleaned;
}, []);

  const handleNext = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const validation = validateCurrentSection();
    if (!validation.isValid) {
      setValidationMessage(validation.message);
      
      setTimeout(() => {
        const errorElement = document.querySelector('.border-red-500, .text-red-500, .alert-error');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (errorElement.focus) errorElement.focus();
        }
      }, 100);
      return;
    }
    
    setValidationMessage('');
    
    if (currentSectionIndex < FORM_SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      scrollToFirstFormField();
    }
  }, [currentSectionIndex, validateCurrentSection, scrollToFirstFormField]);

  const handlePrevious = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setValidationMessage('');
    
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      scrollToFirstFormField();
    }
  }, [currentSectionIndex, scrollToFirstFormField]);

  const handleSectionClick = useCallback((index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (loading || isSubmitting) return;
    if (index === currentSectionIndex) return;
    
    setCurrentSectionIndex(index);
    scrollToFirstFormField();
    setValidationMessage('');
  }, [currentSectionIndex, loading, isSubmitting, scrollToFirstFormField, setValidationMessage]);

  const handleSave = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (loading || isSubmitting) return;
    
    setSuccessMessage('');
    
    try {
      const success = await submitForm();
      if (success) {
        setSuccessMessage('Progress saved successfully!');
      }
    } catch (error) {
      setSuccessMessage('');
    }
  }, [loading, isSubmitting, submitForm, setSuccessMessage]);

  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const isLastSection = currentSectionIndex === FORM_SECTIONS.length - 1;
    if (!isLastSection) return;
    
    if (loading || isSubmitting) return;
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      const formValid = validateForm();
      
      if (!formValid) {
        setIsSubmitting(false);
        scrollToFirstError();
        return;
      }
      
      const cleanedData = cleanFormDataForSubmission(formData);
      const success = await submitForm(cleanedData);
      
      if (success) {
        setSuccessMessage('Matching profile completed successfully!');
        
        // Immediate state reset
        setIsSubmitting(false);
        
        // Quick redirect
        setTimeout(() => {
          if (editMode && onComplete) {
            onComplete();
          } else {
            navigate('/app?profileComplete=true', {
              state: { 
                message: editMode 
                  ? 'Matching profile updated successfully!' 
                  : 'Matching profile completed successfully!'
              },
              replace: true
            });
          }
        }, 500);
      } else {
        setIsSubmitting(false);
        scrollToFirstError();
      }
    } catch (error) {
      setIsSubmitting(false);
      setSuccessMessage('');
      scrollToFirstError();
    }
  }, [currentSectionIndex, loading, isSubmitting, validateForm, submitForm, editMode, onComplete, navigate, setSuccessMessage, formData, cleanFormDataForSubmission]);

  const scrollToFirstError = useCallback(() => {
    setTimeout(() => {
      const errorSelectors = [
        '.border-red-500',
        '.text-red-500',
        '.alert-error',
        '.error',
        '.invalid'
      ];
      
      for (const selector of errorSelectors) {
        const errorElement = document.querySelector(selector);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (errorElement.focus) errorElement.focus();
          return;
        }
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, []);

  const handleCancel = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (onCancel) {
      onCancel();
    } else {
      navigate('/app');
    }
  }, [onCancel, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      
      const form = e.target.closest('form');
      if (form) {
        const focusableElements = Array.from(form.querySelectorAll('input, select, textarea, button'));
        const currentIndex = focusableElements.indexOf(e.target);
        const nextElement = focusableElements[currentIndex + 1];
        if (nextElement) {
          nextElement.focus();
        }
      }
    }
  }, []);

  if (!hasRole('applicant')) {
    return (
      <div className="container">
        <div className="content">
          <div className="alert alert-error">
            <h3>Access Denied</h3>
            <p>You must be registered as an applicant to access the matching profile form.</p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/app')}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="container">
        <div className="content">
          <div className="loading-container">
            <div className="loading-spinner large"></div>
            <div className="loading-text">
              Loading your matching profile...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSection = FORM_SECTIONS[currentSectionIndex];
  const CurrentSectionComponent = currentSection.component;
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === FORM_SECTIONS.length - 1;
  const hasErrors = Object.values(errors).some(error => error && error.trim() !== '');

  return (
    <div className="container">
      <div className="app-header">
        <h1 className="header-title">
          {editMode ? 'Edit' : 'Complete'} Matching Profile
        </h1>
        <p className="header-subtitle">
          {editMode 
            ? 'Update your profile to improve your roommate matches'
            : 'Complete your profile to find compatible roommates'
          }
        </p>
      </div>

      <div className="content">
        {successMessage && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {successMessage}
          </div>
        )}

        {validationMessage && (
          <div className="alert alert-warning">
            <span className="alert-icon">⚠️</span>
            <strong>Validation Required:</strong> {validationMessage}
          </div>
        )}

        {errors.submit && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            <h4>Submission Error</h4>
            <p>{errors.submit}</p>
          </div>
        )}
        
        {errors.load && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            <h4>Loading Error</h4>
            <p>{errors.load}</p>
          </div>
        )}

        {/* Section Navigation Grid */}
        <div className={styles.formSectionNavigation}>
          <div className={styles.sectionNavHeader}>
            <h3>Complete Your Profile</h3>
            <p>Step {currentSectionIndex + 1} of {FORM_SECTIONS.length}: {currentSection.title}</p>
          </div>
          
          <nav className={styles.sectionNavGrid}>
            {FORM_SECTIONS.map((section, index) => {
              const isActive = index === currentSectionIndex;
              const isCompleted = index < currentSectionIndex;
              
              return (
                <button
                  key={`nav-${section.id}-${index}`}
                  type="button"
                  className={`${styles.sectionNavItem} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                  onClick={(e) => handleSectionClick(index, e)}
                  disabled={loading || isSubmitting}
                  title={section.description}
                >
                  <span className={styles.sectionNavIcon}>
                    {isCompleted ? '✓' : section.icon}
                  </span>
                  <span className={styles.sectionNavLabel}>{section.title}</span>
                  {isActive && <span className={styles.sectionNavCurrent}>Current</span>}
                </button>
              );
            })}
          </nav>
          
          <div className={styles.sectionNavProgress}>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentSectionIndex + 1) / FORM_SECTIONS.length) * 100}%` }}
              />
            </div>
            <span className="progress-text">
              {Math.round(((currentSectionIndex + 1) / FORM_SECTIONS.length) * 100)}% Complete
            </span>
          </div>
        </div>

        <form 
          onSubmit={handleSubmit} 
          onKeyDown={handleKeyDown}
          noValidate
          className="matching-profile-form"
        >
          <div className="card">
            <div className="card-header">
              <h2 className={styles.sectionHeader || 'section-header'}>
                {currentSection.icon} {currentSection.title}
              </h2>
              <p className={styles.sectionDescription || 'section-description'}>
                {currentSection.description}
              </p>
            </div>

            <CurrentSectionComponent
              formData={formData}
              errors={errors}
              loading={loading || isSubmitting}
              profile={profile}
              onInputChange={handleInputChange}
              onArrayChange={handleArrayChange}
              onRangeChange={handleRangeChange}
              styles={styles}
              sectionId={currentSection.id}
              isActive={true}
              validationMessage={validationMessage}
            />

            <FormActions
              loading={loading}
              editMode={editMode}
              isSubmitting={isSubmitting}
              isFirstSection={isFirstSection}
              isLastSection={isLastSection}
              completionPercentage={completionPercentage}
              canSubmit={canSubmit}
              onSave={handleSave}
              onCancel={editMode ? handleCancel : null}
              onPrevious={!isFirstSection ? handlePrevious : null}
              onNext={!isLastSection ? handleNext : null}
              onSubmit={isLastSection ? handleSubmit : null}
              currentSection={currentSection.title}
              validationBlocked={!!validationMessage}
            />
          </div>
        </form>

        {/* Profile Status Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Profile Status</h3>
          </div>
          
          <div className="grid-2 mb-4">
            <div>
              <strong>Completion Status:</strong>
              <div className="progress-container mt-2">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="progress-text">{completionPercentage}%</span>
              </div>
            </div>
            
            <div>
              <strong>Profile Status:</strong>
              <div className="mt-1">
                <span className={`badge ${formData.is_active ? 'badge-success' : 'badge-warning'}`}>
                  {formData.is_active ? 'Active for Matching' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {hasErrors && (
            <div className="alert alert-warning">
              <strong>Validation Issues:</strong> Please review and correct the highlighted fields.
            </div>
          )}

          {completionPercentage < 100 && !editMode && (
            <div className="alert alert-info">
              <strong>Almost Complete!</strong> Finish all required fields to activate your profile for matching.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="card">
          <div className="action-buttons">
            <button 
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/app')}
              disabled={loading || isSubmitting}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMatchingProfileForm;