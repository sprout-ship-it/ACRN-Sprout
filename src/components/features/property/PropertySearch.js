// src/components/features/property/PropertySearch.js - UPDATED with Tabbed Filter Interface
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

// ✅ Import saved properties hook
import useSavedProperties from '../../../hooks/useSavedProperties';

// ✅ Import PropertyDetailsModal
import PropertyDetailsModal from '../connections/modals/PropertyDetailsModal';

// ✅ Import CSS foundation and component module
import '../../../styles/main.css';
import styles from './PropertySearch.module.css';

const PropertySearch = () => {
  const { user, profile } = useAuth();
  
  // ✅ NEW: Active tab state - always start on 'basic'
  const [activeTab, setActiveTab] = useState('basic');
  
  // ✅ Track applicant profile ID and pending property requests
  const [applicantProfileId, setApplicantProfileId] = useState(null);
  const [pendingPropertyRequests, setPendingPropertyRequests] = useState(new Set());
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Modal state for property details
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // ✅ Get saved properties functionality
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
   * ✅ Load applicant profile ID
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
   * ✅ Load pending property requests from housing_matches table
   */
  const loadPendingPropertyRequests = async () => {
    if (!applicantProfileId) return;

    setRequestsLoading(true);

    try {
      const { data: housingMatches, error } = await supabase
        .from('housing_matches')
        .select('property_id, status')
        .eq('applicant_id', applicantProfileId)
        .in('status', ['requested', 'approved']);

      if (error) throw error;

      const pendingSet = new Set(
        housingMatches?.map(match => match.property_id).filter(Boolean) || []
      );

      setPendingPropertyRequests(pendingSet);
      console.log(`✅ Loaded ${pendingSet.size} pending property requests from housing_matches`);
    } catch (err) {
      console.error('Error loading pending property requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  /**
   * ✅ Check if property has pending request
   */
  const hasPropertyRequest = (propertyId) => {
    return pendingPropertyRequests.has(propertyId);
  };

  /**
   * ✅ Get connection status for property modal
   */
  const getPropertyConnectionStatus = (property) => {
    if (hasPropertyRequest(property.id)) {
      return 'requested';
    }
    return null;
  };

  /**
   * ✅ Handle viewing property details in modal
   */
  const handleViewPropertyDetails = (property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  /**
   * ✅ Handle closing property details modal
   */
  const handleClosePropertyModal = () => {
    setSelectedProperty(null);
    setShowPropertyModal(false);
  };

  /**
   * ✅ Handle "Use My Preferences" button
   */
  const handleUseMyPreferences = () => {
    const success = applyUserPreferences();
    if (success) {
      alert('Search filters updated with your profile preferences!');
    } else {
      alert('No preferences found in your profile. Please complete your matching profile first.');
    }
  };

  /**
   * ✅ Enhanced contact landlord with profile lookup
   */
  const handleContactLandlord = async (property) => {
    try {
      let landlordName = 'Property Owner';
      let contactEmail = property.contact_email;
      let contactPhone = property.phone;

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

  /**
   * ✅ Handle sending housing inquiry
   */
  const handleSendHousingInquiry = async (property) => {
    if (!property.landlord_id) {
      alert('Direct inquiries are not available for this property. Please use the contact owner option.');
      return;
    }

    if (!applicantProfileId) {
      alert('Please complete your applicant profile before sending property requests.');
      return;
    }

    if (hasPropertyRequest(property.id)) {
      alert('You have already sent a request for this property.');
      return;
    }

    try {
      const matchData = {
        applicant_id: applicantProfileId,
        property_id: property.id,
        status: 'requested',
        applicant_message: `Hi! I'm interested in your property "${property.title || property.address}". I'm looking for ${property.is_recovery_housing ? 'recovery-friendly ' : ''}housing and this property looks like it could be a great fit for my needs.

Property Details I'm interested in:
- Monthly Rent: $${property.monthly_rent}
- Bedrooms: ${property.bedrooms || 'Studio'}
- Location: ${property.city}, ${property.state}

I'd love to discuss availability and the application process. Thank you!`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('housing_matches')
        .insert(matchData);

      if (insertError) throw insertError;

      alert('Property request sent! The landlord will be notified and can respond through their dashboard.');
      
      if (showPropertyModal && selectedProperty?.id === property.id) {
        handleClosePropertyModal();
      }
      
      await loadPendingPropertyRequests();
    } catch (err) {
      console.error('Error sending housing inquiry:', err);
      alert(`Failed to send request: ${err.message}. Please try again.`);
    }
  };

  /**
   * ✅ Handle save property with feedback
   */
  const handleSavePropertyWithFeedback = async (property) => {
    if (savingLoading) return;

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

  /**
   * ✅ NEW: Handle search with scroll to results
   */
  const handleSearchWithScroll = () => {
    performSearch();
    setHasSearched(true);
    
    // Scroll to results after brief delay
    setTimeout(() => {
      const resultsElement = document.querySelector('[data-results-section]');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  /**
   * ✅ NEW: Jump to results function
   */
  const handleJumpToResults = () => {
    const resultsElement = document.querySelector('[data-results-section]');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /**
   * ✅ NEW: Determine which tabs should be visible
   */
  const getVisibleTabs = () => {
    const tabs = ['basic', 'advanced'];
    
    // Only show recovery tab if not searching general rentals only
    if (searchType !== 'general_only') {
      tabs.splice(1, 0, 'recovery');
    }
    
    return tabs;
  };

  // ✅ Load applicant profile on mount
  useEffect(() => {
    loadApplicantProfileId();
  }, [profile?.id]);

  // ✅ Load pending requests when applicant profile ID is available
  useEffect(() => {
    if (applicantProfileId) {
      loadPendingPropertyRequests();
    }
  }, [applicantProfileId]);

  // ✅ Reset to basic tab when search type changes
  useEffect(() => {
    setActiveTab('basic');
  }, [searchType]);

  const visibleTabs = getVisibleTabs();

  return (
    <div className="content">
      {/* ✅ Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.headerTitle}>Find Housing That Supports Your Journey</h1>
        <p className={styles.headerSubtitle}>
          Search for housing options tailored to your needs - from general rentals to specialized recovery housing with support services
        </p>
      </div>

      {/* ✅ UPDATED: More Compact Property Type Selection */}
      <div className={styles.typeSelectionSection}>
        <PropertyTypeSelection
          selectedType={searchType}
          onTypeChange={handleSearchTypeChange}
          loading={loading}
        />
      </div>

      {/* ✅ NEW: Tabbed Filter Interface */}
      <div className={styles.filtersContainer}>
        {/* Tab Navigation */}
        <div className={styles.tabsHeader}>
          <div className={styles.tabsNav}>
            <button
              className={`${styles.tabButton} ${activeTab === 'basic' ? styles.active : ''}`}
              onClick={() => setActiveTab('basic')}
              disabled={loading}
            >
              <span className={styles.tabIcon}>📍</span>
              <span className={styles.tabLabel}>Basic</span>
            </button>
            
            {searchType !== 'general_only' && (
              <button
                className={`${styles.tabButton} ${activeTab === 'recovery' ? styles.active : ''}`}
                onClick={() => setActiveTab('recovery')}
                disabled={loading}
              >
                <span className={styles.tabIcon}>🌱</span>
                <span className={styles.tabLabel}>Recovery</span>
              </button>
            )}
            
            <button
              className={`${styles.tabButton} ${activeTab === 'advanced' ? styles.active : ''}`}
              onClick={() => setActiveTab('advanced')}
              disabled={loading}
            >
              <span className={styles.tabIcon}>⚙️</span>
              <span className={styles.tabLabel}>Advanced</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'basic' && (
            <PropertySharedFilters
              sharedFilters={sharedFilters}
              onSharedFilterChange={handleSharedFilterChange}
              onArrayFilterChange={handleArrayFilterChange}
              onUseMyPreferences={handleUseMyPreferences}
              onManualSearch={handleSearchWithScroll}
              onClearAllFilters={clearAllFilters}
              userPreferences={userPreferences}
              loading={loading}
              searchType={searchType}
            />
          )}

          {activeTab === 'recovery' && searchType !== 'general_only' && (
            <PropertyRecoverySearchFilters
              recoveryFilters={recoveryFilters}
              onRecoveryFilterChange={handleRecoveryFilterChange}
              onArrayFilterChange={handleArrayFilterChange}
              searchType={searchType}
              loading={loading}
            />
          )}

          {activeTab === 'advanced' && (
            <PropertyAdvancedFilters
              advancedFilters={advancedFilters}
              onAdvancedFilterChange={handleAdvancedFilterChange}
              onArrayFilterChange={handleArrayFilterChange}
              showAdvancedFilters={true}
              onToggleAdvancedFilters={() => {}}
              loading={loading}
            />
          )}
        </div>

        {/* ✅ NEW: Sticky Search Actions Bar */}
        <div className={styles.stickySearchBar}>
          <div className={styles.searchBarContent}>
            <div className={styles.searchBarInfo}>
              <span className={styles.searchBarIcon}>🔍</span>
              <span className={styles.searchBarText}>
                <strong>Searching:</strong> {
                  searchType === 'all_housing' ? 'All Housing Types' :
                  searchType === 'general_only' ? 'General Rentals Only' :
                  'Recovery Housing Only'
                }
              </span>
            </div>

            <div className={styles.searchBarActions}>
              {userPreferences && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleUseMyPreferences}
                  disabled={loading}
                >
                  <span className={styles.btnIcon}>⚙️</span>
                  Use My Preferences
                </button>
              )}

              <button
                className="btn btn-outline btn-sm"
                onClick={clearAllFilters}
                disabled={loading}
              >
                <span className={styles.btnIcon}>🗑️</span>
                Clear Filters
              </button>

              {hasSearched && properties.length > 0 && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleJumpToResults}
                >
                  <span className={styles.btnIcon}>⬇️</span>
                  Jump to Results
                </button>
              )}

              <button
                className="btn btn-primary"
                onClick={handleSearchWithScroll}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.loadingSpinner}></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <span className={styles.btnIcon}>🔍</span>
                    Search Properties
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Search Results */}
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
          onViewDetails={handleViewPropertyDetails}
          onClearAllFilters={clearAllFilters}
          onSearchTypeChange={handleSearchTypeChange}
        />
      </div>

      {/* ✅ Search Context Help */}
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
                    <strong>Use Tabs:</strong> Switch between Basic, Recovery, and Advanced tabs to access different filter options
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Property Details Modal */}
      {showPropertyModal && selectedProperty && (
        <PropertyDetailsModal
          isOpen={showPropertyModal}
          property={selectedProperty}
          connectionStatus={getPropertyConnectionStatus(selectedProperty)}
          onClose={handleClosePropertyModal}
          onContact={handleContactLandlord}
          showContactInfo={getPropertyConnectionStatus(selectedProperty) === 'approved'}
          showActions={!hasPropertyRequest(selectedProperty.id)}
          isLandlordView={false}
        />
      )}
    </div>
  );
};

export default PropertySearch;