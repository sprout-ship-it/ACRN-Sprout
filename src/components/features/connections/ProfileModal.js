// src/components/features/connections/ProfileModal.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ProfileModal.module.css';

const ProfileModal = ({
  isOpen,
  profile,
  connectionStatus,
  onClose,
  onApprove,
  onDecline,
  onConnect,
  showContactInfo = false,
  showActions = false,
  isAwaitingApproval = false
}) => {
  if (!isOpen || !profile) return null;

  const { profile_type } = profile;

  /**
   * Calculate age from date of birth
   */
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Format various display values
   */
  const formatValue = (value, type) => {
    if (!value) return 'Not specified';
    
    switch (type) {
      case 'recovery_stage':
        const stageMap = {
          'early': 'Early Recovery',
          'stabilizing': 'Stabilizing Recovery',
          'stable': 'Stable Recovery',
          'long_term': 'Long-term Recovery',
          'maintenance': 'Maintenance Phase'
        };
        return stageMap[value] || value.replace(/_/g, ' ');
        
      case 'work_schedule':
        const scheduleMap = {
          'traditional_9_5': 'Traditional 9-5',
          'work_from_home': 'Work from Home',
          'night_shift': 'Night Shift',
          'early_morning': 'Early Morning',
          'part_time': 'Part-time',
          'flexible': 'Flexible Hours'
        };
        return scheduleMap[value] || value.replace(/_/g, ' ');
        
      case 'business_type':
        return value.replace(/_/g, ' ').split(' ').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        
      default:
        return value.replace(/_/g, ' ');
    }
  };

  /**
   * Format remote work options
   */
  const formatRemoteWork = (option) => {
    if (!option) return 'Not specified';
    const optionMap = {
      'on_site': 'On-site',
      'fully_remote': 'Fully Remote',
      'hybrid': 'Hybrid',
      'flexible': 'Flexible'
    };
    return optionMap[option] || option.replace(/_/g, ' ');
  };

  /**
   * Render contact information section
   */
  const renderContactInfo = () => {
    if (!showContactInfo) {
      return (
        <div className={styles.contactInfoLocked}>
          <div className={styles.lockIcon}>🔒</div>
          <div className={styles.lockMessage}>
            <strong>
              {isAwaitingApproval 
                ? 'Review this profile to make your decision' 
                : 'Contact information available after connection is confirmed'}
            </strong>
            <p>
              {isAwaitingApproval
                ? 'Contact information will be available after both parties approve the connection.'
                : 'Once both parties approve the connection, you\'ll be able to exchange contact details.'}
            </p>
          </div>
        </div>
      );
    }

    // Get contact details based on profile type
    const email = profile.contact_email || profile.registrant_profiles?.email;
    const phone = profile.primary_phone || profile.phone;

    return (
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>📞 Contact Information</h4>
        <div className={styles.contactInfo}>
          {email && (
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📧</span>
              <div>
                <div className={styles.contactLabel}>Email</div>
                <a href={`mailto:${email}`} className={styles.contactValue}>
                  {email}
                </a>
              </div>
              <a 
                href={`mailto:${email}`}
                className={styles.contactIconButton}
                title="Send Email"
              >
                📧
              </a>
            </div>
          )}
          
          {phone && (
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📱</span>
              <div>
                <div className={styles.contactLabel}>Phone</div>
                <a href={`tel:${phone}`} className={styles.contactValue}>
                  {phone}
                </a>
              </div>
              <a 
                href={`tel:${phone}`}
                className={styles.contactIconButton}
                title="Call"
              >
                📱
              </a>
            </div>
          )}
          
          {profile_type === 'employer' && profile.website && (
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>🌐</span>
              <div>
                <div className={styles.contactLabel}>Website</div>
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactValue}
                >
                  {profile.website}
                </a>
              </div>
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactIconButton}
                title="Visit Website"
              >
                🌐
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render action buttons
   */
  const renderActionButtons = () => {
    if (!showActions) return null;

    // Awaiting approval view (for recipient)
    if (isAwaitingApproval && onApprove && onDecline) {
      return (
        <div className={styles.modalActions}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <div className={styles.approvalActions}>
            <button 
              className="btn btn-primary" 
              onClick={() => onApprove(profile)}
            >
              ✅ Approve Connection
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => onDecline(profile)}
              style={{ color: 'var(--error-text)', borderColor: 'var(--error-border)' }}
            >
              ❌ Decline
            </button>
          </div>
        </div>
      );
    }

    // Active connection view
    if (connectionStatus === 'active' || connectionStatus === 'confirmed') {
      return (
        <div className={styles.modalActions}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      );
    }

    // Discovery view (not connected yet)
    if (onConnect && connectionStatus !== 'requested') {
      return (
        <div className={styles.modalActions}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => onConnect(profile)}
          >
            {profile_type === 'employer' ? '🤝 Add as My Employer' : '🤝 Request Connection'}
          </button>
        </div>
      );
    }

    // Request sent view
    if (connectionStatus === 'requested') {
      return (
        <div className={styles.modalActions}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <div className={styles.requestSentIndicator}>
            📤 Connection Request Sent
          </div>
        </div>
      );
    }

    // Default (just close)
    return (
      <div className={styles.modalActions}>
        <button className="btn btn-outline" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };

  /**
   * Render Applicant Profile
   */
  const renderApplicantProfile = () => {
    const age = calculateAge(profile.date_of_birth);
    
    return (
      <>
        {/* Header */}
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>👤</div>
          <div className={styles.profileHeaderInfo}>
            <h2 className={styles.profileName}>{profile.name}</h2>
            <div className={styles.profileSubtitle}>
              {age && <span>{age} years old</span>}
              {age && profile.primary_location && <span> • </span>}
              {profile.primary_location && <span>{profile.primary_location}</span>}
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className={styles.badgeSection}>
          {connectionStatus && (
            <span className={`badge ${connectionStatus === 'confirmed' || connectionStatus === 'active' ? 'badge-success' : 'badge-warning'}`}>
              {connectionStatus}
            </span>
          )}
          {profile.recovery_stage && (
            <span className="badge badge-info">
              {formatValue(profile.recovery_stage, 'recovery_stage')}
            </span>
          )}
        </div>

        {/* Essential Information Grid */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>Essential Information</h4>
          <div className={styles.infoGrid}>
            {profile.recovery_stage && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🌱</span>
                <div>
                  <div className={styles.infoLabel}>Recovery Stage</div>
                  <div className={styles.infoValue}>{formatValue(profile.recovery_stage, 'recovery_stage')}</div>
                </div>
              </div>
            )}
            
            {profile.work_schedule && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>⏰</span>
                <div>
                  <div className={styles.infoLabel}>Work Schedule</div>
                  <div className={styles.infoValue}>{formatValue(profile.work_schedule, 'work_schedule')}</div>
                </div>
              </div>
            )}
            
            {profile.budget_min && profile.budget_max && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>💵</span>
                <div>
                  <div className={styles.infoLabel}>Budget</div>
                  <div className={styles.infoValue}>${profile.budget_min} - ${profile.budget_max}</div>
                </div>
              </div>
            )}
            
            {profile.move_in_date && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📅</span>
                <div>
                  <div className={styles.infoLabel}>Move-in Date</div>
                  <div className={styles.infoValue}>{new Date(profile.move_in_date).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recovery Information */}
        {(profile.recovery_methods || profile.time_in_recovery || profile.spiritual_affiliation) && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Recovery Journey</h4>
            <div className={styles.detailsList}>
              {profile.time_in_recovery && (
                <div className={styles.detailItem}>
                  <strong>Time in Recovery:</strong> {profile.time_in_recovery}
                </div>
              )}
              {profile.spiritual_affiliation && (
                <div className={styles.detailItem}>
                  <strong>Spiritual Affiliation:</strong> {profile.spiritual_affiliation}
                </div>
              )}
            </div>
            
            {profile.recovery_methods && Array.isArray(profile.recovery_methods) && profile.recovery_methods.length > 0 && (
              <div className={styles.tagSection}>
                <div className={styles.tagLabel}>Recovery Methods</div>
                <div className={styles.tagList}>
                  {profile.recovery_methods.map((method, i) => (
                    <span key={i} className={styles.tag}>
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lifestyle Preferences */}
        {(profile.cleanliness_level || profile.noise_tolerance || profile.pets_owned || profile.smoking_status) && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Lifestyle Preferences</h4>
            <div className={styles.infoGrid}>
              {profile.cleanliness_level && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🧹</span>
                  <div>
                    <div className={styles.infoLabel}>Cleanliness</div>
                    <div className={styles.infoValue}>{profile.cleanliness_level}/5</div>
                  </div>
                </div>
              )}
              
              {profile.noise_tolerance && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🔊</span>
                  <div>
                    <div className={styles.infoLabel}>Noise Tolerance</div>
                    <div className={styles.infoValue}>{profile.noise_tolerance}/5</div>
                  </div>
                </div>
              )}
              
              {profile.smoking_status && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🚭</span>
                  <div>
                    <div className={styles.infoLabel}>Smoking</div>
                    <div className={styles.infoValue}>{formatValue(profile.smoking_status)}</div>
                  </div>
                </div>
              )}
              
              {typeof profile.pets_owned === 'boolean' && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🐾</span>
                  <div>
                    <div className={styles.infoLabel}>Pets</div>
                    <div className={styles.infoValue}>{profile.pets_owned ? 'Has pets' : 'No pets'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Interests & Hobbies</h4>
            <div className={styles.tagList}>
              {profile.interests.map((interest, i) => (
                <span key={i} className={styles.tag}>
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* About Me */}
        {profile.about_me && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>About Me</h4>
            <p className={styles.bioText}>{profile.about_me}</p>
          </div>
        )}

        {/* Looking For */}
        {profile.looking_for && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Looking For in a Roommate</h4>
            <p className={styles.bioText}>{profile.looking_for}</p>
          </div>
        )}
      </>
    );
  };

  /**
   * Render Peer Support Profile
   */
  const renderPeerSupportProfile = () => {
    return (
      <>
        {/* Header */}
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>🤝</div>
          <div className={styles.profileHeaderInfo}>
            <h2 className={styles.profileName}>{profile.name}</h2>
            <div className={styles.profileSubtitle}>
              {profile.professional_title || 'Peer Support Specialist'}
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
          {profile.is_licensed && (
            <span className="badge badge-success">Licensed</span>
          )}
          {profile.accepting_clients ? (
            <span className="badge badge-success">Accepting Clients</span>
          ) : (
            <span className="badge badge-warning">Not Accepting</span>
          )}
        </div>

        {/* Professional Information */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>Professional Background</h4>
          <div className={styles.infoGrid}>
            {profile.years_experience && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>⭐</span>
                <div>
                  <div className={styles.infoLabel}>Experience</div>
                  <div className={styles.infoValue}>
                    {profile.years_experience} year{profile.years_experience !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}
            
            {profile.service_city && profile.service_state && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📍</span>
                <div>
                  <div className={styles.infoLabel}>Location</div>
                  <div className={styles.infoValue}>{profile.service_city}, {profile.service_state}</div>
                </div>
              </div>
            )}
            
            {profile.spiritual_affiliation && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🙏</span>
                <div>
                  <div className={styles.infoLabel}>Spiritual Affiliation</div>
                  <div className={styles.infoValue}>{profile.spiritual_affiliation}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Specialties */}
        {profile.specialties && Array.isArray(profile.specialties) && profile.specialties.length > 0 && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Specialties</h4>
            <div className={styles.tagList}>
              {profile.specialties.map((specialty, i) => (
                <span key={i} className={styles.tag}>
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recovery Methods Supported */}
        {profile.supported_recovery_methods && Array.isArray(profile.supported_recovery_methods) && profile.supported_recovery_methods.length > 0 && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Supported Recovery Methods</h4>
            <div className={styles.tagList}>
              {profile.supported_recovery_methods.map((method, i) => (
                <span key={i} className={styles.tag}>
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Service Areas */}
        {profile.service_areas && Array.isArray(profile.service_areas) && profile.service_areas.length > 0 && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Service Areas</h4>
            <div className={styles.tagList}>
              {profile.service_areas.map((area, i) => (
                <span key={i} className={styles.tag}>
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>About</h4>
            <p className={styles.bioText}>{profile.bio}</p>
          </div>
        )}

        {/* Additional Info */}
        {profile.additional_info && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Additional Information</h4>
            <p className={styles.bioText}>{profile.additional_info}</p>
          </div>
        )}
      </>
    );
  };

  /**
   * Render Employer Profile
   */
  const renderEmployerProfile = () => {
    return (
      <>
        {/* Header */}
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>💼</div>
          <div className={styles.profileHeaderInfo}>
            <h2 className={styles.profileName}>{profile.company_name || profile.name}</h2>
            <div className={styles.profileSubtitle}>
              {profile.industry}
              {profile.city && profile.state && <span> • {profile.city}, {profile.state}</span>}
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
          {profile.is_actively_hiring ? (
            <span className="badge badge-success">🟢 Actively Hiring</span>
          ) : (
            <span className="badge badge-warning">⏸️ Not Currently Hiring</span>
          )}
          {profile.recovery_friendly_features && profile.recovery_friendly_features.length > 0 && (
            <span className="badge badge-success">🤝 Recovery Friendly</span>
          )}
        </div>

        {/* Company Information */}
        <div className={styles.infoSection}>
          <h4 className={styles.sectionTitle}>Company Information</h4>
          <div className={styles.infoGrid}>
            {profile.business_type && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🏢</span>
                <div>
                  <div className={styles.infoLabel}>Business Type</div>
                  <div className={styles.infoValue}>{formatValue(profile.business_type, 'business_type')}</div>
                </div>
              </div>
            )}
            
            {profile.company_size && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>👥</span>
                <div>
                  <div className={styles.infoLabel}>Company Size</div>
                  <div className={styles.infoValue}>{profile.company_size} employees</div>
                </div>
              </div>
            )}
            
            {profile.founded_year && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📅</span>
                <div>
                  <div className={styles.infoLabel}>Founded</div>
                  <div className={styles.infoValue}>{profile.founded_year}</div>
                </div>
              </div>
            )}
            
            {profile.remote_work_options && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>💻</span>
                <div>
                  <div className={styles.infoLabel}>Remote Work</div>
                  <div className={styles.infoValue}>{formatRemoteWork(profile.remote_work_options)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Types Available */}
        {profile.job_types_available && Array.isArray(profile.job_types_available) && profile.job_types_available.length > 0 && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>💼 Job Types Available</h4>
            <div className={styles.tagList}>
              {profile.job_types_available.map((type, i) => (
                <span key={i} className={`${styles.tag} ${styles.tagSuccess}`}>
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recovery-Friendly Features */}
        {profile.recovery_friendly_features && Array.isArray(profile.recovery_friendly_features) && profile.recovery_friendly_features.length > 0 && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>🤝 Recovery-Friendly Features</h4>
            <div className={styles.tagList}>
              {profile.recovery_friendly_features.map((feature, i) => (
                <span key={i} className={`${styles.tag} ${styles.tagInfo}`}>
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Benefits */}
        {profile.benefits_offered && Array.isArray(profile.benefits_offered) && profile.benefits_offered.length > 0 && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>✨ Benefits Offered</h4>
            <div className={styles.tagList}>
              {profile.benefits_offered.map((benefit, i) => (
                <span key={i} className={styles.tag}>
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Company Description */}
        {profile.description && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>📝 About the Company</h4>
            <p className={styles.bioText}>{profile.description}</p>
          </div>
        )}

        {/* Company Culture */}
        {profile.company_culture && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>🌟 Company Culture</h4>
            <p className={styles.bioText}>{profile.company_culture}</p>
          </div>
        )}

        {/* Application Process */}
        {profile.application_process && (
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>📋 Application Process</h4>
            <p className={styles.bioText}>{profile.application_process}</p>
          </div>
        )}

        {/* Hiring Status Notice */}
        {!profile.is_actively_hiring && (
          <div className={styles.hiringNotice}>
            <strong>⏸️ Note:</strong> This employer is not currently hiring. However, you can still connect to stay informed about future opportunities.
          </div>
        )}
      </>
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>×</button>
        
        <div className={styles.modalBody}>
          {/* Render appropriate profile type */}
          {profile_type === 'applicant' && renderApplicantProfile()}
          {profile_type === 'peer_support' && renderPeerSupportProfile()}
          {profile_type === 'employer' && renderEmployerProfile()}
          
          {/* Contact Information Section */}
          {renderContactInfo()}
          
          {/* Action Buttons */}
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
};

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  profile: PropTypes.shape({
    profile_type: PropTypes.oneOf(['applicant', 'peer_support', 'employer']).isRequired,
    name: PropTypes.string.isRequired,
    registrant_profiles: PropTypes.object,
    primary_phone: PropTypes.string,
    phone: PropTypes.string,
    contact_email: PropTypes.string
  }),
  connectionStatus: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func,
  onDecline: PropTypes.func,
  onConnect: PropTypes.func,
  showContactInfo: PropTypes.bool,
  showActions: PropTypes.bool,
  isAwaitingApproval: PropTypes.bool
};

ProfileModal.defaultProps = {
  showContactInfo: false,
  showActions: false,
  isAwaitingApproval: false
};

export default ProfileModal;