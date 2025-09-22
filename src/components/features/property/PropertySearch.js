// src/components/features/property/PropertySearch.js - UPDATED WITH CSS MODULE
import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../utils/supabase';

// ✅ Import new modular components
import PropertySearchFilters from './search/PropertySearchFilters';
import PropertyRecoveryFilters from './search/PropertyRecoveryFilters';
import PropertyAdvancedFilters from './search/PropertyAdvancedFilters';
import PropertySearchResults from './search/PropertySearchResults';
import usePropertySearch from './search/hooks/usePropertySearch';

// ✅ UPDATED: Import our new CSS foundation and component module
import '../../../styles/main.css';
import styles from './PropertySearch.module.css';

const PropertySearch = () => {
  const { user } = useAuth();
  
  // ✅ Advanced filters toggle state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // ✅ Get all search state and handlers from custom hook
  const {
    // Search state
    loading,
    properties,
    totalResults,
    totalPages,
    currentPage,
    showPagination,
    searchMode,
    userPreferences,
    savedProperties,

    // Filter states
    basicFilters,
    recoveryFilters,
    advancedFilters,

    // Action handlers
    handleBasicFilterChange,
    handleRecoveryFilterChange,
    handleAdvancedFilterChange,
    handleArrayFilterChange,
    handleSearchModeChange,
    handlePageChange,
    handleSaveProperty,
    
    // Utility functions
    applyUserPreferences,
    clearAllFilters,
    performSearch
  } = usePropertySearch(user);

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

  // ✅ Send housing inquiry through match system
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
        message: `Hi! I'm interested in your property "${property.title}" at ${property.address}. I'm looking for ${property.is_recovery_housing ? 'recovery-friendly ' : ''}housing and this property looks like it could be a great fit for my needs.

Property Details I'm interested in:
- Monthly Rent: $${property.monthly_rent}
- Bedrooms: ${property.bedrooms || 'Studio'}
- Location: ${property.city}, ${property.state}

I'd love to discuss availability and the application process. Thank you!`,
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

  // ✅ Handle save property with user feedback
  const handleSavePropertyWithFeedback = (property) => {
    const success = handleSaveProperty(property);
    if (success) {
      alert(`Property "${property.title}" saved to your favorites! (Feature coming soon)`);
    }
  };

  return (
    <div className="content">
      {/* ✅ UPDATED: Header using CSS module */}
      <div className={styles.headerSection}>
        <h1 className={styles.headerTitle}>Find Recovery-Friendly Housing</h1>
        <p className={styles.headerSubtitle}>
          Search for housing options that support your recovery journey and meet your needs
        </p>
      </div>

      {/* ✅ UPDATED: Search Mode Toggle using CSS module */}
      <div className={styles.searchModeCard}>
        <h3 className={styles.searchModeTitle}>Search Type</h3>
        <div className={styles.searchModeNavigation}>
          <ul className={styles.searchModeNavList}>
            <li className={styles.searchModeNavItem}>
              <button
                className={`${styles.searchModeNavButton} ${searchMode === 'basic' ? styles.active : ''}`}
                onClick={() => handleSearchModeChange('basic')}
              >
                <span className={styles.navIcon}>🏠</span>
                <span>All Housing</span>
              </button>
            </li>
            <li className={styles.searchModeNavItem}>
              <button
                className={`${styles.searchModeNavButton} ${searchMode === 'recovery' ? styles.active : ''}`}
                onClick={() => handleSearchModeChange('recovery')}
              >
                <span className={styles.navIcon}>🏡</span>
                <span>Recovery Housing</span>
              </button>
            </li>
          </ul>
        </div>
        <p className={styles.searchModeDescription}>
          {searchMode === 'basic' 
            ? 'Search all available housing with recovery-friendly options prioritized'
            : 'Search specifically for recovery housing with specialized support services'
          }
        </p>
      </div>

      {/* ✅ UPDATED: Basic Search Filters using CSS module */}
      <div className={styles.filtersSection}>
        <PropertySearchFilters
          basicFilters={basicFilters}
          onBasicFilterChange={handleBasicFilterChange}
          onArrayFilterChange={handleArrayFilterChange}
          onUseMyPreferences={handleUseMyPreferences}
          onManualSearch={performSearch}
          onClearAllFilters={clearAllFilters}
          userPreferences={userPreferences}
          loading={loading}
        />
      </div>

      {/* ✅ UPDATED: Recovery-Specific Filters using CSS module */}
      <div className={styles.filtersSection}>
        <PropertyRecoveryFilters
          recoveryFilters={recoveryFilters}
          onRecoveryFilterChange={handleRecoveryFilterChange}
          onArrayFilterChange={handleArrayFilterChange}
          searchMode={searchMode}
          loading={loading}
        />
      </div>

      {/* ✅ UPDATED: Advanced Filters using CSS module */}
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

      {/* ✅ Search Results */}
      <PropertySearchResults
        loading={loading}
        properties={properties}
        totalResults={totalResults}
        currentPage={currentPage}
        totalPages={totalPages}
        showPagination={showPagination}
        searchMode={searchMode}
        savedProperties={savedProperties}
        onPageChange={handlePageChange}
        onContactLandlord={handleContactLandlord}
        onSaveProperty={handleSavePropertyWithFeedback}
        onSendHousingInquiry={handleSendHousingInquiry}
        onClearAllFilters={clearAllFilters}
        onSearchModeChange={handleSearchModeChange}
      />
    </div>
  );
};

export default PropertySearch;