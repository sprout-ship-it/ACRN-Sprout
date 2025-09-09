// src/components/forms/EnhancedMatchingProfileForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMatchingProfileForm } from './hooks/useMatchingProfileForm';

// Import form components
import FormActions from './components/FormActions';
import ProgressBar from './components/ProgressBar';

// Import all section components
import PersonalInfoSection from './sections/PersonalInfoSection';
import LocationPreferencesSection from './sections/LocationPreferencesSection';
import RecoveryInfoSection from './sections/RecoveryInfoSection';
import RoommatePreferencesSection from './sections/RoommatePreferencesSection';
import LifestylePreferencesSection from './sections/LifestylePreferencesSection';
import CompatibilitySection from './sections/CompatibilitySection';

// Import styles
import './styles/EnhancedMatchingForm.css';

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

const EnhancedMatchingProfileForm = () => {
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
              onClick={() => navigate('/dashboard')}
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
  const hasErrors = Object.keys(errors).length > 0;

  // Navigation handlers
  const handleNext = () => {
    if (currentSectionIndex < FORM_SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSectionClick = (index) => {
    setCurrentSectionIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ FIXED: Form submission handlers with proper error handling
  const handleSave = async (e) => {
    e.preventDefault();
    if (loading || isSubmitting) return;
    
    setSuccessMessage('');
    console.log('🔄 Saving progress...');
    
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isSubmitting) return;
    
    console.log('🔄 Starting final form submission...');
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      // First validate the form
      if (!validateForm()) {
        console.log('❌ Form validation failed');
        setIsSubmitting(false);
        // Scroll to first error
        const firstError = document.querySelector('.border-red-500, .text-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      console.log('✅ Form validation passed, submitting to database...');
      
      // Submit the form with navigation callback
      const success = await submitForm();
      
      if (success) {
        console.log('✅ Database submission successful, navigating...');
        setSuccessMessage('Matching profile completed successfully!');
        
        // Delay navigation to show success message
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { message: 'Matching profile completed successfully!' }
          });
        }, 1500);
      } else {
        console.log('❌ Database submission failed');
        setIsSubmitting(false);
        
        // Scroll to first error
        const firstError = document.querySelector('.border-red-500, .text-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } catch (error) {
      console.error('💥 Submission error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="app-header">
        <h1 className="header-title">Enhanced Matching Profile</h1>
        <p className="header-subtitle">
          Complete your comprehensive profile to find the perfect roommate match
        </p>
      </div>

      <div className="content">
        {/* Progress Indicator */}
        <ProgressBar 
          percentage={completionPercentage}
          showText={true}
          editMode={false}
          label={`Section ${currentSectionIndex + 1} of ${FORM_SECTIONS.length}`}
        />

        {/* Section Navigation */}
        <nav className="navigation">
          <ul className="nav-list">
            {FORM_SECTIONS.map((section, index) => (
              <li key={section.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-button ${index === currentSectionIndex ? 'active' : ''}`}
                  onClick={() => handleSectionClick(index)}
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
            {errors.submit}
          </div>
        )}
        
        {errors.load && (
          <div className="alert alert-error">
            {errors.load}
          </div>
        )}

        {/* ✅ FIXED: Form with proper event handling */}
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header">
              <h2 className="section-header">
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
            />

            {/* ✅ FIXED: Form Actions without onClick on submit button */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-outline"
                disabled={loading || isSubmitting}
              >
                {(loading && !isSubmitting) ? (
                  <>
                    <span className="loading-spinner small"></span>
                    Saving...
                  </>
                ) : (
                  'Save Progress'
                )}
              </button>
              
              {!isFirstSection && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="btn btn-secondary"
                  disabled={loading || isSubmitting}
                >
                  Previous
                </button>
              )}
              
              {!isLastSection ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                  disabled={loading || isSubmitting}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || isSubmitting || !canSubmit || hasErrors}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner small"></span>
                      Completing Profile...
                    </>
                  ) : (
                    'Complete Profile'
                  )}
                </button>
              )}
            </div>
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
            </div>
          )}

          {completionPercentage < 100 && (
            <div className="alert alert-info mt-4">
              <strong>Almost there!</strong> Complete all required fields to activate your profile for matching.
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
              onClick={() => navigate('/help/matching-profile')}
              disabled={loading || isSubmitting}
            >
              View Help Guide
            </button>
            <button 
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/dashboard')}
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