// src/components/features/matching/components/MatchDetailsModal.js - ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styles from './MatchDetailsModal.module.css';

const MODAL_SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    icon: '👤'
  },
  {
    id: 'recovery',
    title: 'Recovery',
    icon: '🌱'
  },
  {
    id: 'roommate',
    title: 'Roommate Preferences',
    icon: '👥'
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    icon: '⚖️'
  },
  {
    id: 'housing',
    title: 'Housing',
    icon: '🏠'
  },
  {
    id: 'personal',
    title: 'Personal Story',
    icon: '✨'
  },
  {
    id: 'compatibility',
    title: 'Compatibility',
    icon: '💫'
  }
];

// Portal Container Management
const getModalRoot = () => {
  let modalRoot = document.getElementById('modal-root');
  
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    modalRoot.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(modalRoot);
  }
  
  return modalRoot;
};

const MatchDetailsModal = ({
  match,
  onClose,
  onRequestMatch,
  customActions,
  isRequestSent,
  isAlreadyMatched,
  showContactInfo = false,
  usePortal = true,
  debugMode = false
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [modalContainer, setModalContainer] = useState(null);

  // Setup modal container
  useEffect(() => {
    if (usePortal) {
      const container = getModalRoot();
      setModalContainer(container);
    }
    
    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'relative';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
    };
  }, [usePortal]);

  // Enhanced close handler
  const handleClose = () => {
    onClose();
  };

  // Enhanced section change with scroll reset
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    
    // Reset scroll position
    const modalBody = document.querySelector(`.${styles.body}`);
    if (modalBody) {
      modalBody.scrollTop = 0;
    }
  };

  if (!match) return null;

  // Extract data from match object
  const {
    // Basic info
    first_name,
    date_of_birth,
    primary_city,
    primary_state,
    primary_location,
    gender_identity,
    biological_sex,
    
    // Contact info (gated)
    primary_phone,
    registrant_profiles,
    
    // Recovery fields
    recovery_stage,
    calculated_recovery_stage,
    sobriety_date,
    recovery_methods,
    program_types,
    primary_issues,
    spiritual_affiliation,
    primary_substance,
    recovery_goal_timeframe,
    support_meetings,
    sponsor_mentor,
    want_recovery_support,
    comfortable_discussing_recovery,
    attend_meetings_together,
    substance_free_home_required,
    recovery_context,
    
    // Roommate preferences
    preferred_roommate_gender,
    smoking_status,
    gender_inclusive,
    age_range_min,
    age_range_max,
    age_flexibility,
    pet_preference,
    smoking_preference,
    prefer_recovery_experience,
    supportive_of_recovery,
    respect_privacy,
    similar_schedules,
    shared_chores,
    financially_stable,
    respectful_guests,
    lgbtq_friendly,
    culturally_sensitive,
    deal_breaker_substance_use,
    deal_breaker_loudness,
    deal_breaker_uncleanliness,
    deal_breaker_financial_issues,
    deal_breaker_pets,
    deal_breaker_smoking,
    
    // Lifestyle fields
    work_schedule,
    work_from_home_frequency,
    bedtime_preference,
    cleanliness_level,
    noise_tolerance,
    social_level,
    guests_policy,
    social_activities_at_home,
    early_riser,
    night_owl,
    cooking_enthusiast,
    cooking_frequency,
    exercise_at_home,
    plays_instruments,
    tv_streaming_regular,
    chore_sharing_style,
    communication_style,
    conflict_resolution_style,
    preferred_support_structure,
    
    // Housing fields
    budget_min,
    budget_max,
    housing_types_accepted,
    housing_assistance,
    move_in_date,
    move_in_flexibility,
    max_commute_minutes,
    preferred_bedrooms,
    transportation_method,
    lease_duration,
    location_flexibility,
    furnished_preference,
    utilities_included_preference,
    accessibility_needed,
    parking_required,
    public_transit_access,
    
    // Personal story
    about_me,
    looking_for,
    interests,
    short_term_goals,
    long_term_vision,
    additional_interests,
    
    // Pets & preferences
    pets_owned,
    pets_comfortable,
    overnight_guests_ok,
    shared_groceries,
    shared_transportation,
    shared_activities_interest,
    recovery_accountability,
    shared_recovery_activities,
    mentorship_interest,
    recovery_community,
    
    // Algorithm fields
    matchScore,
    compatibility_score,
    greenFlags = [],
    redFlags = [],
    breakdown = {},
    match_factors,
    
    // Legacy support
    age,
    location
  } = match;

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  /**
   * Calculate age from date_of_birth
   */
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    
    return calculatedAge;
  };

  /**
   * Calculate recovery stage from sobriety date
   */
  const calculateRecoveryStage = (sobrietyDate) => {
    if (!sobrietyDate) return null;
    
    const daysSober = Math.floor(
      (new Date() - new Date(sobrietyDate)) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSober < 90) return 'early';
    if (daysSober < 365) return 'stabilizing';
    if (daysSober < 1095) return 'stable';
    if (daysSober < 1825) return 'long-term';
    return 'maintenance';
  };

  /**
   * Calculate time in recovery display
   */
  const calculateTimeInRecovery = (sobrietyDate) => {
    if (!sobrietyDate) return null;
    
    const recovery = new Date(sobrietyDate);
    const today = new Date();
    const diffTime = today - recovery;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      let result = `${years} year${years > 1 ? 's' : ''}`;
      if (remainingMonths > 0) {
        result += `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
      }
      return result;
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (value) => {
    if (!value) return '';
    const numValue = parseInt(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  };

  /**
   * Format phone number
   */
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  /**
   * Get location display (city, state only)
   */
  const getLocation = () => {
    if (primary_location) return primary_location;
    if (location) return location;
    if (primary_city && primary_state) return `${primary_city}, ${primary_state}`;
    return primary_city || primary_state || null;
  };

  /**
   * Get match score
   */
  const getMatchScore = () => {
    return matchScore || compatibility_score || 0;
  };

  /**
   * Get compatibility flags
   */
  const getCompatibilityFlags = () => {
    if (greenFlags && redFlags) {
      return { greenFlags, redFlags };
    }
    
    if (match_factors) {
      return {
        greenFlags: match_factors.green_flags || match_factors.positives || [],
        redFlags: match_factors.red_flags || match_factors.concerns || []
      };
    }
    
    return { greenFlags: [], redFlags: [] };
  };

  /**
   * ✨ NEW: Transform housing assistance from database format to readable text
   */
  const formatHousingAssistance = (assistance) => {
    const assistanceMap = {
      'section-8': 'Section 8 Housing Choice Voucher',
      'supportive-housing': 'Supportive Housing Program',
      'veteran-assistance': 'Veterans Housing Assistance',
      'tribal-housing': 'Tribal Housing Program',
      'housing-first': 'Housing First Program',
      'rental-assistance': 'Rental Assistance Program',
      'transitional-housing': 'Transitional Housing',
      'rapid-rehousing': 'Rapid Rehousing Program',
      'public-housing': 'Public Housing',
      'project-based': 'Project-Based Rental Assistance',
      'tbra': 'Tenant-Based Rental Assistance',
      'homeless-prevention': 'Homeless Prevention Program',
      'emergency-housing': 'Emergency Housing Assistance',
      'ssi-disability': 'SSI/Disability Housing Support',
      'none': 'No housing assistance'
    };

    if (typeof assistance === 'string') {
      return assistanceMap[assistance] || assistance.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    if (typeof assistance === 'object') {
      const value = assistance.value || assistance.label;
      return assistanceMap[value] || value?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
    }

    return 'Unknown';
  };

  /**
   * ✨ NEW: Get lifestyle score description with context from LifestylePreferencesSection
   */
  const getLifestyleLevelDescription = (type, value) => {
    const descriptions = {
      social_level: {
        1: 'Very Private - Minimal interaction, need quiet space for recovery focus',
        2: 'Somewhat Quiet - Occasional friendly conversations, respect for personal time',
        3: 'Balanced - Regular interaction with healthy boundaries',
        4: 'Social - Enjoy frequent interaction and group activities',
        5: 'Very Social - Thrive with constant interaction and community activities'
      },
      cleanliness_level: {
        1: 'Relaxed - Basic cleanliness, lived-in feel is comfortable',
        2: 'Casual - Generally clean but not obsessive about organization',
        3: 'Moderate - Regular cleaning routine, organized common spaces',
        4: 'High Standards - Very clean and well-organized environment',
        5: 'Pristine - Everything spotless and perfectly organized always'
      },
      noise_tolerance: {
        1: 'Very Quiet - Need peaceful environment for recovery/healing',
        2: 'Low Noise - Some sounds OK but prefer quiet, calm atmosphere',
        3: 'Moderate - Normal household noise is fine',
        4: 'Tolerant - Can handle louder activities and varied noise levels',
        5: 'High Tolerance - Music, TV, gatherings, varied noise levels all OK'
      }
    };
    return descriptions[type]?.[value] || `Level ${value}`;
  };

  // ========================================
  // FORMAT DISPLAY FUNCTIONS
  // ========================================

  const formatRecoveryStage = (stage) => {
    if (!stage) return 'Not specified';
    const stageMap = {
      'early': 'Early Recovery',
      'stabilizing': 'Stabilizing Recovery',
      'stable': 'Stable Recovery',
      'long-term': 'Long-term Recovery',
      'maintenance': 'Maintenance Phase'
    };
    return stageMap[stage] || stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  const formatWorkSchedule = (schedule) => {
    if (!schedule) return 'Not specified';
    const scheduleMap = {
      'traditional_9_5': 'Traditional 9-5',
      'flexible': 'Flexible Hours',
      'early_morning': 'Early Morning Shift',
      'night_shift': 'Night Shift',
      'student': 'Student Schedule',
      'irregular': 'Irregular/Varies',
      'unemployed': 'Currently Unemployed',
      'part_time': 'Part-time',
      'remote': 'Work from Home'
    };
    return scheduleMap[schedule] || schedule.replace(/_/g, ' ');
  };

  const formatSmokingStatus = (status) => {
    if (!status) return 'Not specified';
    const statusMap = {
      'non_smoker': 'Non-smoker',
      'outdoor_only': 'Outdoor Only',
      'occasional': 'Occasional Smoker',
      'regular': 'Regular Smoker',
      'former_smoker': 'Former Smoker'
    };
    return statusMap[status] || status.replace(/_/g, ' ');
  };

  const formatBedtimePreference = (preference) => {
    if (!preference) return 'Not specified';
    const preferenceMap = {
      'early': 'Early (before 10 PM)',
      'moderate': 'Moderate (10 PM - 12 AM)',
      'late': 'Late (after 12 AM)',
      'varies': 'Varies/Flexible'
    };
    return preferenceMap[preference] || preference;
  };

  const formatSpiritualAffiliation = (affiliation) => {
    if (!affiliation) return 'Not specified';
    const affiliationMap = {
      'christian-protestant': 'Christian (Protestant)',
      'christian-catholic': 'Christian (Catholic)',
      'christian-orthodox': 'Christian (Orthodox)',
      'muslim': 'Muslim',
      'jewish': 'Jewish',
      'buddhist': 'Buddhist',
      'hindu': 'Hindu',
      'spiritual-not-religious': 'Spiritual but not religious',
      'agnostic': 'Agnostic',
      'atheist': 'Atheist',
      'other': 'Other',
      'prefer-not-to-say': 'Prefer not to say'
    };
    return affiliationMap[affiliation] || affiliation;
  };

  const formatGenderPreference = (pref) => {
    if (!pref) return 'Not specified';
    const prefMap = {
      'male': 'Male roommates',
      'female': 'Female roommates',
      'non-binary': 'Non-binary roommates',
      'no-preference': 'No preference'
    };
    return prefMap[pref] || pref;
  };

  const formatPetPreference = (pref) => {
    if (!pref) return 'Not specified';
    const prefMap = {
      'no_pets': 'No pets preferred',
      'ok_with_pets': 'OK with pets',
      'prefer_pets': 'Prefer roommates with pets',
      'cat_friendly': 'Cat-friendly only',
      'dog_friendly': 'Dog-friendly only',
      'small_pets_only': 'Small pets only'
    };
    return prefMap[pref] || pref;
  };

  const formatSmokingPreference = (pref) => {
    if (!pref) return 'Not specified';
    const prefMap = {
      'non_smokers_only': 'Non-smokers only',
      'outdoor_smokers_ok': 'Outdoor smokers acceptable',
      'designated_area_ok': 'Designated smoking area OK',
      'any_smoking_ok': 'Any smoking status acceptable'
    };
    return prefMap[pref] || pref;
  };

  const formatHousingType = (type) => {
    return type.split(/[-_]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Calculate derived values
  const displayAge = calculateAge(date_of_birth) || age;
  const displayLocation = getLocation();
  const displayScore = getMatchScore();
  const timeInRecovery = sobriety_date ? calculateTimeInRecovery(sobriety_date) : null;
  const { greenFlags: compGreenFlags, redFlags: compRedFlags } = getCompatibilityFlags();
  const email = registrant_profiles?.email;

  // Helper function to get match score color class
  const getScoreColorClass = (score) => {
    if (score >= 80) return styles.scoreExcellent;
    if (score >= 65) return styles.scoreGood;
    if (score >= 50) return styles.scoreFair;
    return styles.scoreLow;
  };

  // Helper function to render lifestyle scale WITH EXPLANATIONS
  const renderLifestyleScale = (value, label, type) => {
    if (!value) return null;
    
    const description = getLifestyleLevelDescription(type, value);
    
    return (
      <div className={styles.lifestyleScale}>
        <div className={styles.scaleLabel}>{label}</div>
        <div className={styles.scaleIndicator}>
          <div className={styles.scaleTrack}>
            <div 
              className={styles.scaleFill} 
              style={{ width: `${(value / 5) * 100}%` }}
            />
          </div>
          <span className={styles.scaleValue}>{value}/5</span>
        </div>
        <div className={styles.lifestyleScoreExplanation}>
          <strong>Score {value}:</strong> {description}
        </div>
      </div>
    );
  };

  // Helper function to render yes/no preference
  const renderYesNo = (value, label) => {
    if (value === undefined || value === null) return null;
    return (
      <div className={styles.yesNoItem}>
        <span className={styles.ynLabel}>{label}:</span>
        <span className={`${styles.ynValue} ${value ? styles.yes : styles.no}`}>
          {value ? 'Yes' : 'No'}
        </span>
      </div>
    );
  };

  // ✨ NEW: Render stylized section header
  const renderSectionHeader = (title, subtitle, variant = 'default') => {
    const variantClass = {
      'recovery': styles.sectionHeaderRecovery,
      'roommate': styles.sectionHeaderRoommate,
      'lifestyle': styles.sectionHeaderLifestyle,
      'housing': styles.sectionHeaderHousing,
      'personal': styles.sectionHeaderPersonal
    }[variant] || '';

    return (
      <div className={`${styles.sectionHeader} ${variantClass}`}>
        <h3 className={styles.sectionHeaderTitle}>{title}</h3>
        {subtitle && <p className={styles.sectionHeaderSubtitle}>{subtitle}</p>}
      </div>
    );
  };

  // ========================================
  // SECTION RENDERING FUNCTIONS
  // ========================================

  const renderOverviewSection = () => (
    <div className={styles.section}>
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{first_name || 'Unknown User'}</h2>
          <div className={styles.profileBasics}>
            {displayAge && <span className={styles.basicItem}>{displayAge} years old</span>}
            {displayLocation && <span className={styles.basicItem}>{displayLocation}</span>}
            {gender_identity && (
              <span className={styles.basicItem}>
                {gender_identity.charAt(0).toUpperCase() + gender_identity.slice(1)}
              </span>
            )}
            {(calculated_recovery_stage || recovery_stage || sobriety_date) && (
              <span className={`${styles.basicItem} ${styles.recoveryHighlight}`}>
                {formatRecoveryStage(
                  calculated_recovery_stage || 
                  recovery_stage || 
                  calculateRecoveryStage(sobriety_date)
                )}
              </span>
            )}
          </div>
          {timeInRecovery && (
            <div className={styles.timeInRecovery}>
              <span className={styles.recoveryIcon}>🌱</span>
              <span>{timeInRecovery} in recovery</span>
            </div>
          )}
        </div>
        
        {displayScore > 0 && (
          <div className={`${styles.scoreLarge} ${getScoreColorClass(displayScore)}`}>
            <div className={styles.scoreNumber}>{displayScore}%</div>
            <div className={styles.scoreLabel}>Compatibility</div>
          </div>
        )}
      </div>

      {/* Contact Information Section (GATED) */}
      {showContactInfo && (primary_phone || email) && (
        <div className={styles.contactSection}>
          <div className={styles.contactHeader}>
            <h4 className={styles.contactTitle}>
              <span className={styles.contactIcon}>📞</span>
              Contact Information
            </h4>
            <span className={styles.contactBadge}>Connection Approved</span>
          </div>
          <div className={styles.contactDetails}>
            {primary_phone && (
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Phone:</span>
                <a href={`tel:${primary_phone}`} className={styles.contactValue}>
                  {formatPhoneNumber(primary_phone)}
                </a>
              </div>
            )}
            {email && (
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Email:</span>
                <a href={`mailto:${email}`} className={styles.contactValue}>
                  {email}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {(isAlreadyMatched || isRequestSent) && (
        <div className={styles.statusSection}>
          {isAlreadyMatched && (
            <div className={`${styles.statusIndicator} ${styles.connected}`}>
              <span className={styles.statusIcon}>✓</span>
              <span>Already Connected</span>
            </div>
          )}
          {isRequestSent && (
            <div className={`${styles.statusIndicator} ${styles.pending}`}>
              <span className={styles.statusIcon}>⏳</span>
              <span>Match Request Sent</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.overviewStats}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⏰</span>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Work Schedule</span>
            <span className={styles.statValue}>{formatWorkSchedule(work_schedule)}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🚭</span>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Smoking</span>
            <span className={styles.statValue}>{formatSmokingStatus(smoking_status)}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🙏</span>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Spiritual</span>
            <span className={styles.statValue}>{formatSpiritualAffiliation(spiritual_affiliation)}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🛏️</span>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Bedtime</span>
            <span className={styles.statValue}>{formatBedtimePreference(bedtime_preference)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecoverySection = () => (
    <div className={styles.section}>
      {renderSectionHeader('Recovery Journey', 'Understanding recovery stage and support needs', 'recovery')}
      
      {/* ✨ ENHANCED: Horizontal layout for recovery stage and spiritual approach */}
      <div className={styles.recoveryGrid}>
        <div className={styles.infoCard}>
          <h4 className={styles.infoTitle}>Recovery Stage</h4>
          <p className={`${styles.infoContent} ${styles.recoveryStage}`}>
            {formatRecoveryStage(
              calculated_recovery_stage || 
              recovery_stage || 
              calculateRecoveryStage(sobriety_date)
            )}
          </p>
          {timeInRecovery && (
            <p className={styles.timeInRecoveryDetail}>
              Time in recovery: {timeInRecovery}
            </p>
          )}
        </div>

        <div className={styles.infoCard}>
          <h4 className={styles.infoTitle}>Spiritual Approach</h4>
          <p className={styles.infoContent}>
            {formatSpiritualAffiliation(spiritual_affiliation)}
          </p>
        </div>
      </div>

      {/* ✨ ENHANCED: 3-column grid for recovery methods, programs, and primary focus */}
      {(primary_substance || recovery_methods || program_types) && (
        <div className={styles.recoveryGridThreeCol}>
          {primary_substance && (
            <div className={styles.infoCard}>
              <h4 className={styles.infoTitle}>Primary Focus Area</h4>
              <p className={styles.infoContent}>
                {primary_substance.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          )}

          {recovery_methods && recovery_methods.length > 0 && (
            <div className={styles.infoCard}>
              <h4 className={styles.infoTitle}>Recovery Methods</h4>
              <div className={styles.tagsContainer}>
                {recovery_methods.slice(0, 2).map((method, i) => (
                  <span key={i} className={`${styles.tag} ${styles.recoveryMethodTag}`}>
                    {method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
                {recovery_methods.length > 2 && (
                  <span className={`${styles.tag} ${styles.recoveryMethodTag}`}>
                    +{recovery_methods.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {program_types && program_types.length > 0 && (
            <div className={styles.infoCard}>
              <h4 className={styles.infoTitle}>Programs</h4>
              <div className={styles.tagsContainer}>
                {program_types.slice(0, 2).map((program, i) => (
                  <span key={i} className={`${styles.tag} ${styles.programTag}`}>{program}</span>
                ))}
                {program_types.length > 2 && (
                  <span className={`${styles.tag} ${styles.programTag}`}>
                    +{program_types.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {primary_issues && primary_issues.length > 0 && (
        <div className={`${styles.infoCard} ${styles.fullWidth}`}>
          <h4 className={styles.infoTitle}>Primary Issues</h4>
          <div className={styles.tagsContainer}>
            {primary_issues.map((issue, i) => (
              <span key={i} className={`${styles.tag} ${styles.issueTag}`}>
                {issue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      {(support_meetings || sponsor_mentor || recovery_goal_timeframe) && (
        <div className={`${styles.infoCard} ${styles.fullWidth}`}>
          <h4 className={styles.infoTitle}>Support Structure</h4>
          <div className={styles.supportDetails}>
            {support_meetings && (
              <div className={styles.supportItem}>
                <span className={styles.supportIcon}>📅</span>
                <span>{support_meetings.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            )}
            {sponsor_mentor && (
              <div className={styles.supportItem}>
                <span className={styles.supportIcon}>🤝</span>
                <span>Has sponsor/mentor</span>
              </div>
            )}
            {recovery_goal_timeframe && (
              <div className={styles.supportItem}>
                <span className={styles.supportIcon}>🎯</span>
                <span>{recovery_goal_timeframe.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {(want_recovery_support || comfortable_discussing_recovery || attend_meetings_together || substance_free_home_required) && (
        <div className={`${styles.infoCard} ${styles.fullWidth}`}>
          <h4 className={styles.infoTitle}>Recovery Living Preferences</h4>
          <div className={styles.yesNoGrid}>
            {renderYesNo(want_recovery_support, 'Wants recovery support')}
            {renderYesNo(comfortable_discussing_recovery, 'Comfortable discussing recovery')}
            {renderYesNo(attend_meetings_together, 'Open to attending meetings together')}
            {renderYesNo(substance_free_home_required, 'Requires substance-free home')}
          </div>
        </div>
      )}

      {recovery_context && (
        <div className={`${styles.infoCard} ${styles.fullWidth}`}>
          <h4 className={styles.infoTitle}>Additional Recovery Context</h4>
          <p className={styles.infoContent}>{recovery_context}</p>
        </div>
      )}
    </div>
  );

  const renderRoommatePreferencesSection = () => (
    <div className={styles.section}>
      {renderSectionHeader('Roommate Preferences', 'What to look for in a compatible roommate', 'roommate')}
      
      <div className={styles.sectionGrid}>
        <div className={styles.infoCard}>
          <h4 className={styles.infoTitle}>Gender Preference</h4>
          <p className={styles.infoContent}>{formatGenderPreference(preferred_roommate_gender)}</p>
          {gender_inclusive && (
            <p className={styles.infoNote}>Open to gender-inclusive housing</p>
          )}
        </div>

        {(age_range_min || age_range_max) && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Age Range</h4>
            <p className={styles.infoContent}>
              {age_range_min || 18} - {age_range_max || 65} years old
            </p>
            {age_flexibility && (
              <p className={styles.infoNote}>
                {age_flexibility.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            )}
          </div>
        )}

        <div className={styles.infoCard}>
          <h4 className={styles.infoTitle}>Smoking Preference</h4>
          <p className={styles.infoContent}>{formatSmokingPreference(smoking_preference)}</p>
        </div>

        <div className={styles.infoCard}>
          <h4 className={styles.infoTitle}>Pet Preference</h4>
          <p className={styles.infoContent}>{formatPetPreference(pet_preference)}</p>
        </div>
      </div>

      {(prefer_recovery_experience || supportive_of_recovery || respect_privacy) && (
        <div className={`${styles.infoCard} ${styles.fullWidth}`}>
          <h4 className={styles.infoTitle}>Recovery Compatibility Preferences</h4>
          <div className={styles.yesNoGrid}>
            {renderYesNo(prefer_recovery_experience, 'Prefers roommates with recovery experience')}
            {renderYesNo(supportive_of_recovery, 'Must be supportive of recovery')}
            {renderYesNo(respect_privacy, 'Must respect recovery privacy')}
          </div>
        </div>
      )}

      {/* ✨ ENHANCED: 3x2 Grid for Living Compatibility Preferences */}
      {(similar_schedules || shared_chores || financially_stable || respectful_guests || lgbtq_friendly || culturally_sensitive) && (
        <div className={`${styles.infoCard} ${styles.fullWidth}`}>
          <h4 className={styles.infoTitle}>Living Compatibility Preferences</h4>
          <div className={styles.yesNoGrid}>
            {renderYesNo(similar_schedules, 'Prefers similar schedules')}
            {renderYesNo(shared_chores, 'Willing to share chores')}
            {renderYesNo(financially_stable, 'Requires financial stability')}
            {renderYesNo(respectful_guests, 'Requires respectful guest policy')}
            {renderYesNo(lgbtq_friendly, 'LGBTQ+ friendly required')}
            {renderYesNo(culturally_sensitive, 'Cultural sensitivity required')}
          </div>
        </div>
      )}

      {(deal_breaker_substance_use || deal_breaker_loudness || deal_breaker_uncleanliness || 
        deal_breaker_financial_issues || deal_breaker_pets || deal_breaker_smoking) && (
        <div className={`${styles.infoCard} ${styles.fullWidth} ${styles.dealBreakersCard}`}>
          <h4 className={styles.infoTitle}>
            <span className={styles.warningIcon}>⚠️</span>
            Deal Breakers
          </h4>
          <div className={styles.dealBreakersList}>
            {deal_breaker_substance_use && (
              <div className={styles.dealBreakerItem}>
                <span className={styles.dealBreakerIcon}>❌</span>
                <span>Any substance use in home</span>
              </div>
            )}
            {deal_breaker_loudness && (
              <div className={styles.dealBreakerItem}>
                <span className={styles.dealBreakerIcon}>❌</span>
                <span>Excessive noise or disruptive behavior</span>
              </div>
            )}
            {deal_breaker_uncleanliness && (
              <div className={styles.dealBreakerItem}>
                <span className={styles.dealBreakerIcon}>❌</span>
                <span>Poor hygiene or extreme messiness</span>
              </div>
            )}
            {deal_breaker_financial_issues && (
              <div className={styles.dealBreakerItem}>
                <span className={styles.dealBreakerIcon}>❌</span>
                <span>Unreliable with rent or bills</span>
              </div>
            )}
            {deal_breaker_pets && (
              <div className={styles.dealBreakerItem}>
                <span className={styles.dealBreakerIcon}>❌</span>
                <span>Any pets in home</span>
              </div>
            )}
            {deal_breaker_smoking && (
              <div className={styles.dealBreakerItem}>
                <span className={styles.dealBreakerIcon}>❌</span>
                <span>Any smoking</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderLifestyleSection = () => (
    <div className={styles.section}>
      {renderSectionHeader('Lifestyle Compatibility', 'Daily habits, routines, and living preferences', 'lifestyle')}
      
      <div className={styles.lifestylePreferences}>
        <h4 className={styles.subsectionTitle}>Core Lifestyle Factors</h4>
        <div className={styles.lifestyleScales}>
          {renderLifestyleScale(cleanliness_level, 'Cleanliness Level', 'cleanliness_level')}
          {renderLifestyleScale(noise_tolerance, 'Noise Tolerance', 'noise_tolerance')}
          {renderLifestyleScale(social_level, 'Social Level', 'social_level')}
        </div>
      </div>

      <div className={styles.sectionGrid}>
        {work_from_home_frequency && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Work from Home</h4>
            <p className={styles.infoContent}>
              {work_from_home_frequency.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        )}

        {guests_policy && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Guest Policy</h4>
            <p className={styles.infoContent}>
              {guests_policy.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        )}

        {social_activities_at_home && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Social Activities at Home</h4>
            <p className={styles.infoContent}>
              {social_activities_at_home.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        )}

        {cooking_frequency && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Cooking Frequency</h4>
            <p className={styles.infoContent}>
              {cooking_frequency.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        )}
      </div>

      {/* ✨ ENHANCED: 3x2 Grid for Daily Habits */}
      {(early_riser || night_owl || cooking_enthusiast || exercise_at_home || plays_instruments || tv_streaming_regular) && (
        <div className={styles.lifestyleChoices}>
          <h4 className={styles.subsectionTitle}>Daily Habits</h4>
          <div className={styles.yesNoGrid}>
            {renderYesNo(early_riser, 'Early riser')}
            {renderYesNo(night_owl, 'Night owl')}
            {renderYesNo(cooking_enthusiast, 'Cooking enthusiast')}
            {renderYesNo(exercise_at_home, 'Exercises at home')}
            {renderYesNo(plays_instruments, 'Plays instruments')}
            {renderYesNo(tv_streaming_regular, 'Regular TV/streaming')}
          </div>
        </div>
      )}

      <div className={styles.sectionGrid}>
        {chore_sharing_style && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Chore Sharing Style</h4>
            <p className={styles.infoContent}>
              {chore_sharing_style.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        )}

        {communication_style && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Communication Style</h4>
            <p className={styles.infoContent}>
              {communication_style.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        )}

        {conflict_resolution_style && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Conflict Resolution</h4>
            <p className={styles.infoContent}>
              {conflict_resolution_style.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        )}

        {preferred_support_structure && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Preferred Support Structure</h4>
            <p className={styles.infoContent}>
              {preferred_support_structure.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        )}
      </div>

      {/* ✨ ENHANCED: 3x2 Grid for Living Preferences */}
      {(pets_owned || pets_comfortable || overnight_guests_ok || shared_groceries || 
        shared_transportation || shared_activities_interest) && (
        <div className={styles.lifestyleChoices}>
          <h4 className={styles.subsectionTitle}>Living Preferences</h4>
          <div className={styles.yesNoGrid}>
            {renderYesNo(pets_owned, 'Owns pets')}
            {renderYesNo(pets_comfortable, 'Comfortable with pets')}
            {renderYesNo(overnight_guests_ok, 'Overnight guests OK')}
            {renderYesNo(shared_groceries, 'Open to sharing groceries')}
            {renderYesNo(shared_transportation, 'Open to sharing transportation')}
            {renderYesNo(shared_activities_interest, 'Interested in shared activities')}
          </div>
        </div>
      )}

      {(recovery_accountability || shared_recovery_activities || mentorship_interest || recovery_community) && (
        <div className={styles.lifestyleChoices}>
          <h4 className={styles.subsectionTitle}>Recovery Support Preferences</h4>
          <div className={styles.yesNoGrid}>
            {renderYesNo(recovery_accountability, 'Values recovery accountability')}
            {renderYesNo(shared_recovery_activities, 'Open to shared recovery activities')}
            {renderYesNo(mentorship_interest, 'Interested in mentorship')}
            {renderYesNo(recovery_community, 'Wants recovery-focused community')}
          </div>
        </div>
      )}
    </div>
  );

  const renderHousingSection = () => (
    <div className={styles.section}>
      {renderSectionHeader('Housing Requirements', 'Budget, timeline, and location preferences', 'housing')}
      
      <div className={styles.sectionGrid}>
        {(budget_min || budget_max) && (
          <div className={`${styles.infoCard} ${styles.fullWidth} ${styles.budgetCard}`}>
            <h4 className={styles.infoTitle}>Monthly Budget</h4>
            <div className={styles.budgetRange}>
              <span className={styles.budgetAmount}>{formatCurrency(budget_min)}</span>
              <span className={styles.budgetSeparator}>to</span>
              <span className={styles.budgetAmount}>{formatCurrency(budget_max)}</span>
            </div>
          </div>
        )}

        {move_in_date && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Move-in Date</h4>
            <p className={styles.infoContent}>
              {new Date(move_in_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {move_in_flexibility && (
              <p className={styles.infoNote}>
                {move_in_flexibility.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            )}
          </div>
        )}

        {max_commute_minutes && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Max Commute</h4>
            <p className={styles.infoContent}>
              {max_commute_minutes === 'unlimited' ? 'No limit' : `${max_commute_minutes} minutes`}
            </p>
          </div>
        )}

        {preferred_bedrooms && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Preferred Bedrooms</h4>
            <p className={styles.infoContent}>
              {preferred_bedrooms === '1' ? 'Studio/1 bedroom' : `${preferred_bedrooms} bedrooms`}
            </p>
          </div>
        )}

        {transportation_method && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Transportation</h4>
            <p className={styles.infoContent}>
              {transportation_method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        )}

        {lease_duration && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Lease Duration</h4>
            <p className={styles.infoContent}>
              {lease_duration.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        )}

        {location_flexibility && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Location Flexibility</h4>
            <p className={styles.infoContent}>
              {location_flexibility.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        )}
      </div>

      {housing_types_accepted && housing_types_accepted.length > 0 && (
        <div className={styles.infoCard}>
          <h4 className={styles.infoTitle}>Acceptable Housing Types</h4>
          <div className={styles.tagsContainer}>
            {housing_types_accepted.map((type, i) => (
              <span key={i} className={`${styles.tag} ${styles.housingTag}`}>
                {formatHousingType(type)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ✨ ENHANCED: Housing assistance with formatted display */}
      {housing_assistance && housing_assistance.length > 0 && (
        <div className={styles.infoCard}>
          <h4 className={styles.infoTitle}>Housing Assistance Programs</h4>
          <div className={styles.tagsContainer}>
            {housing_assistance.map((assistance, i) => (
              <span key={i} className={`${styles.tag} ${styles.subsidyTag}`}>
                {formatHousingAssistance(assistance)}
              </span>
            ))}
          </div>
        </div>
      )}

      {(furnished_preference || utilities_included_preference || accessibility_needed || 
        parking_required || public_transit_access) && (
        <div className={styles.infoCard}>
          <h4 className={styles.infoTitle}>Additional Housing Preferences</h4>
          <div className={styles.yesNoGrid}>
            {renderYesNo(furnished_preference, 'Prefers furnished')}
            {renderYesNo(utilities_included_preference, 'Prefers utilities included')}
            {renderYesNo(accessibility_needed, 'Needs accessibility features')}
            {renderYesNo(parking_required, 'Parking required')}
            {renderYesNo(public_transit_access, 'Needs public transit access')}
          </div>
        </div>
      )}
    </div>
  );

  const renderPersonalStorySection = () => (
    <div className={styles.section}>
      {renderSectionHeader('Personal Story', `Get to know ${first_name} beyond the basics`, 'personal')}
      
      {about_me && (
        <div className={styles.aboutCard}>
          <h4 className={styles.aboutTitle}>About {first_name}</h4>
          <div className={styles.aboutContent}>
            <p>{about_me}</p>
          </div>
        </div>
      )}

      {looking_for && (
        <div className={styles.aboutCard}>
          <h4 className={styles.aboutTitle}>What {first_name} is Looking For</h4>
          <div className={styles.aboutContent}>
            <p>{looking_for}</p>
          </div>
        </div>
      )}

      {short_term_goals && (
        <div className={styles.aboutCard}>
          <h4 className={styles.aboutTitle}>Short-term Goals</h4>
          <div className={styles.aboutContent}>
            <p>{short_term_goals}</p>
          </div>
        </div>
      )}

      {long_term_vision && (
        <div className={styles.aboutCard}>
          <h4 className={styles.aboutTitle}>Long-term Vision</h4>
          <div className={styles.aboutContent}>
            <p>{long_term_vision}</p>
          </div>
        </div>
      )}

      {interests && Array.isArray(interests) && interests.length > 0 && (
        <div className={styles.interestsCard}>
          <h4 className={styles.interestsTitle}>Interests & Hobbies</h4>
          <div className={styles.interestsGrid}>
            {interests.map((interest, i) => (
              <span key={i} className={styles.interestItem}>{interest}</span>
            ))}
          </div>
        </div>
      )}

      {additional_interests && (
        <div className={styles.aboutCard}>
          <h4 className={styles.aboutTitle}>Additional Interests</h4>
          <div className={styles.aboutContent}>
            <p>{additional_interests}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderCompatibilitySection = () => (
    <div className={styles.section}>
      {compGreenFlags.length > 0 && (
        <div className={`${styles.compatibilityCard} ${styles.green}`}>
          <div className={styles.compatibilityHeader}>
            <span className={styles.compatibilityIcon}>✅</span>
            <h4 className={styles.compatibilityTitle}>Compatibility Strengths</h4>
          </div>
          <div className={styles.flagsList}>
            {compGreenFlags.map((flag, i) => (
              <div key={i} className={styles.flagItem}>
                <span className={styles.flagBullet}>•</span>
                <span className={styles.flagText}>{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {compRedFlags.length > 0 && (
        <div className={`${styles.compatibilityCard} ${styles.red}`}>
          <div className={styles.compatibilityHeader}>
            <span className={styles.compatibilityIcon}>⚠️</span>
            <h4 className={styles.compatibilityTitle}>Areas to Consider</h4>
          </div>
          <div className={styles.flagsList}>
            {compRedFlags.map((flag, i) => (
              <div key={i} className={styles.flagItem}>
                <span className={styles.flagBullet}>•</span>
                <span className={styles.flagText}>{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(breakdown).length > 0 && (
        <div className={styles.compatibilityBreakdown}>
          <h4 className={styles.breakdownTitle}>Detailed Compatibility Scores</h4>
          <div className={styles.breakdownGrid}>
            {Object.entries(breakdown).map(([category, score]) => (
              <div key={category} className={styles.breakdownItem}>
                <div className={styles.breakdownLabel}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </div>
                <div className={styles.breakdownScore}>
                  <div className={styles.scoreBar}>
                    <div 
                      className={styles.scoreBarFill}
                      style={{ 
                        width: `${score}%`,
                        backgroundColor: score >= 70 ? '#28a745' : score >= 50 ? '#ffc107' : '#dc3545'
                      }}
                    />
                  </div>
                  <span className={styles.breakdownScoreValue}>{score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {compGreenFlags.length === 0 && compRedFlags.length === 0 && Object.keys(breakdown).length === 0 && (
        <div className={styles.noCompatibilityData}>
          <p>Detailed compatibility analysis not available for this profile.</p>
        </div>
      )}
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverviewSection();
      case 'recovery': return renderRecoverySection();
      case 'roommate': return renderRoommatePreferencesSection();
      case 'lifestyle': return renderLifestyleSection();
      case 'housing': return renderHousingSection();
      case 'personal': return renderPersonalStorySection();
      case 'compatibility': return renderCompatibilitySection();
      default: return renderOverviewSection();
    }
  };

  // Filter sections - only show compatibility if data exists
  const visibleSections = MODAL_SECTIONS.filter(section => {
    if (section.id === 'compatibility') {
      return compGreenFlags.length > 0 || compRedFlags.length > 0 || Object.keys(breakdown).length > 0;
    }
    return true;
  });

  // Modal JSX
  const modalJSX = (
    <div 
      className={`${styles.overlay} ${!usePortal ? styles.emergencyOverride : ''}`}
      onClick={handleClose}
      style={{
        pointerEvents: 'auto'
      }}
    >
      <div 
        className={`${styles.content} ${!usePortal ? styles.contentEmergencyOverride : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>{first_name}'s Profile</h2>
            {displayScore > 0 && (
              <div className={`${styles.score} ${getScoreColorClass(displayScore)}`}>
                {displayScore}% Match
              </div>
            )}
          </div>
          <button className={styles.closeButton} onClick={handleClose}>×</button>
        </div>

        {/* Section Navigation */}
        <div className={styles.navigation}>
          {visibleSections.map((section) => (
            <button
              key={section.id}
              className={`${styles.navTab} ${activeSection === section.id ? styles.active : ''}`}
              onClick={() => handleSectionChange(section.id)}
            >
              <span className={styles.navIcon}>{section.icon}</span>
              <span className={styles.navLabel}>{section.title}</span>
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className={styles.body}>
          {renderCurrentSection()}
        </div>

        {/* Modal Footer */}
        <div className={styles.footer}>
          {customActions ? (
            <>
              <button
                className="btn btn-outline"
                onClick={() => {
                  if (customActions.onDecline) {
                    customActions.onDecline();
                  } else {
                    handleClose();
                  }
                }}
              >
                {customActions.declineLabel || 'Close'}
              </button>
              <button
                className="btn btn-success"
                onClick={() => {
                  if (customActions.onAccept) {
                    customActions.onAccept();
                  } else {
                    onRequestMatch(match);
                    handleClose();
                  }
                }}
              >
                {customActions.acceptLabel || 'Accept Connection'}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={handleClose}>
                Close
              </button>
              
              <button
                className={`btn btn-primary ${
                  isRequestSent || isAlreadyMatched ? 'btn-disabled' : ''
                }`}
                onClick={() => {
                  onRequestMatch(match);
                  handleClose();
                }}
                disabled={isRequestSent || isAlreadyMatched}
              >
                {isRequestSent ? 'Request Sent' :
                 isAlreadyMatched ? 'Already Connected' :
                 'Send Match Request'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render with or without portal
  if (usePortal && modalContainer) {
    return createPortal(modalJSX, modalContainer);
  } else {
    return modalJSX;
  }
};

MatchDetailsModal.propTypes = {
  match: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onRequestMatch: PropTypes.func.isRequired,
  customActions: PropTypes.shape({
    acceptLabel: PropTypes.string,
    declineLabel: PropTypes.string,
    onAccept: PropTypes.func,
    onDecline: PropTypes.func
  }),
  isRequestSent: PropTypes.bool,
  isAlreadyMatched: PropTypes.bool,
  showContactInfo: PropTypes.bool,
  usePortal: PropTypes.bool,
  debugMode: PropTypes.bool
};

MatchDetailsModal.defaultProps = {
  isRequestSent: false,
  isAlreadyMatched: false,
  showContactInfo: false,
  usePortal: true,
  debugMode: false
};

export default MatchDetailsModal;