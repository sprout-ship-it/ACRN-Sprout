// src/components/features/property/PropertySearch.js - UPDATED with request tracking
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';

// ✅ Import updated search strategy components
import PropertyTypeSelection from './search/PropertyTypeSelection';
import PropertySharedFilters from './search/PropertySharedFilters';
import PropertyRecoverySearchFilters from './search/PropertyRecoverySearchFilters';
import PropertyAdvancedFilters from './search/PropertyAdvancedFilters';
import PropertySearchResults from './search/PropertySearchResults';
import usePropertySearch from './search/hooks/usePropertySearch';

// ✅ NEW: Import saved properties hook
import useSavedProperties from '../../../hooks/useSavedProperties';

// ✅ Import CSS foundation and component module
import '../../../styles/main.css';
import styles from './PropertySearch.module.css';

const PropertySearch = () => {
  const { user, profile } = useAuth();
  
  // ✅ Advanced filters toggle state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // ✅ NEW: Track applicant profile ID and pending property requests
  const [applicantProfileId, setApplicantProfileId] = useState(null);
  const [pendingPropertyRequests, setPendingPropertyRequests] = useState(new Set());
  const [requestsLoading, setRequestsLoading] = useState(false);

  // ✅ NEW: Get saved properties functionality (only pass user)
  const {
    savedProperties,
    loading: savingLoading,
    saveProperty,
    unsaveProperty,
    toggleSaveProperty,
    isPropertySaved
  } = useSavedProperties(user);

  // ✅ Get all search state and handlers from updated custom hook
  const {
    // Search state
    loading,
    properties,
    totalResults,
    totalPages,
    currentPage,
    showPagination,
    searchType,
    userPreferences,

    // Updated filter states
    sharedFilters,
    recoveryFilters,
    advancedFilters,

    // Updated action handlers
    handleSharedFilterChange,
    handleRecoveryFilterChange,
    handleAdvancedFilterChange,
    handleArrayFilterChange,
    handleSearchTypeChange,
    handlePageChange,
    
    // Utility functions
    applyUserPreferences,
    clearAllFilters,
    performSearch
  } = usePropertySearch(user);

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

  /**
   * ✅ NEW: Load pending property requests
   */
  const loadPendingPropertyRequests = async () => {
    if (!applicantProfileId) return;

    setRequestsLoading(true);

    try {
      // Query match_groups where user is requester and status is 'requested'
      // AND property_id is not null (property matches only)
      const { data: matchGroups, error } = await supabase
        .from('match_groups')
        .select('property_id, status')
        .eq('requested_by_id', applicantProfileId)
        .eq('status', 'requested')
        .not('property_id', 'is', null);

      if (error) throw error;

      // Create set of property IDs with pending requests
      const pendingSet = new Set(
        matchGroups?.map(group => group.property_id).filter(Boolean) || []
      );

      setPendingPropertyRequests(pendingSet);
      console.log(`✅ Loaded ${pendingSet.size} pending property requests`);
    } catch (err) {
      console.error('Error loading pending property requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  /**
   * ✅ NEW: Check if property has pending request
   */
  const hasPropertyRequest = (propertyId) => {
    return pendingPropertyRequests.has(propertyId);
  };

  // ✅ Handle "Use My Preferences" button
  const handleUseMyPreferences = () => {
    const success = applyUserPreferences();
    if (success) {
      alert('Search filters updated with your profile preferences!');
    } else {
      alert('No preferences found in your profile. Please complete your matching profile first.');
    }
  };

  // ✅ Enhanced contact landlord with profile lookup
  const handleContactLandlord = async (property) => {
    try {
      let landlordName = 'Property Owner';
      let contactEmail = property.contact_email;
      let contactPhone = property.phone;

      // Try to get landlord info for better contact experience
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

      const subject = `Inquiry about ${property.title}`;
      const body = `Hi ${landlordName},

I'm interested in your property listing "${property.title}" at ${property.address}, ${property.city}, ${property.state}.

Property Details:
- Monthly Rent: $${property.monthly_rent}
- Bedrooms: ${property.bedrooms || 'Studio'}
- Bathrooms: ${property.bathrooms}
${property.is_recovery_housing ? '- Recovery Housing: Yes' : ''}

Could you please provide more information about:
- Availability dates
- Application process
- Any specific requirements

I look forward to hearing from you.

Thank you!`;

      if (contactEmail) {
        const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
      } else if (contactPhone) {
        alert(`Please call the property owner at: ${contactPhone}`);
      } else {
        alert('Contact information not available for this property. Please try contacting through the property listing platform or check back later.');
      }
    } catch (err) {
      console.error('Error preparing contact info:', err);
      alert('Unable to contact landlord at this time. Please try again later.');
    }
  };

// ✅ FIXED: Send housing inquiry with correct landlord_id usage
const handleSendHousingInquiry = async (property) => {
  if (!property.landlord_id) {
    alert('Direct inquiries are not available for this property. Please use the contact owner option.');
    return;
  }

  if (!applicantProfileId) {
    alert('Please complete your applicant profile before sending property requests.');
    return;
  }

  // Check if request already exists
  if (hasPropertyRequest(property.id)) {
    alert('You have already sent a request for this property.');
    return;
  }

  try {
    // ✅ FIX: property.landlord_id is already the landlord_profile.id
    // No need to query - just use it directly!
    const landlordProfileId = property.landlord_id;

    // Create match_group entry
    const matchData = {
      property_id: property.id,
      roommate_ids: [applicantProfileId], // Just requester for now
      status: 'requested',
      requested_by_id: applicantProfileId,
      pending_member_id: landlordProfileId, // This is already the landlord_profile.id
      message: `Hi! I'm interested in your property "${property.title || property.address}". I'm looking for ${property.is_recovery_housing ? 'recovery-friendly ' : ''}housing and this property looks like it could be a great fit for my needs.

Property Details I'm interested in:
- Monthly Rent: $${property.monthly_rent}
- Bedrooms: ${property.bedrooms || 'Studio'}
- Location: ${property.city}, ${property.state}

I'd love to discuss availability and the application process. Thank you!`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('match_groups')
      .insert(matchData);

    if (insertError) throw insertError;

    alert('Property request sent! The landlord will be notified and can respond through their dashboard.');
    
    // ✅ Refresh pending requests to update UI
    await loadPendingPropertyRequests();
  } catch (err) {
    console.error('Error sending housing inquiry:', err);
    alert(`Failed to send request: ${err.message}. Please try again.`);
  }
};

  // ✅ NEW: Handle save property with proper feedback and error handling
  const handleSavePropertyWithFeedback = async (property) => {
    if (savingLoading) {
      return; // Prevent multiple clicks
    }

    const wasAlreadySaved = isPropertySaved(property.id);
    
    try {
      const success = await toggleSaveProperty(property);
      
      if (success) {
        if (wasAlreadySaved) {
          alert(`Property "${property.property_name || property.street_address}" removed from your favorites!`);
        } else {
          alert(`Property "${property.property_name || property.street_address}" saved to your favorites!`);
        }
      } else {
        alert('Unable to update favorites. Please try again.');
      }
    } catch (err) {
      console.error('Error handling save property:', err);
      alert('An error occurred while updating favorites. Please try again.');
    }
  };

  // ✅ NEW: Load applicant profile on mount
  useEffect(() => {
    loadApplicantProfileId();
  }, [profile?.id]);

  // ✅ NEW: Load pending requests when applicant profile ID is available
  useEffect(() => {
    if (applicantProfileId) {
      loadPendingPropertyRequests();
    }
  }, [applicantProfileId]);

  return (
    <div className="content">
      {/* ✅ Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.headerTitle}>Find Housing That Supports Your Journey</h1>
        <p className={styles.headerSubtitle}>
          Search for housing options tailored to your needs - from general rentals to specialized recovery housing with support services
        </p>
      </div>

      {/* ✅ Property Type Selection */}
      <div className={styles.typeSelectionSection}>
        <PropertyTypeSelection
          selectedType={searchType}
          onTypeChange={handleSearchTypeChange}
          loading={loading}
        />
      </div>

      {/* ✅ Shared Search Filters (always visible, collapsible sections) */}
      <div className={styles.filtersSection}>
        <PropertySharedFilters
          sharedFilters={sharedFilters}
          onSharedFilterChange={handleSharedFilterChange}
          onArrayFilterChange={handleArrayFilterChange}
          onUseMyPreferences={handleUseMyPreferences}
          onManualSearch={performSearch}
          onClearAllFilters={clearAllFilters}
          userPreferences={userPreferences}
          loading={loading}
          searchType={searchType}
        />
      </div>

      {/* ✅ Recovery-Specific Filters (conditional, collapsible sections) */}
      <div className={styles.filtersSection}>
        <PropertyRecoverySearchFilters
          recoveryFilters={recoveryFilters}
          onRecoveryFilterChange={handleRecoveryFilterChange}
          onArrayFilterChange={handleArrayFilterChange}
          searchType={searchType}
          loading={loading}
        />
      </div>

      {/* ✅ Advanced Filters (collapsible) */}
      <div className={styles.filtersSection}>
        <PropertyAdvancedFilters
          advancedFilters={advancedFilters}
          onAdvancedFilterChange={handleAdvancedFilterChange}
          onArrayFilterChange={handleArrayFilterChange}
          showAdvancedFilters={showAdvancedFilters}
          onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
          loading={loading}
        />
      </div>

      {/* ✅ UPDATED: Search Results with pending requests data */}
      <div data-results-section className={styles.resultsSection}>
        <PropertySearchResults
          loading={loading}
          properties={properties}
          totalResults={totalResults}
          currentPage={currentPage}
          totalPages={totalPages}
          showPagination={showPagination}
          searchType={searchType}
          savedProperties={savedProperties}
          pendingPropertyRequests={pendingPropertyRequests}
          onPageChange={handlePageChange}
          onContactLandlord={handleContactLandlord}
          onSaveProperty={handleSavePropertyWithFeedback}
          onSendHousingInquiry={handleSendHousingInquiry}
          onClearAllFilters={clearAllFilters}
          onSearchTypeChange={handleSearchTypeChange}
        />
      </div>

      {/* ✅ Search Context Help - Only show if no results yet */}
      {!loading && properties.length === 0 && totalResults === 0 && (
        <div className={styles.searchHelpSection}>
          <div className="card">
            <div className={styles.helpContent}>
              <h4 className={styles.helpTitle}>Search Tips</h4>
              <div className={styles.helpGrid}>
                <div className={styles.helpItem}>
                  <span className={styles.helpIcon}>🏠</span>
                  <div className={styles.helpText}>
                    <strong>All Housing Types:</strong> Shows both general rentals and recovery housing, with recovery-friendly options prioritized
                  </div>
                </div>
                
                <div className={styles.helpItem}>
                  <span className={styles.helpIcon}>🏢</span>
                  <div className={styles.helpText}>
                    <strong>General Rentals:</strong> Standard apartments, houses, and condos with traditional rental terms
                  </div>
                </div>
                
                <div className={styles.helpItem}>
                  <span className={styles.helpIcon}>🌱</span>
                  <div className={styles.helpText}>
                    <strong>Recovery Housing:</strong> Specialized sober living homes and recovery residences with support services
                  </div>
                </div>
                
                {userPreferences && (
                  <div className={styles.helpItem}>
                    <span className={styles.helpIcon}>⚙️</span>
                    <div className={styles.helpText}>
                      <strong>Quick Setup:</strong> Use the "Use My Preferences" button to automatically fill filters from your profile
                    </div>
                  </div>
                )}

                <div className={styles.helpItem}>
                  <span className={styles.helpIcon}>📍</span>
                  <div className={styles.helpText}>
                    <strong>Start Simple:</strong> Try searching by just city or state first, then add more specific filters as needed
                  </div>
                </div>
                
                <div className={styles.helpItem}>
                  <span className={styles.helpIcon}>🔍</span>
                  <div className={styles.helpText}>
                    <strong>Expand Sections:</strong> Click on any filter section header to expand and see more options
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySearch;