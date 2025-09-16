// src/components/features/matching/components/MatchCard.js
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

  return (
    <div className="match-card">
      <div className="match-card-header">
        <div className="match-info">
          <div className="match-name">{first_name}</div>
          <div className="match-score">{matchScore}% Match</div>
        </div>
        <div className="match-badges">
          {isAlreadyMatched && (
            <span className="badge badge-warning">Already Connected</span>
          )}
          {isRequestSent && (
            <span className="badge badge-info">Request Sent</span>
          )}
        </div>
      </div>
      
      <div className="match-details">
        {/* Essential Info Grid */}
        <div className="essential-info-grid">
          <div className="info-item">
            <span className="info-label">Age:</span>
            <span className="info-value">{age || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Location:</span>
            <span className="info-value">{location}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Recovery Stage:</span>
            <span className="info-value">
              {recovery_stage?.charAt(0).toUpperCase() + recovery_stage?.slice(1) || 'Not specified'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Work Schedule:</span>
            <span className="info-value">{work_schedule || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Smoking:</span>
            <span className="info-value">{smoking_status || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Spiritual:</span>
            <span className="info-value">{spiritual_affiliation || 'Not specified'}</span>
          </div>
        </div>

        {/* Housing Preferences */}
        {housing_type?.length > 0 && (
          <div className="housing-section">
            <div className="section-title">Housing Types</div>
            <div className="housing-types">
              {housing_type.slice(0, 3).map((type, i) => (
                <span key={i} className="housing-type-badge">
                  {type}
                </span>
              ))}
              {housing_type.length > 3 && (
                <span className="more-badge">+{housing_type.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Interests Preview */}
        {interests?.length > 0 && (
          <div className="interests-section">
            <div className="section-title">Interests</div>
            <div className="interests-preview">
              {interests.slice(0, 4).map((interest, i) => (
                <span key={i} className="interest-badge">
                  {interest}
                </span>
              ))}
              {interests.length > 4 && (
                <span className="more-badge">+{interests.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {/* About Me Preview */}
        {about_me && (
          <div className="about-preview">
            <div className="section-title">About</div>
            <p className="about-text">
              {about_me.length > 120 
                ? `${about_me.substring(0, 120)}...` 
                : about_me
              }
            </p>
          </div>
        )}

        {/* Compatibility Highlights */}
        <div className="compatibility-highlights">
          {/* Green Flags */}
          {greenFlags?.length > 0 && (
            <div className="green-flags-section">
              <div className="section-title green">✓ Compatibility Highlights</div>
              <div className="flags-container">
                {greenFlags.slice(0, 2).map((flag, i) => (
                  <span key={i} className="green-flag-preview">
                    {flag}
                  </span>
                ))}
                {greenFlags.length > 2 && (
                  <span className="more-flags">
                    +{greenFlags.length - 2} more highlights
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Red Flags */}
          {redFlags?.length > 0 && (
            <div className="red-flags-section">
              <div className="section-title red">⚠ Considerations</div>
              <div className="flags-container">
                {redFlags.slice(0, 1).map((flag, i) => (
                  <span key={i} className="red-flag-preview">
                    {flag}
                  </span>
                ))}
                {redFlags.length > 1 && (
                  <span className="more-flags">
                    +{redFlags.length - 1} more considerations
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="match-actions">
          <button
            className="btn btn-outline"
            onClick={() => onShowDetails(match)}
          >
            Show Full Details
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => onRequestMatch(match)}
            disabled={isRequestSent || isAlreadyMatched}
          >
            {isRequestSent ? 'Request Sent' :
             isAlreadyMatched ? 'Already Connected' :
             'Request Match'}
          </button>
        </div>
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