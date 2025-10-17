// src/components/features/property/SavedProperties.js - UPDATED with pending request tracking
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';
import useSavedProperties from '../../../hooks/useSavedProperties';
import PropertyCard from './search/PropertyCard';

// ✅ Import CSS foundation and component module
import '../../../styles/main.css';
import styles from './SavedProperties.module.css';

const SavedProperties = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [outreachStatus, setOutreachStatus] = useState(new Map()); // Track outreach status per property
  const [applicantProfileId, setApplicantProfileId] = useState(null); // ✅ NEW: Track applicant ID
  const [pendingPropertyRequests, setPendingPropertyRequests] = useState(new Set()); // ✅ NEW: Track pending requests

  // ✅ Get saved properties functionality (only pass user)
  const {
    savedProperties,
    loading: savingLoading,
    toggleSaveProperty,
    isPropertySaved
  } = useSavedProperties(user);

  /**
   * ✅ NEW: Load applicant profile ID
   */
  const loadApplicantProfileId = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('applicant_matching_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setApplicantProfileId(data.id);
        console.log('✅ Loaded applicant profile ID:', data.id);
      }
    } catch (err) {
      console.error('Error loading applicant profile:', err);
    }
  };

// ✅ UPDATED: Fetch outreach status from housing_matches with new nomenclature
const fetchOutreachStatus = async (propertyIds) => {
  if (!applicantProfileId || propertyIds.length === 0) {
    return { statusMap: new Map(), pendingSet: new Set() };
  }

  try {
    // Get housing_matches for these properties
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('housing_matches')
      .select('property_id, status, created_at, updated_at')
      .in('property_id', propertyIds)
      .eq('applicant_id', applicantProfileId)
      .order('created_at', { ascending: false });

    if (inquiriesError) {
      console.warn('Error fetching outreach status:', inquiriesError);
      return { statusMap: new Map(), pendingSet: new Set() };
    }

    const statusMap = new Map();
    const pendingSet = new Set();
    
    if (inquiries && inquiries.length > 0) {
      inquiries.forEach(inquiry => {
        // Only store if we haven't already stored this property (keeps most recent)
        if (!statusMap.has(inquiry.property_id)) {
          statusMap.set(inquiry.property_id, {
            status: inquiry.status,
            requested_at: inquiry.created_at,
            responded_at: inquiry.updated_at !== inquiry.created_at ? inquiry.updated_at : null
          });
          
          // ✅ NEW: Add to pending set if status is 'requested'
          if (inquiry.status === 'requested') {
            pendingSet.add(inquiry.property_id);
          }
        }
      });
    }

    console.log(`✅ Loaded ${statusMap.size} outreach statuses, ${pendingSet.size} pending`);
    return { statusMap, pendingSet };

  } catch (err) {
    console.warn('Error fetching outreach status:', err);
    return { statusMap: new Map(), pendingSet: new Set() };
  }
};

  // ✅ UPDATED: Fetch full property details for saved properties with outreach status
  const fetchSavedPropertyDetails = async () => {
    if (!user?.id || savedProperties.size === 0) {
      setProperties([]);
      setOutreachStatus(new Map());
      setPendingPropertyRequests(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const savedPropertyIds = Array.from(savedProperties);
      
      // Fetch properties
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', savedPropertyIds)
        .eq('status', 'available') // Only show available properties
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Fetch outreach status and pending requests
      const { statusMap, pendingSet } = await fetchOutreachStatus(savedPropertyIds);

      setProperties(data || []);
      setOutreachStatus(statusMap);
      setPendingPropertyRequests(pendingSet); // ✅ NEW: Set pending requests
      
    } catch (err) {
      console.error('Error fetching saved property details:', err);
      setError('Unable to load your saved properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Load applicant profile on mount
  useEffect(() => {
    loadApplicantProfileId();
  }, [profile?.id]);

  // ✅ UPDATED: Load saved property details when applicantProfileId or savedProperties changes
  useEffect(() => {
    if (applicantProfileId) {
      fetchSavedPropertyDetails();
    }
  }, [savedProperties, user?.id, applicantProfileId]);

  // ✅ Enhanced contact landlord with profile lookup
  const handleContactLandlord = async (property) => {
    try {
      let landlordName = 'Property Owner';
      let contactEmail = property.contact_email;
      let contactPhone = property.phone;

      // Try to get landlord info
      if (property.landlord_id) {
        try {
          const { data: landlordProfile } = await supabase
            .from('registrant_profiles')
            .select('first_name, email')
            .eq('id', property.landlord_id)
            .single();

          if (landlordProfile) {
            landlordName = landlordProfile.first_name || 'Property Owner';
            contactEmail = contactEmail || landlordProfile.email;
          }
        } catch (err) {
          console.warn('Could not load landlord profile:', err);
        }
      }

      const subject = `Inquiry about ${property.title} (from Saved Properties)`;
      const body = `Hi ${landlordName},

I'm following up on your property listing "${property.title}" at ${property.address}, ${property.city}, ${property.state} that I previously saved to my favorites.

Property Details:
- Monthly Rent: $${property.monthly_rent}
- Bedrooms: ${property.bedrooms || 'Studio'}
- Bathrooms: ${property.bathrooms}
${property.is_recovery_housing ? '- Recovery Housing: Yes' : ''}

I'm still very interested in this property. Could you please provide more information about:
- Current availability
- Application process
- Viewing availability

I look forward to hearing from you.

Thank you!`;

      if (contactEmail) {
        const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
      } else if (contactPhone) {
        alert(`Please call the property owner at: ${contactPhone}`);
      } else {
        alert('Contact information not available for this property.');
      }
    } catch (err) {
      console.error('Error preparing contact info:', err);
      alert('Unable to contact landlord at this time. Please try again later.');
    }
  };

  // ✅ UPDATED: Send housing inquiry with status refresh
  const handleSendHousingInquiry = async (property) => {
    // This will be handled by PropertyCard internally, but we need to refresh after
    // Just refresh the status after the card handles it
    setTimeout(async () => {
      if (applicantProfileId) {
        const { statusMap, pendingSet } = await fetchOutreachStatus(Array.from(savedProperties));
        setOutreachStatus(statusMap);
        setPendingPropertyRequests(pendingSet);
      }
    }, 1000); // Give PropertyCard time to send the request
  };

  // ✅ Handle remove from favorites with confirmation
  const handleRemoveFromFavorites = async (property) => {
    const confirmed = window.confirm(`Remove "${property.title}" from your saved properties?`);
    if (!confirmed) return;

    try {
      const success = await toggleSaveProperty(property);
      if (success) {
        alert(`"${property.title}" removed from your saved properties.`);
      } else {
        alert('Unable to remove property from favorites. Please try again.');
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
      alert('An error occurred. Please try again.');
    }
  };


// ✅ UPDATED: Get outreach status display info with new nomenclature
const getOutreachStatusInfo = (propertyId) => {
  const status = outreachStatus.get(propertyId);
  if (!status) return null;

  switch (status.status) {
    case 'requested':
      return {
        badge: 'warning',
        text: '⏳ Inquiry Sent',
        description: `Sent ${new Date(status.requested_at).toLocaleDateString()}`,
        class: styles.statusPending
      };
    case 'approved':
      return {
        badge: 'success', 
        text: '✅ Approved',
        description: status.responded_at ? `Approved ${new Date(status.responded_at).toLocaleDateString()}` : 'Approved',
        class: styles.statusApproved
      };
    case 'rejected':
      return {
        badge: 'danger',
        text: '❌ Declined', 
        description: status.responded_at ? `Declined ${new Date(status.responded_at).toLocaleDateString()}` : 'Declined',
        class: styles.statusRejected
      };
    case 'inactive':
      return {
        badge: 'secondary',
        text: '⭕ Inactive', 
        description: 'Connection ended',
        class: styles.statusInactive
      };
    default:
      return null;
  }
};

  // ✅ UPDATED: Enhanced property card component wrapper with pendingPropertyRequests
  const EnhancedPropertyCard = ({ property, ...props }) => {
    const statusInfo = getOutreachStatusInfo(property.id);
    
    return (
      <div className={`${styles.propertyWrapper} ${statusInfo ? statusInfo.class : ''}`}>
        {/* Outreach Status Banner */}
        {statusInfo && (
          <div className={`${styles.outreachBanner} ${styles[`banner${statusInfo.badge.charAt(0).toUpperCase() + statusInfo.badge.slice(1)}`]}`}>
            <div className={styles.bannerContent}>
              <span className={styles.bannerText}>{statusInfo.text}</span>
              <span className={styles.bannerDescription}>{statusInfo.description}</span>
            </div>
            
            {statusInfo.text.includes('Approved') && (
              <div className={styles.bannerAction}>
                <small>You can now contact the landlord directly!</small>
              </div>
            )}
          </div>
        )}
        
        {/* Original Property Card with pendingPropertyRequests */}
        <PropertyCard
          property={property}
          savedProperties={savedProperties}
          pendingPropertyRequests={pendingPropertyRequests}
          onContactLandlord={props.onContactLandlord}
          onSaveProperty={props.onSaveProperty}
          onSendHousingInquiry={props.onSendHousingInquiry}
          // Pass additional props for status-aware rendering
          outreachStatus={statusInfo}
          disableInquiry={statusInfo?.text.includes('Sent') || statusInfo?.text.includes('Declined')}
        />
      </div>
    );
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="content">
        <div className={styles.headerSection}>
          <h1 className={styles.headerTitle}>My Saved Properties</h1>
          <p className={styles.headerSubtitle}>Loading your saved properties...</p>
        </div>
        
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading your saved properties...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="content">
        <div className={styles.headerSection}>
          <h1 className={styles.headerTitle}>My Saved Properties</h1>
          <p className={styles.headerSubtitle}>Error loading saved properties</p>
        </div>
        
        <div className="card">
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3 className={styles.errorTitle}>Unable to Load Saved Properties</h3>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={fetchSavedPropertyDetails}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Empty state
  if (properties.length === 0) {
    return (
      <div className="content">
        <div className={styles.headerSection}>
          <h1 className={styles.headerTitle}>My Saved Properties</h1>
          <p className={styles.headerSubtitle}>Your favorited properties will appear here</p>
        </div>
        
        <div className="empty-state">
          <div className="empty-state-icon">❤️</div>
          <h3 className="empty-state-title">No saved properties yet</h3>
          <p>Start exploring and save properties you're interested in to see them here.</p>
          
          <div className={styles.emptyStateActions}>
            <a href="/app/property-search" className="btn btn-primary">
              <span className={styles.btnIcon}>🔍</span>
              Search Properties
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Group properties by outreach status for better organization
  const propertiesWithPending = properties.filter(p => getOutreachStatusInfo(p.id)?.text.includes('Sent'));
  const propertiesWithApproved = properties.filter(p => getOutreachStatusInfo(p.id)?.text.includes('Approved'));
  const propertiesWithRejected = properties.filter(p => getOutreachStatusInfo(p.id)?.text.includes('Declined'));
  const propertiesWithoutOutreach = properties.filter(p => !getOutreachStatusInfo(p.id));

  // ✅ Main content with enhanced status display
  return (
    <div className="content">
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>My Saved Properties</h1>
          <p className={styles.headerSubtitle}>
            {properties.length} saved {properties.length === 1 ? 'property' : 'properties'}
            {outreachStatus.size > 0 && (
              <span className={styles.outreachSummary}>
                • {propertiesWithPending.length} pending • {propertiesWithApproved.length} approved • {propertiesWithRejected.length} declined
              </span>
            )}
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className="btn btn-outline btn-sm"
            onClick={fetchSavedPropertyDetails}
            disabled={loading}
          >
            🔄 Refresh Status
          </button>
          <a href="/app/property-search" className="btn btn-outline">
            <span className={styles.btnIcon}>🔍</span>
            Search More Properties
          </a>
        </div>
      </div>

      {/* ✅ Status sections for better organization */}
      {propertiesWithApproved.length > 0 && (
        <div className="mb-4">
          <h3 className={styles.sectionTitle}>✅ Approved Inquiries ({propertiesWithApproved.length})</h3>
          <div className="grid-auto">
            {propertiesWithApproved.map(property => (
              <EnhancedPropertyCard
                key={property.id}
                property={property}
                onContactLandlord={handleContactLandlord}
                onSaveProperty={handleRemoveFromFavorites}
                onSendHousingInquiry={handleSendHousingInquiry}
              />
            ))}
          </div>
        </div>
      )}

      {propertiesWithPending.length > 0 && (
        <div className="mb-4">
          <h3 className={styles.sectionTitle}>⏳ Pending Inquiries ({propertiesWithPending.length})</h3>
          <div className="grid-auto">
            {propertiesWithPending.map(property => (
              <EnhancedPropertyCard
                key={property.id}
                property={property}
                onContactLandlord={handleContactLandlord}
                onSaveProperty={handleRemoveFromFavorites}
                onSendHousingInquiry={handleSendHousingInquiry}
              />
            ))}
          </div>
        </div>
      )}

      {propertiesWithoutOutreach.length > 0 && (
        <div className="mb-4">
          <h3 className={styles.sectionTitle}>❤️ Saved Properties ({propertiesWithoutOutreach.length})</h3>
          <div className="grid-auto">
            {propertiesWithoutOutreach.map(property => (
              <EnhancedPropertyCard
                key={property.id}
                property={property}
                onContactLandlord={handleContactLandlord}
                onSaveProperty={handleRemoveFromFavorites}
                onSendHousingInquiry={handleSendHousingInquiry}
              />
            ))}
          </div>
        </div>
      )}

      {propertiesWithRejected.length > 0 && (
        <div className="mb-4">
          <details className={styles.collapsibleSection}>
            <summary className={styles.sectionTitle}>❌ Declined Inquiries ({propertiesWithRejected.length})</summary>
            <div className="grid-auto mt-3">
              {propertiesWithRejected.map(property => (
                <EnhancedPropertyCard
                  key={property.id}
                  property={property}
                  onContactLandlord={handleContactLandlord}
                  onSaveProperty={handleRemoveFromFavorites}
                  onSendHousingInquiry={handleSendHousingInquiry}
                />
              ))}
            </div>
          </details>
        </div>
      )}

      {/* ✅ Page Footer with Enhanced Tips */}
      <div className="card mt-4">
        <div className={styles.tipsSection}>
          <h4 className={styles.tipsTitle}>💡 Tips for Your Saved Properties</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>⏳</span>
              <div className={styles.tipContent}>
                <strong>Track Your Inquiries:</strong> Monitor the status of your housing requests right here in your saved properties.
              </div>
            </div>
            
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>✅</span>
              <div className={styles.tipContent}>
                <strong>Act on Approvals:</strong> When a landlord approves your inquiry, contact them quickly to schedule viewings.
              </div>
            </div>
            
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>📞</span>
              <div className={styles.tipContent}>
                <strong>Direct Contact:</strong> Use "Contact Owner" for immediate communication outside the inquiry system.
              </div>
            </div>
            
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>🔄</span>
              <div className={styles.tipContent}>
                <strong>Keep Searching:</strong> Continue exploring new properties while tracking your existing inquiries.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedProperties;