// src/components/features/property/search/PropertyCard.js
import React from 'react';
import PropTypes from 'prop-types';

const PropertyCard = ({
  property,
  savedProperties,
  onContactLandlord,
  onSaveProperty,
  onSendHousingInquiry
}) => {
  const isSaved = savedProperties.has(property.id);

  return (
    <div className="card property-card">
      {/* Property Image Placeholder */}
      <div className="property-image-placeholder">
        <div className="property-icon">
          {property.is_recovery_housing ? '🏡' : '🏠'}
        </div>
      </div>
      
      <div className="property-details">
        {/* Property Badges */}
        <div className="property-badges mb-2">
          {property.is_recovery_housing && (
            <span className="badge badge-warning">
              Recovery Housing
            </span>
          )}
          {property.furnished && (
            <span className="badge badge-info">
              Furnished
            </span>
          )}
          {property.pets_allowed && (
            <span className="badge badge-success">
              Pet Friendly
            </span>
          )}
          {property.accepted_subsidies && property.accepted_subsidies.length > 0 && (
            <span className="badge badge-info">
              Subsidies OK
            </span>
          )}
          {isSaved && (
            <span className="badge badge-warning">
              Saved
            </span>
          )}
        </div>
        
        {/* Property Title & Location */}
        <h4 className="property-title">{property.title}</h4>
        <p className="property-address">
          {property.address}, {property.city}, {property.state} {property.zip_code}
        </p>
        
        {/* Property Price */}
        <p className="property-price">
          ${property.monthly_rent}/month
        </p>
        
        {/* Property Specs */}
        <div className="property-specs">
          {property.bedrooms || 'Studio'} bed • {property.bathrooms} bath
          {property.property_type && (
            <span> • {property.property_type.replace(/_/g, ' ')}</span>
          )}
        </div>

        {/* Amenities Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="property-amenities">
            <small>{property.amenities.slice(0, 3).join(' • ')}</small>
            {property.amenities.length > 3 && (
              <small> • +{property.amenities.length - 3} more</small>
            )}
          </div>
        )}

        {/* Recovery Housing Details */}
        {property.is_recovery_housing && (
          <div className="recovery-details">
            <small>
              <strong>Recovery Support:</strong>
              {property.case_management && ' Case Management'}
              {property.counseling_services && ' • Counseling'}
              {property.required_programs && property.required_programs.length > 0 && ' • Program Requirements'}
            </small>
          </div>
        )}

        {/* Action Buttons */}
        <div className="property-actions">
          <div className="primary-actions">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onContactLandlord(property)}
            >
              Contact Owner
            </button>
            
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onSaveProperty(property)}
              disabled={isSaved}
            >
              {isSaved ? 'Saved' : 'Save Property'}
            </button>
          </div>

          {/* Housing Inquiry Option for Registered Landlords */}
          {property.landlord_id && (
            <div className="secondary-actions">
              <button
                className="btn btn-secondary btn-sm full-width"
                onClick={() => onSendHousingInquiry(property)}
              >
                Send Housing Inquiry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Component Styles */}
      <style jsx>{`
        .property-card {
          transition: var(--transition-normal);
          cursor: default;
        }

        .property-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .property-image-placeholder {
          background: var(--bg-light-cream);
          text-align: center;
          padding: 60px 20px;
          margin-bottom: var(--spacing-lg);
          border-radius: var(--radius-md);
        }

        .property-icon {
          font-size: 3rem;
          color: var(--primary-purple);
        }

        .property-details {
          padding: 0;
        }

        .property-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: var(--spacing-sm);
        }

        .property-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--gray-900);
          margin: 0 0 var(--spacing-sm) 0;
          line-height: 1.3;
        }

        .property-address {
          color: var(--gray-600);
          font-size: 0.9rem;
          margin: 0 0 var(--spacing-sm) 0;
          line-height: 1.4;
        }

        .property-price {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--secondary-teal);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .property-specs {
          color: var(--gray-600);
          font-size: 0.9rem;
          margin-bottom: var(--spacing-md);
          line-height: 1.4;
        }

        .property-amenities {
          color: var(--gray-600);
          font-size: 0.85rem;
          margin-bottom: var(--spacing-md);
          line-height: 1.4;
        }

        .recovery-details {
          background: var(--info-bg);
          border: 1px solid var(--info-border);
          border-radius: var(--radius-sm);
          padding: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          color: var(--info-text);
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .property-actions {
          margin-top: var(--spacing-md);
        }

        .primary-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
        }

        .secondary-actions {
          margin-top: var(--spacing-sm);
        }

        .full-width {
          width: 100%;
        }

        /* Badge spacing adjustments */
        .badge {
          margin-right: 0;
        }

        .badge + .badge {
          margin-left: 0;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .property-image-placeholder {
            padding: 40px 20px;
          }

          .property-icon {
            font-size: 2.5rem;
          }

          .property-title {
            font-size: 1.1rem;
          }

          .primary-actions {
            grid-template-columns: 1fr;
            gap: var(--spacing-xs);
          }

          .btn-sm {
            padding: 10px 16px;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .property-badges {
            gap: 0.25rem;
          }

          .badge {
            font-size: 0.65rem;
            padding: 3px 6px;
          }

          .property-specs,
          .property-amenities {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    zip_code: PropTypes.string,
    monthly_rent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    bedrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bathrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    property_type: PropTypes.string,
    is_recovery_housing: PropTypes.bool,
    furnished: PropTypes.bool,
    pets_allowed: PropTypes.bool,
    accepted_subsidies: PropTypes.array,
    amenities: PropTypes.array,
    case_management: PropTypes.bool,
    counseling_services: PropTypes.bool,
    required_programs: PropTypes.array,
    landlord_id: PropTypes.string
  }).isRequired,
  savedProperties: PropTypes.instanceOf(Set).isRequired,
  onContactLandlord: PropTypes.func.isRequired,
  onSaveProperty: PropTypes.func.isRequired,
  onSendHousingInquiry: PropTypes.func.isRequired
};

export default PropertyCard;