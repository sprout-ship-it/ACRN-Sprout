// src/components/features/matching/components/MatchDetailsModal.js
import React from 'react';
import PropTypes from 'prop-types';

const MatchDetailsModal = ({
  match,
  onClose,
  onRequestMatch,
  isRequestSent,
  isAlreadyMatched
}) => {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {first_name} - {matchScore}% Match
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Connection Status */}
          {(isRequestSent || isAlreadyMatched) && (
            <div className="connection-status">
              {isAlreadyMatched && (
                <div className="alert alert-warning">
                  <strong>Already Connected:</strong> You're already connected with this user.
                </div>
              )}
              {isRequestSent && (
                <div className="alert alert-info">
                  <strong>Request Sent:</strong> You've already sent a roommate request to this user.
                </div>
              )}
            </div>
          )}

          {/* Personal Information */}
          <section className="detail-section">
            <h3 className="section-header">Personal Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{age || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Work Schedule:</span>
                <span className="detail-value">{work_schedule || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Smoking Status:</span>
                <span className="detail-value">{smoking_status || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Spiritual Affiliation:</span>
                <span className="detail-value">{spiritual_affiliation || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Bedtime Preference:</span>
                <span className="detail-value">{bedtime_preference || 'Not specified'}</span>
              </div>
            </div>
          </section>

          {/* Recovery Information */}
          <section className="detail-section">
            <h3 className="section-header">Recovery Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Recovery Stage:</span>
                <span className="detail-value">
                  {recovery_stage?.charAt(0).toUpperCase() + recovery_stage?.slice(1) || 'Not specified'}
                </span>
              </div>
            </div>
            
            {recovery_methods?.length > 0 && (
              <div className="detail-subsection">
                <h4 className="subsection-title">Recovery Methods</h4>
                <div className="badge-list">
                  {recovery_methods.map((method, i) => (
                    <span key={i} className="detail-badge method-badge">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {program_type?.length > 0 && (
              <div className="detail-subsection">
                <h4 className="subsection-title">Recovery Programs</h4>
                <div className="badge-list">
                  {program_type.map((program, i) => (
                    <span key={i} className="detail-badge program-badge">
                      {program}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {primary_issues?.length > 0 && (
              <div className="detail-subsection">
                <h4 className="subsection-title">Primary Issues</h4>
                <div className="badge-list">
                  {primary_issues.map((issue, i) => (
                    <span key={i} className="detail-badge issue-badge">
                      {issue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Lifestyle Preferences */}
          <section className="detail-section">
            <h3 className="section-header">Lifestyle Preferences</h3>
            <div className="lifestyle-scales">
              {renderLifestyleScale(cleanliness_level, 'Cleanliness Level')}
              {renderLifestyleScale(noise_level, 'Noise Tolerance')}
              {renderLifestyleScale(social_level, 'Social Level')}
            </div>
            
            <div className="yes-no-grid">
              {renderYesNo(pets_owned, 'Owns Pets')}
              {renderYesNo(pets_comfortable, 'Comfortable with Pets')}
              {renderYesNo(overnight_guests_ok, 'Overnight Guests OK')}
              {renderYesNo(shared_groceries, 'Open to Sharing Groceries')}
            </div>
          </section>

          {/* Housing Information */}
          <section className="detail-section">
            <h3 className="section-header">Housing Information</h3>
            
            {housing_type?.length > 0 && (
              <div className="detail-subsection">
                <h4 className="subsection-title">Preferred Housing Types</h4>
                <div className="badge-list">
                  {housing_type.map((type, i) => (
                    <span key={i} className="detail-badge housing-badge">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {housing_subsidy?.length > 0 && (
              <div className="detail-subsection">
                <h4 className="subsection-title">Housing Assistance</h4>
                <div className="badge-list">
                  {housing_subsidy.map((subsidy, i) => (
                    <span key={i} className="detail-badge subsidy-badge">
                      {subsidy}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Interests */}
          {interests?.length > 0 && (
            <section className="detail-section">
              <h3 className="section-header">Interests & Hobbies</h3>
              <div className="badge-list">
                {interests.map((interest, i) => (
                  <span key={i} className="detail-badge interest-badge">
                    {interest}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Personal Descriptions */}
          {about_me && (
            <section className="detail-section">
              <h3 className="section-header">About {first_name}</h3>
              <div className="text-content">
                <p>{about_me}</p>
              </div>
            </section>
          )}

          {looking_for && (
            <section className="detail-section">
              <h3 className="section-header">What {first_name} is Looking For</h3>
              <div className="text-content">
                <p>{looking_for}</p>
              </div>
            </section>
          )}

          {/* Compatibility Analysis */}
          <section className="detail-section">
            <h3 className="section-header">Compatibility Analysis</h3>
            
            {/* Green Flags */}
            {greenFlags.length > 0 && (
              <div className="compatibility-flags green-flags">
                <h4 className="flags-title green">✓ Compatibility Highlights</h4>
                <div className="flags-list">
                  {greenFlags.map((flag, i) => (
                    <div key={i} className="flag-item green-flag">
                      <span className="flag-icon">✓</span>
                      <span className="flag-text">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {redFlags.length > 0 && (
              <div className="compatibility-flags red-flags">
                <h4 className="flags-title red">⚠ Areas to Consider</h4>
                <div className="flags-list">
                  {redFlags.map((flag, i) => (
                    <div key={i} className="flag-item red-flag">
                      <span className="flag-icon">⚠</span>
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
          </section>
        </div>
        
        {/* Footer Actions */}
        <div className="modal-footer">
          <button
            className="btn btn-outline"
            onClick={onClose}
          >
            Close
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => {
              onRequestMatch(match);
              onClose();
            }}
            disabled={isRequestSent || isAlreadyMatched}
          >
            {isRequestSent ? 'Request Sent' :
             isAlreadyMatched ? 'Already Connected' :
             'Send Roommate Request'}
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