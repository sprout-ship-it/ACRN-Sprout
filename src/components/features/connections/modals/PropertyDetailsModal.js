// src/components/features/connections/modals/PropertyDetailsModal.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './PropertyDetailsModal.module.css';

const PropertyDetailsModal = ({
  isOpen,
  property,
  connectionStatus,
  requestingApplicant,
  matchGroupMembers,
  onClose,
  onApprove,
  onDecline,
  onContact,
  showContactInfo = false,
  showActions = false,
  isLandlordView = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');

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
      'sober_living_level_1': 'Sober Living (Level 1)',
      'sober_living_level_2': 'Sober Living (Level 2)',
      'sober_living_level_3': 'Sober Living (Level 3)',
      'sober_living_level_4': 'Sober Living (Level 4)',
      'halfway_house': 'Halfway House',
      'transitional_housing': 'Transitional Housing',
      'therapeutic_community': 'Therapeutic Community'
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
      '3_months': '3 Months',
      '6_months': '6 Months',
      '12_months': '1 Year',
      '24_months': '2 Years',
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
   * Calculate bed availability percentage
   */
  const calculateBedAvailability = () => {
    if (!property.is_recovery_housing || !property.total_beds) return null;
    const available = property.available_beds || 0;
    const total = property.total_beds;
    const percentage = (available / total) * 100;
    return {
      available,
      total,
      occupied: total - available,
      percentage: Math.round(percentage)
    };
  };

  /**
   * Render prominent bed availability indicator (for recovery housing)
   */
  const renderBedAvailability = () => {
    if (!property.is_recovery_housing) return null;
    const bedInfo = calculateBedAvailability();
    if (!bedInfo) return null;

    const getAvailabilityStatus = () => {
      if (bedInfo.percentage >= 50) return 'high';
      if (bedInfo.percentage >= 25) return 'medium';
      if (bedInfo.percentage > 0) return 'low';
      return 'none';
    };

    const status = getAvailabilityStatus();

    return (
      <div className={`${styles.bedAvailabilityCard} ${styles[`availability-${status}`]}`}>
        <div className={styles.bedAvailabilityContent}>
          <div className={styles.bedAvailabilityIcon}>🛏️</div>
          <div className={styles.bedAvailabilityInfo}>
            <div className={styles.bedAvailabilityNumbers}>
              <span className={styles.bedsAvailable}>{bedInfo.available}</span>
              <span className={styles.bedsSeparator}>/</span>
              <span className={styles.bedsTotal}>{bedInfo.total}</span>
            </div>
            <div className={styles.bedAvailabilityLabel}>
              {bedInfo.available === 0 ? 'No Beds Available' : 
               bedInfo.available === 1 ? 'Bed Available' : 
               'Beds Available'}
            </div>
          </div>
          <div className={styles.bedAvailabilityBar}>
            <div 
              className={styles.bedAvailabilityFill}
              style={{ width: `${bedInfo.percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render requesting applicant section (for landlord view)
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
   * TAB 1: Overview - Key information at a glance
   */
  const renderOverviewTab = () => (
    <div className={styles.tabContent}>
      {/* Bed Availability Card (Recovery Housing Only) */}
      {property.is_recovery_housing && renderBedAvailability()}

      {/* Key Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Monthly Rent</div>
            <div className={styles.statValue}>{formatCurrency(property.monthly_rent)}</div>
            {property.weekly_rate && (
              <div className={styles.statSubtext}>or {formatCurrency(property.weekly_rate)}/week</div>
            )}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏢</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Property Type</div>
            <div className={styles.statValue}>{formatPropertyType(property.property_type)}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🛏️</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Bedrooms</div>
            <div className={styles.statValue}>
              {property.bedrooms === 0 ? 'Studio' : property.bedrooms || 'Not specified'}
            </div>
            {property.is_recovery_housing && property.total_beds && (
              <div className={styles.statSubtext}>{property.total_beds} total beds</div>
            )}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🚿</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Bathrooms</div>
            <div className={styles.statValue}>{property.bathrooms || 'Not specified'}</div>
          </div>
        </div>

        {property.square_footage && !property.is_recovery_housing && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📐</div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Square Footage</div>
              <div className={styles.statValue}>{property.square_footage.toLocaleString()} sq ft</div>
            </div>
          </div>
        )}

        {property.available_date && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Available Date</div>
              <div className={styles.statValue}>
                {new Date(property.available_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {property.lease_duration && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📋</div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Lease Term</div>
              <div className={styles.statValue}>{formatLeaseTerm(property.lease_duration)}</div>
            </div>
          </div>
        )}

        {property.security_deposit && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔒</div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Security Deposit</div>
              <div className={styles.statValue}>{formatCurrency(property.security_deposit)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Property Description */}
      {property.description && (
        <div className={styles.descriptionSection}>
          <h4 className={styles.sectionSubtitle}>About This Property</h4>
          <p className={styles.description}>{property.description}</p>
        </div>
      )}

      {/* Location - UPDATED: Only showing city, state, zip */}
      <div className={styles.locationSection}>
        <h4 className={styles.sectionSubtitle}>📍 Location</h4>
        <div className={styles.addressBox}>
          <div className={styles.addressLine}>
            {property.city}, {property.state} {property.zip_code}
          </div>
          <div className={styles.addressNote}>
            Exact address will be shared by landlord after connection approval
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * TAB 2: Property Features - Amenities, utilities, accessibility
   */
  const renderFeaturesTab = () => (
    <div className={styles.tabContent}>
      {/* Quick Features */}
      <div className={styles.quickFeatures}>
        {property.furnished && (
          <div className={styles.featureChip}>
            <span className={styles.featureIcon}>🛋️</span> Furnished
          </div>
        )}
        {property.pets_allowed && (
          <div className={styles.featureChip}>
            <span className={styles.featureIcon}>🐾</span> Pets Allowed
          </div>
        )}
        {property.smoking_allowed && (
          <div className={styles.featureChip}>
            <span className={styles.featureIcon}>🚬</span> Smoking Areas
          </div>
        )}
        {property.meals_included && (
          <div className={styles.featureChip}>
            <span className={styles.featureIcon}>🍽️</span> Meals Included
          </div>
        )}
        {property.linens_provided && (
          <div className={styles.featureChip}>
            <span className={styles.featureIcon}>🛏️</span> Linens Provided
          </div>
        )}
      </div>

      {/* Utilities Included */}
      {property.utilities_included && property.utilities_included.length > 0 && (
        <div className={styles.featureSection}>
          <h4 className={styles.sectionSubtitle}>💡 Utilities Included</h4>
          <div className={styles.tagGrid}>
            {property.utilities_included.map((utility, i) => (
              <span key={i} className={styles.tag}>
                {utility.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <div className={styles.featureSection}>
          <h4 className={styles.sectionSubtitle}>✨ Property Amenities</h4>
          <div className={styles.tagGrid}>
            {property.amenities.map((amenity, i) => (
              <span key={i} className={styles.tag}>{amenity}</span>
            ))}
          </div>
        </div>
      )}

      {/* Accessibility Features */}
      {property.accessibility_features && property.accessibility_features.length > 0 && (
        <div className={styles.featureSection}>
          <h4 className={styles.sectionSubtitle}>♿ Accessibility Features</h4>
          <div className={styles.tagGrid}>
            {property.accessibility_features.map((feature, i) => (
              <span key={i} className={styles.tag}>{feature}</span>
            ))}
          </div>
        </div>
      )}

      {/* Neighborhood Features */}
      {property.neighborhood_features && property.neighborhood_features.length > 0 && (
        <div className={styles.featureSection}>
          <h4 className={styles.sectionSubtitle}>🏘️ Neighborhood</h4>
          <div className={styles.tagGrid}>
            {property.neighborhood_features.map((feature, i) => (
              <span key={i} className={styles.tag}>{feature}</span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Notes */}
      {property.additional_notes && (
        <div className={styles.featureSection}>
          <h4 className={styles.sectionSubtitle}>📝 Additional Information</h4>
          <p className={styles.additionalNotes}>{property.additional_notes}</p>
        </div>
      )}
    </div>
  );

  /**
   * TAB 3: Recovery Program - Recovery housing specific info
   */
  const renderRecoveryTab = () => {
    if (!property.is_recovery_housing) return null;

    return (
      <div className={styles.tabContent}>
        {/* Program Requirements */}
        {property.required_programs && property.required_programs.length > 0 && (
          <div className={styles.recoverySection}>
            <h4 className={styles.sectionSubtitle}>📋 Required Programs</h4>
            <div className={styles.tagGrid}>
              {property.required_programs.map((program, i) => (
                <span key={i} className={styles.tagImportant}>
                  {program.replace(/_/g, ' ').toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sobriety & Treatment Requirements */}
        <div className={styles.recoverySection}>
          <h4 className={styles.sectionSubtitle}>🌱 Sobriety Requirements</h4>
          <div className={styles.requirementsList}>
            {property.min_sobriety_time && (
              <div className={styles.requirementItem}>
                <span className={styles.requirementIcon}>⏱️</span>
                <div>
                  <strong>Minimum Sobriety:</strong>
                  <span className={styles.requirementValue}>
                    {property.min_sobriety_time.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            )}
            {property.treatment_completion_required && (
              <div className={styles.requirementItem}>
                <span className={styles.requirementIcon}>✅</span>
                <div>
                  <strong>Treatment Requirement:</strong>
                  <span className={styles.requirementValue}>
                    {property.treatment_completion_required.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support Services */}
        <div className={styles.recoverySection}>
          <h4 className={styles.sectionSubtitle}>🤝 Support Services Available</h4>
          <div className={styles.servicesGrid}>
            {property.case_management && (
              <div className={styles.serviceCard}>
                <span className={styles.serviceIcon}>💼</span>
                <span className={styles.serviceName}>Case Management</span>
              </div>
            )}
            {property.counseling_services && (
              <div className={styles.serviceCard}>
                <span className={styles.serviceIcon}>🗣️</span>
                <span className={styles.serviceName}>Counseling Services</span>
              </div>
            )}
            {property.job_training && (
              <div className={styles.serviceCard}>
                <span className={styles.serviceIcon}>💼</span>
                <span className={styles.serviceName}>Job Training</span>
              </div>
            )}
            {property.medical_services && (
              <div className={styles.serviceCard}>
                <span className={styles.serviceIcon}>🏥</span>
                <span className={styles.serviceName}>Medical Services</span>
              </div>
            )}
            {property.transportation_services && (
              <div className={styles.serviceCard}>
                <span className={styles.serviceIcon}>🚗</span>
                <span className={styles.serviceName}>Transportation</span>
              </div>
            )}
            {property.life_skills_training && (
              <div className={styles.serviceCard}>
                <span className={styles.serviceIcon}>🎓</span>
                <span className={styles.serviceName}>Life Skills Training</span>
              </div>
            )}
          </div>
          {!property.case_management && !property.counseling_services && 
           !property.job_training && !property.medical_services && 
           !property.transportation_services && !property.life_skills_training && (
            <p className={styles.noServices}>No additional support services listed</p>
          )}
        </div>

        {/* House Rules */}
        {property.house_rules && property.house_rules.length > 0 && (
          <div className={styles.recoverySection}>
            <h4 className={styles.sectionSubtitle}>📜 House Rules</h4>
            <ul className={styles.rulesList}>
              {property.house_rules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {property.additional_house_rules && (
          <div className={styles.recoverySection}>
            <h4 className={styles.sectionSubtitle}>Additional Rules & Expectations</h4>
            <p className={styles.additionalRules}>{property.additional_house_rules}</p>
          </div>
        )}

        {/* Licensing */}
        {(property.license_number || property.accreditation) && (
          <div className={styles.recoverySection}>
            <h4 className={styles.sectionSubtitle}>🏛️ Licensing & Accreditation</h4>
            <div className={styles.licensingInfo}>
              {property.license_number && (
                <div className={styles.licensingItem}>
                  <strong>License Number:</strong> {property.license_number}
                </div>
              )}
              {property.accreditation && (
                <div className={styles.licensingItem}>
                  <strong>Accreditation:</strong> {property.accreditation}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * TAB 4: Requirements & Policies
   */
  const renderRequirementsTab = () => (
    <div className={styles.tabContent}>
      {/* Financial Requirements */}
      <div className={styles.requirementsSection}>
        <h4 className={styles.sectionSubtitle}>💵 Financial Requirements</h4>
        <div className={styles.financialGrid}>
          <div className={styles.financialItem}>
            <span className={styles.financialLabel}>Monthly Rent:</span>
            <span className={styles.financialValue}>{formatCurrency(property.monthly_rent)}</span>
          </div>
          {property.security_deposit && (
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Security Deposit:</span>
              <span className={styles.financialValue}>{formatCurrency(property.security_deposit)}</span>
            </div>
          )}
          {property.application_fee && (
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Application Fee:</span>
              <span className={styles.financialValue}>{formatCurrency(property.application_fee)}</span>
            </div>
          )}
          {property.weekly_rate && (
            <div className={styles.financialItem}>
              <span className={styles.financialLabel}>Weekly Rate:</span>
              <span className={styles.financialValue}>{formatCurrency(property.weekly_rate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Accepted Subsidies */}
      {property.accepted_subsidies && property.accepted_subsidies.length > 0 && (
        <div className={styles.requirementsSection}>
          <h4 className={styles.sectionSubtitle}>💰 Accepted Housing Assistance</h4>
          <div className={styles.tagGrid}>
            {property.accepted_subsidies.map((subsidy, i) => (
              <span key={i} className={styles.tagSuccess}>
                {subsidy.replace(/_/g, ' ').toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resident Restrictions (Recovery Housing) */}
      {property.is_recovery_housing && (
        <div className={styles.requirementsSection}>
          <h4 className={styles.sectionSubtitle}>👥 Resident Requirements</h4>
          <div className={styles.restrictionsList}>
            {property.gender_restrictions && property.gender_restrictions !== 'any' && (
              <div className={styles.restrictionItem}>
                <span className={styles.restrictionIcon}>⚧️</span>
                <div>
                  <strong>Gender:</strong>
                  <span className={styles.restrictionValue}>
                    {property.gender_restrictions.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>
            )}
            {property.age_restrictions && (
              <div className={styles.restrictionItem}>
                <span className={styles.restrictionIcon}>🎂</span>
                <div>
                  <strong>Age Restrictions:</strong>
                  <span className={styles.restrictionValue}>{property.age_restrictions}</span>
                </div>
              </div>
            )}
            {property.criminal_background_ok !== undefined && (
              <div className={styles.restrictionItem}>
                <span className={styles.restrictionIcon}>
                  {property.criminal_background_ok ? '✅' : '❌'}
                </span>
                <div>
                  <strong>Criminal Background:</strong>
                  <span className={styles.restrictionValue}>
                    {property.criminal_background_ok ? 'Will Consider' : 'Not Accepted'}
                  </span>
                </div>
              </div>
            )}
            {property.sex_offender_restrictions && (
              <div className={styles.restrictionItem}>
                <span className={styles.restrictionIcon}>⚠️</span>
                <div>
                  <strong>Sex Offender Restrictions:</strong>
                  <span className={styles.restrictionValue}>Cannot Accept</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Application Status */}
      <div className={styles.requirementsSection}>
        <h4 className={styles.sectionSubtitle}>📋 Application Status</h4>
        <div className={styles.applicationStatus}>
          {property.accepting_applications !== false ? (
            <div className={styles.statusActive}>
              <span className={styles.statusIcon}>✅</span>
              <span className={styles.statusText}>Currently Accepting Applications</span>
            </div>
          ) : (
            <div className={styles.statusInactive}>
              <span className={styles.statusIcon}>⏸️</span>
              <span className={styles.statusText}>Not Currently Accepting Applications</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * TAB 5: Contact - Landlord contact information
   */
  const renderContactTab = () => {
    // Contact info is stored directly on property object
    const displayPhone = property.phone;
    const displayEmail = property.contact_email;

    return (
      <div className={styles.tabContent}>
        {showContactInfo ? (
          <>
            <div className={styles.contactSection}>
              <h4 className={styles.sectionSubtitle}>📞 Landlord Contact Information</h4>
              
              <div className={styles.contactGrid}>
                {/* Phone Number */}
                {displayPhone && (
                  <div className={styles.contactCard}>
                    <span className={styles.contactIcon}>📱</span>
                    <div className={styles.contactInfo}>
                      <div className={styles.contactLabel}>Phone</div>
                      <a href={`tel:${displayPhone}`} className={styles.contactValue}>
                        {displayPhone}
                      </a>
                    </div>
                    <a 
                      href={`tel:${displayPhone}`}
                      className={styles.contactButton}
                      title="Call"
                    >
                      📱
                    </a>
                  </div>
                )}

                {/* Email Address */}
                {displayEmail && (
                  <div className={styles.contactCard}>
                    <span className={styles.contactIcon}>📧</span>
                    <div className={styles.contactInfo}>
                      <div className={styles.contactLabel}>Email</div>
                      <a 
                        href={`mailto:${displayEmail}`} 
                        className={styles.contactValue}>
                        {displayEmail}
                      </a>
                    </div>
                    <a 
                      href={`mailto:${displayEmail}`}
                      className={styles.contactButton}
                      title="Email"
                    >
                      📧
                    </a>
                  </div>
                )}
              </div>
            </div>

            {onContact && (
              <div className={styles.contactActions}>
                <button className="btn btn-primary btn-lg" onClick={() => onContact(property)}>
                  📞 Contact About This Property
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.contactLocked}>
            <div className={styles.lockIcon}>🔒</div>
            <div className={styles.lockContent}>
              <h4 className={styles.lockTitle}>Contact Information Locked</h4>
              <p className={styles.lockMessage}>
                Contact information will be available once your connection request is approved by the landlord.
              </p>
              <p className={styles.lockSubmessage}>
                After approval, you'll be able to contact the landlord directly to discuss the property and schedule viewings.
              </p>
            </div>
          </div>
        )}
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

  // Define tabs dynamically based on property type
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'features', label: 'Features', icon: '✨' },
  ];

  if (property.is_recovery_housing) {
    tabs.push({ id: 'recovery', label: 'Recovery Program', icon: '🌱' });
  }

  tabs.push({ id: 'requirements', label: 'Requirements', icon: '📋' });
  tabs.push({ id: 'contact', label: 'Contact', icon: '📞' });

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>×</button>
        
        {/* Property Header - UPDATED: No street address shown */}
        <div className={styles.propertyHeader} style={{ background: getHeaderGradient() }}>
          <div className={styles.propertyHeaderContent}>
            <div className={styles.propertyIcon}>
              {property.is_recovery_housing ? '🌱' : '🏠'}
            </div>
            <div className={styles.propertyHeaderInfo}>
              <h2 className={styles.propertyTitle}>
                {property.title || 'Property Listing'}
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

        {/* Tabbed Navigation */}
        <div className={styles.tabNavigation}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.modalBody}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'features' && renderFeaturesTab()}
          {activeTab === 'recovery' && renderRecoveryTab()}
          {activeTab === 'requirements' && renderRequirementsTab()}
          {activeTab === 'contact' && renderContactTab()}
        </div>

        {/* Action Buttons */}
        {renderActionButtons()}
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