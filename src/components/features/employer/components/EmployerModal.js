// src/components/features/employer/components/EmployerModal.js
import React, { useEffect } from 'react';
import { 
  formatFeature, 
  formatBusinessType, 
  formatRemoteWork, 
  formatIndustry,
  getContactInfo
} from '../utils/employerUtils';

const EmployerModal = ({ 
  isOpen,
  employer, 
  connectionStatus,
  isFavorited = false,
  onClose,
  onConnect,
  onToggleFavorite 
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render if not open or no employer
  if (!isOpen || !employer) return null;

  // Handle modal backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle action buttons
  const handleConnect = () => {
    onConnect(employer);
  };

  const handleFavoriteToggle = () => {
    onToggleFavorite(employer.user_id);
  };

  const isConnected = connectionStatus?.type === 'connected';
  const isNotHiring = !employer.is_actively_hiring;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content employer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="company-header">
              <h2 className="modal-title">{employer.company_name}</h2>
              <div className="company-subtitle">
                {formatIndustry(employer.industry)} • {employer.city}, {employer.state}
              </div>
            </div>
            
            <div className="header-actions">
              {/* Favorite Button */}
              <button
                className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                onClick={handleFavoriteToggle}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorited ? '❤️' : '🤍'}
              </button>
              
              {/* Close Button */}
              <button className="modal-close" onClick={onClose}>
                ×
              </button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="status-badges">
            {employer.is_actively_hiring ? (
              <span className="badge badge-success">🟢 Actively Hiring</span>
            ) : (
              <span className="badge badge-warning">⏸️ Not Currently Hiring</span>
            )}
            
            {isConnected && (
              <span className="badge badge-info">✅ Connected</span>
            )}
            
            {isFavorited && (
              <span className="badge badge-favorited">❤️ Favorited</span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Connection Status Alert */}
          {isConnected && (
            <div className="alert alert-success connection-alert">
              <strong>✅ Connected:</strong> You have an active employment connection with this employer. 
              Contact information is available below.
            </div>
          )}

          {/* Company Overview */}
          <div className="info-section">
            <h4 className="section-title">🏢 Company Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Industry:</span>
                <span className="info-value">{formatIndustry(employer.industry)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Business Type:</span>
                <span className="info-value">{formatBusinessType(employer.business_type)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Company Size:</span>
                <span className="info-value">{employer.company_size || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Founded:</span>
                <span className="info-value">{employer.founded_year || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location:</span>
                <span className="info-value">{employer.city}, {employer.state}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Remote Work:</span>
                <span className="info-value">
                  {employer.remote_work_options ? formatRemoteWork(employer.remote_work_options) : 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Company Description */}
          {employer.description && (
            <div className="info-section">
              <h4 className="section-title">📝 About the Company</h4>
              <div className="description-content">
                <p>{employer.description}</p>
              </div>
            </div>
          )}

          {/* Current Job Openings */}
          {employer.current_openings?.length > 0 && (
            <div className="info-section">
              <h4 className="section-title">
                💼 Current Job Openings ({employer.current_openings.length})
              </h4>
              <div className="feature-tags">
                {employer.current_openings.map((opening, index) => (
                  <span key={index} className="badge badge-success job-opening">
                    {opening}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recovery-Friendly Features */}
          {employer.recovery_friendly_features?.length > 0 && (
            <div className="info-section">
              <h4 className="section-title">
                🤝 Recovery-Friendly Features ({employer.recovery_friendly_features.length})
              </h4>
              <div className="feature-tags">
                {employer.recovery_friendly_features.map((feature, index) => (
                  <span key={index} className="badge badge-info recovery-feature">
                    {formatFeature(feature)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits Offered */}
          {employer.benefits_offered?.length > 0 && (
            <div className="info-section">
              <h4 className="section-title">
                💰 Benefits Offered ({employer.benefits_offered.length})
              </h4>
              <div className="feature-tags">
                {employer.benefits_offered.map((benefit, index) => (
                  <span key={index} className="badge badge-warning benefit">
                    {formatFeature(benefit)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Application Process */}
          {employer.application_process && (
            <div className="info-section">
              <h4 className="section-title">📋 How to Apply</h4>
              <div className="description-content">
                <p>{employer.application_process}</p>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {isConnected ? (
            <div className="info-section contact-section">
              <h4 className="section-title">📞 Contact Information</h4>
              <div className="contact-info">
                <div className="contact-grid">
                  {employer.contact_email && (
                    <div className="contact-item">
                      <span className="contact-label">📧 Email:</span>
                      <a href={`mailto:${employer.contact_email}`} className="contact-link">
                        {employer.contact_email}
                      </a>
                    </div>
                  )}
                  {employer.phone && (
                    <div className="contact-item">
                      <span className="contact-label">📞 Phone:</span>
                      <a href={`tel:${employer.phone}`} className="contact-link">
                        {employer.phone}
                      </a>
                    </div>
                  )}
                  {employer.website && (
                    <div className="contact-item">
                      <span className="contact-label">🌐 Website:</span>
                      <a href={employer.website} target="_blank" rel="noopener noreferrer" className="contact-link">
                        {employer.website}
                      </a>
                    </div>
                  )}
                  {employer.contact_person && (
                    <div className="contact-item">
                      <span className="contact-label">👤 Contact Person:</span>
                      <span className="contact-value">{employer.contact_person}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="info-section">
              <h4 className="section-title">🔗 Next Steps</h4>
              <div className="next-steps-content">
                <div className="alert alert-info">
                  <strong>💼 Employment Connection Process:</strong>
                  <ol className="process-list">
                    <li>Send employment inquiry to express interest in opportunities</li>
                    <li>Employer reviews your request and profile</li>
                    <li>If approved, contact information is exchanged automatically</li>
                    <li>Proceed with their application process or schedule interviews</li>
                  </ol>
                  {isNotHiring && (
                    <p className="warning-note">
                      <strong>Note:</strong> This employer is not currently marked as actively hiring, 
                      but you can still send an inquiry for future opportunities.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-actions">
            <button
              className="btn btn-outline"
              onClick={onClose}
            >
              Close
            </button>
            
            {!isConnected ? (
              <button
                className={`btn ${isNotHiring ? 'btn-outline' : 'btn-secondary'}`}
                onClick={handleConnect}
              >
                {isNotHiring ? (
                  <>📩 Send Inquiry</>
                ) : (
                  <>💼 Connect Now</>
                )}
              </button>
            ) : (
              <div className="connected-status">
                <span className="success-icon">✅</span>
                <span className="connected-text">Already Connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(2px);
        }

        .employer-modal {
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 2rem 2rem 1rem 2rem;
          border-bottom: 2px solid var(--border-beige);
          background: linear-gradient(135deg, var(--bg-light-purple), var(--bg-light-cream));
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .company-header {
          flex: 1;
          min-width: 0;
        }

        .modal-title {
          color: var(--primary-purple);
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          line-height: 1.2;
        }

        .company-subtitle {
          color: var(--gray-600);
          font-size: 1rem;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .favorite-btn {
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid var(--border-beige);
          border-radius: 50%;
          width: 48px;
          height: 48px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .favorite-btn:hover {
          transform: scale(1.05);
          border-color: var(--primary-purple);
          background: white;
        }

        .favorite-btn.favorited {
          border-color: #dc3545;
          background: rgba(220, 53, 69, 0.1);
        }

        .modal-close {
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid var(--border-beige);
          border-radius: 50%;
          width: 48px;
          height: 48px;
          cursor: pointer;
          font-size: 1.5rem;
          color: var(--gray-600);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: white;
          border-color: var(--coral);
          color: var(--coral);
          transform: scale(1.05);
        }

        .status-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .badge-favorited {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          border-color: rgba(220, 53, 69, 0.3);
        }

        .modal-body {
          padding: 2rem;
        }

        .connection-alert {
          margin-bottom: 2rem;
          border-left: 4px solid var(--success-border);
        }

        .info-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--gray-50);
          border-radius: var(--radius-lg);
          border-left: 4px solid var(--secondary-teal);
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--gray-800);
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-label {
          font-size: 0.85rem;
          color: var(--gray-500);
          font-weight: 500;
        }

        .info-value {
          font-size: 0.95rem;
          color: var(--gray-800);
          font-weight: 600;
        }

        .description-content {
          background: white;
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-beige);
        }

        .description-content p {
          margin: 0;
          line-height: 1.6;
          color: var(--gray-700);
        }

        .feature-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .job-opening {
          background: var(--success-bg);
          color: var(--success-text);
          border: 1px solid var(--success-border);
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .recovery-feature {
          background: var(--info-bg);
          color: var(--info-text);
          border: 1px solid var(--info-border);
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .benefit {
          background: var(--warning-bg);
          color: var(--warning-text);
          border: 1px solid var(--warning-border);
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .contact-section {
          background: linear-gradient(135deg, var(--success-bg), rgba(16, 185, 129, 0.05));
          border-left-color: #10b981;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .contact-item {
          background: white;
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .contact-label {
          font-size: 0.85rem;
          color: var(--gray-500);
          font-weight: 500;
          display: block;
          margin-bottom: 0.25rem;
        }

        .contact-link {
          color: var(--primary-purple);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .contact-link:hover {
          color: var(--secondary-purple);
          text-decoration: underline;
        }

        .contact-value {
          color: var(--gray-800);
          font-weight: 600;
        }

        .next-steps-content {
          background: white;
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .process-list {
          margin: 0.5rem 0 0 1.25rem;
          color: var(--info-text);
        }

        .process-list li {
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .warning-note {
          margin-top: 1rem;
          padding: 0.75rem;
          background: var(--warning-bg);
          border: 1px solid var(--warning-border);
          border-radius: var(--radius-sm);
          color: var(--warning-text);
          font-size: 0.9rem;
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 2px solid var(--border-beige);
          background: var(--bg-light-cream);
        }

        .footer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .connected-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 12px 20px;
          background: var(--success-bg);
          color: var(--success-text);
          border-radius: var(--radius-lg);
          border: 1px solid var(--success-border);
          font-weight: 600;
        }

        .success-icon {
          font-size: 1.1rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 10px;
          }

          .employer-modal {
            max-height: 95vh;
          }

          .modal-header {
            padding: 1.5rem 1.5rem 1rem 1.5rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .header-actions {
            align-self: flex-end;
          }

          .modal-title {
            font-size: 1.5rem;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .info-section {
            padding: 1rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .contact-grid {
            grid-template-columns: 1fr;
          }

          .modal-footer {
            padding: 1rem 1.5rem;
          }

          .footer-actions {
            flex-direction: column-reverse;
            align-items: stretch;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }

          .connected-status {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .modal-header {
            padding: 1rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .info-section {
            padding: 0.75rem;
          }

          .modal-footer {
            padding: 1rem;
          }

          .favorite-btn,
          .modal-close {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployerModal;