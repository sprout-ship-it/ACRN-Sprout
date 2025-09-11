// src/components/forms/PeerSupportProfileForm.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePeerSupportProfileForm } from './hooks/usePeerSupportProfileForm';

// Import section components
import ContactInfoSection from './sections/peer-support/ContactInfoSection';
import ProfessionalInfoSection from './sections/peer-support/ProfessionalInfoSection';
import ServiceInfoSection from './sections/peer-support/ServiceInfoSection';
import AboutSection from './sections/peer-support/AboutSection';
import ServiceSettingsSection from './sections/peer-support/ServiceSettingsSection';

// Import shared components
import FormActions from './components/FormActions';
import LoadingSpinner from '../common/LoadingSpinner';

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
  
  const {
    formData,
    errors,
    loading,
    initialLoading,
    successMessage,
    completionPercentage,
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
    if (loading) return;
    
    setSuccessMessage('');
    const success = await submitForm(false); // false = save progress
    if (success) {
      setSuccessMessage('Progress saved successfully!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setSuccessMessage('');
    const success = await submitForm(true); // true = final submit
    if (success && onComplete) {
      setTimeout(() => onComplete(), 1500);
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
                disabled={loading}
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
            loading={loading}
            onInputChange={handleInputChange}
            onArrayChange={handleArrayChange}
          />

          {/* Form Actions */}
          <FormActions
            onSave={handleSave}
            onPrevious={!isFirstSection ? handlePrevious : null}
            onNext={!isLastSection ? handleNext : null}
            onSubmit={isLastSection ? handleSubmit : null}
            onCancel={onCancel}
            loading={loading}
            submitText={editMode ? 'Update Profile' : 'Complete Profile'}
            canSubmit={completionPercentage >= 80}
          />
        </div>
      </form>
    </div>
  );
};

export default PeerSupportProfileForm;