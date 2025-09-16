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
    <div className="card employer-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="employer-card-header">
          <div className="employer-info">
            <div className="card-title">{cardData.companyName}</div>
            <div className="card-subtitle">
              {cardData.industry} • {cardData.location}
            </div>
          </div>
          
          <div className="employer-badges">
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
              className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
              onClick={handleFavoriteClick}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorited ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div className="employer-card-body">
        {/* Basic Company Info Grid */}
        <div className="grid-2 text-gray-600 mb-3">
          <div className="info-item">
            <span className="info-label">Type:</span>
            <span className="info-value">{cardData.businessType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Size:</span>
            <span className="info-value">{cardData.companySize}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Remote:</span>
            <span className="info-value">{cardData.remoteWork}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Founded:</span>
            <span className="info-value">
              {employer.founded_year || 'Not specified'}
            </span>
          </div>
        </div>

        {/* Current Job Openings */}
        {cardData.currentOpenings.length > 0 && (
          <div className="feature-section mb-3">
            <div className="feature-label">
              💼 Current Job Openings
            </div>
            <div className="feature-tags">
              {cardData.currentOpenings.map((opening, index) => (
                <span key={index} className="badge badge-success mr-1 mb-1">
                  {opening}
                </span>
              ))}
              {cardData.openingsRemainingCount > 0 && (
                <span className="remaining-count">
                  +{cardData.openingsRemainingCount} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Recovery-Friendly Features */}
        {cardData.recoveryFeatures.length > 0 && (
          <div className="feature-section mb-3">
            <div className="feature-label">
              🤝 Recovery-Friendly Features
            </div>
            <div className="feature-tags">
              {cardData.recoveryFeatures.map((feature, index) => (
                <span key={index} className="badge badge-info mr-1 mb-1">
                  {feature}
                </span>
              ))}
              {cardData.recoveryRemainingCount > 0 && (
                <span className="remaining-count">
                  +{cardData.recoveryRemainingCount} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Company Description Preview */}
        {cardData.description && (
          <div className="description-section mb-4">
            <p className="description-preview">
              {cardData.description.length > 150 
                ? `${cardData.description.substring(0, 150)}...` 
                : cardData.description
              }
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="employer-card-actions">
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

      <style jsx>{`
        .employer-card {
          transition: all 0.2s ease;
          border: 2px solid var(--border-beige);
          background: white;
        }

        .employer-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.12);
          border-color: var(--primary-purple);
        }

        .employer-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .employer-info {
          flex: 1;
          min-width: 0;
        }

        .employer-badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }

        .favorite-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s ease;
          align-self: flex-end;
        }

        .favorite-btn:hover {
          transform: scale(1.1);
          background: rgba(160, 32, 240, 0.1);
        }

        .favorite-btn.favorited {
          animation: heartBeat 0.5s ease;
        }

        @keyframes heartBeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .employer-card-body {
          margin: 1rem 0;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .info-label {
          font-size: 0.8rem;
          color: var(--gray-500);
          font-weight: 500;
        }

        .info-value {
          font-size: 0.9rem;
          color: var(--gray-800);
          font-weight: 600;
        }

        .feature-section {
          border-radius: 8px;
          padding: 12px;
          background: rgba(160, 32, 240, 0.02);
          border: 1px solid rgba(160, 32, 240, 0.1);
        }

        .feature-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .feature-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          align-items: center;
        }

        .remaining-count {
          font-size: 0.75rem;
          color: var(--gray-500);
          font-weight: 500;
          padding: 2px 6px;
          background: var(--gray-100);
          border-radius: 10px;
        }

        .description-section {
          padding: 12px;
          background: var(--gray-50);
          border-radius: 8px;
          border-left: 3px solid var(--secondary-teal);
        }

        .description-preview {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--gray-700);
        }

        .employer-card-actions {
          border-top: 1px solid var(--border-beige);
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          cursor: not-allowed;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .employer-card-header {
            flex-direction: column;
            align-items: stretch;
          }

          .employer-badges {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.5rem;
          }

          .grid-2 {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .info-item {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
            border-bottom: 1px solid var(--gray-100);
          }

          .feature-section {
            padding: 10px;
          }

          .button-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .btn {
            padding: 10px 16px;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .employer-card {
            padding: 18px;
          }

          .card-title {
            font-size: 1.1rem;
            line-height: 1.3;
          }

          .card-subtitle {
            font-size: 0.85rem;
          }

          .feature-label {
            font-size: 0.8rem;
          }

          .badge {
            font-size: 0.65rem;
            padding: 3px 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployerCard;