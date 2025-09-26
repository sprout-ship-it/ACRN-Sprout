// src/components/features/matching/components/MatchCard.js - SCHEMA ALIGNED
import React from 'react';
import PropTypes from 'prop-types';
import styles from './MatchCard.module.css';

const MatchCard = ({
  match,
  onShowDetails,
  onRequestMatch,
  isRequestSent,
  isAlreadyMatched
}) => {
  // ✅ SCHEMA ALIGNED: Extract data using correct field names
  const {
    first_name,
    date_of_birth,
    primary_city,
    primary_state,
    primary_location, // Generated column fallback
    recovery_stage,
    work_schedule,
    interests,
    smoking_status,
    about_me,
    // Algorithm-computed fields (not in database schema)
    matchScore,
    compatibility_score, // Alternative name for match score
    greenFlags,
    redFlags,
    match_factors // Alternative compatibility data structure
  } = match;

  // ✅ SCHEMA ALIGNED: Calculate age from date_of_birth
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

  // ✅ SCHEMA ALIGNED: Construct location from schema fields
  const getLocation = () => {
    // Use generated primary_location if available, otherwise construct from parts
    if (primary_location) {
      return primary_location;
    }
    
    if (primary_city && primary_state) {
      return `${primary_city}, ${primary_state}`;
    }
    
    return primary_city || primary_state || null;
  };

  // ✅ SCHEMA ALIGNED: Get match score from various possible sources
  const getMatchScore = () => {
    // Try different possible field names for match score
    return matchScore || compatibility_score || 0;
  };

  // ✅ SCHEMA ALIGNED: Extract compatibility flags from match_factors if available
  const getCompatibilityFlags = () => {
    if (greenFlags && redFlags) {
      return { greenFlags, redFlags };
    }
    
    // Try to extract from match_factors structure
    if (match_factors) {
      return {
        greenFlags: match_factors.green_flags || match_factors.positives || [],
        redFlags: match_factors.red_flags || match_factors.concerns || []
      };
    }
    
    return { greenFlags: [], redFlags: [] };
  };

  // Calculate derived values
  const age = calculateAge(date_of_birth);
  const location = getLocation();
  const score = getMatchScore();
  const { greenFlags: compatibilityGreenFlags, redFlags: compatibilityRedFlags } = getCompatibilityFlags();

  // Helper function to get match score color class
  const getScoreColorClass = (score) => {
    if (score >= 80) return styles.scoreExcellent;
    if (score >= 65) return styles.scoreGood;
    if (score >= 50) return styles.scoreFair;
    return styles.scoreLow;
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // ✅ SCHEMA ALIGNED: Format recovery stage display
  const formatRecoveryStage = (stage) => {
    if (!stage) return null;
    
    const stageMap = {
      'early': 'Early Recovery',
      'stabilizing': 'Stabilizing Recovery',
      'stable': 'Stable Recovery', 
      'long-term': 'Long-term Recovery',
      'maintenance': 'Maintenance Phase'
    };
    
    return stageMap[stage] || stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  // ✅ SCHEMA ALIGNED: Format work schedule display
  const formatWorkSchedule = (schedule) => {
    if (!schedule) return null;
    
    const scheduleMap = {
      'traditional_9_5': 'Traditional 9-5',
      'work_from_home': 'Work from Home',
      'night_shift': 'Night Shift',
      'early_morning': 'Early Morning',
      'part_time': 'Part-time',
      'flexible': 'Flexible Hours'
    };
    
    return scheduleMap[schedule] || schedule.replace(/_/g, ' ');
  };

  // ✅ SCHEMA ALIGNED: Format smoking status display
  const formatSmokingStatus = (status) => {
    if (!status) return null;
    
    const statusMap = {
      'non_smoker': 'Non-smoker',
      'outdoor_only': 'Outdoor Only',
      'occasional': 'Occasional',
      'regular': 'Regular Smoker',
      'former_smoker': 'Former Smoker'
    };
    
    return statusMap[status] || status.replace(/_/g, ' ');
  };

  return (
    <div className={`card ${styles.matchCard}`}>
      {/* Header with Name and Match Score */}
      <div className={styles.header}>
        <div className={styles.nameSection}>
          <h3 className="card-title">{first_name || 'Unknown User'}</h3>
          <div className="card-subtitle">
            {age && <span>{age} years old</span>}
            {age && location && <span> • </span>}
            {location && <span>{location}</span>}
          </div>
        </div>
        
        {/* Match Score Display */}
        {score > 0 && (
          <div className={`${styles.scoreDisplay} ${getScoreColorClass(score)}`}>
            <div className={styles.scoreNumber}>{score}%</div>
            <div className={styles.scoreLabel}>Match</div>
          </div>
        )}
      </div>

      {/* Status Badges */}
      {(isAlreadyMatched || isRequestSent) && (
        <div className={styles.statusSection}>
          {isAlreadyMatched && (
            <span className="badge badge-success">
              ✓ Already Connected
            </span>
          )}
          {isRequestSent && (
            <span className="badge badge-info">
              ⏳ Request Sent
            </span>
          )}
        </div>
      )}

      {/* Essential Information */}
      <div className={styles.essentials}>
        {recovery_stage && (
          <div className={styles.essentialItem}>
            <span className={styles.essentialIcon}>🌱</span>
            <span className={styles.essentialText}>
              {formatRecoveryStage(recovery_stage)}
            </span>
          </div>
        )}
        
        {work_schedule && (
          <div className={styles.essentialItem}>
            <span className={styles.essentialIcon}>⏰</span>
            <span className={styles.essentialText}>
              {formatWorkSchedule(work_schedule)}
            </span>
          </div>
        )}
        
        {smoking_status && (
          <div className={styles.essentialItem}>
            <span className={styles.essentialIcon}>🚭</span>
            <span className={styles.essentialText}>
              {formatSmokingStatus(smoking_status)}
            </span>
          </div>
        )}
      </div>

      {/* Compatibility Flags */}
      {((compatibilityGreenFlags && compatibilityGreenFlags.length > 0) || 
        (compatibilityRedFlags && compatibilityRedFlags.length > 0)) && (
        <div className={styles.compatibilitySection}>
          {/* Green Flags */}
          {compatibilityGreenFlags && compatibilityGreenFlags.length > 0 && (
            <div className={styles.flagGroup}>
              <div className={styles.flagHeader}>
                <span className={styles.flagIcon}>✅</span>
                <span className={styles.flagTitle}>Great Matches</span>
              </div>
              <div className={styles.flagTags}>
                {compatibilityGreenFlags.slice(0, 2).map((flag, i) => (
                  <span key={i} className={`${styles.flagTag} ${styles.greenFlag}`}>
                    {flag}
                  </span>
                ))}
                {compatibilityGreenFlags.length > 2 && (
                  <span className={styles.moreCount}>+{compatibilityGreenFlags.length - 2} more</span>
                )}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {compatibilityRedFlags && compatibilityRedFlags.length > 0 && (
            <div className={styles.flagGroup}>
              <div className={styles.flagHeader}>
                <span className={styles.flagIcon}>⚠️</span>
                <span className={styles.flagTitle}>Consider</span>
              </div>
              <div className={styles.flagTags}>
                {compatibilityRedFlags.slice(0, 1).map((flag, i) => (
                  <span key={i} className={`${styles.flagTag} ${styles.redFlag}`}>
                    {flag}
                  </span>
                ))}
                {compatibilityRedFlags.length > 1 && (
                  <span className={styles.moreCount}>+{compatibilityRedFlags.length - 1} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* About Preview */}
      {about_me && (
        <div className={styles.aboutSection}>
          <p className={styles.aboutText}>
            "{truncateText(about_me, 85)}"
          </p>
        </div>
      )}

      {/* Interests Preview */}
      {interests && Array.isArray(interests) && interests.length > 0 && (
        <div className={styles.interestsSection}>
          <div className={styles.interestsLabel}>Interests:</div>
          <div className={styles.interestsTags}>
            {interests.slice(0, 3).map((interest, i) => (
              <span key={i} className={styles.interestTag}>
                {interest}
              </span>
            ))}
            {interests.length > 3 && (
              <span className={styles.moreCount}>+{interests.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="button-grid">
        <button
          className="btn btn-outline"
          onClick={() => onShowDetails(match)}
        >
          View Profile
        </button>
        
        <button
          className={`btn btn-primary ${
            isRequestSent || isAlreadyMatched ? styles.disabledBtn : ''
          }`}
          onClick={() => onRequestMatch(match)}
          disabled={isRequestSent || isAlreadyMatched}
        >
          {isRequestSent ? 'Request Sent' :
           isAlreadyMatched ? 'Connected' :
           'Send Request'}
        </button>
      </div>
    </div>
  );
};

// ✅ SCHEMA ALIGNED: Updated PropTypes to reflect schema fields
MatchCard.propTypes = {
  match: PropTypes.shape({
    // Schema fields
    first_name: PropTypes.string.isRequired,
    date_of_birth: PropTypes.string, // ISO date string
    primary_city: PropTypes.string,
    primary_state: PropTypes.string,
    primary_location: PropTypes.string, // Generated column
    recovery_stage: PropTypes.string,
    work_schedule: PropTypes.string,
    interests: PropTypes.arrayOf(PropTypes.string),
    smoking_status: PropTypes.string,
    about_me: PropTypes.string,
    
    // Algorithm-computed fields (not in schema)
    matchScore: PropTypes.number,
    compatibility_score: PropTypes.number,
    greenFlags: PropTypes.arrayOf(PropTypes.string),
    redFlags: PropTypes.arrayOf(PropTypes.string),
    match_factors: PropTypes.object,
    
    // Deprecated legacy fields (for backward compatibility)
    age: PropTypes.number, // Calculated from date_of_birth
    location: PropTypes.string // Constructed from primary_city/primary_state
  }).isRequired,
  onShowDetails: PropTypes.func.isRequired,
  onRequestMatch: PropTypes.func.isRequired,
  isRequestSent: PropTypes.bool,
  isAlreadyMatched: PropTypes.bool
};

MatchCard.defaultProps = {
  isRequestSent: false,
  isAlreadyMatched: false
};

export default MatchCard;