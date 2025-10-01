// src/components/features/property/search/PropertyCard.js - ENHANCED WITH PROPER FAVORITES
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// ✅ Import CSS module
import styles from './PropertyCard.module.css';

const PropertyCard = ({
  property,
  savedProperties,
  onContactLandlord,
  onSaveProperty,
  onSendHousingInquiry
}) => {
  const [saving, setSaving] = useState(false);
  const isSaved = savedProperties.has(property.id);

  // ✅ Handle save with loading state
  const handleSaveClick = async () => {
    if (saving) return; // Prevent double clicks
    
    setSaving(true);
    try {
      await onSaveProperty(property);
    } catch (err) {
      console.error('Error saving property:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`card ${styles.propertyCard} ${isSaved ? styles.favorited : ''}`}>
      {/* ✅ UPDATED: Enhanced Property Image Placeholder with favorited indicator */}
      <div className={styles.propertyImagePlaceholder}>
        <div className={styles.propertyIcon}>
          {property.is_recovery_housing ? '🏡' : '🏠'}
        </div>
        {isSaved && (
          <div className={styles.favoriteBadge}>
            <span className={styles.favoriteIcon}>❤️</span>
          </div>
        )}
      </div>
      
      <div className={styles.propertyDetails}>
        {/* ✅ UPDATED: Property Badges with favorited styling */}
        <div className={`${styles.propertyBadges} mb-2`}>
          {isSaved && (
            <span className={`badge ${styles.badgeFavorited}`}>
              ❤️ Favorited
            </span>
          )}
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
          {/* ✅ NEW: Availability indicator for recovery housing */}
          {property.is_recovery_housing && property.available_beds > 0 && (
            <span className="badge badge-success">
              {property.available_beds} Bed{property.available_beds !== 1 ? 's' : ''} Available
            </span>
          )}
        </div>
        
        {/* ✅ Property Title & Location */}
        <h4 className={`${styles.propertyTitle} ${isSaved ? styles.favoritedTitle : ''}`}>
          {property.title}
        </h4>
        <p className={styles.propertyAddress}>
          {property.address}, {property.city}, {property.state} {property.zip_code}
        </p>
        
        {/* ✅ Property Price */}
        <p className={styles.propertyPrice}>
          ${property.monthly_rent}/month
          {property.is_recovery_housing && property.weekly_rate && (
            <span className={styles.weeklyRate}> • ${property.weekly_rate}/week</span>
          )}
        </p>
        
        {/* ✅ Property Specs */}
        <div className={styles.propertySpecs}>
          {property.bedrooms || 'Studio'} bed • {property.bathrooms} bath
          {property.property_type && (
            <span> • {property.property_type.replace(/_/g, ' ')}</span>
          )}
        </div>

        {/* ✅ Amenities Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className={styles.propertyAmenities}>
            <small>{property.amenities.slice(0, 3).join(' • ')}</small>
            {property.amenities.length > 3 && (
              <small> • +{property.amenities.length - 3} more</small>
            )}
          </div>
        )}

        {/* ✅ Recovery Housing Details */}
        {property.is_recovery_housing && (
          <div className={styles.recoveryDetails}>
            <small>
              <strong>Recovery Support:</strong>
              {property.case_management && ' Case Management'}
              {property.counseling_services && ' • Counseling'}
              {property.job_training && ' • Job Training'}
              {property.medical_services && ' • Medical Services'}
              {property.meals_included && ' • Meals Included'}
              {property.required_programs && property.required_programs.length > 0 && ' • Program Requirements'}
            </small>
          </div>
        )}

        {/* ✅ UPDATED: Action Buttons with enhanced favorite styling and loading state */}
        <div className={styles.propertyActions}>
          <div className={styles.primaryActions}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onContactLandlord(property)}
            >
              Contact Owner
            </button>
            
            <button
              className={`btn btn-sm ${isSaved ? styles.btnSaved : 'btn-outline'} ${saving ? styles.btnLoading : ''}`}
              onClick={handleSaveClick}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  {isSaved ? 'Removing...' : 'Saving...'}
                </>
              ) : isSaved ? (
                <>
                  <span className={styles.savedIcon}>❤️</span>
                  Saved
                </>
              ) : (
                <>
                  <span className={styles.saveIcon}>🤍</span>
                  Save Property
                </>
              )}
            </button>
          </div>

          {/* ✅ Housing Inquiry Option for Registered Landlords */}
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

        {/* ✅ NEW: Favorited Footer Message */}
        {isSaved && (
          <div className={styles.favoritedFooter}>
            <small className={styles.favoritedMessage}>
              ❤️ You've saved this property to your favorites
            </small>
          </div>
        )}
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
    weekly_rate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bedrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bathrooms: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    available_beds: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    property_type: PropTypes.string,
    is_recovery_housing: PropTypes.bool,
    furnished: PropTypes.bool,
    pets_allowed: PropTypes.bool,
    accepted_subsidies: PropTypes.array,
    amenities: PropTypes.array,
    case_management: PropTypes.bool,
    counseling_services: PropTypes.bool,
    job_training: PropTypes.bool,
    medical_services: PropTypes.bool,
    meals_included: PropTypes.bool,
    required_programs: PropTypes.array,
    landlord_id: PropTypes.string
  }).isRequired,
  savedProperties: PropTypes.instanceOf(Set).isRequired,
  onContactLandlord: PropTypes.func.isRequired,
  onSaveProperty: PropTypes.func.isRequired,
  onSendHousingInquiry: PropTypes.func.isRequired
};

export default PropertyCard;