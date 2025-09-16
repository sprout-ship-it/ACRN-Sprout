// src/components/features/employer/components/EmployerResultsGrid.js
import React from 'react';
import EmployerCard from './EmployerCard';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import { hasActiveFilters } from '../utils/employerUtils';

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
  // Calculate stats for display
  const totalEmployers = employers.length;
  const activelyHiring = employers.filter(e => e.is_actively_hiring).length;
  const connectedCount = connections.size;
  const favoritedCount = favorites.size;
  const hasFilters = hasActiveFilters(filters);

  // Loading State
  if (loading) {
    return (
      <div className="results-container">
        <div className="loading-state">
          <LoadingSpinner size="large" />
          <div className="loading-message">
            <h3>Finding Recovery-Friendly Employers</h3>
            <p>Searching for employers that match your criteria...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="results-container">
        <div className="error-state card">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Unable to Load Employers</h3>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No Results State
  if (totalEmployers === 0) {
    return (
      <div className="results-container">
        <div className="empty-state card">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">
            {hasFilters ? 'No Employers Found' : 'No Employers Available'}
          </h3>
          <p className="empty-message">
            {hasFilters ? (
              <>
                No employers match your current search criteria. 
                Try adjusting your filters or expanding your search area.
              </>
            ) : (
              <>
                There are currently no recovery-friendly employers in our network. 
                Check back soon as we're always adding new partners.
              </>
            )}
          </p>
          
          <div className="empty-actions">
            {hasFilters ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={onFindNearby}
                >
                  📍 Find Nearby Employers
                </button>
                <button
                  className="btn btn-outline"
                  onClick={onClearFilters}
                >
                  🗑️ Clear All Filters
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={onFindNearby}
              >
                📍 Search by Location
              </button>
            )}
          </div>

          {/* Helpful Tips */}
          <div className="search-tips">
            <h4>💡 Search Tips</h4>
            <ul>
              <li>Try searching by state instead of city for broader results</li>
              <li>Remove specific recovery feature requirements</li>
              <li>Include employers not currently marked as "actively hiring"</li>
              <li>Consider remote work opportunities</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Results State
  return (
    <div className="results-container">
      {/* Results Header */}
      <div className="results-header card">
        <div className="results-summary">
          <div className="summary-main">
            <h3 className="results-title">
              {totalEmployers} Employer{totalEmployers !== 1 ? 's' : ''} Found
            </h3>
            <div className="results-stats">
              {activelyHiring > 0 && (
                <span className="stat-badge hiring">
                  🟢 {activelyHiring} actively hiring
                </span>
              )}
              {connectedCount > 0 && (
                <span className="stat-badge connected">
                  ✅ {connectedCount} connected
                </span>
              )}
              {favoritedCount > 0 && (
                <span className="stat-badge favorited">
                  ❤️ {favoritedCount} favorited
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="results-actions">
            {hasFilters && (
              <button
                className="btn btn-outline btn-sm"
                onClick={onClearFilters}
                title="Clear all active filters"
              >
                🗑️ Clear Filters
              </button>
            )}
            <button
              className="btn btn-outline btn-sm"
              onClick={onFindNearby}
              title="Find employers near your location"
            >
              📍 Find Nearby
            </button>
          </div>
        </div>

        {/* Filter Summary Bar */}
        {hasFilters && (
          <div className="filter-summary">
            <div className="filter-label">Active Filters:</div>
            <div className="filter-indicators">
              {filters.industry && (
                <span className="filter-tag">Industry: {filters.industry}</span>
              )}
              {filters.location && (
                <span className="filter-tag">Location: {filters.location}</span>
              )}
              {filters.state && (
                <span className="filter-tag">State: {filters.state}</span>
              )}
              {filters.businessType && (
                <span className="filter-tag">Business Type</span>
              )}
              {filters.remoteWork && (
                <span className="filter-tag">Remote Work</span>
              )}
              {filters.recoveryFeatures?.length > 0 && (
                <span className="filter-tag">
                  {filters.recoveryFeatures.length} Recovery Features
                </span>
              )}
              {filters.jobTypes?.length > 0 && (
                <span className="filter-tag">
                  {filters.jobTypes.length} Job Types
                </span>
              )}
              {filters.hasOpenings && (
                <span className="filter-tag">Has Job Openings</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Employer Grid */}
      <div className="employers-grid">
        {employers.map((employer) => (
          <EmployerCard
            key={employer.id}
            employer={employer}
            connectionStatus={getConnectionStatus(employer)}
            isFavorited={favorites.has(employer.user_id)}
            onConnect={onConnect}
            onToggleFavorite={onToggleFavorite}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Results Footer */}
      <div className="results-footer">
        <div className="footer-content">
          <p className="footer-text">
            Showing {totalEmployers} recovery-friendly employer{totalEmployers !== 1 ? 's' : ''}
            {hasFilters && ' matching your criteria'}
          </p>
          
          {totalEmployers > 0 && (
            <div className="footer-tip">
              💡 <strong>Tip:</strong> Save employers to favorites (❤️) to easily find them later, 
              or connect directly to start the employment process.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .results-container {
          margin-bottom: var(--spacing-xl);
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          min-height: 400px;
        }

        .loading-message {
          text-align: center;
          margin-top: 2rem;
          max-width: 400px;
        }

        .loading-message h3 {
          color: var(--primary-purple);
          margin-bottom: 0.5rem;
        }

        .loading-message p {
          color: var(--gray-600);
          margin: 0;
        }

        /* Error State */
        .error-state {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-title {
          color: var(--coral);
          margin-bottom: 1rem;
        }

        .error-message {
          color: var(--gray-600);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .error-actions {
          display: flex;
          justify-content: center;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          opacity: 0.6;
        }

        .empty-title {
          color: var(--gray-800);
          margin-bottom: 1rem;
        }

        .empty-message {
          color: var(--gray-600);
          margin-bottom: 2rem;
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .empty-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .search-tips {
          text-align: left;
          background: var(--bg-light-cream);
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          border-left: 4px solid var(--gold);
          margin-top: 2rem;
        }

        .search-tips h4 {
          color: var(--gray-800);
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .search-tips ul {
          margin: 0;
          padding-left: 1.25rem;
          color: var(--gray-700);
        }

        .search-tips li {
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        /* Results Header */
        .results-header {
          margin-bottom: var(--spacing-lg);
          border-left: 4px solid var(--primary-purple);
        }

        .results-summary {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .summary-main {
          flex: 1;
        }

        .results-title {
          color: var(--primary-purple);
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
        }

        .results-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .stat-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid transparent;
        }

        .stat-badge.hiring {
          background: var(--success-bg);
          color: var(--success-text);
          border-color: var(--success-border);
        }

        .stat-badge.connected {
          background: var(--info-bg);
          color: var(--info-text);
          border-color: var(--info-border);
        }

        .stat-badge.favorited {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          border-color: rgba(220, 53, 69, 0.3);
        }

        .results-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        /* Filter Summary */
        .filter-summary {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-beige);
        }

        .filter-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 0.5rem;
        }

        .filter-indicators {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-tag {
          background: var(--info-bg);
          color: var(--info-text);
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid var(--info-border);
        }

        /* Employer Grid */
        .employers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        /* Results Footer */
        .results-footer {
          padding-top: var(--spacing-lg);
          border-top: 2px solid var(--border-beige);
        }

        .footer-content {
          text-align: center;
        }

        .footer-text {
          color: var(--gray-600);
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }

        .footer-tip {
          background: var(--bg-light-purple);
          padding: 1rem;
          border-radius: var(--radius-md);
          border-left: 4px solid var(--secondary-teal);
          color: var(--gray-700);
          font-size: 0.9rem;
          line-height: 1.5;
          text-align: left;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .results-summary {
            flex-direction: column;
            align-items: stretch;
          }

          .results-actions {
            justify-content: flex-start;
            margin-top: 1rem;
          }

          .employers-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }

          .empty-actions {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: auto;
            min-width: 200px;
          }

          .search-tips {
            text-align: center;
          }

          .search-tips ul {
            text-align: left;
            display: inline-block;
          }

          .filter-indicators {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .loading-state,
          .error-state,
          .empty-state {
            padding: 2rem 1rem;
          }

          .results-header {
            padding: 1rem;
          }

          .filter-summary {
            margin-top: 0.75rem;
            padding-top: 0.75rem;
          }

          .employers-grid {
            gap: var(--spacing-sm);
          }

          .results-stats {
            justify-content: center;
          }

          .results-actions {
            justify-content: center;
          }

          .btn-sm {
            padding: 8px 12px;
            font-size: 0.8rem;
          }
        }

        /* Ensure minimum grid item width on very small screens */
        @media (max-width: 400px) {
          .employers-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployerResultsGrid;