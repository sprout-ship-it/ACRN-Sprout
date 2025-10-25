// src/components/features/property/search/PropertySearchResults.js - UPDATED WITH PENDING REQUESTS
import React from 'react';
import PropTypes from 'prop-types';
import PropertyCard from './PropertyCard';

// ✅ UPDATED: Import CSS module
import styles from './PropertySearchResults.module.css';

const PropertySearchResults = ({
  loading,
  properties,
  totalResults,
  currentPage,
  totalPages,
  showPagination,
  searchMode,
  savedProperties,
  pendingPropertyRequests, // ✅ NEW: Track pending requests
  onPageChange,
  onContactLandlord,
  onSaveProperty,
  onSendHousingInquiry,
  onViewDetails,
  onClearAllFilters,
  onSearchModeChange
}) => {
  // ✅ UPDATED: Loading State with CSS module
  if (loading) {
    return (
      <div className={styles.searchResults}>
        <div className={styles.resultsHeader}>
          <div className="card mb-4">
            <div className={`${styles.flex} ${styles.flexSpaceBetween} ${styles.flexAlignCenter}`}>
              <div>
                <h3 className="card-title">Searching...</h3>
                <p className="text-gray-600">Finding the perfect housing options for you...</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.loadingContainer}>
          <div className={`${styles.loadingSpinner} ${styles.large}`}></div>
          <p className={styles.loadingText}>
            {searchMode === 'recovery' 
              ? 'Searching recovery housing with specialized support services...'
              : 'Searching all available housing with recovery-friendly options...'
            }
          </p>
        </div>
      </div>
    );
  }

  // ✅ UPDATED: Empty State with CSS module
  if (properties.length === 0) {
    return (
      <div className={styles.searchResults}>
        <div className={styles.resultsHeader}>
          <div className="card mb-4">
            <div className={`${styles.flex} ${styles.flexSpaceBetween} ${styles.flexAlignCenter}`}>
              <div>
                <h3 className="card-title">0 Properties Found</h3>
                <p className="text-gray-600">
                  No properties match your current search criteria
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <h3 className="empty-state-title">No properties found</h3>
          <p>Try adjusting your search criteria or switching search modes to find more options.</p>
          
          <div className={styles.emptyStateSuggestions}>
            <h4 className={styles.suggestionsTitle}>Suggestions to find more results:</h4>
            <ul className={styles.suggestionsList}>
              <li>• Increase your maximum rent budget</li>
              <li>• Expand your location search area</li>
              <li>• Remove some specific amenity requirements</li>
              <li>• Consider different housing types</li>
              {searchMode === 'recovery' && (
                <li>• Try the "All Housing" search for more general options</li>
              )}
            </ul>
          </div>
          
          <div className={styles.emptyStateActions}>
            <button
              className="btn btn-primary"
              onClick={onClearAllFilters}
            >
              <span className={styles.btnIcon}>🗑️</span>
              Clear All Filters
            </button>
            
            <button
              className={`btn btn-outline ${styles.ml2}`}
              onClick={() => onSearchModeChange(searchMode === 'basic' ? 'recovery' : 'basic')}
            >
              <span className={styles.btnIcon}>🔄</span>
              Try {searchMode === 'basic' ? 'Recovery Housing' : 'All Housing'} Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ UPDATED: Results Display with CSS module
  return (
    <div className={styles.searchResults}>
      {/* ✅ UPDATED: Results Header */}
      <div className={styles.resultsHeader}>
        <div className="card mb-4">
          <div className={`${styles.flex} ${styles.flexSpaceBetween} ${styles.flexAlignCenter}`}>
            <div>
              <h3 className="card-title">
                {totalResults.toLocaleString()} Properties Found
              </h3>
              <p className="text-gray-600">
                {searchMode === 'recovery' 
                  ? 'Recovery housing properties with specialized support services'
                  : 'Recovery-friendly housing properties are prioritized in results'
                }
              </p>
            </div>
            
            {showPagination && (
              <div className={styles.paginationSummary}>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ UPDATED: Results Grid - Pass pendingPropertyRequests to PropertyCard */}
      <div className={styles.resultsGrid}>
        <div className="grid-auto">
{properties.map(property => (
  <PropertyCard
    key={property.id}
    property={property}
    savedProperties={savedProperties}
    pendingPropertyRequests={pendingPropertyRequests}
    onContactLandlord={onContactLandlord}
    onSaveProperty={onSaveProperty}
    onSendHousingInquiry={onSendHousingInquiry}
    onViewDetails={onViewDetails} // ✅ ADD THIS LINE
  />
))}
        </div>
      </div>

      {/* ✅ UPDATED: Pagination */}
      {showPagination && (
        <div className={styles.paginationContainer}>
          <div className={styles.pagination}>
            <button
              className={`btn btn-outline ${styles.paginationBtn}`}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className={styles.btnIcon}>‹</span>
              Previous
            </button>
            
            <div className={styles.paginationInfo}>
              <span className={styles.currentPage}>
                Page {currentPage} of {totalPages}
              </span>
              <span className={styles.resultsCount}>
                {totalResults.toLocaleString()} total results
              </span>
            </div>
            
            <button
              className={`btn btn-outline ${styles.paginationBtn}`}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <span className={styles.btnIcon}>›</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

PropertySearchResults.propTypes = {
  loading: PropTypes.bool.isRequired,
  properties: PropTypes.array.isRequired,
  totalResults: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  showPagination: PropTypes.bool.isRequired,
  searchMode: PropTypes.oneOf(['basic', 'recovery']).isRequired,
  savedProperties: PropTypes.instanceOf(Set).isRequired,
  pendingPropertyRequests: PropTypes.instanceOf(Set), // ✅ NEW: Pending requests prop
  onPageChange: PropTypes.func.isRequired,
  onContactLandlord: PropTypes.func.isRequired,
  onSaveProperty: PropTypes.func.isRequired,
  onSendHousingInquiry: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onClearAllFilters: PropTypes.func.isRequired,
  onSearchModeChange: PropTypes.func.isRequired
};

// ✅ NEW: Default props
PropertySearchResults.defaultProps = {
  pendingPropertyRequests: new Set()
};

export default PropertySearchResults;