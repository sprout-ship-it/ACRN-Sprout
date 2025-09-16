// src/components/features/property/search/PropertySearchResults.js
import React from 'react';
import PropTypes from 'prop-types';
import PropertyCard from './PropertyCard';

const PropertySearchResults = ({
  loading,
  properties,
  totalResults,
  currentPage,
  totalPages,
  showPagination,
  searchMode,
  savedProperties,
  onPageChange,
  onContactLandlord,
  onSaveProperty,
  onSendHousingInquiry,
  onClearAllFilters,
  onSearchModeChange
}) => {
  // ✅ Loading State
  if (loading) {
    return (
      <div className="search-results">
        <div className="results-header">
          <div className="card mb-4">
            <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 className="card-title">Searching...</h3>
                <p className="text-gray-600">Finding the perfect housing options for you...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p className="loading-text">
            {searchMode === 'recovery' 
              ? 'Searching recovery housing with specialized support services...'
              : 'Searching all available housing with recovery-friendly options...'
            }
          </p>
        </div>
      </div>
    );
  }

  // ✅ Empty State
  if (properties.length === 0) {
    return (
      <div className="search-results">
        <div className="results-header">
          <div className="card mb-4">
            <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
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
          
          <div className="empty-state-suggestions">
            <h4 className="suggestions-title">Suggestions to find more results:</h4>
            <ul className="suggestions-list">
              <li>• Increase your maximum rent budget</li>
              <li>• Expand your location search area</li>
              <li>• Remove some specific amenity requirements</li>
              <li>• Consider different housing types</li>
              {searchMode === 'recovery' && (
                <li>• Try the "All Housing" search for more general options</li>
              )}
            </ul>
          </div>
          
          <div className="empty-state-actions">
            <button
              className="btn btn-primary"
              onClick={onClearAllFilters}
            >
              <span className="btn-icon">🗑️</span>
              Clear All Filters
            </button>
            
            <button
              className="btn btn-outline ml-2"
              onClick={() => onSearchModeChange(searchMode === 'basic' ? 'recovery' : 'basic')}
            >
              <span className="btn-icon">🔄</span>
              Try {searchMode === 'basic' ? 'Recovery Housing' : 'All Housing'} Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Results Display
  return (
    <div className="search-results">
      {/* Results Header */}
      <div className="results-header">
        <div className="card mb-4">
          <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
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
              <div className="pagination-summary">
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="results-grid">
        <div className="grid-auto">
          {properties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              savedProperties={savedProperties}
              onContactLandlord={onContactLandlord}
              onSaveProperty={onSaveProperty}
              onSendHousingInquiry={onSendHousingInquiry}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="pagination-container">
          <div className="pagination">
            <button
              className="btn btn-outline pagination-btn"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className="btn-icon">‹</span>
              Previous
            </button>
            
            <div className="pagination-info">
              <span className="current-page">
                Page {currentPage} of {totalPages}
              </span>
              <span className="results-count">
                {totalResults.toLocaleString()} total results
              </span>
            </div>
            
            <button
              className="btn btn-outline pagination-btn"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <span className="btn-icon">›</span>
            </button>
          </div>
        </div>
      )}

      {/* Component Styles */}
      <style jsx>{`
        .search-results {
          width: 100%;
        }

        .results-header {
          margin-bottom: var(--spacing-lg);
        }

        .pagination-summary {
          background: var(--bg-light-cream);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
        }

        .results-grid {
          margin-bottom: var(--spacing-xl);
        }

        .empty-state-suggestions {
          max-width: 500px;
          margin: var(--spacing-xl) auto;
          text-align: left;
        }

        .suggestions-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: var(--spacing-md);
          text-align: center;
        }

        .suggestions-list {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--spacing-xl) 0;
          color: var(--gray-600);
          line-height: 1.6;
        }

        .suggestions-list li {
          margin-bottom: var(--spacing-sm);
        }

        .empty-state-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
          flex-wrap: wrap;
        }

        .pagination-container {
          display: flex;
          justify-content: center;
          margin-top: var(--spacing-xl);
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--border-beige);
        }

        .pagination {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: var(--spacing-lg);
          max-width: 500px;
          width: 100%;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          white-space: nowrap;
        }

        .pagination-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .current-page {
          font-weight: 600;
          color: var(--gray-800);
          font-size: 0.95rem;
        }

        .results-count {
          font-size: 0.8rem;
          color: var(--gray-600);
          margin-top: 2px;
        }

        .btn-icon {
          font-size: 1rem;
        }

        .ml-2 {
          margin-left: var(--spacing-sm);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .pagination {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
            text-align: center;
          }

          .pagination-btn {
            justify-content: center;
          }

          .empty-state-actions {
            flex-direction: column;
            align-items: center;
          }

          .empty-state-actions .btn {
            width: 200px;
          }

          .results-header .flex {
            flex-direction: column;
            align-items: stretch !important;
            gap: var(--spacing-md);
          }

          .pagination-summary {
            align-self: center;
          }
        }

        @media (max-width: 480px) {
          .pagination-info {
            gap: var(--spacing-xs);
          }

          .current-page,
          .results-count {
            font-size: 0.8rem;
          }

          .pagination-btn {
            padding: 10px 16px;
            font-size: 0.85rem;
          }

          .suggestions-list {
            font-size: 0.9rem;
          }

          .empty-state-actions .btn {
            width: 100%;
            max-width: 250px;
          }
        }
      `}</style>
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
  onPageChange: PropTypes.func.isRequired,
  onContactLandlord: PropTypes.func.isRequired,
  onSaveProperty: PropTypes.func.isRequired,
  onSendHousingInquiry: PropTypes.func.isRequired,
  onClearAllFilters: PropTypes.func.isRequired,
  onSearchModeChange: PropTypes.func.isRequired
};

export default PropertySearchResults;