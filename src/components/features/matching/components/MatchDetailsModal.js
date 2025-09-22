// src/components/features/matching/components/MatchDetailsModal.js - PORTAL-BASED SOLUTION
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

// 🔧 DEBUG: Stacking context detection utility
const debugStackingContext = (element, label) => {
  if (!element) return;
  
  const computedStyles = window.getComputedStyle(element);
  const stackingProps = {
    position: computedStyles.position,
    zIndex: computedStyles.zIndex,
    transform: computedStyles.transform,
    opacity: computedStyles.opacity,
    isolation: computedStyles.isolation,
    filter: computedStyles.filter
  };
  
  console.log(`🔍 ${label} stacking context:`, stackingProps);
  
  // Check if creates stacking context
  const createsContext = (
    (computedStyles.position !== 'static' && computedStyles.zIndex !== 'auto') ||
    computedStyles.transform !== 'none' ||
    computedStyles.opacity !== '1' ||
    computedStyles.isolation === 'isolate' ||
    computedStyles.filter !== 'none'
  );
  
  console.log(`📊 ${label} creates stacking context:`, createsContext);
  return createsContext;
};

// 🎯 Portal Container Management
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
    console.log('✅ Created modal-root portal container');
  }
  
  return modalRoot;
};

const MatchDetailsModal = ({
  match,
  onClose,
  onRequestMatch,
  isRequestSent,
  isAlreadyMatched,
  usePortal = true,
  debugMode = false
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [modalContainer, setModalContainer] = useState(null);

  // 🔧 Setup modal container and debugging
  useEffect(() => {
    console.log('🎭 MatchDetailsModal: Setting up modal...');
    
    // Debug mode: analyze stacking contexts
    if (debugMode) {
      setTimeout(() => {
        debugStackingContext(document.querySelector('.app-header'), 'Header');
        debugStackingContext(document.querySelector('.container'), 'Container');
        debugStackingContext(document.querySelector('.content'), 'Content');
        debugStackingContext(document.querySelector('.dashboard-grid-nav'), 'Navigation');
        debugStackingContext(document.body, 'Body');
      }, 500);
    }
    
    // Setup modal container
    if (usePortal) {
      const container = getModalRoot();
      setModalContainer(container);
    }
    
    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'relative';
    
    // Add debug class if enabled
    if (debugMode) {
      document.body.classList.add('debug-stacking');
    }
    
    // Cleanup
    return () => {
      console.log('🧹 MatchDetailsModal: Cleaning up...');
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      
      if (debugMode) {
        document.body.classList.remove('debug-stacking');
      }
    };
  }, [usePortal, debugMode]);

  // 🚀 Enhanced close handler
  const handleClose = () => {
    console.log('🚪 MatchDetailsModal: Closing...');
    onClose();
  };

  // 📱 Enhanced section change with scroll reset
  const handleSectionChange = (sectionId) => {
    console.log(`🔄 MatchDetailsModal: Switching to ${sectionId}`);
    setActiveSection(sectionId);
    
    // Reset scroll position
    const modalBody = document.querySelector(`.${styles.body}`);
    if (modalBody) {
      modalBody.scrollTop = 0;
    }
  };

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
    if (score >= 80) return styles.scoreExcellent;
    if (score >= 65) return styles.scoreGood;
    if (score >= 50) return styles.scoreFair;
    return styles.scoreLow;
  };

  // Helper function to render lifestyle scale
  const renderLifestyleScale = (value, label) => {
    if (!value) return null;
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

  // Section rendering functions
  const renderOverviewSection = () => (
    <div className={styles.section}>
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{first_name}</h2>
          <div className={styles.profileBasics}>
            {age && <span className={styles.basicItem}>{age} years old</span>}
            {location && <span className={styles.basicItem}>{location}</span>}
            {recovery_stage && (
              <span className={`${styles.basicItem} ${styles.recoveryHighlight}`}>
                {recovery_stage.charAt(0).toUpperCase() + recovery_stage.slice(1)} Recovery
              </span>
            )}
          </div>
        </div>
        
        <div className={`${styles.scoreLarge} ${getScoreColorClass(matchScore)}`}>
          <div className={styles.scoreNumber}>{matchScore}%</div>
          <div className={styles.scoreLabel}>Compatibility</div>
        </div>
      </div>

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
            <span className={styles.statValue}>{work_schedule || 'Not specified'}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🚭</span>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Smoking</span>
            <span className={styles.statValue}>{smoking_status || 'Not specified'}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🙏</span>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Spiritual</span>
            <span className={styles.statValue}>{spiritual_affiliation || 'Not specified'}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🛏️</span>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Bedtime</span>
            <span className={styles.statValue}>{bedtime_preference || 'Not specified'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecoverySection = () => (
    <div className={styles.section}>
      <div className={styles.sectionGrid}>
        <div className={`${styles.infoCard} ${styles.fullWidth}`}>
          <h4 className={styles.infoTitle}>Recovery Stage</h4>
          <p className={`${styles.infoContent} ${styles.recoveryStage}`}>
            {recovery_stage ? recovery_stage.charAt(0).toUpperCase() + recovery_stage.slice(1) : 'Not specified'}
          </p>
        </div>

        {recovery_methods && recovery_methods.length > 0 && (
          <div className={`${styles.infoCard} ${styles.fullWidth}`}>
            <h4 className={styles.infoTitle}>Recovery Methods</h4>
            <div className={styles.tagsContainer}>
              {recovery_methods.map((method, i) => (
                <span key={i} className={`${styles.tag} ${styles.recoveryMethodTag}`}>{method}</span>
              ))}
            </div>
          </div>
        )}

        {program_type && program_type.length > 0 && (
          <div className={`${styles.infoCard} ${styles.fullWidth}`}>
            <h4 className={styles.infoTitle}>Recovery Programs</h4>
            <div className={styles.tagsContainer}>
              {program_type.map((program, i) => (
                <span key={i} className={`${styles.tag} ${styles.programTag}`}>{program}</span>
              ))}
            </div>
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
      </div>
    </div>
  );

  const renderLifestyleSection = () => (
    <div className={styles.section}>
      <div className={styles.lifestylePreferences}>
        <h4 className={styles.subsectionTitle}>Living Preferences</h4>
        <div className={styles.lifestyleScales}>
          {renderLifestyleScale(cleanliness_level, 'Cleanliness Level')}
          {renderLifestyleScale(noise_level, 'Noise Tolerance')}
          {renderLifestyleScale(social_level, 'Social Level')}
        </div>
      </div>
      
      <div className={styles.lifestyleChoices}>
        <h4 className={styles.subsectionTitle}>Lifestyle Choices</h4>
        <div className={styles.yesNoGrid}>
          {renderYesNo(pets_owned, 'Owns Pets')}
          {renderYesNo(pets_comfortable, 'Comfortable with Pets')}
          {renderYesNo(overnight_guests_ok, 'Overnight Guests OK')}
          {renderYesNo(shared_groceries, 'Open to Sharing Groceries')}
        </div>
      </div>
    </div>
  );

  const renderHousingSection = () => (
    <div className={styles.section}>
      <div className={styles.sectionGrid}>
        {housing_type && housing_type.length > 0 && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Preferred Housing Types</h4>
            <div className={styles.tagsContainer}>
              {housing_type.map((type, i) => (
                <span key={i} className={`${styles.tag} ${styles.housingTag}`}>{type}</span>
              ))}
            </div>
          </div>
        )}

        {housing_subsidy && housing_subsidy.length > 0 && (
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>Housing Assistance</h4>
            <div className={styles.tagsContainer}>
              {housing_subsidy.map((subsidy, i) => (
                <span key={i} className={`${styles.tag} ${styles.subsidyTag}`}>{subsidy}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompatibilitySection = () => (
    <div className={styles.section}>
      {greenFlags.length > 0 && (
        <div className={`${styles.compatibilityCard} ${styles.green}`}>
          <div className={styles.compatibilityHeader}>
            <span className={styles.compatibilityIcon}>✅</span>
            <h4 className={styles.compatibilityTitle}>Compatibility Strengths</h4>
          </div>
          <div className={styles.flagsList}>
            {greenFlags.map((flag, i) => (
              <div key={i} className={styles.flagItem}>
                <span className={styles.flagBullet}>•</span>
                <span className={styles.flagText}>{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {redFlags.length > 0 && (
        <div className={`${styles.compatibilityCard} ${styles.red}`}>
          <div className={styles.compatibilityHeader}>
            <span className={styles.compatibilityIcon}>⚠️</span>
            <h4 className={styles.compatibilityTitle}>Areas to Consider</h4>
          </div>
          <div className={styles.flagsList}>
            {redFlags.map((flag, i) => (
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
    </div>
  );

  const renderAboutSection = () => (
    <div className={styles.section}>
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

      {interests && interests.length > 0 && (
        <div className={styles.interestsCard}>
          <h4 className={styles.interestsTitle}>Interests & Hobbies</h4>
          <div className={styles.interestsGrid}>
            {interests.map((interest, i) => (
              <span key={i} className={styles.interestItem}>{interest}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverviewSection();
      case 'recovery': return renderRecoverySection();
      case 'lifestyle': return renderLifestyleSection();
      case 'housing': return renderHousingSection();
      case 'compatibility': return renderCompatibilitySection();
      case 'about': return renderAboutSection();
      default: return renderOverviewSection();
    }
  };

  // 🎭 Modal JSX
  const modalJSX = (
    <div 
      className={`${styles.overlay} ${debugMode ? styles.debugStackingContext : ''} ${!usePortal ? styles.emergencyOverride : ''}`}
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
            <div className={`${styles.score} ${getScoreColorClass(matchScore)}`}>
              {matchScore}% Match
            </div>
          </div>
          <button className={styles.closeButton} onClick={handleClose}>×</button>
        </div>

        {/* Section Navigation */}
        <div className={styles.navigation}>
          {MODAL_SECTIONS.map((section) => (
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
        </div>
      </div>
    </div>
  );

  // 🚀 Render with or without portal
  if (usePortal && modalContainer) {
    console.log('🎯 Rendering modal via React Portal');
    return createPortal(modalJSX, modalContainer);
  } else {
    console.log('🎯 Rendering modal inline');
    return modalJSX;
  }
};

MatchDetailsModal.propTypes = {
  match: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onRequestMatch: PropTypes.func.isRequired,
  isRequestSent: PropTypes.bool,
  isAlreadyMatched: PropTypes.bool,
  usePortal: PropTypes.bool,
  debugMode: PropTypes.bool
};

export default MatchDetailsModal;