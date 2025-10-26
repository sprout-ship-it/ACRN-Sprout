// src/components/features/employer/components/EmployerResultsGrid.js - FAVORITES AS MAIN ACTION
import React from 'react';
import { 
  formatFeature, 
  formatBusinessType, 
  formatRemoteWork, 
  formatIndustry,
  formatFeatureList,
  hasActiveFilters
} from '../utils/employerUtils';

const EmployerResultsGrid = ({ 
  employers = [], 
  loading = false, 
  error = null,
  filters = {},
  favorites = new Set(),
  connections = new Set(),
  onConnect,
  onToggleFavorite,
  onViewDetails,
  onClearFilters,
  onFindNearby,
  getConnectionStatus
}) => {

  // Handle main action - now favorites instead of connect
  const handleCardMainAction = (employer) => {
    console.log('🎯 Card main action - toggling favorite for employer:', {
      employer_id: employer.id,
      employer_user_id: employer.user_id,
      company_name: employer.company_name,
      currently_favorited: favorites.has(employer.id)
    });
    onToggleFavorite(employer.id);
  };

  // Secondary action - view details (keep existing)
  const handleViewDetails = (employer) => {
    onViewDetails(employer);
  };

  // Loading state
  if (loading) {
    return (
      <div className="results-section">
        <div className="text-center py-5">
          <div className="spinner"></div>
          <p className="text-muted mt-3">Finding recovery-friendly employers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="results-section">
        <div className="alert alert-danger">
          <h4>⚠️ Unable to Load Employers</h4>
          <p>{error}</p>
          <button className="btn btn-outline mt-3" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No results state
  if (employers.length === 0) {
    const hasFilters = hasActiveFilters(filters);
    
    return (
      <div className="results-section">
        <div className="empty-state">
          <div className="empty-state-icon">💼</div>
          <h3 className="empty-state-title">
            {hasFilters ? 'No employers match your criteria' : 'No employers available'}
          </h3>
          <p className="empty-state-text">
            {hasFilters 
              ? 'Try adjusting your filters or expanding your search area.'
              : 'There are currently no recovery-friendly employers in our directory.'
            }
          </p>
          <div className="empty-state-actions">
            {hasFilters ? (
              <>
                <button className="btn btn-primary" onClick={onClearFilters}>
                  Clear All Filters
                </button>
                <button className="btn btn-outline ml-2" onClick={onFindNearby}>
                  Find Nearby Employers
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={onFindNearby}>
                Search by Location
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results display
  return (
    <div className="results-section">
      {/* Results Header */}
      <div className="results-header mb-4">
        <h3 className="results-title">
          💼 Found {employers.length} Recovery-Friendly Employer{employers.length !== 1 ? 's' : ''}
        </h3>
        {hasActiveFilters(filters) && (
          <p className="results-subtitle text-muted">
            Showing results matching your search criteria
          </p>
        )}
      </div>

      {/* Employer Cards Grid */}
      <div className="grid-auto">
        {employers.map((employer) => {
          const isFavorited = favorites.has(employer.id);
          const connectionStatus = getConnectionStatus(employer);
          const isConnected = connectionStatus?.type === 'connected';
          
          // Format features for display
          const { displayFeatures: recoveryFeatures, remainingCount: recoveryRemainingCount } = 
            formatFeatureList(employer.recovery_friendly_features || [], 3);
          
          const { displayFeatures: jobTypes, remainingCount: jobTypesRemainingCount } = 
            formatFeatureList(employer.job_types_available || [], 3);

          return (
            <div key={employer.id} className="card employer-card">
              {/* Card Header */}
              <div className="card-header">
                <div>
                  <h3 className="card-title">{employer.company_name}</h3>
                  <p className="card-subtitle">
                    {formatIndustry(employer.industry)} • {employer.city}, {employer.state}
                  </p>
                </div>
                
                {/* Header Badges */}
                <div className="card-badges">
                  {employer.is_actively_hiring ? (
                    <span className="badge badge-success">🟢 Hiring</span>
                  ) : (
                    <span className="badge badge-warning">⏸️ Not Hiring</span>
                  )}
                  
                  {isFavorited && (
                    <span className="badge badge-info ml-1">❤️ Favorited</span>
                  )}
                  
                  {isConnected && (
                    <span className="badge badge-success ml-1">✅ Connected</span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="card-body">
                {/* Company Details */}
                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="grid-2 gap-4">
                      <div>
                        <strong>Type:</strong> {formatBusinessType(employer.business_type)}
                      </div>
                      <div>
                        <strong>Size:</strong> {employer.company_size || 'Not specified'}
                      </div>
                    </div>
                  </div>
                  
                  {employer.remote_work_options && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Remote Work:</strong> {formatRemoteWork(employer.remote_work_options)}
                    </div>
                  )}
                </div>

                {/* Description */}
                {employer.description && (
                  <div className="mb-3">
                    <p className="text-gray-700 text-sm">
                      {employer.description.length > 150 
                        ? `${employer.description.substring(0, 150)}...` 
                        : employer.description
                      }
                    </p>
                  </div>
                )}

                {/* Job Types Available */}
                {jobTypes.length > 0 && (
                  <div className="mb-3">
                    <div className="label mb-2">💼 Job Types Available</div>
                    <div>
                      {jobTypes.map((jobType, index) => (
                        <span key={index} className="badge badge-success mr-1 mb-1">
                          {jobType}
                        </span>
                      ))}
                      {jobTypesRemainingCount > 0 && (
                        <span className="text-sm text-gray-600">
                          +{jobTypesRemainingCount} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Recovery-Friendly Features */}
                {recoveryFeatures.length > 0 && (
                  <div className="mb-3">
                    <div className="label mb-2">🤝 Recovery-Friendly Features</div>
                    <div>
                      {recoveryFeatures.map((feature, index) => (
                        <span key={index} className="badge badge-info mr-1 mb-1">
                          {feature}
                        </span>
                      ))}
                      {recoveryRemainingCount > 0 && (
                        <span className="text-sm text-gray-600">
                          +{recoveryRemainingCount} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Benefits Preview */}
                {employer.benefits_offered?.length > 0 && (
                  <div className="mb-3">
                    <div className="label mb-2">💰 Benefits</div>
                    <div>
                      {employer.benefits_offered.slice(0, 2).map((benefit, index) => (
                        <span key={index} className="badge badge-warning mr-1 mb-1">
                          {formatFeature(benefit)}
                        </span>
                      ))}
                      {employer.benefits_offered.length > 2 && (
                        <span className="text-sm text-gray-600">
                          +{employer.benefits_offered.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ CHANGED: Card Footer - Favorites as Main Action */}
              <div className="card-footer">
                <div className="card-actions">
                  {/* Secondary Action - View Details */}
                  <button
                    className="btn btn-outline"
                    onClick={() => handleViewDetails(employer)}
                  >
                    👁️ View Details
                  </button>
                  
                  {/* ✅ MAIN ACTION: Add/Remove from Favorites */}
                  <button
                    className={`btn ${isFavorited ? 'btn-warning' : 'btn-primary'}`}
                    onClick={() => handleCardMainAction(employer)}
                  >
                    {isFavorited ? (
                      <>💔 Remove Favorite</>
                    ) : (
                      <>❤️ Add to Favorites</>
                    )}
                  </button>
                </div>
                
                {/* ✅ ADDED: Helpful status text */}
                <div className="card-status-text mt-2">
                  <small className="text-muted">
                    {isFavorited 
                      ? "✅ Saved to your favorites list" 
                      : "Save this employer to easily find them later"
                    }
                  </small>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Results Footer */}
      <div className="results-footer mt-5 text-center">
        <p className="text-muted">
          Showing {employers.length} employer{employers.length !== 1 ? 's' : ''} • 
          <span className="ml-2">
            {favorites.size} favorited • {connections.size} connected
          </span>
        </p>
        
        {hasActiveFilters(filters) && (
          <button 
            className="btn btn-outline btn-sm mt-2" 
            onClick={onClearFilters}
          >
            Clear Filters to See More
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployerResultsGrid;