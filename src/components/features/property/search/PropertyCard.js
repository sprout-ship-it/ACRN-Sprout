// src/components/features/property/search/PropertyCard.js - UPDATED WITH CSS MODULE
import React from 'react';
import PropTypes from 'prop-types';

// ✅ UPDATED: Import CSS module
import styles from './PropertyCard.module.css';

const PropertyCard = ({
  property,
  savedProperties,
  onContactLandlord,
  onSaveProperty,
  onSendHousingInquiry
}) => {
  const isSaved = savedProperties.has(property.id);

  return (
    <div className={`card ${styles.propertyCard}`}>
      {/* ✅ UPDATED: Property Image Placeholder with CSS module */}
      <div className={styles.propertyImagePlaceholder}>
        <div className={styles.propertyIcon}>
          {property.is_recovery_housing ? '🏡' : '🏠'}
        </div>
      </div>
      
      <div className={styles.propertyDetails}>
        {/* ✅ UPDATED: Property Badges with CSS module */}
        <div className={`${styles.propertyBadges} mb-2`}>
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
        
        {/* ✅ UPDATED: Property Title & Location with CSS module */}
        <h4 className={styles.propertyTitle}>{property.title}</h4>
        <p className={styles.propertyAddress}>
          {property.address}, {property.city}, {property.state} {property.zip_code}
        </p>
        
        {/* ✅ UPDATED: Property Price with CSS module */}
        <p className={styles.propertyPrice}>
          ${property.monthly_rent}/month
        </p>
        
        {/* ✅ UPDATED: Property Specs with CSS module */}
        <div className={styles.propertySpecs}>
          {property.bedrooms || 'Studio'} bed • {property.bathrooms} bath
          {property.property_type && (
            <span> • {property.property_type.replace(/_/g, ' ')}</span>
          )}
        </div>

        {/* ✅ UPDATED: Amenities Preview with CSS module */}
        {property.amenities && property.amenities.length > 0 && (
          <div className={styles.propertyAmenities}>
            <small>{property.amenities.slice(0, 3).join(' • ')}</small>
            {property.amenities.length > 3 && (
              <small> • +{property.amenities.length - 3} more</small>
            )}
          </div>
        )}

        {/* ✅ UPDATED: Recovery Housing Details with CSS module */}
        {property.is_recovery_housing && (
          <div className={styles.recoveryDetails}>
            <small>
              <strong>Recovery Support:</strong>
              {property.case_management && ' Case Management'}
              {property.counseling_services && ' • Counseling'}
              {property.required_programs && property.required_programs.length > 0 && ' • Program Requirements'}
            </small>
          </div>
        )}

        {/* ✅ UPDATED: Action Buttons with CSS module */}
        <div className={styles.propertyActions}>
          <div className={styles.primaryActions}>
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

          {/* ✅ UPDATED: Housing Inquiry Option for Registered Landlords with CSS module */}
          {property.landlord_id && (
            <div className={styles.secondaryActions}>
              <button
                className={`btn btn-secondary btn-sm ${styles.fullWidth}`}
                onClick={() => onSendHousingInquiry(property)}
              >
                Send Housing Inquiry
              </button>
            </div>
          )}
        </div>
      </div>
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