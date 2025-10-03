// src/components/features/peer-support/PeerSupportProfileForm.js - UPDATED WITH CSS MODULE
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

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../styles/main.css';
import styles from './PeerSupportProfileForm.module.css';

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
  const { user, profile, hasRole } = useAuth(); // ✅ Add user and profile
  console.log('🔍 Form useAuth state:', {
    userId: user?.id,
    profileId: profile?.id,
    authTimestamp: Date.now()
  });
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
  console.log('🎯 PeerSupportProfileForm rendering:', {
    initialLoading,
    hasErrors: Object.keys(errors).length > 0,
    errors: errors,
    formDataReady: !!formData,
    canRender: !initialLoading && Object.keys(errors).length === 0
  });
  // Authorization check
  if (!hasRole('peer')) {
    return (
      <div className="content">
        <div className={styles.authMessage}>
          <p>Peer support profiles are only available for peer support specialists.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (initialLoading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
          <div className={styles.loadingMessage}>Loading your profile...</div>
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
  if (initialLoading) {
    console.log('🎯 Form showing loading spinner');
    return <LoadingSpinner message="Loading your profile..." />;
  }

  if (Object.keys(errors).length > 0) {
    console.log('🎯 Form has errors, might not render properly:', errors);
  }
  return (
    <div className="content">
      <div className={styles.formContainer}>
        {/* ✅ UPDATED: Header using CSS module */}
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            {editMode ? 'Edit Your Peer Support Profile' : 'Create Your Peer Support Profile'}
          </h2>
          <p className={styles.formSubtitle}>
            Share your experience and approach to help others find the right peer support.
          </p>
        </div>

        {/* ✅ UPDATED: Progress Indicator using CSS module */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <div className={styles.progressTitle}>Profile Completion</div>
            <div className={styles.progressPercentage}>{completionPercentage}%</div>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* ✅ UPDATED: Section Navigation using CSS module */}
        <nav className={styles.sectionNavigation}>
          <ul className={styles.navList}>
            {FORM_SECTIONS.map((section, index) => (
              <li key={section.id} className={styles.navItem}>
                <button
                  type="button"
                  className={`${styles.navButton} ${index === currentSectionIndex ? styles.active : ''}`}
                  onClick={() => handleSectionClick(index)}
                  disabled={loading || isSubmitting}
                >
                  <span className={styles.navIcon}>{section.icon}</span>
                  <span className={styles.navLabel}>{section.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ✅ UPDATED: Messages using CSS module */}
        {(errors.submit || successMessage) && (
          <div className={styles.messageContainer}>
            {errors.submit && (
              <div className={styles.messageError}>{errors.submit}</div>
            )}
            
            {successMessage && (
              <div className={styles.messageSuccess}>{successMessage}</div>
            )}
          </div>
        )}

        {/* ✅ UPDATED: Form using CSS module */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            <div className={`${styles.sectionContainer} ${styles.sectionActive}`}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  {currentSection.icon} {currentSection.title}
                </h3>
              </div>

              <div className={styles.sectionBody}>
                {/* Current Section Component */}
                <CurrentSectionComponent
                  formData={formData}
                  errors={errors}
                  loading={loading || isSubmitting}
                  onInputChange={handleInputChange}
                  onArrayChange={handleArrayChange}
                />
              </div>
            </div>
          </div>

          {/* ✅ UPDATED: Form Actions using CSS module */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleSave}
              className={`${styles.actionButton} ${styles.actionOutline}`}
              disabled={loading || isSubmitting}
            >
              {(loading && !isSubmitting) ? (
                <span className={styles.loadingText}>
                  <span className={styles.loadingSpinner}></span>
                  Saving...
                </span>
              ) : (
                'Save Progress'
              )}
            </button>
            
            {!isFirstSection && (
              <button
                type="button"
                onClick={handlePrevious}
                className={`${styles.actionButton} ${styles.actionSecondary}`}
                disabled={loading || isSubmitting}
              >
                Previous
              </button>
            )}
            
            {!isLastSection ? (
              <button
                type="button"
                onClick={handleNext}
                className={`${styles.actionButton} ${styles.actionPrimary}`}
                disabled={loading || isSubmitting}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className={`${styles.actionButton} ${styles.actionPrimary}`}
                disabled={loading || isSubmitting || !canSubmit || hasErrors}
              >
                {isSubmitting ? (
                  <span className={styles.loadingText}>
                    <span className={styles.loadingSpinner}></span>
                    Completing Profile...
                  </span>
                ) : (
                  editMode ? 'Update Profile' : 'Complete Profile'
                )}
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                className={`${styles.actionButton} ${styles.actionOutline}`}
                onClick={onCancel}
                disabled={loading || isSubmitting}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ✅ UPDATED: Form Status using CSS module */}
      <div className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <h3 className={styles.statusTitle}>Profile Status</h3>
        </div>
        
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>Completion Progress</div>
            <div className={styles.statusValue}>
              <div className={styles.statusProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <div className={styles.statusProgressText}>{completionPercentage}%</div>
            </div>
          </div>
          
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>Accepting Clients</div>
            <div className={styles.statusValue}>
              <span className={formData.is_accepting_clients ? styles.acceptingClientsActive : styles.acceptingClientsInactive}>
                {formData.is_accepting_clients ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {hasErrors && (
          <div className={styles.validationWarning}>
            <strong>Validation Issues:</strong> Please review and correct the highlighted fields before submitting.
          </div>
        )}

        {completionPercentage < 80 && (
          <div className={styles.completionInfo}>
            <strong>Almost there!</strong> Complete all required fields to activate your profile for client matching.
          </div>
        )}
      </div>
    </div>
  );
};

export default PeerSupportProfileForm;