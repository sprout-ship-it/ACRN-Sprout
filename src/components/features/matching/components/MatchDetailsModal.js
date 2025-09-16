// src/components/features/matching/components/MatchDetailsModal.js - ENHANCED VERSION
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const MODAL_SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    icon: '👤'
  },
  {
    id: 'recovery',
    title: 'Recovery Info',
    icon: '🌱'
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
    id: 'compatibility',
    title: 'Compatibility',
    icon: '💫'
  },
  {
    id: 'about',
    title: 'About',
    icon: '✨'
  }
];

const MatchDetailsModal = ({
  match,
  onClose,
  onRequestMatch,
  isRequestSent,
  isAlreadyMatched
}) => {
  const [activeSection, setActiveSection] = useState('overview');

  if (!match) return null;

  const {
    first_name,
    age,
    location,
    recovery_stage,
    recovery_methods,
    program_type,
    primary_issues,
    work_schedule,
    cleanliness_level,
    noise_level,
    social_level,
    bedtime_preference,
    smoking_status,
    spiritual_affiliation,
    pets_owned,
    pets_comfortable,
    overnight_guests_ok,
    shared_groceries,
    housing_type,
    housing_subsidy,
    interests,
    about_me,
    looking_for,
    matchScore,
    greenFlags = [],
    redFlags = [],
    breakdown = {}
  } = match;

  // Helper function to get match score color class
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 65) return 'score-good';
    if (score >= 50) return 'score-fair';
    return 'score-low';
  };

  // Helper function to render lifestyle scale
  const renderLifestyleScale = (value, label) => {
    if (!value) return null;
    return (
      <div className="lifestyle-scale">
        <div className="scale-label">{label}</div>
        <div className="scale-indicator">
          <div className="scale-track">
            <div 
              className="scale-fill" 
              style={{ width: `${(value / 5) * 100}%` }}
            />
          </div>
          <span className="scale-value">{value}/5</span>
        </div>
      </div>
    );
  };

  // Helper function to render yes/no preference
  const renderYesNo = (value, label) => {
    if (value === undefined || value === null) return null;
    return (
      <div className="yes-no-item">
        <span className="yn-label">{label}:</span>
        <span className={`yn-value ${value ? 'yes' : 'no'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      </div>
    );
  };

  // Section rendering functions
  const renderOverviewSection = () => (
    <div className="modal-section">
      {/* Profile Header */}
      <div className="profile-header-enhanced">
        <div className="profile-info">
          <h2 className="profile-name">{first_name}</h2>
          <div className="profile-basics">
            {age && <span className="basic-item">{age} years old</span>}
            {location && <span className="basic-item">{location}</span>}
            {recovery_stage && (
              <span className="basic-item recovery-highlight">
                {recovery_stage.charAt(0).toUpperCase() + recovery_stage.slice(1)} Recovery
              </span>
            )}
          </div>
        </div>
        
        <div className={`match-score-large ${getScoreColorClass(matchScore)}`}>
          <div className="score-number">{matchScore}%</div>
          <div className="score-label">Compatibility</div>
        </div>
      </div>

      {/* Status Indicators */}
      {(isAlreadyMatched || isRequestSent) && (
        <div className="status-section">
          {isAlreadyMatched && (
            <div className="status-indicator connected">
              <span className="status-icon">✓</span>
              <span>Already Connected</span>
            </div>
          )}
          {isRequestSent && (
            <div className="status-indicator pending">
              <span className="status-icon">⏳</span>
              <span>Match Request Sent</span>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="overview-stats">
        <div className="stat-card">
          <span className="stat-icon">⏰</span>
          <div className="stat-content">
            <span className="stat-label">Work Schedule</span>
            <span className="stat-value">{work_schedule || 'Not specified'}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-icon">🚭</span>
          <div className="stat-content">
            <span className="stat-label">Smoking</span>
            <span className="stat-value">{smoking_status || 'Not specified'}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-icon">🙏</span>
          <div className="stat-content">
            <span className="stat-label">Spiritual</span>
            <span className="stat-value">{spiritual_affiliation || 'Not specified'}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-icon">🛏️</span>
          <div className="stat-content">
            <span className="stat-label">Bedtime</span>
            <span className="stat-value">{bedtime_preference || 'Not specified'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecoverySection = () => (
    <div className="modal-section">
      <div className="section-grid">
        <div className="info-card full-width">
          <h4 className="info-title">Recovery Stage</h4>
          <p className="info-content recovery-stage">
            {recovery_stage ? recovery_stage.charAt(0).toUpperCase() + recovery_stage.slice(1) : 'Not specified'}
          </p>
        </div>

        {recovery_methods && recovery_methods.length > 0 && (
          <div className="info-card full-width">
            <h4 className="info-title">Recovery Methods</h4>
            <div className="tags-container">
              {recovery_methods.map((method, i) => (
                <span key={i} className="tag recovery-method-tag">{method}</span>
              ))}
            </div>
          </div>
        )}

        {program_type && program_type.length > 0 && (
          <div className="info-card full-width">
            <h4 className="info-title">Recovery Programs</h4>
            <div className="tags-container">
              {program_type.map((program, i) => (
                <span key={i} className="tag program-tag">{program}</span>
              ))}
            </div>
          </div>
        )}

        {primary_issues && primary_issues.length > 0 && (
          <div className="info-card full-width">
            <h4 className="info-title">Primary Issues</h4>
            <div className="tags-container">
              {primary_issues.map((issue, i) => (
                <span key={i} className="tag issue-tag">
                  {issue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLifestyleSection = () => (
    <div className="modal-section">
      <div className="lifestyle-preferences">
        <h4 className="subsection-title">Living Preferences</h4>
        <div className="lifestyle-scales">
          {renderLifestyleScale(cleanliness_level, 'Cleanliness Level')}
          {renderLifestyleScale(noise_level, 'Noise Tolerance')}
          {renderLifestyleScale(social_level, 'Social Level')}
        </div>
      </div>
      
      <div className="lifestyle-choices">
        <h4 className="subsection-title">Lifestyle Choices</h4>
        <div className="yes-no-grid">
          {renderYesNo(pets_owned, 'Owns Pets')}
          {renderYesNo(pets_comfortable, 'Comfortable with Pets')}
          {renderYesNo(overnight_guests_ok, 'Overnight Guests OK')}
          {renderYesNo(shared_groceries, 'Open to Sharing Groceries')}
        </div>
      </div>
    </div>
  );

  const renderHousingSection = () => (
    <div className="modal-section">
      <div className="section-grid">
        {housing_type && housing_type.length > 0 && (
          <div className="info-card">
            <h4 className="info-title">Preferred Housing Types</h4>
            <div className="tags-container">
              {housing_type.map((type, i) => (
                <span key={i} className="tag housing-tag">{type}</span>
              ))}
            </div>
          </div>
        )}

        {housing_subsidy && housing_subsidy.length > 0 && (
          <div className="info-card">
            <h4 className="info-title">Housing Assistance</h4>
            <div className="tags-container">
              {housing_subsidy.map((subsidy, i) => (
                <span key={i} className="tag subsidy-tag">{subsidy}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompatibilitySection = () => (
    <div className="modal-section">
      {/* Green Flags */}
      {greenFlags.length > 0 && (
        <div className="compatibility-card green">
          <div className="compatibility-header">
            <span className="compatibility-icon">✅</span>
            <h4 className="compatibility-title">Compatibility Strengths</h4>
          </div>
          <div className="flags-list">
            {greenFlags.map((flag, i) => (
              <div key={i} className="flag-item">
                <span className="flag-bullet">•</span>
                <span className="flag-text">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="compatibility-card red">
          <div className="compatibility-header">
            <span className="compatibility-icon">⚠️</span>
            <h4 className="compatibility-title">Areas to Consider</h4>
          </div>
          <div className="flags-list">
            {redFlags.map((flag, i) => (
              <div key={i} className="flag-item">
                <span className="flag-bullet">•</span>
                <span className="flag-text">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compatibility Breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <div className="compatibility-breakdown">
          <h4 className="breakdown-title">Detailed Compatibility Scores</h4>
          <div className="breakdown-grid">
            {Object.entries(breakdown).map(([category, score]) => (
              <div key={category} className="breakdown-item">
                <div className="breakdown-label">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </div>
                <div className="breakdown-score">
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ 
                        width: `${score}%`,
                        backgroundColor: score >= 70 ? '#28a745' : score >= 50 ? '#ffc107' : '#dc3545'
                      }}
                    />
                  </div>
                  <span className="score-value">{score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAboutSection = () => (
    <div className="modal-section">
      {/* About Me */}
      {about_me && (
        <div className="about-card">
          <h4 className="about-title">About {first_name}</h4>
          <div className="about-content">
            <p>{about_me}</p>
          </div>
        </div>
      )}

      {/* What They're Looking For */}
      {looking_for && (
        <div className="about-card">
          <h4 className="about-title">What {first_name} is Looking For</h4>
          <div className="about-content">
            <p>{looking_for}</p>
          </div>
        </div>
      )}

      {/* Interests */}
      {interests && interests.length > 0 && (
        <div className="interests-card">
          <h4 className="interests-title">Interests & Hobbies</h4>
          <div className="interests-grid">
            {interests.map((interest, i) => (
              <span key={i} className="interest-item">{interest}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'recovery':
        return renderRecoverySection();
      case 'lifestyle':
        return renderLifestyleSection();
      case 'housing':
        return renderHousingSection();
      case 'compatibility':
        return renderCompatibilitySection();
      case 'about':
        return renderAboutSection();
      default:
        return renderOverviewSection();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-enhanced" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-enhanced">
          <div className="modal-title-section">
            <h2 className="modal-title">{first_name}'s Profile</h2>
            <div className={`modal-score ${getScoreColorClass(matchScore)}`}>
              {matchScore}% Match
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Section Navigation */}
        <div className="modal-navigation">
          {MODAL_SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`modal-nav-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-label">{section.title}</span>
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="modal-body-enhanced">
          {renderCurrentSection()}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer-enhanced">
          <button
            className="btn btn-outline"
            onClick={onClose}
          >
            Close
          </button>
          
          <button
            className={`btn btn-primary ${
              isRequestSent || isAlreadyMatched ? 'btn-disabled' : ''
            }`}
            onClick={() => {
              onRequestMatch(match);
              onClose();
            }}
            disabled={isRequestSent || isAlreadyMatched}
          >
            {isRequestSent ? 'Request Sent' :
             isAlreadyMatched ? 'Already Connected' :
             'Send Match Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

MatchDetailsModal.propTypes = {
  match: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onRequestMatch: PropTypes.func.isRequired,
  isRequestSent: PropTypes.bool,
  isAlreadyMatched: PropTypes.bool
};

export default MatchDetailsModal;