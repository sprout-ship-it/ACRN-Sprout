// src/components/features/employer/components/EmployerModal.js
import React, { useEffect } from 'react';
import { 
  formatFeature, 
  formatBusinessType, 
  formatRemoteWork, 
  formatIndustry,
  getContactInfo
} from '../utils/employerUtils';
import styles from './EmployerModal.module.css';

const EmployerModal = ({ 
  isOpen,
  employer, 
  connectionStatus,
  isFavorited = false,
  onClose,
  onConnect,
  onToggleFavorite 
}) => {
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

  // Handle action buttons
  const handleConnect = () => {
    onConnect(employer);
  };

  const handleFavoriteToggle = () => {
    onToggleFavorite(employer.user_id);
  };

  const isConnected = connectionStatus?.type === 'connected';
  const isNotHiring = !employer.is_actively_hiring;

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
              {/* Favorite Button */}
              <button
                className={`${styles.favoriteBtn} ${isFavorited ? styles.favorited : ''}`}
                onClick={handleFavoriteToggle}
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
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {/* Connection Status Alert */}
          {isConnected && (
            <div className={`alert alert-success ${styles.connectionAlert}`}>
              <strong>✅ Connected:</strong> You have an active employment connection with this employer. 
              Contact information is available below.
            </div>
          )}

          {/* Company Overview */}
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
                <span className={styles.infoValue}>{employer.company_size || 'Not specified'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Founded:</span>
                <span className={styles.infoValue}>{employer.founded_year || 'Not specified'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Location:</span>
                <span className={styles.infoValue}>{employer.city}, {employer.state}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Remote Work:</span>
                <span className={styles.infoValue}>
                  {employer.remote_work_options ? formatRemoteWork(employer.remote_work_options) : 'Not specified'}
                </span>
              </div>
            </div>
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

          {/* ✅ FIXED: Job Types Available instead of Current Job Openings */}
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
          {isConnected ? (
            <div className={`${styles.infoSection} ${styles.contactSection}`}>
              <h4 className={styles.sectionTitle}>📞 Contact Information</h4>
              <div className={styles.contactInfo}>
                <div className={styles.contactGrid}>
                  {employer.contact_email && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>📧 Email:</span>
                      <a href={`mailto:${employer.contact_email}`} className={styles.contactLink}>
                        {employer.contact_email}
                      </a>
                    </div>
                  )}
                  {employer.phone && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>📞 Phone:</span>
                      <a href={`tel:${employer.phone}`} className={styles.contactLink}>
                        {employer.phone}
                      </a>
                    </div>
                  )}
                  {employer.website && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>🌐 Website:</span>
                      <a href={employer.website} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                        {employer.website}
                      </a>
                    </div>
                  )}
                  {employer.contact_person && (
                    <div className={styles.contactItem}>
                      <span className={styles.contactLabel}>👤 Contact Person:</span>
                      <span className={styles.contactValue}>{employer.contact_person}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>🔗 Next Steps</h4>
              <div className={styles.nextStepsContent}>
                <div className="alert alert-info">
                  <strong>💼 Employment Connection Process:</strong>
                  <ol className={styles.processList}>
                    <li>Send employment inquiry to express interest in opportunities</li>
                    <li>Employer reviews your request and profile</li>
                    <li>If approved, contact information is exchanged automatically</li>
                    <li>Proceed with their application process or schedule interviews</li>
                  </ol>
                  {isNotHiring && (
                    <p className={styles.warningNote}>
                      <strong>Note:</strong> This employer is not currently marked as actively hiring, 
                      but you can still send an inquiry for future opportunities.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
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
            
            {!isConnected ? (
              <button
                className={`btn ${isNotHiring ? 'btn-outline' : 'btn-secondary'}`}
                onClick={handleConnect}
              >
                {isNotHiring ? (
                  <>📩 Send Inquiry</>
                ) : (
                  <>💼 Connect Now</>
                )}
              </button>
            ) : (
              <div className={styles.connectedStatus}>
                <span className={styles.successIcon}>✅</span>
                <span className="connected-text">Already Connected</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerModal;