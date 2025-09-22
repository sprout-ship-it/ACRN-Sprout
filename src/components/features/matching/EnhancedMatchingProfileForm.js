// src/components/features/matching/EnhancedMatchingProfileForm.js - UPDATED WITH CSS MODULE
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useMatchingProfileForm } from './hooks/useMatchingProfileForm';

// Import form components
import FormActions from '../../forms/components/FormActions';
import ProgressBar from '../../forms/components/ProgressBar';

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
    icon: '👤'
  },
  {
    id: 'location',
    title: 'Location & Housing',
    component: LocationPreferencesSection,
    icon: '🏠'
  },
  {
    id: 'recovery',
    title: 'Recovery Info',
    component: RecoveryInfoSection,
    icon: '🌱'
  },
  {
    id: 'roommate',
    title: 'Roommate Preferences',
    component: RoommatePreferencesSection,
    icon: '👥'
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    component: LifestylePreferencesSection,
    icon: '⚖️'
  },
  {
    id: 'compatibility',
    title: 'About You',
    component: CompatibilitySection,
    icon: '💫'
  }
];

const EnhancedMatchingProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  const navigate = useNavigate();
  const { profile, hasRole } = useAuth();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // ✅ ENHANCED: Helper function to scroll to first form field
  const scrollToFirstFormField = () => {
    setTimeout(() => {
      // Try to find the first form input/select/textarea in the current section
      const formSection = document.querySelector('.card .form-group');
      const firstInput = document.querySelector('.card input, .card select, .card textarea');
      
      if (firstInput) {
        // Scroll to first input with some padding above
        const elementTop = firstInput.getBoundingClientRect().top + window.pageYOffset;
        const offsetTop = elementTop - 120; // 120px padding from top
        
        window.scrollTo({ 
          top: Math.max(0, offsetTop), 
          behavior: 'smooth' 
        });
        
        console.log('📍 Scrolled to first form field');
      } else if (formSection) {
        // Fallback to first form group if no input found
        const elementTop = formSection.getBoundingClientRect().top + window.pageYOffset;
        const offsetTop = elementTop - 100;
        
        window.scrollTo({ 
          top: Math.max(0, offsetTop), 
          behavior: 'smooth' 
        });
        
        console.log('📍 Scrolled to first form group');
      } else {
        // Final fallback - scroll to card content
        const cardContent = document.querySelector('.card');
        if (cardContent) {
          const elementTop = cardContent.getBoundingClientRect().top + window.pageYOffset;
          const offsetTop = elementTop - 80;
          
          window.scrollTo({ 
            top: Math.max(0, offsetTop), 
            behavior: 'smooth' 
          });
          
          console.log('📍 Scrolled to card content');
        }
      }
    }, 100); // Small delay to ensure content is rendered
  };

  // ✅ FIX 1: Add explicit event prevention to all navigation handlers
  const handleNext = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🔄 Next button clicked, current section:', currentSectionIndex);
    
    if (currentSectionIndex < FORM_SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      scrollToFirstFormField();
    }
  }, [currentSectionIndex]);

  const handlePrevious = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🔄 Previous button clicked, current section:', currentSectionIndex);
    
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      scrollToFirstFormField();
    }
  }, [currentSectionIndex]);

  const handleSectionClick = useCallback((index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🔄 Section tab clicked:', index);
    
    setCurrentSectionIndex(index);
    scrollToFirstFormField();
  }, []);

  // ✅ FIX 2: Enhanced save handler with better logging and error prevention
  const handleSave = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (loading || isSubmitting) {
      console.log('🚫 Save blocked: already in progress', { loading, isSubmitting });
      return;
    }
    
    console.log('🔄 Save Progress clicked - NOT SUBMITTING FINAL FORM');
    setSuccessMessage('');
    
    try {
      const success = await submitForm();
      if (success) {
        setSuccessMessage('Progress saved successfully!');
        console.log('✅ Progress saved successfully');
      } else {
        console.log('❌ Save failed - errors should be displayed');
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setSuccessMessage('');
    }
  }, [loading, isSubmitting, submitForm, setSuccessMessage]);

  // ✅ FIX 3: Enhanced submit handler with additional safeguards
  const handleSubmit = useCallback(async (e) => {
    console.log('🚨 FORM SUBMIT TRIGGERED - handleSubmit called');
    console.log('🔍 Event details:', {
      type: e?.type,
      target: e?.target,
      currentTarget: e?.currentTarget,
      submitter: e?.submitter
    });
    
    // ✅ CRITICAL: Always prevent default form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Calculate derived values
    const isLastSection = currentSectionIndex === FORM_SECTIONS.length - 1;
    const hasErrors = Object.values(errors).some(error => error && error.trim() !== '');
    
    // ✅ FIX: Additional check to prevent accidental submission
    if (!isLastSection) {
      console.log('🚫 BLOCKING SUBMISSION: Not on last section', { 
        currentSectionIndex, 
        isLastSection,
        totalSections: FORM_SECTIONS.length 
      });
      return;
    }
    
    if (loading || isSubmitting) {
      console.log('🚫 BLOCKING SUBMISSION: Already in progress', { loading, isSubmitting });
      return;
    }
    
    console.log('🔄 Starting FINAL form submission...');
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      console.log('🔍 Validating form before final submission...');
      const isValid = validateForm();
      console.log('🔍 Form validation result:', isValid);
      console.log('🔍 Current errors:', errors);
      console.log('🔍 Can submit:', canSubmit);
      
      if (!isValid || hasErrors) {
        console.log('❌ Form validation failed or has errors');
        setIsSubmitting(false);
        
        setTimeout(() => {
          const firstError = document.querySelector('.border-red-500, .text-red-500, .error, .alert-error input, .alert-error select, .alert-error textarea');
          if (firstError) {
            console.log('📍 Scrolling to first error:', firstError);
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
          } else {
            console.log('📍 No specific error element found, scrolling to top');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
        return;
      }

      console.log('✅ Form validation passed, submitting to database...');
      
      const success = await submitForm();
      console.log('🔍 Submit form result:', success);
      
      if (success) {
        console.log('✅ Database submission successful');
        setSuccessMessage('Matching profile completed successfully!');
        
        setTimeout(() => {
          if (editMode && onComplete) {
            console.log('📍 Edit mode: calling onComplete callback');
            onComplete();
          } else if (editMode) {
            console.log('📍 Edit mode: navigating to app dashboard');
            navigate('/app?profileComplete=true', {
              state: { message: 'Matching profile updated successfully!' },
              replace: true
            });
          } else {
            console.log('📍 New profile mode: navigating to app dashboard');
            navigate('/app?profileComplete=true', {
              state: { message: 'Matching profile completed successfully!' },
              replace: true
            });
          }
        }, 1500);
      } else {
        console.log('❌ Database submission failed');
        setIsSubmitting(false);
        
        setTimeout(() => {
          const firstError = document.querySelector('.border-red-500, .text-red-500, .alert-error');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('💥 Submission error:', error);
      setIsSubmitting(false);
      setSuccessMessage('');
      
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [currentSectionIndex, loading, isSubmitting, validateForm, errors, canSubmit, submitForm, editMode, onComplete, navigate, setSuccessMessage]);

  // ✅ FIX 4: Enhanced cancel handler
  const handleCancel = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🔄 Cancel button clicked');
    
    if (onCancel) {
      onCancel();
    } else {
      navigate('/app');
    }
  }, [onCancel, navigate]);

  // ✅ FIX 5: Add keydown handler to prevent Enter key submissions
  const handleKeyDown = useCallback((e) => {
    // Prevent Enter key from submitting form unless on submit button
    if (e.key === 'Enter' && e.target.type !== 'submit' && e.target.tagName !== 'BUTTON') {
      console.log('🚫 Preventing Enter key form submission');
      e.preventDefault();
      
      // Optional: Move to next field instead
      const form = e.target.closest('form');
      if (form) {
        const inputs = Array.from(form.querySelectorAll('input, select, textarea, button'));
        const currentIndex = inputs.indexOf(e.target);
        const nextInput = inputs[currentIndex + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  }, []);

  // Check authorization
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
      {/* Header */}
      <div className="app-header">
        <h1 className="header-title">
          {editMode ? 'Edit' : 'Complete'} Matching Profile
        </h1>
        <p className="header-subtitle">
          {editMode 
            ? 'Update your comprehensive profile information'
            : 'Complete your comprehensive profile to find the perfect roommate match'
          }
        </p>
      </div>

      <div className="content">
        {/* Progress Indicator */}
        <ProgressBar 
          percentage={completionPercentage}
          showText={true}
          editMode={editMode}
          label={`Section ${currentSectionIndex + 1} of ${FORM_SECTIONS.length}`}
        />

        {/* ✅ UPDATED: Section Navigation using layout utilities */}
        <nav className="navigation">
          <ul className="nav-list">
            {FORM_SECTIONS.map((section, index) => (
              <li key={section.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-button ${index === currentSectionIndex ? 'active' : ''}`}
                  onClick={(e) => handleSectionClick(index, e)}
                  disabled={loading || isSubmitting}
                >
                  <span className="nav-icon">{section.icon}</span>
                  <span>{section.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        {/* Global Errors */}
        {errors.submit && (
          <div className="alert alert-error">
            <h4>Submission Error</h4>
            <p>{errors.submit}</p>
          </div>
        )}
        
        {errors.load && (
          <div className="alert alert-error">
            <h4>Loading Error</h4>
            <p>{errors.load}</p>
          </div>
        )}

        {/* ✅ UPDATED: Enhanced form with better event handling */}
        <form 
          onSubmit={handleSubmit} 
          onKeyDown={handleKeyDown}
          noValidate
        >
          <div className="card">
            <div className="card-header">
              <h2 className={styles.sectionHeader}>
                {currentSection.icon} {currentSection.title}
              </h2>
            </div>

            {/* Current Section Component */}
            <CurrentSectionComponent
              formData={formData}
              errors={errors}
              loading={loading || isSubmitting}
              profile={profile}
              onInputChange={handleInputChange}
              onArrayChange={handleArrayChange}
              onRangeChange={handleRangeChange}
              styles={styles} // Pass CSS module to sections
            />

            {/* ✅ UPDATED: Form Actions using dedicated component */}
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
            />
          </div>
        </form>

        {/* Form Completion Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Profile Status</h3>
          </div>
          
          <div className="grid-2">
            <div>
              <strong>Completion:</strong> {completionPercentage}%
              <div className="progress-bar mt-2">
                <div 
                  className="progress-fill" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            
            <div>
              <strong>Profile Active:</strong>{' '}
              <span className={`badge ${formData.isActive ? 'badge-success' : 'badge-warning'}`}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {hasErrors && (
            <div className="alert alert-warning mt-4">
              <strong>Validation Issues:</strong> Please review and correct the highlighted fields before submitting.
              <details className="mt-2">
                <summary>Show validation errors</summary>
                <ul className="mt-2">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="text-sm">
                      <strong>{field}:</strong> {error}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          {completionPercentage < 100 && !editMode && (
            <div className="alert alert-info mt-4">
              <strong>Almost there!</strong> Complete all required fields to activate your profile for matching.
            </div>
          )}

          {editMode && (
            <div className="alert alert-info mt-4">
              <strong>Edit Mode:</strong> Make changes to any section and save your updates.
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Need Help?</h3>
          </div>
          
          <p>
            This comprehensive profile helps us find the best possible roommate matches for your recovery journey. 
            All information is kept confidential and only shared with verified potential matches.
          </p>
          
          <div className="mt-4">
            <button 
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => window.open('/help/matching-profile', '_blank')}
              disabled={loading || isSubmitting}
            >
              View Help Guide
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