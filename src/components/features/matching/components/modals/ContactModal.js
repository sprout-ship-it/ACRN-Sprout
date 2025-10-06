// src/components/features/matching/components/modals/ContactModal.js
import React from 'react';

/**
 * ContactModal Component
 * Displays contact information for active connections
 */
const ContactModal = ({ 
  isOpen, 
  onClose, 
  contactInfo 
}) => {
  if (!isOpen || !contactInfo) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '500px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">📞 Contact Information</h3>
          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="text-center mb-4">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {contactInfo.connectionType === 'Employment' ? '💼' : '👤'}
          </div>
          <h4 style={{ color: 'var(--primary-purple)', marginBottom: '0.5rem' }}>
            {contactInfo.name}
            {contactInfo.companyName && ` (${contactInfo.companyName})`}
            {contactInfo.companyType && ` (${contactInfo.companyType})`}
          </h4>
          <p className="text-gray-600" style={{ margin: 0 }}>
            Your {contactInfo.connectionType} contact
          </p>
        </div>
        
        <div className="contact-details">
          {/* Email Contact */}
          <div className="contact-item mb-4">
            <div className="flex items-center mb-2">
              <div className="contact-icon mr-3">📧</div>
              <div className="flex-1">
                <div className="contact-label">Email</div>
                <div className="contact-value">
                  {contactInfo.email}
                </div>
                {contactInfo.email !== 'Not provided' && (
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="contact-link text-blue-600 hover:text-blue-800"
                  >
                    Send Email →
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Phone Contact */}
          <div className="contact-item mb-4">
            <div className="flex items-center mb-2">
              <div className="contact-icon mr-3">📱</div>
              <div className="flex-1">
                <div className="contact-label">Phone</div>
                <div className="contact-value">
                  {contactInfo.phone}
                </div>
                {contactInfo.phone !== 'Not provided' && (
                  <a 
                    href={`tel:${contactInfo.phone}`}
                    className="contact-link text-blue-600 hover:text-blue-800"
                  >
                    Call Now →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Professional Title (for peer support) */}
          {contactInfo.professionalTitle && (
            <div className="contact-item mb-4">
              <div className="flex items-center mb-2">
                <div className="contact-icon mr-3">🎓</div>
                <div className="flex-1">
                  <div className="contact-label">Professional Title</div>
                  <div className="contact-value">
                    {contactInfo.professionalTitle}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Experience (for peer support) */}
          {contactInfo.experience && (
            <div className="contact-item mb-4">
              <div className="flex items-center mb-2">
                <div className="contact-icon mr-3">⭐</div>
                <div className="flex-1">
                  <div className="contact-label">Experience</div>
                  <div className="contact-value">
                    {contactInfo.experience} years
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Industry (for employers) */}
          {contactInfo.industry && (
            <div className="contact-item mb-4">
              <div className="flex items-center mb-2">
                <div className="contact-icon mr-3">🏢</div>
                <div className="flex-1">
                  <div className="contact-label">Industry</div>
                  <div className="contact-value">
                    {contactInfo.industry}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Person */}
          {contactInfo.contactPerson && (
            <div className="alert alert-info mb-4">
              <strong>Contact Person:</strong> {contactInfo.contactPerson}
            </div>
          )}

          {/* Emergency Contact */}
          {contactInfo.emergencyContact && (
            <div className="alert alert-info mb-4">
              <strong>Emergency Contact:</strong> {contactInfo.emergencyContact.name}
              {contactInfo.emergencyContact.phone && (
                <span> - {contactInfo.emergencyContact.phone}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          <strong>💡 Next Steps:</strong> Reach out to {contactInfo.name} to coordinate your {contactInfo.connectionType}. 
          Remember to be respectful and professional in all communications.
        </div>
        
        <div className="text-center">
          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{ minWidth: '150px' }}
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;