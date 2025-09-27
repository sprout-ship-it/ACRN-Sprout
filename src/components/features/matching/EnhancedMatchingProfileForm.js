// src/components/features/matching/EnhancedMatchingProfileForm.js - FIXED SCROLLING VERSION
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useMatchingProfileForm } from './hooks/useMatchingProfileForm';

// Import form components
import FormActions from '../../forms/components/FormActions';
import ProgressBar from '../../forms/components/ProgressBar';
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

// ✅ UPDATED: Form sections configuration aligned with new schema structure
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

// ✅ NEW: Schema field validation mapping
const SCHEMA_FIELD_MAPPING = {
  // Location fields (standardized in new schema)
  location: {
    city: 'primary_city',           // Changed from 'city' to 'primary_city'
    state: 'primary_state',         // Changed from 'state' to 'primary_state'
    zipCodes: 'target_zip_codes',   // Standardized field name
    budgetMin: 'budget_min',        // Standardized field name
    budgetMax: 'budget_max'         // Standardized field name
  },
  
  // Personal info fields
  personal: {
    phone: 'primary_phone',         // Standardized field name
    dateOfBirth: 'date_of_birth',   // Standardized field name
    genderIdentity: 'gender_identity', // Standardized field name
    biologicalSex: 'biological_sex' // Standardized field name
  },
  
  // Recovery fields
  recovery: {
    stage: 'recovery_stage',        // Standardized field name
    methods: 'recovery_methods',    // Standardized array field
    issues: 'primary_issues',       // Standardized array field
    spiritual: 'spiritual_affiliation', // Standardized field name
    programs: 'program_types'       // Standardized array field
  },
  
  // Roommate preferences
  roommate: {
    genderPreference: 'preferred_roommate_gender', // Changed from 'gender_preference'
    smokingStatus: 'smoking_status', // Standardized field name
    smokingPreference: 'smoking_preference', // Standardized field name
    petPreference: 'pet_preference'  // Standardized field name
  },
  
  // Lifestyle preferences
  lifestyle: {
    workSchedule: 'work_schedule',   // Standardized field name
    socialLevel: 'social_level',     // Standardized field name
    cleanlinessLevel: 'cleanliness_level', // Standardized field name
    noiseTolerance: 'noise_tolerance', // Standardized field name
    guestsPolicy: 'guests_policy'    // Simplified from multiple guest fields
  },
  
  // Compatibility fields
  compatibility: {
    aboutMe: 'about_me',            // Standardized field name
    lookingFor: 'looking_for',      // Standardized field name
    interests: 'interests',         // Standardized array field
    housingAssistance: 'housing_assistance' // Standardized array field
  }
};

const EnhancedMatchingProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  const navigate = useNavigate();
  const { profile, hasRole } = useAuth();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showSchemaInfo, setShowSchemaInfo] = useState(process.env.NODE_ENV === 'development');
  
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

  // ✅ FIXED: Enhanced scroll to form field with proper section scoping
  const scrollToFirstFormField = useCallback(() => {
    console.log('🔄 Starting scroll to first form field...');
    
    setTimeout(() => {
      // First, find the active section container
      const activeSection = document.querySelector('.matching-profile-form .card');
      if (!activeSection) {
        console.warn('⚠️ Active section container not found');
        return;
      }

      console.log('📍 Found active section container:', activeSection);

      // Priority order for finding interactive elements within the active section
      const selectors = [
        // Look for required fields first (marked with red asterisk)
        'input[required]:not([disabled]):not([readonly])',
        'select[required]:not([disabled])',
        'textarea[required]:not([disabled]):not([readonly])',
        
        // Then any interactive form elements
        'input:not([disabled]):not([readonly]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled]):not([readonly])',
        
        // Then checkboxes and radio buttons
        'input[type="checkbox"]:not([disabled])',
        'input[type="radio"]:not([disabled])',
        
        // Finally fallback to form groups
        '.form-group'
      ];
      
      let targetElement = null;
      
      // Search within the active section only
      for (const selector of selectors) {
        const element = activeSection.querySelector(selector);
        if (element) {
          // Make sure the element is visible
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            targetElement = element;
            console.log(`🎯 Found target element: ${element.tagName}[${element.type || 'N/A'}] with selector: ${selector}`);
            break;
          }
        }
      }
      
      if (!targetElement) {
        console.warn('⚠️ No suitable target element found, falling back to section header');
        // Fallback to section header
        targetElement = activeSection.querySelector('h2, h3, .card-header');
      }

      if (targetElement) {
        // Calculate scroll position
        const elementRect = targetElement.getBoundingClientRect();
        const absoluteTop = elementRect.top + window.pageYOffset;
        
        // Account for fixed headers and some padding
        const headerOffset = 120; 
        const extraPadding = 20;
        const scrollTop = Math.max(0, absoluteTop - headerOffset - extraPadding);
        
        console.log(`📏 Scroll calculation:`, {
          elementTop: elementRect.top,
          absoluteTop,
          scrollTop,
          currentScroll: window.pageYOffset
        });
        
        // Smooth scroll to the element
        window.scrollTo({ 
          top: scrollTop, 
          behavior: 'smooth' 
        });
        
        // Focus the element if it's focusable
        if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'SELECT' || targetElement.tagName === 'TEXTAREA') {
          // Delay focus to ensure scroll completes
          setTimeout(() => {
            try {
              targetElement.focus();
              console.log(`🎯 Focused element: ${targetElement.tagName}[${targetElement.type || 'N/A'}]`);
            } catch (error) {
              console.warn('⚠️ Could not focus element:', error);
            }
          }, 500); // Longer delay to ensure scroll animation completes
        }
        
        console.log(`✅ Successfully scrolled to: ${targetElement.tagName}${targetElement.className ? ' (' + targetElement.className + ')' : ''}`);
      } else {
        console.error('❌ No target element found for scrolling');
        // Ultimate fallback - scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 200); // Slightly longer delay to ensure DOM is fully updated
  }, []);

  // ✅ ENHANCED: Section validation with schema field checking
  const validateCurrentSection = useCallback(() => {
    const currentSectionId = FORM_SECTIONS[currentSectionIndex].id;
    const section = FORM_SECTIONS[currentSectionIndex];
    
    // Check required fields for current section
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
    
    // Use existing validation logic
    const navigationCheck = shouldBlockNavigation(currentSectionId, formData);
    return {
      isValid: !navigationCheck.shouldBlock,
      message: navigationCheck.message,
      reason: navigationCheck.reason
    };

}, [currentSectionIndex, formData]);

  // ✅ NEW: Clean form data for submission (remove computed fields)
  const cleanFormDataForSubmission = useCallback((formData) => {
    const cleaned = { ...formData };
    
    // Remove computed fields that are generated by the database
    delete cleaned.primary_location; // This is auto-computed: primary_city + ', ' + primary_state
    delete cleaned.id; // Never send ID in updates
    delete cleaned.created_at; // Database handles this
    delete cleaned.updated_at; // Database handles this
    
    // Remove any undefined or null values
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined || cleaned[key] === null) {
        delete cleaned[key];
      }
    });
    
    // Ensure array fields are proper arrays
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

  // ✅ ENHANCED: Next button with better validation
  const handleNext = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🔄 Next button clicked, current section:', currentSectionIndex);
    
    const validation = validateCurrentSection();
    if (!validation.isValid) {
      setValidationMessage(validation.message);
      console.log('🚫 Navigation blocked:', validation.reason || validation.message);
      
      // Scroll to first missing field or error
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
    
    setValidationMessage(''); // Clear validation when going back
    
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      scrollToFirstFormField();
    }
  }, [currentSectionIndex, scrollToFirstFormField]);

const handleSectionClick = useCallback((index, e) => {
  console.log('🖱️ Navigation clicked:', { 
    targetIndex: index, 
    currentIndex: currentSectionIndex, 
    editMode, 
    loading, 
    isSubmitting 
  });
  
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Prevent navigation if form is processing
  if (loading || isSubmitting) {
    console.log('🚫 Navigation blocked: Form is processing');
    return;
  }
  
  // Prevent navigation to same section
  if (index === currentSectionIndex) {
    console.log('🚫 Navigation blocked: Already on this section');
    return;
  }
  
  // ✅ SIMPLIFIED: Allow free navigation to any section at any time
  console.log(`📍 Navigating from section ${currentSectionIndex} to section ${index}`);
  setCurrentSectionIndex(index);
  scrollToFirstFormField();
  setValidationMessage(''); // Clear any validation messages when navigating
  
  // Add visual feedback for successful navigation
  const targetSection = FORM_SECTIONS[index];
  console.log(`🎯 Successfully navigated to: ${targetSection.title}`);
  
}, [currentSectionIndex, loading, isSubmitting, scrollToFirstFormField, setValidationMessage]);

