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
  const hasErrors = Object.keys(errors).length > 0;

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

  // ✅ ENHANCED: Navigation handlers with improved scrolling
  const handleNext = () => {
    if (currentSectionIndex < FORM_SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      scrollToFirstFormField();
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      scrollToFirstFormField();
    }
  };

  const handleSectionClick = (index) => {
    setCurrentSectionIndex(index);
    scrollToFirstFormField();
  };

  // ✅ FIXED: Improved form submission handlers with better error handling and navigation
  const handleSave = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (loading || isSubmitting) {
      console.log('🚫 Save blocked: already in progress');
      return;
    }
    
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
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading || isSubmitting) {
      console.log('🚫 Submit blocked: already in progress');
      return;
    }
    
    console.log('🔄 Starting final form submission...');
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      // ✅ FIXED: Better validation check with detailed logging
      console.log('🔍 Validating form before submission...');
      const isValid = validateForm();
      console.log('🔍 Form validation result:', isValid);
      console.log('🔍 Current errors:', errors);
      console.log('🔍 Can submit:', canSubmit);
      
      if (!isValid || hasErrors) {
        console.log('❌ Form validation failed or has errors');
        setIsSubmitting(false);
        
        // Scroll to first error with better error detection
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
      
      // ✅ FIXED: Better submission handling with clearer success/failure logic
      const success = await submitForm();
      console.log('🔍 Submit form result:', success);
      
      if (success) {
        console.log('✅ Database submission successful');
        setSuccessMessage('Matching profile completed successfully!');
        
        // ✅ FIXED: Better navigation handling with proper paths
        setTimeout(() => {
          if (editMode && onComplete) {
            console.log('📍 Edit mode: calling onComplete callback');
            onComplete();
          } else if (editMode) {
            console.log('📍 Edit mode: navigating to app dashboard');
            navigate('/app', { 
              state: { message: 'Matching profile updated successfully!' },
              replace: true
            });
          } else {
            console.log('📍 New profile mode: navigating to app dashboard');
            navigate('/app', { 
              state: { message: 'Matching profile completed successfully!' },
              replace: true
            });
          }
        }, 1500);
      } else {
        console.log('❌ Database submission failed');
        setIsSubmitting(false);
        
        // Scroll to first error
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
      
      // Show error to user
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  // ✅ FIXED: Add cancel handler for edit mode
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/app');
    }
  };

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

        {/* ✅ ENHANCED: Section Navigation with improved styling */}
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

        {/* ✅ FIXED: Improved form structure with better event handling */}
        <form onSubmit={handleSubmit} noValidate>
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

            {/* ✅ FIXED: Improved form actions with better button handling */}
            <div className="form-actions">
              {/* Save Progress Button */}
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
              
              {/* Cancel Button (Edit Mode Only) */}
              {editMode && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={loading || isSubmitting}
                >
                  Cancel
                </button>
              )}
              
              {/* Previous Button */}
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
              
              {/* Next / Submit Button */}
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
                  disabled={loading || isSubmitting || (!canSubmit && !editMode)}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner small"></span>
                      {editMode ? 'Updating...' : 'Completing Profile...'}
                    </>
                  ) : (
                    editMode ? 'Update Profile' : 'Complete Profile'
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

// ✅ ENHANCED: Improved CSS for tab navigation with 2-line support and borders
const additionalStyles = `
/* ✅ FIXED: Enhanced Section Navigation with 2-line support and borders */
.navigation {
  background: white;
  border-bottom: 2px solid var(--border-beige);
  padding: 0;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  overflow: hidden;
}

.navigation .nav-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  list-style: none;
  margin: 0;
  padding: 0;
}

.navigation .nav-item {
  position: relative;
}

.navigation .nav-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 10px;
  right: 0;
  bottom: 10px;
  width: 1px;
  background: var(--border-beige);
  z-index: 1;
}

.navigation .nav-button {
  width: 100%;
  min-height: 80px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray-600);
  transition: var(--transition-normal);
  border-bottom: 3px solid transparent;
  white-space: normal;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  line-height: 1.3;
  text-align: center;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%);
  border-top: 1px solid transparent;
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
}

.navigation .nav-button:hover:not(:disabled) {
  color: var(--primary-purple);
  background: linear-gradient(135deg, rgba(160, 32, 240, 0.04) 0%, rgba(160, 32, 240, 0.02) 100%);
  border-top-color: var(--primary-purple);
  border-left-color: rgba(160, 32, 240, 0.2);
  border-right-color: rgba(160, 32, 240, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(160, 32, 240, 0.1);
}

.navigation .nav-button.active {
  color: var(--primary-purple);
  border-bottom-color: var(--primary-purple);
  background: linear-gradient(135deg, rgba(160, 32, 240, 0.08) 0%, rgba(160, 32, 240, 0.04) 100%);
  border-top-color: var(--primary-purple);
  border-left-color: var(--primary-purple);
  border-right-color: var(--primary-purple);
  font-weight: 700;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(160, 32, 240, 0.15);
  z-index: 2;
}

.navigation .nav-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.navigation .nav-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* ✅ ENHANCED: Form actions styling */
.form-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-beige);
}

.form-actions .btn {
  min-width: 120px;
}

.form-actions .btn:first-child {
  margin-right: auto;
}

/* ✅ ENHANCED: Loading and error states */
.loading-spinner.small {
  width: 14px;
  height: 14px;
  margin-right: 0.5rem;
}

.error input,
.error select,
.error textarea {
  border-color: var(--coral) !important;
  background-color: #fff5f5;
}

.alert-error input,
.alert-error select, 
.alert-error textarea {
  border-color: var(--coral) !important;
}

details summary {
  cursor: pointer;
  font-weight: 500;
}

details[open] summary {
  margin-bottom: 0.5rem;
}

/* ✅ RESPONSIVE: Better responsive behavior for tabs */
@media (max-width: 768px) {
  .navigation .nav-list {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .navigation .nav-button {
    min-height: 70px;
    padding: 10px 12px;
    font-size: 0.8rem;
    gap: 4px;
  }
  
  .navigation .nav-icon {
    font-size: 1rem;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-actions .btn:first-child {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 480px) {
  .navigation .nav-list {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .navigation .nav-button {
    min-height: 65px;
    padding: 8px 10px;
    font-size: 0.75rem;
  }
  
  .navigation .nav-icon {
    font-size: 0.9rem;
  }
}
`;

// Inject additional styles
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('enhanced-matching-form-styles');
  if (!existingStyle) {
    const styleElement = document.createElement('style');
    styleElement.id = 'enhanced-matching-form-styles';
    styleElement.textContent = additionalStyles;
    document.head.appendChild(styleElement);
  }
}

export default EnhancedMatchingProfileForm;