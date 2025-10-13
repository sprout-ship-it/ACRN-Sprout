// src/components/features/connections/modals/EmployerDetailsModal.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './EmployerDetailsModal.module.css';

const EmployerDetailsModal = ({
  isOpen,
  employer,
  connectionStatus,
  onClose,
  onContact,
  onConnect,
  showContactInfo = false
}) => {
  if (!isOpen || !employer) return null;

  /**
   * Format business type display
   */
  const formatBusinessType = (type) => {
    if (!type) return 'Business';
    return type.replace(/_/g, ' ').split(' ').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  };

  /**
   * Format remote work options
   */
  const formatRemoteWork = (option) => {
    if (!option) return 'Not specified';
    const optionMap = {
      'fully_remote': 'Fully Remote',
      'hybrid': 'Hybrid',
      'onsite': 'On-site',
      'flexible': 'Flexible'
    };
    return optionMap[option] || option.replace(/_/g, ' ');
  };

  /**
   * Get header gradient based on hiring status
   */
  const getHeaderGradient = () => {
    if (employer.is_actively_hiring) {
      return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    }
    return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>×</button>
        
        <div className={styles.modalBody}>
          {/* Employer Header */}
          <div className={styles.employerHeader} style={{ background: getHeaderGradient() }}>
            <div className={styles.employerHeaderContent}>
              <div className={styles.employerIcon}>💼</div>
              <div className={styles.employerHeaderInfo}>
                <h2 className={styles.employerTitle}>
                  {employer.company_name || 'Company'}
                </h2>
                <div className={styles.employerSubtitle}>
                  {employer.industry}
                  {employer.city && employer.state && (
                    <span> • {employer.city}, {employer.state}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className={styles.badgeSection}>
            {connectionStatus && (
              <span className={`badge ${connectionStatus === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {connectionStatus}
              </span>
            )}
            {employer.is_actively_hiring ? (
              <span className="badge badge-success">🟢 Actively Hiring</span>
            ) : (
              <span className="badge badge-warning">⏸️ Not Currently Hiring</span>
            )}
            {employer.recovery_friendly_features && employer.recovery_friendly_features.length > 0 && (
              <span className="badge badge-success">🤝 Recovery Friendly</span>
            )}
          </div>

          {/* Company Overview */}
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Company Overview</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🏢</span>
                <div>
                  <div className={styles.infoLabel}>Business Type</div>
                  <div className={styles.infoValue}>{formatBusinessType(employer.business_type)}</div>
                </div>
              </div>

              {employer.company_size && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>👥</span>
                  <div>
                    <div className={styles.infoLabel}>Company Size</div>
                    <div className={styles.infoValue}>{employer.company_size} employees</div>
                  </div>
                </div>
              )}

              {employer.founded_year && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📅</span>
                  <div>
                    <div className={styles.infoLabel}>Founded</div>
                    <div className={styles.infoValue}>{employer.founded_year}</div>
                  </div>
                </div>
              )}

              {employer.remote_work_options && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>💻</span>
                  <div>
                    <div className={styles.infoLabel}>Remote Work</div>
                    <div className={styles.infoValue}>{formatRemoteWork(employer.remote_work_options)}</div>
                  </div>
                </div>
              )}

              {employer.city && employer.state && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📍</span>
                  <div>
                    <div className={styles.infoLabel}>Location</div>
                    <div className={styles.infoValue}>{employer.city}, {employer.state}</div>
                  </div>
                </div>
              )}

              {employer.industry && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🏭</span>
                  <div>
                    <div className={styles.infoLabel}>Industry</div>
                    <div className={styles.infoValue}>{employer.industry}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Types Available */}
          {employer.job_types_available && employer.job_types_available.length > 0 && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>💼 Job Types Available</h4>
              <div className={styles.tagList}>
                {employer.job_types_available.map((type, i) => (
                  <span key={i} className={`${styles.tag} ${styles.tagSuccess}`}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recovery-Friendly Features */}
          {employer.recovery_friendly_features && employer.recovery_friendly_features.length > 0 && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>🤝 Recovery-Friendly Features</h4>
              <div className={styles.tagList}>
                {employer.recovery_friendly_features.map((feature, i) => (
                  <span key={i} className={`${styles.tag} ${styles.tagInfo}`}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits Offered */}
          {employer.benefits_offered && employer.benefits_offered.length > 0 && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>✨ Benefits Offered</h4>
              <div className={styles.tagList}>
                {employer.benefits_offered.map((benefit, i) => (
                  <span key={i} className={styles.tag}>
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Company Description */}
          {employer.description && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>📝 About the Company</h4>
              <p className={styles.bioText}>{employer.description}</p>
            </div>
          )}

          {/* Company Culture */}
          {employer.company_culture && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>🌟 Company Culture</h4>
              <p className={styles.bioText}>{employer.company_culture}</p>
            </div>
          )}

          {/* Application Process */}
          {employer.application_process && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>📋 Application Process</h4>
              <p className={styles.bioText}>{employer.application_process}</p>
            </div>
          )}

          {/* Contact Info - Only if connection is active */}
          {showContactInfo && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>📞 Contact Information</h4>
              <div className={styles.contactInfo}>
                {employer.registrant_profiles && (employer.registrant_profiles.first_name || employer.registrant_profiles.last_name) && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>👤</span>
                    <div>
                      <div className={styles.contactLabel}>Contact Person</div>
                      <div className={styles.contactValue}>
                        {employer.registrant_profiles.first_name || ''} 
                        {employer.registrant_profiles.last_name && 
                          ` ${employer.registrant_profiles.last_name.charAt(0)}.`
                        }
                      </div>
                    </div>
                  </div>
                )}

                {employer.phone && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>📱</span>
                    <div>
                      <div className={styles.contactLabel}>Phone</div>
                      <a href={`tel:${employer.phone}`} className={styles.contactValue}>
                        {employer.phone}
                      </a>
                    </div>
                  </div>
                )}

                {(employer.contact_email || employer.registrant_profiles?.email) && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>📧</span>
                    <div>
                      <div className={styles.contactLabel}>Email</div>
                      <a 
                        href={`mailto:${employer.contact_email || employer.registrant_profiles?.email}`} 
                        className={styles.contactValue}
                      >
                        {employer.contact_email || employer.registrant_profiles?.email}
                      </a>
                    </div>
                  </div>
                )}

                {employer.website && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactIcon}>🌐</span>
                    <div>
                      <div className={styles.contactLabel}>Website</div>
                      <a 
                        href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactValue}
                      >
                        {employer.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Application Instructions */}
              <div className={styles.applicationNote}>
                <strong>💡 Next Steps:</strong> Contact the employer directly using the information above to inquire about open positions and the application process. Mention your interest in their recovery-friendly workplace when reaching out.
              </div>
            </div>
          )}

          {/* Contact Info Locked Message */}
          {!showContactInfo && (
            <div className={styles.contactInfoLocked}>
              <div className={styles.lockIcon}>🔒</div>
              <div className={styles.lockMessage}>
                <strong>Contact information available after you confirm this as your employer</strong>
                <p>Once you mark this employer as your current or prospective employer, you'll be able to access their contact details to discuss opportunities.</p>
              </div>
            </div>
          )}

          {/* Hiring Status Notice */}
          {!employer.is_actively_hiring && (
            <div className={styles.hiringNotice}>
              <strong>⏸️ Note:</strong> This employer is not currently hiring. However, you can still connect to stay informed about future opportunities or to express interest in working with them when positions become available.
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.modalActions}>
            <button className="btn btn-outline" onClick={onClose}>
              Close
            </button>
            
            {showContactInfo && onContact && (
              <button className="btn btn-primary" onClick={() => onContact(employer)}>
                📞 Contact Employer
              </button>
            )}
            
            {!showContactInfo && onConnect && connectionStatus !== 'active' && (
              <button className="btn btn-primary" onClick={() => onConnect(employer)}>
                🤝 Add as My Employer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

EmployerDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  employer: PropTypes.shape({
    company_name: PropTypes.string,
    industry: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    business_type: PropTypes.string,
    company_size: PropTypes.string,
    founded_year: PropTypes.string,
    remote_work_options: PropTypes.string,
    job_types_available: PropTypes.array,
    recovery_friendly_features: PropTypes.array,
    benefits_offered: PropTypes.array,
    description: PropTypes.string,
    company_culture: PropTypes.string,
    application_process: PropTypes.string,
    is_actively_hiring: PropTypes.bool,
    phone: PropTypes.string,
    contact_email: PropTypes.string,
    website: PropTypes.string,
    registrant_profiles: PropTypes.object
  }),
  connectionStatus: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onContact: PropTypes.func,
  onConnect: PropTypes.func,
  showContactInfo: PropTypes.bool
};

EmployerDetailsModal.defaultProps = {
  showContactInfo: false
};

export default EmployerDetailsModal;