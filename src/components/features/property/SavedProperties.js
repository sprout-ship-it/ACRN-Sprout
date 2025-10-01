// src/components/features/property/SavedProperties.js - User's Saved Properties Page
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

  // ✅ Get saved properties functionality (only pass user)
  const {
    savedProperties,
    loading: savingLoading,
    toggleSaveProperty,
    isPropertySaved
  } = useSavedProperties(user);

  // ✅ Fetch full property details for saved properties
  const fetchSavedPropertyDetails = async () => {
    if (!user?.id || savedProperties.size === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const savedPropertyIds = Array.from(savedProperties);
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', savedPropertyIds)
        .eq('status', 'available') // Only show available properties
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching saved property details:', err);
      setError('Unable to load your saved properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load saved property details when savedProperties changes
  useEffect(() => {
    fetchSavedPropertyDetails();
  }, [savedProperties, user?.id]);

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

  // ✅ Send housing inquiry
  const handleSendHousingInquiry = async (property) => {
    if (!property.landlord_id) {
      alert('Direct inquiries are not available for this property. Please use the contact owner option.');
      return;
    }

    try {
      const requestData = {
        requester_id: user.id,
        target_id: property.landlord_id,
        request_type: 'housing',
        message: `Hi! I'm reaching out about your property "${property.title}" which I've saved to my favorites. I'm very interested in this ${property.is_recovery_housing ? 'recovery-friendly ' : ''}housing option.

Property Details:
- Monthly Rent: $${property.monthly_rent}
- Bedrooms: ${property.bedrooms || 'Studio'}
- Location: ${property.city}, ${property.state}

I'd love to discuss availability, the application process, and next steps. Thank you!`,
        status: 'pending'
      };

      const result = await supabase
        .from('match_requests')
        .insert(requestData)
        .select();

      if (result.error) {
        throw new Error(result.error.message);
      }

      alert('Housing inquiry sent! The landlord will be notified and can respond through their dashboard.');
    } catch (err) {
      console.error('Error sending housing inquiry:', err);
      alert('Failed to send inquiry. Please try the contact owner option instead.');
    }
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

  // ✅ Main content with saved properties
  return (
    <div className="content">
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>My Saved Properties</h1>
          <p className={styles.headerSubtitle}>
            {properties.length} saved {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <a href="/app/property-search" className="btn btn-outline">
            <span className={styles.btnIcon}>🔍</span>
            Search More Properties
          </a>
        </div>
      </div>

      {/* ✅ Properties Grid */}
      <div className={styles.propertiesGrid}>
        <div className="grid-auto">
          {properties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              savedProperties={savedProperties}
              onContactLandlord={handleContactLandlord}
              onSaveProperty={handleRemoveFromFavorites}
              onSendHousingInquiry={handleSendHousingInquiry}
            />
          ))}
        </div>
      </div>

      {/* ✅ Page Footer with Tips */}
      <div className="card mt-4">
        <div className={styles.tipsSection}>
          <h4 className={styles.tipsTitle}>💡 Tips for Your Saved Properties</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>📞</span>
              <div className={styles.tipContent}>
                <strong>Contact Quickly:</strong> Popular properties get applications fast. Reach out as soon as possible.
              </div>
            </div>
            
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>📋</span>
              <div className={styles.tipContent}>
                <strong>Prepare Documents:</strong> Have your application materials ready including income verification and references.
              </div>
            </div>
            
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>🏠</span>
              <div className={styles.tipContent}>
                <strong>Schedule Viewings:</strong> Try to see properties in person or request virtual tours when possible.
              </div>
            </div>
            
            <div className={styles.tipItem}>
              <span className={styles.tipIcon}>❤️</span>
              <div className={styles.tipContent}>
                <strong>Keep Searching:</strong> Continue searching and saving more properties to increase your options.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedProperties;