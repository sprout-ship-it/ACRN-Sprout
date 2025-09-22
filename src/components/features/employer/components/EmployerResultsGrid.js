// src/components/features/employer/components/EmployerResultsGrid.js
import React from 'react';
import EmployerCard from './EmployerCard';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import { hasActiveFilters } from '../utils/employerUtils';
import styles from './EmployerResultsGrid.module.css';

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
      <div className={styles.resultsContainer}>
        <div className={styles.loadingState}>
          <LoadingSpinner size="large" />
          <div className={styles.loadingMessage}>
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
      <div className={styles.resultsContainer}>
        <div className={`card ${styles.errorState}`}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Unable to Load Employers</h3>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.errorActions}>
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
      <div className={styles.resultsContainer}>
        <div className={`card ${styles.emptyState}`}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3 className={styles.emptyTitle}>
            {hasFilters ? 'No Employers Found' : 'No Employers Available'}
          </h3>
          <p className={styles.emptyMessage}>
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
          
          <div className={styles.emptyActions}>
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
          <div className={styles.searchTips}>
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
    <div className={styles.resultsContainer}>
      {/* Results Header */}
      <div className={`card ${styles.resultsHeader}`}>
        <div className={styles.resultsSummary}>
          <div className={styles.summaryMain}>
            <h3 className={styles.resultsTitle}>
              {totalEmployers} Employer{totalEmployers !== 1 ? 's' : ''} Found
            </h3>
            <div className={styles.resultsStats}>
              {activelyHiring > 0 && (
                <span className={`${styles.statBadge} ${styles.hiring}`}>
                  🟢 {activelyHiring} actively hiring
                </span>
              )}
              {connectedCount > 0 && (
                <span className={`${styles.statBadge} ${styles.connected}`}>
                  ✅ {connectedCount} connected
                </span>
              )}
              {favoritedCount > 0 && (
                <span className={`${styles.statBadge} ${styles.favorited}`}>
                  ❤️ {favoritedCount} favorited
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.resultsActions}>
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
          <div className={styles.filterSummary}>
            <div className={styles.filterLabel}>Active Filters:</div>
            <div className={styles.filterIndicators}>
              {filters.industry && (
                <span className={styles.filterTag}>Industry: {filters.industry}</span>
              )}
              {filters.location && (
                <span className={styles.filterTag}>Location: {filters.location}</span>
              )}
              {filters.state && (
                <span className={styles.filterTag}>State: {filters.state}</span>
              )}
              {filters.businessType && (
                <span className={styles.filterTag}>Business Type</span>
              )}
              {filters.remoteWork && (
                <span className={styles.filterTag}>Remote Work</span>
              )}
              {filters.recoveryFeatures?.length > 0 && (
                <span className={styles.filterTag}>
                  {filters.recoveryFeatures.length} Recovery Features
                </span>
              )}
              {filters.jobTypes?.length > 0 && (
                <span className={styles.filterTag}>
                  {filters.jobTypes.length} Job Types
                </span>
              )}
              {filters.hasOpenings && (
                <span className={styles.filterTag}>Has Job Openings</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Employer Grid */}
      <div className={styles.employersGrid}>
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
      <div className={styles.resultsFooter}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            Showing {totalEmployers} recovery-friendly employer{totalEmployers !== 1 ? 's' : ''}
            {hasFilters && ' matching your criteria'}
          </p>
          
          {totalEmployers > 0 && (
            <div className={styles.footerTip}>
              💡 <strong>Tip:</strong> Save employers to favorites (❤️) to easily find them later, 
              or connect directly to start the employment process.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerResultsGrid;