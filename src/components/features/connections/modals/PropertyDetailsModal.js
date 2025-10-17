// src/components/features/connections/modals/PropertyDetailsModal.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './PropertyDetailsModal.module.css';

const PropertyDetailsModal = ({
  isOpen,
  property,
  connectionStatus,
  requestingApplicant,
  matchGroupMembers, // For roommate scenarios
  onClose,
  onApprove,
  onDecline,
  onContact,
  showContactInfo = false,
  showActions = false,
  isLandlordView = false
}) => {
  if (!isOpen || !property) return null;

  /**
   * Format name to show only first name and last initial
   * CRITICAL PRIVACY FUNCTION
   */
  const formatName = (firstName, lastName) => {
    if (!firstName) return 'Applicant';
    if (!lastName) return firstName;
    return `${firstName} ${lastName.charAt(0)}.`;
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    if (!amount) return 'Contact for pricing';
    return `$${amount.toLocaleString()}`;
  };

  /**
   * Format property type display
   */
  const formatPropertyType = (type) => {
    if (!type) return 'Property';
    const typeMap = {
      'apartment': 'Apartment',
      'house': 'House',
      'condo': 'Condo',
      'townhouse': 'Townhouse',
      'studio': 'Studio',
      'room': 'Private Room',
      'shared_room': 'Shared Room',
      'recovery_residence': 'Recovery Residence',
      'sober_living': 'Sober Living Home',
      'halfway_house': 'Halfway House'
    };
    return typeMap[type] || type;
  };

  /**
   * Format lease term
   */
  const formatLeaseTerm = (term) => {
    if (!term) return 'Flexible';
    const termMap = {
      'month_to_month': 'Month-to-Month',
      '3_month': '3 Months',
      '6_month': '6 Months',
      '1_year': '1 Year',
      'flexible': 'Flexible'
    };
    return termMap[term] || term;
  };

  /**
   * Get property header gradient based on type
   */
  const getHeaderGradient = () => {
    if (property.is_recovery_housing) {
      return 'linear-gradient(135deg, #20B2AA 0%, #178B8B 100%)';
    }
    return 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)';
  };

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
   * Render requesting applicant section (for landlord view)
   * PRIVACY FIX: Always use formatName
   */
  const renderRequestingApplicant = () => {
    if (!isLandlordView || !requestingApplicant) return null;

    const applicant = requestingApplicant;
    const profile = applicant.registrant_profiles || {};

    return (
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>👤 Requesting Applicant</h4>
        <div className={styles.applicantCard}>
          <div className={styles.applicantHeader}>
            <div className={styles.applicantName}>
              {/* PRIVACY FIX: Use formatName */}
              {formatName(profile.first_name, profile.last_name)}
            </div>
            {applicant.recovery_stage && (
              <span className="badge badge-info">
                {applicant.recovery_stage.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <div className={styles.applicantDetails}>
            {applicant.date_of_birth && (
              <div className={styles.detailItem}>
                <strong>Age:</strong> {calculateAge(applicant.date_of_birth)} years old
              </div>
            )}
            
            {applicant.employment_status && (
              <div className={styles.detailItem}>
                <strong>Employment:</strong> {applicant.employment_status.replace(/_/g, ' ')}
              </div>
            )}

            {applicant.budget_min && applicant.budget_max && (
              <div className={styles.detailItem}>
                <strong>Budget:</strong> ${applicant.budget_min} - ${applicant.budget_max}/month
              </div>
            )}

            {applicant.move_in_date && (
              <div className={styles.detailItem}>
                <strong>Desired Move-in:</strong> {new Date(applicant.move_in_date).toLocaleDateString()}
              </div>
            )}
          </div>

          {applicant.about_me && (
            <div className={styles.applicantBio}>
              <strong>About:</strong>
              <p>{applicant.about_me.length > 200 ? `${applicant.about_me.substring(0, 200)}...` : applicant.about_me}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render match group members (for roommate scenarios)
   * PRIVACY FIX: Always use formatName
   */
  const renderMatchGroupMembers = () => {
    if (!matchGroupMembers || matchGroupMembers.length === 0) return null;

    return (
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>
          👥 Potential Roommates ({matchGroupMembers.length})
        </h4>
        <div className={styles.membersGrid}>
          {matchGroupMembers.map((member, index) => {
            const profile = member.registrant_profiles || {};
            return (
              <div key={member.id || index} className={styles.memberCard}>
                <div className={styles.memberName}>
                  {/* PRIVACY FIX: Use formatName */}
                  {formatName(profile.first_name, profile.last_name)}
                </div>
                {member.recovery_stage && (
                  <div className={styles.memberDetail}>
                    🌱 {member.recovery_stage.replace(/_/g, ' ')}
                  </div>
                )}
                {member.work_schedule && (
                  <div className={styles.memberDetail}>
                    ⏰ {member.work_schedule.replace(/_/g, ' ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Render landlord contact information
   * PRIVACY FIX: Use formatName for landlord name if no business name
   */
  const renderLandlordContact = () => {
    if (!showContactInfo || !property.landlord_profiles) return null;

    const landlord = property.landlord_profiles;
    const landlordProfile = landlord.registrant_profiles || {};

    return (
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>📞 Landlord Contact</h4>
        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <span className={styles.contactIcon}>👤</span>
            <div>
              <div className={styles.contactLabel}>Name</div>
              <div className={styles.contactValue}>
                {/* PRIVACY FIX: Use formatName if no business name */}
                {landlord.business_name || formatName(landlordProfile.first_name, landlordProfile.last_name)}
              </div>
            </div>
          </div>

          {landlord.primary_phone && (
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📱</span>
              <div>
                <div className={styles.contactLabel}>Phone</div>
                <a href={`tel:${landlord.primary_phone}`} className={styles.contactValue}>
                  {landlord.primary_phone}
                </a>
              </div>
              <a 
                href={`tel:${landlord.primary_phone}`}
                className={styles.contactIconButton}
                title="Call"
              >
                📱
              </a>
            </div>
          )}

          {(landlord.contact_email || landlordProfile.email) && (
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📧</span>
              <div>
                <div className={styles.contactLabel}>Email</div>
                <a 
                  href={`mailto:${landlord.contact_email || landlordProfile.email}`} 
                  className={styles.contactValue}
                >
                  {landlord.contact_email || landlordProfile.email}
                </a>
              </div>
              <a 
                href={`mailto:${landlord.contact_email || landlordProfile.email}`}
                className={styles.contactIconButton}
                title="Email"
              >
                📧
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

    // Awaiting approval (landlord view)
    if (connectionStatus === 'requested' && isLandlordView && onApprove && onDecline) {
      return (
        <div className={styles.modalActions}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <div className={styles.approvalActions}>
            <button 
              className="btn btn-primary" 
              onClick={() => onApprove && onApprove(property)}
            >
              ✅ Approve Request
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => onDecline && onDecline(property)}
              style={{ color: 'var(--error-text)', borderColor: 'var(--error-border)' }}
            >
              ❌ Decline Request
            </button>
          </div>
        </div>
      );
    }

    // Active connection
    if ((connectionStatus === 'approved' || connectionStatus === 'confirmed') && showContactInfo) {
      return (
        <div className={styles.modalActions}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {onContact && (
            <button className="btn btn-primary" onClick={() => onContact(property)}>
              📞 Contact Landlord
            </button>
          )}
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

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>×</button>
        
        <div className={styles.modalBody}>
          {/* Property Header */}
          <div className={styles.propertyHeader} style={{ background: getHeaderGradient() }}>
            <div className={styles.propertyHeaderContent}>
              <div className={styles.propertyIcon}>
                {property.is_recovery_housing ? '🌱' : '🏠'}
              </div>
              <div className={styles.propertyHeaderInfo}>
                <h2 className={styles.propertyTitle}>
                  {property.title || property.street_address || 'Property Listing'}
                </h2>
                <div className={styles.propertyLocation}>
                  📍 {property.city}{property.state && `, ${property.state}`}
                  {property.zip_code && ` ${property.zip_code}`}
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className={styles.badgeSection}>
            {connectionStatus && (
              <span className={`badge ${connectionStatus === 'approved' || connectionStatus === 'confirmed' || connectionStatus === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {connectionStatus}
              </span>
            )}
            {property.is_recovery_housing && (
              <span className="badge badge-success">🌱 Recovery Housing</span>
            )}
            {property.utilities_included && property.utilities_included.length > 0 && (
              <span className="badge badge-info">💡 Utilities Included</span>
            )}
            {property.furnished && (
              <span className="badge badge-info">🛋️ Furnished</span>
            )}
            {property.pets_allowed && (
              <span className="badge badge-info">🐾 Pets Allowed</span>
            )}
          </div>

          {/* Requesting Applicant (for landlord) */}
          {renderRequestingApplicant()}

          {/* Match Group Members (for roommate scenarios) */}
          {renderMatchGroupMembers()}

          {/* Key Information Grid */}
          <div className={styles.infoSection}>
            <h4 className={styles.sectionTitle}>Property Overview</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>💰</span>
                <div>
                  <div className={styles.infoLabel}>Monthly Rent</div>
                  <div className={styles.infoValue}>
                    {formatCurrency(property.monthly_rent)}
                  </div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🏢</span>
                <div>
                  <div className={styles.infoLabel}>Property Type</div>
                  <div className={styles.infoValue}>{formatPropertyType(property.property_type)}</div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🛏️</span>
                <div>
                  <div className={styles.infoLabel}>Bedrooms</div>
                  <div className={styles.infoValue}>
                    {property.bedrooms === 0 ? 'Studio' : property.bedrooms || 'Not specified'}
                  </div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🚿</span>
                <div>
                  <div className={styles.infoLabel}>Bathrooms</div>
                  <div className={styles.infoValue}>{property.bathrooms || 'Not specified'}</div>
                </div>
              </div>

              {property.square_footage && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📐</span>
                  <div>
                    <div className={styles.infoLabel}>Square Footage</div>
                    <div className={styles.infoValue}>{property.square_footage.toLocaleString()} sq ft</div>
                  </div>
                </div>
              )}

              {property.lease_duration && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📋</span>
                  <div>
                    <div className={styles.infoLabel}>Lease Term</div>
                    <div className={styles.infoValue}>{formatLeaseTerm(property.lease_duration)}</div>
                  </div>
                </div>
              )}

              {property.available_date && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📅</span>
                  <div>
                    <div className={styles.infoLabel}>Available Date</div>
                    <div className={styles.infoValue}>
                      {new Date(property.available_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              {property.security_deposit && (
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🔒</span>
                  <div>
                    <div className={styles.infoLabel}>Security Deposit</div>
                    <div className={styles.infoValue}>{formatCurrency(property.security_deposit)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Address */}
          {property.address && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>📍 Location</h4>
              <div className={styles.addressBox}>
                <div className={styles.addressLine}>{property.address}</div>
                <div className={styles.addressLine}>
                  {property.city}, {property.state} {property.zip_code}
                </div>
              </div>
            </div>
          )}

          {/* Recovery Housing Features */}
          {property.is_recovery_housing && (property.required_programs || property.house_rules || property.min_sobriety_time) && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>🌱 Recovery Housing Details</h4>
              <div className={styles.detailsList}>
                {property.min_sobriety_time && (
                  <div className={styles.detailItem}>
                    <strong>Minimum Sobriety:</strong> {property.min_sobriety_time}
                  </div>
                )}
                
                {property.required_programs && property.required_programs.length > 0 && (
                  <div className={styles.detailItem}>
                    <strong>Required Programs:</strong>
                    <div className={styles.tagList}>
                      {property.required_programs.map((program, i) => (
                        <span key={i} className={styles.tag}>{program}</span>
                      ))}
                    </div>
                  </div>
                )}

                {property.house_rules && property.house_rules.length > 0 && (
                  <div className={styles.detailItem}>
                    <strong>House Rules:</strong>
                    <ul className={styles.rulesList}>
                      {property.house_rules.map((rule, i) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>✨ Amenities</h4>
              <div className={styles.tagList}>
                {property.amenities.map((amenity, i) => (
                  <span key={i} className={styles.tag}>{amenity}</span>
                ))}
              </div>
            </div>
          )}

          {/* Property Description */}
          {property.description && (
            <div className={styles.infoSection}>
              <h4 className={styles.sectionTitle}>📝 Property Description</h4>
              <p className={styles.bioText}>{property.description}</p>
            </div>
          )}

          {/* Landlord Contact Info */}
          {renderLandlordContact()}

          {/* Contact Info Locked Message */}
          {!showContactInfo && (
            <div className={styles.contactInfoLocked}>
              <div className={styles.lockIcon}>🔒</div>
              <div className={styles.lockMessage}>
                <strong>Contact information available after connection is approved</strong>
                <p>Once the landlord approves your request, you'll be able to contact them directly to discuss the property and application process.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
};

PropertyDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  property: PropTypes.object.isRequired,
  connectionStatus: PropTypes.string,
  requestingApplicant: PropTypes.object,
  matchGroupMembers: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func,
  onDecline: PropTypes.func,
  onContact: PropTypes.func,
  showContactInfo: PropTypes.bool,
  showActions: PropTypes.bool,
  isLandlordView: PropTypes.bool
};

PropertyDetailsModal.defaultProps = {
  showContactInfo: false,
  showActions: false,
  isLandlordView: false
};

export default PropertyDetailsModal;