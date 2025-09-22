// src/components/features/matching/components/MatchCard.js - REFACTORED VERSION
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
  const {
    first_name,
    age,
    location,
    recovery_stage,
    work_schedule,
    interests,
    housing_type,
    spiritual_affiliation,
    smoking_status,
    about_me,
    matchScore,
    greenFlags,
    redFlags
  } = match;

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

  return (
    <div className={styles.matchCard}>
      {/* Header with Name and Large Match Score */}
      <div className={styles.header}>
        <div className={styles.nameSection}>
          <h3 className={styles.name}>{first_name}</h3>
          <div className={styles.basicInfo}>
            {age && <span>{age} years old</span>}
            {age && location && <span> • </span>}
            {location && <span>{location}</span>}
          </div>
        </div>
        
        {/* Large Prominent Match Score */}
        <div className={`${styles.scoreDisplay} ${getScoreColorClass(matchScore)}`}>
          <div className={styles.scoreNumber}>{matchScore}%</div>
          <div className={styles.scoreLabel}>Match</div>
        </div>
      </div>

      {/* Status Badges */}
      {(isAlreadyMatched || isRequestSent) && (
        <div className={styles.statusBadges}>
          {isAlreadyMatched && (
            <span className={`${styles.statusBadge} ${styles.connected}`}>
              ✓ Already Connected
            </span>
          )}
          {isRequestSent && (
            <span className={`${styles.statusBadge} ${styles.pending}`}>
              ⏳ Request Sent
            </span>
          )}
        </div>
      )}

      {/* Key Essential Info - Minimal */}
      <div className={styles.essentials}>
        {recovery_stage && (
          <div className={`${styles.essentialItem} ${styles.primary}`}>
            <span className={styles.essentialIcon}>🌱</span>
            <span className={styles.essentialText}>
              {recovery_stage.charAt(0).toUpperCase() + recovery_stage.slice(1)} Recovery
            </span>
          </div>
        )}
        
        {work_schedule && (
          <div className={styles.essentialItem}>
            <span className={styles.essentialIcon}>⏰</span>
            <span className={styles.essentialText}>{work_schedule}</span>
          </div>
        )}
        
        {smoking_status && (
          <div className={styles.essentialItem}>
            <span className={styles.essentialIcon}>🚭</span>
            <span className={styles.essentialText}>{smoking_status}</span>
          </div>
        )}
      </div>

      {/* Compatibility Flags - Prominent Display */}
      <div className={styles.compatibilityPreview}>
        {/* Green Flags */}
        {greenFlags && greenFlags.length > 0 && (
          <div className={styles.flagsSection}>
            <div className={styles.flagsHeader}>
              <span className={styles.flagIcon}>✅</span>
              <span className={styles.flagTitle}>Great Matches</span>
            </div>
            <div className={styles.flagsPreview}>
              {greenFlags.slice(0, 2).map((flag, i) => (
                <span key={i} className={`${styles.flagTag} ${styles.flagGreen}`}>
                  {flag}
                </span>
              ))}
              {greenFlags.length > 2 && (
                <span className={styles.moreFlags}>+{greenFlags.length - 2} more</span>
              )}
            </div>
          </div>
        )}

        {/* Red Flags */}
        {redFlags && redFlags.length > 0 && (
          <div className={styles.flagsSection}>
            <div className={styles.flagsHeader}>
              <span className={styles.flagIcon}>⚠️</span>
              <span className={styles.flagTitle}>Consider</span>
            </div>
            <div className={styles.flagsPreview}>
              {redFlags.slice(0, 1).map((flag, i) => (
                <span key={i} className={`${styles.flagTag} ${styles.flagRed}`}>
                  {flag}
                </span>
              ))}
              {redFlags.length > 1 && (
                <span className={styles.moreFlags}>+{redFlags.length - 1} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Brief About Preview */}
      {about_me && (
        <div className={styles.aboutPreview}>
          <p className={styles.aboutText}>
            "{truncateText(about_me, 90)}"
          </p>
        </div>
      )}

      {/* Quick Interests Tags */}
      {interests && interests.length > 0 && (
        <div className={styles.interestsPreview}>
          <div className={styles.interestsLabel}>Interests:</div>
          <div className={styles.interestsTags}>
            {interests.slice(0, 3).map((interest, i) => (
              <span key={i} className={styles.interestTag}>
                {interest}
              </span>
            ))}
            {interests.length > 3 && (
              <span className={styles.moreInterests}>+{interests.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          className={`btn btn-outline ${styles.detailsBtn}`}
          onClick={() => onShowDetails(match)}
        >
          View Full Profile
        </button>
        
        <button
          className={`btn btn-primary ${styles.requestBtn} ${
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

MatchCard.propTypes = {
  match: PropTypes.shape({
    first_name: PropTypes.string.isRequired,
    age: PropTypes.number,
    location: PropTypes.string,
    recovery_stage: PropTypes.string,
    work_schedule: PropTypes.string,
    interests: PropTypes.arrayOf(PropTypes.string),
    housing_type: PropTypes.arrayOf(PropTypes.string),
    spiritual_affiliation: PropTypes.string,
    smoking_status: PropTypes.string,
    about_me: PropTypes.string,
    matchScore: PropTypes.number.isRequired,
    greenFlags: PropTypes.arrayOf(PropTypes.string),
    redFlags: PropTypes.arrayOf(PropTypes.string),
    isRequestSent: PropTypes.bool,
    isAlreadyMatched: PropTypes.bool
  }).isRequired,
  onShowDetails: PropTypes.func.isRequired,
  onRequestMatch: PropTypes.func.isRequired,
  isRequestSent: PropTypes.bool,
  isAlreadyMatched: PropTypes.bool
};

export default MatchCard;