const showNavigationFeedback = useCallback((message, type = 'warning') => {
  // Create a temporary feedback element
  const feedback = document.createElement('div');
  feedback.className = `alert alert-${type}`;
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  `;
  feedback.innerHTML = `
    <span class="alert-icon">${type === 'warning' ? '⚠️' : 'ℹ️'}</span>
    ${message}
  `;
  
  document.body.appendChild(feedback);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }
  }, 3000);
}, []);

  // ✅ ENHANCED: Save progress with schema field validation
  const handleSave = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (loading || isSubmitting) {
      console.log('🚫 Save blocked: already in progress', { loading, isSubmitting });
      return;
    }
    
    console.log('🔄 Save Progress - Schema-aligned field validation');
    setSuccessMessage('');
    
    try {
      // Validate schema field alignment before saving
      const schemaValidation = validateSchemaAlignment();
      if (!schemaValidation.isValid) {
        console.warn('⚠️ Schema validation warnings:', schemaValidation.warnings);
      }
      
      const success = await submitForm();
      if (success) {
        setSuccessMessage('Progress saved successfully with standardized field structure!');
        console.log('✅ Progress saved with schema alignment');
      } else {
        console.log('❌ Save failed - check for field mapping errors');
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setSuccessMessage('');
    }
  }, [loading, isSubmitting, submitForm, setSuccessMessage]);

  // ✅ NEW: Schema field alignment validation
  const validateSchemaAlignment = useCallback(() => {
    const warnings = [];
    const requiredSchemaFields = [
      'primary_city', 'primary_state', 'budget_min', 'budget_max', 
      'preferred_roommate_gender', 'recovery_stage', 'spiritual_affiliation',
      'primary_issues', 'recovery_methods', 'about_me', 'looking_for'
    ];
    
    requiredSchemaFields.forEach(field => {
      if (!(field in formData)) {
        warnings.push(`Missing schema field: ${field}`);
      }
    });
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }, [formData]);

  // ✅ ENHANCED: Form submission with comprehensive validation
  const handleSubmit = useCallback(async (e) => {
    console.log('🚨 FORM SUBMIT TRIGGERED - handleSubmit called');
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const isLastSection = currentSectionIndex === FORM_SECTIONS.length - 1;
    if (!isLastSection) {
      console.log('🚫 BLOCKING SUBMISSION: Not on last section');
      return;
    }
    
    if (loading || isSubmitting) {
      console.log('🚫 BLOCKING SUBMISSION: Already in progress');
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      // Final validation including schema alignment
      console.log('🔍 Final form validation with schema alignment...');
      const formValid = validateForm();
      const schemaValid = validateSchemaAlignment();
      
      if (!formValid) {
        console.log('❌ Form validation failed');
        setIsSubmitting(false);
        scrollToFirstError();
        return;
      }
      
      if (!schemaValid.isValid) {
        console.warn('⚠️ Schema alignment issues:', schemaValid.warnings);
        // Continue but log warnings
      }
      
      console.log('✅ Form validation passed, submitting with standardized fields...');
      const cleanedData = cleanFormDataForSubmission(formData);
      console.log('🧹 Cleaned form data (removed computed fields):', cleanedData);
      const success = await submitForm(cleanedData); // Pass cleaned data if your hook accepts it
      
      if (success) {
        console.log('✅ Database submission successful');
        setSuccessMessage('Matching profile completed with enhanced field structure!');
        
        setTimeout(() => {
          if (editMode && onComplete) {
            onComplete();
          } else {
            navigate('/app?profileComplete=true', {
              state: { 
                message: editMode 
                  ? 'Matching profile updated successfully with improved data structure!' 
                  : 'Matching profile completed successfully using our enhanced matching system!'
              },
              replace: true
            });
          }
        }, 1500);
      } else {
        console.log('❌ Database submission failed');
        setIsSubmitting(false);
        scrollToFirstError();
      }
    } catch (error) {
      console.error('💥 Submission error:', error);
      setIsSubmitting(false);
      setSuccessMessage('');
      scrollToFirstError();
    }
  }, [currentSectionIndex, loading, isSubmitting, validateForm, validateSchemaAlignment, submitForm, editMode, onComplete, navigate, setSuccessMessage]);

  // ✅ NEW: Enhanced error scrolling
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
          console.log(`📍 Scrolled to error: ${selector}`);
          return;
        }
      }
      
      // Fallback to top of form
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

  // Prevent accidental form submissions
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      
      // Move to next focusable element
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

  // Authorization check
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

  // Loading state
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
      {/* Header with Schema Information */}
      <div className="app-header">
        <h1 className="header-title">
          {editMode ? 'Edit' : 'Complete'} Matching Profile
        </h1>
        <p className="header-subtitle">
          {editMode 
            ? 'Update your profile using our enhanced matching system with improved field structure'
            : 'Complete your comprehensive profile using our advanced compatibility matching algorithm'
          }
        </p>
        
        {/* ✅ NEW: Schema alignment indicator for development */}
        {showSchemaInfo && (
          <div className="alert alert-info mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                ✅ Using enhanced schema v2.0 with standardized field names for optimal matching
              </span>
              <button 
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setShowSchemaInfo(false)}
              >
                Hide Info
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="content">
        {/* Enhanced Progress Indicator */}
        <ProgressBar 
          percentage={completionPercentage}
          showText={true}
          editMode={editMode}
          label={`Section ${currentSectionIndex + 1} of ${FORM_SECTIONS.length}: ${currentSection.title}`}
        />

{/* ✅ FIXED: Free Navigation JSX */}
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
        {/* Success and Error Messages */}
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

        {/* ✅ ENHANCED: Form with better structure */}
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

            {/* ✅ ENHANCED: Current Section Component with comprehensive props */}
            <CurrentSectionComponent
              formData={formData}
              errors={errors}
              loading={loading || isSubmitting}
              profile={profile}
              onInputChange={handleInputChange}
              onArrayChange={handleArrayChange}
              onRangeChange={handleRangeChange}
              styles={styles}
              fieldMapping={SCHEMA_FIELD_MAPPING}
              sectionId={currentSection.id}
              isActive={true}
              validationMessage={validationMessage}
            />

            {/* ✅ ENHANCED: Form Actions */}
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

        {/* ✅ ENHANCED: Profile Status with Schema Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Profile Status & Schema Information</h3>
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

          <div className="grid-3 mb-4">
            <div>
              <strong>Data Version:</strong>
              <div className="badge badge-success">Schema v2.0</div>
            </div>
            <div>
              <strong>Field Structure:</strong>
              <div className="badge badge-success">Standardized</div>
            </div>
            <div>
              <strong>Matching Ready:</strong>
              <div className={`badge ${completionPercentage >= 80 ? 'badge-success' : 'badge-warning'}`}>
                {completionPercentage >= 80 ? 'Yes' : 'Needs Completion'}
              </div>
            </div>
          </div>

          {hasErrors && (
            <div className="alert alert-warning">
              <strong>Validation Issues:</strong> Please review and correct the highlighted fields.
              <details className="mt-2">
                <summary>Show validation details</summary>
                <ul className="mt-2 text-sm">
                  {Object.entries(errors)
                    .filter(([_, error]) => error && error.trim() !== '')
                    .map(([field, error]) => (
                      <li key={field}>
                        <strong>{field.replace(/_/g, ' ')}:</strong> {error}
                      </li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          {completionPercentage < 100 && !editMode && (
            <div className="alert alert-info">
              <strong>Almost Complete!</strong> Finish all required fields to activate your profile for our enhanced matching algorithm.
            </div>
          )}
        </div>

        {/* ✅ ENHANCED: Help Section with Schema Benefits */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Enhanced Matching System</h3>
          </div>
          
          <p className="mb-4">
            Your profile uses our improved matching system with standardized fields for better compatibility analysis and more accurate roommate suggestions.
          </p>
          
          <div className="grid-2 mb-4">
            <div className="feature-highlight">
              <h4 className="feature-title">🎯 Improved Matching</h4>
              <ul className="feature-list">
                <li>Enhanced location compatibility</li>
                <li>Better budget alignment</li>
                <li>Refined lifestyle matching</li>
                <li>Advanced recovery compatibility</li>
              </ul>
            </div>
            
            <div className="feature-highlight">
              <h4 className="feature-title">🔒 Enhanced Privacy</h4>
              <ul className="feature-list">
                <li>Standardized data protection</li>
                <li>Improved access controls</li>
                <li>Better consent management</li>
                <li>Secure field mapping</li>
              </ul>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => window.open('/help/enhanced-matching', '_blank')}
              disabled={loading || isSubmitting}
            >
              Learn About Enhanced Matching
            </button>
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