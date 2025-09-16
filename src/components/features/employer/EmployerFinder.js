// src/components/features/employer/EmployerFinder.js - REFACTORED WITH MODULAR COMPONENTS
import React, { useState } from 'react';
import useEmployerSearch from './hooks/useEmployerSearch';
import EmployerFilterPanel from './components/EmployerFilterPanel';
import EmployerResultsGrid from './components/EmployerResultsGrid';
import EmployerModal from './components/EmployerModal';
import '../../../styles/global.css';

const EmployerFinder = ({ onBack }) => {
  console.log('💼 EmployerFinder rendering with modular architecture');

  // ✅ PHASE 4: Use comprehensive search hook for all employer functionality
  const {
    // Data
    employers,
    favorites,
    connections,
    filters,
    
    // Loading states
    loading,
    favoritesLoading,
    error,
    
    // Actions
    updateFilter,
    updateArrayFilter,
    clearFilters,
    findNearbyEmployers,
    toggleFavorite,
    connectWithEmployer,
    loadEmployers,
    
    // Helpers
    getConnectionStatus,
    
    // State setters for external error handling
    setError
  } = useEmployerSearch();

  // ✅ Local state for modal management (only thing not in hook)
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /**
   * Handle viewing employer details in modal
   */
  const handleViewDetails = (employer) => {
    console.log('👁️ Opening employer details modal for:', employer.company_name);
    setSelectedEmployer(employer);
    setShowModal(true);
  };

  /**
   * Handle closing employer details modal
   */
  const handleCloseModal = () => {
    console.log('❌ Closing employer details modal');
    setSelectedEmployer(null);
    setShowModal(false);
  };

  /**
   * Handle connecting with employer (with modal management)
   */
  const handleConnect = async (employer) => {
    console.log('🤝 Initiating connection with employer:', employer.company_name);
    
    const success = await connectWithEmployer(employer);
    
    if (success) {
      console.log('✅ Connection successful, managing modal state');
      // Close modal if open and it's the same employer
      if (showModal && selectedEmployer?.id === employer.id) {
        handleCloseModal();
      }
    }
    
    return success;
  };

  /**
   * Handle toggling favorite status (with modal state sync)
   */
  const handleToggleFavorite = async (employerId) => {
    console.log('❤️ Toggling favorite status for employer:', employerId);
    await toggleFavorite(employerId);
    
    // No need to close modal - favorites can be toggled while viewing details
  };

  /**
   * Handle clearing all filters with user confirmation
   */
  const handleClearFilters = () => {
    console.log('🗑️ Clearing all employer search filters');
    clearFilters();
  };

  /**
   * Handle finding nearby employers
   */
  const handleFindNearby = async () => {
    console.log('📍 Finding employers near user location');
    await findNearbyEmployers();
  };

  /**
   * Handle manual search trigger
   */
  const handleSearch = () => {
    console.log('🔍 Manually triggering employer search');
    loadEmployers();
  };

  /**
   * Handle error dismissal
   */
  const handleDismissError = () => {
    console.log('❌ Dismissing employer search error');
    setError(null);
  };

  // ✅ PHASE 4: Clean, component-based render
  return (
    <div className="content">
      {/* Header Section */}
      <div className="text-center mb-5">
        <h1 className="welcome-title">Find Recovery-Friendly Employers</h1>
        <p className="welcome-text">
          Connect with employers committed to supporting individuals in recovery with second-chance hiring, 
          flexible policies, and inclusive workplace cultures.
        </p>
      </div>

      {/* Search Filters Panel */}
      <EmployerFilterPanel
        filters={filters}
        loading={loading}
        onFilterChange={updateFilter}
        onArrayFilterChange={updateArrayFilter}
        onClearFilters={handleClearFilters}
        onFindNearby={handleFindNearby}
        onSearch={handleSearch}
      />

      {/* Results Grid with All States */}
      <EmployerResultsGrid
        employers={employers}
        loading={loading}
        error={error}
        filters={filters}
        favorites={favorites}
        connections={connections}
        onConnect={handleConnect}
        onToggleFavorite={handleToggleFavorite}
        onViewDetails={handleViewDetails}
        onClearFilters={handleClearFilters}
        onFindNearby={handleFindNearby}
        getConnectionStatus={getConnectionStatus}
      />

      {/* Navigation Back Button */}
      {onBack && (
        <div className="text-center mt-5">
          <button
            className="btn btn-outline"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
        </div>
      )}

      {/* Employer Details Modal */}
      {showModal && selectedEmployer && (
        <EmployerModal
          isOpen={showModal}
          employer={selectedEmployer}
          connectionStatus={getConnectionStatus(selectedEmployer)}
          isFavorited={favorites.has(selectedEmployer.user_id)}
          onClose={handleCloseModal}
          onConnect={handleConnect}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Global Error Handler (if needed outside of results grid) */}
      {error && !loading && (
        <div className="card mt-4">
          <div className="alert alert-error">
            <h4>Connection Error</h4>
            <p>{error}</p>
            <button 
              className="btn btn-outline mt-2"
              onClick={handleDismissError}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="card mt-4" style={{ fontSize: '0.8rem', color: '#666' }}>
          <h5>Debug Info</h5>
          <p>Employers: {employers.length} | Loading: {loading.toString()} | Error: {error || 'none'}</p>
          <p>Connections: {connections.size} | Favorites: {favorites.size}</p>
          <p>Active Filters: {Object.values(filters).filter(v => v && v.length > 0).length}</p>
        </div>
      )}
    </div>
  );
};

export default EmployerFinder;