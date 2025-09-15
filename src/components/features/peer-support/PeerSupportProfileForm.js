// src/components/forms/PeerSupportProfileForm.js
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { usePeerSupportProfileForm } from './hooks/usePeerSupportProfileForm';

// Import section components
import ContactInfoSection from './sections/ContactInfoSection';
import ProfessionalInfoSection from './sections/ProfessionalInfoSection';
import ServiceInfoSection from './sections/ServiceInfoSection';
import AboutSection from './sections/AboutSection';
import ServiceSettingsSection from './sections/ServiceSettingsSection';

// Import shared components
import LoadingSpinner from '../../ui/LoadingSpinner';

const FORM_SECTIONS = [
  {
    id: 'contact',
    title: 'Contact Information',
    component: ContactInfoSection,
    icon: '📞'
  },
  {
    id: 'professional',
    title: 'Professional Information',
    component: ProfessionalInfoSection,
    icon: '🎓'
  },
  {
    id: 'services',
    title: 'Services & Specialties',
    component: ServiceInfoSection,
    icon: '🤝'
  },
  {
    id: 'about',
    title: 'About You',
    component: AboutSection,
    icon: '💫'
  },
  {
    id: 'settings',
    title: 'Service Settings',
    component: ServiceSettingsSection,
    icon: '⚙️'
  }
];

const PeerSupportProfileForm = ({ editMode = false, onComplete, onCancel }) => {
  const { hasRole } = useAuth();
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
    submitForm,
    setSuccessMessage
  } = usePeerSupportProfileForm({ editMode, onComplete });

  // Authorization check
  if (!hasRole('peer')) {
    return (
      <div className="alert alert-info">
        <p>Peer support profiles are only available for peer support specialists.</p>
      </div>
    );
  }

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <LoadingSpinner message="Loading your profile..." />
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (loading || isSubmitting) return;
    
    setSuccessMessage('');
    const success = await submitForm(false); // false = save progress
    if (success) {
      setSuccessMessage('Progress saved successfully!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isSubmitting) return;
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      const success = await submitForm(true); // true = final submit
      if (success && onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="form-title">
          {editMode ? 'Edit Your Peer Support Profile' : 'Create Your Peer Support Profile'}
        </h2>
        <p className="text-gray-600">
          Share your experience and approach to help others find the right peer support.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="progress-indicator mb-4">
        <div className="progress-title">
          Profile Completion: {completionPercentage}%
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Section Navigation */}
      <nav className="navigation mb-4">
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

      {/* Messages */}
      {errors.submit && (
        <div className="alert alert-error mb-4">{errors.submit}</div>
      )}
      
      {successMessage && (
        <div className="alert alert-success mb-4">{successMessage}</div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <h3 className="section-header">
              {currentSection.icon} {currentSection.title}
            </h3>
          </div>

          {/* Current Section Component */}
          <CurrentSectionComponent
            formData={formData}
            errors={errors}
            loading={loading || isSubmitting}
            onInputChange={handleInputChange}
            onArrayChange={handleArrayChange}
          />

          {/* Form Actions - Inline like EnhancedMatchingProfileForm */}
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
                  editMode ? 'Update Profile' : 'Complete Profile'
                )}
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={onCancel}
                disabled={loading || isSubmitting}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Form Status */}
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
            <strong>Accepting Clients:</strong>{' '}
            <span className={`badge ${formData.is_accepting_clients ? 'badge-success' : 'badge-warning'}`}>
              {formData.is_accepting_clients ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {hasErrors && (
          <div className="alert alert-warning mt-4">
            <strong>Validation Issues:</strong> Please review and correct the highlighted fields before submitting.
          </div>
        )}

        {completionPercentage < 80 && (
          <div className="alert alert-info mt-4">
            <strong>Almost there!</strong> Complete all required fields to activate your profile for client matching.
          </div>
        )}
      </div>
    </div>
  );
};

export default PeerSupportProfileForm;