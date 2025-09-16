// src/components/features/matching/components/MatchCard.js - IMPROVED VERSION
import React from 'react';
import PropTypes from 'prop-types';

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
    if (score >= 80) return 'score-excellent';
    if (score >= 65) return 'score-good';
    if (score >= 50) return 'score-fair';
    return 'score-low';
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="match-card-enhanced">
      {/* Header with Name and Large Match Score */}
      <div className="match-header">
        <div className="match-name-section">
          <h3 className="match-name">{first_name}</h3>
          <div className="match-basic-info">
            {age && <span>{age} years old</span>}
            {age && location && <span> • </span>}
            {location && <span>{location}</span>}
          </div>
        </div>
        
        {/* Large Prominent Match Score */}
        <div className={`match-score-display ${getScoreColorClass(matchScore)}`}>
          <div className="score-number">{matchScore}%</div>
          <div className="score-label">Match</div>
        </div>
      </div>

      {/* Status Badges */}
      {(isAlreadyMatched || isRequestSent) && (
        <div className="match-status-badges">
          {isAlreadyMatched && (
            <span className="status-badge connected">✓ Already Connected</span>
          )}
          {isRequestSent && (
            <span className="status-badge pending">⏳ Request Sent</span>
          )}
        </div>
      )}

      {/* Key Essential Info - Minimal */}
      <div className="match-essentials">
        {recovery_stage && (
          <div className="essential-item primary">
            <span className="essential-icon">🌱</span>
            <span className="essential-text">
              {recovery_stage.charAt(0).toUpperCase() + recovery_stage.slice(1)} Recovery
            </span>
          </div>
        )}
        
        {work_schedule && (
          <div className="essential-item">
            <span className="essential-icon">⏰</span>
            <span className="essential-text">{work_schedule}</span>
          </div>
        )}
        
        {smoking_status && (
          <div className="essential-item">
            <span className="essential-icon">🚭</span>
            <span className="essential-text">{smoking_status}</span>
          </div>
        )}
      </div>

      {/* Compatibility Flags - Prominent Display */}
      <div className="compatibility-preview">
        {/* Green Flags */}
        {greenFlags && greenFlags.length > 0 && (
          <div className="flags-section green-flags">
            <div className="flags-header">
              <span className="flag-icon">✅</span>
              <span className="flag-title">Great Matches</span>
            </div>
            <div className="flags-preview">
              {greenFlags.slice(0, 2).map((flag, i) => (
                <span key={i} className="flag-tag green">
                  {flag}
                </span>
              ))}
              {greenFlags.length > 2 && (
                <span className="more-flags">+{greenFlags.length - 2} more</span>
              )}
            </div>
          </div>
        )}

        {/* Red Flags */}
        {redFlags && redFlags.length > 0 && (
          <div className="flags-section red-flags">
            <div className="flags-header">
              <span className="flag-icon">⚠️</span>
              <span className="flag-title">Consider</span>
            </div>
            <div className="flags-preview">
              {redFlags.slice(0, 1).map((flag, i) => (
                <span key={i} className="flag-tag red">
                  {flag}
                </span>
              ))}
              {redFlags.length > 1 && (
                <span className="more-flags">+{redFlags.length - 1} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Brief About Preview */}
      {about_me && (
        <div className="about-preview">
          <p className="about-text">
            "{truncateText(about_me, 90)}"
          </p>
        </div>
      )}

      {/* Quick Interests Tags */}
      {interests && interests.length > 0 && (
        <div className="interests-preview">
          <div className="interests-label">Interests:</div>
          <div className="interests-tags">
            {interests.slice(0, 3).map((interest, i) => (
              <span key={i} className="interest-tag">
                {interest}
              </span>
            ))}
            {interests.length > 3 && (
              <span className="more-interests">+{interests.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="match-actions">
        <button
          className="btn btn-outline btn-details"
          onClick={() => onShowDetails(match)}
        >
          View Full Profile
        </button>
        
        <button
          className={`btn btn-primary btn-request ${
            isRequestSent || isAlreadyMatched ? 'btn-disabled' : ''
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