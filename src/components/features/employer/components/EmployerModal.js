// src/components/features/employer/components/EmployerModal.js - TABBED WITH ALL SCHEMA FIELDS
import React, { useEffect, useState } from 'react';
import { 
  formatFeature, 
  formatBusinessType, 
  formatRemoteWork, 
  formatIndustry,
  formatDrugTestingPolicy,
  formatBackgroundCheckPolicy,
  formatCompanySize
} from '../utils/employerUtils';
import styles from './EmployerModal.module.css';

const EmployerModal = ({ 
  isOpen,
  employer, 
  connectionStatus,
  isFavorited = false,
  onClose,
  onConnect, // Keep for future use
  onToggleFavorite 
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render if not open or no employer
  if (!isOpen || !employer) return null;

  // Handle modal backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Main action is favorites
  const handleMainAction = () => {
    console.log('🎯 Main action - toggling favorite for employer:', {
      employer_id: employer.id,
      employer_user_id: employer.user_id,
      company_name: employer.company_name,
      currently_favorited: isFavorited
    });
    onToggleFavorite(employer.user_id);
  };

  // Keep the header favorite toggle separate  
  const handleHeaderFavoriteToggle = () => {
    console.log('❤️ Header favorite toggle for employer:', {
      employer_user_id: employer.user_id,
      company_name: employer.company_name
    });
    onToggleFavorite(employer.user_id);
  };

  const isConnected = connectionStatus?.type === 'connected';
  const isNotHiring = !employer.is_actively_hiring;

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏢' },
    { id: 'employment', label: 'Employment', icon: '💼' },
    { id: 'culture', label: 'Culture & Values', icon: '🤝' },
    { id: 'contact', label: 'Contact & Apply', icon: '📞' }
  ];

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={`modal-content ${styles.employerModal}`} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.companyHeader}>
              <h2 className={`modal-title ${styles.modalTitle}`}>{employer.company_name}</h2>
              <div className={styles.companySubtitle}>
                {formatIndustry(employer.industry)} • {employer.city}, {employer.state}
              </div>
            </div>
            
            <div className={styles.headerActions}>
              {/* Header Favorite Button */}
              <button
                className={`${styles.favoriteBtn} ${isFavorited ? styles.favorited : ''}`}
                onClick={handleHeaderFavoriteToggle}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorited ? '❤️' : '🤍'}
              </button>
              
              {/* Close Button */}
              <button className={`modal-close ${styles.modalClose}`} onClick={onClose}>
                ×
              </button>
            </div>
          </div>

          {/* Status Badges */}
          <div className={styles.statusBadges}>
            {employer.is_actively_hiring ? (
              <span className="badge badge-success">🟢 Actively Hiring</span>
            ) : (
              <span className="badge badge-warning">⏸️ Not Currently Hiring</span>
            )}
            
            {isConnected && (
              <span className="badge badge-info">✅ Connected</span>
            )}
            
            {isFavorited && (
              <span className={`badge ${styles.badgeFavorited}`}>❤️ Favorited</span>
            )}
          </div>

          {/* Tab Navigation */}
          <div className={styles.tabNavigation}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {/* Favorited Status Alert */}
          {isFavorited && (
            <div className={`alert alert-success ${styles.connectionAlert}`}>
              <strong>❤️ Favorited:</strong> This employer has been added to your favorites list. 
              You can find them easily in your saved employers.
            </div>
          )}

          {/* Tab Content */}
          <div className={styles.tabContent}>
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className={styles.tabPanel}>
                {/* Company Information */}
                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>🏢 Company Information</h4>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Industry:</span>
                      <span className={styles.infoValue}>{formatIndustry(employer.industry)}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Business Type:</span>
                      <span className={styles.infoValue}>{formatBusinessType(employer.business_type)}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Company Size:</span>
                      <span className={styles.infoValue}>{formatCompanySize(employer.company_size)}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Founded:</span>
                      <span className={styles.infoValue}>{employer.founded_year || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>📍 Location</h4>
                  <div className={styles.infoGrid}>
                    {employer.address && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Address:</span>
                        <span className={styles.infoValue}>{employer.address}</span>
                      </div>
                    )}
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>City, State:</span>
                      <span className={styles.infoValue}>{employer.city}, {employer.state}</span>
                    </div>
                    {employer.zip_code && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Zip Code:</span>
                        <span className={styles.infoValue}>{employer.zip_code}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Additional Locations */}
                  {employer.additional_locations && Array.isArray(employer.additional_locations) && employer.additional_locations.length > 0 && (
                    <div className={styles.additionalInfo}>
                      <strong>Additional Locations:</strong>
                      <ul className={styles.locationList}>
                        {employer.additional_locations.map((location, index) => (
                          <li key={index}>{location}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Company Description */}
                {employer.description && (
                  <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>📝 About the Company</h4>
                    <div className={styles.descriptionContent}>
                      <p>{employer.description}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EMPLOYMENT */}
            {activeTab === 'employment' && (
              <div className={styles.tabPanel}>
                {/* Work Arrangements */}
                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>💻 Work Arrangements</h4>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Remote Work:</span>
                      <span className={styles.infoValue}>
                        {employer.remote_work_options ? formatRemoteWork(employer.remote_work_options) : 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Job Types Available */}
                {employer.job_types_available?.length > 0 && (
                  <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>
                      💼 Job Types Available ({employer.job_types_available.length})
                    </h4>
                    <div className={styles.featureTags}>
                      {employer.job_types_available.map((jobType, index) => (
                        <span key={index} className={`badge badge-success ${styles.jobOpening}`}>
                          {formatFeature(jobType)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits Offered */}
                {employer.benefits_offered?.length > 0 && (
                  <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>
                      💰 Benefits Offered ({employer.benefits_offered.length})
                    </h4>
                    <div className={styles.featureTags}>
                      {employer.benefits_offered.map((benefit, index) => (
                        <span key={index} className={`badge badge-warning ${styles.benefit}`}>
                          {formatFeature(benefit)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Employment Policies */}
                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>📋 Employment Policies</h4>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Drug Testing Policy:</span>
                      <span className={styles.infoValue}>
                        {formatDrugTestingPolicy(employer.drug_testing_policy)}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Background Check Policy:</span>
                      <span className={styles.infoValue}>
                        {formatBackgroundCheckPolicy(employer.background_check_policy)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hiring Practices */}
                {employer.hiring_practices && (
                  <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>🎯 Hiring Practices</h4>
                    <div className={styles.descriptionContent}>
                      <p>{employer.hiring_practices}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CULTURE & VALUES */}
            {activeTab === 'culture' && (
              <div className={styles.tabPanel}>
                {/* Recovery-Friendly Features */}
                {employer.recovery_friendly_features?.length > 0 && (
                  <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>
                      🤝 Recovery-Friendly Features ({employer.recovery_friendly_features.length})
                    </h4>
                    <div className={styles.featureTags}>
                      {employer.recovery_friendly_features.map((feature, index) => (
                        <span key={index} className={`badge badge-info ${styles.recoveryFeature}`}>
                          {formatFeature(feature)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Company Culture */}
                {employer.company_culture && (
                  <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>🌟 Company Culture</h4>
                    <div className={styles.descriptionContent}>
                      <p>{employer.company_culture}</p>
                    </div>
                  </div>
                )}

                {/* Diversity Commitment */}
                {employer.diversity_commitment && (
                  <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>🌈 Diversity & Inclusion Commitment</h4>
                    <div className={styles.descriptionContent}>
                      <p>{employer.diversity_commitment}</p>
                    </div>
                  </div>
                )}

                {/* Accommodation Policies */}
                {employer.accommodation_policies && (
                  <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>♿ Accommodation Policies</h4>
                    <div className={styles.descriptionContent}>
                      <p>{employer.accommodation_policies}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: CONTACT & APPLY */}
            {activeTab === 'contact' && (
              <div className={styles.tabPanel}>
                {/* Application Process */}
                {employer.application_process && (
                  <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>📋 How to Apply</h4>
                    <div className={styles.descriptionContent}>
                      <p>{employer.application_process}</p>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>📞 Contact Information</h4>
                  <div className={styles.nextStepsContent}>
                    <div className="alert alert-info">
                      <strong>💼 How to Contact This Employer:</strong>
                      <div className={styles.contactMethodsList}>
                        {employer.contact_email && (
                          <div className={styles.contactMethod}>
                            <span className={styles.contactLabel}>📧 Email:</span>
                            <a href={`mailto:${employer.contact_email}`} className={styles.contactLink}>
                              {employer.contact_email}
                            </a>
                          </div>
                        )}
                        {employer.phone && (
                          <div className={styles.contactMethod}>
                            <span className={styles.contactLabel}>📞 Phone:</span>
                            <a href={`tel:${employer.phone}`} className={styles.contactLink}>
                              {employer.phone}
                            </a>
                          </div>
                        )}
                        {employer.website && (
                          <div className={styles.contactMethod}>
                            <span className={styles.contactLabel}>🌐 Website:</span>
                            <a href={employer.website} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                              {employer.website}
                            </a>
                          </div>
                        )}
                        {employer.contact_person && (
                          <div className={styles.contactMethod}>
                            <span className={styles.contactLabel}>👤 Contact Person:</span>
                            <span className={styles.contactValue}>{employer.contact_person}</span>
                          </div>
                        )}
                        {employer.preferred_contact_method && (
                          <div className={styles.preferredMethod}>
                            <strong>Preferred Contact Method:</strong> {formatFeature(employer.preferred_contact_method)}
                          </div>
                        )}
                      </div>
                      
                      {isNotHiring && (
                        <div className={styles.warningNote}>
                          <strong>Note:</strong> This employer is not currently marked as actively hiring, 
                          but you can still reach out for future opportunities.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <div className={styles.footerActions}>
            <button
              className="btn btn-outline"
              onClick={onClose}
            >
              Close
            </button>
            
            {/* Main Action: Add/Remove from Favorites */}
            <button
              className={`btn ${isFavorited ? 'btn-warning' : 'btn-primary'}`}
              onClick={handleMainAction}
            >
              {isFavorited ? (
                <>💔 Remove from Favorites</>
              ) : (
                <>❤️ Add to Favorites</>
              )}
            </button>
          </div>
          
          {/* Action hint */}
          <div className={styles.actionHint}>
            <small className="text-muted">
              {isFavorited 
                ? "This employer is saved to your favorites list" 
                : "Save this employer to easily find them later"
              }
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerModal;