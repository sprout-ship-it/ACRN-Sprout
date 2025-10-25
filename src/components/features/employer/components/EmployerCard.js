// src/components/features/employer/components/EmployerCard.js
import React from 'react';
import { 
  formatFeature, 
  formatBusinessType, 
  formatRemoteWork, 
  formatIndustry,
  formatFeatureList,
  getEmployerCardData
} from '../utils/employerUtils';
import styles from './EmployerCard.module.css';

const EmployerCard = ({ 
  employer, 
  connectionStatus, 
  isFavorited = false,
  onConnect,
  onToggleFavorite,
  onViewDetails 
}) => {
  // Get formatted display data
  const cardData = getEmployerCardData(employer);
  
  // Handle favorite toggle
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(employer.user_id);
  };

  // Handle connect click
  const handleConnectClick = (e) => {
    e.stopPropagation();
    onConnect(employer);
  };

  // Handle view details click
  const handleViewDetailsClick = (e) => {
    e.stopPropagation();
    onViewDetails(employer);
  };

  return (
    <div className={`card ${styles.employerCard}`}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.employerCardHeader}>
          <div className={styles.employerInfo}>
            <div className="card-title">{cardData.companyName}</div>
            <div className="card-subtitle">
              {cardData.industry} • {cardData.location}
            </div>
          </div>
          
          <div className={styles.employerBadges}>
            {/* Hiring Status Badge */}
            {cardData.isActivelyHiring ? (
              <span className="badge badge-success mb-1">
                🟢 Actively Hiring
              </span>
            ) : (
              <span className="badge badge-warning mb-1">
                ⏸️ Not Currently Hiring
              </span>
            )}
            
            {/* Connection Status Badge */}
            {connectionStatus?.type === 'connected' && (
              <span className="badge badge-info">
                ✅ Connected
              </span>
            )}
            
            {/* Favorite Heart */}
            <button
              className={`${styles.favoriteBtn} ${isFavorited ? styles.favorited : ''}`}
              onClick={handleFavoriteClick}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorited ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div className={styles.employerCardBody}>
        {/* Basic Company Info Grid */}
        <div className="grid-2 text-gray-600 mb-3">
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Type:</span>
            <span className={styles.infoValue}>{cardData.businessType}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Size:</span>
            <span className={styles.infoValue}>{cardData.companySize}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Remote:</span>
            <span className={styles.infoValue}>{cardData.remoteWork}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Founded:</span>
            <span className={styles.infoValue}>
              {employer.founded_year || 'Not specified'}
            </span>
          </div>
        </div>

        {/* ✅ FIXED: Job Types Available instead of Current Job Openings */}
        {cardData.currentOpenings.length > 0 && (
          <div className={`${styles.featureSection} mb-3`}>
            <div className={styles.featureLabel}>
              💼 Job Types Available
            </div>
            <div className={styles.featureTags}>
              {cardData.currentOpenings.map((jobType, index) => (
                <span key={index} className="badge badge-success mr-1 mb-1">
                  {jobType}
                </span>
              ))}
              {cardData.openingsRemainingCount > 0 && (
                <span className={styles.remainingCount}>
                  +{cardData.openingsRemainingCount} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Recovery-Friendly Features */}
        {cardData.recoveryFeatures.length > 0 && (
          <div className={`${styles.featureSection} mb-3`}>
            <div className={styles.featureLabel}>
              🤝 Recovery-Friendly Features
            </div>
            <div className={styles.featureTags}>
              {cardData.recoveryFeatures.map((feature, index) => (
                <span key={index} className="badge badge-info mr-1 mb-1">
                  {feature}
                </span>
              ))}
              {cardData.recoveryRemainingCount > 0 && (
                <span className={styles.remainingCount}>
                  +{cardData.recoveryRemainingCount} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Company Description Preview */}
        {cardData.description && (
          <div className={`${styles.descriptionSection} mb-4`}>
            <p className={styles.descriptionPreview}>
              {cardData.description.length > 150 
                ? `${cardData.description.substring(0, 150)}...` 
                : cardData.description
              }
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.employerCardActions}>
        <div className="button-grid">
          <button
            className="btn btn-outline"
            onClick={handleViewDetailsClick}
          >
            📋 View Details
          </button>
          
          <button
            className={`btn ${connectionStatus?.className || 'btn-secondary'}`}
            onClick={handleConnectClick}
            disabled={connectionStatus?.disabled}
          >
            {connectionStatus?.type === 'connected' ? (
              <>✅ Connected</>
            ) : connectionStatus?.type === 'connect-not-hiring' ? (
              <>📩 Send Inquiry</>
            ) : (
              <>💼 Connect Now</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerCard;