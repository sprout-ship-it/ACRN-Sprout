// src/components/features/property/search/PropertyCard.js - FIXED HOUSING INQUIRY
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../../hooks/useAuth';
import { supabase } from '../../../../utils/supabase';

// ✅ Import CSS module
import styles from './PropertyCard.module.css';

const PropertyCard = ({
  property,
  savedProperties,
  onContactLandlord,
  onSaveProperty,
  onSendHousingInquiry
}) => {
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);
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

// ✅ FIXED: Housing inquiry using match_groups table
  const handleSendHousingInquiry = async () => {
    if (sendingInquiry || !user || !profile) return;

    setSendingInquiry(true);
    
    try {
      // 1. Get applicant profile ID
      const { data: applicantProfile, error: applicantError } = await supabase
        .from('applicant_matching_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (applicantError || !applicantProfile) {
        throw new Error('You must complete your applicant profile before sending housing inquiries.');
      }

      // 2. Validate property has landlord_id
      if (!property.landlord_id) {
        throw new Error('Unable to send inquiry - landlord information not available.');
      }

      // 3. Check for daily request limit (5 per day)
      const today = new Date().toISOString().split('T')[0];
      const { data: todayInquiries, error: countError } = await supabase
        .from('match_groups')
        .select('id')
        .eq('requested_by_id', applicantProfile.id)
        .not('property_id', 'is', null) // Only count housing inquiries
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`);

      if (countError) {
        console.warn('Error checking request limit:', countError);
      } else if (todayInquiries && todayInquiries.length >= 5) {
        throw new Error('You have reached the daily limit of 5 housing inquiries. Please try again tomorrow.');
      }

      // 4. Check if inquiry already exists for this property
      // Need to check if applicant_id exists in the roommate_ids JSONB array
      const { data: existingInquiries, error: existingError } = await supabase
        .from('match_groups')
        .select('id, status, roommate_ids')
        .eq('property_id', property.id)
        .not('property_id', 'is', null);

      if (existingError) {
        console.warn('Error checking existing inquiries:', existingError);
      } else if (existingInquiries && existingInquiries.length > 0) {
        // Check if this applicant is in any of the roommate_ids arrays
        const applicantHasInquiry = existingInquiries.find(inquiry => {
          const roommateIds = inquiry.roommate_ids || [];
          return roommateIds.includes(applicantProfile.id);
        });

        if (applicantHasInquiry) {
          if (applicantHasInquiry.status === 'requested') {
            throw new Error('You have already sent an inquiry for this property. Please wait for a response.');
          } else if (applicantHasInquiry.status === 'confirmed' || applicantHasInquiry.status === 'active') {
            throw new Error('Your inquiry for this property has already been approved!');
          } else if (applicantHasInquiry.status === 'inactive') {
            throw new Error('Your previous inquiry for this property was declined. You cannot send another inquiry.');
          }
        }
      }

      // 5. Create the housing inquiry in match_groups
      const inquiryMessage = `Hi! I'm very interested in your property "${property.title}" located at ${property.address}, ${property.city}, ${property.state}.

Property Details I'm Interested In:
- Monthly Rent: $${property.monthly_rent}
- Bedrooms: ${property.bedrooms || 'Studio'}
- Bathrooms: ${property.bathrooms}
${property.is_recovery_housing ? '- Recovery Housing: Yes' : ''}
${property.available_beds ? `- Available Beds: ${property.available_beds}` : ''}

I would love to learn more about:
- Current availability and move-in timeline
- Application process and requirements
- Viewing availability
${property.is_recovery_housing ? '- Recovery support services available' : ''}

Please let me know if you need any additional information from me. I'm looking forward to hearing from you!

Thank you for your time.`;

      const { data: newInquiry, error: insertError } = await supabase
        .from('match_groups')
        .insert({
          property_id: property.id,
          roommate_ids: [applicantProfile.id], // ✅ JSONB array with single applicant
          requested_by_id: applicantProfile.id,
          status: 'requested',
          message: inquiryMessage
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // 6. Update favorites table with outreach status (if property is saved)
      if (isSaved) {
        try {
          const { error: favoritesError } = await supabase
            .from('favorites')
            .update({
              outreach_status: 'inquiry_sent',
              last_inquiry_date: new Date().toISOString()
            })
            .eq('favoriting_user_id', user.id)
            .eq('favorited_property_id', property.id)
            .eq('favorite_type', 'property');

          if (favoritesError) {
            console.warn('Could not update favorite outreach status:', favoritesError);
            // Non-critical error, don't block the success
          } else {
            console.log('✅ Updated favorite outreach status for property:', property.id);
          }
        } catch (favError) {
          console.warn('Could not update favorite status:', favError);
          // Non-critical error, don't block the success
        }
      }

      alert(`Housing inquiry sent successfully! 

Your inquiry has been sent to the property owner for "${property.title}". 

The landlord will be able to review your request and respond through their dashboard. You can track the status in your Saved Properties if you've favorited this listing.

Daily limit: ${todayInquiries ? todayInquiries.length + 1 : 1} of 5 inquiries used today.`);

    } catch (error) {
      console.error('Error sending housing inquiry:', error);
      alert(`Unable to send housing inquiry: ${error.message}`);
    } finally {
      setSendingInquiry(false);
    }
  };

  return (
    <div className={`card ${styles.propertyCard} ${isSaved ? styles.favorited : ''}`}>
      {/* ✅ Property Image Placeholder with favorited indicator */}
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
        {/* ✅ Property Badges with favorited styling */}
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
          {/* ✅ Availability indicator for recovery housing */}
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

        {/* ✅ Action Buttons with fixed housing inquiry */}
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

          {/* ✅ FIXED: Housing Inquiry with proper implementation */}
          {property.landlord_id && (
            <div className={styles.secondaryActions}>
              <button
                className={`btn btn-secondary btn-sm ${styles.fullWidth} ${sendingInquiry ? styles.btnLoading : ''}`}
                onClick={handleSendHousingInquiry}
                disabled={sendingInquiry}
              >
                {sendingInquiry ? (
                  <>
                    <span className={styles.loadingSpinner}></span>
                    Sending Inquiry...
                  </>
                ) : (
                  'Send Housing Inquiry'
                )}
              </button>
            </div>
          )}
        </div>

        {/* ✅ Favorited Footer Message */}
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
  onSendHousingInquiry: PropTypes.func
};

// ✅ Make onSendHousingInquiry optional since we're handling it internally now
PropertyCard.defaultProps = {
  onSendHousingInquiry: () => {}
};

export default PropertyCard;